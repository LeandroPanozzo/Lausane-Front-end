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

/** Manda el PDF por WhatsApp automáticamente (servicio interno con sesión vinculada). */
export async function enviarPresupuestoPorWhatsapp(id) {
  const res = await api.post(`/presupuestos/${id}/enviar-whatsapp/`);
  return res.data;
}

/** Elige el % de impuestos (10.5 o 21) para este presupuesto — hace falta antes de ver/descargar/mandar el PDF. */
export async function elegirImpuestoPresupuesto(id, impuestoPct) {
  const res = await api.post(`/presupuestos/${id}/elegir-impuesto/`, { impuesto_pct: impuestoPct });
  return res.data;
}

/** Agrega un extra (descripción + precio) a un ítem ya creado del presupuesto. */
export async function agregarExtraItem(presupuestoId, itemId, { descripcion, precio_pesos }) {
  const res = await api.post(
    `/presupuestos/${presupuestoId}/items/${itemId}/agregar-extra/`,
    { descripcion, precio_pesos }
  );
  return res.data;
}

/** Quita un extra ya cargado de un ítem. */
export async function quitarExtraItem(presupuestoId, itemId, extraId) {
  const res = await api.delete(`/presupuestos/${presupuestoId}/items/${itemId}/extras/${extraId}/`);
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
