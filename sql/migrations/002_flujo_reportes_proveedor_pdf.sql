-- Agrega proveedor de plantilla y datos tecnicos conservando reportes existentes.
BEGIN;

ALTER TABLE reportes ADD COLUMN IF NOT EXISTS id_proveedor_plantilla BIGINT;
ALTER TABLE reportes ADD COLUMN IF NOT EXISTS numero_pedido_nog VARCHAR(80);
ALTER TABLE reportes ADD COLUMN IF NOT EXISTS descripcion_equipo VARCHAR(240);
ALTER TABLE reportes ADD COLUMN IF NOT EXISTS marca VARCHAR(100);
ALTER TABLE reportes ADD COLUMN IF NOT EXISTS modelo VARCHAR(100);
ALTER TABLE reportes ADD COLUMN IF NOT EXISTS numero_serie VARCHAR(100);
ALTER TABLE reportes ADD COLUMN IF NOT EXISTS numero_bien VARCHAR(100);
ALTER TABLE reportes ADD COLUMN IF NOT EXISTS tipo_servicio VARCHAR(40);
ALTER TABLE reportes ADD COLUMN IF NOT EXISTS especificaciones_tecnicas TEXT;
ALTER TABLE reportes ADD COLUMN IF NOT EXISTS recomendaciones TEXT;

UPDATE reportes r
SET id_proveedor_plantilla = origen.id_proveedor
FROM (
    SELECT DISTINCT ON (id_reporte) id_reporte, id_proveedor
    FROM reporte_proveedor ORDER BY id_reporte, id_proveedor
) origen
WHERE origen.id_reporte = r.id_reporte
  AND r.id_proveedor_plantilla IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_reportes_proveedor_plantilla') THEN
        ALTER TABLE reportes ADD CONSTRAINT fk_reportes_proveedor_plantilla
            FOREIGN KEY (id_proveedor_plantilla) REFERENCES proveedores(id_proveedor)
            ON UPDATE CASCADE ON DELETE RESTRICT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='chk_reportes_tipo_servicio') THEN
        ALTER TABLE reportes ADD CONSTRAINT chk_reportes_tipo_servicio
            CHECK (tipo_servicio IS NULL OR tipo_servicio IN
                ('garantia', 'preventivo', 'correctivo', 'emergencia', 'otros'));
    END IF;
END
$$;

DROP VIEW IF EXISTS vw_reportes_resumen;

CREATE VIEW vw_reportes_resumen AS
SELECT r.id_reporte, r.codigo_reporte, r.titulo, r.fecha_reporte, r.estado,
    ss.nombre AS servicio_solicitante, i.nombre AS institucion,
    pp.nombre AS proveedor_plantilla,
    STRING_AGG(DISTINCT t.nombre, ', ') AS tecnicos,
    STRING_AGG(DISTINCT p.nombre, ', ') AS proveedores,
    u.nombre AS usuario_creador, ap.url_archivo, r.creado_en
FROM reportes r
JOIN servicios_solicitantes ss ON ss.id_servicio_solicitante=r.id_servicio_solicitante
JOIN instituciones i ON i.id_institucion=ss.id_institucion
LEFT JOIN proveedores pp ON pp.id_proveedor=r.id_proveedor_plantilla
LEFT JOIN reporte_tecnico rt ON rt.id_reporte=r.id_reporte
LEFT JOIN tecnicos t ON t.id_tecnico=rt.id_tecnico
LEFT JOIN reporte_proveedor rp ON rp.id_reporte=r.id_reporte
LEFT JOIN proveedores p ON p.id_proveedor=rp.id_proveedor
JOIN usuarios u ON u.id_usuario=r.id_usuario_creador
LEFT JOIN archivos_pdf ap ON ap.id_reporte=r.id_reporte AND ap.estado='activo'
GROUP BY r.id_reporte, r.codigo_reporte, r.titulo, r.fecha_reporte, r.estado,
    ss.nombre, i.nombre, pp.nombre, u.nombre, ap.url_archivo, r.creado_en;

COMMIT;
