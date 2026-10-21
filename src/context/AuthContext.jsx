import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { login as apiLogin, logout as apiLogout, estaAutenticado } from "../api/auth";

const AuthContext = createContext(null);
const USERNAME_KEY = "lp_username";

export function AuthProvider({ children }) {
  const [autenticado, setAutenticado] = useState(estaAutenticado());
  const [username, setUsername] = useState(() => localStorage.getItem(USERNAME_KEY));

  useEffect(() => {
    const handleLogout = () => {
      setAutenticado(false);
      setUsername(null);
    };
    window.addEventListener("lp:logout", handleLogout);
    return () => window.removeEventListener("lp:logout", handleLogout);
  }, []);

  const login = useCallback(async (user, pass) => {
    await apiLogin(user, pass);
    localStorage.setItem(USERNAME_KEY, user);
    setAutenticado(true);
    setUsername(user);
  }, []);

  const logout = useCallback(() => {
    apiLogout(); // limpia la cookie del lado del servidor, no bloquea la UI
    localStorage.removeItem(USERNAME_KEY);
    setAutenticado(false);
    setUsername(null);
  }, []);

  return (
    <AuthContext.Provider value={{ autenticado, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
