const assert = require("node:assert/strict");
const test = require("node:test");
const {
  readBusinessDays, readCoordination, readDate, readDpi, readHoliday, readRecipient,
} = require("./coordinaciones");

const valid = {
  id_proveedor: "1",
  id_institucion: "2",
  nombre_mantenimiento: "  Mantenimiento a desfibriladores ",
  numero_oc: " 210967 ",
  numero_nog: " 30349281 ",
  id_destinatario: "4",
  id_tecnicos: ["7", "8", "7"],
  fecha_coordinacion: "2026-11-17",
  fecha_inicio: "2026-11-19",
  dias_habiles: "5",
};

test("normaliza una coordinacion valida", () => {
  assert.deepEqual(readCoordination(valid), {
    id_proveedor: 1,
    id_institucion: 2,
    nombre_mantenimiento: "Mantenimiento a desfibriladores",
    numero_oc: "210967",
    numero_nog: "30349281",
    id_destinatario: 4,
    id_tecnicos: [7, 8],
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

test("exige empresa, institucion, descripcion, OC y NOG", () => {
  for (const change of [{ id_proveedor: "" }, { id_institucion: "0" }, { nombre_mantenimiento: "  " },
    { numero_oc: "" }, { numero_nog: "  " }, { numero_oc: undefined }]) {
    assert.throws(() => readCoordination({ ...valid, ...change }), { status: 400 });
  }
});

test("el destinatario y los tecnicos son opcionales; maximo 10 tecnicos", () => {
  const data = readCoordination({ ...valid, id_destinatario: "", id_tecnicos: undefined });
  assert.equal(data.id_destinatario, null);
  assert.deepEqual(data.id_tecnicos, []);
  assert.deepEqual(readCoordination({ ...valid, id_tecnicos: "3" }).id_tecnicos, [3]);
  const ten = Array.from({ length: 10 }, (_, index) => String(index + 1));
  assert.equal(readCoordination({ ...valid, id_tecnicos: ten }).id_tecnicos.length, 10);
  assert.throws(() => readCoordination({ ...valid, id_tecnicos: [...ten, "11"] }), { status: 400 });
  assert.throws(() => readCoordination({ ...valid, id_tecnicos: ["abc"] }), { status: 400 });
});

test("normaliza el DPI de 13 digitos", () => {
  assert.equal(readDpi("2566 31409 0901"), "2566314090901");
  assert.equal(readDpi("2566-31409-0901"), "2566314090901");
  assert.equal(readDpi(""), null);
  for (const value of ["123", "25663140909012", "2566 31409 090A"]) {
    assert.throws(() => readDpi(value), { status: 400 });
  }
});

test("valida el destinatario de la carta", () => {
  assert.deepEqual(readRecipient({ id_institucion: "2", nombre: " Ing. Jahen Figueroa ", cargo: "Ingeniero en Mantenimiento" }),
    { id_institucion: 2, nombre: "Ing. Jahen Figueroa", cargo: "Ingeniero en Mantenimiento" });
  assert.throws(() => readRecipient({ id_institucion: "2", nombre: "Ing. X", cargo: "" }), { status: 400 });
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
