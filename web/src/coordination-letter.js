// Carta de coordinacion de un mantenimiento (una hoja carta) con la plantilla de cada empresa.
// Los textos fijos reproducen el formato que se entrega a la institucion; solo cambian los datos
// de la coordinacion: fecha, institucion, destinatario, descripcion, OC, NOG, fechas y personal.
const path = require("path");
const PDFDocument = require("pdfkit");

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const LEFT = 72;
const WIDTH = PAGE_WIDTH - LEFT * 2;
const TEXT_COLOR = "#111111";

const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto",
  "septiembre", "octubre", "noviembre", "diciembre"];
const WEEKDAYS = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
const WEEKDAYS_ES = { miercoles: "miércoles", sabado: "sábado" };

const GREETING = "Reciban un cordial saludo, por medio del presente documento hago referencia a los trabajos de ";
const HOURS = "en los horarios de 8:00 am a 4:00 pm. Adjunto listado del personal técnico a cargo del mantenimiento.";
const ORDER_SUFFIX = ", No. de Pedido 550/2026 Renglón 163.";

// Firma: imagenes opcionales (privadas, fuera de /public), nombre y cargo impresos bajo la linea.
const LETTER_TEMPLATES = {
  meditec: {
    color: "#1f6fb8",
    headline: ["ASISTENCIA TÉCNICA", "INDUSTRIAL Y BIOMÉDICA"],
    logo: { file: "assets/cartas/meditec-isotipo.png", x: 452, y: 42, fit: [96, 108] },
    company: {
      nit: "1731427-5",
      direccion: "5 calle A 16-62 zona 6, Ciudad de Guatemala",
      telefono: "2293-0161, 5690-2338",
      correo: "ventas@meditecgt.com",
    },
    signature: {
      name: "MERY CASTILLO", title: "REPRESENTANTE DE VENTAS",
      images: [
        { file: "assets/cartas/meditec-firma.png", dx: -96, dy: -54, fit: [140, 58] },
        { file: "assets/cartas/meditec-sello.png", dx: 36, dy: -68, fit: [64, 66] },
      ],
    },
    brandMark: { file: "assets/cartas/meditec-marca.png", x: 432, y: 664, fit: [130, 42] },
    footer: [
      { icon: "assets/cartas/icono-ubicacion.png", text: "5ta Calle A 16-62 zona 6, Guatemala" },
      { icon: "assets/cartas/icono-correo.png", text: "Emergencias 24Hrs: 5690-2338" },
      { icon: "assets/cartas/icono-telefono.png", text: "ventas@meditecgt.com" },
    ],
  },
  teknor: {
    color: "#0074b9",
    logo: { file: "public/logos/teknor.png", x: LEFT, y: 36, fit: [170, 64] },
    watermark: { file: "public/logos/teknor-watermark.png", x: 160, y: 250, width: 300 },
    signature: {
      name: "AXEL OTONIEL IXPATA CAPRIEL", title: "TEKNOR",
      images: [{ file: "assets/cartas/teknor-firma.png", dx: -95, dy: -62, fit: [190, 60] }],
    },
    footerImage: "public/logos/teknor-pie.png",
  },
  gtmedical: {
    color: "#2f7fb5",
    accent: "#3e9b6a",
    logo: { file: "public/logos/gt-medical.png", x: LEFT, y: 34, fit: [150, 80] },
    headline: ["EQUIPO MÉDICO Y SERVICIO TÉCNICO"], headlineAlign: "right",
    decorate: true,
    signature: { name: "GT MEDICAL", title: "DEPARTAMENTO DE SERVICIO TÉCNICO", images: [] },
  },
};

function asset(file) {
  return path.join(__dirname, "..", file);
}

function letterError(message) {
  return Object.assign(new Error(message), { status: 400 });
}

function parts(iso) {
  const [year, month, day] = String(iso).split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return { year, month, day, weekday: WEEKDAYS_ES[weekday] || weekday };
}

const two = (value) => String(value).padStart(2, "0");
const withPeriod = (text) => (/[.!?]$/.test(text) ? text : `${text}.`);

