const loginView = document.querySelector("#loginView");
const appView = document.querySelector("#appView");
const loginForm = document.querySelector("#loginForm");
const loginMessage = document.querySelector("#loginMessage");
const appMessage = document.querySelector("#appMessage");
const userLabel = document.querySelector("#userLabel");
const recordForm = document.querySelector("#recordForm");
const tableHead = document.querySelector("#tableHead");
const tableBody = document.querySelector("#tableBody");
const moduleTitle = document.querySelector("#moduleTitle");
const clearButton = document.querySelector("#clearButton");
const logoutButton = document.querySelector("#logoutButton");
const catalogPanel = document.querySelector("#catalogPanel");
const reportsPanel = document.querySelector("#reportsPanel");
const passwordPanel = document.querySelector("#passwordPanel");
const passwordForm = document.querySelector("#passwordForm");
const passwordNotice = document.querySelector("#passwordNotice");
const usersNav = document.querySelector("#usersNav");
const reportForm = document.querySelector("#reportForm");
const reportFilterForm = document.querySelector("#reportFilterForm");
const reportTableHead = document.querySelector("#reportTableHead");
const reportTableBody = document.querySelector("#reportTableBody");
const equipmentSearch = document.querySelector("#equipmentSearch");
const equipmentSuggestions = document.querySelector("#equipmentSuggestions");
const selectedEquipmentList = document.querySelector("#selectedEquipmentList");

const modules = {
  servicios: {
    title: "Servicios solicitantes",
    endpoint: "/api/servicios-solicitantes",
    id: "id_servicio_solicitante",
    columns: ["id_servicio_solicitante", "nombre", "institucion", "activo"],
  },
  tecnicos: {
    title: "Tecnicos",
    endpoint: "/api/tecnicos",
    id: "id_tecnico",
    extraLabel: "Especialidad",
    extraField: "especialidad",
    columns: ["id_tecnico", "nombre", "telefono", "correo", "especialidad", "activo"],
  },
  instituciones: {
    title: "Instituciones",
    endpoint: "/api/instituciones",
    id: "id_institucion",
    extraLabel: "Direccion",
    extraField: "direccion",
    columns: ["id_institucion", "nombre", "telefono", "correo", "direccion", "activo"],
  },
  proveedores: {
    title: "Proveedores",
    endpoint: "/api/proveedores",
    id: "id_proveedor",
    extraLabel: "NIT",
    extraField: "nit",
    columns: ["id_proveedor", "nombre", "nit", "telefono", "correo", "logo_url", "pie_pagina", "activo"],
  },
  equipos_medicos: {
    title: "Equipos medicos",
    endpoint: "/api/equipos-medicos",
    id: "id_equipo_medico",
    columns: ["id_equipo_medico", "nombre", "institucion", "numero_bien", "marca", "modelo", "numero_serie", "activo"],
  },
  usuarios: {
    title: "Usuarios y permisos",
    endpoint: "/api/usuarios",
    id: "id_usuario",
    columns: ["id_usuario", "nombre", "correo", "rol", "debe_cambiar_password", "activo"],
  },
};

