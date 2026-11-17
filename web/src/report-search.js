// Reglas de busqueda del listado de reportes.

// El historial muestra solo los reportes mas recientes; los anteriores se encuentran con los filtros.
const REPORT_LIST_LIMIT = 50;

// Numero de bien para busqueda exacta: se recortan espacios y vacio significa "sin filtro".
function readNumeroBien(value) {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") {
    throw Object.assign(new Error("numero_bien debe ser texto"), { status: 400 });
  }
  const normalized = value.trim();
  if (normalized.length > 100) {
    throw Object.assign(new Error("numero_bien excede el maximo de 100 caracteres"), { status: 400 });
  }
  return normalized || null;
}

module.exports = { REPORT_LIST_LIMIT, readNumeroBien };
