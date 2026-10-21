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

export async function listaPreciosGalvanizada({ forzarDolar = false } = {}) {
  const res = await api.get("/galvanizada/lista-precios/", {
    params: forzarDolar ? { forzar_dolar: "true" } : {},
  });
  return res.data;
}
