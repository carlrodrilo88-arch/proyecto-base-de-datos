const loginView = document.querySelector("#loginView");
const appView = document.querySelector("#appView");
const loginForm = document.querySelector("#loginForm");
const loginMessage = document.querySelector("#loginMessage");
const appMessage = document.querySelector("#appMessage");
const userLabel = document.querySelector("#userLabel");
const recordForm = document.querySelector("#recordForm");
const recordFormTitle = document.querySelector("#recordFormTitle");
const tableHead = document.querySelector("#tableHead");
const tableBody = document.querySelector("#tableBody");
const catalogSearch = document.querySelector("#catalogSearch");
const catalogCount = document.querySelector("#catalogCount");
const moduleTitle = document.querySelector("#moduleTitle");
const moduleSubtitle = document.querySelector("#moduleSubtitle");
const clearButton = document.querySelector("#clearButton");
const logoutButton = document.querySelector("#logoutButton");
const catalogPanel = document.querySelector("#catalogPanel");
const reportsPanel = document.querySelector("#reportsPanel");
const passwordPanel = document.querySelector("#passwordPanel");
const passwordForm = document.querySelector("#passwordForm");
const passwordNotice = document.querySelector("#passwordNotice");
const usersNav = document.querySelector("#usersNav");
const devicesNav = document.querySelector("#devicesNav");
const auditNav = document.querySelector("#auditNav");
const techniciansNav = document.querySelector("#techniciansNav");
const companiesNav = document.querySelector("#companiesNav");
const companyOptions = document.querySelector("#companyOptions");
const reportForm = document.querySelector("#reportForm");
const reportFilterForm = document.querySelector("#reportFilterForm");
const reportTableHead = document.querySelector("#reportTableHead");
const reportTableBody = document.querySelector("#reportTableBody");
const reportSummary = document.querySelector("#reportSummary");
const equipmentSearch = document.querySelector("#equipmentSearch");
const equipmentSuggestions = document.querySelector("#equipmentSuggestions");
const selectedEquipmentList = document.querySelector("#selectedEquipmentList");
const newEquipmentToggle = document.querySelector("#newEquipmentToggle");
const newEquipmentPanel = document.querySelector("#newEquipmentPanel");
const templateOptions = document.querySelector("#templateOptions");
const templatePreview = document.querySelector("#templatePreview");
const templateSheet = document.querySelector("#templateSheet");
const activeCheck = document.querySelector("#activeCheck");
const reportReviewDialog = document.querySelector("#reportReviewDialog");
const reviewWarnings = document.querySelector("#reviewWarnings");
const reviewContent = document.querySelector("#reviewContent");
const reviewConfirm = document.querySelector("#reviewConfirm");
const coordinationPanel = document.querySelector("#coordinationPanel");
const coordinationForm = document.querySelector("#coordinationForm");
const coordinationFormTitle = document.querySelector("#coordinationFormTitle");
const coordinationEnd = document.querySelector("#coordinationEnd");
const coordinationSubmit = document.querySelector("#coordinationSubmit");
const coordinationTableHead = document.querySelector("#coordinationTableHead");
const coordinationTableBody = document.querySelector("#coordinationTableBody");
const coordinationListHint = document.querySelector("#coordinationListHint");

// fields: campos visibles del formulario; required: campos obligatorios al crear.
const modules = {
  servicios: {
    title: "Servicios solicitantes",
    subtitle: "Areas o departamentos de cada institucion que solicitan el servicio",
    singular: "servicio solicitante",
    endpoint: "/api/servicios-solicitantes",
    id: "id_servicio_solicitante",
    nameLabel: "Nombre del servicio",
    fields: ["nombre", "id_institucion"],
    required: ["nombre", "id_institucion"],
    columns: ["id_servicio_solicitante", "nombre", "institucion", "activo"],
  },
  tecnicos: {
    title: "Tecnicos",
    subtitle: "Personal tecnico que atiende los equipos",
    singular: "tecnico",
    endpoint: "/api/tecnicos",
    id: "id_tecnico",
    nameLabel: "Nombre completo",
    fields: ["nombre", "dpi", "telefono", "correo", "especialidad", "id_proveedores"],
    required: ["nombre"],
    columns: ["id_tecnico", "nombre", "dpi", "empresas", "telefono", "correo", "especialidad", "activo"],
    companyLegend: "Empresas para las que trabaja el tecnico",
  },
  instituciones: {
    title: "Instituciones",
    subtitle: "Hospitales y centros a los que se presta el servicio",
    singular: "institucion",
    endpoint: "/api/instituciones",
    id: "id_institucion",
    nameLabel: "Nombre de la institucion",
    fields: ["nombre", "telefono", "correo", "direccion", "linea_carta", "id_proveedores"],
    required: ["nombre"],
    columns: ["id_institucion", "nombre", "empresas", "telefono", "correo", "direccion", "activo"],
    companyLegend: "Empresas que atienden la institucion",
  },
  // Persona a quien se dirige la carta de coordinacion; se elige al coordinar un mantenimiento.
  destinatarios: {
    title: "Destinatarios de cartas",
    subtitle: "Nombre y cargo de la persona a quien se dirige la carta de coordinación",
    singular: "destinatario",
    endpoint: "/api/destinatarios",
    id: "id_destinatario",
    nameLabel: "Nombre con título (Ej. Ing. Jahen Gildardo Figueroa Mérida)",
    fields: ["nombre", "cargo", "id_institucion"],
    required: ["nombre", "cargo", "id_institucion"],
    columns: ["nombre", "cargo", "institucion", "activo"],
  },
  proveedores: {
    title: "Empresas y proveedores",
    subtitle: "Teknor, Meditec y GT Medical usan su propia plantilla de reporte",
    singular: "empresa",
    endpoint: "/api/proveedores",
    id: "id_proveedor",
    nameLabel: "Nombre comercial",
    fields: ["nombre", "nit", "telefono", "correo", "direccion", "pie_pagina"],
    required: ["nombre"],
    columns: ["id_proveedor", "nombre", "nit", "telefono", "correo", "pie_pagina", "activo"],
  },
  equipos_medicos: {
    title: "Equipos medicos",
    subtitle: "Inventario de equipos por institucion",
    singular: "equipo",
    endpoint: "/api/equipos-medicos",
    id: "id_equipo_medico",
    nameLabel: "Descripcion del equipo",
    fields: ["nombre", "id_institucion", "numero_bien", "numero_serie", "marca", "modelo"],
    required: ["nombre", "id_institucion", "marca", "modelo"],
    columns: ["id_equipo_medico", "nombre", "institucion", "numero_bien", "numero_serie", "marca", "modelo", "activo"],
  },
  usuarios: {
    title: "Usuarios y permisos",
    subtitle: "Cuentas de acceso y rol asignado",
    singular: "usuario",
    endpoint: "/api/usuarios",
    id: "id_usuario",
    nameLabel: "Nombre completo",
    fields: ["nombre", "usuario", "correo", "id_rol", "password_temporal", "generar_password", "id_proveedores"],
    required: ["nombre", "usuario", "id_rol", "password_temporal"],
    columns: ["id_usuario", "nombre", "usuario", "correo", "rol", "empresas", "debe_cambiar_password", "activo"],
    companyLegend: "Empresas del usuario (el administrador ve todas)",
  },
  equipos_autorizados: {
    title: "Constancia de computadoras",
    subtitle: "Registro inactivo de las computadoras utilizadas durante el proyecto",
    singular: "computadora",
    endpoint: "/api/equipos-autorizados",
    id: "id_equipo_autorizado",
    nameLabel: "Nombre de la computadora",
    fields: ["nombre", "identificador_equipo", "descripcion"],
    required: ["nombre", "identificador_equipo"],
    columns: ["id_equipo_autorizado", "nombre", "identificador_equipo", "descripcion", "activo"],
    // Siempre inactivas; al no tener historial propio se eliminan en lugar de desactivarse.
    fixedActive: true,
    hardDelete: true,
    activeValue: false,
  },
  // Dias no habiles para el plazo de las coordinaciones; no tienen historial propio.
  feriados: {
    title: "Feriados",
    subtitle: "Días que no cuentan como hábiles en la coordinación de trabajos",
    singular: "feriado",
    endpoint: "/api/feriados",
    id: "id_feriado",
    nameLabel: "Nombre del feriado",
    fields: ["fecha", "nombre"],
    required: ["fecha", "nombre"],
    columns: ["fecha", "nombre"],
    fixedActive: true,
    hardDelete: true,
  },
  // Eventos registrados por los triggers; el modulo es de solo lectura.
  auditoria: {
    title: "Auditoría",
    subtitle: "Últimos 500 cambios registrados automáticamente por la base de datos",
    endpoint: "/api/auditoria",
    id: "id_evento",
    fields: [],
    required: [],
    columns: ["fecha_evento", "usuario", "entidad", "entidad_id", "accion", "detalle"],
    readOnly: true,
  },
};

