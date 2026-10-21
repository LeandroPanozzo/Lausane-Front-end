import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarTubos, actualizarTubo, eliminarTubo, listaPreciosTubos } from "../api/tubos";
import { Loading, EmptyState, Pagination } from "../components/Ui";
import TuboFormModal from "../components/TuboFormModal";

function DescuentoCell({ tubo, onGuardado }) {
  const [pct, setPct] = useState(String(tubo.descuento_pct));
  const [habilitado, setHabilitado] = useState(tubo.descuento_habilitado);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setPct(String(tubo.descuento_pct));
    setHabilitado(tubo.descuento_habilitado);
  }, [tubo.descuento_pct, tubo.descuento_habilitado]);

  async function guardar(cambios) {
    setGuardando(true);
    try {
      onGuardado(await actualizarTubo(tubo.id, cambios));
    } catch {
      alert("No se pudo guardar el descuento.");
    } finally {
      setGuardando(false);
    }
  }

  function onBlurPct() {
    const valor = Number(pct);
    if (!Number.isNaN(valor) && valor >= 0 && valor !== Number(tubo.descuento_pct)) {
      guardar({ descuento_pct: valor });
    } else {
      setPct(String(tubo.descuento_pct));
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

export default function Tubos() {
  const [data, setData] = useState(null);
  const [preciosPorDimension, setPreciosPorDimension] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [borrando, setBorrando] = useState(null);
  const [incrementoTubos, setIncrementoTubos] = useState(null);

  const cargar = useCallback(async () => {
    setError(null);
    try {
      const [listado, precios] = await Promise.all([
        listarTubos({ search, page }),
        listaPreciosTubos(),
      ]);
      setData(listado);
      setIncrementoTubos(precios.incremento_tubos);
      const mapa = {};
      precios.tubos.forEach((t) => {
        mapa[t.dimensiones] = t;
      });
      setPreciosPorDimension(mapa);
    } catch {
      setError("No se pudo cargar el catálogo de tubos.");
    }
  }, [search, page]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  function onSaved() {
    setModal(null);
    cargar();
  }

  async function onEliminar(tubo) {
    if (!window.confirm(`¿Eliminar el tubo "${tubo.dimensiones}"?`)) return;
    setBorrando(tubo.id);
    try {
      await eliminarTubo(tubo.id);
      cargar();
    } catch {
      alert("No se pudo eliminar el tubo.");
    } finally {
      setBorrando(null);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Catálogo</span>
          <h1>Tubos</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setModal("nuevo")}>
          + Nuevo tubo
        </button>
      </div>

      {incrementoTubos !== null && (
        <div className="alert alert-warn" style={{ marginBottom: 18 }}>
          Incremento general aplicado a todos los tubos:{" "}
          <strong className="num">{(Number(incrementoTubos) * 100).toFixed(2)}%</strong> sobre el costo en
          U$S/kg. Se edita en <Link to="/app/configuracion">Configuración</Link>.
        </div>
      )}

      <div className="panel">
        <div className="toolbar">
          <input
            className="input search-input"
            placeholder="Buscar por dimensiones…"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
          <span className="cell-muted" style={{ fontSize: 12.5 }}>
            {data ? `${data.count} tubos` : ""}
          </span>
        </div>

        {error && (
          <div className="panel-body">
            <div className="alert alert-danger">{error}</div>
          </div>
        )}

        {!data && !error && (
          <div className="panel-body">
            <Loading />
          </div>
        )}

        {data && data.results.length === 0 && (
          <EmptyState
            icon="⊘"
            title="No hay tubos cargados"
            subtitle="Agregá uno a mano o importá tu Excel desde la sección Importar."
            action={
              <button className="btn btn-primary" onClick={() => setModal("nuevo")}>
                + Nuevo tubo
              </button>
            }
          />
        )}

        {data && data.results.length > 0 && (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Dimensiones</th>
                    <th className="col-right">Espesor (mm)</th>
                    <th className="col-right">Peso (kg)</th>
                    <th className="col-right">Costo U$S/kg</th>
                    <th className="col-right">Venta U$S/kg</th>
                    <th className="col-right">Venta $/tubo</th>
                    <th className="col-right">Descuento</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((t) => {
                    const p = preciosPorDimension[t.dimensiones];
                    return (
                      <tr key={t.id}>
                        <td>
                          <span className={t.activo ? "" : "texto-inactivo"}>{t.dimensiones}</span>
                          {!t.activo && (
                            <span className="badge badge-danger" style={{ marginLeft: 8 }}>
                              Inactivo
                            </span>
                          )}
                        </td>
                        <td className="num col-right cell-muted">
                          {t.espesor_mm ? Number(t.espesor_mm).toFixed(2) : "—"}
                        </td>
                        <td className="num col-right">{Number(t.peso_unitario_kg).toFixed(4)}</td>
                        <td className="num col-right cell-muted">{Number(t.costo_usd_kg).toFixed(4)}</td>
                        <td className="num col-right">{p ? Number(p.precio_venta_usd_kg).toFixed(4) : "—"}</td>
                        <td className="num col-right">
                          {p
                            ? Number(p.precio_venta_pesos_tubo).toLocaleString("es-AR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : "—"}
                        </td>
                        <td>
                          <DescuentoCell
                            tubo={t}
                            onGuardado={(actualizado) =>
                              setData((d) => ({
                                ...d,
                                results: d.results.map((x) => (x.id === actualizado.id ? actualizado : x)),
                              }))
                            }
                          />
                        </td>
                        <td>
                          <div className="cell-actions">
                            <button className="btn btn-sm" onClick={() => setModal(t)}>
                              Editar
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => onEliminar(t)}
                              disabled={borrando === t.id}
                            >
                              {borrando === t.id ? "…" : "Eliminar"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination count={data.count} page={page} onPageChange={setPage} />
          </>
        )}
      </div>

      {modal && (
        <TuboFormModal tubo={modal === "nuevo" ? null : modal} onClose={() => setModal(null)} onSaved={onSaved} />
      )}
    </>
  );
}
