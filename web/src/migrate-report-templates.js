const fs = require("node:fs/promises");
const path = require("node:path");
const assert = require("node:assert/strict");
const { Pool } = require("pg");

function migrationConnections(env) {
  if (!env.DATABASE_ADMIN_URL) throw new Error("Configure DATABASE_ADMIN_URL temporalmente en web/.env con la cuenta propietaria");
  if (!env.DATABASE_URL) throw new Error("DATABASE_URL es obligatoria para comprobar el destino");
  const web = new URL(env.DATABASE_URL);
  const admin = new URL(env.DATABASE_ADMIN_URL);
  const host = (url) => ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ? "local" : url.hostname;
  if (![web, admin].every((url) => ["postgres:", "postgresql:"].includes(url.protocol))) {
    throw new Error("Las conexiones deben usar PostgreSQL");
  }
  if (host(web) !== host(admin) || (web.port || "5432") !== (admin.port || "5432") || web.pathname !== admin.pathname) {
    throw new Error("La conexion administrativa debe apuntar a la misma base y servidor que DATABASE_URL");
  }
  return { adminUrl: env.DATABASE_ADMIN_URL, database: decodeURIComponent(web.pathname.slice(1)) };
}

// Compara el contenido completo, normalizando solamente el nombre de observaciones.
async function snapshot(client) {
  const reports = await client.query(`SELECT id_reporte,
    md5(jsonb_build_object('datos', to_jsonb(r) - 'descripcion' - 'observaciones',
      'observaciones', COALESCE(to_jsonb(r)->'observaciones', to_jsonb(r)->'descripcion'))::text) AS huella
    FROM reportes r ORDER BY id_reporte`);
  const providers = await client.query(`SELECT id_proveedor,
    md5((to_jsonb(p) - 'codigo_plantilla')::text) AS huella
    FROM proveedores p ORDER BY id_proveedor`);
  const pdfs = await client.query(`SELECT id_archivo_pdf, md5(to_jsonb(a)::text) AS huella
    FROM archivos_pdf a ORDER BY id_archivo_pdf`);
  return { reports: reports.rows, providers: providers.rows, pdfs: pdfs.rows };
}

async function migrateReportTemplates(env) {
  const config = migrationConnections(env);
  const sql = await fs.readFile(path.join(__dirname, "..", "..", "sql", "migrations", "005_plantillas_observaciones.sql"), "utf8");
  // El comando controla COMMIT para validar los datos antes de confirmar el SQL.
  const statements = sql.replace(/^BEGIN;\r?$/m, "").replace(/^COMMIT;\r?$/m, "");
  const pool = new Pool({ connectionString: config.adminUrl, connectionTimeoutMillis: 5000 });
  let client;
  try {
    client = await pool.connect();
    const identity = await client.query(`SELECT current_database() AS base,
      bool_and(pg_has_role(current_user, relowner, 'USAGE')) AS propietario
      FROM pg_class WHERE oid IN ('public.proveedores'::regclass, 'public.reportes'::regclass)`);
    if (identity.rows[0].base !== config.database || !identity.rows[0].propietario) {
      throw new Error("La cuenta no es propietaria de las tablas o la base destino no coincide");
    }
    await client.query("BEGIN; SET LOCAL search_path = public, pg_temp; SET LOCAL lock_timeout = '5s'; LOCK TABLE proveedores, reportes, archivos_pdf IN ACCESS EXCLUSIVE MODE");
    const before = await snapshot(client);
    await client.query(statements);
    const after = await snapshot(client);
    assert.deepEqual(after.reports, before.reports, "Se altero contenido de reportes");
    assert.deepEqual(after.pdfs, before.pdfs, "Se alteraron referencias a PDF");
    const existingIds = new Set(before.providers.map((provider) => provider.id_proveedor));
    assert.deepEqual(after.providers.filter((provider) => existingIds.has(provider.id_proveedor)), before.providers,
      "Se alteraron proveedores anteriores");
    const companies = await client.query("SELECT codigo_plantilla FROM proveedores WHERE codigo_plantilla IS NOT NULL ORDER BY codigo_plantilla");
    assert.deepEqual(companies.rows.map((company) => company.codigo_plantilla), ["gtmedical", "meditec", "teknor"]);
    // Comprobar reejecucion dentro de la misma transaccion, sin conservar duplicados.
    await client.query(statements);
    assert.deepEqual(await snapshot(client), after, "La migracion no es reejecutable sin cambios");
    await client.query("COMMIT");
    return {
      base: config.database, reportes_conservados: after.reports.length,
      pdf_conservados: after.pdfs.length, proveedores_anteriores_conservados: before.providers.length,
      empresas_agregadas: after.providers.length - before.providers.length, reejecucion: "aprobada",
    };
  } catch (error) {
    if (client) await client.query("ROLLBACK").catch(() => null);
    throw error;
  } finally {
    client?.release();
    await pool.end();
  }
}

if (require.main === module) {
  require("dotenv").config();
  migrateReportTemplates(process.env).then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      // No imprimir URLs ni objetos de conexion con credenciales.
      console.error(error.code ? `Migracion no aplicada. Codigo PostgreSQL: ${error.code}` : error.message);
      process.exitCode = 1;
    });
}

module.exports = { migrationConnections, migrateReportTemplates };
