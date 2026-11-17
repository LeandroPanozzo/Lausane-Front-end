import { useState } from "react";
import Modal from "./Modal";
import { crearHierro, actualizarHierro } from "../api/hierros";
import { extraerMensajeError } from "../api/client";

const VACIO = {
  medida: "", costo_usd_kg: "", activo: true, usar_incremento_general: true,
  precio_venta_manual: "", precio_venta_moneda: "ARS", peso_unitario_kg: "",
};

/** Formulario de alta/edición para un item de Hierros (Planchuela, Redondos
 * macizos, Cuadrados macizos, Perfil IPN, Perfil UPN) — mismo esquema que
 * CatalogoCostoFormModal (Galvanizada/Gruesa), pero con "medida" de texto
 * libre en vez de espesor/ancho, y sin gestión de longitudes. */
export default function HierroFormModal({ tipo, tipoLabel, hierro, onClose, onSaved }) {
  const editando = Boolean(hierro);

  const [form, setForm] = useState(
    hierro
      ? {
          medida: hierro.medida,
          costo_usd_kg: hierro.costo_usd_kg,
          activo: hierro.activo,
          usar_incremento_general: hierro.usar_incremento_general,
          precio_venta_manual: hierro.precio_venta_manual ?? "",
          precio_venta_moneda: hierro.precio_venta_moneda || "ARS",
          peso_unitario_kg: hierro.peso_unitario_kg ?? "",
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
        tipo,
        costo_usd_kg: Number(form.costo_usd_kg),
        precio_venta_manual: form.precio_venta_manual === "" ? null : Number(form.precio_venta_manual),
        peso_unitario_kg: form.peso_unitario_kg === "" ? null : Number(form.peso_unitario_kg),
      };
      const resultado = editando ? await actualizarHierro(hierro.id, payload) : await crearHierro(payload);
      onSaved(resultado);
    } catch (err) {
      setError(extraerMensajeError(err, `No se pudo guardar el item de ${tipoLabel.toLowerCase()}.`));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal
      title={editando ? `Editar ${tipoLabel.toLowerCase()}` : `Nuevo item de ${tipoLabel.toLowerCase()}`}
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
            <label>Medida</label>
            <input
              className="input"
              value={form.medida}
              onChange={(e) => set("medida", e.target.value)}
              placeholder='Ej: "IPN 80", "1/2", "25x3mm"'
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
            <label>Peso unitario (kg, opcional)</label>
            <input
              className="input num"
              type="number"
              step="0.0001"
              min="0"
              value={form.peso_unitario_kg}
              onChange={(e) => set("peso_unitario_kg", e.target.value)}
              placeholder="Ej: 6 (kg por barra/unidad)"
            />
          </div>
        </div>
        {form.peso_unitario_kg !== "" && (
          <div className="hint" style={{ marginTop: -8, marginBottom: 4 }}>
            Con el peso cargado, además del precio por kg se calcula el precio de venta por unidad
            (igual que en Tubos).
          </div>
        )}
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginTop: 4 }}>
          <input type="checkbox" checked={form.activo} onChange={(e) => set("activo", e.target.checked)} />
          Item activo (visible en la lista de precios)
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginTop: 8 }}>
          <input
            type="checkbox"
            checked={form.usar_incremento_general}
            onChange={(e) => set("usar_incremento_general", e.target.checked)}
          />
          Aplicar el incremento general de {tipoLabel.toLowerCase()}
        </label>
        {!form.usar_incremento_general && (
          <div className="hint" style={{ marginTop: 4 }}>
            Destildado: este item se vende directo al costo, sin el % que se configura acá arriba.
          </div>
        )}

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
            Si se completa, reemplaza el costo + incremento general para este item (solo se le
            sigue aplicando el descuento propio de cada cliente). Vacío = sigue calculándose como antes.
          </div>
          {form.precio_venta_manual !== "" && form.precio_venta_moneda === "USD" && (
            <div className="hint" style={{ color: "var(--accent)" }}>
              Se va a calcular usando la cotización del dólar del día.
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
