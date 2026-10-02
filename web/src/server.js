const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const express = require("express");
const { rateLimit } = require("express-rate-limit");
const helmet = require("helmet");
const { Pool } = require("pg");
const { generateReportPdf } = require("./pdf-report");
const { deletePdf, getPdf, putPdf } = require("./storage");
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
  const correo = typeof req.body.correo === "string" ? req.body.correo.trim().toLowerCase() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";
  if (!correo || !password || correo.length > 160 || password.length > 128) {
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
  const passwordValid = await bcrypt.compare(password, user?.password_hash || dummyPasswordHash);
  if (!user || !passwordValid) {
    return res.status(401).json({ error: "Credenciales invalidas" });
  }

  const token = signToken({
    id_usuario: user.id_usuario,
    nombre: user.nombre,
    correo: user.correo,
    rol: user.rol,
  }, sessionSecret);
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Set-Cookie", createSessionCookie(token, process.env.NODE_ENV === "production"));
  res.json({ usuario: { nombre: user.nombre, correo: user.correo, rol: user.rol } });
}));

app.get("/api/session", requireAuth, (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json({
    usuario: {
      nombre: req.session.nombre,
      correo: req.session.correo,
      rol: req.session.rol,
    },
  });
});

app.post("/api/logout", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Set-Cookie", clearSessionCookie(process.env.NODE_ENV === "production"));
  res.status(204).send();
});

app.get("/api/servicios-solicitantes", requireAuth, asyncHandler(async (_req, res) => {
  const result = await pool.query(
    `SELECT ss.id_servicio_solicitante, ss.nombre, ss.id_institucion,
            i.nombre AS institucion, ss.activo
     FROM servicios_solicitantes ss
     JOIN instituciones i ON i.id_institucion=ss.id_institucion
     ORDER BY ss.id_servicio_solicitante DESC`
  );
  res.json(result.rows);
}));

app.post("/api/servicios-solicitantes", requireAuth, requireRole(...allowedEditors), validationHandler(asyncHandler(async (req, res) => {
  const nombre = normalizeText(req.body.nombre, "nombre", 160, true);
  const institucionId = parseId(req.body.id_institucion);
  if (!institucionId) throw invalidInput("La institucion es obligatoria");
  const activo = normalizeActive(req.body.activo);

  const result = await pool.query(
    `INSERT INTO servicios_solicitantes (nombre, id_institucion, activo)
     VALUES ($1, $2, $3)
     RETURNING id_servicio_solicitante, nombre, id_institucion, activo`,
    [nombre, institucionId, activo]
  );
  res.status(201).json(result.rows[0]);
})));

