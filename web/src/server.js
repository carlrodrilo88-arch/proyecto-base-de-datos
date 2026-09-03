const crypto = require("crypto");
const path = require("path");
const express = require("express");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const port = Number(process.env.PORT || 3000);
const sessionSecret = process.env.SESSION_SECRET || "desarrollo";
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/meditec_reportes",
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function signToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", sessionSecret)
    .update(body)
    .digest("base64url");
  return `${body}.${signature}`;
}

function verifyToken(token) {
  if (!token || !token.includes(".")) return null;
  const [body, signature] = token.split(".");
  const expected = crypto
    .createHmac("sha256", sessionSecret)
    .update(body)
    .digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }
  return JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
}

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const session = verifyToken(token);
  if (!session) {
    return res.status(401).json({ error: "Sesion no valida" });
  }
  req.session = session;
  return next();
}

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

app.get("/api/health", asyncHandler(async (_req, res) => {
  const result = await pool.query("SELECT NOW() AS fecha_servidor");
  res.json({ ok: true, database: result.rows[0].fecha_servidor });
}));

app.post("/api/login", asyncHandler(async (req, res) => {
  const { correo, password } = req.body;
  if (!correo || !password) {
    return res.status(400).json({ error: "Correo y contrasena son obligatorios" });
  }

  const result = await pool.query(
    `SELECT u.id_usuario, u.nombre, u.correo, u.password_hash, r.nombre AS rol
     FROM usuarios u
     INNER JOIN roles r ON r.id_rol = u.id_rol
     WHERE u.correo = $1 AND u.activo = TRUE`,
    [correo]
  );

  const user = result.rows[0];
  if (!user || user.password_hash !== hashPassword(password)) {
    return res.status(401).json({ error: "Credenciales invalidas" });
  }

  const token = signToken({
    id_usuario: user.id_usuario,
    nombre: user.nombre,
    correo: user.correo,
    rol: user.rol,
  });
  res.json({ token, usuario: { nombre: user.nombre, correo: user.correo, rol: user.rol } });
}));

app.get("/api/servicios-solicitantes", requireAuth, asyncHandler(async (_req, res) => {
  const result = await pool.query(
    `SELECT id_servicio_solicitante, nombre, telefono, correo, direccion, activo
     FROM servicios_solicitantes
     ORDER BY id_servicio_solicitante DESC`
  );
  res.json(result.rows);
}));

app.post("/api/servicios-solicitantes", requireAuth, asyncHandler(async (req, res) => {
  const { nombre, telefono, correo, direccion, activo = true } = req.body;
  if (!nombre) return res.status(400).json({ error: "El nombre es obligatorio" });

  const result = await pool.query(
    `INSERT INTO servicios_solicitantes (nombre, telefono, correo, direccion, activo)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id_servicio_solicitante, nombre, telefono, correo, direccion, activo`,
    [nombre, telefono || null, correo || null, direccion || null, activo]
  );
  res.status(201).json(result.rows[0]);
}));

app.put("/api/servicios-solicitantes/:id", requireAuth, asyncHandler(async (req, res) => {
  const { nombre, telefono, correo, direccion, activo = true } = req.body;
  const result = await pool.query(
    `UPDATE servicios_solicitantes
     SET nombre = $1, telefono = $2, correo = $3, direccion = $4, activo = $5
     WHERE id_servicio_solicitante = $6
     RETURNING id_servicio_solicitante, nombre, telefono, correo, direccion, activo`,
    [nombre, telefono || null, correo || null, direccion || null, activo, req.params.id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: "Registro no encontrado" });
  res.json(result.rows[0]);
}));

app.delete("/api/servicios-solicitantes/:id", requireAuth, asyncHandler(async (req, res) => {
  await pool.query(
    "UPDATE servicios_solicitantes SET activo = FALSE WHERE id_servicio_solicitante = $1",
    [req.params.id]
  );
  res.status(204).send();
}));

app.get("/api/tecnicos", requireAuth, asyncHandler(async (_req, res) => {
  const result = await pool.query(
    `SELECT id_tecnico, nombre, telefono, correo, especialidad, activo
     FROM tecnicos
     ORDER BY id_tecnico DESC`
  );
  res.json(result.rows);
}));

app.post("/api/tecnicos", requireAuth, asyncHandler(async (req, res) => {
  const { nombre, telefono, correo, especialidad, activo = true } = req.body;
  if (!nombre) return res.status(400).json({ error: "El nombre es obligatorio" });

  const result = await pool.query(
    `INSERT INTO tecnicos (nombre, telefono, correo, especialidad, activo)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id_tecnico, nombre, telefono, correo, especialidad, activo`,
    [nombre, telefono || null, correo || null, especialidad || null, activo]
  );
  res.status(201).json(result.rows[0]);
}));

app.put("/api/tecnicos/:id", requireAuth, asyncHandler(async (req, res) => {
  const { nombre, telefono, correo, especialidad, activo = true } = req.body;
  const result = await pool.query(
    `UPDATE tecnicos
     SET nombre = $1, telefono = $2, correo = $3, especialidad = $4, activo = $5
     WHERE id_tecnico = $6
     RETURNING id_tecnico, nombre, telefono, correo, especialidad, activo`,
    [nombre, telefono || null, correo || null, especialidad || null, activo, req.params.id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: "Registro no encontrado" });
  res.json(result.rows[0]);
}));

app.delete("/api/tecnicos/:id", requireAuth, asyncHandler(async (req, res) => {
  await pool.query("UPDATE tecnicos SET activo = FALSE WHERE id_tecnico = $1", [req.params.id]);
  res.status(204).send();
}));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno de la aplicacion" });
});

app.listen(port, () => {
  console.log(`Meditec web escuchando en http://localhost:${port}`);
});
