import { useState } from "react";
import Modal from "./Modal";
import { extraerMensajeError } from "../api/client";

/** Si todas las chapas seleccionadas comparten el mismo costo (redondeado a
 * 4 decimales), lo devuelve para precargarlo — si no, devuelve "" para que el
 * cuadro quede vacío y el usuario cargue el valor nuevo a mano. */
function valorComunOVacio(valores) {
  const vistos = new Set(valores.map((v) => Number(v).toFixed(4)));
  return vistos.size === 1 ? [...vistos][0] : "";
}

export default function CambiarPrecioMasivoModal({ chapas, actualizar, onClose, onGuardado }) {
  const [valor, setValor] = useState(valorComunOVacio(chapas.map((c) => c.costo_usd_kg)));
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);

    if (valor === "" || Number.isNaN(Number(valor))) {
      setError("Cargá un costo válido.");
      return;
    }

    setGuardando(true);
    try {
      await Promise.all(
        chapas.map((chapa) => actualizar(chapa.id, { costo_usd_kg: Number(valor) }))
      );
      onGuardado();
    } catch (err) {
      setError(extraerMensajeError(err, "No se pudo actualizar alguna de las chapas."));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal
      title={`Cambiar precio en conjunto (${chapas.length} chapa${chapas.length === 1 ? "" : "s"})`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={onSubmit} disabled={guardando}>
            {guardando ? "Guardando…" : "Aplicar a todas"}
          </button>
        </>
      }
    >
      {error && <div className="alert alert-danger">{error}</div>}
      <p className="hint" style={{ marginTop: 0 }}>
        Solo se puede cambiar el Costo (U$S/kg) — Venta U$S/kg y Venta $/kg salen solas de ahí
        (Costo + el incremento general, y eso multiplicado por la cotización del dólar), así que no
        tiene sentido editarlas por separado.
      </p>
      <form onSubmit={onSubmit}>
        <div className="field">
          <label>Costo (U$S/kg)</label>
          <input
            className="input num"
            type="number"
            step="0.0001"
            autoFocus
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder={valor === "" ? "Distintos valores — cargá el nuevo" : ""}
          />
        </div>
      </form>
    </Modal>
  );
}
