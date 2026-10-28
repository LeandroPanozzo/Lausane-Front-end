import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { obtenerConfiguracion, actualizarConfiguracion } from "../api/config";
import { extraerMensajeError } from "../api/client";
import { useDolar } from "../context/DolarContext";
import { Loading } from "../components/Ui";

export default function Panel() {
  const { cotizacion } = useDolar();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const [emailForm, setEmailForm] = useState({ email_remitente: "", email_password: "" });
  const [guardandoEmail, setGuardandoEmail] = useState(false);
  const [emailOk, setEmailOk] = useState(false);
  const [emailError, setEmailError] = useState(null);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        const config = await obtenerConfiguracion();
        if (!activo) return;
        setStats({ config });
        setEmailForm({ email_remitente: config.email_remitente || "", email_password: "" });
      } catch {
        if (activo) setError("No se pudo conectar con el servidor. ¿Está corriendo el backend de Django?");
      }
    }
    cargar();
    return () => {
      activo = false;
    };
  }, []);

  async function onSubmitEmail(e) {
    e.preventDefault();
    setEmailError(null);
    setEmailOk(false);
    setGuardandoEmail(true);
    try {
      const actualizado = await actualizarConfiguracion({
        email_remitente: emailForm.email_remitente,
        email_password: emailForm.email_password,
      });
      setStats((s) => ({ ...s, config: actualizado }));
      setEmailForm({ email_remitente: actualizado.email_remitente || "", email_password: "" });
      setEmailOk(true);
    } catch (err) {
      setEmailError(extraerMensajeError(err, "No se pudo guardar la cuenta de email."));
    } finally {
      setGuardandoEmail(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Panel general</span>
          <h1>Lista de precios — Chapa y Tubo</h1>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {!stats && !error && <Loading label="Cargando panel…" />}

      {stats && (
        <>
          <div className="stat-row">
            <div className={`stat-card ${cotizacion?.forzado_manual ? "stat-card-forzado" : ""}`}>
              <div className="stat-label">
                {cotizacion?.forzado_manual ? "🔒 Cotización forzada (manual)" : "Cotización dólar oficial"}
              </div>
              <div className="stat-value">
                {cotizacion ? `$${Number(cotizacion.venta).toLocaleString("es-AR")}` : "—"}
              </div>
              <div className="stat-sub">
                {cotizacion
                  ? cotizacion.forzado_manual
                    ? `Referencia online: ${cotizacion.referencia_oficial ? `$${Number(cotizacion.referencia_oficial.venta).toLocaleString("es-AR")}` : "—"}`
                    : `Fuente: ${cotizacion.fuente}`
                  : "Sin datos todavía"}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Precio base Laminado en Frío (U$S/kg)</div>
              <div className="stat-value num">{Number(stats.config.precio_base_dd).toFixed(3)}</div>
              <div className="stat-sub">Chapa Laminado en Frío</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Precio base Laminado en Caliente (U$S/kg)</div>
              <div className="stat-value num">{Number(stats.config.precio_base_negra).toFixed(3)}</div>
              <div className="stat-sub">Chapa Laminado en Caliente</div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h2>Accesos rápidos</h2>
            </div>
            <div className="panel-body" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="btn" to="/app/clientes">
                + Nuevo cliente
              </Link>
              <Link className="btn" to="/app/tubos">
                + Nuevo tubo
              </Link>
              <Link className="btn" to="/app/markups-chapa">
                + Nueva chapa
              </Link>
              <Link className="btn" to="/app/configuracion">
                Editar precios base
              </Link>
            </div>
          </div>

          <div className="panel" style={{ marginTop: 20 }}>
            <div className="panel-header">
              <h2>Cuenta de Gmail para enviar presupuestos</h2>
            </div>
            <div className="panel-body">
              <p className="hint" style={{ marginTop: 0, marginBottom: 14 }}>
                Los presupuestos se mandan por email desde esta cuenta. Dejá los dos campos vacíos para
                usar la configuración fija del servidor en su lugar.
              </p>
              {!stats.config.email_remitente && (
                <div className="alert alert-ok" style={{ marginBottom: 14 }}>
                  {stats.config.email_configurado_por_defecto ? (
                    <>
                      Ahora mismo se está usando la cuenta fija del servidor:{" "}
                      <strong>{stats.config.email_remitente_por_defecto}</strong> (contraseña configurada).
                    </>
                  ) : (
                    "No hay ninguna cuenta configurada todavía (ni acá ni en el servidor) — los emails no se van a poder enviar."
                  )}
                </div>
              )}
              {emailError && <div className="alert alert-danger">{emailError}</div>}
              {emailOk && <div className="alert alert-ok">Cuenta de email guardada.</div>}
              <form onSubmit={onSubmitEmail}>
                <div className="form-grid">
                  <div className="field">
                    <label>
                      Gmail remitente
                      {!stats.config.email_remitente && stats.config.email_configurado_por_defecto && (
                        <span className="badge badge-ok" style={{ marginLeft: 8 }}>
                          Usando del servidor
                        </span>
                      )}
                    </label>
                    <input
                      className="input"
                      type="email"
                      value={emailForm.email_remitente}
                      onChange={(e) => setEmailForm((f) => ({ ...f, email_remitente: e.target.value }))}
                      placeholder={stats.config.email_remitente_por_defecto || "ventas@lausane.com.ar"}
                    />
                  </div>
                  <div className="field">
                    <label>
                      Contraseña de aplicación
                      {stats.config.email_password_configurada ? (
                        <span className="badge badge-ok" style={{ marginLeft: 8 }}>
                          Configurada
                        </span>
                      ) : (
                        stats.config.email_configurado_por_defecto && (
                          <span className="badge badge-ok" style={{ marginLeft: 8 }}>
                            Usando del servidor
                          </span>
                        )
                      )}
                    </label>
                    <input
                      className="input"
                      type="password"
                      value={emailForm.email_password}
                      onChange={(e) => setEmailForm((f) => ({ ...f, email_password: e.target.value }))}
                      placeholder={
                        stats.config.email_password_configurada
                          ? "Dejar vacío para no cambiarla"
                          : "Pegá acá la contraseña de 16 caracteres"
                      }
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                <div className="hint" style={{ marginBottom: 14 }}>
                  No es la contraseña normal de la cuenta de Google — es una "contraseña de aplicación"
                  de 16 caracteres, que se genera en myaccount.google.com/apppasswords (esa cuenta de
                  Google necesita tener activada la verificación en 2 pasos para poder generarla).
                </div>
                <button className="btn btn-primary" type="submit" disabled={guardandoEmail}>
                  {guardandoEmail ? "Guardando…" : "Guardar"}
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
