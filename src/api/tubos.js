import api from "./client";

export async function listarTubos({ search = "", page = 1 } = {}) {
  const res = await api.get("/tubos/", { params: { search, page } });
  return res.data;
}

export async function crearTubo(payload) {
  const res = await api.post("/tubos/", payload);
  return res.data;
}

export async function actualizarTubo(id, payload) {
  const res = await api.patch(`/tubos/${id}/`, payload);
  return res.data;
}

export async function eliminarTubo(id) {
  await api.delete(`/tubos/${id}/`);
}

export async function listaPreciosTubos({ forzarDolar = false } = {}) {
  const res = await api.get("/tubos/lista-precios/", {
    params: forzarDolar ? { forzar_dolar: "true" } : {},
  });
  return res.data;
}
