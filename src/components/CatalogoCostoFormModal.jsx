import { useState } from "react";
import Modal from "./Modal";
import { crearGalvanizada, actualizarGalvanizada } from "../api/galvanizada";
import { crearGruesa, actualizarGruesa } from "../api/gruesas";
import { extraerMensajeError } from "../api/client";
import GestionLongitudesChapa from "./GestionLongitudesChapa";

const VACIO = {
  espesor: "", ancho_mm: "", costo_usd_kg: "", activo: true, usar_incremento_general: true,
  precio_venta_manual: "", precio_venta_moneda: "ARS",
};

const API_POR_TIPO = {
  galvanizada: { crear: crearGalvanizada, actualizar: actualizarGalvanizada },
  gruesa: { crear: crearGruesa, actualizar: actualizarGruesa },
};

const ETIQUETA_POR_TIPO = { galvanizada: "galvanizada", gruesa: "gruesa" };

/** Formulario de alta/edición para chapas con costo propio en U$S/kg
 * (galvanizada y gruesa) — ambas usan exactamente la misma lógica de
 * incremento general, solo cambia a qué endpoint se manda. */
export default function CatalogoCostoFormModal({ tipo, chapa, onClose, onSaved }) {
  const editando = Boolean(chapa);
  const etiqueta = ETIQUETA_POR_TIPO[tipo];
  const api = API_POR_TIPO[tipo];

  const [form, setForm] = useState(
    chapa
      ? {
          espesor: chapa.espesor,
          ancho_mm: chapa.ancho_mm,
          costo_usd_kg: chapa.costo_usd_kg,
          activo: chapa.activo,
          usar_incremento_general: chapa.usar_incremento_general,
          precio_venta_manual: chapa.precio_venta_manual ?? "",
          precio_venta_moneda: chapa.precio_venta_moneda || "ARS",
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
        costo_usd_kg: Number(form.costo_usd_kg),
        precio_venta_manual: form.precio_venta_manual === "" ? null : Number(form.precio_venta_manual),
      };
      const resultado = editando ? await api.actualizar(chapa.id, payload) : await api.crear(payload);
      onSaved(resultado);
    } catch (err) {
      setError(extraerMensajeError(err, `No se pudo guardar la chapa ${etiqueta}.`));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal
      title={editando ? `Editar chapa ${etiqueta}` : `Nueva chapa ${etiqueta}`}
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
          Aplicar el incremento general de {etiqueta}
        </label>
        {!form.usar_incremento_general && (
          <div className="hint" style={{ marginTop: 4 }}>
            Destildado: esta chapa se vende directo al costo, sin el % que se configura acá arriba.
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
            Si se completa, reemplaza el costo + incremento general para esta chapa (solo se le
            sigue aplicando el descuento propio de cada cliente). Vacío = sigue calculándose como antes.
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
