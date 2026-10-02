-- Migra una base existente sin eliminar reportes ni catalogos.
-- Ejecutar una sola vez antes de iniciar la version web actualizada.

BEGIN;

ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS pie_pagina TEXT;
ALTER TABLE servicios_solicitantes ADD COLUMN IF NOT EXISTS id_institucion BIGINT;

-- Conserva la institucion usada historicamente por cada servicio.
UPDATE servicios_solicitantes ss
SET id_institucion = origen.id_institucion
FROM (
    SELECT DISTINCT ON (r.id_servicio_solicitante)
        r.id_servicio_solicitante,
        r.id_institucion
    FROM reportes r
    WHERE r.id_institucion IS NOT NULL
    ORDER BY r.id_servicio_solicitante, r.creado_en DESC, r.id_reporte DESC
) origen
WHERE origen.id_servicio_solicitante = ss.id_servicio_solicitante
  AND ss.id_institucion IS NULL;

UPDATE servicios_solicitantes
SET id_institucion = (
    SELECT id_institucion FROM instituciones
    WHERE activo = TRUE ORDER BY id_institucion LIMIT 1
)
WHERE id_institucion IS NULL;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM servicios_solicitantes WHERE id_institucion IS NULL) THEN
        RAISE EXCEPTION 'No se puede migrar: existe un servicio y no hay institucion disponible';
    END IF;
END
$$;

DROP VIEW IF EXISTS vw_reportes_resumen;
DROP INDEX IF EXISTS idx_reportes_institucion;

ALTER TABLE servicios_solicitantes
    ALTER COLUMN id_institucion SET NOT NULL,
    DROP COLUMN IF EXISTS telefono,
    DROP COLUMN IF EXISTS correo,
    DROP COLUMN IF EXISTS direccion;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_servicios_solicitantes_instituciones'
    ) THEN
        ALTER TABLE servicios_solicitantes
            ADD CONSTRAINT fk_servicios_solicitantes_instituciones
            FOREIGN KEY (id_institucion) REFERENCES instituciones(id_institucion)
            ON UPDATE CASCADE ON DELETE RESTRICT;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'uq_servicio_nombre_por_institucion'
    ) THEN
        ALTER TABLE servicios_solicitantes
            ADD CONSTRAINT uq_servicio_nombre_por_institucion
            UNIQUE (id_institucion, nombre);
    END IF;
END
$$;

ALTER TABLE reportes DROP COLUMN IF EXISTS id_institucion;

CREATE VIEW vw_reportes_resumen AS
SELECT
    r.id_reporte,
    r.codigo_reporte,
    r.titulo,
    r.fecha_reporte,
    r.estado,
    ss.nombre AS servicio_solicitante,
    i.nombre AS institucion,
    STRING_AGG(DISTINCT t.nombre, ', ') AS tecnicos,
    STRING_AGG(DISTINCT p.nombre, ', ') AS proveedores,
    u.nombre AS usuario_creador,
    ap.url_archivo,
    r.creado_en
FROM reportes r
JOIN servicios_solicitantes ss ON ss.id_servicio_solicitante = r.id_servicio_solicitante
JOIN instituciones i ON i.id_institucion = ss.id_institucion
LEFT JOIN reporte_tecnico rt ON rt.id_reporte = r.id_reporte
LEFT JOIN tecnicos t ON t.id_tecnico = rt.id_tecnico
LEFT JOIN reporte_proveedor rp ON rp.id_reporte = r.id_reporte
LEFT JOIN proveedores p ON p.id_proveedor = rp.id_proveedor
JOIN usuarios u ON u.id_usuario = r.id_usuario_creador
LEFT JOIN archivos_pdf ap ON ap.id_reporte = r.id_reporte AND ap.estado = 'activo'
GROUP BY r.id_reporte, r.codigo_reporte, r.titulo, r.fecha_reporte, r.estado,
    ss.nombre, i.nombre, u.nombre, ap.url_archivo, r.creado_en;

COMMIT;
