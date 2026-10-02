-- Archivo: sql/queries/001_consultas_entrega3.sql
-- Descripcion: Consultas principales para demostrar los requisitos de Entrega 3.
-- Dependencias: esquema, seed y vista de resumen.

-- Q01. Buscar un reporte por su codigo unico.
SELECT *
FROM vw_reportes_resumen
WHERE codigo_reporte = 'REP-2026-000001';

-- Q02. Filtrar reportes por servicio solicitante.
SELECT *
FROM vw_reportes_resumen
WHERE servicio_solicitante = 'Area de mantenimiento'
ORDER BY fecha_reporte DESC;

-- Q03. Filtrar reportes por institucion.
SELECT *
FROM vw_reportes_resumen
WHERE institucion = 'Hospital Central'
ORDER BY fecha_reporte DESC;

-- Q04. Filtrar reportes por tecnico sin buscar dentro de un texto agregado.
SELECT DISTINCT v.*
FROM vw_reportes_resumen v
JOIN reporte_tecnico rt ON rt.id_reporte = v.id_reporte
JOIN tecnicos t ON t.id_tecnico = rt.id_tecnico
WHERE t.correo = 'carlos.lopez@meditec.local'
ORDER BY v.fecha_reporte DESC;

-- Q05. Filtrar reportes por proveedor.
SELECT DISTINCT v.*
FROM vw_reportes_resumen v
JOIN reporte_proveedor rp ON rp.id_reporte = v.id_reporte
JOIN proveedores p ON p.id_proveedor = rp.id_proveedor
WHERE p.nit = '1000001-1'
ORDER BY v.fecha_reporte DESC;

-- Q06. Filtrar reportes por rango de fechas, incluyendo los extremos.
SELECT *
FROM vw_reportes_resumen
WHERE fecha_reporte BETWEEN DATE '2026-09-01' AND DATE '2026-09-30'
ORDER BY fecha_reporte DESC;

-- Q07. Filtrar reportes por estado.
SELECT *
FROM vw_reportes_resumen
WHERE estado = 'publicado'
ORDER BY fecha_reporte DESC;

-- Q08. Consultar reportes que tienen un PDF activo asociado.
SELECT
    r.codigo_reporte,
    r.titulo,
    ap.url_archivo,
    ap.tamano_bytes,
    ap.fecha_carga
FROM reportes r
JOIN archivos_pdf ap ON ap.id_reporte = r.id_reporte
WHERE ap.estado = 'activo'
ORDER BY ap.fecha_carga DESC;

-- Q09. Consultar reportes que todavia no tienen PDF activo.
SELECT r.codigo_reporte, r.titulo, r.estado
FROM reportes r
WHERE NOT EXISTS (
    SELECT 1
    FROM archivos_pdf ap
    WHERE ap.id_reporte = r.id_reporte
      AND ap.estado = 'activo'
)
ORDER BY r.fecha_reporte DESC;

-- Q10. Mostrar el resumen completo proporcionado por la vista.
SELECT *
FROM vw_reportes_resumen
ORDER BY fecha_reporte DESC, codigo_reporte;

-- Q11. Consultar los eventos de auditoria de un reporte.
SELECT
    ae.fecha_evento,
    ae.accion,
    ae.detalle,
    ae.ip_origen,
    u.nombre AS usuario
FROM auditoria_eventos ae
LEFT JOIN usuarios u ON u.id_usuario = ae.id_usuario
JOIN reportes r
    ON ae.entidad = 'reportes'
   AND ae.entidad_id = r.id_reporte
WHERE r.codigo_reporte = 'REP-2026-000001'
ORDER BY ae.fecha_evento DESC;

-- Q12. Contar reportes agrupados por estado.
SELECT estado, COUNT(*) AS cantidad_reportes
FROM reportes
GROUP BY estado
ORDER BY estado;

-- Q13. Contar reportes agrupados por institucion.
SELECT
    COALESCE(i.nombre, 'Sin institucion') AS institucion,
    COUNT(*) AS cantidad_reportes
FROM reportes r
JOIN servicios_solicitantes ss ON ss.id_servicio_solicitante = r.id_servicio_solicitante
JOIN instituciones i ON i.id_institucion = ss.id_institucion
GROUP BY i.nombre
ORDER BY cantidad_reportes DESC, institucion;

-- Q14. Detallar los tecnicos asociados a cada reporte.
SELECT
    r.codigo_reporte,
    t.nombre AS tecnico,
    rt.rol_en_reporte
FROM reportes r
JOIN reporte_tecnico rt ON rt.id_reporte = r.id_reporte
JOIN tecnicos t ON t.id_tecnico = rt.id_tecnico
ORDER BY r.codigo_reporte, t.nombre;

-- Q15. Detallar los proveedores asociados a cada reporte.
SELECT
    r.codigo_reporte,
    p.nombre AS proveedor,
    rp.observacion
FROM reportes r
JOIN reporte_proveedor rp ON rp.id_reporte = r.id_reporte
JOIN proveedores p ON p.id_proveedor = rp.id_proveedor
ORDER BY r.codigo_reporte, p.nombre;

-- Q16. Consultar el historial completo de versiones PDF de un reporte.
SELECT
    r.codigo_reporte,
    ap.id_archivo_pdf,
    ap.url_archivo,
    ap.estado,
    ap.fecha_carga
FROM reportes r
JOIN archivos_pdf ap ON ap.id_reporte = r.id_reporte
WHERE r.codigo_reporte = 'REP-2026-000001'
ORDER BY ap.fecha_carga DESC, ap.id_archivo_pdf DESC;
