-- Archivo: sql/reset/001_reset_schema.sql
-- ADVERTENCIA: elimina permanentemente las tablas, datos y objetos dependientes
-- del proyecto Meditec. Usar solo para reconstruir un ambiente de pruebas.

BEGIN;

DROP VIEW IF EXISTS vw_reportes_resumen CASCADE;
DROP TABLE IF EXISTS auditoria_eventos CASCADE;
DROP TABLE IF EXISTS archivos_pdf CASCADE;
DROP TABLE IF EXISTS reporte_proveedor CASCADE;
DROP TABLE IF EXISTS reporte_tecnico CASCADE;
DROP TABLE IF EXISTS reportes CASCADE;
DROP TABLE IF EXISTS equipos_medicos CASCADE;
DROP TABLE IF EXISTS equipos_autorizados CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS proveedores CASCADE;
DROP TABLE IF EXISTS tecnicos CASCADE;
DROP TABLE IF EXISTS servicios_solicitantes CASCADE;
DROP TABLE IF EXISTS instituciones CASCADE;
DROP SEQUENCE IF EXISTS secuencia_codigo_reporte CASCADE;

COMMIT;
