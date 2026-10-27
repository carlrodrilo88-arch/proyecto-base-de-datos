-- Archivo: sql/migrations/005_plantillas_observaciones.sql
-- Autor: Carlos Geovanni Lopez Rodriguez
-- Descripcion: Identidad estable de plantillas y observaciones de reportes.
-- Dependencias: Esquema de Meditec actualizado hasta migracion 004.
-- Ejecutar como propietario de proveedores y reportes. No elimina datos.
-- Reejecutable; la transaccion se revierte completa si encuentra un conflicto.

BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL search_path = public, pg_temp;

ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS codigo_plantilla VARCHAR(20);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'proveedores'::regclass AND conname = 'chk_proveedores_codigo_plantilla'
    ) THEN
        ALTER TABLE proveedores ADD CONSTRAINT chk_proveedores_codigo_plantilla
            CHECK (codigo_plantilla IN ('teknor', 'meditec', 'gtmedical'));
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'proveedores'::regclass AND conname = 'uq_proveedores_codigo_plantilla'
    ) THEN
        ALTER TABLE proveedores ADD CONSTRAINT uq_proveedores_codigo_plantilla
            UNIQUE (codigo_plantilla);
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'reportes' AND column_name = 'descripcion'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'reportes' AND column_name = 'observaciones'
        ) THEN
            RAISE EXCEPTION 'Existen descripcion y observaciones; revisar los datos antes de migrar';
        END IF;
        ALTER TABLE reportes RENAME COLUMN descripcion TO observaciones;
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'reportes' AND column_name = 'observaciones'
    ) THEN
        RAISE EXCEPTION 'No existe el campo de observaciones ni su nombre anterior';
    END IF;
END
$$;

-- Relaciona las empresas ya existentes sin cambiar su nombre o estado.
UPDATE proveedores p
SET codigo_plantilla = empresa.clave
FROM (VALUES ('teknor'), ('meditec'), ('gtmedical')) AS empresa(clave)
WHERE p.codigo_plantilla IS NULL
  AND LOWER(REGEXP_REPLACE(p.nombre, '[^a-zA-Z0-9]', '', 'g')) = empresa.clave;

INSERT INTO proveedores (nombre, codigo_plantilla)
SELECT empresa.nombre, empresa.clave
FROM (VALUES ('Teknor', 'teknor'), ('Meditec', 'meditec'), ('GT Medical', 'gtmedical'))
    AS empresa(nombre, clave)
WHERE NOT EXISTS (SELECT 1 FROM proveedores p WHERE p.codigo_plantilla = empresa.clave);

COMMENT ON COLUMN proveedores.codigo_plantilla IS
    'Identificador estable del formato; NULL para proveedores sin plantilla de empresa prestadora.';
COMMENT ON COLUMN reportes.observaciones IS
    'Observaciones adicionales del reporte; conserva el contenido del antiguo campo descripcion.';
COMMENT ON COLUMN reportes.id_proveedor_plantilla IS
    'Empresa que presto el servicio y cuya plantilla se utiliza para el reporte.';

COMMIT;
