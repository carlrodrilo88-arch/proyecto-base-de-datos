const path = require("path");
const PDFDocument = require("pdfkit");
const { resolveReportTemplate } = require("./report-templates");

const LEFT = 38;
const WIDTH = 536;
const SERVICE_TYPES = [
  ["garantia", "GARANTIA"], ["preventivo", "MANTENIMIENTO\nPREVENTIVO"],
  ["correctivo", "MANTENIMIENTO\nCORRECTIVO"],
  ["emergencia", "LLAMADA DE\nEMERGENCIA"], ["otros", "OTROS"],
];

function logoPath(logo) {
  return path.join(__dirname, "..", "public", logo);
}

function drawPage(doc, template, report, continuation) {
  doc.save();
  if (template.key === "gtmedical") {
    doc.path("M 165 0 L 612 0 L 612 245 Z").fill("#c9e7a5");
    doc.path("M 260 0 L 612 0 L 612 170 Z").fill("#80c9a3");
    doc.path("M 0 650 Q 190 790 465 792 L 0 792 Z").fill("#dfedf8");
    doc.path("M 0 700 Q 145 785 295 792 L 0 792 Z").fill("#80b6db");
  }
  if (template.key === "teknor") {
    doc.opacity(0.075).image(logoPath("/logos/teknor-watermark.png"), 135, 245, { width: 340 });
    doc.opacity(1);
  }
  if (template.logo) {
    const meditec = template.key === "meditec";
    doc.image(logoPath(template.logo), meditec ? 365 : LEFT, 32,
      { fit: meditec ? [195, 76] : [205, 82] });
  } else {
    doc.font("Helvetica-Bold").fontSize(20).fillColor(template.color)
      .text(template.name, LEFT, 38, { width: 240, lineBreak: false });
  }
  const meditec = template.key === "meditec";
  doc.font(template.key === "teknor" ? "Times-Bold" : "Helvetica-Bold")
    .fontSize(17).fillColor(template.key === "teknor" ? "#111111" : template.color)
    .text("REPORTE DE SERVICIO", meditec ? LEFT : 260, 58,
      { width: meditec ? 270 : 314, align: meditec ? "left" : "right", lineBreak: false });
  doc.font("Helvetica-Bold").fontSize(9).fillColor("#d00000")
    .text(report.codigo_reporte || "VISTA PREVIA DE PLANTILLA", LEFT, 105,
      { width: WIDTH, align: "right", lineBreak: false });
  if (continuation) {
    doc.font("Helvetica").fontSize(8).fillColor(template.color)
      .text("Continuacion del reporte", LEFT, 105, { lineBreak: false });
  }
  if (template.footer) {
    drawFooter(doc, template);
  } else {
    doc.font("Helvetica").fontSize(7).fillColor("#345478")
      .text(report.pie_pagina || `${template.name} · Reporte de servicio`, LEFT, 746,
        { width: WIDTH, height: 28, align: "center" });
  }
  doc.restore();
  doc.font("Helvetica").fontSize(10).fillColor("#111111");
  doc.x = LEFT;
  doc.y = 125;
}

// Pie fijo de la empresa: identidad a la izquierda y contacto a la derecha.
function drawFooter(doc, template) {
  const y = 682;
  doc.font("Helvetica-Bold").fontSize(7.5).fillColor(template.color)
    .text(template.footer.left.join("\n"), LEFT, y, { width: 240, align: "center", lineGap: 2 })
    .text(template.footer.right.join("\n"), LEFT + WIDTH - 280, y, { width: 280, align: "right", lineGap: 2 });
}

function field(doc, template, label, value, x, y, width = WIDTH) {
  doc.font("Helvetica-Bold").fontSize(8).fillColor(template.color)
    .text(label, x, y, { width, lineBreak: false });
  doc.font("Helvetica").fontSize(10).fillColor("#111111");
  const text = String(value || "—");
  const height = doc.heightOfString(text, { width, align: "center" });
  doc.text(text, x, y + 14, { width, align: "center" });
  return y + 14 + height + 12;
}

function fittedFontSize(doc, text, width, height, label) {
  for (let size = 10; size >= 7; size -= 0.5) {
    doc.font("Helvetica").fontSize(size);
    if (doc.heightOfString(text, { width, lineGap: 1 }) <= height) return size;
  }
  const error = new Error(`${label} es demasiado extenso para el formato de una hoja. Resuma el contenido antes de publicar.`);
  error.status = 400;
  throw error;
}

