// Datos completos de un reporte para generar su PDF.
// Los tecnicos asignados al reporte firman como servicio tecnico en el PDF.
async function loadReportDetail(id, db) {
  const result = await db.query(
    `SELECT r.*, TO_CHAR(r.fecha_reporte, 'DD/MM/YYYY') AS fecha_reporte_texto,
       ss.nombre AS servicio_solicitante, i.nombre AS institucion,
       p.nombre AS proveedor, p.codigo_plantilla, p.logo_url, p.pie_pagina,
       u.nombre AS creador,
       (SELECT STRING_AGG(t.nombre, ', ' ORDER BY t.nombre) FROM reporte_tecnico rt
          JOIN tecnicos t ON t.id_tecnico=rt.id_tecnico
        WHERE rt.id_reporte=r.id_reporte) AS tecnicos
     FROM reportes r
     JOIN servicios_solicitantes ss ON ss.id_servicio_solicitante=r.id_servicio_solicitante
     JOIN instituciones i ON i.id_institucion=ss.id_institucion
     JOIN proveedores p ON p.id_proveedor=r.id_proveedor_plantilla
     JOIN usuarios u ON u.id_usuario=r.id_usuario_creador
     WHERE r.id_reporte=$1`, [id]
  );
  const report = result.rows[0];
  if (report) report.fecha_reporte = report.fecha_reporte_texto;
  return report;
}

module.exports = { loadReportDetail };
