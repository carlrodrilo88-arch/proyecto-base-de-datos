const assert = require("node:assert/strict");
const test = require("node:test");
const { validateEquipmentServices } = require("./report-batch");

test("conserva el servicio individual de cada equipo del lote", () => {
  assert.deepEqual(validateEquipmentServices([
    { id_equipo_medico: "1", id_servicio_solicitante: "10" },
    { id_equipo_medico: "2", id_servicio_solicitante: "20" },
    { id_equipo_medico: "3", id_servicio_solicitante: "10" },
  ]), [
    { id_equipo_medico: 1, id_servicio_solicitante: 10 },
    { id_equipo_medico: 2, id_servicio_solicitante: 20 },
    { id_equipo_medico: 3, id_servicio_solicitante: 10 },
  ]);
});

test("rechaza lotes sin servicio, malformados o con equipos repetidos", () => {
  for (const values of [null, {}, [], [null], [{ id_equipo_medico: 1 }],
    [{ id_equipo_medico: 1, id_servicio_solicitante: 0 }],
    [{ id_equipo_medico: 1, id_servicio_solicitante: 10 },
      { id_equipo_medico: "1", id_servicio_solicitante: 20 }]]) {
    assert.throws(() => validateEquipmentServices(values), { status: 400 });
  }
});
