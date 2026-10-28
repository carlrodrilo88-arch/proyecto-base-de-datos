const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const express = require("express");
const { rateLimit } = require("express-rate-limit");
const helmet = require("helmet");
const { Pool } = require("pg");
const { generateReportPdf } = require("./pdf-report");
const { resolveReportTemplate } = require("./report-templates");
const { deletePdf, getPdf, putPdf } = require("./storage");
const { validateCompanyIds, validateEquipmentIds, validateTechnicianIds } = require("./report-batch");
const { validatePassword, normalizeUsername } = require("./user-security");
const {
  clearSessionCookie,
  createSessionCookie,
  readSessionCookie,
  resolveSessionSecret,
  signToken,
  verifyToken,
} = require("./security");
require("dotenv").config();

const app = express();
const port = Number(process.env.PORT || 3000);
const sessionSecret = resolveSessionSecret();
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL es obligatoria");
}
const allowedEditors = ["administrador", "generador_reportes"];
const dummyPasswordHash = "$2b$12$lDVGawQEi9GKWL0coD7F5OitpC/rgCQZoo4pAz9P4PN9z9JgAljia";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);
app.use(helmet());
app.use(express.json({ limit: "32kb" }));
app.use(express.static(path.join(__dirname, "..", "public")));

function requireAuth(req, res, next) {
  const token = readSessionCookie(req.headers.cookie);
  const session = verifyToken(token, sessionSecret);
  if (!session) {
    return res.status(401).json({ error: "Sesion no valida" });
  }
  req.session = session;
  if (session.debe_cambiar_password && !["/api/cambiar-password", "/api/session"].includes(req.path)) {
    return res.status(403).json({ error: "Debe cambiar su contrasena antes de continuar", debe_cambiar_password: true });
  }
  return next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.session.rol)) {
      return res.status(403).json({ error: "No tiene permiso para realizar esta accion" });
    }
    return next();
  };
}

function parseId(value) {
  if (!/^\d+$/.test(String(value))) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function invalidInput(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function normalizeText(value, field, maxLength, required = false) {
  if (value === undefined || value === null || value === "") {
    if (required) throw invalidInput(`${field} es obligatorio`);
    return null;
  }
  if (typeof value !== "string") throw invalidInput(`${field} debe ser texto`);
  const normalized = value.trim();
  if (required && !normalized) throw invalidInput(`${field} es obligatorio`);
  if (normalized.length > maxLength) {
    throw invalidInput(`${field} excede el maximo de ${maxLength} caracteres`);
  }
  return normalized || null;
}

function normalizeEmail(value) {
  const email = normalizeText(value, "correo", 160);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw invalidInput("El correo no tiene un formato valido");
  }
  return email;
}

function normalizeActive(value) {
  if (value === undefined) return true;
  if (typeof value !== "boolean") throw invalidInput("activo debe ser booleano");
  return value;
}

function validationHandler(handler) {
  return (req, res, next) => {
    try {
      return handler(req, res, next);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };
}

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

// Empresas cuyos datos puede ver el usuario; null para el administrador (sin filtro).
// Se consulta en cada peticion para que un cambio de empresas aplique sin volver a iniciar sesion.
async function companyScope(req) {
  if (req.session.rol === "administrador") return null;
  const result = await pool.query(
    "SELECT id_proveedor FROM usuario_proveedor WHERE id_usuario=$1", [req.session.id_usuario]
  );
  return result.rows.map((row) => Number(row.id_proveedor));
}

// Condicion SQL: la institucion de la columna dada es atendida por alguna empresa del alcance.
function institutionInScope(column, param) {
  return `(${param}::bigint[] IS NULL OR EXISTS (
    SELECT 1 FROM proveedor_institucion pi
    WHERE pi.id_institucion=${column} AND pi.id_proveedor = ANY(${param}::bigint[])))`;
}

async function assertInstitutionInScope(scope, institucionId) {
  const result = await pool.query(
    `SELECT 1 FROM instituciones i WHERE i.id_institucion=$1 AND ${institutionInScope("i.id_institucion", "$2")}`,
    [institucionId, scope]
  );
  if (!result.rows[0]) throw invalidInput("La institucion no pertenece a sus empresas");
}

// Reemplaza los enlaces con empresas de un usuario o institucion; false si alguna no existe o esta inactiva.
const companyLinks = {
  usuario: { table: "usuario_proveedor", column: "id_usuario" },
  institucion: { table: "proveedor_institucion", column: "id_institucion" },
};

async function replaceCompanyLinks(client, owner, ownerId, companyIds) {
  const { table, column } = companyLinks[owner];
  await client.query(`DELETE FROM ${table} WHERE ${column}=$1`, [ownerId]);
  if (!companyIds.length) return true;
  const result = await client.query(
    `INSERT INTO ${table} (${column}, id_proveedor)
     SELECT $1, id_proveedor FROM proveedores WHERE id_proveedor = ANY($2::bigint[]) AND activo=TRUE`,
    [ownerId, companyIds]
  );
  return result.rowCount === companyIds.length;
}

async function withTransaction(work) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

app.get("/api/health", asyncHandler(async (_req, res) => {
  const result = await pool.query("SELECT NOW() AS fecha_servidor");
  res.json({ ok: true, database: result.rows[0].fecha_servidor });
}));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Intente nuevamente mas tarde" },
});

app.post("/api/login", loginLimiter, asyncHandler(async (req, res) => {
  // Se acepta el nombre de usuario o el correo; "correo" se conserva por compatibilidad.
  const rawIdentifier = req.body.usuario ?? req.body.correo;
  const identificador = typeof rawIdentifier === "string" ? rawIdentifier.trim().toLowerCase() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";
  if (!identificador || !password || identificador.length > 160 || password.length > 128) {
    return res.status(400).json({ error: "Usuario y contrasena son obligatorios" });
  }

  const result = await pool.query(
    `SELECT u.id_usuario, u.nombre, u.usuario, u.correo, u.password_hash,
            u.debe_cambiar_password, r.nombre AS rol
     FROM usuarios u
     INNER JOIN roles r ON r.id_rol = u.id_rol
     WHERE (u.usuario = $1 OR u.correo = $1) AND u.activo = TRUE`,
    [identificador]
  );

  const user = result.rows[0];
  const passwordValid = await bcrypt.compare(password, user?.password_hash || dummyPasswordHash);
  if (!user || !passwordValid) {
    return res.status(401).json({ error: "Credenciales invalidas" });
  }

  const token = signToken({
    id_usuario: user.id_usuario,
    nombre: user.nombre,
    usuario: user.usuario,
    correo: user.correo,
    rol: user.rol,
    debe_cambiar_password: user.debe_cambiar_password,
  }, sessionSecret);
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Set-Cookie", createSessionCookie(token, process.env.NODE_ENV === "production"));
  res.json({ usuario: { nombre: user.nombre, usuario: user.usuario, correo: user.correo, rol: user.rol,
    debe_cambiar_password: user.debe_cambiar_password } });
}));

