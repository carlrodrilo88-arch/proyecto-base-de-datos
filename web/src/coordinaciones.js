// Validacion de las coordinaciones de trabajo y de los feriados.
// El calculo de dias habiles vive en PostgreSQL (sumar_dias_habiles) porque depende de la tabla feriados.

const MAX_BUSINESS_DAYS = 365;
// La carta de coordinacion tiene espacio para 10 tecnicos como maximo.
const MAX_TECHNICIANS = 10;

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

// Tecnicos asignados: lista sin repetidos de 0 a 10 identificadores.
function readTechnicianIds(value) {
  if (value === undefined || value === null || value === "") return [];
  const list = Array.isArray(value) ? value : [value];
  const ids = [...new Set(list.map((item) => readId(item, "un tecnico valido")))];
  if (ids.length > MAX_TECHNICIANS) throw invalid(`Asigne como maximo ${MAX_TECHNICIANS} tecnicos`);
  return ids;
}

function readOptionalId(value, label) {
  return value === undefined || value === null || value === "" ? null : readId(value, label);
}

function readCoordination(body = {}) {
  const data = {
    id_proveedor: readId(body.id_proveedor, "la empresa"),
    id_institucion: readId(body.id_institucion, "la institucion"),
    nombre_mantenimiento: readText(body.nombre_mantenimiento, "La descripcion del mantenimiento", 600),
    numero_oc: readText(body.numero_oc, "El numero de orden de compra (OC)", 80),
    numero_nog: readText(body.numero_nog, "El numero de NOG", 80),
    id_destinatario: readOptionalId(body.id_destinatario, "un destinatario valido"),
    id_tecnicos: readTechnicianIds(body.id_tecnicos),
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

// DPI guatemalteco: 13 digitos; se aceptan espacios o guiones al escribirlo.
function readDpi(value) {
  const text = String(value ?? "").replace(/[\s-]/g, "");
  if (!text) return null;
  if (!/^\d{13}$/.test(text)) throw invalid("El DPI debe tener 13 digitos");
  return text;
}

function readRecipient(body = {}) {
  return {
    id_institucion: readId(body.id_institucion, "la institucion"),
    nombre: readText(body.nombre, "El nombre del destinatario", 160),
    cargo: readText(body.cargo, "El cargo del destinatario", 160),
  };
}

function readHoliday(body = {}) {
  return {
    fecha: readDate(body.fecha, "Fecha del feriado"),
    nombre: readText(body.nombre, "El nombre del feriado", 120),
  };
}

module.exports = {
  MAX_BUSINESS_DAYS, MAX_TECHNICIANS, readBusinessDays, readCoordination, readDate, readDpi, readHoliday,
  readRecipient,
};
