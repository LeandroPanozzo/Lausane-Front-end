import { Fragment, useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  obtenerPresupuesto,
  descargarArchivoPresupuesto,
  abrirPdfPresupuesto,
  obtenerBlobPdfPresupuesto,
  enviarPresupuestoPorEmail,
  marcarPresupuestoEnviado,
  enviarPresupuestoPorWhatsapp,
  elegirImpuestoPresupuesto,
  agregarFleteItem,
  quitarFleteItem,
  agregarAjusteUnitarioItem,
  quitarAjusteUnitarioItem,
  asignarLongitudItem,
} from "../api/presupuestos";
import { listarLongitudesChapa } from "../api/longitudesChapa";
import { extraerMensajeError } from "../api/client";
import { Loading } from "../components/Ui";
import Modal from "../components/Modal";

/** La descripción de un ítem de chapa tiene el formato "... · ancho 1220mm". */
function extraerAnchoMm(descripcion) {
  const m = /ancho (\d+(?:\.\d+)?)mm/i.exec(descripcion || "");
  return m ? m[1] : null;
}

export default function PresupuestoDetalle() {
  const { id } = useParams();
  const [presupuesto, setPresupuesto] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState({});
  const [modalEmail, setModalEmail] = useState(false);
  const [modalImpuesto, setModalImpuesto] = useState(false);
  const [accionPendiente, setAccionPendiente] = useState(null);
  const [modalFlete, setModalFlete] = useState(null); // null | item
  const [modalAjuste, setModalAjuste] = useState(null); // null | item
  const [modalLongitud, setModalLongitud] = useState(null); // null | item

  const cargar = useCallback(async () => {
    try {
      const data = await obtenerPresupuesto(id);
      setPresupuesto(data);
    } catch {
      setError("No se pudo cargar el presupuesto.");
    }
  }, [id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!presupuesto) return <Loading label="Cargando presupuesto…" />;

  async function conCarga(clave, fn) {
    setCargando((c) => ({ ...c, [clave]: true }));
    try {
      await fn();
    } catch (err) {
      alert(extraerMensajeError(err, "Ocurrió un error."));
    } finally {
      setCargando((c) => ({ ...c, [clave]: false }));
    }
  }

  /** Exige que ya se haya elegido el % de impuestos antes de ejecutar `fn` (ver/descargar/mail/wsp). */
  function conImpuestoElegido(fn) {
    if (presupuesto.impuesto_pct != null) {
      fn();
    } else {
      setAccionPendiente(() => fn);
      setModalImpuesto(true);
    }
  }

  async function onQuitarFlete(itemId, extraId) {
    if (!window.confirm("¿Quitar este flete?")) return;
    try {
      const actualizado = await quitarFleteItem(presupuesto.id, itemId, extraId);
      setPresupuesto(actualizado);
    } catch (err) {
      alert(extraerMensajeError(err, "No se pudo quitar el flete."));
    }
  }

  async function onQuitarAjuste(itemId, ajusteId) {
    if (!window.confirm("¿Quitar este ajuste al precio unitario?")) return;
    try {
      const actualizado = await quitarAjusteUnitarioItem(presupuesto.id, itemId, ajusteId);
      setPresupuesto(actualizado);
    } catch (err) {
      alert(extraerMensajeError(err, "No se pudo quitar el ajuste."));
    }
  }

  async function onElegirImpuesto(pct) {
    const actualizado = await elegirImpuestoPresupuesto(presupuesto.id, pct);
    setPresupuesto(actualizado);
    setModalImpuesto(false);
    if (accionPendiente) {
      const fn = accionPendiente;
      setAccionPendiente(null);
      fn();
    }
  }

  function onWhatsapp() {
    const telefono = (presupuesto.cliente_detalle.telefono || "").replace(/\D/g, "");
    if (!telefono) {
      alert("Este cliente no tiene un teléfono cargado. Agregalo desde la ficha del cliente para poder enviarlo por WhatsApp.");
      return;
    }
    conCarga("whatsapp", async () => {
      // Camino principal: el servicio de WhatsApp vinculado en el servidor
      // manda el PDF solo, sin que haya que hacer nada más.
      try {
        const actualizado = await enviarPresupuestoPorWhatsapp(presupuesto.id);
        setPresupuesto(actualizado);
        return;
      } catch (err) {
        if (err?.response?.status !== 502) throw err; // 502 = servicio de WhatsApp caído/sin vincular
      }

      // Fallback: el servicio no está disponible (desconectado, sin vincular
      // todavía, etc.) — seguimos con el camino manual de siempre.
      alert(
        "El envío automático por WhatsApp no está disponible en este momento " +
          "(revisá la vinculación en Configuración). Seguimos con el envío manual."
      );
      const mensaje =
        `Hola ${presupuesto.cliente_detalle.nombre}, te compartimos el Presupuesto Lausane N° ${presupuesto.codigo} ` +
        `por un total de $${Number(presupuesto.total_pesos).toLocaleString("es-AR")}.`;
      const nombreArchivo = `presupuesto_lausane_${presupuesto.numero}.pdf`;
      const blobPdf = await obtenerBlobPdfPresupuesto(presupuesto.id);
      const archivo = new File([blobPdf], nombreArchivo, { type: "application/pdf" });

      let compartidoOk = false;
      if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
        // Abre el selector nativo (compartir) con el PDF ya adjunto: ahí el
        // usuario elige WhatsApp y el archivo viaja como archivo real. Si el
        // navegador dice que puede compartir pero en realidad no hay ningún
        // selector real disponible, share() puede quedarse colgado para
        // siempre — por eso el timeout, para no trabar el botón.
        try {
          const TIMEOUT = Symbol("timeout");
          const resultado = await Promise.race([
            navigator.share({ files: [archivo], text: mensaje, title: `Presupuesto ${presupuesto.codigo}` }),
            new Promise((resolve) => setTimeout(() => resolve(TIMEOUT), 15000)),
          ]);
          if (resultado !== TIMEOUT) compartidoOk = true;
        } catch (err) {
          if (err?.name === "AbortError") return; // el usuario cerró el selector, no es un error
          // cualquier otro error (o el timeout de arriba): seguimos con la descarga manual
        }
      }

      if (!compartidoOk) {
        // El navegador no puede compartir archivos (típico en desktop), o no
        // se pudo confirmar que el selector nativo funcionó: bajamos el PDF y
        // abrimos WhatsApp con el texto, para adjuntarlo a mano.
        const url = window.URL.createObjectURL(archivo);
        const link = document.createElement("a");
        link.href = url;
        link.download = nombreArchivo;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        const mensajeDescarga = `${mensaje}\n\nSe descargó el PDF a tu dispositivo: adjuntalo en este chat antes de enviar.`;
        window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensajeDescarga)}`, "_blank");
      }

      await marcarPresupuestoEnviado(presupuesto.id);
      await cargar();
    });
  }

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">
            <Link to="/app/presupuestos" style={{ color: "inherit" }}>Presupuestos</Link> / {presupuesto.codigo}
          </span>
          <h1>Presupuesto Lausane</h1>
        </div>
        <span className={`badge ${presupuesto.estado === "enviado" ? "badge-ok" : "badge-warn"}`}>
          {presupuesto.estado === "enviado" ? "Enviado" : "Borrador"}
        </span>
      </div>

      <div className="presupuesto-header-card">
        <div className="stat-row" style={{ marginBottom: 0 }}>
          <div className="stat-card">
            <div className="stat-label">Cliente</div>
            <div className="stat-value" style={{ fontSize: 16 }}>{presupuesto.cliente_detalle.nombre}</div>
            <div className="stat-sub">N° {presupuesto.cliente_detalle.numero}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Cotización aplicada</div>
            <div className="stat-value num">${Number(presupuesto.cotizacion_dolar).toLocaleString("es-AR")}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Fecha</div>
            <div className="stat-value" style={{ fontSize: 16 }}>
              {new Date(presupuesto.creado).toLocaleDateString("es-AR")}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total</div>
            <div className="stat-value num" style={{ color: "var(--accent)" }}>
              ${Number(presupuesto.total_pesos).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-header"><h2>Ítems</h2></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Descripción</th>
                <th className="col-right">Cantidad</th>
                <th>Unidad</th>
                <th>Longitud</th>
                <th className="col-right">Precio unit.</th>
                <th className="col-right">Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {presupuesto.items.map((item) => (
                <Fragment key={item.id}>
                  <tr>
                    <td>
                      {item.descripcion_con_ajustes || item.descripcion}
                      {item.ajustes_unitarios.map((ajuste) => (
                        <button
                          key={ajuste.id}
                          className="btn btn-ghost btn-sm"
                          style={{ marginLeft: 6 }}
                          onClick={() => onQuitarAjuste(item.id, ajuste.id)}
                          aria-label={`Quitar ${ajuste.descripcion} del precio unitario`}
                          title={`Quitar ${ajuste.descripcion}`}
                        >
                          ✕
                        </button>
                      ))}
                    </td>
                    <td className="num col-right">{Number(item.cantidad)}</td>
                    <td className="cell-muted">{item.unidad}</td>
                    <td className="cell-muted">
                      {item.longitud_mm ? `${item.longitud_mm}mm` : "-"}
                      {item.tipo === "CHAPA" && (
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ marginLeft: 6 }}
                          onClick={() => setModalLongitud(item)}
                          aria-label={item.longitud_mm ? "Cambiar longitud" : "Elegir longitud"}
                          title={item.longitud_mm ? "Cambiar longitud" : "Elegir longitud"}
                        >
                          {item.longitud_mm ? "✎" : "Elegir"}
                        </button>
                      )}
                    </td>
                    <td className="num col-right">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                        {Number(item.ajustes_unitarios.length) > 0 && (
                          <span style={{ textDecoration: "line-through", color: "var(--text-faint)", fontSize: 11 }}>
                            ${Number(item.precio_unitario_pesos).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        )}
                        <span>
                          ${Number(item.precio_unitario_efectivo_pesos).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        {item.tipo === "CHAPA" && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setModalAjuste(item)}
                            aria-label="Agregar extra al precio unitario"
                            title="Agregar extra al precio unitario"
                          >
                            Extra
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="num col-right">
                      ${Number(item.subtotal_pesos).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td>
                      <button className="btn btn-sm" onClick={() => setModalFlete(item)}>
                        Flete
                      </button>
                    </td>
                  </tr>
                  {item.extras.map((extra) => (
                    <tr key={extra.id}>
                      <td className="cell-muted" style={{ paddingLeft: 24 }}>+ {extra.descripcion}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td className="num col-right cell-muted">
                        ${Number(extra.precio_pesos).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => onQuitarFlete(item.id, extra.id)} aria-label="Quitar flete">
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {presupuesto.notas && (
          <div className="panel-body" style={{ borderTop: "1px solid var(--border)" }}>
            <strong>Notas:</strong> {presupuesto.notas}
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>Compartir presupuesto</h2>
          {presupuesto.impuesto_pct != null && (
            <span className="cell-muted" style={{ fontSize: 12.5 }}>
              IVA: {Number(presupuesto.impuesto_pct)}%{" "}
              <button
                className="btn btn-sm btn-ghost"
                style={{ marginLeft: 6 }}
                onClick={() => {
                  setAccionPendiente(null);
                  setModalImpuesto(true);
                }}
              >
                Cambiar
              </button>
            </span>
          )}
        </div>
        <div className="panel-body action-grid">
          <button
            className="btn"
            onClick={() => conImpuestoElegido(() => conCarga("ver", () => abrirPdfPresupuesto(presupuesto.id)))}
            disabled={cargando.ver}
          >
            {cargando.ver ? "Abriendo…" : "👁 Ver PDF"}
          </button>
          <button
            className="btn"
            onClick={() =>
              conImpuestoElegido(() =>
                conCarga("pdf", () =>
                  descargarArchivoPresupuesto(presupuesto.id, "pdf", `presupuesto_lausane_${presupuesto.numero}.pdf`)
                )
              )
            }
            disabled={cargando.pdf}
          >
            {cargando.pdf ? "Descargando…" : "⬇ Descargar PDF"}
          </button>
          <button
            className="btn"
            onClick={() =>
              conCarga("excel", () =>
                descargarArchivoPresupuesto(presupuesto.id, "excel", `presupuesto_lausane_${presupuesto.numero}.xlsx`)
              )
            }
            disabled={cargando.excel}
          >
            {cargando.excel ? "Descargando…" : "⬇ Descargar Excel"}
          </button>
          <button className="btn" onClick={() => conImpuestoElegido(() => setModalEmail(true))}>
            ✉ Enviar por email
          </button>
          <button
            className="btn btn-whatsapp"
            onClick={() => conImpuestoElegido(onWhatsapp)}
            disabled={cargando.whatsapp}
          >
            {cargando.whatsapp ? "Abriendo…" : "💬 Enviar por WhatsApp"}
          </button>
        </div>
      </div>

      {modalEmail && (
        <ModalEnviarEmail
          presupuesto={presupuesto}
          onClose={() => setModalEmail(false)}
          onEnviado={cargar}
        />
      )}

      {modalImpuesto && (
        <ModalElegirImpuesto
          onClose={() => {
            setModalImpuesto(false);
            setAccionPendiente(null);
          }}
          onElegir={onElegirImpuesto}
        />
      )}

      {modalFlete && (
        <ModalAgregarFlete
          item={modalFlete}
          onClose={() => setModalFlete(null)}
          onAgregar={async (datos) => {
            const actualizado = await agregarFleteItem(presupuesto.id, modalFlete.id, datos.precio_pesos);
            setPresupuesto(actualizado);
            setModalFlete(null);
          }}
        />
      )}

      {modalAjuste && (
        <ModalAgregarAjusteUnitario
          item={modalAjuste}
          onClose={() => setModalAjuste(null)}
          onAgregar={async (datos) => {
            const actualizado = await agregarAjusteUnitarioItem(presupuesto.id, modalAjuste.id, datos);
            setPresupuesto(actualizado);
            setModalAjuste(null);
          }}
        />
      )}

      {modalLongitud && (
        <ModalAsignarLongitud
          item={modalLongitud}
          onClose={() => setModalLongitud(null)}
          onAsignar={async (longitudMm) => {
            const actualizado = await asignarLongitudItem(presupuesto.id, modalLongitud.id, longitudMm);
            setPresupuesto(actualizado);
            setModalLongitud(null);
          }}
        />
      )}
    </>
  );
}

function ModalAgregarFlete({ item, onClose, onAgregar }) {
  const [precio, setPrecio] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    if (precio.trim() === "" || !Number.isFinite(Number(precio)) || Number(precio) < 0) {
      setError("Ingresá un precio de flete válido.");
      return;
    }
    setGuardando(true);
    try {
      await onAgregar({ precio_pesos: Number(precio) });
    } catch (err) {
      setError(extraerMensajeError(err, "No se pudo agregar el flete."));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal
      title={`Agregar flete a "${item.descripcion}"`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={onSubmit} disabled={guardando}>
            {guardando ? "Agregando…" : "Agregar"}
          </button>
        </>
      }
    >
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="field">
          <label>Flete ($)</label>
          <input
            className="input num"
            type="number"
            step="any"
            min="0"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            required
          />
        </div>
      </form>
    </Modal>
  );
}

function ModalAgregarAjusteUnitario({ item, onClose, onAgregar }) {
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!descripcion || monto.trim() === "" || !Number.isFinite(Number(monto)) || Number(monto) < 0) {
      setError("Elegí el tipo de extra e ingresá un monto válido.");
      return;
    }
    setGuardando(true);
    try {
      await onAgregar({ descripcion, monto_pesos: Number(monto) });
    } catch (err) {
      setError(extraerMensajeError(err, "No se pudo agregar el ajuste."));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal
      title={`Agregar extra al precio unitario de "${item.descripcion}"`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={onSubmit} disabled={guardando}>
            {guardando ? "Agregando…" : "Agregar"}
          </button>
        </>
      }
    >
      {error && <div className="alert alert-danger">{error}</div>}
      <p style={{ marginTop: 0, fontSize: 13 }} className="cell-muted">
        El monto se suma al precio unitario y se multiplica por la cantidad ({Number(item.cantidad)}).
      </p>
      <form onSubmit={onSubmit}>
        <div className="field">
          <label>Tipo de extra</label>
          <select
            className="input"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
          >
            <option value="">Seleccioná una opción</option>
            <option value="Estampado">Estampado</option>
            <option value="Corte a medida">Corte a medida</option>
          </select>
        </div>
        <div className="field">
          <label>Monto por unidad ($)</label>
          <input
            className="input num"
            type="number"
            step="any"
            min="0"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            required
          />
        </div>
      </form>
    </Modal>
  );
}

function ModalAsignarLongitud({ item, onClose, onAsignar }) {
  const anchoMm = extraerAnchoMm(item.descripcion);
  const [opciones, setOpciones] = useState([]);
  const [cargandoOpciones, setCargandoOpciones] = useState(true);
  const [longitud, setLongitud] = useState(item.longitud_mm ? String(item.longitud_mm) : "otro");
  const [longitudManual, setLongitudManual] = useState(item.longitud_mm ? String(item.longitud_mm) : "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!anchoMm) {
      setCargandoOpciones(false);
      return;
    }
    listarLongitudesChapa(anchoMm)
      .then((lista) => {
        const valores = lista.map((l) => l.longitud_mm);
        setOpciones(valores);
        if (item.longitud_mm == null && valores.length) {
          setLongitud(String(valores[0]));
        }
      })
      .finally(() => setCargandoOpciones(false));
  }, [anchoMm]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    const valor = longitud === "otro" ? Number(longitudManual) : Number(longitud);
    if (!valor || valor <= 0) {
      setError("Ingresá una longitud válida.");
      return;
    }
    setGuardando(true);
    try {
      await onAsignar(valor);
    } catch (err) {
      setError(extraerMensajeError(err, "No se pudo guardar la longitud."));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal
      title={`Longitud de "${item.descripcion}"`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={onSubmit} disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar"}
          </button>
        </>
      }
    >
      {error && <div className="alert alert-danger">{error}</div>}
      {cargandoOpciones ? (
        <Loading label="Buscando longitudes disponibles…" />
      ) : (
        <form onSubmit={onSubmit}>
          <div className="field">
            <label>Longitud</label>
            <select className="input" value={longitud} onChange={(e) => setLongitud(e.target.value)}>
              {opciones.map((mm) => (
                <option key={mm} value={mm}>{mm}mm</option>
              ))}
              <option value="otro">Otro…</option>
            </select>
          </div>
          {longitud === "otro" && (
            <div className="field">
              <label>Longitud manual (mm)</label>
              <input
                className="input num"
                type="number"
                step="any"
                min="1"
                value={longitudManual}
                onChange={(e) => setLongitudManual(e.target.value)}
                required
              />
            </div>
          )}
        </form>
      )}
    </Modal>
  );
}

function ModalElegirImpuesto({ onClose, onElegir }) {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  async function elegir(pct) {
    setError(null);
    setGuardando(true);
    try {
      await onElegir(pct);
    } catch (err) {
      setError(extraerMensajeError(err, "No se pudo guardar el porcentaje."));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal title="Elegí el % de impuestos" onClose={onClose}>
      {error && <div className="alert alert-danger">{error}</div>}
      <p style={{ marginTop: 0 }}>
        Antes de ver, descargar o mandar el presupuesto hace falta elegir qué porcentaje de impuestos
        aparece en el PDF (abajo del total, como "+ impuestos").
      </p>
      <div className="form-row-actions">
        <button className="btn btn-primary" disabled={guardando} onClick={() => elegir("10.5")}>
          10,5%
        </button>
        <button className="btn btn-primary" disabled={guardando} onClick={() => elegir("21")}>
          21%
        </button>
      </div>
    </Modal>
  );
}

function ModalEnviarEmail({ presupuesto, onClose, onEnviado }) {
  const [destinatario, setDestinatario] = useState(presupuesto.cliente_detalle.email || "");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviadoOk, setEnviadoOk] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await enviarPresupuestoPorEmail(presupuesto.id, destinatario, mensaje);
      await onEnviado();
      setEnviadoOk(true);
      setTimeout(onClose, 1400);
    } catch (err) {
      setError(extraerMensajeError(err, "No se pudo enviar el email."));
    } finally {
      setEnviando(false);
    }
  }

  if (enviadoOk) {
    return (
      <Modal title={`Enviar ${presupuesto.codigo} por email`} onClose={onClose}>
        <div className="send-success">
          <div className="send-success-icon">✓</div>
          <div className="send-success-text">¡Enviado!</div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title={`Enviar ${presupuesto.codigo} por email`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={onSubmit} disabled={enviando}>
            {enviando ? "Enviando…" : "Enviar"}
          </button>
        </>
      }
    >
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="field">
          <label>Destinatario</label>
          <input
            className="input"
            type="email"
            value={destinatario}
            onChange={(e) => setDestinatario(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label>Mensaje (opcional)</label>
          <textarea
            className="input"
            rows={3}
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Se usa un mensaje predeterminado si lo dejás vacío."
          />
        </div>
      </form>
    </Modal>
  );
}