app.get("/api/session", requireAuth, (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json({
    usuario: {
      nombre: req.session.nombre,
      usuario: req.session.usuario,
      correo: req.session.correo,
      rol: req.session.rol,
      debe_cambiar_password: req.session.debe_cambiar_password,
    },
  });
});

app.post("/api/cambiar-password", requireAuth, asyncHandler(async (req, res) => {
  const actual = typeof req.body.password_actual === "string" ? req.body.password_actual : "";
  const nueva = validatePassword(req.body.password_nueva, "password_nueva");
  if (actual === nueva) throw invalidInput("La nueva contrasena debe ser diferente");
  const result = await pool.query(
    "SELECT password_hash FROM usuarios WHERE id_usuario=$1 AND activo=TRUE",
    [req.session.id_usuario]
  );
  if (!result.rows[0] || !(await bcrypt.compare(actual, result.rows[0].password_hash))) {
    return res.status(401).json({ error: "La contrasena actual no es correcta" });
  }
  const hash = await bcrypt.hash(nueva, 12);
  await pool.query(
    "UPDATE usuarios SET password_hash=$1, debe_cambiar_password=FALSE WHERE id_usuario=$2",
    [hash, req.session.id_usuario]
  );
  const session = { ...req.session, debe_cambiar_password: false };
  delete session.iat;
  delete session.exp;
  const token = signToken(session, sessionSecret);
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Set-Cookie", createSessionCookie(token, process.env.NODE_ENV === "production"));
  res.json({ ok: true, usuario: session });
}));

app.post("/api/logout", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Set-Cookie", clearSessionCookie(process.env.NODE_ENV === "production"));
  res.status(204).send();
});

app.get("/api/roles", requireAuth, requireRole("administrador"), asyncHandler(async (_req, res) => {
  const result = await pool.query(
    "SELECT id_rol, nombre, descripcion FROM roles WHERE activo=TRUE ORDER BY id_rol"
  );
  res.json(result.rows);
}));

// Registro de constancia: estas computadoras no habilitan permisos y siempre se guardan inactivas.
app.get("/api/equipos-autorizados", requireAuth, requireRole("administrador"), asyncHandler(async (_req, res) => {
  const result = await pool.query(
    `SELECT id_equipo_autorizado, nombre, identificador_equipo, descripcion, activo, creado_en
     FROM equipos_autorizados ORDER BY id_equipo_autorizado DESC`
  );
  res.json(result.rows);
}));

app.post("/api/equipos-autorizados", requireAuth, requireRole("administrador"), asyncHandler(async (req, res) => {
  const nombre = normalizeText(req.body.nombre, "nombre", 100, true);
  const identificador = normalizeText(req.body.identificador_equipo, "identificador_equipo", 160, true);
  const descripcion = normalizeText(req.body.descripcion, "descripcion", 1000);
  const result = await pool.query(
    `INSERT INTO equipos_autorizados (nombre, identificador_equipo, descripcion, activo)
     VALUES ($1, $2, $3, FALSE)
     RETURNING id_equipo_autorizado, nombre, identificador_equipo, descripcion, activo, creado_en`,
    [nombre, identificador, descripcion]
  );
  res.status(201).json(result.rows[0]);
}));

app.put("/api/equipos-autorizados/:id", requireAuth, requireRole("administrador"), asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) throw invalidInput("Computadora invalida");
  const nombre = normalizeText(req.body.nombre, "nombre", 100, true);
  const identificador = normalizeText(req.body.identificador_equipo, "identificador_equipo", 160, true);
  const descripcion = normalizeText(req.body.descripcion, "descripcion", 1000);
  const result = await pool.query(
    `UPDATE equipos_autorizados SET nombre=$1, identificador_equipo=$2, descripcion=$3, activo=FALSE
     WHERE id_equipo_autorizado=$4
     RETURNING id_equipo_autorizado, nombre, identificador_equipo, descripcion, activo, creado_en`,
    [nombre, identificador, descripcion, id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: "Computadora no encontrada" });
  res.json(result.rows[0]);
}));

// La constancia no tiene historial propio: los reportes que la citaban quedan con NULL (ON DELETE SET NULL).
app.delete("/api/equipos-autorizados/:id", requireAuth, requireRole("administrador"), asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) throw invalidInput("Computadora invalida");
  const result = await pool.query("DELETE FROM equipos_autorizados WHERE id_equipo_autorizado=$1", [id]);
  if (!result.rowCount) return res.status(404).json({ error: "Computadora no encontrada" });
  res.status(204).send();
}));

// Bitacora generada por los triggers; solo lectura y limitada a los eventos mas recientes.
app.get("/api/auditoria", requireAuth, requireRole("administrador"), asyncHandler(async (_req, res) => {
  const result = await pool.query(
    `SELECT a.id_evento, a.fecha_evento, u.nombre AS usuario, a.entidad, a.entidad_id, a.accion, a.detalle
     FROM auditoria_eventos a LEFT JOIN usuarios u ON u.id_usuario=a.id_usuario
     ORDER BY a.fecha_evento DESC, a.id_evento DESC LIMIT 500`
  );
  res.json(result.rows);
}));

app.get("/api/usuarios", requireAuth, requireRole("administrador"), asyncHandler(async (_req, res) => {
  const result = await pool.query(
    `SELECT u.id_usuario, u.id_rol, u.nombre, u.usuario, u.correo, r.nombre AS rol,
            u.debe_cambiar_password, u.activo, u.creado_en,
            ARRAY(SELECT up.id_proveedor::text FROM usuario_proveedor up
                  WHERE up.id_usuario=u.id_usuario) AS id_proveedores,
            (SELECT STRING_AGG(p.nombre, ', ' ORDER BY p.nombre) FROM usuario_proveedor up
             JOIN proveedores p ON p.id_proveedor=up.id_proveedor
             WHERE up.id_usuario=u.id_usuario) AS empresas
     FROM usuarios u JOIN roles r ON r.id_rol=u.id_rol
     ORDER BY u.id_usuario DESC`
  );
  res.json(result.rows);
}));

// El administrador ve todo; cualquier otro rol necesita al menos una empresa para trabajar.
function readUserCompanies(body, roleName) {
  return validateCompanyIds(body.id_proveedores, roleName !== "administrador");
}

