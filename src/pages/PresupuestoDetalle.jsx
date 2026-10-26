import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  obtenerPresupuesto,
  descargarArchivoPresupuesto,
  abrirPdfPresupuesto,
  obtenerBlobPdfPresupuesto,
  enviarPresupuestoPorEmail,
  marcarPresupuestoEnviado,
  enviarPresupuestoPorWhatsapp,
} from "../api/presupuestos";
import { extraerMensajeError } from "../api/client";
import { Loading } from "../components/Ui";
import Modal from "../components/Modal";

export default function PresupuestoDetalle() {
  const { id } = useParams();
  const [presupuesto, setPresupuesto] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState({});
  const [modalEmail, setModalEmail] = useState(false);

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
                <th className="col-right">Precio unit.</th>
                <th className="col-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {presupuesto.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.descripcion}</td>
                  <td className="num col-right">{Number(item.cantidad)}</td>
                  <td className="cell-muted">{item.unidad}</td>
                  <td className="num col-right">
                    ${Number(item.precio_unitario_pesos).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="num col-right">
                    ${Number(item.subtotal_pesos).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
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
        <div className="panel-header"><h2>Compartir presupuesto</h2></div>
        <div className="panel-body action-grid">
          <button
            className="btn"
            onClick={() => conCarga("ver", () => abrirPdfPresupuesto(presupuesto.id))}
            disabled={cargando.ver}
          >
            {cargando.ver ? "Abriendo…" : "👁 Ver PDF"}
          </button>
          <button
            className="btn"
            onClick={() =>
              conCarga("pdf", () =>
                descargarArchivoPresupuesto(presupuesto.id, "pdf", `presupuesto_lausane_${presupuesto.numero}.pdf`)
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
          <button className="btn" onClick={() => setModalEmail(true)}>
            ✉ Enviar por email
          </button>
          <button className="btn btn-whatsapp" onClick={onWhatsapp} disabled={cargando.whatsapp}>
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
    </>
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
