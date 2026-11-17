const assert = require("node:assert/strict");
const test = require("node:test");
const { readBusinessDays, readCoordination, readDate, readHoliday } = require("./coordinaciones");

const valid = {
  id_proveedor: "1",
  id_institucion: "2",
  nombre_mantenimiento: "  Mantenimiento a desfibriladores ",
  tipo_referencia: "nog",
  numero_referencia: " 12345678 ",
  fecha_coordinacion: "2026-11-17",
  fecha_inicio: "2026-11-19",
  dias_habiles: "5",
};

test("normaliza una coordinacion valida", () => {
  assert.deepEqual(readCoordination(valid), {
    id_proveedor: 1,
    id_institucion: 2,
    nombre_mantenimiento: "Mantenimiento a desfibriladores",
    tipo_referencia: "NOG",
    numero_referencia: "12345678",
    fecha_coordinacion: "2026-11-17",
    fecha_inicio: "2026-11-19",
    dias_habiles: 5,
  });
});

test("acepta que los trabajos inicien el mismo dia de la coordinacion", () => {
  assert.equal(readCoordination({ ...valid, fecha_inicio: "2026-11-17" }).fecha_inicio, "2026-11-17");
});

test("rechaza un inicio anterior a la coordinacion", () => {
  assert.throws(() => readCoordination({ ...valid, fecha_inicio: "2026-11-16" }), { status: 400 });
});

test("exige empresa, institucion, nombre y referencia NOG u OC", () => {
  for (const change of [{ id_proveedor: "" }, { id_institucion: "0" }, { nombre_mantenimiento: "  " },
    { tipo_referencia: "FACTURA" }, { numero_referencia: "" }]) {
    assert.throws(() => readCoordination({ ...valid, ...change }), { status: 400 });
  }
  assert.equal(readCoordination({ ...valid, tipo_referencia: "OC" }).tipo_referencia, "OC");
});

test("valida los dias habiles", () => {
  assert.equal(readBusinessDays(" 10 "), 10);
  for (const value of ["0", "-1", "2.5", "abc", "", "366"]) {
    assert.throws(() => readBusinessDays(value), { status: 400 });
  }
});

test("rechaza fechas inexistentes o mal escritas", () => {
  assert.equal(readDate("2028-02-29", "Fecha"), "2028-02-29");
  for (const value of ["2026-02-30", "19/11/2026", "2026-13-01", null]) {
    assert.throws(() => readDate(value, "Fecha"), { status: 400 });
  }
});

test("valida los feriados", () => {
  assert.deepEqual(readHoliday({ fecha: "2026-12-25", nombre: " Navidad " }), { fecha: "2026-12-25", nombre: "Navidad" });
  assert.throws(() => readHoliday({ fecha: "2026-12-25", nombre: "" }), { status: 400 });
});