app.post("/api/usuarios", requireAuth, requireRole("administrador"), asyncHandler(async (req, res) => {
  const nombre = normalizeText(req.body.nombre, "nombre", 120, true);
  const usuario = normalizeUsername(req.body.usuario);
  const correo = normalizeEmail(req.body.correo);
  const rolId = parseId(req.body.id_rol);
  if (!rolId) throw invalidInput("El rol es obligatorio");
  const role = await pool.query("SELECT nombre FROM roles WHERE id_rol=$1 AND activo=TRUE", [rolId]);
  if (!role.rows[0]) throw invalidInput("El rol seleccionado no existe");
  const empresaIds = readUserCompanies(req.body, role.rows[0].nombre);
  const password = validatePassword(req.body.password_temporal, "password_temporal");
  const hash = await bcrypt.hash(password, 12);
  const created = await withTransaction(async (client) => {
    const result = await client.query(
      `INSERT INTO usuarios (id_rol,nombre,usuario,correo,password_hash,debe_cambiar_password,activo)
       VALUES ($5,$1,$2,$3,$4,TRUE,TRUE)
       RETURNING id_usuario,nombre,usuario,correo,debe_cambiar_password,activo`,
      [nombre, usuario, correo?.toLowerCase() ?? null, hash, rolId]
    );
    if (!(await replaceCompanyLinks(client, "usuario", result.rows[0].id_usuario, empresaIds))) {
      throw invalidInput("Todas las empresas deben existir y estar activas");
    }
    return result.rows[0];
  });
  res.status(201).json(created);
}));

app.put("/api/usuarios/:id", requireAuth, requireRole("administrador"), asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const rolId = parseId(req.body.id_rol);
  if (!id || !rolId) throw invalidInput("Usuario o rol invalido");
  const nombre = normalizeText(req.body.nombre, "nombre", 120, true);
  const usuario = normalizeUsername(req.body.usuario);
  const correo = normalizeEmail(req.body.correo);
  const activo = normalizeActive(req.body.activo);
  if (id === req.session.id_usuario && !activo) throw invalidInput("No puede desactivar su propio usuario");
  const role = await pool.query("SELECT nombre FROM roles WHERE id_rol=$1 AND activo=TRUE", [rolId]);
  if (!role.rows[0]) throw invalidInput("El rol seleccionado no existe");
  if (id === req.session.id_usuario && role.rows[0].nombre !== req.session.rol) {
    throw invalidInput("No puede cambiar su propio rol");
  }
  const temporaryPassword = req.body.password_temporal
    ? validatePassword(req.body.password_temporal, "password_temporal")
    : null;
  if (id === req.session.id_usuario && temporaryPassword) {
    throw invalidInput("Use la opcion Cambiar mi contrasena");
  }
  const empresaIds = readUserCompanies(req.body, role.rows[0].nombre);
  const temporaryHash = temporaryPassword ? await bcrypt.hash(temporaryPassword, 12) : null;
  const updated = await withTransaction(async (client) => {
    const result = await client.query(
      `UPDATE usuarios u SET nombre=$1,correo=$2,id_rol=$3,activo=$4,
         password_hash=COALESCE($6,password_hash),
         debe_cambiar_password=CASE WHEN $6::text IS NULL THEN debe_cambiar_password ELSE TRUE END,
         usuario=$7
       FROM roles r WHERE u.id_usuario=$5 AND r.id_rol=$3 AND r.activo=TRUE
       RETURNING u.id_usuario,u.nombre,u.usuario,u.correo,u.debe_cambiar_password,u.activo`,
      [nombre, correo?.toLowerCase() ?? null, rolId, activo, id, temporaryHash, usuario]
    );
    if (result.rows[0] && !(await replaceCompanyLinks(client, "usuario", id, empresaIds))) {
      throw invalidInput("Todas las empresas deben existir y estar activas");
    }
    return result.rows[0];
  });
  if (!updated) return res.status(404).json({ error: "Usuario no encontrado" });
  res.json(updated);
}));

app.post("/api/usuarios/:id/restablecer-password", requireAuth, requireRole("administrador"), asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) throw invalidInput("Usuario invalido");
  if (id === req.session.id_usuario) throw invalidInput("Use la opcion Cambiar mi contrasena");
  const password = validatePassword(req.body.password_temporal, "password_temporal");
  const hash = await bcrypt.hash(password, 12);
  const result = await pool.query(
    `UPDATE usuarios SET password_hash=$1,debe_cambiar_password=TRUE
     WHERE id_usuario=$2 RETURNING id_usuario`, [hash, id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: "Usuario no encontrado" });
  res.json({ ok: true });
}));

app.delete("/api/usuarios/:id", requireAuth, requireRole("administrador"), asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) throw invalidInput("Usuario invalido");
  if (id === req.session.id_usuario) throw invalidInput("No puede desactivar su propio usuario");
  await pool.query("UPDATE usuarios SET activo=FALSE WHERE id_usuario=$1", [id]);
  res.status(204).send();
}));

