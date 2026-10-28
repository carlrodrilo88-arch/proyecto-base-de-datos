const test = require("node:test");
const assert = require("node:assert/strict");
const { validateCompanyIds, validateEquipmentIds, validateTechnicianIds } = require("./report-batch");

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

test("acepta tecnicos opcionales y distintos", () => {
  assert.deepEqual(validateTechnicianIds(undefined), []);
  assert.deepEqual(validateTechnicianIds([]), []);
  assert.deepEqual(validateTechnicianIds(["4", 7]), [4, 7]);
});

test("rechaza tecnicos repetidos, invalidos o en exceso", () => {
  assert.throws(() => validateTechnicianIds("4"), /lista/);
  assert.throws(() => validateTechnicianIds([4, "4"]), /repetir/);
  assert.throws(() => validateTechnicianIds(["x"]), /Tecnico invalido/);
  assert.throws(() => validateTechnicianIds([1, 2, 3], 2), /mas de 2/);
});

test("exige empresas validas segun el rol", () => {
  assert.deepEqual(validateCompanyIds(["2", 5]), [2, 5]);
  assert.deepEqual(validateCompanyIds(undefined, false), []);
  assert.throws(() => validateCompanyIds([]), /al menos una empresa/);
  assert.throws(() => validateCompanyIds("2"), /lista/);
  assert.throws(() => validateCompanyIds([2, "2"]), /repetir/);
  assert.throws(() => validateCompanyIds(["x"]), /Empresa invalido/);
});
