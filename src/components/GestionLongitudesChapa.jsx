import { useCallback, useEffect, useState } from "react";
import { listarLongitudesChapa, crearLongitudChapa, eliminarLongitudChapa } from "../api/longitudesChapa";
import { extraerMensajeError } from "../api/client";

/** Mini-gestor de las longitudes estándar disponibles para un ancho de chapa,
 *  para usar dentro del modal de edición de espesor/ancho. */
export default function GestionLongitudesChapa({ anchoMm }) {
  const [longitudes, setLongitudes] = useState(null);
  const [nueva, setNueva] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    if (!anchoMm) {
      setLongitudes([]);
      return;
    }
    try {
      setLongitudes(await listarLongitudesChapa(anchoMm));
    } catch {
      setLongitudes([]);
    }
  }, [anchoMm]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function onAgregar(e) {
    e.preventDefault();
    setError(null);
    const valor = Number(nueva);
    if (!valor || valor <= 0) return;
    setGuardando(true);
    try {
      await crearLongitudChapa(anchoMm, valor);
      setNueva("");
      await cargar();
    } catch (err) {
      setError(extraerMensajeError(err, "No se pudo agregar la longitud."));
    } finally {
      setGuardando(false);
    }
  }

  async function onQuitar(id) {
    if (!window.confirm("¿Quitar esta longitud? Ya no va a aparecer para elegir en los presupuestos.")) return;
    try {
      await eliminarLongitudChapa(id);
      await cargar();
    } catch {
      alert("No se pudo quitar la longitud.");
    }
  }

  if (!anchoMm) {
    return <div className="hint">Cargá el ancho para ver/agregar las longitudes disponibles.</div>;
  }

  return (
    <div className="field">
      <label>Longitudes disponibles para {anchoMm}mm</label>
      {longitudes === null ? (
        <div className="hint">Cargando…</div>
      ) : longitudes.length === 0 ? (
        <div className="hint">Todavía no hay ninguna cargada — siempre se puede elegir "Otro…" al armar el presupuesto.</div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
          {longitudes.map((l) => (
            <span key={l.id} className="badge" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {l.longitud_mm}mm
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ padding: "0 4px" }}
                onClick={() => onQuitar(l.id)}
                aria-label={`Quitar longitud ${l.longitud_mm}mm`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
      {error && <div className="alert alert-danger" style={{ fontSize: 12.5 }}>{error}</div>}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="input num"
          type="number"
          min="0"
          step="any"
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
          placeholder="Ej: 3600"
          style={{ maxWidth: 140 }}
        />
        <button type="button" className="btn btn-sm" onClick={onAgregar} disabled={guardando}>
          {guardando ? "Agregando…" : "+ Agregar longitud"}
        </button>
      </div>
    </div>
  );
}