const headers = {
  nombre: "Nombre", institucion: "Institucion", activo: "Estado", telefono: "Telefono",
  correo: "Correo", especialidad: "Especialidad", direccion: "Direccion", nit: "NIT",
  pie_pagina: "Pie de pagina", numero_bien: "No. bien", numero_serie: "No. serie",
  marca: "Marca", modelo: "Modelo", rol: "Rol", usuario: "Usuario", debe_cambiar_password: "Contrasena",
  codigo_reporte: "Codigo", fecha_reporte: "Fecha", servicio_solicitante: "Servicio",
  proveedor_plantilla: "Plantilla", titulo: "Asunto", estado: "Estado",
  identificador_equipo: "Identificador", descripcion: "Descripción", tecnicos: "Técnicos",
  fecha_evento: "Fecha y hora", entidad: "Entidad", entidad_id: "ID", accion: "Acción", detalle: "Detalle",
  empresas: "Empresas", creador: "Creado por", fecha: "Fecha", dpi: "DPI", cargo: "Cargo",
};

// El generador solo registra instituciones, servicios y equipos; editar catalogos es del administrador.
const generatorCreates = ["instituciones", "servicios", "equipos_medicos", "destinatarios"];

function canCreateRecords(config) {
  if (config.readOnly) return false;
  if (currentUser?.rol === "administrador") return true;
  return currentUser?.rol === "generador_reportes" && generatorCreates.includes(activeModule);
}

const serviceTypeLabels = {
  garantia: "Garantia", preventivo: "Mantenimiento preventivo",
  correctivo: "Mantenimiento correctivo", emergencia: "Llamada de emergencia", otros: "Otros",
};

let activeModule = "reportes";
let currentUser = null;
let reportCatalogs = null;
let selectedEquipmentIds = [];
let equipmentServices = {};
let catalogRows = [];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeSearch(value) {
  return String(value ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function showMessage(text, type = "error") {
  appMessage.textContent = text || "";
  appMessage.classList.toggle("success", type === "success");
  if (text) appMessage.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function todayIso() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

// Las fechas DATE llegan como ISO; se muestran como DD/MM/AAAA sin convertir zona horaria.
function formatDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value ?? ""));
  return match ? `${match[3]}/${match[2]}/${match[1]}` : escapeHtml(value);
}

const weekdayNames = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

// Dia de la semana de una fecha AAAA-MM-DD, calculado en UTC para no correr el dia por la zona horaria.
function weekdayName(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value ?? ""));
  if (!match) return "";
  return weekdayNames[new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))).getUTCDay()];
}

function renderCell(column, value) {
  if (column === "activo") {
    return value ? '<span class="badge ok">Activo</span>' : '<span class="badge off">Inactivo</span>';
  }
  if (column === "debe_cambiar_password") {
    return value ? '<span class="badge borrador">Temporal</span>' : '<span class="badge">Definida</span>';
  }
  if (column === "estado") return `<span class="badge ${escapeHtml(value)}">${escapeHtml(value)}</span>`;
  if (column === "fecha_reporte") return `<span class="code">${formatDate(value)}</span>`;
  if (column === "fecha") return `<span class="code">${formatDate(value)}</span> <span class="muted">${weekdayName(value)}</span>`;
  if (column === "fecha_evento") return `<span class="code">${escapeHtml(new Date(value).toLocaleString("es-GT"))}</span>`;
  if (column === "codigo_reporte") return `<span class="code">${escapeHtml(value)}</span>`;
  if (column === "dpi" && value) return `<span class="code">${escapeHtml(formatDpi(value))}</span>`;
  return value === null || value === undefined || value === "" ? '<span class="muted">—</span>' : escapeHtml(value);
}

// "2566314090901" -> "2566 31409 0901", como se imprime en la carta.
function formatDpi(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length === 13 ? `${digits.slice(0, 4)} ${digits.slice(4, 9)} ${digits.slice(9)}` : String(value || "");
}

function headerCells(columns) {
  return columns.map((column) => `<th>${escapeHtml(headers[column] || "#")}</th>`).join("") + "<th></th>";
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Error de comunicacion" }));
    if (response.status === 401 && currentUser) showLogin("La sesion expiro. Ingrese nuevamente.");
    throw new Error(error.error || "Error de comunicacion");
  }
  if (response.status === 204) return null;
  return response.json();
}

/* Sesion */

function showLogin(message = "") {
  currentUser = null;
  reportCatalogs = null;
  appView.classList.add("hidden");
  loginView.classList.remove("hidden");
  loginMessage.textContent = message;
}

function showApp(usuario) {
  currentUser = usuario;
  loginView.classList.add("hidden");
  appView.classList.remove("hidden");
  userLabel.textContent = `${usuario.nombre} · ${usuario.rol.replace("_", " ")}`;
  usersNav.classList.toggle("hidden", usuario.rol !== "administrador");
  devicesNav.classList.toggle("hidden", usuario.rol !== "administrador");
  auditNav.classList.toggle("hidden", usuario.rol !== "administrador");
  techniciansNav.classList.toggle("hidden", usuario.rol !== "administrador");
  companiesNav.classList.toggle("hidden", usuario.rol !== "administrador");
  passwordNotice.textContent = usuario.debe_cambiar_password
    ? "Debe cambiar la contrasena temporal antes de continuar."
    : "Actualice su contrasena personal.";
  return openModule(usuario.debe_cambiar_password ? "password" : "reportes");
}

async function openModule(name) {
  activeModule = name;
  showMessage("");
  configureModule();
  try {
    if (name === "reportes") {
      await Promise.all([loadReportCatalogs(), loadReports()]);
    } else if (name === "coordinaciones") {
      await Promise.all([loadCoordinationCatalogs(), loadCoordinations()]);
    } else if (name !== "password") {
      await loadRows();
    }
  } catch (error) {
    showMessage(error.message);
  }
}

