import { useState } from "react";

export default function AgregarAlCarrito({ unidadDefault = "kg", onAgregar }) {
  const [cantidad, setCantidad] = useState("1");
  const [agregado, setAgregado] = useState(false);

  function handleAgregar() {
    const valor = Number(cantidad);
    if (!valor || valor <= 0) return;
    onAgregar(valor, unidadDefault);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1200);
  }

  return (
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
  );
}
