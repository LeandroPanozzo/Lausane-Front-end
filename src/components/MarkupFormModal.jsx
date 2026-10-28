import { useState } from "react";
import Modal from "./Modal";
import { crearMarkup, actualizarMarkup } from "../api/config";
import { extraerMensajeError } from "../api/client";

const VACIO = { tipo: "DD", espesor: "", ancho_mm: "", porcentaje: "", orden: 0, activo: true };

export default function MarkupFormModal({ markup, onClose, onSaved }) {
  const editando = Boolean(markup?.id);
  const [form, setForm] = useState(
    editando
      ? {
          tipo: markup.tipo,
          espesor: markup.espesor,
          ancho_mm: markup.ancho_mm,
          porcentaje: markup.porcentaje ?? "",
          orden: markup.orden,
          activo: markup.activo,
        }
      : { ...VACIO, tipo: markup?.tipo || "DD" }
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
        porcentaje: form.porcentaje === "" ? null : Number(form.porcentaje),
        orden: Number(form.orden) || 0,
      };
      const resultado = editando ? await actualizarMarkup(markup.id, payload) : await crearMarkup(payload);
      onSaved(resultado);
    } catch (err) {
      setError(extraerMensajeError(err, "No se pudo guardar el recargo."));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal
      title={editando ? "Editar recargo por espesor" : "Nuevo recargo por espesor"}
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
        <div className="field">
          <label>Tipo de chapa</label>
          <select className="input" value={form.tipo} onChange={(e) => set("tipo", e.target.value)}>
            <option value="DD">Laminado en Frío</option>
            <option value="NEGRA">Laminado en Caliente</option>
          </select>
        </div>
        <div className="form-grid">
          <div className="field">
            <label>Espesor</label>
            <input
              className="input"
              value={form.espesor}
              onChange={(e) => set("espesor", e.target.value)}
              placeholder="Ej: 16 o '12,14 y 20'"
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
        </div>
        <div className="field">
          <label>Recargo (fracción)</label>
          <input
            className="input num"
            type="number"
            step="0.0001"
            value={form.porcentaje}
            onChange={(e) => set("porcentaje", e.target.value)}
            placeholder="Ej: 0.07 para 7%"
          />
          <div className="hint">Dejar vacío si no está disponible para esa combinación (equivalente a "XXX" en el Excel)</div>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginTop: 4 }}>
          <input type="checkbox" checked={form.activo} onChange={(e) => set("activo", e.target.checked)} />
          Recargo activo (visible en la lista de precios del cliente)
        </label>
      </form>
    </Modal>
  );
}
