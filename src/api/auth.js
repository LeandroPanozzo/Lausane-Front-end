import api, { authFlag } from "./client";

export async function login(username, password) {
  const res = await api.post("/auth/token/", { username, password });
  authFlag.set();
  return res.data;
}

export async function logout() {
  try {
    await api.post("/auth/logout/");
  } finally {
    authFlag.clear();
  }
}

export function estaAutenticado() {
  return authFlag.get();
}

export async function solicitarResetPassword(username) {
  const res = await api.post("/auth/password-reset/", { username });
  return res.data;
}

export async function confirmarResetPassword(uid, token, password) {
  const res = await api.post("/auth/password-reset/confirmar/", { uid, token, password });
  return res.data;
}
