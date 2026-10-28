const assert = require("node:assert/strict");
const test = require("node:test");
const zlib = require("node:zlib");
const { generateReportPdf } = require("./pdf-report");
const { resolveReportTemplate } = require("./report-templates");

function pdfText(pdf) {
  const raw = pdf.toString("latin1");
  const streamHeader = /\/Length (\d+)\b[\s\S]*?stream\r?\n/g;
  const decoded = [];
  let match;
  while ((match = streamHeader.exec(raw))) {
    const start = match.index + match[0].length;
    const length = Number(match[1]);
    // Usar /Length: un byte comprimido final puede ser CR y no debe eliminarse.
    try { decoded.push(zlib.inflateSync(pdf.subarray(start, start + length)).toString("latin1")); }
    catch { /* Las imagenes con otros filtros no contienen texto del documento. */ }
    streamHeader.lastIndex = start + length;
  }
  const streams = decoded.join("\n");
  return [...streams.matchAll(/<([0-9a-f]+)>/gi)]
    .map((match) => Buffer.from(match[1], "hex").toString("latin1")).join("");
}

test("resuelve las tres empresas sin depender de mayusculas o espacios", () => {
  assert.equal(resolveReportTemplate("TEKNOR").key, "teknor");
  assert.equal(resolveReportTemplate("MEDITEC").key, "meditec");
  assert.equal(resolveReportTemplate("GT Medical").key, "gtmedical");
  assert.equal(resolveReportTemplate(" GT-Medical ").key, "gtmedical");
});

test("conserva un formato generico para proveedores historicos", () => {
  assert.equal(resolveReportTemplate("Proveedor Biomedico A").key, "generic");
});

test("el codigo estable conserva la plantilla aunque cambie el nombre", () => {
  assert.equal(resolveReportTemplate("Nuevo nombre comercial", "meditec").key, "meditec");
  assert.equal(resolveReportTemplate("Teknor", null).key, "generic");
  assert.equal(resolveReportTemplate("Meditec", "codigo-invalido").key, "generic");
});

for (const company of ["Teknor", "Meditec", "GT Medical"]) {
  test(`plantilla ${company}: imprime logo, datos, recomendaciones y firmas en una hoja`, async () => {
    const report = {
      proveedor: company, codigo_reporte: "REP-TEST", fecha_reporte: "12/10/2026",
      titulo: "TITLEMARKER", institucion: "Hospital", servicio_solicitante: "Mantenimiento",
      descripcion_equipo: "Monitor", marca: "MARCAMARKER", modelo: "MODELOMARKER",
      numero_bien: "BIENMARKER", numero_serie: "SERIEMARKER", numero_pedido_nog: "PEDIDOMARKER",
      tipo_servicio: "preventivo", especificaciones_tecnicas: "SERVICEMARKER",
      recomendaciones: "RECOMMENDATIONMARKER",
    };
    const pdf = await generateReportPdf(report);
    const text = pdfText(pdf);
    assert.equal(pdf.subarray(0, 4).toString(), "%PDF");
    assert.equal((pdf.toString("latin1").match(/\/Type \/Page\b/g) || []).length, 1);
    assert.match(pdf.toString("latin1"), /\/Subtype \/Image/);
    for (const marker of ["MARCAMARKER", "MODELOMARKER", "BIENMARKER", "SERIEMARKER", "SERVICEMARKER", "RECOMMENDATIONMARKER"]) {
      assert.ok(text.includes(marker), `Falta imprimir ${marker}`);
    }
    assert.equal(text.includes("OBSERVACIONES"), false);
    assert.ok(text.includes(company === "Meditec" ? "NOMBRE, FIRMA, SELLO" : "NOMBRE, FIRMA Y SELLO"));
    assert.equal(text.includes("PEDIDOMARKER"), company !== "Teknor");
    assert.equal(text.includes("www.meditecgt.com"), company === "Meditec");
  });
}

test("rechaza contenido que no cabe de forma legible en una hoja", async () => {
  await assert.rejects(generateReportPdf({
    proveedor: "Meditec", codigo_reporte: "REP-LARGO",
    especificaciones_tecnicas: "Trabajo realizado y verificado. ".repeat(250) + "SERVICEENDMARKER",
    recomendaciones: "Recomendacion completa. ".repeat(150) + "RECOMMENDATIONENDMARKER",
  }), /demasiado extenso para el formato de una hoja/);
});