// "04 de septiembre de 2,026": el formato de la carta escribe el anio con separador de miles.
function letterDate(iso) {
  const { year, month, day } = parts(iso);
  return `${two(day)} de ${MONTHS[month - 1]} de ${year.toLocaleString("en-US")}`;
}

// "del martes 08 al lunes 14 de septiembre del presente año (05 días hábiles)"
function workPeriod(startIso, endIso, businessDays, letterIso) {
  const start = parts(startIso);
  const end = parts(endIso);
  const letterYear = parts(letterIso).year;
  const days = `(${two(businessDays)} ${businessDays === 1 ? "día hábil" : "días hábiles"})`;
  if (start.year !== end.year || start.year !== letterYear) {
    return `del ${start.weekday} ${two(start.day)} de ${MONTHS[start.month - 1]} de ${start.year} `
      + `al ${end.weekday} ${two(end.day)} de ${MONTHS[end.month - 1]} de ${end.year} ${days}`;
  }
  const startText = start.month === end.month
    ? `${start.weekday} ${two(start.day)}`
    : `${start.weekday} ${two(start.day)} de ${MONTHS[start.month - 1]}`;
  if (startIso === endIso) {
    return `el ${startText} de ${MONTHS[end.month - 1]} del presente año ${days}`;
  }
  return `del ${startText} al ${end.weekday} ${two(end.day)} de ${MONTHS[end.month - 1]} del presente año ${days}`;
}

// "2566 31409 0901"
function formatDpi(dpi) {
  const digits = String(dpi || "").replace(/\D/g, "");
  return digits.length === 13 ? `${digits.slice(0, 4)} ${digits.slice(4, 9)} ${digits.slice(9)}` : String(dpi || "");
}

function companyLines(template, company = {}) {
  const data = { ...company, ...(template.company || {}) };
  return [
    data.nit && `NIT: ${data.nit}`,
    data.direccion && `Dirección Oficinas Centrales: ${data.direccion}`,
    data.telefono && `Teléfonos: ${data.telefono}`,
    data.correo && `Correo Electrónico: ${data.correo}`,
  ].filter(Boolean);
}

// Reglas de la carta: al menos un tecnico y todos con DPI registrado.
function assertLetterData(letter) {
  if (!letter.tecnicos?.length) {
    throw letterError("Asigne al menos un tecnico a la coordinacion para generar la carta");
  }
  const withoutDpi = letter.tecnicos.filter((item) => !item.dpi).map((item) => item.nombre);
  if (withoutDpi.length) {
    throw letterError(`Registre el DPI de: ${withoutDpi.join(", ")} (catalogo de Tecnicos)`);
  }
  if (!letter.numero_oc || !letter.numero_nog) {
    throw letterError("Registre la orden de compra (OC) y el NOG de la coordinacion para generar la carta");
  }
}

function drawDecorations(doc, template) {
  if (template.watermark) {
    const mark = template.watermark;
    doc.save().opacity(0.07).image(asset(mark.file), mark.x, mark.y, { width: mark.width }).restore();
  }
  if (template.decorate) {
    doc.save();
    doc.path(`M 300 0 L ${PAGE_WIDTH} 0 L ${PAGE_WIDTH} 150 Z`).fill("#d7ecbf");
    doc.path(`M 400 0 L ${PAGE_WIDTH} 0 L ${PAGE_WIDTH} 96 Z`).fill("#8fcfaa");
    doc.path(`M 0 690 Q 180 780 430 ${PAGE_HEIGHT} L 0 ${PAGE_HEIGHT} Z`).fill("#e3eff9");
    doc.path(`M 0 730 Q 130 785 270 ${PAGE_HEIGHT} L 0 ${PAGE_HEIGHT} Z`).fill("#8dbde0");
    doc.restore();
  }
}

