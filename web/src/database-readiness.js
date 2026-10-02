require("dotenv").config();
const { Pool } = require("pg");

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL es obligatoria");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const checks = await pool.query(`
    SELECT
      to_regclass('public.equipos_medicos') IS NOT NULL AS equipos_medicos,
      to_regclass('public.vw_reportes_resumen') IS NOT NULL AS vista,
      EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='reportes'
          AND column_name='id_proveedor_plantilla'
      ) AS proveedor_plantilla,
      EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='reportes'
          AND column_name='id_equipo_medico'
      ) AS equipo_en_reporte,
      EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='usuarios'
          AND column_name='debe_cambiar_password'
      ) AS cambio_password
  `);
  const result = checks.rows[0];
  const failed = Object.entries(result).filter(([, value]) => !value).map(([key]) => key);
  if (failed.length) throw new Error(`Base incompleta: ${failed.join(', ')}`);

  const access = await pool.query(`
    SELECT
      has_table_privilege(current_user, 'equipos_medicos', 'SELECT') AS leer_equipos,
      has_table_privilege(current_user, 'equipos_medicos', 'INSERT') AS crear_equipos,
      has_table_privilege(current_user, 'vw_reportes_resumen', 'SELECT') AS leer_vista,
      has_table_privilege(current_user, 'usuarios', 'INSERT') AS crear_usuarios,
      has_table_privilege(current_user, 'usuarios', 'UPDATE') AS editar_usuarios
  `);
  const denied = Object.entries(access.rows[0]).filter(([, value]) => !value).map(([key]) => key);
  if (denied.length) throw new Error(`Permisos incompletos: ${denied.join(', ')}`);
  console.log("Base de Entrega 3 lista y permisos web verificados");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(() => pool.end());