app.get("/api/servicios-solicitantes", requireAuth, asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT ss.id_servicio_solicitante, ss.nombre, ss.id_institucion,
            i.nombre AS institucion, ss.activo
     FROM servicios_solicitantes ss
     JOIN instituciones i ON i.id_institucion=ss.id_institucion
     WHERE ${institutionInScope("i.id_institucion", "$1")}
     ORDER BY ss.id_servicio_solicitante DESC`,
    [await companyScope(req)]
  );
  res.json(result.rows);
}));

// El generador registra servicios en las instituciones de sus empresas; solo el administrador los edita.
app.post("/api/servicios-solicitantes", requireAuth, requireRole(...allowedEditors), validationHandler(asyncHandler(async (req, res) => {
  const nombre = normalizeText(req.body.nombre, "nombre", 160, true);
  const institucionId = parseId(req.body.id_institucion);
  if (!institucionId) throw invalidInput("La institucion es obligatoria");
  const activo = normalizeActive(req.body.activo);
  await assertInstitutionInScope(await companyScope(req), institucionId);

  const result = await pool.query(
    `INSERT INTO servicios_solicitantes (nombre, id_institucion, activo)
     VALUES ($1, $2, $3)
     RETURNING id_servicio_solicitante, nombre, id_institucion, activo`,
    [nombre, institucionId, activo]
  );
  res.status(201).json(result.rows[0]);
})));

app.put("/api/servicios-solicitantes/:id", requireAuth, requireRole("administrador"), validationHandler(asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) throw invalidInput("Identificador invalido");
  const nombre = normalizeText(req.body.nombre, "nombre", 160, true);
  const institucionId = parseId(req.body.id_institucion);
  if (!institucionId) throw invalidInput("La institucion es obligatoria");
  const activo = normalizeActive(req.body.activo);
  const result = await pool.query(
    `UPDATE servicios_solicitantes
     SET nombre = $1, id_institucion = $2, activo = $3
     WHERE id_servicio_solicitante = $4
     RETURNING id_servicio_solicitante, nombre, id_institucion, activo`,
    [nombre, institucionId, activo, id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: "Registro no encontrado" });
  res.json(result.rows[0]);
})));

app.delete("/api/servicios-solicitantes/:id", requireAuth, requireRole("administrador"), asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "Identificador invalido" });
  await pool.query(
    "UPDATE servicios_solicitantes SET activo = FALSE WHERE id_servicio_solicitante = $1",
    [id]
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

// Tecnicos y empresas solo los administra el administrador.
app.post("/api/tecnicos", requireAuth, requireRole("administrador"), validationHandler(asyncHandler(async (req, res) => {
  const nombre = normalizeText(req.body.nombre, "nombre", 120, true);
  const telefono = normalizeText(req.body.telefono, "telefono", 40);
  const correo = normalizeEmail(req.body.correo);
  const especialidad = normalizeText(req.body.especialidad, "especialidad", 120);
  const activo = normalizeActive(req.body.activo);

  const result = await pool.query(
    `INSERT INTO tecnicos (nombre, telefono, correo, especialidad, activo)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id_tecnico, nombre, telefono, correo, especialidad, activo`,
    [nombre, telefono, correo, especialidad, activo]
  );
  res.status(201).json(result.rows[0]);
})));

app.put("/api/tecnicos/:id", requireAuth, requireRole("administrador"), validationHandler(asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) throw invalidInput("Identificador invalido");
  const nombre = normalizeText(req.body.nombre, "nombre", 120, true);
  const telefono = normalizeText(req.body.telefono, "telefono", 40);
  const correo = normalizeEmail(req.body.correo);
  const especialidad = normalizeText(req.body.especialidad, "especialidad", 120);
  const activo = normalizeActive(req.body.activo);
  const result = await pool.query(
    `UPDATE tecnicos
     SET nombre = $1, telefono = $2, correo = $3, especialidad = $4, activo = $5
     WHERE id_tecnico = $6
     RETURNING id_tecnico, nombre, telefono, correo, especialidad, activo`,
    [nombre, telefono, correo, especialidad, activo, id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: "Registro no encontrado" });
  res.json(result.rows[0]);
})));

app.delete("/api/tecnicos/:id", requireAuth, requireRole("administrador"), asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "Identificador invalido" });
  await pool.query("UPDATE tecnicos SET activo = FALSE WHERE id_tecnico = $1", [id]);
  res.status(204).send();
}));

app.get("/api/instituciones", requireAuth, asyncHandler(async (req, res) => {
  const scope = await companyScope(req);
  // Las empresas de la institucion se limitan a las del usuario para no revelar otros clientes.
  const result = await pool.query(
    `SELECT i.id_institucion, i.nombre, i.direccion, i.telefono, i.correo, i.activo,
       ARRAY(SELECT pi.id_proveedor::text FROM proveedor_institucion pi
             WHERE pi.id_institucion=i.id_institucion
               AND ($1::bigint[] IS NULL OR pi.id_proveedor = ANY($1::bigint[]))) AS id_proveedores,
       (SELECT STRING_AGG(p.nombre, ', ' ORDER BY p.nombre) FROM proveedor_institucion pi
        JOIN proveedores p ON p.id_proveedor=pi.id_proveedor
        WHERE pi.id_institucion=i.id_institucion
          AND ($1::bigint[] IS NULL OR pi.id_proveedor = ANY($1::bigint[]))) AS empresas
     FROM instituciones i
     WHERE ${institutionInScope("i.id_institucion", "$1")}
     ORDER BY i.id_institucion DESC`,
    [scope]
  );
  res.json(result.rows);
}));

// Empresas que atenderan la institucion: el generador solo puede elegir entre las suyas.
function readInstitutionCompanies(body, scope) {
  const ids = validateCompanyIds(body.id_proveedores);
  if (scope && ids.some((id) => !scope.includes(id))) {
    throw invalidInput("Solo puede enlazar la institucion a sus empresas");
  }
  return ids;
}

// Si la institucion ya existe (mismo nombre sin importar mayusculas o espacios) no se duplica:
// se enlaza a las empresas indicadas y se conservan sus datos.
app.post("/api/instituciones", requireAuth, requireRole(...allowedEditors), asyncHandler(async (req, res) => {
  const nombre = normalizeText(req.body.nombre, "nombre", 160, true);
  const direccion = normalizeText(req.body.direccion, "direccion", 1000);
  const telefono = normalizeText(req.body.telefono, "telefono", 40);
  const correo = normalizeEmail(req.body.correo);
  const activo = normalizeActive(req.body.activo);
  const empresaIds = readInstitutionCompanies(req.body, await companyScope(req));
  const { institution, created } = await withTransaction(async (client) => {
    const valid = await client.query(
      "SELECT COUNT(*)::int AS total FROM proveedores WHERE id_proveedor = ANY($1::bigint[]) AND activo=TRUE",
      [empresaIds]
    );
    if (valid.rows[0].total !== empresaIds.length) throw invalidInput("Todas las empresas deben existir y estar activas");
    const inserted = await client.query(
      `INSERT INTO instituciones (nombre, direccion, telefono, correo, activo)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT ((LOWER(BTRIM(nombre)))) DO NOTHING
       RETURNING id_institucion, nombre, direccion, telefono, correo, activo`,
      [nombre, direccion, telefono, correo, activo]
    );
    const row = inserted.rows[0] || (await client.query(
      `SELECT id_institucion, nombre, direccion, telefono, correo, activo
       FROM instituciones WHERE LOWER(BTRIM(nombre)) = LOWER(BTRIM($1))`, [nombre]
    )).rows[0];
    await client.query(
      `INSERT INTO proveedor_institucion (id_proveedor, id_institucion)
       SELECT UNNEST($2::bigint[]), $1 ON CONFLICT DO NOTHING`,
      [row.id_institucion, empresaIds]
    );
    return { institution: { ...row, ya_existia: !inserted.rows[0] }, created: Boolean(inserted.rows[0]) };
  });
  res.status(created ? 201 : 200).json(institution);
}));

app.put("/api/instituciones/:id", requireAuth, requireRole("administrador"), asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) throw invalidInput("Identificador invalido");
  const nombre = normalizeText(req.body.nombre, "nombre", 160, true);
  const direccion = normalizeText(req.body.direccion, "direccion", 1000);
  const telefono = normalizeText(req.body.telefono, "telefono", 40);
  const correo = normalizeEmail(req.body.correo);
  const activo = normalizeActive(req.body.activo);
  const empresaIds = readInstitutionCompanies(req.body, null);
  const updated = await withTransaction(async (client) => {
    const result = await client.query(
      `UPDATE instituciones SET nombre=$1, direccion=$2, telefono=$3, correo=$4, activo=$5
       WHERE id_institucion=$6
       RETURNING id_institucion, nombre, direccion, telefono, correo, activo`,
      [nombre, direccion, telefono, correo, activo, id]
    );
    if (result.rows[0] && !(await replaceCompanyLinks(client, "institucion", id, empresaIds))) {
      throw invalidInput("Todas las empresas deben existir y estar activas");
    }
    return result.rows[0];
  });
  if (!updated) return res.status(404).json({ error: "Registro no encontrado" });
  res.json(updated);
}));

app.delete("/api/instituciones/:id", requireAuth, requireRole("administrador"), asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "Identificador invalido" });
  await pool.query("UPDATE instituciones SET activo=FALSE WHERE id_institucion=$1", [id]);
  res.status(204).send();
}));

app.get("/api/proveedores", requireAuth, asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT id_proveedor, nombre, nit, telefono, correo, direccion, logo_url, pie_pagina, codigo_plantilla, activo
     FROM proveedores WHERE ($1::bigint[] IS NULL OR id_proveedor = ANY($1::bigint[]))
     ORDER BY id_proveedor DESC`,
    [await companyScope(req)]
  );
  res.json(result.rows);
}));

