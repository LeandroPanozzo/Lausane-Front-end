import { useCallback, useEffect, useState } from "react";
import {
  listarHierros, actualizarHierro, eliminarHierro, listaPreciosHierros,
  actualizarConfiguracionHierro,
} from "../api/hierros";
import { Loading, EmptyState } from "../components/Ui";
import HierroFormModal from "../components/HierroFormModal";
import { TIPOS_HIERRO } from "../constants/hierros";

const COLUMNAS = [
  { campo: "mostrar_costo_usd_kg", label: "Costo U$S/kg" },
  { campo: "mostrar_incremento", label: "Incremento" },
  { campo: "mostrar_venta_usd_kg", label: "Venta U$S/kg" },
  { campo: "mostrar_venta_pesos_kg", label: "Venta $/kg" },
  { campo: "mostrar_peso_unitario", label: "Peso (kg)" },
  { campo: "mostrar_venta_unidad", label: "Venta $/unidad" },
];

function DescuentoCell({ hierro, onGuardado }) {
  const [pct, setPct] = useState(String(hierro.descuento_pct));
  const [habilitado, setHabilitado] = useState(hierro.descuento_habilitado);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setPct(String(hierro.descuento_pct));
    setHabilitado(hierro.descuento_habilitado);
  }, [hierro.descuento_pct, hierro.descuento_habilitado]);

  async function guardar(cambios) {
    setGuardando(true);
    try {
      onGuardado(await actualizarHierro(hierro.id, cambios));
    } catch {
      alert("No se pudo guardar el descuento.");
    } finally {
      setGuardando(false);
    }
  }

  function onBlurPct() {
    const valor = Number(pct);
    if (!Number.isNaN(valor) && valor >= 0 && valor !== Number(hierro.descuento_pct)) {
      guardar({ descuento_pct: valor });
    } else {
      setPct(String(hierro.descuento_pct));
    }
  }

  function onChangeHabilitado(e) {
    const valor = e.target.checked;
    setHabilitado(valor);
    guardar({ descuento_habilitado: valor });
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
      <input
        className="input num"
        type="number"
        min="0"
        step="0.01"
        style={{ width: 78 }}
        value={pct}
        disabled={guardando}
        onChange={(e) => setPct(e.target.value)}
        onBlur={onBlurPct}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        aria-label="Porcentaje de descuento"
      />
      <span className="cell-muted" style={{ fontSize: 12 }}>%</span>
      <input
        type="checkbox"
        checked={habilitado}
        disabled={guardando}
        onChange={onChangeHabilitado}
        title="Aplicar este descuento por defecto al agregarlo a un presupuesto"
      />
    </div>
  );
}

