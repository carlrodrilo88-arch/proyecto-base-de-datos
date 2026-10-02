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
const reportForm = document.querySelector("#reportForm");
const reportFilterForm = document.querySelector("#reportFilterForm");
const reportTableHead = document.querySelector("#reportTableHead");
const reportTableBody = document.querySelector("#reportTableBody");

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
};

let activeModule = "servicios";
let currentUser = null;
let reportCatalogs = null;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
}

function resetForm() {
  recordForm.reset();
  recordForm.elements.id.value = "";
  recordForm.elements.activo.checked = true;
}

function configureModule() {
  const isReports = activeModule === "reportes";
  catalogPanel.classList.toggle("hidden", isReports);
  reportsPanel.classList.toggle("hidden", !isReports);
  if (isReports) {
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
  recordForm.elements.telefono.classList.toggle("hidden", isService || isMedicalEquipment);
  recordForm.elements.correo.classList.toggle("hidden", isService || isMedicalEquipment);
  recordForm.elements.extra.classList.toggle("hidden", isService || isMedicalEquipment);
  recordForm.elements.id_institucion.classList.toggle("hidden", !(isService || isMedicalEquipment));
  recordForm.elements.id_institucion.required = isService || isMedicalEquipment;
  recordForm.elements.logo_url.classList.toggle("hidden", !isProvider);
  recordForm.elements.pie_pagina.classList.toggle("hidden", !isProvider);
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
  fill("id_equipo_medico", [], "Seleccione primero un servicio");
}

reportForm.elements.id_servicio_solicitante.addEventListener("change", () => {
  const service = reportCatalogs?.servicios.find((item) => String(item.id) === reportForm.elements.id_servicio_solicitante.value);
  const rows = service ? reportCatalogs.equipos_medicos.filter((item) => String(item.id_institucion) === String(service.id_institucion)) : [];
  reportForm.elements.id_equipo_medico.innerHTML = '<option value="">Seleccione equipo medico</option>' + rows
    .map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.nombre)}</option>`).join("");
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
    await loadRows();
  } catch (error) {
    loginMessage.textContent = error.message;
  }
});

document.querySelectorAll(".nav-button").forEach((button) => {
  button.addEventListener("click", async () => {
    activeModule = button.dataset.module;
    resetForm();
    configureModule();
    if (activeModule === "reportes") {
      await loadReportCatalogs();
      await loadReports();
    } else {
      await loadRows();
    }
  });
});

reportForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  appMessage.textContent = "";
  const values = Object.fromEntries(new FormData(reportForm));
  const previewWindow = window.open("about:blank", "_blank");
  try {
    const reporte = await api("/api/reportes", {
      method: "POST",
      body: JSON.stringify(values),
    });
    reportForm.reset();
    await loadReportCatalogs();
    await loadReports();
    if (previewWindow) previewWindow.location = `/api/reportes/${reporte.id_reporte}/vista-previa`;
    appMessage.textContent = `Borrador ${reporte.codigo_reporte} creado. Revise la vista previa antes de publicar.`;
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
    recordForm.elements.activo.checked = row.activo;
  }

  if (deleteId) {
    await api(`${config.endpoint}/${deleteId}`, { method: "DELETE" });
    await loadRows();
  }
});

clearButton.addEventListener("click", resetForm);

logoutButton.addEventListener("click", async () => {
  await api("/api/logout", { method: "POST" }).catch(() => null);
  appView.classList.add("hidden");
  loginView.classList.remove("hidden");
});

api("/api/session")
  .then(async ({ usuario }) => {
    showApp(usuario);
    configureModule();
    await loadRows();
  })
  .catch(() => {
    appView.classList.add("hidden");
    loginView.classList.remove("hidden");
  });