let activeModule = "servicios";
let currentUser = null;
let reportCatalogs = null;
let selectedEquipmentIds = [];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeSearch(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function equipmentLabel(item) {
  const details = [
    item.numero_bien ? `Bien: ${item.numero_bien}` : null,
    item.numero_serie ? `Serie: ${item.numero_serie}` : null,
    [item.marca, item.modelo].filter(Boolean).join(" ") || null,
  ].filter(Boolean);
  return `${item.nombre}${details.length ? ` - ${details.join(" | ")}` : ""}`;
}

function equipmentForSelectedService() {
  const service = reportCatalogs?.servicios.find(
    (item) => String(item.id) === reportForm.elements.id_servicio_solicitante.value
  );
  return service
    ? reportCatalogs.equipos_medicos.filter(
      (item) => String(item.id_institucion) === String(service.id_institucion)
    )
    : [];
}

function renderSelectedEquipment() {
  const rows = equipmentForSelectedService().filter((item) => selectedEquipmentIds.includes(String(item.id)));
  selectedEquipmentList.innerHTML = rows.map((item) => `
    <div class="selected-equipment">
      <span>${escapeHtml(equipmentLabel(item))}</span>
      <button type="button" class="secondary" data-remove-equipment="${escapeHtml(item.id)}">Quitar</button>
    </div>`).join("");
}

function renderEquipmentSuggestions() {
  const query = normalizeSearch(equipmentSearch.value.trim());
  if (!query || !reportForm.elements.id_servicio_solicitante.value) {
    equipmentSuggestions.classList.add("hidden");
    equipmentSuggestions.innerHTML = "";
    return;
  }
  const matches = equipmentForSelectedService()
    .filter((item) => !selectedEquipmentIds.includes(String(item.id)))
    .filter((item) => normalizeSearch([
      item.nombre, item.numero_bien, item.numero_serie, item.marca, item.modelo,
    ].join(" ")).includes(query))
    .slice(0, 10);
  equipmentSuggestions.innerHTML = matches.length
    ? matches.map((item) => `<button type="button" data-add-equipment="${escapeHtml(item.id)}">${escapeHtml(equipmentLabel(item))}</button>`).join("")
    : '<p class="message">No hay coincidencias en esta institucion.</p>';
  equipmentSuggestions.classList.remove("hidden");
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
    throw new Error(error.error || "Error de comunicacion");
  }
  if (response.status === 204) return null;
  return response.json();
}

function showApp(usuario) {
  currentUser = usuario;
  loginView.classList.add("hidden");
  appView.classList.remove("hidden");
  userLabel.textContent = `${usuario.nombre} - ${usuario.rol}`;
  usersNav.classList.toggle("hidden", usuario.rol !== "administrador");
  if (usuario.debe_cambiar_password) {
    activeModule = "password";
    passwordNotice.textContent = "Debe cambiar la contrasena temporal antes de continuar.";
  }
}

function resetForm() {
  recordForm.reset();
  recordForm.elements.id.value = "";
  recordForm.elements.activo.checked = true;
  recordForm.elements.password_temporal.placeholder = "Contrasena temporal";
  recordForm.elements.password_temporal.required = activeModule === "usuarios";
}

function configureModule() {
  const isReports = activeModule === "reportes";
  const isPassword = activeModule === "password";
  catalogPanel.classList.toggle("hidden", isReports || isPassword);
  reportsPanel.classList.toggle("hidden", !isReports);
  passwordPanel.classList.toggle("hidden", !isPassword);
  if (isPassword) {
    moduleTitle.textContent = "Cambiar mi contrasena";
    document.querySelector("#moduleSubtitle").textContent = "La nueva contrasena debe tener al menos 10 caracteres, letras y numeros";
  } else if (isReports) {
    moduleTitle.textContent = "Reportes y consulta documental";
    document.querySelector("#moduleSubtitle").textContent = "Creacion, PDF simulado, publicacion y filtros";
    reportForm.classList.toggle("hidden", currentUser?.rol === "consulta");
  } else {
  const config = modules[activeModule];
  moduleTitle.textContent = config.title;
  document.querySelector("#moduleSubtitle").textContent = "CRUD conectado a PostgreSQL";
  const isService = activeModule === "servicios";
  const isProvider = activeModule === "proveedores";
  const isMedicalEquipment = activeModule === "equipos_medicos";
  const isUsers = activeModule === "usuarios";
  recordForm.elements.telefono.classList.toggle("hidden", isService || isMedicalEquipment || isUsers);
  recordForm.elements.correo.classList.toggle("hidden", isService || isMedicalEquipment);
  recordForm.elements.extra.classList.toggle("hidden", isService || isMedicalEquipment || isUsers);
  recordForm.elements.id_institucion.classList.toggle("hidden", !(isService || isMedicalEquipment));
  recordForm.elements.id_institucion.required = isService || isMedicalEquipment;
  recordForm.elements.logo_url.classList.toggle("hidden", !isProvider);
  recordForm.elements.pie_pagina.classList.toggle("hidden", !isProvider);
  recordForm.elements.id_rol.classList.toggle("hidden", !isUsers);
  recordForm.elements.id_rol.required = isUsers;
  recordForm.elements.password_temporal.classList.toggle("hidden", !isUsers);
  recordForm.elements.password_temporal.required = isUsers && !recordForm.elements.id.value;
  for (const field of ["numero_bien", "marca", "modelo", "numero_serie"]) {
    recordForm.elements[field].classList.toggle("hidden", !isMedicalEquipment);
  }
  recordForm.elements.marca.required = isMedicalEquipment;
  recordForm.elements.modelo.required = isMedicalEquipment;
  if (!isService && !isMedicalEquipment) recordForm.elements.extra.placeholder = config.extraLabel;
  recordForm.classList.toggle("hidden", currentUser?.rol === "consulta");
  }
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.module === activeModule);
  });
}

