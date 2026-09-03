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

const modules = {
  servicios: {
    title: "Servicios solicitantes",
    endpoint: "/api/servicios-solicitantes",
    id: "id_servicio_solicitante",
    extraLabel: "Direccion",
    extraField: "direccion",
    columns: ["id_servicio_solicitante", "nombre", "telefono", "correo", "direccion", "activo"],
  },
  tecnicos: {
    title: "Tecnicos",
    endpoint: "/api/tecnicos",
    id: "id_tecnico",
    extraLabel: "Especialidad",
    extraField: "especialidad",
    columns: ["id_tecnico", "nombre", "telefono", "correo", "especialidad", "activo"],
  },
};

let activeModule = "servicios";

function token() {
  return localStorage.getItem("meditec_token");
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token()}`,
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
  const config = modules[activeModule];
  moduleTitle.textContent = config.title;
  recordForm.elements.extra.placeholder = config.extraLabel;
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
          ${config.columns.map((column) => `<td>${row[column] ?? ""}</td>`).join("")}
          <td class="actions">
            <button class="secondary" data-edit="${row[config.id]}">Editar</button>
            <button class="secondary" data-delete="${row[config.id]}">Desactivar</button>
          </td>
        </tr>
      `
    )
    .join("");
}

async function loadRows() {
  appMessage.textContent = "";
  const config = modules[activeModule];
  const rows = await api(config.endpoint);
  renderRows(rows);
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
    localStorage.setItem("meditec_token", payload.token);
    localStorage.setItem("meditec_usuario", JSON.stringify(payload.usuario));
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
    await loadRows();
  });
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
    recordForm.elements.activo.checked = row.activo;
  }

  if (deleteId) {
    await api(`${config.endpoint}/${deleteId}`, { method: "DELETE" });
    await loadRows();
  }
});

clearButton.addEventListener("click", resetForm);

logoutButton.addEventListener("click", () => {
  localStorage.removeItem("meditec_token");
  localStorage.removeItem("meditec_usuario");
  appView.classList.add("hidden");
  loginView.classList.remove("hidden");
});

const usuario = localStorage.getItem("meditec_usuario");
if (token() && usuario) {
  showApp(JSON.parse(usuario));
  configureModule();
  loadRows().catch(() => {
    localStorage.clear();
    appView.classList.add("hidden");
    loginView.classList.remove("hidden");
  });
}

