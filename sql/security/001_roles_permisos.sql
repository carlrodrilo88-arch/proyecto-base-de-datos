-- Roles logicos de base de datos para separar responsabilidades.
-- Ajustar contrasenas y nombres de usuario segun el entorno real.

CREATE ROLE meditec_admin;
CREATE ROLE meditec_generador;
CREATE ROLE meditec_consulta;

GRANT USAGE ON SCHEMA public TO meditec_admin, meditec_generador, meditec_consulta;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO meditec_admin;
GRANT SELECT, INSERT, UPDATE ON servicios_solicitantes, proveedores, tecnicos, instituciones, reportes TO meditec_generador;
GRANT SELECT, INSERT, UPDATE ON archivos_pdf, reporte_tecnico, reporte_proveedor TO meditec_generador;
GRANT INSERT ON auditoria_eventos TO meditec_generador;
GRANT SELECT ON vw_reportes_resumen TO meditec_consulta;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO meditec_admin, meditec_generador;