app.post("/api/proveedores", requireAuth, requireRole("administrador"), asyncHandler(async (req, res) => {
  const nombre = normalizeText(req.body.nombre, "nombre", 160, true);
  const nit = normalizeText(req.body.nit, "nit", 30);
  const telefono = normalizeText(req.body.telefono, "telefono", 40);
  const correo = normalizeEmail(req.body.correo);
  const direccion = normalizeText(req.body.direccion, "direccion", 1000);
  const piePagina = normalizeText(req.body.pie_pagina, "pie_pagina", 2000);
  const activo = normalizeActive(req.body.activo);
  const result = await pool.query(
    `INSERT INTO proveedores (nombre, nit, telefono, correo, direccion, pie_pagina, activo)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id_proveedor, nombre, nit, telefono, correo, direccion, logo_url, pie_pagina, activo`,
    [nombre, nit, telefono, correo, direccion, piePagina, activo]
  );
  res.status(201).json(result.rows[0]);
}));

app.put("/api/proveedores/:id", requireAuth, requireRole("administrador"), asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) throw invalidInput("Identificador invalido");
  const nombre = normalizeText(req.body.nombre, "nombre", 160, true);
  const nit = normalizeText(req.body.nit, "nit", 30);
  const telefono = normalizeText(req.body.telefono, "telefono", 40);
  const correo = normalizeEmail(req.body.correo);
  const direccion = normalizeText(req.body.direccion, "direccion", 1000);
  const piePagina = normalizeText(req.body.pie_pagina, "pie_pagina", 2000);
  const activo = normalizeActive(req.body.activo);
  const result = await pool.query(
    `UPDATE proveedores SET nombre=$1, nit=$2, telefono=$3, correo=$4, direccion=$5,
       pie_pagina=$6, activo=$7
     WHERE id_proveedor=$8
     RETURNING id_proveedor, nombre, nit, telefono, correo, direccion, logo_url, pie_pagina, activo`,
    [nombre, nit, telefono, correo, direccion, piePagina, activo, id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: "Registro no encontrado" });
  res.json(result.rows[0]);
}));

app.delete("/api/proveedores/:id", requireAuth, requireRole("administrador"), asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "Identificador invalido" });
  await pool.query("UPDATE proveedores SET activo=FALSE WHERE id_proveedor=$1", [id]);
  res.status(204).send();
}));

