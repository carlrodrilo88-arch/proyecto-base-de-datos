function invalidIds(message) {
  return Object.assign(new Error(message), { status: 400 });
}

// Convierte identificadores recibidos del formulario en enteros positivos sin repetir.
function parseUniqueIds(values, label, repeatedMessage) {
  const ids = values.map((value) => {
    if (!/^\d+$/.test(String(value))) throw invalidIds(`${label} invalido`);
    const id = Number(value);
    if (!Number.isSafeInteger(id) || id <= 0) throw invalidIds(`${label} invalido`);
    return id;
  });
  if (new Set(ids).size !== ids.length) throw invalidIds(repeatedMessage);
  return ids;
}

function validateEquipmentIds(values, maximum = 50) {
  if (!Array.isArray(values) || values.length === 0) {
    throw invalidIds("Seleccione al menos un equipo medico");
  }
  if (values.length > maximum) {
    throw invalidIds(`No puede generar mas de ${maximum} reportes por lote`);
  }
  return parseUniqueIds(values, "Equipo medico", "No puede repetir el mismo equipo en el lote");
}

// Los tecnicos son opcionales: un reporte puede registrarse antes de asignar al personal.
function validateTechnicianIds(values, maximum = 10) {
  if (values === undefined || values === null) return [];
  if (!Array.isArray(values)) throw invalidIds("id_tecnicos debe ser una lista");
  if (values.length > maximum) throw invalidIds(`No puede asignar mas de ${maximum} tecnicos a un reporte`);
  return parseUniqueIds(values, "Tecnico", "No puede repetir el mismo tecnico");
}

// Empresas enlazadas a un usuario o a una institucion.
function validateCompanyIds(values, required = true, maximum = 20) {
  if (values === undefined || values === null) values = [];
  if (!Array.isArray(values)) throw invalidIds("id_proveedores debe ser una lista");
  if (required && values.length === 0) throw invalidIds("Seleccione al menos una empresa");
  if (values.length > maximum) throw invalidIds(`No puede enlazar mas de ${maximum} empresas`);
  return parseUniqueIds(values, "Empresa", "No puede repetir la misma empresa");
}

module.exports = { validateCompanyIds, validateEquipmentIds, validateTechnicianIds };