function configureModule() {
  const isReports = activeModule === "reportes";
  const isPassword = activeModule === "password";
  const isCoordination = activeModule === "coordinaciones";
  catalogPanel.classList.toggle("hidden", isReports || isPassword || isCoordination);
  reportsPanel.classList.toggle("hidden", !isReports);
  passwordPanel.classList.toggle("hidden", !isPassword);
  coordinationPanel.classList.toggle("hidden", !isCoordination);
  document.querySelectorAll(".nav-button").forEach((button) => {
    const isActive = button.dataset.module === activeModule;
    button.classList.toggle("active", isActive);
    if (isActive) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  if (isPassword) {
    moduleTitle.textContent = "Cambiar mi contrasena";
    moduleSubtitle.textContent = "Minimo 10 caracteres, con letras y numeros";
    return;
  }
  if (isReports) {
    const canEdit = currentUser?.rol !== "consulta";
    moduleTitle.textContent = canEdit ? "Nuevo reporte de servicio" : "Reportes";
    moduleSubtitle.textContent = canEdit
      ? "Elija la empresa, la institucion y los equipos; el sistema genera un PDF por equipo"
      : "Consulta de reportes y documentos publicados";
    reportForm.classList.toggle("hidden", !canEdit);
    return;
  }
  if (isCoordination) {
    const canEdit = canEditCoordinations();
    moduleTitle.textContent = "Coordinación de trabajos";
    moduleSubtitle.textContent = canEdit
      ? "Registre el mantenimiento coordinado; el sistema calcula el último día con días hábiles"
      : "Consulta de mantenimientos coordinados y sus plazos";
    coordinationForm.classList.toggle("hidden", !canEdit);
    resetCoordinationForm();
    return;
  }
  const config = modules[activeModule];
  moduleTitle.textContent = config.title;
  moduleSubtitle.textContent = config.subtitle;
  if (config.nameLabel) recordForm.querySelector('[data-field="nombre"] > span').textContent = config.nameLabel;
  recordForm.querySelectorAll("[data-field]").forEach((label) => {
    const name = label.dataset.field;
    const control = recordForm.elements[name];
    label.classList.toggle("hidden", !config.fields.includes(name));
    if (control instanceof HTMLInputElement || control instanceof HTMLSelectElement) {
      control.required = config.required.includes(name);
    }
  });
  if (config.companyLegend) document.querySelector("#companyLegend").textContent = config.companyLegend;
  recordForm.classList.toggle("hidden", !canCreateRecords(config));
  activeCheck.classList.toggle("hidden", config.fixedActive === true);
  catalogSearch.value = "";
  resetForm();
}

function resetForm() {
  const config = modules[activeModule];
  recordForm.reset();
  recordForm.elements.id.value = "";
  recordForm.elements.activo.checked = config?.activeValue ?? true;
  recordForm.classList.remove("editing");
  if (!config || config.readOnly) return;
  recordFormTitle.textContent = `Nuevo ${config.singular}`;
  const password = recordForm.elements.password_temporal;
  password.required = activeModule === "usuarios";
  password.disabled = false;
  password.closest("label").firstChild.textContent = "Contrasena temporal";
  checkSingleCompany();
}

// FormData conserva solo el ultimo valor repetido; las casillas se leen aparte.
function checkedValues(form, name) {
  return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);
}

// Si solo hay una empresa disponible (generador con una empresa) se marca de antemano.
function checkSingleCompany() {
  const boxes = companyOptions.querySelectorAll('input[name="id_proveedores"]');
  if (boxes.length === 1 && activeModule !== "usuarios") boxes[0].checked = true;
}

/* Catalogos */

function renderRows() {
  const config = modules[activeModule];
  const query = normalizeSearch(catalogSearch.value.trim());
  const rows = query
    ? catalogRows.filter((row) => normalizeSearch(config.columns.map((column) => row[column]).join(" ")).includes(query))
    : catalogRows;
  catalogCount.textContent = `${rows.length} de ${catalogRows.length} registro(s)`;
  tableHead.innerHTML = headerCells(config.columns);
  if (!rows.length) {
    tableBody.innerHTML = `<tr><td class="empty" colspan="${config.columns.length + 1}">No hay registros para mostrar.</td></tr>`;
    return;
  }
  tableBody.innerHTML = rows.map((row) => `
    <tr>
      ${config.columns.map((column) => `<td>${renderCell(column, row[column])}</td>`).join("")}
      <td class="actions">
        ${currentUser?.rol === "administrador" && !config.readOnly ? `<button class="secondary small" data-edit="${escapeHtml(row[config.id])}">Editar</button>` : ""}
        ${currentUser?.rol === "administrador" && !config.readOnly && (row.activo || config.hardDelete) ? `<button class="secondary small danger-text" data-delete="${escapeHtml(row[config.id])}">${config.hardDelete ? "Eliminar" : "Desactivar"}</button>` : ""}
      </td>
    </tr>`).join("");
}

async function loadRows() {
  const config = modules[activeModule];
  if (config.fields.includes("id_institucion")) {
    const instituciones = await api("/api/instituciones");
    recordForm.elements.id_institucion.innerHTML = '<option value="">Seleccione institucion</option>' + instituciones
      .filter((item) => item.activo)
      .map((item) => `<option value="${escapeHtml(item.id_institucion)}">${escapeHtml(item.nombre)}</option>`)
      .join("");
  }
  if (config.fields.includes("id_proveedores")) {
    const companies = (await api("/api/proveedores")).filter((item) => item.activo && item.codigo_plantilla);
    companyOptions.innerHTML = companies.length
      ? companies.map((item) => `
        <label class="check">
          <input type="checkbox" name="id_proveedores" value="${escapeHtml(item.id_proveedor)}">
          ${escapeHtml(item.nombre)}
        </label>`).join("")
      : '<p class="hint">No hay empresas activas disponibles.</p>';
    checkSingleCompany();
  }
  if (activeModule === "usuarios") {
    const roles = await api("/api/roles");
    recordForm.elements.id_rol.innerHTML = '<option value="">Seleccione rol</option>' + roles
      .map((item) => `<option value="${escapeHtml(item.id_rol)}">${escapeHtml(item.nombre)}</option>`)
      .join("");
  }
  catalogRows = await api(config.endpoint);
  renderRows();
}

catalogSearch.addEventListener("input", renderRows);

recordForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const config = modules[activeModule];
  const values = Object.fromEntries(new FormData(recordForm));
  const id = values.id;
  const payload = { activo: config.activeValue ?? recordForm.elements.activo.checked };
  for (const field of config.fields) {
    if (field === "password_temporal" && !values.password_temporal) continue;
    if (field === "generar_password") {
      payload[field] = recordForm.elements.generar_password.checked;
      continue;
    }
    payload[field] = field === "id_proveedores" ? checkedValues(recordForm, field) : values[field];
  }
  if (activeModule === "instituciones" && payload.id_proveedores.length === 0) {
    showMessage("Seleccione al menos una empresa que atienda la institucion.");
    return;
  }
  if (activeModule === "tecnicos" && payload.id_proveedores.length === 0) {
    showMessage("Seleccione al menos una empresa para la que trabaje el tecnico.");
    return;
  }
  try {
    const saved = await api(id ? `${config.endpoint}/${id}` : config.endpoint, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload),
    });
    resetForm();
    await loadRows();
    if (saved?.password_temporal) {
      showMessage(`Contrasena temporal generada para "${saved.usuario}": ${saved.password_temporal} `
        + "(copiela ahora; no se volvera a mostrar).", "success");
      return;
    }
    showMessage(saved?.ya_existia
      ? `La institucion "${saved.nombre}" ya estaba registrada; se enlazo a la empresa seleccionada sin duplicarla.`
      : id ? "Cambios guardados." : "Registro creado.", "success");
  } catch (error) {
    showMessage(error.message);
  }
});

tableBody.addEventListener("click", async (event) => {
  const config = modules[activeModule];
  const editId = event.target.dataset.edit;
  const deleteId = event.target.dataset.delete;

  if (editId) {
    const row = catalogRows.find((item) => String(item[config.id]) === editId);
    if (!row) return;
    resetForm();
    recordForm.elements.id.value = row[config.id];
    for (const field of config.fields) {
      if (field === "id_proveedores") {
        const linked = (row.id_proveedores || []).map(String);
        companyOptions.querySelectorAll('input[name="id_proveedores"]').forEach((input) => {
          input.checked = linked.includes(input.value);
        });
      } else if (field !== "password_temporal" && field !== "generar_password") {
        recordForm.elements[field].value = row[field] ?? "";
      }
    }
    recordForm.elements.activo.checked = row.activo;
    if (activeModule === "usuarios") {
      const password = recordForm.elements.password_temporal;
      password.required = false;
      password.closest("label").firstChild.textContent = "Nueva contrasena temporal (opcional)";
    }
    recordFormTitle.textContent = `Editar ${config.singular}: ${row.nombre}`;
    recordForm.classList.add("editing");
    recordForm.scrollIntoView({ behavior: "smooth", block: "start" });
    recordForm.elements.nombre.focus({ preventScroll: true });
  }

  if (deleteId) {
    const row = catalogRows.find((item) => String(item[config.id]) === deleteId);
    const question = config.hardDelete
      ? `¿Eliminar "${row?.nombre ?? deleteId}"? Esta accion no se puede deshacer.`
      : `¿Desactivar "${row?.nombre ?? deleteId}"? Dejara de aparecer en los formularios.`;
    if (!window.confirm(question)) return;
    try {
      await api(`${config.endpoint}/${deleteId}`, { method: "DELETE" });
      await loadRows();
      showMessage(config.hardDelete ? "Registro eliminado." : "Registro desactivado.", "success");
    } catch (error) {
      showMessage(error.message);
    }
  }
});

clearButton.addEventListener("click", resetForm);

// Al generar la contrasena en el servidor, el campo manual queda deshabilitado.
recordForm.elements.generar_password.addEventListener("change", (event) => {
  const password = recordForm.elements.password_temporal;
  password.disabled = event.target.checked;
  if (event.target.checked) password.value = "";
  password.required = !event.target.checked && activeModule === "usuarios" && !recordForm.elements.id.value;
});

/* Reportes: institucion, servicio y equipos */

function selectedInstitutionId() {
  return reportForm.elements.id_institucion_reporte.value;
}

function selectedCompanyId() {
  return reportForm.querySelector('input[name="id_proveedor_plantilla"]:checked')?.value || "";
}

// Solo se ofrecen las instituciones que atiende la empresa elegida.
function fillInstitutions() {
  const company = selectedCompanyId();
  const select = reportForm.elements.id_institucion_reporte;
  const items = company
    ? reportCatalogs.instituciones.filter((item) => item.id_proveedores.includes(company))
    : [];
  const placeholder = !company ? "Seleccione primero la empresa"
    : items.length ? "Seleccione institucion" : "La empresa no tiene instituciones asignadas";
  select.innerHTML = selectOptions(placeholder, items.map((item) => [item.id, item.nombre]));
  if (items.length === 1) select.value = String(items[0].id);
  select.disabled = !company;
  onInstitutionChange();
}

function equipmentForSelectedInstitution() {
  const institution = selectedInstitutionId();
  return institution
    ? reportCatalogs.equipos_medicos.filter((item) => String(item.id_institucion) === institution)
    : [];
}