// Los equipos pertenecen al hospital: las empresas que lo atienden comparten su inventario.
app.get("/api/equipos-medicos", requireAuth, asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT em.id_equipo_medico, em.id_institucion, em.nombre, em.numero_bien,
       em.marca, em.modelo, em.numero_serie, i.nombre AS institucion, em.activo
     FROM equipos_medicos em JOIN instituciones i ON i.id_institucion=em.id_institucion
     WHERE ${institutionInScope("i.id_institucion", "$1")}
     ORDER BY em.id_equipo_medico DESC`,
    [await companyScope(req)]
  );
  res.json(result.rows);
}));

app.post("/api/equipos-medicos", requireAuth, requireRole(...allowedEditors), asyncHandler(async (req, res) => {
  const institucionId = parseId(req.body.id_institucion);
  if (!institucionId) throw invalidInput("La institucion es obligatoria");
  await assertInstitutionInScope(await companyScope(req), institucionId);
  const values = [
    institucionId,
    normalizeText(req.body.nombre, "nombre", 180, true),
    normalizeText(req.body.numero_bien, "numero_bien", 100),
    normalizeText(req.body.marca, "marca", 100, true),
    normalizeText(req.body.modelo, "modelo", 100, true),
    normalizeText(req.body.numero_serie, "numero_serie", 100),
    normalizeActive(req.body.activo),
  ];
  // El reporte identifica el equipo por bien o serie; uno de los dos es obligatorio.
  if (!values[2] && !values[5]) throw invalidInput("Indique el numero de bien o el numero de serie");
  const result = await pool.query(
    `INSERT INTO equipos_medicos (id_institucion,nombre,numero_bien,marca,modelo,numero_serie,activo)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`, values
  );
  res.status(201).json(result.rows[0]);
}));

app.put("/api/equipos-medicos/:id", requireAuth, requireRole("administrador"), asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const institucionId = parseId(req.body.id_institucion);
  if (!id || !institucionId) throw invalidInput("Equipo o institucion invalida");
  const values = [
    institucionId,
    normalizeText(req.body.nombre, "nombre", 180, true),
    normalizeText(req.body.numero_bien, "numero_bien", 100),
    normalizeText(req.body.marca, "marca", 100, true),
    normalizeText(req.body.modelo, "modelo", 100, true),
    normalizeText(req.body.numero_serie, "numero_serie", 100),
    normalizeActive(req.body.activo), id,
  ];
  const result = await pool.query(
    `UPDATE equipos_medicos SET id_institucion=$1,nombre=$2,numero_bien=$3,
       marca=$4,modelo=$5,numero_serie=$6,activo=$7 WHERE id_equipo_medico=$8
     RETURNING *`, values
  );
  if (!result.rows[0]) return res.status(404).json({ error: "Equipo no encontrado" });
  res.json(result.rows[0]);
}));

app.delete("/api/equipos-medicos/:id", requireAuth, requireRole("administrador"), asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) throw invalidInput("Equipo invalido");
  await pool.query("UPDATE equipos_medicos SET activo=FALSE WHERE id_equipo_medico=$1", [id]);
  res.status(204).send();
}));

// Todo lo que ofrece el formulario de reportes se limita a las empresas del usuario.
app.get("/api/reportes/catalogos", requireAuth, asyncHandler(async (req, res) => {
  const scope = await companyScope(req);
  const [servicios, proveedores, equiposMedicos, tecnicos, instituciones] = await Promise.all([
    pool.query(`SELECT ss.id_servicio_solicitante AS id, ss.id_institucion,
      ss.nombre || ' - ' || i.nombre AS nombre, ss.nombre AS servicio, i.nombre AS institucion
      FROM servicios_solicitantes ss JOIN instituciones i ON i.id_institucion=ss.id_institucion
      WHERE ss.activo=TRUE AND i.activo=TRUE AND ${institutionInScope("i.id_institucion", "$1")}
      ORDER BY i.nombre, ss.nombre`, [scope]),
    pool.query(`SELECT id_proveedor AS id, nombre, codigo_plantilla FROM proveedores
      WHERE activo=TRUE AND ($1::bigint[] IS NULL OR id_proveedor = ANY($1::bigint[])) ORDER BY nombre`, [scope]),
    pool.query(`SELECT em.id_equipo_medico AS id, em.id_institucion, em.nombre,
      em.numero_bien, em.numero_serie, em.marca, em.modelo
      FROM equipos_medicos em
      WHERE em.activo=TRUE AND ${institutionInScope("em.id_institucion", "$1")} ORDER BY em.nombre`, [scope]),
    pool.query("SELECT id_tecnico AS id, nombre, especialidad FROM tecnicos WHERE activo=TRUE ORDER BY nombre"),
    pool.query(`SELECT i.id_institucion AS id, i.nombre,
      ARRAY(SELECT pi.id_proveedor::text FROM proveedor_institucion pi WHERE pi.id_institucion=i.id_institucion
            AND ($1::bigint[] IS NULL OR pi.id_proveedor = ANY($1::bigint[]))) AS id_proveedores
      FROM instituciones i
      WHERE i.activo=TRUE AND ${institutionInScope("i.id_institucion", "$1")} ORDER BY i.nombre`, [scope]),
  ]);
  const empresas = proveedores.rows.map((provider) => ({
    ...provider, plantilla: resolveReportTemplate(provider.nombre, provider.codigo_plantilla),
  })).filter((provider) => provider.plantilla.key !== "generic");
  res.json({
    servicios: servicios.rows, proveedores: empresas, equipos_medicos: equiposMedicos.rows,
    tecnicos: tecnicos.rows, instituciones: instituciones.rows,
  });
}));

// Vista de la plantilla elegida: no crea reportes, archivos ni registros de auditoria.
app.get("/api/reportes/plantilla/:id", requireAuth, asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) throw invalidInput("Empresa invalida");
  const result = await pool.query(
    `SELECT nombre, codigo_plantilla FROM proveedores
     WHERE id_proveedor=$1 AND activo=TRUE AND ($2::bigint[] IS NULL OR id_proveedor = ANY($2::bigint[]))`,
    [id, await companyScope(req)]
  );
  const company = result.rows[0];
  if (!company || resolveReportTemplate(company.nombre, company.codigo_plantilla).key === "generic") {
    return res.status(404).json({ error: "La empresa no tiene una plantilla disponible" });
  }
  const pdf = await generateReportPdf({ proveedor: company.nombre, codigo_plantilla: company.codigo_plantilla });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Disposition", "inline; filename=plantilla.pdf");
  res.send(pdf);
}));

function optionalId(value, field) {
  if (value === undefined || value === "") return null;
  const id = parseId(value);
  if (!id) throw invalidInput(`${field} invalido`);
  return id;
}

function optionalDate(value, field) {
  const date = normalizeText(value, field, 10);
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw invalidInput(`${field} invalida`);
  return date;
}

// Filtros combinables (RF-12): cada parametro vacio se ignora en la consulta.
app.get("/api/reportes", requireAuth, asyncHandler(async (req, res) => {
  const codigo = normalizeText(req.query.codigo, "codigo", 40);
  const estado = normalizeText(req.query.estado, "estado", 30);
  if (estado && !["borrador", "publicado", "anulado"].includes(estado)) {
    throw invalidInput("Estado invalido");
  }
  const institucionId = optionalId(req.query.id_institucion, "Institucion");
  const servicioId = optionalId(req.query.id_servicio_solicitante, "Servicio");
  const tecnicoId = optionalId(req.query.id_tecnico, "Tecnico");
  const desde = optionalDate(req.query.fecha_desde, "Fecha inicial");
  const hasta = optionalDate(req.query.fecha_hasta, "Fecha final");
  if (desde && hasta && desde > hasta) throw invalidInput("La fecha inicial no puede ser posterior a la final");
  const result = await pool.query(
    `SELECT v.*, r.id_usuario_creador, u.nombre AS creador FROM vw_reportes_resumen v
     JOIN reportes r ON r.id_reporte=v.id_reporte
     JOIN usuarios u ON u.id_usuario=r.id_usuario_creador
     JOIN servicios_solicitantes ss ON ss.id_servicio_solicitante=r.id_servicio_solicitante
     WHERE ($1::text IS NULL OR v.codigo_reporte ILIKE '%' || $1 || '%')
       AND ($2::text IS NULL OR v.estado = $2)
       AND ($3::bigint IS NULL OR ss.id_institucion = $3)
       AND ($4::bigint IS NULL OR r.id_servicio_solicitante = $4)
       AND ($5::bigint IS NULL OR EXISTS (
         SELECT 1 FROM reporte_tecnico rt WHERE rt.id_reporte=r.id_reporte AND rt.id_tecnico=$5))
       AND ($6::date IS NULL OR v.fecha_reporte >= $6)
       AND ($7::date IS NULL OR v.fecha_reporte <= $7)
       AND ($8::bigint[] IS NULL OR r.id_proveedor_plantilla = ANY($8::bigint[]))
     ORDER BY v.fecha_reporte DESC, v.codigo_reporte`,
    [codigo, estado, institucionId, servicioId, tecnicoId, desde, hasta, await companyScope(req)]
  );
  res.json(result.rows.map((row) => ({ ...row, puede_editar: canEditReport(req.session, row) })));
}));

// El administrador corrige cualquier reporte; el generador solo los que el mismo creo.
function canEditReport(session, report) {
  if (report.estado === "anulado") return false;
  if (session.rol === "administrador") return true;
  return session.rol === "generador_reportes" && Number(report.id_usuario_creador) === Number(session.id_usuario);
}

// Reporte de una empresa del usuario; para los demas responde como si no existiera.
async function findVisibleReport(req, id) {
  const result = await pool.query(
    `SELECT id_reporte, codigo_reporte, estado, id_usuario_creador FROM reportes
     WHERE id_reporte=$1 AND ($2::bigint[] IS NULL OR id_proveedor_plantilla = ANY($2::bigint[]))`,
    [id, await companyScope(req)]
  );
  return result.rows[0] || null;
}

// Campos redactados del reporte; se validan igual al crearlo y al corregirlo.
function readReportDetails(body) {
  const details = {
    titulo: normalizeText(body.titulo, "titulo", 180, true),
    fecha: normalizeText(body.fecha_reporte, "fecha", 10, true),
    pedido: normalizeText(body.numero_pedido_nog, "numero_pedido_nog", 80),
    tipo: normalizeText(body.tipo_servicio, "tipo_servicio", 40, true),
    especificaciones: normalizeText(body.especificaciones_tecnicas, "especificaciones_tecnicas", 6000, true),
    recomendaciones: normalizeText(body.recomendaciones, "recomendaciones", 6000),
  };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(details.fecha)) throw invalidInput("Fecha invalida");
  if (!["garantia", "preventivo", "correctivo", "emergencia", "otros"].includes(details.tipo)) {
    throw invalidInput("Tipo de servicio invalido");
  }
  return details;
}

// Ejecuta cambios de reportes en una transaccion que identifica al usuario ante el trigger de auditoria.
function withUserTransaction(userId, work) {
  return withTransaction(async (client) => {
    await client.query("SELECT set_config('meditec.id_usuario', $1, TRUE)", [String(userId)]);
    return work(client);
  });
}

// Reemplaza los tecnicos de un reporte; devuelve false si alguno no existe o esta inactivo.
async function assignTechnicians(client, reportId, technicianIds) {
  await client.query("DELETE FROM reporte_tecnico WHERE id_reporte=$1", [reportId]);
  if (!technicianIds.length) return true;
  const result = await client.query(
    `INSERT INTO reporte_tecnico (id_reporte, id_tecnico)
     SELECT $1, id_tecnico FROM tecnicos WHERE id_tecnico = ANY($2::bigint[]) AND activo=TRUE`,
    [reportId, technicianIds]
  );
  return result.rowCount === technicianIds.length;
}

app.post("/api/reportes", requireAuth, requireRole(...allowedEditors), asyncHandler(async (req, res) => {
  const servicioId = parseId(req.body.id_servicio_solicitante);
  const proveedorId = parseId(req.body.id_proveedor_plantilla);
  const isBatch = Array.isArray(req.body.id_equipos_medicos);
  const equipoMedicoIds = isBatch
    ? validateEquipmentIds(req.body.id_equipos_medicos)
    : validateEquipmentIds([req.body.id_equipo_medico]);
  if (!servicioId) throw invalidInput("Servicio invalido");
  if (!proveedorId) throw invalidInput("Proveedor principal invalido");
  const scope = await companyScope(req);
  if (scope && !scope.includes(proveedorId)) throw invalidInput("Solo puede crear reportes de sus empresas");
  const company = await pool.query("SELECT nombre, codigo_plantilla FROM proveedores WHERE id_proveedor=$1 AND activo=TRUE", [proveedorId]);
  if (!company.rows[0] || resolveReportTemplate(company.rows[0].nombre, company.rows[0].codigo_plantilla).key === "generic") {
    throw invalidInput("Seleccione Teknor, Meditec o GT Medical como empresa prestadora");
  }
  if (req.body.publicar !== undefined && typeof req.body.publicar !== "boolean") {
    throw invalidInput("publicar debe ser booleano");
  }
  const { titulo, fecha, pedido, tipo, especificaciones, recomendaciones } = readReportDetails(req.body);
  const tecnicoIds = validateTechnicianIds(req.body.id_tecnicos);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const created = [];
    for (const equipoMedicoId of equipoMedicoIds) {
      const result = await client.query(
         `INSERT INTO reportes (
            codigo_reporte, id_servicio_solicitante, id_equipo_medico, id_proveedor_plantilla,
            id_usuario_creador, titulo, fecha_reporte,
            numero_pedido_nog, descripcion_equipo, marca, modelo, numero_serie,
            numero_bien, tipo_servicio, especificaciones_tecnicas, recomendaciones
          )
          SELECT generar_codigo_reporte(), $1, $2, $3, $4,
            $5, $6, $7, em.nombre, em.marca, em.modelo, em.numero_serie,
            em.numero_bien, $8, $9, $10
          FROM servicios_solicitantes ss
          JOIN instituciones i ON i.id_institucion=ss.id_institucion AND i.activo=TRUE
          JOIN proveedores p ON p.id_proveedor=$3 AND p.activo=TRUE
          JOIN proveedor_institucion pi ON pi.id_proveedor=p.id_proveedor AND pi.id_institucion=ss.id_institucion
          JOIN equipos_medicos em ON em.id_equipo_medico=$2 AND em.activo=TRUE
            AND em.id_institucion=ss.id_institucion
          WHERE ss.id_servicio_solicitante=$1 AND ss.activo=TRUE
          RETURNING id_reporte, codigo_reporte, estado`,
        [servicioId, equipoMedicoId, proveedorId, req.session.id_usuario,
          titulo, fecha, pedido, tipo, especificaciones, recomendaciones]
      );
      if (!result.rows[0]) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: "Los equipos deben estar activos y pertenecer a la institucion del servicio, atendida por la empresa elegida",
        });
      }
      await client.query(
        "INSERT INTO reporte_proveedor (id_reporte, id_proveedor, observacion) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING",
        [result.rows[0].id_reporte, proveedorId, "Proveedor principal de la plantilla"]
      );
      if (!(await assignTechnicians(client, result.rows[0].id_reporte, tecnicoIds))) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Todos los tecnicos deben existir y estar activos" });
      }
      created.push(result.rows[0]);
    }
    await client.query("COMMIT");
    const completed = req.body.publicar
      ? await Promise.all(created.map((report) => publishReport(report.id_reporte, req.session.id_usuario)))
      : created;
    return res.status(201).json(isBatch ? { reportes: completed } : completed[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}));

// El creador del reporte firma como servicio tecnico en el PDF.
async function loadReportDetail(id, db = pool) {
  const result = await db.query(
    `SELECT r.*, TO_CHAR(r.fecha_reporte, 'DD/MM/YYYY') AS fecha_reporte_texto,
       ss.nombre AS servicio_solicitante, i.nombre AS institucion,
       p.nombre AS proveedor, p.codigo_plantilla, p.logo_url, p.pie_pagina,
       u.nombre AS creador
     FROM reportes r
     JOIN servicios_solicitantes ss ON ss.id_servicio_solicitante=r.id_servicio_solicitante
     JOIN instituciones i ON i.id_institucion=ss.id_institucion
     JOIN proveedores p ON p.id_proveedor=r.id_proveedor_plantilla
     JOIN usuarios u ON u.id_usuario=r.id_usuario_creador
     WHERE r.id_reporte=$1`, [id]
  );
  const report = result.rows[0];
  if (report) report.fecha_reporte = report.fecha_reporte_texto;
  return report;
}

async function publishReport(id, userId) {
  const report = await loadReportDetail(id);
  if (!report) throw Object.assign(new Error("Reporte no encontrado"), { status: 404 });
  if (report.estado !== "borrador") throw invalidInput("Solo se publican reportes en borrador");
  const pdf = await generateReportPdf(report);
  const hash = crypto.createHash("sha256").update(pdf).digest("hex");
  const key = `reportes/${new Date().getFullYear()}/${report.codigo_reporte}.pdf`;
  await putPdf(key, pdf);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("CALL reemplazar_pdf_reporte($1, $2, $3, $4, $5)", [id, key, hash, pdf.length, userId]);
    await client.query("CALL publicar_reporte($1, $2)", [id, userId]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    await deletePdf(key).catch(() => null);
    throw error;
  } finally {
    client.release();
  }
  return { id_reporte: id, codigo_reporte: report.codigo_reporte, estado: "publicado", url_archivo: key };
}

app.get("/api/reportes/:id/vista-previa", requireAuth, asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) throw invalidInput("Identificador invalido");
  const report = (await findVisibleReport(req, id)) && await loadReportDetail(id);
  if (!report) return res.status(404).json({ error: "Reporte no encontrado" });
  const pdf = await generateReportPdf(report);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${report.codigo_reporte}-vista-previa.pdf"`);
  res.send(pdf);
}));