function renderRows(rows) {
  const config = modules[activeModule];
  tableHead.innerHTML = config.columns.map((column) => `<th>${column}</th>`).join("") + "<th>Acciones</th>";
  tableBody.innerHTML = rows
    .map(
      (row) => `
        <tr>
          ${config.columns.map((column) => `<td>${escapeHtml(row[column])}</td>`).join("")}
          <td class="actions">
            ${currentUser?.rol !== "consulta" ? `<button class="secondary" data-edit="${row[config.id]}">Editar</button>` : ""}
            ${currentUser?.rol === "administrador" ? `<button class="secondary" data-delete="${row[config.id]}">Desactivar</button>` : ""}
          </td>
        </tr>
      `
    )
    .join("");
}

async function loadRows() {
  appMessage.textContent = "";
  const config = modules[activeModule];
  if (["servicios", "equipos_medicos"].includes(activeModule)) {
    const instituciones = await api("/api/instituciones");
    recordForm.elements.id_institucion.innerHTML = '<option value="">Seleccione institucion</option>' + instituciones
      .filter((item) => item.activo)
      .map((item) => `<option value="${escapeHtml(item.id_institucion)}">${escapeHtml(item.nombre)}</option>`)
      .join("");
  }
  if (activeModule === "usuarios") {
    const roles = await api("/api/roles");
    recordForm.elements.id_rol.innerHTML = '<option value="">Seleccione rol</option>' + roles
      .map((item) => `<option value="${escapeHtml(item.id_rol)}">${escapeHtml(item.nombre)}</option>`)
      .join("");
  }
  const rows = await api(config.endpoint);
  renderRows(rows);
}

async function loadReportCatalogs() {
  const data = await api("/api/reportes/catalogos");
  reportCatalogs = data;
  const fill = (name, rows, emptyLabel) => {
    const select = reportForm.elements[name];
    select.innerHTML = `<option value="">${escapeHtml(emptyLabel)}</option>` + rows
      .map((row) => `<option value="${escapeHtml(row.id)}">${escapeHtml(row.nombre)}</option>`)
      .join("");
  };
  fill("id_servicio_solicitante", data.servicios, "Seleccione servicio");
  fill("id_proveedor_plantilla", data.proveedores, "Seleccione proveedor y formato");
  selectedEquipmentIds = [];
  equipmentSearch.value = "";
  renderSelectedEquipment();
  renderEquipmentSuggestions();
}

reportForm.elements.id_servicio_solicitante.addEventListener("change", () => {
  selectedEquipmentIds = [];
  equipmentSearch.value = "";
  renderSelectedEquipment();
  renderEquipmentSuggestions();
});

equipmentSearch.addEventListener("input", renderEquipmentSuggestions);

equipmentSuggestions.addEventListener("click", (event) => {
  const id = event.target.dataset.addEquipment;
  if (!id || selectedEquipmentIds.includes(id)) return;
  selectedEquipmentIds.push(id);
  equipmentSearch.value = "";
  renderSelectedEquipment();
  renderEquipmentSuggestions();
});

selectedEquipmentList.addEventListener("click", (event) => {
  const id = event.target.dataset.removeEquipment;
  if (!id) return;
  selectedEquipmentIds = selectedEquipmentIds.filter((item) => item !== id);
  renderSelectedEquipment();
});

