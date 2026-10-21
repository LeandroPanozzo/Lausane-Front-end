import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// El access/refresh token viven en cookies httpOnly que pone el backend
// (ver precios/auth_views.py) — el JS de acá nunca los toca, así un XSS no
// puede robarlos. `withCredentials` hace que el navegador las mande solas.
//
// `lp_authed` es solo una bandera de UI (¿mostramos pantalla de login o la
// app?), no la barrera de seguridad real — esa la impone el backend
// validando la cookie en cada request.
const AUTHED_KEY = "lp_authed";

export const authFlag = {
  get: () => localStorage.getItem(AUTHED_KEY) === "1",
  set: () => localStorage.setItem(AUTHED_KEY, "1"),
  clear: () => {
    localStorage.removeItem(AUTHED_KEY);
    localStorage.removeItem("lp_username");
  },
};

const api = axios.create({ baseURL: API_URL, withCredentials: true });

// Si un endpoint devuelve 401, intentamos refrescar el access token (vía
// cookie) una sola vez y reintentamos la request original. Si el refresh
// también falla, mandamos al usuario de vuelta al login.
let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status !== 401 || original._retry || original.url?.includes("/auth/token")) {
      return Promise.reject(error);
    }

    if (!authFlag.get()) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${API_URL}/auth/token/refresh/`, {}, { withCredentials: true })
          .finally(() => {
            refreshPromise = null;
          });
      }
      await refreshPromise;
      return api(original);
    } catch (refreshError) {
      authFlag.clear();
      window.dispatchEvent(new Event("lp:logout"));
      return Promise.reject(refreshError);
    }
  }
);

export default api;

/** Extrae un mensaje de error legible de una respuesta de DRF. */
export function extraerMensajeError(error, fallback = "Ocurrió un error inesperado.") {
  const data = error?.response?.data;
  if (!data) return error?.message || fallback;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  // Errores de validación de serializer: { campo: ["mensaje"] }
  const partes = Object.entries(data).map(([campo, msgs]) => {
    const texto = Array.isArray(msgs) ? msgs.join(" ") : String(msgs);
    return campo === "non_field_errors" ? texto : `${campo}: ${texto}`;
  });
  return partes.length ? partes.join(" — ") : fallback;
}
