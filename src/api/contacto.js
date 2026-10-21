import api from "./client";

export async function enviarContacto(datos) {
  const res = await api.post("/contacto/", datos);
  return res.data;
}
