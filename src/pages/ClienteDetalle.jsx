import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { obtenerCliente, obtenerPreciosCliente } from "../api/clientes";
import { listaPreciosTubos } from "../api/tubos";
import { listaPreciosGalvanizada } from "../api/galvanizada";
import { listaPreciosGruesas } from "../api/gruesas";
import { Loading } from "../components/Ui";
import AgregarAlCarrito from "../components/AgregarAlCarrito";
import { useCart } from "../context/CartContext";

export default function ClienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { carrito, clienteActivoId, agregarItem } = useCart();

  const [cliente, setCliente] = useState(null);
  const [precios, setPrecios] = useState(null);
  const [tubos, setTubos] = useState(null);
  const [galvanizada, setGalvanizada] = useState(null);
  const [gruesas, setGruesas] = useState(null);
  const [tab, setTab] = useState("DD");
  const [error, setError] = useState(null);
  const [actualizando, setActualizando] = useState(false);
  // Descuento de tubos para ESTE cliente/carrito: arranca en el default del
  // catálogo, pero se puede pisar acá sin afectar ese default (no se guarda).
  const [descuentosTubo, setDescuentosTubo] = useState({});

  const cargar = useCallback(
    async (forzarDolar = false) => {
      setError(null);
      if (forzarDolar) setActualizando(true);
      try {
        const [c, p, t, g, gr] = await Promise.all([
          obtenerCliente(id),
          obtenerPreciosCliente(id, { forzarDolar }),
          listaPreciosTubos({ forzarDolar }),
          listaPreciosGalvanizada({ forzarDolar, clienteId: id }),
          listaPreciosGruesas({ forzarDolar }),
        ]);
        setCliente(c);
        setPrecios(p);
        setTubos(t);
        setGalvanizada(g);
        setGruesas(gr);
      } catch {
        setError("No se pudo cargar la lista de precios del cliente.");
      } finally {
        setActualizando(false);
      }
    },
    [id]
  );

  useEffect(() => {
    cargar(false);
  }, [cargar]);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!cliente || !precios || !tubos || !galvanizada || !gruesas) return <Loading label="Calculando lista de precios…" />;

  const hayConflictoCarrito = carrito && clienteActivoId && clienteActivoId !== cliente.id;

  function confirmarYAgregar(item) {
    if (hayConflictoCarrito) {
      const ok = window.confirm(
        `Ya tenés un presupuesto en curso para "${carrito.cliente.nombre}". ` +
          `Si agregás un ítem de "${cliente.nombre}" se vacía ese carrito y arranca uno nuevo. ¿Continuar?`
      );
      if (!ok) return;
    }
    agregarItem(
      { id: cliente.id, nombre: cliente.nombre, email: cliente.email, telefono: cliente.telefono },
      item
    );
  }

  function descuentoDe(t) {
    return descuentosTubo[t.id] ?? { pct: Number(t.descuento_pct), habilitado: t.descuento_habilitado };
  }

  function setDescuentoDe(t, cambios) {
    setDescuentosTubo((prev) => ({ ...prev, [t.id]: { ...descuentoDe(t), ...cambios } }));
  }

  const base = precios.precios[tab]?.base;
  const filas = precios.precios[tab]?.precios_por_espesor || [];

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">
            <Link to="/app/clientes" style={{ color: "inherit" }}>Clientes</Link> / Cliente #{cliente.numero}
          </span>
          <h1>{cliente.nombre}</h1>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn" onClick={() => cargar(true)} disabled={actualizando}>
            {actualizando ? "Actualizando…" : "↻ Recalcular con dólar actual"}
          </button>
          {carrito && clienteActivoId === cliente.id && (
            <button className="btn btn-primary" onClick={() => navigate("/app/carrito")}>
              Ver carrito ({carrito.items.length})
            </button>
          )}
        </div>
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-label">Cotización usada</div>
          <div className="stat-value num">${Number(precios.cotizacion_dolar.venta).toLocaleString("es-AR")}</div>
          <div className="stat-sub">
            {precios.cotizacion_dolar.fuente} · {new Date(precios.cotizacion_dolar.fecha).toLocaleString("es-AR")}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">% Incremento DD / Negra</div>
          <div className="stat-value num">
            {Number(cliente.incremento_dd).toFixed(2)}% / {Number(cliente.incremento_negra).toFixed(2)}%
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">% Descuento DD / Negra</div>
          <div className="stat-value num">
            {Number(cliente.descuento_dd).toFixed(2)}% / {Number(cliente.descuento_negra).toFixed(2)}%
          </div>
          <div className="stat-sub">Propio de este cliente — se edita en Clientes</div>
        </div>
        {tab === "GALVANIZADA" && (
          <div className="stat-card">
            <div className="stat-label">% Descuento Galvanizada</div>
            <div className="stat-value num">{Number(cliente.descuento_galvanizada).toFixed(2)}%</div>
            <div className="stat-sub">Propio de este cliente — se edita en Clientes</div>
          </div>
        )}
        {base && tab !== "TUBOS" && (
          <>
            <div className="stat-card">
              <div className="stat-label">Base {tab} — U$S/kg</div>
              <div className="stat-value num">{Number(base.base_usd).toFixed(4)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Base {tab} — $/kg</div>
              <div className="stat-value num">{Number(base.base_pesos).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
          </>
        )}
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>Lista de precios</h2>
        </div>
        <div style={{ padding: "0 18px" }}>
          <div className="tabs">
            <div className={`tab ${tab === "DD" ? "active" : ""}`} onClick={() => setTab("DD")}>Laminado en Frío</div>
            <div className={`tab ${tab === "NEGRA" ? "active" : ""}`} onClick={() => setTab("NEGRA")}>Negra</div>
            <div className={`tab ${tab === "GALVANIZADA" ? "active" : ""}`} onClick={() => setTab("GALVANIZADA")}>Galvanizada</div>
            <div className={`tab ${tab === "GRUESA" ? "active" : ""}`} onClick={() => setTab("GRUESA")}>Gruesas</div>
            <div className={`tab ${tab === "TUBOS" ? "active" : ""}`} onClick={() => setTab("TUBOS")}>Tubos</div>
          </div>
        </div>

        {(tab === "DD" || tab === "NEGRA") && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Espesor</th>
                  <th>Ancho (mm)</th>
                  <th className="col-right">Recargo</th>
                  <th className="col-right">U$S/kg</th>
                  <th className="col-right">$/kg</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filas.map((f, i) => (
                  <tr key={`${tab}-${i}`}>
                    <td>{f.espesor}</td>
                    <td className="cell-muted">{f.ancho_mm}</td>
                    <td className="num col-right">
                      {f.disponible ? `+${(Number(f.porcentaje) * 100).toFixed(2)}%` : <span className="cell-muted">N/D</span>}
                    </td>
                    <td className="num col-right">{f.disponible ? Number(f.precio_usd).toFixed(4) : "—"}</td>
                    <td className="num col-right">
                      {f.disponible ? Number(f.precio_pesos).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
                    </td>
                    <td style={{ minWidth: 190 }}>
                      {f.disponible && (
                        <AgregarAlCarrito
                          unidadDefault="kg"
                          onAgregar={(cantidad, unidad) =>
                            confirmarYAgregar({
                              tipo: "CHAPA",
                              descripcion: `Chapa ${tab === "DD" ? "DD" : "Negra"} · espesor ${f.espesor} · ancho ${f.ancho_mm}mm`,
                              cantidad,
                              unidad,
                              precio_unitario_pesos: Number(f.precio_pesos),
                            })
                          }
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "GALVANIZADA" && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Espesor</th>
                  <th>Ancho (mm)</th>
                  <th className="col-right">Venta U$S/kg</th>
                  <th className="col-right">Venta $/kg</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {galvanizada.chapas.map((c, i) => (
                  <tr key={i}>
                    <td>{c.espesor}</td>
                    <td className="cell-muted">{c.ancho_mm}</td>
                    <td className="num col-right">{Number(c.precio_venta_usd_kg).toFixed(4)}</td>
                    <td className="num col-right">
                      {Number(c.precio_venta_pesos_kg).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ minWidth: 190 }}>
                      <AgregarAlCarrito
                        unidadDefault="kg"
                        onAgregar={(cantidad, unidad) =>
                          confirmarYAgregar({
                            tipo: "CHAPA",
                            descripcion: `Chapa Galvanizada · espesor ${c.espesor} · ancho ${c.ancho_mm}mm`,
                            cantidad,
                            unidad,
                            precio_unitario_pesos: Number(c.precio_venta_pesos_kg),
                          })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "GRUESA" && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Espesor</th>
                  <th>Ancho (mm)</th>
                  <th className="col-right">Venta U$S/kg</th>
                  <th className="col-right">Venta $/kg</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {gruesas.chapas.map((c, i) => (
                  <tr key={i}>
                    <td>{c.espesor}</td>
                    <td className="cell-muted">{c.ancho_mm}</td>
                    <td className="num col-right">{Number(c.precio_venta_usd_kg).toFixed(4)}</td>
                    <td className="num col-right">
                      {Number(c.precio_venta_pesos_kg).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ minWidth: 190 }}>
                      <AgregarAlCarrito
                        unidadDefault="kg"
                        onAgregar={(cantidad, unidad) =>
                          confirmarYAgregar({
                            tipo: "CHAPA",
                            descripcion: `Chapa Gruesa · espesor ${c.espesor} · ancho ${c.ancho_mm}mm`,
                            cantidad,
                            unidad,
                            precio_unitario_pesos: Number(c.precio_venta_pesos_kg),
                          })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "TUBOS" && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dimensiones</th>
                  <th className="col-right">Venta U$S/kg</th>
                  <th className="col-right">Venta $/unidad</th>
                  <th className="col-right">Descuento</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tubos.tubos.map((t, i) => {
                  const { pct, habilitado } = descuentoDe(t);
                  const precioBase = Number(t.precio_venta_pesos_tubo);
                  const precioFinal = habilitado ? precioBase * (1 - pct / 100) : precioBase;
                  const conDescuento = habilitado && pct > 0;
                  const fmt = (n) => n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                  return (
                    <tr key={i}>
                      <td>{t.dimensiones}</td>
                      <td className="num col-right">{Number(t.precio_venta_usd_kg).toFixed(4)}</td>
                      <td className="num col-right">
                        {conDescuento && (
                          <div style={{ textDecoration: "line-through", color: "var(--text-faint)", fontSize: 11 }}>
                            {fmt(precioBase)}
                          </div>
                        )}
                        {fmt(precioFinal)}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                          <input
                            className="input num"
                            type="number"
                            min="0"
                            step="0.01"
                            style={{ width: 78 }}
                            value={pct}
                            onChange={(e) => setDescuentoDe(t, { pct: e.target.value === "" ? 0 : Number(e.target.value) })}
                            aria-label="Porcentaje de descuento para este cliente"
                          />
                          <span className="cell-muted" style={{ fontSize: 12 }}>%</span>
                          <input
                            type="checkbox"
                            checked={habilitado}
                            onChange={(e) => setDescuentoDe(t, { habilitado: e.target.checked })}
                            title="Aplicarle este descuento a este cliente"
                          />
                        </div>
                      </td>
                      <td style={{ minWidth: 190 }}>
                        <AgregarAlCarrito
                          unidadDefault="unidad"
                          onAgregar={(cantidad, unidad) =>
                            confirmarYAgregar({
                              tipo: "TUBO",
                              descripcion: `Tubo ${t.dimensiones}`,
                              cantidad,
                              unidad,
                              precio_unitario_pesos: Math.round(precioFinal * 100) / 100,
                            })
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
