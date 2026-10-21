import { useState } from "react";
import Modal from "./Modal";
import { crearTubo, actualizarTubo } from "../api/tubos";
import { extraerMensajeError } from "../api/client";

const VACIO = {
  dimensiones: "",
  espesor_mm: "",
  peso_unitario_kg: "",
  costo_usd_kg: "",
  largo_barra_m: "6",
  activo: true,
};

export default function TuboFormModal({ tubo, onClose, onSaved }) {
  const editando = Boolean(tubo);
  const [form, setForm] = useState(
    tubo
      ? {
          dimensiones: tubo.dimensiones,
          espesor_mm: tubo.espesor_mm ?? "",
          peso_unitario_kg: tubo.peso_unitario_kg,
          costo_usd_kg: tubo.costo_usd_kg,
          largo_barra_m: tubo.largo_barra_m,
          activo: tubo.activo,
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
      const payload = {
        ...form,
        espesor_mm: form.espesor_mm === "" ? null : Number(form.espesor_mm),
        peso_unitario_kg: Number(form.peso_unitario_kg),
        costo_usd_kg: Number(form.costo_usd_kg),
        largo_barra_m: Number(form.largo_barra_m),
      };
      const resultado = editando ? await actualizarTubo(tubo.id, payload) : await crearTubo(payload);
      onSaved(resultado);
    } catch (err) {
      setError(extraerMensajeError(err, "No se pudo guardar el tubo."));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal
      title={editando ? `Editar tubo` : "Nuevo tubo"}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={onSubmit} disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar tubo"}
          </button>
        </>
      }
    >
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="field">
          <label>Dimensiones</label>
          <input
            className="input"
            value={form.dimensiones}
            onChange={(e) => set("dimensiones", e.target.value)}
            placeholder='Ej: 30 50 0,9'
            required
          />
        </div>
        <div className="form-grid">
          <div className="field">
            <label>Espesor (mm)</label>
            <input
              className="input num"
              type="number"
              step="0.01"
              value={form.espesor_mm}
              onChange={(e) => set("espesor_mm", e.target.value)}
            />
          </div>
          <div className="field">
            <label>Peso unitario (kg)</label>
            <input
              className="input num"
              type="number"
              step="0.0001"
              value={form.peso_unitario_kg}
              onChange={(e) => set("peso_unitario_kg", e.target.value)}
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
          <div className="field">
            <label>Largo de barra (m)</label>
            <input
              className="input num"
              type="number"
              step="0.1"
              value={form.largo_barra_m}
              onChange={(e) => set("largo_barra_m", e.target.value)}
            />
          </div>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginTop: 4 }}>
          <input type="checkbox" checked={form.activo} onChange={(e) => set("activo", e.target.checked)} />
          Tubo activo (visible en la lista de precios)
        </label>
      </form>
    </Modal>
  );
}
