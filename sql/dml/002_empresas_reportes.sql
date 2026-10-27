-- Archivo: sql/dml/002_empresas_reportes.sql
-- Autor: Carlos Geovanni Lopez Rodriguez
-- Descripcion: Registra las tres empresas prestadoras con plantillas de reporte.
-- Dependencias: DDL actual o migracion 005. Ejecutar como administrador de la BD.
-- No renombra proveedores existentes ni modifica reportes o sus relaciones.

BEGIN;

UPDATE proveedores p
SET codigo_plantilla = empresa.clave
FROM (VALUES ('teknor'), ('meditec'), ('gtmedical')) AS empresa(clave)
WHERE p.codigo_plantilla IS NULL
  AND LOWER(REGEXP_REPLACE(p.nombre, '[^a-zA-Z0-9]', '', 'g')) = empresa.clave;

INSERT INTO proveedores (nombre, codigo_plantilla)
SELECT empresa.nombre, empresa.clave
FROM (VALUES ('Teknor', 'teknor'), ('Meditec', 'meditec'), ('GT Medical', 'gtmedical'))
    AS empresa(nombre, clave)
WHERE NOT EXISTS (
    SELECT 1 FROM proveedores p
    WHERE p.codigo_plantilla = empresa.clave
);

COMMIT;
