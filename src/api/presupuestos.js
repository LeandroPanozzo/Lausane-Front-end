import api from "./client";

export async function crearPresupuesto(payload) {
  const res = await api.post("/presupuestos/", payload);
  return res.data;
}

export async function listarPresupuestos({ page = 1 } = {}) {
  const res = await api.get("/presupuestos/", { params: { page } });
  return res.data;
}

export async function obtenerPresupuesto(id) {
  const res = await api.get(`/presupuestos/${id}/`);
  return res.data;
}

export async function enviarPresupuestoPorEmail(id, destinatario, mensaje = "") {
  const res = await api.post(`/presupuestos/${id}/enviar-email/`, { destinatario, mensaje });
  return res.data;
}

export async function marcarPresupuestoEnviado(id) {
  const res = await api.post(`/presupuestos/${id}/marcar-enviado/`);
  return res.data;
}

/**
 * Descarga un archivo autenticado (el PDF/Excel del presupuesto) y dispara
 * la descarga en el navegador. No se puede usar un <a href> directo porque
 * el endpoint requiere el header Authorization.
 */
export async function descargarArchivoPresupuesto(id, tipo, nombreArchivo) {
  const res = await api.get(`/presupuestos/${id}/${tipo}/`, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

/** Abre el PDF en una nueva pestaña (para "ver antes de mandar"), en vez de forzar la descarga. */
export async function abrirPdfPresupuesto(id) {
  const res = await api.get(`/presupuestos/${id}/pdf/`, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
  window.open(url, "_blank");
}

/** Trae el PDF como Blob crudo, sin descargarlo ni abrirlo (para adjuntarlo, ej. en WhatsApp). */
export async function obtenerBlobPdfPresupuesto(id) {
  const res = await api.get(`/presupuestos/${id}/pdf/`, { responseType: "blob" });
  return new Blob([res.data], { type: "application/pdf" });
}
