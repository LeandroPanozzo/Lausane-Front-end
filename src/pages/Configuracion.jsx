import { useCallback, useEffect, useRef, useState } from "react";
import { obtenerConfiguracion, actualizarConfiguracion, cargarCotizacionManual } from "../api/config";
import { obtenerEstadoWhatsapp, obtenerQrWhatsapp } from "../api/whatsapp";
import { extraerMensajeError } from "../api/client";
import { Loading } from "../components/Ui";
import { useDolar } from "../context/DolarContext";

export default function Configuracion() {
  const { cotizacion, refrescar, volverAOficial } = useDolar();
  const [volviendo, setVolviendo] = useState(false);
  const [form, setForm] = useState(null);
  const [error, setError] = useState(null);
  const [ok, setOk] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [manual, setManual] = useState({ compra: "", venta: "" });
  const [manualError, setManualError] = useState(null);
  const [manualOk, setManualOk] = useState(false);
  const [guardandoManual, setGuardandoManual] = useState(false);

  useEffect(() => {
    obtenerConfiguracion().then(setForm).catch(() => setError("No se pudo cargar la configuración."));
  }, []);

  const [estadoWsp, setEstadoWsp] = useState(null);
  const [qrWsp, setQrWsp] = useState(null);
  const qrUrlAnteriorRef = useRef(null);

  const refrescarWhatsapp = useCallback(async () => {
    try {
      const estado = await obtenerEstadoWhatsapp();
      setEstadoWsp(estado);
      if (estado.estado === "esperando_qr") {
        const url = await obtenerQrWhatsapp();
        if (qrUrlAnteriorRef.current) window.URL.revokeObjectURL(qrUrlAnteriorRef.current);
        qrUrlAnteriorRef.current = url;
        setQrWsp(url);
      } else {
        setQrWsp(null);
      }
    } catch {
      setEstadoWsp({ estado: "no_disponible" });
    }
  }, []);

  useEffect(() => {
    refrescarWhatsapp();
    const intervalo = setInterval(refrescarWhatsapp, 5000);
    return () => clearInterval(intervalo);
  }, [refrescarWhatsapp]);

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
    setOk(null);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setOk(null);
    setGuardando(true);
    try {
      const payload = {
        precio_base_dd: Number(form.precio_base_dd),
        precio_base_negra: Number(form.precio_base_negra),
        incremento_tubos: Number(form.incremento_tubos),
        incremento_galvanizada: Number(form.incremento_galvanizada),
      };
      const actualizado = await actualizarConfiguracion(payload);
      setForm(actualizado);
      setOk("Configuración guardada. Los nuevos precios ya se aplican en todos los cálculos.");
    } catch (err) {
      setError(extraerMensajeError(err, "No se pudo guardar la configuración."));
    } finally {
      setGuardando(false);
    }
  }

  async function onSubmitManual(e) {
    e.preventDefault();
    setManualError(null);
    setManualOk(false);
    setGuardandoManual(true);
    try {
      await cargarCotizacionManual(Number(manual.compra), Number(manual.venta));
      setManual({ compra: "", venta: "" });
      setManualOk(true);
      refrescar();
    } catch (err) {
      setManualError(extraerMensajeError(err, "No se pudo cargar la cotización manual."));
    } finally {
      setGuardandoManual(false);
    }
  }

  async function onVolverOficial() {
    setVolviendo(true);
    try {
      await volverAOficial();
    } finally {
      setVolviendo(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Configuración</span>
          <h1>Precios base y dólar</h1>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20, alignItems: "start" }}>
        <div className="panel">
          <div className="panel-header">
            <h2>Precios base</h2>
          </div>
          <div className="panel-body">
            {!form && !error && <Loading />}
            {error && <div className="alert alert-danger">{error}</div>}
            {form && (
              <form onSubmit={onSubmit}>
                {ok && <div className="alert alert-ok">{ok}</div>}
                <div className="form-grid">
                  <div className="field">
                    <label>Precio base DD (U$S/kg)</label>
                    <input
                      className="input num"
                      type="number"
                      step="0.00001"
                      value={form.precio_base_dd}
                      onChange={(e) => set("precio_base_dd", e.target.value)}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Precio base Negra (U$S/kg)</label>
                    <input
                      className="input num"
                      type="number"
                      step="0.00001"
                      value={form.precio_base_negra}
                      onChange={(e) => set("precio_base_negra", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Incremento general de tubos (fracción)</label>
                  <input
                    className="input num"
                    type="number"
                    step="0.0001"
                    value={form.incremento_tubos}
                    onChange={(e) => set("incremento_tubos", e.target.value)}
                    required
                  />
                  <div className="hint">Ej: 0.26 significa 26% sobre el costo en U$S/kg de cada tubo</div>
                </div>
                <div className="field">
                  <label>Incremento general de chapa galvanizada (fracción)</label>
                  <input
                    className="input num"
                    type="number"
                    step="0.0001"
                    value={form.incremento_galvanizada}
                    onChange={(e) => set("incremento_galvanizada", e.target.value)}
                    required
                  />
                  <div className="hint">Ej: 0.20 significa 20% sobre el costo en U$S/kg de cada espesor/ancho</div>
                </div>
                <button className="btn btn-primary" type="submit" disabled={guardando}>
                  {guardando ? "Guardando…" : "Guardar configuración"}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Cotización del dólar</h2>
          </div>
          <div className="panel-body">
            <div className={`stat-card ${cotizacion?.forzado_manual ? "stat-card-forzado" : ""}`} style={{ marginBottom: 12 }}>
              <div className="stat-label">
                {cotizacion?.forzado_manual ? "🔒 Cotización forzada (manual)" : "Cotización actual (venta)"}
              </div>
              <div className="stat-value num">
                {cotizacion ? `$${Number(cotizacion.venta).toLocaleString("es-AR")}` : "—"}
              </div>
              <div className="stat-sub">
                {cotizacion
                  ? `Compra $${Number(cotizacion.compra).toLocaleString("es-AR")} · cargada el ${new Date(cotizacion.fecha).toLocaleString("es-AR")}`
                  : "Sin datos"}
              </div>
            </div>

            {cotizacion?.forzado_manual && (
              <div className="stat-card" style={{ marginBottom: 18, borderTopColor: "var(--border-strong)" }}>
                <div className="stat-label">Oficial online (solo de referencia)</div>
                <div className="stat-value num">
                  {cotizacion.referencia_oficial
                    ? `$${Number(cotizacion.referencia_oficial.venta).toLocaleString("es-AR")}`
                    : "—"}
                </div>
                <div className="stat-sub">
                  {cotizacion.referencia_oficial
                    ? `Actualizada ${new Date(cotizacion.referencia_oficial.fecha).toLocaleString("es-AR")} · no se usa en los cálculos mientras el dólar esté forzado`
                    : "Sin datos"}
                </div>
              </div>
            )}

            <div className="form-row-actions" style={{ marginBottom: 20 }}>
              <button className="btn" onClick={refrescar}>
                ↻ {cotizacion?.forzado_manual ? "Actualizar referencia online" : "Forzar actualización desde la API"}
              </button>
              {cotizacion?.forzado_manual && (
                <button className="btn btn-primary" onClick={onVolverOficial} disabled={volviendo}>
                  {volviendo ? "Volviendo…" : "Volver a cotización oficial"}
                </button>
              )}
            </div>

            <h3 style={{ marginBottom: 10 }}>Carga manual (fuerza este valor)</h3>
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 0, marginBottom: 14 }}>
              Mientras esté cargada, el sistema usa este valor en todos los cálculos en vez de la
              cotización oficial online, hasta que la actualices de nuevo o toques "Volver a cotización oficial".
            </p>
            <form onSubmit={onSubmitManual}>
              {manualError && <div className="alert alert-danger">{manualError}</div>}
              {manualOk && <div className="alert alert-ok">Cotización manual cargada y forzada — ya se está usando en los cálculos.</div>}
              <div className="form-grid">
                <div className="field">
                  <label>Compra</label>
                  <input
                    className="input num"
                    type="number"
                    step="0.01"
                    value={manual.compra}
                    onChange={(e) => setManual((m) => ({ ...m, compra: e.target.value }))}
                    required
                  />
                </div>
                <div className="field">
                  <label>Venta</label>
                  <input
                    className="input num"
                    type="number"
                    step="0.01"
                    value={manual.venta}
                    onChange={(e) => setManual((m) => ({ ...m, venta: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <button className="btn btn-primary" type="submit" disabled={guardandoManual}>
                {guardandoManual ? "Forzando…" : "Forzar esta cotización"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 20, maxWidth: 480 }}>
        <div className="panel-header">
          <h2>WhatsApp (envío automático de presupuestos)</h2>
        </div>
        <div className="panel-body">
          {!estadoWsp && <Loading />}

          {estadoWsp?.estado === "conectado" && (
            <div className="alert alert-ok">
              ✅ Vinculado{estadoWsp.numero ? ` — número ${estadoWsp.numero}` : ""}. Los presupuestos se mandan solos por WhatsApp.
            </div>
          )}

          {estadoWsp?.estado === "esperando_qr" && (
            <>
              <p style={{ marginTop: 0 }}>
                Escaneá este código desde WhatsApp en tu teléfono: <b>Ajustes → Dispositivos vinculados → Vincular un dispositivo</b>.
              </p>
              {qrWsp ? (
                <img src={qrWsp} alt="Código QR para vincular WhatsApp" style={{ width: 260, height: 260 }} />
              ) : (
                <Loading />
              )}
              <div className="hint">Se actualiza solo cada pocos segundos.</div>
            </>
          )}

          {(estadoWsp?.estado === "desconectado" || estadoWsp?.estado === "iniciando") && (
            <div className="alert alert-warn">Reconectando con WhatsApp, esperá unos segundos…</div>
          )}

          {estadoWsp?.estado === "no_disponible" && (
            <div className="alert alert-danger">
              No se pudo conectar con el servicio de WhatsApp del servidor. Mientras tanto, el envío de
              presupuestos por WhatsApp sigue funcionando de forma manual (compartir/descargar).
            </div>
          )}

          <button className="btn" style={{ marginTop: 14 }} onClick={refrescarWhatsapp}>
            ↻ Actualizar
          </button>
        </div>
      </div>
    </>
  );
}
