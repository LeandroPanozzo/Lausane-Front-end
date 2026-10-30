import api from "./client";

/** Lista todas las longitudes estándar, o solo las de un ancho si se pasa anchoMm. */
export async function listarLongitudesChapa(anchoMm) {
  const params = anchoMm != null ? { ancho_mm: anchoMm } : {};
  const res = await api.get("/longitudes-chapa/", { params });
  return res.data.results ?? res.data;
}

/** Agrega una nueva longitud estándar para un ancho (queda disponible para elegir en todos los presupuestos). */
export async function crearLongitudChapa(anchoMm, longitudMm) {
  const res = await api.post("/longitudes-chapa/", { ancho_mm: String(anchoMm), longitud_mm: longitudMm });
  return res.data;
}

export async function eliminarLongitudChapa(id) {
  await api.delete(`/longitudes-chapa/${id}/`);
}
