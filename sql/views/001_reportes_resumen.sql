CREATE OR REPLACE VIEW vw_reportes_resumen AS
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
JOIN servicios_solicitantes ss
    ON ss.id_servicio_solicitante = r.id_servicio_solicitante
LEFT JOIN instituciones i
    ON i.id_institucion = r.id_institucion
LEFT JOIN reporte_tecnico rt
    ON rt.id_reporte = r.id_reporte
LEFT JOIN tecnicos t
    ON t.id_tecnico = rt.id_tecnico
LEFT JOIN reporte_proveedor rp
    ON rp.id_reporte = r.id_reporte
LEFT JOIN proveedores p
    ON p.id_proveedor = rp.id_proveedor
JOIN usuarios u
    ON u.id_usuario = r.id_usuario_creador
LEFT JOIN archivos_pdf ap
    ON ap.id_reporte = r.id_reporte
GROUP BY
    r.id_reporte,
    r.codigo_reporte,
    r.titulo,
    r.fecha_reporte,
    r.estado,
    ss.nombre,
    i.nombre,
    u.nombre,
    ap.url_archivo,
    r.creado_en;
