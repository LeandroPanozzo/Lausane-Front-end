import { useState } from "react";
import Modal from "./Modal";
import { crearMarkup, actualizarMarkup } from "../api/config";
import { extraerMensajeError } from "../api/client";
import GestionLongitudesChapa from "./GestionLongitudesChapa";

const VACIO = {
  tipo: "DD", espesor: "", ancho_mm: "", porcentaje: "", orden: 0, activo: true,
  precio_venta_manual: "", precio_venta_moneda: "ARS",
};

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
          precio_venta_manual: markup.precio_venta_manual ?? "",
          precio_venta_moneda: markup.precio_venta_moneda || "ARS",
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
        precio_venta_manual: form.precio_venta_manual === "" ? null : Number(form.precio_venta_manual),
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

        <div className="field" style={{ marginTop: 16 }}>
          <label>Precio de venta manual por kg (opcional)</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="input num"
              type="number"
              step="any"
              min="0"
              style={{ flex: 1 }}
              value={form.precio_venta_manual}
              onChange={(e) => set("precio_venta_manual", e.target.value)}
              placeholder="Dejar vacío para usar el cálculo automático"
            />
            <select
              className="input"
              style={{ width: 120 }}
              value={form.precio_venta_moneda}
              onChange={(e) => set("precio_venta_moneda", e.target.value)}
            >
              <option value="ARS">Pesos ($)</option>
              <option value="USD">Dólares (US$)</option>
            </select>
          </div>
          <div className="hint">
            Si se completa, reemplaza el % de recargo para esta combinación (solo se le sigue
            aplicando el descuento propio de cada cliente). Vacío = sigue calculándose con el %.
          </div>
          {form.precio_venta_manual !== "" && form.precio_venta_moneda === "USD" && (
            <div className="hint" style={{ color: "var(--accent)" }}>
              Se va a calcular usando la cotización del dólar del día.
            </div>
          )}
        </div>

        <div style={{ marginTop: 16 }}>
          <GestionLongitudesChapa anchoMm={form.ancho_mm} />
        </div>
      </form>
    </Modal>
  );
}