function drawHeader(doc, template) {
  const { logo } = template;
  if (logo) doc.image(asset(logo.file), logo.x, logo.y, { fit: logo.fit });
  if (template.headline) {
    doc.font("Helvetica-Bold").fontSize(11).fillColor(template.color)
      .text(template.headline.join("\n"), LEFT, template.headlineAlign === "right" ? 112 : 92,
        { width: WIDTH, align: template.headlineAlign || "center", lineGap: 1 });
  }
}

function drawFooter(doc, template, company) {
  if (template.footerImage) {
    doc.image(asset(template.footerImage), 30, footerTop(doc, template), { width: PAGE_WIDTH - 60 });
    return;
  }
  const y = PAGE_HEIGHT - 52;
  doc.font("Helvetica-Bold").fontSize(7.5).fillColor(template.color);
  if (template.footer) {
    const columnWidth = (PAGE_WIDTH - 80) / template.footer.length;
    template.footer.forEach((item, index) => {
      const x = 40 + index * columnWidth;
      doc.image(asset(item.icon), x, y - 5, { fit: [18, 18] });
      doc.text(item.text, x + 24, y, { width: columnWidth - 28, lineBreak: false, ellipsis: true });
    });
    return;
  }
  // GT Medical: los datos de contacto vienen del registro de la empresa.
  const contact = [company.direccion, company.telefono && `Tel. ${company.telefono}`, company.correo]
    .filter(Boolean).join("  •  ");
  if (contact) doc.text(contact, LEFT, y, { width: WIDTH, align: "center" });
}

// Borde superior del pie de cada plantilla (imagen de Teknor o linea de contacto de las demas).
function footerTop(doc, template) {
  if (template.footerImage) {
    const image = doc.openImage(asset(template.footerImage));
    return PAGE_HEIGHT - 22 - (PAGE_WIDTH - 60) * (image.height / image.width);
  }
  return PAGE_HEIGHT - 57;
}

// La firma se ancla cerca del pie; solo sube si el cuerpo (muchos tecnicos) llega mas abajo.
// SIGNATURE_TEXT + SIGNATURE_GAP: alto de nombre y cargo bajo la linea mas el espacio hasta el pie.
const SIGNATURE_OFFSET = 62;
const SIGNATURE_TEXT = 28;
const SIGNATURE_GAP = 18;

function signatureLineY(doc, template, bodyEnd) {
  return Math.max(bodyEnd + SIGNATURE_OFFSET, footerTop(doc, template) - SIGNATURE_TEXT - SIGNATURE_GAP);
}

function drawSignature(doc, template, top) {
  const { signature } = template;
  const centerX = PAGE_WIDTH / 2 + 10;
  const lineY = signatureLineY(doc, template, top);
  for (const image of signature.images) {
    doc.image(asset(image.file), centerX + image.dx, lineY + image.dy, { fit: image.fit });
  }
  doc.moveTo(centerX - 90, lineY).lineTo(centerX + 90, lineY).lineWidth(0.8).strokeColor(TEXT_COLOR).stroke();
  doc.font("Helvetica-Bold").fontSize(10).fillColor(TEXT_COLOR)
    .text(signature.name, centerX - 130, lineY + 5, { width: 260, align: "center" });
  if (signature.title) {
    doc.font("Helvetica").fontSize(7.5).text(signature.title, centerX - 130, doc.y + 1, { width: 260, align: "center" });
  }
  return doc.y;
}

