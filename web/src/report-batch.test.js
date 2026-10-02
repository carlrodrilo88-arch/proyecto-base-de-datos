const test = require("node:test");
const assert = require("node:assert/strict");
const { validateEquipmentIds } = require("./report-batch");

test("acepta varios equipos distintos", () => {
  assert.deepEqual(validateEquipmentIds(["1", 2, "3"]), [1, 2, 3]);
});

test("rechaza lotes vacios, repetidos o invalidos", () => {
  assert.throws(() => validateEquipmentIds([]), /al menos un equipo/);
  assert.throws(() => validateEquipmentIds([1, "1"]), /repetir/);
  assert.throws(() => validateEquipmentIds(["equipo"]), /invalido/);
});

test("limita el tamano del lote", () => {
  assert.throws(() => validateEquipmentIds([1, 2, 3], 2), /mas de 2/);
});
