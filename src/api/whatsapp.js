import api from "./client";

/** Estado de la sesión del servicio interno de WhatsApp (conectado/esperando QR/caído). */
export async function obtenerEstadoWhatsapp() {
  const res = await api.get("/whatsapp/estado/");
  return res.data;
}

/** URL del QR vigente para vincular el teléfono (null si no hay uno pendiente). */
export async function obtenerQrWhatsapp() {
  try {
    const res = await api.get("/whatsapp/qr/", { responseType: "blob" });
    return window.URL.createObjectURL(res.data);
  } catch (err) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
}
