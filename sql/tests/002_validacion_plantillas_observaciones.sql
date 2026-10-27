-- Archivo: sql/tests/002_validacion_plantillas_observaciones.sql
-- Autor: Carlos Geovanni Lopez Rodriguez
-- Descripcion: Validacion de esquema, identidad estable y restricciones de plantillas.
-- Dependencias: DDL actual o migracion 005. Ejecutar en base de pruebas.
-- Todas las modificaciones de prueba se revierten al terminar.

BEGIN;

DO $$
DECLARE
    codigo_conservado TEXT;
    rechazo_check BOOLEAN := FALSE;
    rechazo_unique BOOLEAN := FALSE;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'reportes' AND column_name = 'observaciones'
    ) OR EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'reportes' AND column_name = 'descripcion'
    ) THEN
        RAISE EXCEPTION 'El campo de observaciones no corresponde al esquema actual';
    END IF;

    IF (SELECT ARRAY_AGG(codigo_plantilla ORDER BY codigo_plantilla)
        FROM proveedores WHERE codigo_plantilla IS NOT NULL)
        IS DISTINCT FROM ARRAY['gtmedical', 'meditec', 'teknor']::VARCHAR[] THEN
        RAISE EXCEPTION 'Deben existir exactamente los tres codigos de plantilla';
    END IF;

    UPDATE proveedores SET nombre = 'Nombre temporal de prueba'
    WHERE codigo_plantilla = 'teknor';
    SELECT codigo_plantilla INTO codigo_conservado
    FROM proveedores WHERE nombre = 'Nombre temporal de prueba';
    IF codigo_conservado IS DISTINCT FROM 'teknor' THEN
        RAISE EXCEPTION 'El cambio de nombre altero la identidad de la plantilla';
    END IF;

    BEGIN
        UPDATE proveedores SET codigo_plantilla = 'no-permitido'
        WHERE codigo_plantilla = 'teknor';
    EXCEPTION WHEN check_violation THEN
        rechazo_check := TRUE;
    END;
    IF NOT rechazo_check THEN
        RAISE EXCEPTION 'Se acepto un codigo de plantilla desconocido';
    END IF;

    BEGIN
        UPDATE proveedores SET codigo_plantilla = 'meditec'
        WHERE codigo_plantilla = 'teknor';
    EXCEPTION WHEN unique_violation THEN
        rechazo_unique := TRUE;
    END;
    IF NOT rechazo_unique THEN
        RAISE EXCEPTION 'Se permitio asignar una plantilla a dos empresas';
    END IF;
END
$$;

ROLLBACK;
