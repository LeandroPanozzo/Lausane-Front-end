import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { obtenerCotizacionActual, volverACotizacionOficial } from "../api/config";
import { useAuth } from "./AuthContext";

const DolarContext = createContext(null);

const POLL_MS = 5 * 60 * 1000; // refresco automático cada 5 minutos

export function DolarProvider({ children }) {
  const { autenticado } = useAuth();
  const [cotizacion, setCotizacion] = useState(null);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const cargar = useCallback(async (forzar = false) => {
    setRefrescando(true);
    setError(null);
    try {
      const data = await obtenerCotizacionActual({ forzar });
      setCotizacion(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "No se pudo obtener la cotización del dólar.");
    } finally {
      setRefrescando(false);
    }
  }, []);

  useEffect(() => {
    if (!autenticado) {
      setCotizacion(null);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    cargar(false);
    intervalRef.current = setInterval(() => cargar(false), POLL_MS);
    return () => clearInterval(intervalRef.current);
  }, [autenticado, cargar]);

  const volverAOficial = useCallback(async () => {
    setRefrescando(true);
    setError(null);
    try {
      const data = await volverACotizacionOficial();
      setCotizacion(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "No se pudo volver a la cotización oficial.");
    } finally {
      setRefrescando(false);
    }
  }, []);

  return (
    <DolarContext.Provider
      value={{ cotizacion, refrescando, error, refrescar: () => cargar(true), volverAOficial }}
    >
      {children}
    </DolarContext.Provider>
  );
}

export function useDolar() {
  const ctx = useContext(DolarContext);
  if (!ctx) throw new Error("useDolar debe usarse dentro de <DolarProvider>");
  return ctx;
}
