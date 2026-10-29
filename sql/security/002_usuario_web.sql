-- Archivo: sql/security/002_usuario_web.sql
-- Autor: Carlos Geovanni Lopez Rodriguez
-- Descripcion: Permisos minimos para el usuario de ejecucion de la aplicacion web.
-- Dependencias: sql/security/001_roles_permisos.sql y rol LOGIN meditec_web creado por un administrador.
-- Requiere que un administrador cree previamente el rol LOGIN meditec_web.
-- No almacena ni modifica la contrasena del rol.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'meditec_web') THEN
        RAISE EXCEPTION 'El rol meditec_web debe ser creado previamente por un administrador';
    END IF;
END
$$;

REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM meditec_web;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM meditec_web;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM meditec_web;
REVOKE EXECUTE ON ALL PROCEDURES IN SCHEMA public FROM meditec_web;

GRANT USAGE ON SCHEMA public TO meditec_web;

-- Autenticacion, catalogos y consulta documental disponibles en la web.
GRANT SELECT ON roles, usuarios, servicios_solicitantes, tecnicos,
    instituciones, proveedores, equipos_autorizados, equipos_medicos, reportes, archivos_pdf,
    reporte_proveedor, reporte_tecnico, vw_reportes_resumen,
    usuario_proveedor, proveedor_institucion, proveedor_tecnico
TO meditec_web;

-- La bitacora solo se consulta desde la web; la escriben los triggers (SECURITY DEFINER).
GRANT SELECT ON auditoria_eventos TO meditec_web;

-- La aplicacion implementa autorizacion por rol; la cuenta tecnica solo puede
-- escribir en los catalogos y documentos publicados en la web. Catalogos y
-- reportes se desactivan o anulan (UPDATE); solo se eliminan fisicamente las
-- constancias de computadoras y las asignaciones de tecnicos de un borrador,
-- que no conservan historial propio.
GRANT INSERT, UPDATE ON usuarios, servicios_solicitantes, tecnicos, instituciones,
    proveedores, equipos_medicos, reportes, archivos_pdf
TO meditec_web;
GRANT INSERT, UPDATE, DELETE ON equipos_autorizados TO meditec_web;
GRANT INSERT ON reporte_proveedor TO meditec_web;
GRANT INSERT, DELETE ON reporte_tecnico TO meditec_web;
-- Enlaces de empresa: el administrador los reasigna, por eso se reemplazan completos.
GRANT INSERT, DELETE ON usuario_proveedor, proveedor_institucion, proveedor_tecnico TO meditec_web;
GRANT USAGE, SELECT ON SEQUENCE
    servicios_solicitantes_id_servicio_solicitante_seq,
    usuarios_id_usuario_seq,
    tecnicos_id_tecnico_seq,
    instituciones_id_institucion_seq,
    proveedores_id_proveedor_seq,
    equipos_medicos_id_equipo_medico_seq,
    reportes_id_reporte_seq,
    archivos_pdf_id_archivo_pdf_seq,
    equipos_autorizados_id_equipo_autorizado_seq,
    secuencia_codigo_reporte
TO meditec_web;

GRANT EXECUTE ON FUNCTION generar_codigo_reporte() TO meditec_web;
GRANT EXECUTE ON PROCEDURE publicar_reporte(BIGINT, BIGINT) TO meditec_web;
GRANT EXECUTE ON PROCEDURE reemplazar_pdf_reporte(BIGINT, TEXT, VARCHAR, BIGINT, BIGINT)
TO meditec_web;
