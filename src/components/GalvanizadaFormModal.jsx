import { useState } from "react";
import Modal from "./Modal";
import { crearGalvanizada, actualizarGalvanizada } from "../api/galvanizada";
import { extraerMensajeError } from "../api/client";

const VACIO = { espesor: "", ancho_mm: "", costo_usd_kg: "", activo: true, usar_incremento_general: true };

export default function GalvanizadaFormModal({ chapa, onClose, onSaved }) {
  const editando = Boolean(chapa);
  const [form, setForm] = useState(
    chapa
      ? {
          espesor: chapa.espesor,
          ancho_mm: chapa.ancho_mm,
          costo_usd_kg: chapa.costo_usd_kg,
          activo: chapa.activo,
          usar_incremento_general: chapa.usar_incremento_general,
        }
      : VACIO
  );
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      const payload = { ...form, costo_usd_kg: Number(form.costo_usd_kg) };
      const resultado = editando ? await actualizarGalvanizada(chapa.id, payload) : await crearGalvanizada(payload);
      onSaved(resultado);
    } catch (err) {
      setError(extraerMensajeError(err, "No se pudo guardar la chapa galvanizada."));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal
      title={editando ? "Editar chapa galvanizada" : "Nueva chapa galvanizada"}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={onSubmit} disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar"}
          </button>
        </>
      }
    >
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="form-grid">
          <div className="field">
            <label>Espesor</label>
            <input
              className="input"
              value={form.espesor}
              onChange={(e) => set("espesor", e.target.value)}
              placeholder="Ej: 16 o '16 14'"
              required
            />
          </div>
          <div className="field">
            <label>Ancho (mm)</label>
            <input
              className="input"
              value={form.ancho_mm}
              onChange={(e) => set("ancho_mm", e.target.value)}
              placeholder="Ej: 1000"
              required
            />
          </div>
          <div className="field">
            <label>Costo (U$S/kg)</label>
            <input
              className="input num"
              type="number"
              step="0.0001"
              value={form.costo_usd_kg}
              onChange={(e) => set("costo_usd_kg", e.target.value)}
              required
            />
          </div>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginTop: 4 }}>
          <input type="checkbox" checked={form.activo} onChange={(e) => set("activo", e.target.checked)} />
          Chapa activa (visible en la lista de precios)
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginTop: 8 }}>
          <input
            type="checkbox"
            checked={form.usar_incremento_general}
            onChange={(e) => set("usar_incremento_general", e.target.checked)}
          />
          Aplicar el incremento general de galvanizada
        </label>
        {!form.usar_incremento_general && (
          <div className="hint" style={{ marginTop: 4 }}>
            Destildado: esta chapa se vende directo al costo, sin el % que se configura en Precios Base.
          </div>
        )}
      </form>
    </Modal>
  );
}
