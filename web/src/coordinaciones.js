// Validacion de las coordinaciones de trabajo y de los feriados.
// El calculo de dias habiles vive en PostgreSQL (sumar_dias_habiles) porque depende de la tabla feriados.

const REFERENCE_TYPES = ["NOG", "OC"];
const MAX_BUSINESS_DAYS = 365;

function invalid(message) {
  return Object.assign(new Error(message), { status: 400 });
}

function readText(value, label, maxLength) {
  if (typeof value !== "string" || !value.trim()) throw invalid(`${label} es obligatorio`);
  const text = value.trim();
  if (text.length > maxLength) throw invalid(`${label} excede el maximo de ${maxLength} caracteres`);
  return text;
}

// Fecha AAAA-MM-DD que existe en el calendario (rechaza, por ejemplo, 2026-02-30).
function readDate(value, label) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw invalid(`${label} invalida`);
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw invalid(`${label} invalida`);
  }
  return value;
}

function readId(value, label) {
  if (!/^\d+$/.test(String(value ?? ""))) throw invalid(`Seleccione ${label}`);
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) throw invalid(`Seleccione ${label}`);
  return id;
}

function readBusinessDays(value) {
  const text = String(value ?? "").trim();
  if (!/^\d+$/.test(text)) throw invalid("Los dias habiles deben ser un numero entero");
  const days = Number(text);
  if (days < 1 || days > MAX_BUSINESS_DAYS) {
    throw invalid(`Los dias habiles deben estar entre 1 y ${MAX_BUSINESS_DAYS}`);
  }
  return days;
}

function readCoordination(body = {}) {
  const tipo = String(body.tipo_referencia ?? "").trim().toUpperCase();
  if (!REFERENCE_TYPES.includes(tipo)) throw invalid("Seleccione el tipo de referencia: NOG u OC");
  const data = {
    id_proveedor: readId(body.id_proveedor, "la empresa"),
    id_institucion: readId(body.id_institucion, "la institucion"),
    nombre_mantenimiento: readText(body.nombre_mantenimiento, "El nombre del mantenimiento", 180),
    tipo_referencia: tipo,
    numero_referencia: readText(body.numero_referencia, `El numero de ${tipo}`, 80),
    fecha_coordinacion: readDate(body.fecha_coordinacion, "Fecha de coordinacion"),
    fecha_inicio: readDate(body.fecha_inicio, "Fecha de inicio"),
    dias_habiles: readBusinessDays(body.dias_habiles),
  };
  // Las fechas AAAA-MM-DD se comparan correctamente como texto.
  if (data.fecha_inicio < data.fecha_coordinacion) {
    throw invalid("La fecha de inicio no puede ser anterior a la fecha de coordinacion");
  }
  return data;
}

function readHoliday(body = {}) {
  return {
    fecha: readDate(body.fecha, "Fecha del feriado"),
    nombre: readText(body.nombre, "El nombre del feriado", 120),
  };
}

module.exports = { MAX_BUSINESS_DAYS, readBusinessDays, readCoordination, readDate, readHoliday };
