require("dotenv").config();
const { Pool } = require("pg");

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL es obligatoria");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const checks = await pool.query(`
    SELECT
      to_regclass('public.equipos_medicos') IS NOT NULL AS equipos_medicos,
      to_regclass('public.vw_reportes_resumen') IS NOT NULL AS vista,
      to_regclass('public.usuario_proveedor') IS NOT NULL AS empresas_usuario,
      to_regclass('public.proveedor_institucion') IS NOT NULL AS empresas_institucion,
      to_regclass('public.proveedor_tecnico') IS NOT NULL AS empresas_tecnico,
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
      ) AS cambio_password,
      EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='reportes'
          AND column_name='observaciones'
      ) AS observaciones,
      EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='proveedores'
          AND column_name='codigo_plantilla'
      ) AS codigo_plantilla,
      EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='usuarios'
          AND column_name='usuario'
      ) AS usuario_acceso
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
      has_table_privilege(current_user, 'usuarios', 'UPDATE') AS editar_usuarios,
      has_table_privilege(current_user, 'reportes', 'UPDATE') AS editar_reportes,
      has_table_privilege(current_user, 'equipos_autorizados', 'UPDATE') AS editar_computadoras,
      has_table_privilege(current_user, 'equipos_autorizados', 'DELETE') AS eliminar_computadoras,
      has_table_privilege(current_user, 'reporte_tecnico', 'INSERT') AS asignar_tecnicos,
      has_table_privilege(current_user, 'reporte_tecnico', 'DELETE') AS reasignar_tecnicos,
      has_table_privilege(current_user, 'auditoria_eventos', 'SELECT') AS leer_auditoria,
      has_table_privilege(current_user, 'usuario_proveedor', 'DELETE') AS asignar_empresas_usuario,
      has_table_privilege(current_user, 'proveedor_institucion', 'INSERT') AS enlazar_instituciones,
      has_table_privilege(current_user, 'proveedor_tecnico', 'DELETE') AS asignar_empresas_tecnico
  `);
  const denied = Object.entries(access.rows[0]).filter(([, value]) => !value).map(([key]) => key);
  if (denied.length) throw new Error(`Permisos incompletos: ${denied.join(', ')}`);
  console.log("Base de Meditec lista y permisos web verificados");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(() => pool.end());