function equipmentMeta(item) {
  return [
    item.numero_bien ? `Bien: ${item.numero_bien}` : null,
    item.numero_serie ? `Serie: ${item.numero_serie}` : null,
    [item.marca, item.modelo].filter(Boolean).join(" ") || null,
  ].filter(Boolean).join(" · ");
}

function updateReportSummary() {
  const count = selectedEquipmentIds.length;
  reportSummary.textContent = count
    ? `${count} equipo(s) seleccionado(s): se publicaran ${count} reporte(s).`
    : "Ningun equipo seleccionado.";
}

function renderSelectedEquipment() {
  const rows = equipmentForSelectedInstitution().filter((item) => selectedEquipmentIds.includes(String(item.id)));
  selectedEquipmentList.innerHTML = rows.map((item) => `
    <div class="selected-equipment">
      <div>
        <span class="equipment-name">${escapeHtml(item.nombre)}</span>
        <span class="equipment-meta">${escapeHtml(equipmentMeta(item))}</span>
      </div>
      <label class="field equipment-service">Servicio solicitante
        <select data-equipment-service="${escapeHtml(item.id)}" required>
          ${selectOptions("Seleccione servicio", reportCatalogs.servicios
            .filter((service) => String(service.id_institucion) === selectedInstitutionId())
            .map((service) => [service.id, service.servicio || service.nombre]))}
        </select>
      </label>
      <button type="button" class="secondary small" data-remove-equipment="${escapeHtml(item.id)}">Quitar</button>
    </div>`).join("");
  selectedEquipmentList.querySelectorAll('[data-equipment-service]').forEach((select) => {
    select.value = equipmentServices[select.dataset.equipmentService] || "";
  });
  updateReportSummary();
}

function renderEquipmentSuggestions() {
  const query = normalizeSearch(equipmentSearch.value.trim());
  if (!query || !selectedInstitutionId()) {
    equipmentSuggestions.classList.add("hidden");
    equipmentSuggestions.innerHTML = "";
    return;
  }
  const matches = equipmentForSelectedInstitution()
    .filter((item) => !selectedEquipmentIds.includes(String(item.id)))
    .filter((item) => normalizeSearch([
      item.nombre, item.numero_bien, item.numero_serie, item.marca, item.modelo,
    ].join(" ")).includes(query))
    .slice(0, 10);
  equipmentSuggestions.innerHTML = matches.length
    ? matches.map((item) => `<button type="button" role="option" data-add-equipment="${escapeHtml(item.id)}">
        <span class="equipment-name">${escapeHtml(item.nombre)}</span>
        <span class="equipment-meta">${escapeHtml(equipmentMeta(item))}</span>
      </button>`).join("")
    : "<p>No hay coincidencias en esta institucion. Puede registrar el equipo como nuevo.</p>";
  equipmentSuggestions.classList.remove("hidden");
}

function resetEquipmentSelection() {
  selectedEquipmentIds = [];
  equipmentServices = {};
  equipmentSearch.value = "";
  renderSelectedEquipment();
  renderEquipmentSuggestions();
}

function fillServices() {
  const institution = selectedInstitutionId();
  equipmentSearch.disabled = !institution;
  newEquipmentToggle.disabled = !institution;
  equipmentSearch.placeholder = institution
    ? "Buscar por numero de bien, serie, descripcion, marca o modelo"
    : "Seleccione primero la institucion";
}

function onInstitutionChange() {
  fillServices();
  resetEquipmentSelection();
  newEquipmentPanel.classList.add("hidden");
}

async function loadReportCatalogs() {
  reportCatalogs = await api("/api/reportes/catalogos");
  fillReportFilters(reportCatalogs.instituciones.map((item) => [item.id, item.nombre]));
  templateOptions.innerHTML = reportCatalogs.proveedores.length
    ? reportCatalogs.proveedores.map((company, index) => `
      <label class="template-option">
        <input type="radio" name="id_proveedor_plantilla" value="${escapeHtml(company.id)}" ${index === 0 ? "required" : ""}>
        <img src="${escapeHtml(company.plantilla.logo)}" alt="" width="170" height="64">
        <span>${escapeHtml(company.nombre)}</span>
        <small>${company.plantilla.pedido ? "Incluye pedido / NOG" : "Sin pedido / NOG"}</small>
      </label>`).join("")
    : '<p class="hint">Su usuario no tiene empresas asignadas. Solicite al administrador que lo enlace a una empresa.</p>';
  resetReportForm();
}

// Solo se ofrecen los tecnicos que trabajan para la empresa que emite el reporte.
function technicianCheckboxes(company, selected = []) {
  if (!company) return '<p class="hint">Seleccione primero la empresa.</p>';
  const items = reportCatalogs.tecnicos.filter((item) => item.id_proveedores.includes(String(company)));
  if (!items.length) {
    return '<p class="hint">La empresa no tiene tecnicos activos. El administrador los asigna en el modulo Tecnicos.</p>';
  }
  return items.map((item) => `
    <label class="check">
      <input type="checkbox" name="id_tecnicos" value="${escapeHtml(item.id)}" ${selected.includes(String(item.id)) ? "checked" : ""}>
      ${escapeHtml(item.nombre)}${item.especialidad ? ` <span class="muted">· ${escapeHtml(item.especialidad)}</span>` : ""}
    </label>`).join("");
}

function checkedTechnicians(form) {
  return checkedValues(form, "id_tecnicos");
}

function selectOptions(placeholder, items) {
  return `<option value="">${escapeHtml(placeholder)}</option>`
    + items.map(([id, name]) => `<option value="${escapeHtml(id)}">${escapeHtml(name)}</option>`).join("");
}

function fillReportFilters(institutions) {
  const filters = reportFilterForm.elements;
  filters.id_institucion.innerHTML = selectOptions("Todas las instituciones", institutions);
  filters.id_servicio_solicitante.innerHTML = selectOptions("Todos los servicios",
    reportCatalogs.servicios.map((item) => [item.id, item.nombre]));
  filters.id_tecnico.innerHTML = selectOptions("Todos los tecnicos",
    reportCatalogs.tecnicos.map((item) => [item.id, item.nombre]));
}

function resetReportForm() {
  reportForm.reset();
  reportForm.elements.fecha_reporte.value = todayIso();
  reportForm.elements.titulo.dataset.auto = "1";
  newEquipmentPanel.classList.add("hidden");
  const companies = templateOptions.querySelectorAll('input[name="id_proveedor_plantilla"]');
  if (companies.length === 1) companies[0].checked = true;
  fillTechnicians();
  fillInstitutions();
  updateTemplatePreview();
}

reportForm.elements.id_institucion_reporte.addEventListener("change", onInstitutionChange);

reportForm.elements.tipo_servicio.addEventListener("change", () => {
  const title = reportForm.elements.titulo;
  if (title.dataset.auto === "1" || !title.value.trim()) {
    title.value = serviceTypeLabels[reportForm.elements.tipo_servicio.value] || "";
    title.dataset.auto = "1";
  }
});

reportForm.elements.titulo.addEventListener("input", (event) => {
  event.target.dataset.auto = event.target.value.trim() ? "0" : "1";
});

equipmentSearch.addEventListener("input", renderEquipmentSuggestions);

equipmentSearch.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    equipmentSearch.value = "";
    renderEquipmentSuggestions();
  }
  if (event.key === "Enter") {
    event.preventDefault();
    equipmentSuggestions.querySelector("[data-add-equipment]")?.click();
  }
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".equipment-picker")) equipmentSuggestions.classList.add("hidden");
});

function addEquipment(id) {
  if (!id || selectedEquipmentIds.includes(id)) return;
  selectedEquipmentIds.push(id);
  equipmentSearch.value = "";
  renderSelectedEquipment();
  renderEquipmentSuggestions();
}

equipmentSuggestions.addEventListener("click", (event) => {
  addEquipment(event.target.closest("[data-add-equipment]")?.dataset.addEquipment);
  equipmentSearch.focus();
});

selectedEquipmentList.addEventListener("click", (event) => {
  const id = event.target.dataset.removeEquipment;
  if (!id) return;
  selectedEquipmentIds = selectedEquipmentIds.filter((item) => item !== id);
  delete equipmentServices[id];
  renderSelectedEquipment();
});

selectedEquipmentList.addEventListener("change", (event) => {
  const id = event.target.dataset.equipmentService;
  if (id) equipmentServices[id] = event.target.value;
});

function newEquipmentInputs() {
  return Object.fromEntries([...newEquipmentPanel.querySelectorAll("[data-equipment]")]
    .map((input) => [input.dataset.equipment, input]));
}