app.put("/api/servicios-solicitantes/:id", requireAuth, requireRole(...allowedEditors), validationHandler(asyncHandler(async (req, res) => {
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

app.post("/api/tecnicos", requireAuth, requireRole(...allowedEditors), validationHandler(asyncHandler(async (req, res) => {
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

app.put("/api/tecnicos/:id", requireAuth, requireRole(...allowedEditors), validationHandler(asyncHandler(async (req, res) => {
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

app.get("/api/instituciones", requireAuth, asyncHandler(async (_req, res) => {
  const result = await pool.query(
    `SELECT id_institucion, nombre, direccion, telefono, correo, activo
     FROM instituciones ORDER BY id_institucion DESC`
  );
  res.json(result.rows);
}));

app.post("/api/instituciones", requireAuth, requireRole(...allowedEditors), asyncHandler(async (req, res) => {
  const nombre = normalizeText(req.body.nombre, "nombre", 160, true);
  const direccion = normalizeText(req.body.direccion, "direccion", 1000);
  const telefono = normalizeText(req.body.telefono, "telefono", 40);
  const correo = normalizeEmail(req.body.correo);
  const activo = normalizeActive(req.body.activo);
  const result = await pool.query(
    `INSERT INTO instituciones (nombre, direccion, telefono, correo, activo)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id_institucion, nombre, direccion, telefono, correo, activo`,
    [nombre, direccion, telefono, correo, activo]
  );
  res.status(201).json(result.rows[0]);
}));

app.put("/api/instituciones/:id", requireAuth, requireRole(...allowedEditors), asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) throw invalidInput("Identificador invalido");
  const nombre = normalizeText(req.body.nombre, "nombre", 160, true);
  const direccion = normalizeText(req.body.direccion, "direccion", 1000);
  const telefono = normalizeText(req.body.telefono, "telefono", 40);
  const correo = normalizeEmail(req.body.correo);
  const activo = normalizeActive(req.body.activo);
  const result = await pool.query(
    `UPDATE instituciones SET nombre=$1, direccion=$2, telefono=$3, correo=$4, activo=$5
     WHERE id_institucion=$6
     RETURNING id_institucion, nombre, direccion, telefono, correo, activo`,
    [nombre, direccion, telefono, correo, activo, id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: "Registro no encontrado" });
  res.json(result.rows[0]);
}));

app.delete("/api/instituciones/:id", requireAuth, requireRole("administrador"), asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "Identificador invalido" });
  await pool.query("UPDATE instituciones SET activo=FALSE WHERE id_institucion=$1", [id]);
  res.status(204).send();
}));

app.get("/api/proveedores", requireAuth, asyncHandler(async (_req, res) => {
  const result = await pool.query(
    `SELECT id_proveedor, nombre, nit, telefono, correo, direccion, logo_url, pie_pagina, activo
     FROM proveedores ORDER BY id_proveedor DESC`
  );
  res.json(result.rows);
}));

app.post("/api/proveedores", requireAuth, requireRole(...allowedEditors), asyncHandler(async (req, res) => {
  const nombre = normalizeText(req.body.nombre, "nombre", 160, true);
  const nit = normalizeText(req.body.nit, "nit", 30);
  const telefono = normalizeText(req.body.telefono, "telefono", 40);
  const correo = normalizeEmail(req.body.correo);
  const direccion = normalizeText(req.body.direccion, "direccion", 1000);
  const logoUrl = normalizeText(req.body.logo_url, "logo_url", 1000);
  const piePagina = normalizeText(req.body.pie_pagina, "pie_pagina", 2000);
  const activo = normalizeActive(req.body.activo);
  const result = await pool.query(
    `INSERT INTO proveedores (nombre, nit, telefono, correo, direccion, logo_url, pie_pagina, activo)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id_proveedor, nombre, nit, telefono, correo, direccion, logo_url, pie_pagina, activo`,
    [nombre, nit, telefono, correo, direccion, logoUrl, piePagina, activo]
  );
  res.status(201).json(result.rows[0]);
}));

app.put("/api/proveedores/:id", requireAuth, requireRole(...allowedEditors), asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) throw invalidInput("Identificador invalido");
  const nombre = normalizeText(req.body.nombre, "nombre", 160, true);
  const nit = normalizeText(req.body.nit, "nit", 30);
  const telefono = normalizeText(req.body.telefono, "telefono", 40);
  const correo = normalizeEmail(req.body.correo);
  const direccion = normalizeText(req.body.direccion, "direccion", 1000);
  const logoUrl = normalizeText(req.body.logo_url, "logo_url", 1000);
  const piePagina = normalizeText(req.body.pie_pagina, "pie_pagina", 2000);
  const activo = normalizeActive(req.body.activo);
  const result = await pool.query(
    `UPDATE proveedores SET nombre=$1, nit=$2, telefono=$3, correo=$4, direccion=$5,
       logo_url=$6, pie_pagina=$7, activo=$8
     WHERE id_proveedor=$9
     RETURNING id_proveedor, nombre, nit, telefono, correo, direccion, logo_url, pie_pagina, activo`,
    [nombre, nit, telefono, correo, direccion, logoUrl, piePagina, activo, id]
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

app.get("/api/equipos-medicos", requireAuth, asyncHandler(async (_req, res) => {
  const result = await pool.query(
    `SELECT em.id_equipo_medico, em.id_institucion, em.nombre, em.numero_bien,
       em.marca, em.modelo, em.numero_serie, i.nombre AS institucion, em.activo
     FROM equipos_medicos em JOIN instituciones i ON i.id_institucion=em.id_institucion
     ORDER BY em.id_equipo_medico DESC`
  );
  res.json(result.rows);
}));

app.post("/api/equipos-medicos", requireAuth, requireRole(...allowedEditors), asyncHandler(async (req, res) => {
  const institucionId = parseId(req.body.id_institucion);
  if (!institucionId) throw invalidInput("La institucion es obligatoria");
  const values = [
    institucionId,
    normalizeText(req.body.nombre, "nombre", 180, true),
    normalizeText(req.body.numero_bien, "numero_bien", 100),
    normalizeText(req.body.marca, "marca", 100, true),
    normalizeText(req.body.modelo, "modelo", 100, true),
    normalizeText(req.body.numero_serie, "numero_serie", 100),
    normalizeActive(req.body.activo),
  ];
  const result = await pool.query(
    `INSERT INTO equipos_medicos (id_institucion,nombre,numero_bien,marca,modelo,numero_serie,activo)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`, values
  );
  res.status(201).json(result.rows[0]);
}));

app.put("/api/equipos-medicos/:id", requireAuth, requireRole(...allowedEditors), asyncHandler(async (req, res) => {
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

app.get("/api/reportes/catalogos", requireAuth, asyncHandler(async (_req, res) => {
  const [servicios, proveedores, equiposMedicos] = await Promise.all([
    pool.query(`SELECT ss.id_servicio_solicitante AS id, ss.id_institucion,
      ss.nombre || ' - ' || i.nombre AS nombre
      FROM servicios_solicitantes ss JOIN instituciones i ON i.id_institucion=ss.id_institucion
      WHERE ss.activo=TRUE AND i.activo=TRUE ORDER BY i.nombre, ss.nombre`),
    pool.query("SELECT id_proveedor AS id, nombre FROM proveedores WHERE activo=TRUE ORDER BY nombre"),
    pool.query(`SELECT id_equipo_medico AS id, id_institucion,
      nombre || COALESCE(' - Bien ' || numero_bien, '') AS nombre
      FROM equipos_medicos WHERE activo=TRUE ORDER BY nombre`),
  ]);
  res.json({ servicios: servicios.rows, proveedores: proveedores.rows, equipos_medicos: equiposMedicos.rows });
}));

app.get("/api/reportes", requireAuth, asyncHandler(async (req, res) => {
  const codigo = normalizeText(req.query.codigo, "codigo", 40);
  const estado = normalizeText(req.query.estado, "estado", 30);
  if (estado && !["borrador", "publicado", "anulado"].includes(estado)) {
    throw invalidInput("Estado invalido");
  }
  const result = await pool.query(
    `SELECT * FROM vw_reportes_resumen
     WHERE ($1::text IS NULL OR codigo_reporte ILIKE '%' || $1 || '%')
       AND ($2::text IS NULL OR estado = $2)
     ORDER BY fecha_reporte DESC, codigo_reporte`,
    [codigo, estado]
  );
  res.json(result.rows);
}));

app.post("/api/reportes", requireAuth, requireRole(...allowedEditors), asyncHandler(async (req, res) => {
  const servicioId = parseId(req.body.id_servicio_solicitante);
  const proveedorId = parseId(req.body.id_proveedor_plantilla);
  const equipoMedicoId = parseId(req.body.id_equipo_medico);
  if (!servicioId) throw invalidInput("Servicio invalido");
  if (!proveedorId) throw invalidInput("Proveedor principal invalido");
  if (!equipoMedicoId) throw invalidInput("Equipo medico invalido");
  const equipo = process.env.AUTHORIZED_DEVICE_ID || (process.env.NODE_ENV !== "production" ? "MEDI-GEN-001" : "");
  if (!equipo) throw new Error("AUTHORIZED_DEVICE_ID es obligatorio en produccion");
  const titulo = normalizeText(req.body.titulo, "titulo", 180, true);
  const descripcion = normalizeText(req.body.descripcion, "descripcion", 4000);
  const fecha = normalizeText(req.body.fecha_reporte, "fecha", 10, true);
  const pedido = normalizeText(req.body.numero_pedido_nog, "numero_pedido_nog", 80);
  const tipo = normalizeText(req.body.tipo_servicio, "tipo_servicio", 40, true);
  const especificaciones = normalizeText(req.body.especificaciones_tecnicas, "especificaciones_tecnicas", 6000, true);
  const recomendaciones = normalizeText(req.body.recomendaciones, "recomendaciones", 6000);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw invalidInput("Fecha invalida");
  if (!["garantia", "preventivo", "correctivo", "emergencia", "otros"].includes(tipo)) throw invalidInput("Tipo de servicio invalido");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `INSERT INTO reportes (
         codigo_reporte, id_servicio_solicitante, id_equipo_medico, id_proveedor_plantilla,
         id_usuario_creador, id_equipo_autorizado, titulo, descripcion, fecha_reporte,
         numero_pedido_nog, descripcion_equipo, marca, modelo, numero_serie,
         numero_bien, tipo_servicio, especificaciones_tecnicas, recomendaciones
       )
       SELECT generar_codigo_reporte(), $1, $2, $3, $4, e.id_equipo_autorizado,
         $5, $6, $7, $8, em.nombre, em.marca, em.modelo, em.numero_serie,
         em.numero_bien, $9, $10, $11
       FROM equipos_autorizados e
       JOIN servicios_solicitantes ss ON ss.id_servicio_solicitante=$1 AND ss.activo=TRUE
       JOIN instituciones i ON i.id_institucion=ss.id_institucion AND i.activo=TRUE
       JOIN proveedores p ON p.id_proveedor=$3 AND p.activo=TRUE
       JOIN equipos_medicos em ON em.id_equipo_medico=$2 AND em.activo=TRUE
         AND em.id_institucion=ss.id_institucion
       WHERE e.identificador_equipo=$12 AND e.activo=TRUE
       RETURNING id_reporte, codigo_reporte, estado`,
      [servicioId, equipoMedicoId, proveedorId, req.session.id_usuario,
        titulo, descripcion, fecha, pedido, tipo, especificaciones, recomendaciones, equipo]
    );
    if (!result.rows[0]) {
      await client.query("ROLLBACK");
      return res.status(403).json({ error: "Servicio, proveedor o equipo no autorizado" });
    }
    await client.query(
      "INSERT INTO reporte_proveedor (id_reporte, id_proveedor, observacion) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING",
      [result.rows[0].id_reporte, proveedorId, "Proveedor principal de la plantilla"]
    );
    await client.query("COMMIT");
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}));

async function loadReportDetail(id) {
  const result = await pool.query(
    `SELECT r.*, TO_CHAR(r.fecha_reporte, 'DD/MM/YYYY') AS fecha_reporte_texto,
       ss.nombre AS servicio_solicitante, i.nombre AS institucion,
       p.nombre AS proveedor, p.logo_url, p.pie_pagina
     FROM reportes r
     JOIN servicios_solicitantes ss ON ss.id_servicio_solicitante=r.id_servicio_solicitante
     JOIN instituciones i ON i.id_institucion=ss.id_institucion
     JOIN proveedores p ON p.id_proveedor=r.id_proveedor_plantilla
     WHERE r.id_reporte=$1`, [id]
  );
  const report = result.rows[0];
  if (report) report.fecha_reporte = report.fecha_reporte_texto;
  return report;
}

app.get("/api/reportes/:id/vista-previa", requireAuth, asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) throw invalidInput("Identificador invalido");
  const report = await loadReportDetail(id);
  if (!report) return res.status(404).json({ error: "Reporte no encontrado" });
  const pdf = await generateReportPdf(report);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${report.codigo_reporte}-vista-previa.pdf"`);
  res.send(pdf);
}));

app.post("/api/reportes/:id/publicar", requireAuth, requireRole(...allowedEditors), asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) throw invalidInput("Identificador invalido");
  const report = await loadReportDetail(id);
  if (!report) return res.status(404).json({ error: "Reporte no encontrado" });
  if (report.estado !== "borrador") throw invalidInput("Solo se publican reportes en borrador");
  const pdf = await generateReportPdf(report);
  const hash = crypto.createHash("sha256").update(pdf).digest("hex");
  const key = `reportes/${new Date().getFullYear()}/${report.codigo_reporte}.pdf`;
  await putPdf(key, pdf);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("CALL reemplazar_pdf_reporte($1, $2, $3, $4, $5)", [id, key, hash, pdf.length, req.session.id_usuario]);
    await client.query("CALL publicar_reporte($1, $2)", [id, req.session.id_usuario]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    await deletePdf(key).catch(() => null);
    throw error;
  } finally {
    client.release();
  }
  res.json({ ok: true, ubicacion: key });
}));

app.get("/api/reportes/:id/archivo", requireAuth, asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) throw invalidInput("Identificador invalido");
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
  if (err.code === "23505") return res.status(409).json({ error: "El registro ya existe" });
  if (["22007", "22008", "23502", "23503", "P0001"].includes(err.code)) {
    return res.status(400).json({ error: "La operacion no cumple las reglas de datos" });
  }
  if (err.status === 400) return res.status(400).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: "Error interno de la aplicacion" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Meditec web escuchando en http://localhost:${port}`);
});
