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