newEquipmentToggle.addEventListener("click", () => {
  newEquipmentPanel.classList.toggle("hidden");
  if (!newEquipmentPanel.classList.contains("hidden")) newEquipmentInputs().nombre.focus();
});

document.querySelector("#newEquipmentCancel").addEventListener("click", () => {
  Object.values(newEquipmentInputs()).forEach((input) => { input.value = ""; });
  newEquipmentPanel.classList.add("hidden");
});

document.querySelector("#newEquipmentSave").addEventListener("click", async () => {
  const inputs = newEquipmentInputs();
  const data = Object.fromEntries(Object.entries(inputs).map(([key, input]) => [key, input.value.trim()]));
  const missing = ["nombre", "marca", "modelo"].find((key) => !data[key]);
  if (missing) {
    showMessage("Complete descripcion, marca y modelo del equipo.");
    inputs[missing].focus();
    return;
  }
  if (!data.numero_bien && !data.numero_serie) {
    showMessage("Indique el numero de bien o el numero de serie del equipo.");
    inputs.numero_bien.focus();
    return;
  }
  try {
    const row = await api("/api/equipos-medicos", {
      method: "POST",
      body: JSON.stringify({ ...data, id_institucion: selectedInstitutionId(), activo: true }),
    });
    reportCatalogs.equipos_medicos.push({
      id: row.id_equipo_medico, id_institucion: row.id_institucion, nombre: row.nombre,
      numero_bien: row.numero_bien, numero_serie: row.numero_serie, marca: row.marca, modelo: row.modelo,
    });
    Object.values(inputs).forEach((input) => { input.value = ""; });
    newEquipmentPanel.classList.add("hidden");
    addEquipment(String(row.id_equipo_medico));
    showMessage(`Equipo "${row.nombre}" registrado y agregado al reporte.`, "success");
  } catch (error) {
    showMessage(error.message);
  }
});

/* Reportes: plantilla */

function updateTemplatePreview() {
  const selected = reportForm.querySelector('input[name="id_proveedor_plantilla"]:checked');
  const company = reportCatalogs?.proveedores.find((item) => String(item.id) === selected?.value);
  const template = company?.plantilla;
  templatePreview.classList.toggle("hidden", !template);
  document.querySelector("#pedidoField").classList.toggle("hidden", Boolean(template && !template.pedido));
  if (!template) {
    templateSheet.replaceChildren();
    document.querySelector("#templateLink").removeAttribute("href");
    return;
  }
  if (!template.pedido) reportForm.elements.numero_pedido_nog.value = "";
  document.querySelector("#templateName").textContent = template.name;
  document.querySelector("#templateLink").href = `/api/reportes/plantilla/${encodeURIComponent(company.id)}`;
  templateSheet.dataset.template = template.key;
  const field = (label) => `<div class="sheet-field"><strong>${label}</strong><span></span></div>`;
  templateSheet.innerHTML = `
    <div class="sheet-header">
      <img src="${escapeHtml(template.logo)}" alt="${escapeHtml(template.name)}">
      <strong>REPORTE DE SERVICIO</strong>
    </div>
    <p class="sheet-number">Muestra de plantilla</p>
    <div class="sheet-columns">${field("FECHA")}${template.pedido ? field("NUMERO DE PEDIDO Y NOG") : ""}</div>
    ${field("NOMBRE DEL CLIENTE / INSTITUCION")}
    ${field("SERVICIO SOLICITANTE")}${field("DESCRIPCION DEL EQUIPO")}
    <div class="sheet-columns">${field("MARCA")}${field("MODELO")}${field("NUMERO DE SERIE")}${field("NUMERO DE BIEN")}</div>
    ${template.key === "meditec" ? '<p class="sheet-service-types">○ Garantia &nbsp; ○ Preventivo &nbsp; ○ Correctivo &nbsp; ○ Emergencia &nbsp; ○ Otros</p>' : ""}
    <div class="sheet-section"><strong>DESCRIPCION DEL SERVICIO / ESPECIFICACIONES TECNICAS</strong><span></span></div>
    <div class="sheet-section"><strong>RECOMENDACIONES</strong><span></span></div>
    <div class="sheet-signatures">${template.signatures.map((signature) => `<div><strong>${escapeHtml(signature)}</strong><span>NOMBRE, FIRMA Y SELLO</span></div>`).join("")}</div>`;
}

function fillTechnicians() {
  document.querySelector("#technicianOptions").innerHTML = technicianCheckboxes(selectedCompanyId());
}

templateOptions.addEventListener("change", () => {
  fillTechnicians();
  fillInstitutions();
  updateTemplatePreview();
});

/* Reportes: creacion y consulta */

function writingWarnings(values) {
  const warnings = [];
  const fields = [
    ["Asunto", values.titulo],
    ["Descripción del servicio", values.especificaciones_tecnicas],
    ["Recomendaciones", values.recomendaciones],
  ];
  for (const [label, rawValue] of fields) {
    const value = String(rawValue || "").trim();
    if (!value) continue;
    if (/\s{2,}/.test(value)) warnings.push(`${label}: contiene espacios repetidos.`);
    if (/\b([a-záéíóúñü]{3,})\s+\1\b/iu.test(value)) warnings.push(`${label}: parece contener una palabra repetida.`);
    const letters = value.replace(/[^a-záéíóúñü]/giu, "");
    if (letters.length > 20 && letters === letters.toUpperCase()) warnings.push(`${label}: revise el uso de mayúsculas.`);
    if (value.length > 35 && !/[.!?;:]$/.test(value)) warnings.push(`${label}: considere agregar puntuación al final.`);
  }
  if (String(values.especificaciones_tecnicas || "").trim().length < 25) {
    warnings.push("Descripción del servicio: detalle brevemente el trabajo realizado.");
  }
  return warnings;
}

function reviewField(label, value) {
  return `<div class="review-field"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || "—")}</strong></div>`;
}

function openReportReview() {
  if (!reportForm.reportValidity()) return;
  if (selectedEquipmentIds.length === 0) {
    showMessage("Agregue al menos un equipo al reporte.");
    equipmentSearch.focus();
    return;
  }
  showMessage("");
  const values = Object.fromEntries(new FormData(reportForm));
  const selectedCompany = reportCatalogs.proveedores.find((item) => String(item.id) === values.id_proveedor_plantilla);
  const equipment = equipmentForSelectedInstitution().filter((item) => selectedEquipmentIds.includes(String(item.id)));
  const warnings = writingWarnings(values);
  reviewWarnings.innerHTML = warnings.length
    ? `<h3>Revise estas observaciones</h3><ul>${warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")}</ul>
       <p>Use “Volver y corregir” si necesita hacer cambios. El corrector del navegador también está activo en los campos de texto.</p>`
    : "<p><strong>Revisión básica completada.</strong> No se detectaron problemas evidentes. Compruebe nombres y términos técnicos antes de continuar.</p>";
  reviewWarnings.classList.toggle("ok", warnings.length === 0);
  reviewContent.innerHTML = `
    <section>
      <h3>Atención</h3>
      <div class="review-grid">
        ${reviewField("Institución", reportForm.elements.id_institucion_reporte.selectedOptions[0]?.textContent)}
        ${reviewField("Fecha", formatDate(values.fecha_reporte))}
        ${reviewField("Plantilla", selectedCompany?.nombre)}
        ${reviewField("Tipo de servicio", serviceTypeLabels[values.tipo_servicio])}
        ${reviewField("Asunto", values.titulo)}
        ${reviewField("Técnicos", reportCatalogs.tecnicos
          .filter((item) => checkedTechnicians(reportForm).includes(String(item.id)))
          .map((item) => item.nombre).join(", "))}
      </div>
    </section>
    <section>
      <h3>${equipment.length} ${equipment.length === 1 ? "equipo" : "equipos"} · se publicará un PDF por equipo</h3>
      <div class="review-equipment">${equipment.map((item) => `
        <div><strong>${escapeHtml(item.nombre)}</strong><span>${escapeHtml(equipmentMeta(item) || "Sin identificadores adicionales")}</span>
          ${reviewField("Servicio solicitante", reportCatalogs.servicios.find((service) => String(service.id) === equipmentServices[item.id])?.servicio
            || reportCatalogs.servicios.find((service) => String(service.id) === equipmentServices[item.id])?.nombre)}</div>`).join("")}</div>
    </section>
    <section>
      <h3>Contenido técnico</h3>
      ${reviewField("Descripción del servicio", values.especificaciones_tecnicas)}
      ${reviewField("Recomendaciones", values.recomendaciones)}
    </section>`;
  reportReviewDialog.showModal();
}

reportForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  openReportReview();
});

function closeReportReview() {
  reportReviewDialog.close();
}

