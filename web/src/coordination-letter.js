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
const RENGLON = "163";

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
  // Teknor tiene su propio formato (marco, banda superior y tabla de personal): ver drawTeknorLetter.
  teknor: {
    layout: "teknor",
    color: "#36353a",
    watermark: { file: "public/logos/teknor-watermark.png", x: 160, y: 250, width: 300 },
    tagline: "Infraestructura, equipo médico e industrial",
    title: "ASISTENCIA TÉCNICA INDUSTRIAL Y BIOMEDICA",
    signature: {
      name: "Axel Ixpata", title: "Ventas",
      image: { file: "assets/cartas/teknor-firma.png", fit: [180, 58] },
    },
    company: [
      { text: "NIT: 100411088", size: 7 },
      { text: "PBX / WhatsApp: (+502) 3166 0007 / (+502) 3762 1092", size: 7 },
    ],
    emails: ["serviciotecnico@teknorgt.com", "operaciones@teknorgt.com"],
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
  if (!letter.numero_oc || !letter.numero_nog || !letter.numero_pedido) {
    throw letterError("Registre la orden de compra (OC), el NOG y el numero de pedido de la coordinacion para generar la carta");
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

// Borde superior del pie de Meditec y GT Medical (linea de contacto).
const FOOTER_TOP = PAGE_HEIGHT - 57;

// La firma se ancla cerca del pie; solo sube si el cuerpo (muchos tecnicos) llega mas abajo.
// SIGNATURE_TEXT + SIGNATURE_GAP: alto de nombre y cargo bajo la linea mas el espacio hasta el pie.
const SIGNATURE_OFFSET = 62;
const SIGNATURE_TEXT = 28;
const SIGNATURE_GAP = 18;

function signatureLineY(bodyEnd) {
  return Math.max(bodyEnd + SIGNATURE_OFFSET, FOOTER_TOP - SIGNATURE_TEXT - SIGNATURE_GAP);
}

function drawSignature(doc, template, top) {
  const { signature } = template;
  const centerX = PAGE_WIDTH / 2 + 10;
  const lineY = signatureLineY(top);
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
    .text(`Atendiendo la ORDEN DE COMPRA No. ${letter.numero_oc} que corresponde al: NOG: ${letter.numero_nog}, `
      + `No. de Pedido ${letter.numero_pedido} Renglón ${RENGLON}.`, paragraph);

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

/* Teknor: reproduce su plantilla (marco, banda oscura con logo, titulo, tabla de personal y bloque TekNor). */

const TEKNOR = {
  frame: { left: 24, top: 24, right: 589, bottom: 766 },
  bandBottom: 101,
  left: 73,
  right: 550,
  block: { x: 478, y: 684, width: 111, height: 82 },
  // Alto de la firma (imagen, nombre y cargo) y su borde inferior cuando el cuerpo es corto.
  signatureHeight: 88,
  signatureBottom: 748,
};

// "02 de septiembre de 2026": Teknor escribe el anio sin separador de miles.
function teknorLetterDate(iso) {
  const { year, month, day } = parts(iso);
  return `${two(day)} de ${MONTHS[month - 1]} de ${year}`;
}

// "iniciando la ejecución día jueves 03 y finalizando el día viernes 04 de septiembre del presente año 2026"
function teknorWorkPeriod(startIso, endIso, letterIso) {
  const start = parts(startIso);
  const end = parts(endIso);
  const endText = `${end.weekday} ${two(end.day)} de ${MONTHS[end.month - 1]}`;
  if (start.year !== end.year || start.year !== parts(letterIso).year) {
    return `iniciando la ejecución día ${start.weekday} ${two(start.day)} de ${MONTHS[start.month - 1]} de ${start.year} `
      + `y finalizando el día ${endText} de ${end.year}`;
  }
  if (startIso === endIso) return `ejecutando el día ${endText} del presente año ${end.year}`;
  const startText = start.month === end.month
    ? `${start.weekday} ${two(start.day)}`
    : `${start.weekday} ${two(start.day)} de ${MONTHS[start.month - 1]}`;
  return `iniciando la ejecución día ${startText} y finalizando el día ${endText} del presente año ${end.year}`;
}

// La firma queda cerca del pie; con muchos tecnicos baja detras de "Cordialmente,".
function teknorSignatureTop(bodyEnd) {
  return Math.max(bodyEnd + 6, TEKNOR.signatureBottom - TEKNOR.signatureHeight);
}

// Engranaje blanco con la cruz calada, dibujado en vectores para que sea nitido sobre la banda oscura.
function drawTeknorGear(doc, cx, cy, radius, background) {
  doc.save().fillColor("#ffffff");
  for (let index = 0; index < 8; index += 1) {
    doc.save().rotate(index * 45, { origin: [cx, cy] })
      .rect(cx - radius * 0.27, cy - radius * 1.3, radius * 0.54, radius * 0.6).fill().restore();
  }
  doc.circle(cx, cy, radius).fill();
  const arm = radius * 0.42;
  const length = radius * 1.2;
  doc.fillColor(background)
    .roundedRect(cx - arm / 2, cy - length / 2, arm, length, arm / 2).fill()
    .roundedRect(cx - length / 2, cy - arm / 2, length, arm, arm / 2).fill();
  doc.restore();
}

function drawTeknorFrame(doc, template) {
  const { frame } = TEKNOR;
  doc.save().rect(frame.left, frame.top, frame.right - frame.left, TEKNOR.bandBottom - frame.top)
    .fill(template.color).restore();
  drawTeknorGear(doc, 76, 61, 17, template.color);
  doc.font("Helvetica-Bold").fontSize(38).fillColor("#ffffff").text("Teknor", 108, 44, { lineBreak: false });
  doc.font("Helvetica-BoldOblique").fontSize(9.5)
    .text(template.tagline, frame.left, 88, { width: frame.right - frame.left - 18, align: "right" });

  // Bloque "TekNor" de la esquina inferior derecha: "Nor" se lee de abajo hacia arriba.
  const { block } = TEKNOR;
  doc.save().rect(block.x, block.y, block.width, block.height).fill(template.color).restore();
  doc.font("Helvetica-Bold").fontSize(30).fillColor("#ffffff").text("Tek", block.x + 13, block.y + 50, { lineBreak: false });
  doc.save().rotate(-90, { origin: [block.x + 63, block.y + 73] })
    .text("Nor", block.x + 63, block.y + 73, { lineBreak: false }).restore();

  doc.save().rect(frame.left, frame.top, frame.right - frame.left, frame.bottom - frame.top)
    .lineWidth(0.8).strokeColor("#222222").stroke().restore();
}

function drawTeknorPersonnel(doc, technicians, top) {
  const left = TEKNOR.left;
  const right = TEKNOR.right;
  const split = 311;
  const rowHeight = 12.5;
  const rows = [{ nombre: "NOMBRE", dpi: "DPI" },
    ...technicians.map((item) => ({ nombre: item.nombre.toUpperCase(), dpi: formatDpi(item.dpi) }))];
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor(TEXT_COLOR);
  rows.forEach((row, index) => {
    const y = top + index * rowHeight;
    doc.text(row.nombre, left + 4, y + 2.5, { width: split - left - 8, lineBreak: false, ellipsis: true })
      .text(row.dpi, split + 4, y + 2.5, { width: right - split - 8, lineBreak: false });
  });
  const bottom = top + rows.length * rowHeight;
  doc.save().lineWidth(0.6).strokeColor(TEXT_COLOR);
  doc.rect(left, top, right - left, bottom - top).stroke();
  for (let index = 1; index < rows.length; index += 1) {
    doc.moveTo(left, top + index * rowHeight).lineTo(right, top + index * rowHeight).stroke();
  }
  doc.moveTo(split, top).lineTo(split, bottom).stroke();
  doc.restore();
  return bottom;
}

function drawTeknorLetter(doc, template, letter) {
  const left = TEKNOR.left;
  const width = TEKNOR.right - left;
  const paragraph = { width, lineGap: 1.5 };
  drawDecorations(doc, template);
  drawTeknorFrame(doc, template);

  doc.font("Helvetica").fontSize(9).fillColor(TEXT_COLOR)
    .text(`Guatemala, ${teknorLetterDate(letter.fecha_coordinacion)}`, left, 122, { width, align: "right" });
  doc.moveDown(0.9).font("Helvetica-Bold").fontSize(11.5)
    .text(template.title, left, doc.y, { width, align: "center", underline: true });

  doc.moveDown(0.9).font("Helvetica").fontSize(10).text(letter.institucion, left, doc.y, { width });
  if (letter.linea_institucion) doc.text(letter.linea_institucion, { width });
  if (letter.destinatario) {
    const indent = { width: width - 28 };
    doc.moveDown(0.9).text(withPeriod(letter.destinatario), left + 28, doc.y, indent);
    if (letter.destinatario_cargo) doc.text(letter.destinatario_cargo, indent);
  }

  doc.moveDown(0.9)
    .text("Reciban un cordial saludo, por medio del presente documento hago referencia a los trabajos de:",
      left, doc.y, paragraph);
  doc.moveDown(0.8).font("Helvetica-Bold").text(letter.descripcion, { ...paragraph, underline: true });
  doc.moveDown(0.8).text(`Atendiendo la ORDEN DE COMPRA No. ${letter.numero_oc} que corresponde al NOG: `
    + `${letter.numero_nog}, No. De Pedido ${letter.numero_pedido} Renglón ${RENGLON}`, paragraph);
  doc.moveDown(0.8).font("Helvetica").text(`Los trabajos del mantenimiento correspondiente se estarán ${teknorWorkPeriod(
    letter.fecha_inicio, letter.fecha_fin, letter.fecha_coordinacion)}, en los horarios de 8:00 am a 4:00pm. `
    + "Adjunto listado de personal técnico a cargo del mantenimiento.", paragraph);

  doc.moveDown(0.8).font("Helvetica-Bold").text("Datos del personal:", left, doc.y, { width });
  const tableEnd = drawTeknorPersonnel(doc, letter.tecnicos, doc.y + 4);

  doc.font("Helvetica-Bold").fontSize(9).fillColor(TEXT_COLOR).text("DATOS DE LA EMPRESA:", left, tableEnd + 16, { width });
  for (const line of template.company) {
    doc.font("Helvetica").fontSize(line.size).text(line.text, left, doc.y + 3, { width });
  }
  doc.fontSize(9).text("Correo electrónico: ", left, doc.y + 2, { continued: true });
  template.emails.forEach((email, index) => {
    const last = index === template.emails.length - 1;
    doc.fontSize(7).fillColor("#0563c1")
      .text(email, { link: `mailto:${email}`, underline: true, continued: true })
      .fillColor(TEXT_COLOR).text(last ? "" : "  /  ", { link: null, underline: false, continued: !last });
  });
  // El texto "continued" de los correos no avanza moveDown: la separacion se da con una posicion explicita.
  doc.font("Helvetica").fontSize(10).fillColor(TEXT_COLOR).text("Cordialmente,", left, doc.y + 16, { width });

  // Firma: imagen entregada por Teknor, nombre y cargo centrados.
  const { signature } = template;
  const centerX = 308;
  const top = teknorSignatureTop(doc.y);
  const [fitWidth, fitHeight] = signature.image.fit;
  doc.image(asset(signature.image.file), centerX - fitWidth / 2, top, { fit: signature.image.fit, align: "center" });
  doc.font("Helvetica").fontSize(10).fillColor(TEXT_COLOR)
    .text(signature.name, centerX - 100, top + fitHeight + 6, { width: 200, align: "center" });
  doc.font("Helvetica-Bold").text(signature.title, centerX - 100, doc.y + 1, { width: 200, align: "center" });
  // La carta es de una hoja: la firma no puede salir del marco.
  if (doc.y > TEKNOR.frame.bottom - 6) {
    throw letterError("La descripcion del mantenimiento es demasiado extensa para la carta de una hoja; resumala.");
  }
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
      if (template.layout === "teknor") {
        drawTeknorLetter(doc, template, letter);
        doc.end();
        return;
      }
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
  FOOTER_TOP, LETTER_TEMPLATES, TEKNOR, formatDpi, generateCoordinationLetter, letterDate, signatureLineY,
  teknorLetterDate, teknorSignatureTop, teknorWorkPeriod, workPeriod,
};