function IncrementoCell({ hierro, onGuardado }) {
  const [guardando, setGuardando] = useState(false);

  async function onChange(e) {
    const valor = e.target.checked;
    setGuardando(true);
    try {
      onGuardado(await actualizarHierro(hierro.id, { usar_incremento_general: valor }));
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
        checked={hierro.usar_incremento_general}
        disabled={guardando}
        onChange={onChange}
        title="Si se destilda, este item se vende directo al costo, sin el incremento general"
      />
      {!hierro.usar_incremento_general && <span className="badge badge-warn">Sin incremento</span>}
    </div>
  );
}

export default function Hierros() {
  const [tab, setTab] = useState("PLANCHUELA");
  const [items, setItems] = useState(null);
  const [preciosPorId, setPreciosPorId] = useState({});
  const [config, setConfig] = useState(null);
  const [incrementoInput, setIncrementoInput] = useState("");
  const [guardandoIncremento, setGuardandoIncremento] = useState(false);
  const [incrementoOk, setIncrementoOk] = useState(false);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [borrando, setBorrando] = useState(null);
  const [mostrarConfigColumnas, setMostrarConfigColumnas] = useState(false);

  const tipoActual = TIPOS_HIERRO.find((t) => t.tipo === tab);

  const cargar = useCallback(async () => {
    setError(null);
    setItems(null);
    try {
      const [data, precios] = await Promise.all([
        listarHierros({ tipo: tab }),
        listaPreciosHierros(tab),
      ]);
      setItems(data.results ?? data);
      setConfig(precios.config);
      setIncrementoInput((Number(precios.config.incremento_general) * 100).toString());
      const mapa = {};
      precios.hierros.forEach((h) => {
        mapa[h.id] = h;
      });
      setPreciosPorId(mapa);
    } catch {
      setError("No se pudo cargar la tabla de hierros.");
    }
  }, [tab]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    setMostrarConfigColumnas(false);
  }, [tab]);

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
      await actualizarConfiguracionHierro(tab, { incremento_general: valor / 100 });
      setIncrementoOk(true);
      await cargar();
    } catch {
      alert("No se pudo guardar el incremento general.");
    } finally {
      setGuardandoIncremento(false);
    }
  }

  async function onToggleColumna(campo, valor) {
    setConfig((c) => ({ ...c, [campo]: valor }));
    try {
      await actualizarConfiguracionHierro(tab, { [campo]: valor });
    } catch {
      alert("No se pudo guardar qué columnas se muestran.");
      cargar();
    }
  }

  async function onEliminar(h) {
    if (!window.confirm(`¿Eliminar "${h.medida}"?`)) return;
    setBorrando(h.id);
    try {
      await eliminarHierro(h.id);
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
          <span className="eyebrow">Hierros</span>
          <h1>Hierros</h1>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn" onClick={() => setMostrarConfigColumnas((v) => !v)}>
            {mostrarConfigColumnas ? "Ocultar columnas" : "Mostrar/ocultar columnas"}
          </button>
          <button className="btn btn-primary" onClick={() => setModal("nuevo")}>
            + Nuevo item
          </button>
        </div>
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 18, maxWidth: 640 }}>
        Planchuela, Redondos macizos, Cuadrados macizos, Perfil IPN y Perfil UPN — cada item tiene su
        propio costo en U$S/kg y un % de incremento general propio de su tipo (como Galvanizada/Gruesa).
      </p>

      {config && (
        <form
          onSubmit={onGuardarIncremento}
          className="alert alert-warn"
          style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}
        >
          <span>Incremento general de {tipoActual.label.toLowerCase()}:</span>
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
            aria-label={`Incremento general de ${tipoActual.label.toLowerCase()}, en porcentaje`}
          />
          <span>%</span>
          <button className="btn btn-sm btn-primary" type="submit" disabled={guardandoIncremento}>
            {guardandoIncremento ? "Guardando…" : "Guardar"}
          </button>
          {incrementoOk && <span className="badge badge-ok">Guardado</span>}
        </form>
      )}

      {config && mostrarConfigColumnas && (
        <div className="panel" style={{ padding: 14, marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            Columnas visibles para {tipoActual.label.toLowerCase()}
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {COLUMNAS.map((c) => (
              <label key={c.campo} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={config[c.campo]}
                  onChange={(e) => onToggleColumna(c.campo, e.target.checked)}
                />
                {c.label}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="panel">
        <div style={{ padding: "14px 18px 0" }}>
          <div className="tabs">
            {TIPOS_HIERRO.map((t) => (
              <div key={t.tipo} className={`tab ${tab === t.tipo ? "active" : ""}`} onClick={() => setTab(t.tipo)}>
                {t.label}
              </div>
            ))}
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
            title={`No hay items cargados en ${tipoActual.label}`}
            action={
              <button className="btn btn-primary" onClick={() => setModal("nuevo")}>
                + Nuevo item
              </button>
            }
          />
        )}

        {items && items.length > 0 && config && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Medida</th>
                  {config.mostrar_costo_usd_kg && <th className="col-right">Costo U$S/kg</th>}
                  {config.mostrar_incremento && <th>Incremento</th>}
                  {config.mostrar_venta_usd_kg && <th className="col-right">Venta U$S/kg</th>}
                  {config.mostrar_venta_pesos_kg && <th className="col-right">Venta $/kg</th>}
                  {config.mostrar_peso_unitario && <th className="col-right">Peso (kg)</th>}
                  {config.mostrar_venta_unidad && <th className="col-right">Venta $/unidad</th>}
                  <th className="col-right">Descuento</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((h) => {
                  const p = preciosPorId[h.id];
                  return (
                    <tr key={h.id}>
                      <td>
                        <span className={h.activo ? "" : "texto-inactivo"}>{h.medida}</span>
                        {!h.activo && (
                          <span className="badge badge-danger" style={{ marginLeft: 8 }}>
                            Inactivo
                          </span>
                        )}
                      </td>
                      {config.mostrar_costo_usd_kg && (
                        <td className="num col-right cell-muted">{Number(h.costo_usd_kg).toFixed(4)}</td>
                      )}
                      {config.mostrar_incremento && (
                        <td>
                          <IncrementoCell hierro={h} onGuardado={cargar} />
                        </td>
                      )}
                      {config.mostrar_venta_usd_kg && (
                        <td className="num col-right">{p ? Number(p.precio_venta_usd_kg).toFixed(4) : "—"}</td>
                      )}
                      {config.mostrar_venta_pesos_kg && (
                        <td className="num col-right">
                          {p
                            ? Number(p.precio_venta_pesos_kg).toLocaleString("es-AR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : "—"}
                          {p && (
                            p.precio_venta_manual != null ? (
                              <span className="badge badge-ok" style={{ marginLeft: 6 }} title="Precio de venta cargado a mano">
                                Manual
                              </span>
                            ) : (
                              <span className="cell-muted" style={{ marginLeft: 6 }}>Automático</span>
                            )
                          )}
                        </td>
                      )}
                      {config.mostrar_peso_unitario && (
                        <td className="num col-right cell-muted">
                          {h.peso_unitario_kg != null ? Number(h.peso_unitario_kg).toFixed(4) : "—"}
                        </td>
                      )}
                      {config.mostrar_venta_unidad && (
                        <td className="num col-right">
                          {p && p.precio_venta_pesos_unidad != null
                            ? Number(p.precio_venta_pesos_unidad).toLocaleString("es-AR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : "—"}
                        </td>
                      )}
                      <td>
                        <DescuentoCell
                          hierro={h}
                          onGuardado={(actualizado) =>
                            setItems((prev) => prev.map((x) => (x.id === actualizado.id ? actualizado : x)))
                          }
                        />
                      </td>
                      <td>
                        <div className="cell-actions">
                          <button className="btn btn-sm" onClick={() => setModal(h)}>
                            Editar
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => onEliminar(h)}
                            disabled={borrando === h.id}
                          >
                            {borrando === h.id ? "…" : "Eliminar"}
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

      {modal && (
        <HierroFormModal
          tipo={tab}
          tipoLabel={tipoActual.label}
          hierro={modal === "nuevo" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={onSaved}
        />
      )}
    </>
  );
}
