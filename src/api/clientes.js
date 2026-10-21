import api from "./client";

export async function listarClientes({ search = "", page = 1 } = {}) {
  const res = await api.get("/clientes/", { params: { search, page } });
  return res.data; // { count, next, previous, results }
}

export async function obtenerCliente(id) {
  const res = await api.get(`/clientes/${id}/`);
  return res.data;
}

export async function crearCliente(payload) {
  const res = await api.post("/clientes/", payload);
  return res.data;
}

export async function actualizarCliente(id, payload) {
  const res = await api.patch(`/clientes/${id}/`, payload);
  return res.data;
}

export async function eliminarCliente(id) {
  await api.delete(`/clientes/${id}/`);
}

export async function obtenerPreciosCliente(id, { forzarDolar = false } = {}) {
  const res = await api.get(`/clientes/${id}/precios/`, {
    params: forzarDolar ? { forzar_dolar: "true" } : {},
  });
  return res.data;
}