document.querySelector("#reviewBack").addEventListener("click", closeReportReview);
document.querySelector("#reviewClose").addEventListener("click", closeReportReview);
reportReviewDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeReportReview();
});

reviewConfirm.addEventListener("click", async () => {
  const values = Object.fromEntries(new FormData(reportForm));
  delete values.id_institucion_reporte;
  values.equipos = selectedEquipmentIds.map((id) => ({
    id_equipo_medico: id, id_servicio_solicitante: equipmentServices[id],
  }));
  values.id_tecnicos = checkedTechnicians(reportForm);
  values.publicar = true;
  reviewConfirm.disabled = true;
  reviewConfirm.textContent = "Creando y publicando…";
  // Abrir durante el clic permite al navegador autorizar las pestañas del lote.
  const previewWindows = values.equipos.map(() => window.open("about:blank", "_blank"));
  try {
    const result = await api("/api/reportes", {
      method: "POST",
      body: JSON.stringify(values),
    });
    const reportes = result.reportes || [result];
    closeReportReview();
    resetReportForm();
    let blocked = 0;
    reportes.forEach((report, index) => {
      const preview = previewWindows[index];
      if (preview && !preview.closed) {
        preview.location = `/api/reportes/${report.id_reporte}/archivo`;
      } else {
        blocked += 1;
      }
    });
    const links = document.querySelector("#createdReportLinks");
    links.classList.remove("hidden");
    links.innerHTML = `<p class="hint">${blocked
      ? "El navegador no abrió todos los PDF. Puede abrirlos aquí o permitir ventanas emergentes para este sitio."
      : "PDF del último lote creado:"}</p><div class="form-actions">${reportes.map((report) =>
      `<a href="/api/reportes/${encodeURIComponent(report.id_reporte)}/archivo" target="_blank" rel="noopener">${escapeHtml(report.codigo_reporte)}</a>`).join("")}</div>`;
    showMessage(`${reportes.length} reporte(s) publicado(s): ${reportes.map((item) => item.codigo_reporte).join(", ")}.`, "success");
    await loadReports().catch((error) => {
      showMessage(`Los PDF ya se publicaron, pero no se pudo actualizar el listado: ${error.message}`);
    });
  } catch (error) {
    previewWindows.forEach((preview) => { if (preview && !preview.closed) preview.close(); });
    reviewWarnings.classList.remove("ok");
    reviewWarnings.innerHTML = `<h3>No se pudo publicar</h3><p>${escapeHtml(error.message)} Revise los datos o inténtelo nuevamente.</p>`;
    reviewWarnings.scrollIntoView({ block: "nearest" });
    showMessage(error.message);
  } finally {
    reviewConfirm.disabled = false;
    reviewConfirm.textContent = "Crear y publicar PDF";
  }
});

function renderReports(rows) {
  const columns = ["codigo_reporte", "fecha_reporte", "numero_bien", "institucion", "servicio_solicitante", "proveedor_plantilla", "titulo", "creador", "estado"];
  reportTableHead.innerHTML = headerCells(columns);
  if (!rows.length) {
    reportTableBody.innerHTML = `<tr><td class="empty" colspan="${columns.length + 1}">No se encontraron reportes.</td></tr>`;
    return;
  }
  // puede_editar lo calcula el servidor: el administrador o quien creo el reporte.
  reportTableBody.innerHTML = rows.map((row) => `<tr>
    ${columns.map((column) => `<td>${renderCell(column, row[column])}</td>`).join("")}
    <td class="actions">
      ${row.estado === "borrador" ? `<button class="secondary small" data-preview="${row.id_reporte}">Vista previa</button>` : ""}
      ${row.puede_editar ? `<button class="secondary small" data-edit-report="${row.id_reporte}">Editar</button>` : ""}
      ${row.puede_editar && row.estado === "borrador" ? `<button class="small" data-publish="${row.id_reporte}" data-code="${escapeHtml(row.codigo_reporte)}">Publicar</button>` : ""}
      ${row.url_archivo ? `<button class="secondary small" data-file="${row.id_reporte}">Ver PDF</button>` : ""}
      ${currentUser?.rol === "administrador" && row.estado !== "anulado" ? `<button class="secondary small danger-text" data-annul="${row.id_reporte}" data-code="${escapeHtml(row.codigo_reporte)}">Anular</button>` : ""}
    </td>
  </tr>`).join("");
}

async function loadReports() {
  const values = Object.fromEntries(new FormData(reportFilterForm));
  const query = new URLSearchParams(Object.entries(values).filter(([, value]) => value));
  renderReports(await api(`/api/reportes?${query}`));
}

reportFilterForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await loadReports().catch((error) => showMessage(error.message));
});

// El evento reset limpia los campos despues de este manejador; se consulta en la siguiente vuelta.
reportFilterForm.addEventListener("reset", () => {
  setTimeout(() => loadReports().catch((error) => showMessage(error.message)));
});

reportTableBody.addEventListener("click", async (event) => {
  const { preview, file, publish, code, editReport, annul } = event.target.dataset;
  if (editReport) {
    await openReportEdit(editReport).catch((error) => showMessage(error.message));
    return;
  }
  if (annul) {
    if (!window.confirm(`¿Anular ${code}? El reporte y su PDF se conservan, pero quedaran marcados como anulados.`)) return;
    try {
      await api(`/api/reportes/${annul}`, { method: "DELETE" });
      await loadReports();
      showMessage(`Reporte ${code} anulado.`, "success");
    } catch (error) {
      showMessage(error.message);
    }
    return;
  }
  if (preview) {
    window.open(`/api/reportes/${preview}/vista-previa`, "_blank");
    return;
  }
  if (file) {
    window.open(`/api/reportes/${file}/archivo`, "_blank");
    return;
  }
  if (!publish) return;
  if (!window.confirm(`¿Publicar ${code}? Se generara y almacenara el PDF definitivo.`)) return;
  event.target.disabled = true;
  try {
    await api(`/api/reportes/${publish}/publicar`, { method: "POST" });
    await loadReports();
    showMessage(`Reporte ${code} publicado y almacenado.`, "success");
  } catch (error) {
    event.target.disabled = false;
    showMessage(error.message);
  }
});

/* Correccion de reportes */

const reportEditDialog = document.querySelector("#reportEditDialog");
const reportEditForm = document.querySelector("#reportEditForm");
const reportEditFields = ["id_reporte", "titulo", "fecha_reporte", "tipo_servicio",
  "numero_pedido_nog", "especificaciones_tecnicas", "recomendaciones"];

async function openReportEdit(id) {
  const report = await api(`/api/reportes/${id}`);
  reportEditForm.reset();
  for (const field of reportEditFields) reportEditForm.elements[field].value = report[field] ?? "";
  document.querySelector("#editTechnicianOptions").innerHTML = technicianCheckboxes(report.id_proveedor_plantilla, report.id_tecnicos);
  document.querySelector("#reportEditCode").textContent = `${report.codigo_reporte} · ${report.descripcion_equipo ?? ""}`;
  reportEditDialog.showModal();
}

document.querySelector("#reportEditClose").addEventListener("click", () => reportEditDialog.close());
document.querySelector("#reportEditCancel").addEventListener("click", () => reportEditDialog.close());

reportEditForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const { id_reporte: id, ...values } = Object.fromEntries(new FormData(reportEditForm));
  values.id_tecnicos = checkedTechnicians(reportEditForm);
  try {
    const updated = await api(`/api/reportes/${id}`, { method: "PUT", body: JSON.stringify(values) });
    reportEditDialog.close();
    await loadReports();
    showMessage(updated.estado === "publicado"
      ? `Reporte ${updated.codigo_reporte} corregido; se genero un PDF nuevo.`
      : `Reporte ${updated.codigo_reporte} actualizado.`, "success");
  } catch (error) {
    showMessage(error.message);
  }
});

/* Navegacion y cuenta */

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginMessage.textContent = "";
  const data = Object.fromEntries(new FormData(loginForm));
  try {
    const result = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const payload = await result.json();
    if (!result.ok) throw new Error(payload.error);
    loginForm.reset();
    await showApp(payload.usuario);
  } catch (error) {
    loginMessage.textContent = error.message;
  }
});

document.querySelectorAll(".nav-button").forEach((button) => {
  button.addEventListener("click", () => {
    if (currentUser?.debe_cambiar_password && button.dataset.module !== "password") {
      showMessage("Debe cambiar la contrasena temporal antes de continuar.");
      return;
    }
    openModule(button.dataset.module);
  });
});

passwordForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(passwordForm));
  if (values.password_nueva !== values.password_confirmacion) {
    showMessage("La confirmacion no coincide con la nueva contrasena.");
    return;
  }
  try {
    const result = await api("/api/cambiar-password", {
      method: "POST",
      body: JSON.stringify(values),
    });
    passwordForm.reset();
    await showApp(result.usuario);
    showMessage("Contrasena actualizada correctamente.", "success");
  } catch (error) {
    showMessage(error.message);
  }
});

/* Coordinacion de trabajos */

async function openCoordinationLetter(id) {
  const tab = window.open("", "_blank");
  try {
    const response = await fetch(`/api/coordinaciones/${id}/carta`, { credentials: "same-origin" });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || "No se pudo generar la carta");
    }
    const url = URL.createObjectURL(await response.blob());
    if (tab) tab.location.href = url;
    else window.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (error) {
    if (tab) tab.close();
    showMessage(error.message);
  }
}

let coordinationCatalogs = null;
let coordinationRows = { activo: [], finalizado: [] };
let coordinationTab = "activo";
let endPreviewTimer = null;
let endPreviewRequest = 0;

function canEditCoordinations() {
  return ["administrador", "generador_reportes"].includes(currentUser?.rol);
}

function plural(count, singular, pluralText) {
  return `${count} ${count === 1 ? singular : pluralText}`;
}

function fullDate(value) {
  return value ? `${weekdayName(value)} ${formatDate(value)}` : "";
}

async function loadCoordinationCatalogs() {
  const [catalogs, recipients] = await Promise.all([api("/api/reportes/catalogos"), api("/api/destinatarios")]);
  coordinationCatalogs = { ...catalogs, destinatarios: recipients.filter((item) => item.activo) };
  const select = coordinationForm.elements.id_proveedor;
  const companies = coordinationCatalogs.proveedores;
  select.innerHTML = '<option value="">Seleccione empresa</option>' + companies
    .map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.nombre)}</option>`).join("");
  if (companies.length === 1 && !coordinationForm.elements.id.value) select.value = String(companies[0].id);
  fillCoordinationInstitutions();
}

// Solo se ofrecen las instituciones que atiende la empresa elegida.
function fillCoordinationInstitutions(selected = "") {
  const company = coordinationForm.elements.id_proveedor.value;
  const select = coordinationForm.elements.id_institucion;
  const items = company && coordinationCatalogs
    ? coordinationCatalogs.instituciones.filter((item) => item.id_proveedores.includes(company))
    : [];
  select.innerHTML = `<option value="">${company ? "Seleccione institucion" : "Seleccione primero la empresa"}</option>`
    + items.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.nombre)}</option>`).join("");
  select.disabled = !company;
  if (selected) select.value = String(selected);
  fillCoordinationRecipients();
  fillCoordinationTechnicians();
}

// Destinatarios registrados para la institucion elegida.
function fillCoordinationRecipients(selected = "") {
  const institution = coordinationForm.elements.id_institucion.value;
  const select = coordinationForm.elements.id_destinatario;
  const items = institution && coordinationCatalogs
    ? coordinationCatalogs.destinatarios.filter((item) => String(item.id_institucion) === institution)
    : [];
  select.innerHTML = `<option value="">${!institution ? "Seleccione primero la institucion"
    : items.length ? "Sin destinatario" : "Sin destinatarios registrados"}</option>`
    + items.map((item) => `<option value="${escapeHtml(item.id_destinatario)}">${escapeHtml(item.nombre)} · ${escapeHtml(item.cargo)}</option>`).join("");
  select.disabled = !institution;
  if (selected) select.value = String(selected);
  document.querySelector("#newRecipientToggle").disabled = !institution;
  closeNewRecipient();
}

function newRecipientInputs() {
  return Object.fromEntries([...document.querySelectorAll("#newRecipientPanel [data-recipient]")]
    .map((input) => [input.dataset.recipient, input]));
}

function closeNewRecipient() {
  Object.values(newRecipientInputs()).forEach((input) => { input.value = ""; });
  document.querySelector("#newRecipientPanel").classList.add("hidden");
}

// Registra el destinatario en la institucion elegida y lo deja seleccionado en la coordinacion.
async function saveNewRecipient() {
  const inputs = newRecipientInputs();
  const data = { nombre: inputs.nombre.value.trim(), cargo: inputs.cargo.value.trim() };
  const missing = ["nombre", "cargo"].find((key) => !data[key]);
  if (missing) {
    showMessage("Indique el nombre y el cargo del destinatario.");
    inputs[missing].focus();
    return;
  }
  const institution = coordinationForm.elements.id_institucion.value;
  const button = document.querySelector("#newRecipientSave");
  button.disabled = true;
  try {
    const row = await api("/api/destinatarios", {
      method: "POST",
      body: JSON.stringify({ ...data, id_institucion: institution, activo: true }),
    });
    coordinationCatalogs.destinatarios.push(row);
    fillCoordinationRecipients(row.id_destinatario);
    showMessage(`Destinatario "${row.nombre}" registrado y seleccionado.`, "success");
  } catch (error) {
    showMessage(error.message);
  } finally {
    button.disabled = false;
  }
}

// Tecnicos de la empresa elegida; la carta imprime nombre y DPI (maximo 10).
function fillCoordinationTechnicians(selected = checkedValues(coordinationForm, "id_tecnicos")) {
  const company = coordinationForm.elements.id_proveedor.value;
  const box = document.querySelector("#coordinationTechnicians");
  const items = company && coordinationCatalogs
    ? coordinationCatalogs.tecnicos.filter((item) => item.id_proveedores.includes(company))
    : [];
  box.innerHTML = !company ? '<p class="hint">Seleccione primero la empresa.</p>'
    : !items.length ? '<p class="hint">La empresa no tiene tecnicos activos. El administrador los asigna en el modulo Tecnicos.</p>'
    : items.map((item) => `
      <label class="check">
        <input type="checkbox" name="id_tecnicos" value="${escapeHtml(item.id)}" ${selected.includes(String(item.id)) ? "checked" : ""}>
        ${escapeHtml(item.nombre)} ${item.dpi
          ? `<span class="muted">· ${escapeHtml(formatDpi(item.dpi))}</span>`
          : '<span class="badge days borrador">Sin DPI</span>'}
      </label>`).join("");
  updateTechnicianLimit();
}

// Al llegar a 10 se bloquean las casillas sin marcar.
function updateTechnicianLimit() {
  const boxes = [...coordinationForm.querySelectorAll('input[name="id_tecnicos"]')];
  const count = boxes.filter((input) => input.checked).length;
  boxes.forEach((input) => { input.disabled = !input.checked && count >= 10; });
  document.querySelector("#coordinationTechCount").textContent = `(${count} de 10 como máximo)`;
}

function resetCoordinationForm() {
  coordinationForm.reset();
  coordinationForm.elements.id.value = "";
  coordinationForm.elements.fecha_coordinacion.value = todayIso();
  coordinationForm.classList.remove("editing");
  coordinationFormTitle.textContent = "Nueva coordinación";
  coordinationSubmit.textContent = "Guardar coordinación";
  const companies = coordinationCatalogs?.proveedores || [];
  if (companies.length === 1) coordinationForm.elements.id_proveedor.value = String(companies[0].id);
  fillCoordinationInstitutions();
  // reset() volveria a marcar los tecnicos de una edicion anterior (atributo checked).
  fillCoordinationTechnicians([]);
  updateEndPreview();
}

// Calcula el ultimo dia en la base (descuenta fines de semana y feriados) sin guardar nada.
function updateEndPreview() {
  clearTimeout(endPreviewTimer);
  const inicio = coordinationForm.elements.fecha_inicio.value;
  const dias = coordinationForm.elements.dias_habiles.value;
  coordinationEnd.classList.remove("error");
  if (!inicio || !dias) {
    coordinationEnd.classList.add("muted");
    coordinationEnd.textContent = "Indique el inicio y los días hábiles";
    return;
  }
  const request = ++endPreviewRequest;
  endPreviewTimer = setTimeout(async () => {
    try {
      const query = new URLSearchParams({ fecha_inicio: inicio, dias_habiles: dias });
      const { fecha_fin: fechaFin } = await api(`/api/coordinaciones/calcular-fin?${query}`);
      if (request !== endPreviewRequest) return;
      coordinationEnd.classList.remove("muted");
      coordinationEnd.innerHTML = `<strong>${fullDate(fechaFin)}</strong>`;
    } catch (error) {
      if (request !== endPreviewRequest) return;
      coordinationEnd.classList.remove("muted");
      coordinationEnd.classList.add("error");
      coordinationEnd.textContent = error.message;
    }
  }, 250);
}

