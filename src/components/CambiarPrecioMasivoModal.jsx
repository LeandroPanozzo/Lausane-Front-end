import { useState } from "react";
import Modal from "./Modal";
import { extraerMensajeError } from "../api/client";

/** Si todas las chapas seleccionadas comparten el mismo valor (redondeado a
 * `decimales`), lo devuelve para precargarlo — si no, devuelve "" para que el
 * cuadro quede vacío y el usuario cargue el valor nuevo a mano. */
function valorComunOVacio(valores, decimales) {
  const vistos = new Set(valores.map((v) => Number(v).toFixed(decimales)));
  return vistos.size === 1 ? [...vistos][0] : "";
}

const CAMPOS = [
  { clave: "costo", label: "Costo (U$S/kg)", decimales: 4 },
  { clave: "ventaUsd", label: "Venta (U$S/kg)", decimales: 4 },
  { clave: "ventaPesos", label: "Venta ($/kg)", decimales: 2 },
];

export default function CambiarPrecioMasivoModal({
  chapas, incrementoActual, cotizacion, actualizar, onClose, onGuardado,
}) {
  const [activos, setActivos] = useState({ costo: false, ventaUsd: false, ventaPesos: false });
  const [valores, setValores] = useState({
    costo: valorComunOVacio(chapas.map((c) => c.costo_usd_kg), 4),
    ventaUsd: valorComunOVacio(chapas.map((c) => c.precio_venta_usd_kg), 4),
    ventaPesos: valorComunOVacio(chapas.map((c) => c.precio_venta_pesos_kg), 2),
  });
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  function toggle(clave) {
    setActivos((a) => ({ ...a, [clave]: !a[clave] }));
  }

  function setValor(clave, valor) {
    setValores((v) => ({ ...v, [clave]: valor }));
  }

  function incrementoEfectivo(chapa) {
    return chapa.usar_incremento_general ? Number(incrementoActual) : 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);

    const algunoActivo = CAMPOS.some((c) => activos[c.clave]);
    if (!algunoActivo) {
      setError("Marcá al menos uno de los tres valores para cambiar.");
      return;
    }
    for (const c of CAMPOS) {
      if (activos[c.clave] && (valores[c.clave] === "" || Number.isNaN(Number(valores[c.clave])))) {
        setError(`Completá un valor válido para "${c.label}".`);
        return;
      }
    }

    setGuardando(true);
    try {
      await Promise.all(
        chapas.map((chapa) => {
          let costoFinal = Number(chapa.costo_usd_kg);
          // Se aplican en este orden si hay más de uno marcado (el último gana).
          if (activos.costo) {
            costoFinal = Number(valores.costo);
          }
          if (activos.ventaUsd) {
            costoFinal = Number(valores.ventaUsd) / (1 + incrementoEfectivo(chapa));
          }
          if (activos.ventaPesos) {
            const ventaUsdDesdePesos = Number(valores.ventaPesos) / Number(cotizacion);
            costoFinal = ventaUsdDesdePesos / (1 + incrementoEfectivo(chapa));
          }
          return actualizar(chapa.id, { costo_usd_kg: Math.round(costoFinal * 10000) / 10000 });
        })
      );
      onGuardado();
    } catch (err) {
      setError(extraerMensajeError(err, "No se pudo actualizar alguna de las chapas."));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal
      title={`Cambiar precio en conjunto (${chapas.length} chapa${chapas.length === 1 ? "" : "s"})`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={onSubmit} disabled={guardando}>
            {guardando ? "Guardando…" : "Aplicar a todas"}
          </button>
        </>
      }
    >
      {error && <div className="alert alert-danger">{error}</div>}
      <p className="hint" style={{ marginTop: 0 }}>
        Marcá cuáles de estos tres valores querés cambiar. Si las chapas elegidas ya tienen el mismo
        valor, aparece precargado — si no, el cuadro queda vacío para que cargues el nuevo.
      </p>
      <form onSubmit={onSubmit}>
        {CAMPOS.map((c) => (
          <div
            key={c.clave}
            style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}
          >
            <input
              type="checkbox"
              checked={activos[c.clave]}
              onChange={() => toggle(c.clave)}
              id={`campo-${c.clave}`}
            />
            <label htmlFor={`campo-${c.clave}`} style={{ width: 160, fontSize: 13, cursor: "pointer" }}>
              {c.label}
            </label>
            <input
              className="input num"
              type="number"
              step={c.decimales === 4 ? "0.0001" : "0.01"}
              value={valores[c.clave]}
              onChange={(e) => setValor(c.clave, e.target.value)}
              disabled={!activos[c.clave]}
              placeholder={valores[c.clave] === "" ? "Distintos valores — cargar uno nuevo" : ""}
              style={{ flex: 1 }}
            />
          </div>
        ))}
        <div className="hint" style={{ marginTop: 4 }}>
          Si marcás más de uno, se aplican en este orden (el último pisa a los anteriores): Costo →
          Venta U$S/kg → Venta $/kg.
        </div>
      </form>
    </Modal>
  );
}
