import { useDolar } from "../context/DolarContext";

function formatearHora(fechaIso) {
  if (!fechaIso) return "";
  const d = new Date(fechaIso);
  return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

function minutosDesde(fechaIso) {
  if (!fechaIso) return null;
  return Math.floor((Date.now() - new Date(fechaIso).getTime()) / 60000);
}

export default function DolarGauge() {
  const { cotizacion, refrescando, refrescar } = useDolar();

  const forzado = Boolean(cotizacion?.forzado_manual);
  const referencia = cotizacion?.referencia_oficial;

  const minutos = cotizacion ? minutosDesde(cotizacion.fecha) : null;
  // Si está forzado a manual, no tiene sentido marcarlo "stale" por el tiempo
  // transcurrido — es un valor fijado a propósito, no un caché vencido.
  const stale = !forzado && minutos !== null && minutos > 15;

  const tituloBoton = forzado
    ? "Click para actualizar la cotización oficial de referencia"
    : "Click para forzar la actualización de la cotización";

  return (
    <div className="dolar-gauge-group">
      <button
        className={`dolar-gauge ${refrescando ? "refreshing" : ""} ${stale ? "stale" : ""} ${forzado ? "forzado" : ""}`}
        onClick={refrescar}
        title={tituloBoton}
      >
        <span className="led" />
        <span>
          <span className="label">
            {forzado ? "🔒 Dólar forzado (manual)" : "Dólar oficial"}
            {cotizacion && ` · ${formatearHora(cotizacion.fecha)}`}
          </span>
          <span className="value">
            {cotizacion ? `$${Number(cotizacion.venta).toLocaleString("es-AR")}` : "— · —"}
          </span>
        </span>
      </button>

      {forzado && (
        <div className="dolar-gauge-ref" title="Cotización oficial online, solo de referencia — no se usa en los cálculos mientras el dólar esté forzado">
          <span className="dolar-gauge-ref-label">Oficial online (ref.)</span>
          <span className="dolar-gauge-ref-value">
            {referencia ? `$${Number(referencia.venta).toLocaleString("es-AR")}` : "— · —"}
          </span>
          {referencia && <span className="dolar-gauge-ref-hora">{formatearHora(referencia.fecha)}</span>}
        </div>
      )}
    </div>
  );
}
