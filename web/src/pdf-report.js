const PDFDocument = require("pdfkit");

function line(doc, label, value, x, y, width = 240) {
  doc.font("Helvetica-Bold").fontSize(9).fillColor("#0068b5").text(label, x, y);
  doc.font("Helvetica").fillColor("#111827").text(value || "—", x, y + 13, { width });
}

function generateReportPdf(report) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "LETTER", margin: 38, info: { Title: report.codigo_reporte } });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.font("Helvetica-Bold").fontSize(22).fillColor("#0068b5").text(report.proveedor, 38, 38, { width: 250 });
    doc.fontSize(17).fillColor("#111827").text("REPORTE DE SERVICIO", 300, 44, { align: "right" });
    doc.fontSize(10).fillColor("#d00000").text(report.codigo_reporte, 400, 74, { align: "right" });
    doc.moveTo(38, 98).lineTo(574, 98).strokeColor("#9ca3af").stroke();

    line(doc, "FECHA", report.fecha_reporte, 38, 115);
    line(doc, "NUMERO DE PEDIDO Y NOG", report.numero_pedido_nog, 320, 115);
    line(doc, "NOMBRE DEL CLIENTE", report.institucion, 38, 160, 520);
    line(doc, "SERVICIO SOLICITANTE", report.servicio_solicitante, 38, 205, 520);
    line(doc, "DESCRIPCION DEL EQUIPO", report.descripcion_equipo, 38, 250, 520);
    line(doc, "MARCA", report.marca, 38, 295);
    line(doc, "MODELO", report.modelo, 320, 295);
    line(doc, "NUMERO DE SERIE", report.numero_serie, 38, 340);
    line(doc, "NUMERO DE BIEN", report.numero_bien, 320, 340);
    line(doc, "TIPO DE SERVICIO", report.tipo_servicio, 38, 385, 520);

    doc.rect(38, 430, 536, 18).fill("#d1d5db");
    doc.fillColor("#0068b5").font("Helvetica-Bold").fontSize(10).text("ESPECIFICACIONES TECNICAS", 38, 435, { width: 536, align: "center" });
    doc.fillColor("#111827").font("Helvetica").fontSize(10).text(report.especificaciones_tecnicas || "—", 45, 458, { width: 522, height: 75 });

    doc.rect(38, 542, 536, 18).fill("#d1d5db");
    doc.fillColor("#0068b5").font("Helvetica-Bold").fontSize(10).text("RECOMENDACIONES", 38, 547, { width: 536, align: "center" });
    doc.fillColor("#111827").font("Helvetica").fontSize(10).text(report.recomendaciones || "—", 45, 570, { width: 522, height: 70 });

    const signatures = ["SERVICIO TECNICO", "DEPARTAMENTO DE MANTENIMIENTO", "SERVICIO SOLICITANTE"];
    signatures.forEach((title, index) => {
      const x = 38 + index * 179;
      doc.moveTo(x + 15, 680).lineTo(x + 155, 680).strokeColor("#0068b5").stroke();
      doc.font("Helvetica-Bold").fontSize(7).fillColor("#0068b5").text(title, x, 688, { width: 170, align: "center" });
      doc.font("Helvetica").text("NOMBRE, FIRMA, SELLO", x, 701, { width: 170, align: "center" });
    });

    doc.fontSize(8).fillColor("#4b5563").text(report.pie_pagina || "", 38, 742, { width: 536, align: "center" });
    doc.end();
  });
}

module.exports = { generateReportPdf };
