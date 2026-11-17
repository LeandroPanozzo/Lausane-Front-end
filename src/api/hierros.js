import api from "./client";

export async function listarHierros({ tipo, search = "", page = 1 } = {}) {
  const res = await api.get("/hierros/", { params: { tipo, search, page } });
  return res.data;
}

export async function crearHierro(payload) {
  const res = await api.post("/hierros/", payload);
  return res.data;
}

export async function actualizarHierro(id, payload) {
  const res = await api.patch(`/hierros/${id}/`, payload);
  return res.data;
}

export async function eliminarHierro(id) {
  await api.delete(`/hierros/${id}/`);
}

export async function listaPreciosHierros(tipo, { forzarDolar = false } = {}) {
  const params = { tipo };
  if (forzarDolar) params.forzar_dolar = "true";
  const res = await api.get("/hierros/lista-precios/", { params });
  return res.data;
}

export async function listarConfiguracionHierro() {
  const res = await api.get("/configuracion-hierro/");
  return res.data;
}

export async function actualizarConfiguracionHierro(tipo, payload) {
  const res = await api.patch(`/configuracion-hierro/${tipo}/`, payload);
  return res.data;
}
