-- Roles de PostgreSQL, distintos de los roles funcionales de la tabla roles.
-- Requiere una cuenta con privilegio CREATEROLE.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'meditec_admin') THEN
        CREATE ROLE meditec_admin NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'meditec_generador') THEN
        CREATE ROLE meditec_generador NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'meditec_consulta') THEN
        CREATE ROLE meditec_consulta NOLOGIN;
    END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO meditec_admin, meditec_generador, meditec_consulta;

REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
REVOKE EXECUTE ON ALL PROCEDURES IN SCHEMA public FROM PUBLIC;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO meditec_admin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO meditec_admin;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO meditec_admin;
GRANT EXECUTE ON ALL PROCEDURES IN SCHEMA public TO meditec_admin;

GRANT SELECT ON servicios_solicitantes, proveedores, tecnicos, instituciones,
    reportes, archivos_pdf, reporte_tecnico, reporte_proveedor TO meditec_generador;
GRANT INSERT, UPDATE ON servicios_solicitantes, proveedores, tecnicos,
    instituciones, reportes, archivos_pdf, reporte_tecnico, reporte_proveedor
    TO meditec_generador;
GRANT INSERT ON auditoria_eventos TO meditec_generador;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO meditec_generador;
GRANT EXECUTE ON FUNCTION generar_codigo_reporte() TO meditec_generador;
GRANT EXECUTE ON PROCEDURE publicar_reporte(BIGINT, BIGINT) TO meditec_generador;
GRANT EXECUTE ON PROCEDURE reemplazar_pdf_reporte(BIGINT, TEXT, VARCHAR, BIGINT, BIGINT)
    TO meditec_generador;

GRANT SELECT ON vw_reportes_resumen TO meditec_consulta;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO meditec_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO meditec_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