async function loadCoordinations() {
  const [activos, finalizados] = await Promise.all([
    api("/api/coordinaciones?estado=activo"),
    api("/api/coordinaciones?estado=finalizado"),
  ]);
  coordinationRows = { activo: activos, finalizado: finalizados };
  document.querySelector("#activeCoordinationCount").textContent = `(${activos.length})`;
  document.querySelector("#finishedCoordinationCount").textContent = `(${finalizados.length})`;
  renderCoordinations();
}

// Dias habiles que quedan, con color segun la urgencia.
function remainingBadge(row) {
  if (row.situacion === "vencida") {
    return `<span class="badge days anulado">Vencida hace ${plural(row.dias_vencidos, "día hábil", "días hábiles")}</span>`;
  }
  const days = plural(row.dias_restantes, "día hábil", "días hábiles");
  if (row.situacion === "por_iniciar") return `<span class="badge days">Por iniciar · ${days}</span>`;
  return `<span class="badge days ${row.dias_restantes <= 2 ? "borrador" : "ok"}">${days}</span>`;
}

function maintenanceCell(row) {
  return `<strong>${escapeHtml(row.nombre_mantenimiento)}</strong>
    <br><span class="muted">${escapeHtml(row.empresa)} · ${escapeHtml(row.institucion)}</span>`;
}

function referenceCell(row) {
  const value = (label, number) => (number
    ? `<span class="code">${label} ${escapeHtml(number)}</span>`
    : `<span class="badge days borrador">Falta ${label}</span>`);
  return `${value("OC", row.numero_oc)}<br>${value("NOG", row.numero_nog)}`;
}

function letterButton(row) {
  return `<button class="secondary small" data-letter-coordination="${escapeHtml(row.id_coordinacion)}">Carta</button>`;
}

function dateCell(value) {
  return value ? `<span class="code">${formatDate(value)}</span>` : '<span class="muted">—</span>';
}

function renderCoordinations() {
  document.querySelectorAll("[data-coordination-tab]").forEach((tab) => {
    const isActive = tab.dataset.coordinationTab === coordinationTab;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
  const rows = coordinationRows[coordinationTab];
  const isActiveTab = coordinationTab === "activo";
  const titles = isActiveTab
    ? ["Mantenimiento", "Referencia", "Coordinado", "Inicio", "Último día", "Días", "Restantes", ""]
    : ["Mantenimiento", "Referencia", "Inicio", "Último día", "Finalizado", "Cumplimiento", ""];
  coordinationTableHead.innerHTML = titles.map((title) => `<th>${escapeHtml(title)}</th>`).join("");
  coordinationListHint.textContent = isActiveTab
    ? "Ordenados del más próximo a vencer al más lejano."
    : "Ordenados del último finalizado al más antiguo.";
  if (!rows.length) {
    coordinationTableBody.innerHTML = `<tr><td class="empty" colspan="${titles.length}">${isActiveTab
      ? "No hay mantenimientos activos." : "Aún no hay mantenimientos finalizados."}</td></tr>`;
    return;
  }
  const canEdit = canEditCoordinations();
  coordinationTableBody.innerHTML = rows.map((row) => isActiveTab
    ? `<tr>
        <td>${maintenanceCell(row)}</td>
        <td>${referenceCell(row)}</td>
        <td>${dateCell(row.fecha_coordinacion)}</td>
        <td>${dateCell(row.fecha_inicio)}</td>
        <td>${dateCell(row.fecha_fin)} <span class="muted">${weekdayName(row.fecha_fin)}</span></td>
        <td>${escapeHtml(row.dias_habiles)}</td>
        <td>${remainingBadge(row)}</td>
        <td class="actions">${letterButton(row)}${canEdit ? `
          <button class="secondary small" data-edit-coordination="${escapeHtml(row.id_coordinacion)}">Editar</button>
          <button class="small" data-finish-coordination="${escapeHtml(row.id_coordinacion)}">Finalizar</button>` : ""}
        </td>
      </tr>`
    : `<tr>
        <td>${maintenanceCell(row)}</td>
        <td>${referenceCell(row)}</td>
        <td>${dateCell(row.fecha_inicio)}</td>
        <td>${dateCell(row.fecha_fin)}</td>
        <td>${dateCell(row.fecha_finalizacion)}</td>
        <td>${row.finalizada_a_tiempo
          ? '<span class="badge days ok">A tiempo</span>'
          : '<span class="badge days anulado">Con atraso</span>'}</td>
        <td class="actions">${letterButton(row)}</td>
      </tr>`).join("");
}

document.querySelectorAll("[data-coordination-tab]").forEach((tab) => {
  tab.addEventListener("click", () => {
    coordinationTab = tab.dataset.coordinationTab;
    renderCoordinations();
  });
});

coordinationForm.elements.id_proveedor.addEventListener("change", () => fillCoordinationInstitutions());
coordinationForm.elements.id_institucion.addEventListener("change", () => fillCoordinationRecipients());
document.querySelector("#newRecipientToggle").addEventListener("click", () => {
  const panel = document.querySelector("#newRecipientPanel");
  panel.classList.toggle("hidden");
  if (!panel.classList.contains("hidden")) newRecipientInputs().nombre.focus();
});
document.querySelector("#newRecipientCancel").addEventListener("click", closeNewRecipient);
document.querySelector("#newRecipientSave").addEventListener("click", saveNewRecipient);
// Enter en nombre o cargo guarda el destinatario en lugar de enviar la coordinacion.
document.querySelector("#newRecipientPanel").addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || event.target.tagName !== "INPUT") return;
  event.preventDefault();
  saveNewRecipient();
});
document.querySelector("#coordinationTechnicians").addEventListener("change", updateTechnicianLimit);
coordinationForm.elements.fecha_inicio.addEventListener("input", updateEndPreview);
coordinationForm.elements.dias_habiles.addEventListener("input", updateEndPreview);
document.querySelector("#coordinationCancel").addEventListener("click", resetCoordinationForm);

coordinationForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(coordinationForm));
  values.id_tecnicos = checkedValues(coordinationForm, "id_tecnicos");
  const id = values.id;
  delete values.id;
  coordinationSubmit.disabled = true;
  try {
    const saved = await api(id ? `/api/coordinaciones/${id}` : "/api/coordinaciones", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(values),
    });
    resetCoordinationForm();
    coordinationTab = "activo";
    await loadCoordinations();
    showMessage(`${id ? "Cambios guardados" : "Coordinación guardada"}: "${saved.nombre_mantenimiento}". `
      + `Último día de trabajo: ${fullDate(saved.fecha_fin)}.`, "success");
  } catch (error) {
    showMessage(error.message);
  } finally {
    coordinationSubmit.disabled = false;
  }
});

coordinationTableBody.addEventListener("click", async (event) => {
  const letterId = event.target.dataset.letterCoordination;
  if (letterId) {
    await openCoordinationLetter(letterId);
    return;
  }
  const editId = event.target.dataset.editCoordination;
  const finishId = event.target.dataset.finishCoordination;
  const row = coordinationRows.activo.find((item) => String(item.id_coordinacion) === (editId || finishId));
  if (!row) return;

  if (editId) {
    resetCoordinationForm();
    const fields = coordinationForm.elements;
    fields.id.value = row.id_coordinacion;
    fields.id_proveedor.value = String(row.id_proveedor);
    fillCoordinationInstitutions(row.id_institucion);
    fillCoordinationRecipients(row.id_destinatario ?? "");
    fillCoordinationTechnicians((row.id_tecnicos || []).map(String));
    for (const name of ["nombre_mantenimiento", "numero_oc", "numero_nog",
      "fecha_coordinacion", "fecha_inicio", "dias_habiles"]) {
      fields[name].value = row[name] ?? "";
    }
    coordinationFormTitle.textContent = `Recoordinar o ampliar: ${row.nombre_mantenimiento}`;
    coordinationSubmit.textContent = "Guardar cambios";
    coordinationForm.classList.add("editing");
    updateEndPreview();
    coordinationForm.scrollIntoView({ behavior: "smooth", block: "start" });
    fields.fecha_inicio.focus({ preventScroll: true });
    return;
  }

  if (!window.confirm(`¿Finalizar "${row.nombre_mantenimiento}"? Pasará a la lista de finalizados y ya no se podrá modificar.`)) {
    return;
  }
  try {
    await api(`/api/coordinaciones/${finishId}/finalizar`, { method: "POST" });
    if (coordinationForm.elements.id.value === finishId) resetCoordinationForm();
    await loadCoordinations();
    showMessage(`Mantenimiento "${row.nombre_mantenimiento}" finalizado.`, "success");
  } catch (error) {
    showMessage(error.message);
  }
});

logoutButton.addEventListener("click", async () => {
  await api("/api/logout", { method: "POST" }).catch(() => null);
  showLogin();
});

api("/api/session")
  .then(({ usuario }) => showApp(usuario))
  .catch(() => showLogin());