function section(doc, template, label, value, y, height) {
  if (template.key === "teknor") {
    doc.rect(LEFT, y, WIDTH, 18).fill("#aaaaaa");
  }
  doc.font("Helvetica-Bold").fontSize(9).fillColor(template.color)
    .text(label, LEFT + 5, y + 4,
      { width: WIDTH - 10, align: template.key === "teknor" ? "center" : "left" });
  const text = String(value || "—");
  const textHeight = height - 24;
  const size = fittedFontSize(doc, text, WIDTH - 10, textHeight, label);
  doc.font("Helvetica").fontSize(size).fillColor("#111111")
    .text(text, LEFT + 5, y + 20, {
      width: WIDTH - 10, height: textHeight, lineGap: 1,
    });
}

function drawSignatures(doc, template) {
  template.signatures.forEach((title, index) => {
    const x = LEFT + index * 179;
    const y = 610 + (template.staggerSignatures && index === 1 ? 14 : 0);
    doc.moveTo(x + 10, y).lineTo(x + 159, y).strokeColor(template.color).stroke();
    doc.font("Helvetica-Bold").fontSize(7).fillColor(template.color)
      .text(title, x, y + 8, { width: 169, align: "center" });
    doc.font("Helvetica").fontSize(7)
      .text(template.signatureNote || "NOMBRE, FIRMA Y SELLO", x, y + 30, { width: 169, align: "center" });
  });
}

function generateReportPdf(report) {
  return new Promise((resolve, reject) => {
    const template = resolveReportTemplate(report.proveedor, report.codigo_plantilla);
    const doc = new PDFDocument({
      size: "LETTER", margins: { top: 125, right: LEFT, bottom: 110, left: LEFT },
      info: { Title: report.codigo_reporte || "Vista previa", Subject: `Plantilla ${template.name}` },
    });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    try {
       // El formato contractual es de una sola hoja; no se crean continuaciones.
       const decorate = () => {
         const bottom = doc.page.margins.bottom;
         doc.page.margins.bottom = 0;
         drawPage(doc, template, report, false);
         doc.page.margins.bottom = bottom;
       };
       decorate();
      let y = field(doc, template, "FECHA", report.fecha_reporte, LEFT, 130, 240);
      if (template.pedido) {
        y = Math.max(y, field(doc, template, "NUMERO DE PEDIDO Y NOG", report.numero_pedido_nog, 320, 130, 254));
      }
      y = field(doc, template, "NOMBRE DEL CLIENTE / INSTITUCION", report.institucion, LEFT, y);
      y = field(doc, template, "SERVICIO SOLICITANTE", report.servicio_solicitante, LEFT, y);
      y = field(doc, template, "DESCRIPCION DEL EQUIPO", report.descripcion_equipo, LEFT, y);
      y = Math.max(field(doc, template, "MARCA", report.marca, LEFT, y, 240),
        field(doc, template, "MODELO", report.modelo, 320, y, 254));
      y = Math.max(field(doc, template, "NUMERO DE SERIE", report.numero_serie, LEFT, y, 240),
        field(doc, template, "NUMERO DE BIEN", report.numero_bien, 320, y, 254));
      if (template.key === "meditec") {
        SERVICE_TYPES.forEach(([key, label], index) => {
          const x = LEFT + index * 108;
          doc.circle(x + 48, y + 6, 5).strokeColor(template.color).stroke();
          if (report.tipo_servicio === key) doc.circle(x + 48, y + 6, 2.5).fill(template.color);
          doc.font("Helvetica-Bold").fontSize(7).fillColor(template.color)
            .text(label, x, y + 18, { width: 102, align: "center" });
        });
        y += 53;
      }
       if (y > 430) {
         throw Object.assign(new Error("Los datos generales son demasiado extensos para el formato de una hoja."), { status: 400 });
       }
       const sectionsTop = Math.max(y + 4, 390);
       const available = 590 - sectionsTop;
       const specificationsHeight = Math.floor(available * 0.58);
       const recommendationsHeight = available - specificationsHeight;
       section(doc, template, "ESPECIFICACIONES TECNICAS", report.especificaciones_tecnicas,
         sectionsTop, specificationsHeight);
       section(doc, template, "RECOMENDACIONES", report.recomendaciones,
         sectionsTop + specificationsHeight, recommendationsHeight);
       drawSignatures(doc, template);
      doc.end();
    } catch (error) {
      reject(error);
      doc.destroy();
    }
  });
}

module.exports = { generateReportPdf };