app.post("/api/reportes/:id/publicar", requireAuth, requireRole(...allowedEditors), asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) throw invalidInput("Identificador invalido");
  const report = await findVisibleReport(req, id);
  if (!report) return res.status(404).json({ error: "Reporte no encontrado" });
  if (!canEditReport(req.session, report)) {
    return res.status(403).json({ error: "Solo puede publicar los reportes que usted creo" });
  }
  const published = await publishReport(id, req.session.id_usuario);
  res.json({ ok: true, ubicacion: published.url_archivo });
}));

app.get("/api/reportes/:id", requireAuth, asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) throw invalidInput("Identificador invalido");
  if (!(await findVisibleReport(req, id))) return res.status(404).json({ error: "Reporte no encontrado" });
  const result = await pool.query(
    `SELECT id_reporte, codigo_reporte, estado, titulo, TO_CHAR(fecha_reporte, 'YYYY-MM-DD') AS fecha_reporte,
       numero_pedido_nog, tipo_servicio, especificaciones_tecnicas, recomendaciones,
       descripcion_equipo, marca, modelo, numero_serie, numero_bien,
       ARRAY(SELECT rt.id_tecnico::text FROM reporte_tecnico rt WHERE rt.id_reporte=r.id_reporte) AS id_tecnicos
     FROM reportes r WHERE id_reporte=$1`, [id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: "Reporte no encontrado" });
  res.json(result.rows[0]);
}));

