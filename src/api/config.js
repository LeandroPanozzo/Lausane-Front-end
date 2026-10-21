import api from "./client";

// --- Markups de espesor (chapa) ---
export async function listarMarkups({ tipo } = {}) {
  const res = await api.get("/markups-chapa/", { params: tipo ? { tipo } : {} });
  return res.data;
}

export async function crearMarkup(payload) {
  const res = await api.post("/markups-chapa/", payload);
  return res.data;
}

export async function actualizarMarkup(id, payload) {
  const res = await api.patch(`/markups-chapa/${id}/`, payload);
  return res.data;
}

export async function eliminarMarkup(id) {
  await api.delete(`/markups-chapa/${id}/`);
}

// --- Configuración global ---
export async function obtenerConfiguracion() {
  const res = await api.get("/configuracion/");
  return res.data;
}

export async function actualizarConfiguracion(payload) {
  const res = await api.patch("/configuracion/", payload);
  return res.data;
}

// --- Dólar ---
export async function obtenerCotizacionActual({ forzar = false } = {}) {
  const res = await api.get("/dolar/actual/", { params: forzar ? { forzar: "true" } : {} });
  return res.data;
}

export async function cargarCotizacionManual(compra, venta) {
  const res = await api.post("/dolar/manual/", { compra, venta });
  return res.data;
}

export async function volverACotizacionOficial() {
  const res = await api.post("/dolar/volver-oficial/");
  return res.data;
}
