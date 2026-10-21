import { useCallback, useEffect, useState } from "react";
import { listarMarkups, eliminarMarkup, actualizarConfiguracion } from "../api/config";
import {
  listarGalvanizada, actualizarGalvanizada, eliminarGalvanizada, listaPreciosGalvanizada,
} from "../api/galvanizada";
import { Loading, EmptyState } from "../components/Ui";
import MarkupFormModal from "../components/MarkupFormModal";
import GalvanizadaFormModal from "../components/GalvanizadaFormModal";

function IncrementoCell({ chapa, onGuardado }) {
  const [guardando, setGuardando] = useState(false);

  async function onChange(e) {
    const valor = e.target.checked;
    setGuardando(true);
    try {
      onGuardado(await actualizarGalvanizada(chapa.id, { usar_incremento_general: valor }));
    } catch {
      alert("No se pudo guardar el cambio.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
      <input
        type="checkbox"
        checked={chapa.usar_incremento_general}
        disabled={guardando}
        onChange={onChange}
        title="Si se destilda, esta chapa se vende directo al costo, sin el incremento general"
      />
      {!chapa.usar_incremento_general && <span className="badge badge-warn">Sin incremento</span>}
    </div>
  );
}

export default function MarkupsChapa() {
  const [items, setItems] = useState(null);
  const [preciosGalvPorClave, setPreciosGalvPorClave] = useState({});
  const [incrementoGalvanizada, setIncrementoGalvanizada] = useState(null);
  const [incrementoInput, setIncrementoInput] = useState("");
  const [guardandoIncremento, setGuardandoIncremento] = useState(false);
  const [incrementoOk, setIncrementoOk] = useState(false);
  const [tab, setTab] = useState("DD");
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [borrando, setBorrando] = useState(null);

  const esGalvanizada = tab === "GALVANIZADA";

  const cargar = useCallback(async () => {
    setError(null);
    setItems(null);
    try {
      if (esGalvanizada) {
        const [listado, precios] = await Promise.all([listarGalvanizada(), listaPreciosGalvanizada()]);
        setItems(listado.results ?? listado);
        setIncrementoGalvanizada(precios.incremento_galvanizada);
        setIncrementoInput((Number(precios.incremento_galvanizada) * 100).toString());
        const mapa = {};
        precios.chapas.forEach((c) => {
          mapa[`${c.espesor}·${c.ancho_mm}`] = c;
        });
        setPreciosGalvPorClave(mapa);
      } else {
        const data = await listarMarkups({ tipo: tab });
        setItems(data.results ?? data);
      }
    } catch {
      setError("No se pudo cargar la tabla de recargos.");
    }
  }, [tab, esGalvanizada]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  function onSaved() {
    setModal(null);
    cargar();
  }

  async function onGuardarIncremento(e) {
    e.preventDefault();
    setIncrementoOk(false);
    const valor = Number(incrementoInput);
    if (Number.isNaN(valor) || valor < 0) return;
    setGuardandoIncremento(true);
    try {
      await actualizarConfiguracion({ incremento_galvanizada: valor / 100 });
      setIncrementoOk(true);
      await cargar();
    } catch {
      alert("No se pudo guardar el incremento general.");
    } finally {
      setGuardandoIncremento(false);
    }
  }

  async function onEliminar(m) {
    const etiqueta = `${m.espesor} · ${m.ancho_mm}mm`;
    if (!window.confirm(`¿Eliminar "${etiqueta}"?`)) return;
    setBorrando(m.id);
    try {
      await (esGalvanizada ? eliminarGalvanizada(m.id) : eliminarMarkup(m.id));
      cargar();
    } catch {
      alert("No se pudo eliminar.");
    } finally {
      setBorrando(null);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Chapa</span>
          <h1>Chapas</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setModal("nuevo")}>
          {esGalvanizada ? "+ Nueva chapa" : "+ Nuevo recargo"}
        </button>
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 18, maxWidth: 640 }}>
        {esGalvanizada
          ? "A diferencia de Laminado en Frío y Negra, cada espesor/ancho de galvanizada tiene su propio costo en U$S/kg (no un % sobre un precio base compartido)."
          : "Esta tabla es la misma para todos los clientes — replica los porcentajes que en el Excel " +
            "original se repetían en la hoja de cada cliente (ej. \"base + 7%\" para espesor 16)."}
      </p>

      {esGalvanizada && incrementoGalvanizada !== null && (
        <form
          onSubmit={onGuardarIncremento}
          className="alert alert-warn"
          style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}
        >
          <span>Incremento general aplicado a toda la chapa galvanizada:</span>
          <input
            className="input num"
            type="number"
            min="0"
            step="0.01"
            style={{ width: 90 }}
            value={incrementoInput}
            onChange={(e) => {
              setIncrementoInput(e.target.value);
              setIncrementoOk(false);
            }}
            aria-label="Incremento general de galvanizada, en porcentaje"
          />
          <span>%</span>
          <button className="btn btn-sm btn-primary" type="submit" disabled={guardandoIncremento}>
            {guardandoIncremento ? "Guardando…" : "Guardar"}
          </button>
          {incrementoOk && <span className="badge badge-ok">Guardado</span>}
        </form>
      )}

      <div className="panel">
        <div style={{ padding: "14px 18px 0" }}>
          <div className="tabs">
            <div className={`tab ${tab === "DD" ? "active" : ""}`} onClick={() => setTab("DD")}>
              Laminado en Frío
            </div>
            <div className={`tab ${tab === "NEGRA" ? "active" : ""}`} onClick={() => setTab("NEGRA")}>
              Negra
            </div>
            <div className={`tab ${tab === "GALVANIZADA" ? "active" : ""}`} onClick={() => setTab("GALVANIZADA")}>
              Galvanizada
            </div>
          </div>
        </div>

        {error && (
          <div className="panel-body">
            <div className="alert alert-danger">{error}</div>
          </div>
        )}

        {!items && !error && (
          <div className="panel-body">
            <Loading />
          </div>
        )}

        {items && items.length === 0 && (
          <EmptyState
            icon="⊘"
            title="No hay recargos cargados para este tipo"
            action={
              <button className="btn btn-primary" onClick={() => setModal("nuevo")}>
                {esGalvanizada ? "+ Nueva chapa" : "+ Nuevo recargo"}
              </button>
            }
          />
        )}

        {items && items.length > 0 && !esGalvanizada && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Espesor</th>
                  <th>Ancho (mm)</th>
                  <th className="col-right">Recargo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <span className={m.activo ? "" : "texto-inactivo"}>{m.espesor}</span>
                      {!m.activo && (
                        <span className="badge badge-danger" style={{ marginLeft: 8 }}>
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className={`cell-muted ${m.activo ? "" : "texto-inactivo"}`}>{m.ancho_mm}</td>
                    <td className={`num col-right ${m.activo ? "" : "texto-inactivo"}`}>
                      {m.porcentaje !== null ? `+${(Number(m.porcentaje) * 100).toFixed(2)}%` : (
                        <span className="badge badge-warn">N/D</span>
                      )}
                    </td>
                    <td>
                      <div className="cell-actions">
                        <button className="btn btn-sm" onClick={() => setModal(m)}>
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => onEliminar(m)}
                          disabled={borrando === m.id}
                        >
                          {borrando === m.id ? "…" : "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {items && items.length > 0 && esGalvanizada && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Espesor</th>
                  <th>Ancho (mm)</th>
                  <th className="col-right">Costo U$S/kg</th>
                  <th>Incremento</th>
                  <th className="col-right">Venta U$S/kg</th>
                  <th className="col-right">Venta $/kg</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => {
                  const p = preciosGalvPorClave[`${c.espesor}·${c.ancho_mm}`];
                  return (
                    <tr key={c.id}>
                      <td>
                        <span className={c.activo ? "" : "texto-inactivo"}>{c.espesor}</span>
                        {!c.activo && (
                          <span className="badge badge-danger" style={{ marginLeft: 8 }}>
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className={`cell-muted ${c.activo ? "" : "texto-inactivo"}`}>{c.ancho_mm}</td>
                      <td className="num col-right cell-muted">{Number(c.costo_usd_kg).toFixed(4)}</td>
                      <td>
                        {/* Recarga todo (no solo el item local): "Venta U$S/kg" y "Venta
                            $/kg" dependen de este toggle, y salen de un fetch aparte
                            (lista-precios) que quedaría desactualizado con un patch local. */}
                        <IncrementoCell chapa={c} onGuardado={cargar} />
                      </td>
                      <td className="num col-right">{p ? Number(p.precio_venta_usd_kg).toFixed(4) : "—"}</td>
                      <td className="num col-right">
                        {p
                          ? Number(p.precio_venta_pesos_kg).toLocaleString("es-AR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : "—"}
                      </td>
                      <td>
                        <div className="cell-actions">
                          <button className="btn btn-sm" onClick={() => setModal(c)}>
                            Editar
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => onEliminar(c)}
                            disabled={borrando === c.id}
                          >
                            {borrando === c.id ? "…" : "Eliminar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && !esGalvanizada && (
        <MarkupFormModal
          markup={modal === "nuevo" ? { tipo: tab } : modal}
          onClose={() => setModal(null)}
          onSaved={onSaved}
        />
      )}

      {modal && esGalvanizada && (
        <GalvanizadaFormModal
          chapa={modal === "nuevo" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={onSaved}
        />
      )}
    </>
  );
}
