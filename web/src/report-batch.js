function validateEquipmentIds(values, maximum = 50) {
  if (!Array.isArray(values) || values.length === 0) {
    const error = new Error("Seleccione al menos un equipo medico");
    error.status = 400;
    throw error;
  }
  if (values.length > maximum) {
    const error = new Error(`No puede generar mas de ${maximum} reportes por lote`);
    error.status = 400;
    throw error;
  }
  const ids = values.map((value) => {
    if (!/^\d+$/.test(String(value))) throw Object.assign(new Error("Equipo medico invalido"), { status: 400 });
    const id = Number(value);
    if (!Number.isSafeInteger(id) || id <= 0) throw Object.assign(new Error("Equipo medico invalido"), { status: 400 });
    return id;
  });
  if (new Set(ids).size !== ids.length) {
    const error = new Error("No puede repetir el mismo equipo en el lote");
    error.status = 400;
    throw error;
  }
  return ids;
}

module.exports = { validateEquipmentIds };