function renderReports(rows) {
  const columns = ["codigo_reporte", "titulo", "fecha_reporte", "estado", "servicio_solicitante", "institucion", "proveedor_plantilla", "url_archivo"];
  reportTableHead.innerHTML = columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("") + "<th>Acciones</th>";
  reportTableBody.innerHTML = rows.map((row) => `<tr>
    ${columns.map((column) => `<td>${escapeHtml(row[column])}</td>`).join("")}
    <td class="actions">
      ${row.estado === "borrador" ? `<button class="secondary" data-preview="${row.id_reporte}">Vista previa</button>` : ""}
      ${currentUser?.rol !== "consulta" && row.estado === "borrador" ? `<button class="secondary" data-publish="${row.id_reporte}">Publicar</button>` : ""}
      ${row.url_archivo ? `<button class="secondary" data-file="${row.id_reporte}">Ver PDF</button>` : ""}
    </td>
  </tr>`).join("");
}

async function loadReports() {
  const values = Object.fromEntries(new FormData(reportFilterForm));
  const query = new URLSearchParams(Object.entries(values).filter(([, value]) => value));
  renderReports(await api(`/api/reportes?${query}`));
}

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
    showApp(payload.usuario);
    configureModule();
    if (activeModule !== "password") await loadRows();
  } catch (error) {
    loginMessage.textContent = error.message;
  }
});

document.querySelectorAll(".nav-button").forEach((button) => {
  button.addEventListener("click", async () => {
    if (currentUser?.debe_cambiar_password && button.dataset.module !== "password") {
      appMessage.textContent = "Debe cambiar la contrasena temporal antes de continuar";
      return;
    }
    activeModule = button.dataset.module;
    resetForm();
    configureModule();
    if (activeModule === "reportes") {
      await loadReportCatalogs();
      await loadReports();
    } else if (activeModule !== "password") {
      await loadRows();
    }
  });
});

reportForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  appMessage.textContent = "";
  const values = Object.fromEntries(new FormData(reportForm));
  if (selectedEquipmentIds.length === 0) {
    appMessage.textContent = "Seleccione al menos un equipo por nombre, numero de bien o serie";
    return;
  }
  values.id_equipos_medicos = selectedEquipmentIds;
  const previewWindow = window.open("about:blank", "_blank");
  try {
    const result = await api("/api/reportes", {
      method: "POST",
      body: JSON.stringify(values),
    });
    const reportes = result.reportes || [result];
    reportForm.reset();
    await loadReportCatalogs();
    await loadReports();
    if (previewWindow && reportes[0]) previewWindow.location = `/api/reportes/${reportes[0].id_reporte}/vista-previa`;
    appMessage.textContent = `${reportes.length} borrador(es) creado(s): ${reportes.map((item) => item.codigo_reporte).join(", ")}. Revise cada vista previa antes de publicar.`;
  } catch (error) {
    if (previewWindow) previewWindow.close();
    appMessage.textContent = error.message;
  }
});

reportFilterForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await loadReports().catch((error) => { appMessage.textContent = error.message; });
});

reportTableBody.addEventListener("click", async (event) => {
  const previewId = event.target.dataset.preview;
  const fileId = event.target.dataset.file;
  const id = event.target.dataset.publish;
  if (previewId) {
    window.open(`/api/reportes/${previewId}/vista-previa`, "_blank");
    return;
  }
  if (fileId) {
    window.open(`/api/reportes/${fileId}/archivo`, "_blank");
    return;
  }
  if (!id) return;
  try {
    const result = await api(`/api/reportes/${id}/publicar`, { method: "POST" });
    await loadReports();
    appMessage.textContent = `Reporte publicado en ${result.ubicacion}`;
  } catch (error) {
    appMessage.textContent = error.message;
  }
});

recordForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const config = modules[activeModule];
  const values = Object.fromEntries(new FormData(recordForm));
  const id = values.id;
  const payload = {
    nombre: values.nombre,
    telefono: values.telefono,
    correo: values.correo,
    [config.extraField]: values.extra,
    activo: recordForm.elements.activo.checked,
  };
  if (activeModule === "servicios") {
    payload.id_institucion = values.id_institucion;
    delete payload.telefono;
    delete payload.correo;
    delete payload[config.extraField];
  }
  if (activeModule === "equipos_medicos") {
    payload.id_institucion = values.id_institucion;
    payload.numero_bien = values.numero_bien;
    payload.marca = values.marca;
    payload.modelo = values.modelo;
    payload.numero_serie = values.numero_serie;
    delete payload.telefono;
    delete payload.correo;
    delete payload[config.extraField];
  }
  if (activeModule === "proveedores") {
    payload.logo_url = values.logo_url;
    payload.pie_pagina = values.pie_pagina;
  }
  if (activeModule === "usuarios") {
    payload.id_rol = values.id_rol;
    if (values.password_temporal) payload.password_temporal = values.password_temporal;
    delete payload.telefono;
    delete payload[config.extraField];
  }

  try {
    await api(id ? `${config.endpoint}/${id}` : config.endpoint, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload),
    });
    resetForm();
    await loadRows();
  } catch (error) {
    appMessage.textContent = error.message;
  }
});

tableBody.addEventListener("click", async (event) => {
  const config = modules[activeModule];
  const editId = event.target.dataset.edit;
  const deleteId = event.target.dataset.delete;

  if (editId) {
    const rows = await api(config.endpoint);
    const row = rows.find((item) => String(item[config.id]) === editId);
    recordForm.elements.id.value = row[config.id];
    recordForm.elements.nombre.value = row.nombre || "";
    recordForm.elements.telefono.value = row.telefono || "";
    recordForm.elements.correo.value = row.correo || "";
    recordForm.elements.extra.value = row[config.extraField] || "";
    recordForm.elements.id_institucion.value = row.id_institucion || "";
    recordForm.elements.logo_url.value = row.logo_url || "";
    recordForm.elements.pie_pagina.value = row.pie_pagina || "";
    recordForm.elements.numero_bien.value = row.numero_bien || "";
    recordForm.elements.marca.value = row.marca || "";
    recordForm.elements.modelo.value = row.modelo || "";
    recordForm.elements.numero_serie.value = row.numero_serie || "";
    recordForm.elements.id_rol.value = row.id_rol || "";
    if (activeModule === "usuarios") {
      const roles = await api("/api/roles");
      const role = roles.find((item) => item.nombre === row.rol);
      recordForm.elements.id_rol.value = role?.id_rol || "";
      recordForm.elements.password_temporal.required = false;
      recordForm.elements.password_temporal.placeholder = "Use Restablecer para cambiarla";
    }
    recordForm.elements.activo.checked = row.activo;
  }

  if (deleteId) {
    await api(`${config.endpoint}/${deleteId}`, { method: "DELETE" });
    await loadRows();
  }
});

clearButton.addEventListener("click", resetForm);

passwordForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(passwordForm));
  if (values.password_nueva !== values.password_confirmacion) {
    appMessage.textContent = "La confirmacion no coincide";
    return;
  }
  try {
    const result = await api("/api/cambiar-password", {
      method: "POST",
      body: JSON.stringify(values),
    });
    currentUser = result.usuario;
    passwordForm.reset();
    passwordNotice.textContent = "Contrasena actualizada correctamente.";
    activeModule = "servicios";
    configureModule();
    await loadRows();
    appMessage.textContent = "Contrasena actualizada correctamente";
  } catch (error) {
    appMessage.textContent = error.message;
  }
});

logoutButton.addEventListener("click", async () => {
  await api("/api/logout", { method: "POST" }).catch(() => null);
  appView.classList.add("hidden");
  loginView.classList.remove("hidden");
});

api("/api/session")
  .then(async ({ usuario }) => {
    showApp(usuario);
    configureModule();
    if (activeModule !== "password") await loadRows();
  })
  .catch(() => {
    appView.classList.add("hidden");
    loginView.classList.remove("hidden");
  });
