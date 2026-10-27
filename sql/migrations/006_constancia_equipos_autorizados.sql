-- Archivo: sql/migrations/006_constancia_equipos_autorizados.sql
-- Autor: Carlos Geovanni Lopez Rodriguez
-- Descripcion: Convierte equipos_autorizados en un registro inactivo de constancia.
-- Dependencias: sql/migrations/005_plantillas_observaciones.sql

BEGIN;

ALTER TABLE equipos_autorizados
    ALTER COLUMN activo SET DEFAULT FALSE;

UPDATE equipos_autorizados
SET activo = FALSE
WHERE activo = TRUE;

COMMIT;