// Corrige un reporte. Si ya estaba publicado se genera un PDF nuevo y el anterior queda
// como "reemplazado" en archivos_pdf, de modo que el historial no se pierde.
app.put("/api/reportes/:id", requireAuth, requireRole(...allowedEditors), asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) throw invalidInput("Identificador invalido");
  const { titulo, fecha, pedido, tipo, especificaciones, recomendaciones } = readReportDetails(req.body);
  const tecnicoIds = validateTechnicianIds(req.body.id_tecnicos);
  const report = await findVisibleReport(req, id);
  if (!report) return res.status(404).json({ error: "Reporte no encontrado" });
  if (report.estado === "anulado") return res.status(409).json({ error: "Un reporte anulado no se puede editar" });
  if (!canEditReport(req.session, report)) {
    return res.status(403).json({ error: "Solo puede editar los reportes que usted creo" });
  }
  let newKey = null;
  try {
    const updated = await withUserTransaction(req.session.id_usuario, async (client) => {
      const result = await client.query(
        `UPDATE reportes SET titulo=$1, fecha_reporte=$2, numero_pedido_nog=$3, tipo_servicio=$4,
           especificaciones_tecnicas=$5, recomendaciones=$6
         WHERE id_reporte=$7 AND estado<>'anulado'
         RETURNING id_reporte, codigo_reporte, estado`,
        [titulo, fecha, pedido, tipo, especificaciones, recomendaciones, id]
      );
      const row = result.rows[0];
      if (!row) return null;
      if (!(await assignTechnicians(client, id, tecnicoIds))) {
        throw invalidInput("Todos los tecnicos deben existir y estar activos");
      }
      if (row.estado === "publicado") {
        const pdf = await generateReportPdf(await loadReportDetail(id, client));
        const hash = crypto.createHash("sha256").update(pdf).digest("hex");
        // Clave nueva por version: el archivo reemplazado sigue disponible en el almacenamiento.
        newKey = `reportes/${new Date().getFullYear()}/${row.codigo_reporte}-v${Date.now()}.pdf`;
        await putPdf(newKey, pdf);
        await client.query("CALL reemplazar_pdf_reporte($1, $2, $3, $4, $5)",
          [id, newKey, hash, pdf.length, req.session.id_usuario]);
      }
      return row;
    });
    if (!updated) return res.status(409).json({ error: "Un reporte anulado no se puede editar" });
    return res.json(updated);
  } catch (error) {
    if (newKey) await deletePdf(newKey).catch(() => null);
    throw error;
  }
}));

// Anulacion logica: el reporte y su PDF se conservan para la trazabilidad y la auditoria.
app.delete("/api/reportes/:id", requireAuth, requireRole("administrador"), asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) throw invalidInput("Identificador invalido");
  const annulled = await withUserTransaction(req.session.id_usuario, async (client) => (await client.query(
    "UPDATE reportes SET estado='anulado' WHERE id_reporte=$1 AND estado<>'anulado' RETURNING id_reporte",
    [id]
  )).rows[0]);
  if (annulled) return res.status(204).send();
  const exists = await pool.query("SELECT 1 FROM reportes WHERE id_reporte=$1", [id]);
  if (!exists.rows[0]) return res.status(404).json({ error: "Reporte no encontrado" });
  return res.status(409).json({ error: "El reporte ya esta anulado" });
}));

app.get("/api/reportes/:id/archivo", requireAuth, asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) throw invalidInput("Identificador invalido");
  if (!(await findVisibleReport(req, id))) return res.status(404).json({ error: "Reporte no encontrado" });
  const result = await pool.query(
    "SELECT url_archivo FROM archivos_pdf WHERE id_reporte=$1 AND estado='activo'", [id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: "El reporte no tiene PDF publicado" });
  const pdf = await getPdf(result.rows[0].url_archivo);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline");
  res.send(pdf);
}));

app.use((err, _req, res, _next) => {
  if (["42703", "42P01"].includes(err.code)) {
    return res.status(503).json({ error: "La base de datos requiere actualizacion. Aplique las migraciones pendientes segun INSTALL.md" });
  }
  if (err.code === "42501") {
    return res.status(503).json({ error: "La cuenta de la base no tiene los permisos actuales. Ejecute sql/security/002_usuario_web.sql segun INSTALL.md" });
  }
  if (err.code === "23505") return res.status(409).json({ error: "El registro ya existe" });
  if (["22007", "22008", "23502", "23503", "P0001"].includes(err.code)) {
    return res.status(400).json({ error: "La operacion no cumple las reglas de datos" });
  }
  if (Number.isInteger(err.status) && err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: "Error interno de la aplicacion" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Meditec web escuchando en http://localhost:${port}`);
});
