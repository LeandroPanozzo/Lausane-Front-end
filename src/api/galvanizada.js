import api from "./client";

export async function listarGalvanizada({ search = "", page = 1 } = {}) {
  const res = await api.get("/galvanizada/", { params: { search, page } });
  return res.data;
}

export async function crearGalvanizada(payload) {
  const res = await api.post("/galvanizada/", payload);
  return res.data;
}

export async function actualizarGalvanizada(id, payload) {
  const res = await api.patch(`/galvanizada/${id}/`, payload);
  return res.data;
}

export async function eliminarGalvanizada(id) {
  await api.delete(`/galvanizada/${id}/`);
}

export async function listaPreciosGalvanizada({ forzarDolar = false, clienteId = null } = {}) {
  const params = {};
  if (forzarDolar) params.forzar_dolar = "true";
  if (clienteId) params.cliente_id = clienteId;
  const res = await api.get("/galvanizada/lista-precios/", { params });
  return res.data;
}
