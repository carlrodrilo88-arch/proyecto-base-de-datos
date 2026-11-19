const assert = require("node:assert/strict");
const test = require("node:test");
const PDFDocument = require("pdfkit");
const {
  LETTER_TEMPLATES, footerTop, formatDpi, generateCoordinationLetter, letterDate, signatureLineY, workPeriod,
} = require("./coordination-letter");

const letter = {
  plantilla: "meditec",
  institucion: "IGSS, Hospital General de Quetzaltenango",
  destinatario: "Ing. Jahen Gildardo Figueroa Mérida", destinatario_cargo: "Ingeniero en Mantenimiento",
  descripcion: "Mantenimiento preventivo a 02 congeladores",
  numero_oc: "210967", numero_nog: "30349281",
  fecha_coordinacion: "2026-09-04", fecha_inicio: "2026-09-08", fecha_fin: "2026-09-14", dias_habiles: 5,
  tecnicos: [{ nombre: "Miguel Monzon", dpi: "2566314090901" }],
  empresa: {},
};

test("escribe la fecha de la carta como el formato impreso", () => {
  assert.equal(letterDate("2026-09-04"), "04 de septiembre de 2,026");
});

test("describe el periodo de trabajo en el mismo mes, entre meses y entre anios", () => {
  assert.equal(workPeriod("2026-09-08", "2026-09-14", 5, "2026-09-04"),
    "del martes 08 al lunes 14 de septiembre del presente año (05 días hábiles)");
  assert.equal(workPeriod("2026-09-28", "2026-10-02", 5, "2026-09-20"),
    "del lunes 28 de septiembre al viernes 02 de octubre del presente año (05 días hábiles)");
  assert.equal(workPeriod("2026-12-30", "2027-01-05", 4, "2026-12-15"),
    "del miércoles 30 de diciembre de 2026 al martes 05 de enero de 2027 (04 días hábiles)");
  assert.equal(workPeriod("2026-09-08", "2026-09-08", 1, "2026-09-04"),
    "el martes 08 de septiembre del presente año (01 día hábil)");
});

test("formatea el DPI en grupos de 4, 5 y 4 digitos", () => {
  assert.equal(formatDpi("2566314090901"), "2566 31409 0901");
});

test("genera la carta de cada plantilla en una sola hoja", async () => {
  for (const plantilla of ["meditec", "teknor", "gtmedical"]) {
    const tecnicos = Array.from({ length: 10 }, (_, index) => ({ nombre: `Tecnico ${index + 1}`, dpi: "2566314090901" }));
    const pdf = await generateCoordinationLetter({ ...letter, plantilla, tecnicos });
    assert.equal(pdf.subarray(0, 4).toString(), "%PDF");
    assert.equal((pdf.toString("latin1").match(/\/Type \/Page\b/g) || []).length, 1, plantilla);
  }
});

test("la firma queda cerca del pie con pocos tecnicos y baja con el cuerpo si este es largo", () => {
  const doc = new PDFDocument({ size: "LETTER" });
  for (const [plantilla, template] of Object.entries(LETTER_TEMPLATES)) {
    const footer = footerTop(doc, template);
    const short = signatureLineY(doc, template, 400);
    assert.ok(short > footer - 60 && short < footer - 30, `${plantilla}: firma en ${short}, pie en ${footer}`);
    assert.equal(signatureLineY(doc, template, 650), 712, plantilla);
  }
});

test("exige tecnicos con DPI, OC, NOG y una plantilla conocida", async () => {
  await assert.rejects(generateCoordinationLetter({ ...letter, tecnicos: [] }), { status: 400 });
  await assert.rejects(generateCoordinationLetter({ ...letter, tecnicos: [{ nombre: "Sin DPI", dpi: null }] }),
    /Sin DPI/);
  await assert.rejects(generateCoordinationLetter({ ...letter, numero_oc: null }), { status: 400 });
  await assert.rejects(generateCoordinationLetter({ ...letter, plantilla: "otra" }), { status: 400 });
});