function drawBody(doc, template, letter) {
  const paragraph = { width: WIDTH, align: "justify", lineGap: 1.5 };
  doc.fillColor(TEXT_COLOR);
  doc.font("Helvetica-Bold").fontSize(10).text(`Guatemala, ${letterDate(letter.fecha_coordinacion)}`, LEFT, 136);

  doc.moveDown(1.2).text(letter.institucion, { width: WIDTH });
  if (letter.linea_institucion) doc.text(letter.linea_institucion, { width: WIDTH });
  if (letter.destinatario) {
    doc.moveDown(0.8).text(withPeriod(letter.destinatario), { width: WIDTH });
    if (letter.destinatario_cargo) doc.text(letter.destinatario_cargo, { width: WIDTH });
  }

  doc.moveDown(1).font("Helvetica").fontSize(10).text(GREETING, { ...paragraph, continued: true })
    .font("Helvetica-Bold").text(withPeriod(letter.descripcion.toUpperCase()), { ...paragraph, underline: true });

  doc.moveDown(0.7).font("Helvetica-Bold")
    .text(`Atendiendo la ORDEN DE COMPRA No. ${letter.numero_oc} que corresponde al: NOG: ${letter.numero_nog}${ORDER_SUFFIX}`,
      paragraph);

  doc.moveDown(0.7).font("Helvetica")
    .text(`Los trabajos del mantenimiento correspondiente se estarán ejecutando ${workPeriod(
      letter.fecha_inicio, letter.fecha_fin, letter.dias_habiles, letter.fecha_coordinacion)}, ${HOURS}`, paragraph);

  // Personal: nombre y DPI en dos columnas con viñeta.
  doc.moveDown(0.8).font("Helvetica-Bold").text("Datos del personal:", LEFT, doc.y, { width: WIDTH });
  const nameX = LEFT + 18;
  const dpiX = LEFT + 230;
  let y = doc.y + 2;
  doc.text("NOMBRE", nameX, y, { width: 190, align: "center" }).text("DPI", dpiX, y, { width: 120, align: "center" });
  y = doc.y + 3;
  doc.font("Helvetica").fontSize(10);
  for (const technician of letter.tecnicos) {
    doc.save().translate(LEFT + 7, y + 5).rotate(45).rect(-2.6, -2.6, 5.2, 5.2).fill(TEXT_COLOR).restore();
    doc.fillColor(TEXT_COLOR).text(technician.nombre, nameX, y, { width: 200, lineBreak: false, ellipsis: true })
      .text(formatDpi(technician.dpi), dpiX, y, { width: 120, align: "center", lineBreak: false });
    y += 13;
  }

  doc.font("Helvetica-Bold").fontSize(10).text("DATOS DE LA EMPRESA:", LEFT, y + 9, { width: WIDTH });
  doc.font("Helvetica").fontSize(9.5).text(companyLines(template, letter.empresa).join("\n"), { width: WIDTH, lineGap: 1 });
  doc.moveDown(0.9).fontSize(10).text("Cordialmente,", { width: WIDTH });
  return doc.y;
}

function generateCoordinationLetter(letter) {
  return new Promise((resolve, reject) => {
    const template = LETTER_TEMPLATES[letter.plantilla];
    if (!template) {
      reject(letterError("La empresa de la coordinacion no tiene una plantilla de carta"));
      return;
    }
    try {
      assertLetterData(letter);
    } catch (error) {
      reject(error);
      return;
    }
    // Sin margen inferior: el pie y la firma se ubican a mano y PDFKit no debe abrir otra hoja.
    const doc = new PDFDocument({
      size: "LETTER", margins: { top: 40, right: LEFT, bottom: 0, left: LEFT },
      info: { Title: `Carta de coordinacion - ${letter.institucion}`, Subject: letter.descripcion },
    });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    try {
      drawDecorations(doc, template);
      drawHeader(doc, template);
      const bodyEnd = drawBody(doc, template, letter);
      const signatureEnd = drawSignature(doc, template, bodyEnd);
      if (template.brandMark) {
        const mark = template.brandMark;
        doc.image(asset(mark.file), mark.x, Math.max(mark.y, signatureEnd - 40), { fit: mark.fit });
      }
      // La carta es de una hoja: el contenido no puede invadir el pie.
      if (signatureEnd > PAGE_HEIGHT - 64) {
        throw letterError("La descripcion del mantenimiento es demasiado extensa para la carta de una hoja; resumala.");
      }
      drawFooter(doc, template, letter.empresa || {});
      doc.end();
    } catch (error) {
      doc.destroy();
      reject(error);
    }
  });
}

module.exports = {
  LETTER_TEMPLATES, footerTop, formatDpi, generateCoordinationLetter, letterDate, signatureLineY, workPeriod,
};
