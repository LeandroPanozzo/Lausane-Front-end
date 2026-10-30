import { useState } from "react";
import { opcionesLongitud } from "../utils/longitudesChapa";

export default function AgregarAlCarrito({ unidadDefault = "kg", anchoMm, onAgregar }) {
  const [cantidad, setCantidad] = useState("1");
  const [agregado, setAgregado] = useState(false);

  const mostrarLongitud = anchoMm != null;
  const opciones = mostrarLongitud ? opcionesLongitud(anchoMm) : [];
  const [longitud, setLongitud] = useState(opciones.length ? String(opciones[0]) : "otro");
  const [longitudManual, setLongitudManual] = useState("");

  function handleAgregar() {
    const valor = Number(cantidad);
    if (!valor || valor <= 0) return;

    let longitudMm = null;
    if (mostrarLongitud) {
      longitudMm = longitud === "otro" ? Number(longitudManual) || null : Number(longitud);
    }

    onAgregar(valor, unidadDefault, longitudMm);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1200);
  }

  return (
    <div className="add-to-cart-col">
      {mostrarLongitud && (
        <div className="add-to-cart-longitud">
          <select
            className="input input-sm"
            value={longitud}
            onChange={(e) => setLongitud(e.target.value)}
            aria-label="Longitud"
          >
            {opciones.map((o) => (
              <option key={o} value={o}>{o} mm</option>
            ))}
            <option value="otro">Otro…</option>
          </select>
          {longitud === "otro" && (
            <input
              className="input input-sm num"
              type="number"
              min="0"
              step="any"
              placeholder="mm"
              value={longitudManual}
              onChange={(e) => setLongitudManual(e.target.value)}
              aria-label="Longitud manual en mm"
            />
          )}
        </div>
      )}
      <div className="add-to-cart-row">
        <input
          className="input num"
          type="number"
          min="0"
          step="any"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          aria-label={`Cantidad en ${unidadDefault}`}
        />
        <span className="cell-muted" style={{ fontSize: 12 }}>{unidadDefault}</span>
        <button className="btn btn-primary btn-sm" onClick={handleAgregar}>
          {agregado ? "✓ Agregado" : "+ Agregar"}
        </button>
      </div>
    </div>
  );
}
