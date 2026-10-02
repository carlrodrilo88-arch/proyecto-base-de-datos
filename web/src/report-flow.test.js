const assert = require("node:assert/strict");
const test = require("node:test");
const { generateReportPdf } = require("./pdf-report");
const { deletePdf, getPdf, putPdf, validateKey } = require("./storage");

const report = {
  codigo_reporte: "REP-TEST-0001",
  fecha_reporte: "01/10/2026",
  proveedor: "Proveedor de prueba",
  institucion: "Hospital de prueba",
  servicio_solicitante: "Mantenimiento",
  descripcion_equipo: "Monitor",
  marca: "Marca",
  modelo: "Modelo",
  numero_serie: "SERIE-1",
  numero_bien: "BIEN-1",
  tipo_servicio: "preventivo",
  especificaciones_tecnicas: "Prueba funcional",
  recomendaciones: "Sin novedades",
  pie_pagina: "Pie de prueba",
};

test("genera un PDF valido para vista previa", async () => {
  const pdf = await generateReportPdf(report);
  assert.equal(pdf.subarray(0, 4).toString(), "%PDF");
  assert.ok(pdf.length > 1000);
});

test("almacena y recupera un PDF local", async () => {
  const key = "reportes/pruebas/flujo-test.pdf";
  const content = Buffer.from("%PDF-prueba");
  await putPdf(key, content);
  assert.deepEqual(await getPdf(key), content);
  await deletePdf(key);
});

test("rechaza claves que intentan salir del almacenamiento", () => {
  assert.throws(() => validateKey("../secreto.pdf"));
  assert.throws(() => validateKey("reportes/../../secreto.pdf"));
});
