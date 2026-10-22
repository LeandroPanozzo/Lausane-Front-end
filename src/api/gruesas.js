import api from "./client";

export async function listarGruesas({ search = "", page = 1 } = {}) {
  const res = await api.get("/gruesas/", { params: { search, page } });
  return res.data;
}

export async function crearGruesa(payload) {
  const res = await api.post("/gruesas/", payload);
  return res.data;
}

export async function actualizarGruesa(id, payload) {
  const res = await api.patch(`/gruesas/${id}/`, payload);
  return res.data;
}

export async function eliminarGruesa(id) {
  await api.delete(`/gruesas/${id}/`);
}

export async function listaPreciosGruesas({ forzarDolar = false } = {}) {
  const res = await api.get("/gruesas/lista-precios/", {
    params: forzarDolar ? { forzar_dolar: "true" } : {},
  });
  return res.data;
}
