const templates = {
  teknor: {
    key: "teknor", name: "Teknor", logo: "/logos/teknor.png",
    color: "#0074b9", pedido: false,
    signatures: ["SERVICIO TECNICO", "DEPARTAMENTO DE MANTENIMIENTO", "SERVICIO SOLICITANTE"],
  },
  meditec: {
    key: "meditec", name: "Meditec", logo: "/logos/meditec.png",
    color: "#0074c8", pedido: true,
    signatures: ["SERVICIO TECNICO MEDITEC", "SERVICIO TECNICO BIOMEDICA", "SERVICIO SOLICITANTE"],
  },
  gtmedical: {
    key: "gtmedical", name: "GT Medical", logo: "/logos/gt-medical.png",
    color: "#0074b9", pedido: true,
    signatures: ["SERVICIO TECNICO GT MEDICAL", "DEPARTAMENTO DE MANTENIMIENTO", "SERVICIO SOLICITANTE"],
  },
};

// La identidad viene de la BD, no del nombre editable ni de un codigo del cliente.
// Omitir el segundo argumento solo permite compatibilidad con ejemplos anteriores.
function resolveReportTemplate(companyName, templateCode) {
  const key = templateCode === undefined
    ? String(companyName || "").normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "")
    : templateCode;
  return Object.hasOwn(templates, key) ? templates[key] : {
    key: "generic", name: companyName || "Reporte de servicio", logo: null,
    color: "#0074b9", pedido: true, signatures: templates.teknor.signatures,
  };
}

module.exports = { resolveReportTemplate };
