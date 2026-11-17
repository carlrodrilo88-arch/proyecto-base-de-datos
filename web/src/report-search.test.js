const assert = require("node:assert/strict");
const test = require("node:test");
const { REPORT_LIST_LIMIT, readNumeroBien } = require("./report-search");

test("el historial de reportes se limita a 50", () => {
  assert.equal(REPORT_LIST_LIMIT, 50);
});

test("normaliza el numero de bien para busqueda exacta", () => {
  assert.equal(readNumeroBien("  BIEN-123 "), "BIEN-123");
  assert.equal(readNumeroBien(""), null);
  assert.equal(readNumeroBien("   "), null);
  assert.equal(readNumeroBien(undefined), null);
});

test("rechaza numeros de bien invalidos", () => {
  assert.throws(() => readNumeroBien(["BIEN-1", "BIEN-2"]), { status: 400 });
  assert.throws(() => readNumeroBien("x".repeat(101)), { status: 400 });
});
