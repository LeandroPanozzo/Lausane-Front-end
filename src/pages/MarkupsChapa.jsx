import { useCallback, useEffect, useState } from "react";
import { listarMarkups, eliminarMarkup, actualizarConfiguracion } from "../api/config";
import {
  listarGalvanizada, actualizarGalvanizada, eliminarGalvanizada, listaPreciosGalvanizada,
} from "../api/galvanizada";
import {
  listarGruesas, actualizarGruesa, eliminarGruesa, listaPreciosGruesas,
} from "../api/gruesas";
import { Loading, EmptyState } from "../components/Ui";
import MarkupFormModal from "../components/MarkupFormModal";
import CatalogoCostoFormModal from "../components/CatalogoCostoFormModal";
import CambiarPrecioMasivoModal from "../components/CambiarPrecioMasivoModal";

// Galvanizada y Gruesas comparten exactamente la misma lógica (costo propio
// en U$S/kg por espesor/ancho + un % de incremento general editable, con
// opción de sacarle el incremento a una chapa puntual) — solo cambia a qué
// endpoint y campo de Configuración apunta cada una.
const CATALOGOS_COSTO = {
  GALVANIZADA: {
    tipo: "galvanizada",
    label: "Galvanizada",
    incrementoCampo: "incremento_galvanizada",
    listar: listarGalvanizada,
    listaPrecios: listaPreciosGalvanizada,
    actualizar: actualizarGalvanizada,
    eliminar: eliminarGalvanizada,
  },
  GRUESA: {
    tipo: "gruesa",
    label: "Gruesas",
    incrementoCampo: "incremento_gruesas",
    listar: listarGruesas,
    listaPrecios: listaPreciosGruesas,
    actualizar: actualizarGruesa,
    eliminar: eliminarGruesa,
  },
};

function IncrementoCell({ chapa, actualizar, onGuardado }) {
  const [guardando, setGuardando] = useState(false);

  async function onChange(e) {
    const valor = e.target.checked;
    setGuardando(true);
    try {
      onGuardado(await actualizar(chapa.id, { usar_incremento_general: valor }));
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
  const [preciosPorClave, setPreciosPorClave] = useState({});
  const [incrementoActual, setIncrementoActual] = useState(null);
  const [incrementoInput, setIncrementoInput] = useState("");
  const [guardandoIncremento, setGuardandoIncremento] = useState(false);
  const [incrementoOk, setIncrementoOk] = useState(false);
  const [tab, setTab] = useState("DD");
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [borrando, setBorrando] = useState(null);
  const [modoSeleccionMasiva, setModoSeleccionMasiva] = useState(false);
  const [seleccionados, setSeleccionados] = useState(() => new Set());
  const [modalMasivo, setModalMasivo] = useState(false);

  const catalogo = CATALOGOS_COSTO[tab];
  const esCatalogoCosto = Boolean(catalogo);

  const cargar = useCallback(async () => {
    setError(null);
    setItems(null);
    try {
      if (catalogo) {
        const [listado, precios] = await Promise.all([catalogo.listar(), catalogo.listaPrecios()]);
        setItems(listado.results ?? listado);
        setIncrementoActual(precios[catalogo.incrementoCampo]);
        setIncrementoInput((Number(precios[catalogo.incrementoCampo]) * 100).toString());
        const mapa = {};
        precios.chapas.forEach((c) => {
          mapa[`${c.espesor}·${c.ancho_mm}`] = c;
        });
        setPreciosPorClave(mapa);
      } else {
        const data = await listarMarkups({ tipo: tab });
        setItems(data.results ?? data);
      }
    } catch {
      setError("No se pudo cargar la tabla de recargos.");
    }
  }, [tab, catalogo]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    setModoSeleccionMasiva(false);
    setSeleccionados(new Set());
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
      await actualizarConfiguracion({ [catalogo.incrementoCampo]: valor / 100 });
      setIncrementoOk(true);
      await cargar();
    } catch {
      alert("No se pudo guardar el incremento general.");
    } finally {
      setGuardandoIncremento(false);
    }
  }

  function toggleSeleccionMasiva() {
    setModoSeleccionMasiva((v) => !v);
    setSeleccionados(new Set());
  }

  function toggleSeleccionado(id) {
    setSeleccionados((prev) => {
      const nuevo = new Set(prev);
      if (nuevo.has(id)) nuevo.delete(id);
      else nuevo.add(id);
      return nuevo;
    });
  }

  function onGuardadoMasivo() {
    setModalMasivo(false);
    setModoSeleccionMasiva(false);
    setSeleccionados(new Set());
    cargar();
  }

  const chapasSeleccionadasData = items
    ? items
        .filter((c) => seleccionados.has(c.id))
        .map((c) => ({ id: c.id, costo_usd_kg: c.costo_usd_kg }))
    : [];

  async function onEliminar(m) {
    const etiqueta = `${m.espesor} · ${m.ancho_mm}mm`;
    if (!window.confirm(`¿Eliminar "${etiqueta}"?`)) return;
    setBorrando(m.id);
    try {
      await (catalogo ? catalogo.eliminar(m.id) : eliminarMarkup(m.id));
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
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {tab === "GRUESA" && !modoSeleccionMasiva && (
            <button className="btn" onClick={toggleSeleccionMasiva}>
              Cambiar precio en conjunto
            </button>
          )}
          {!modoSeleccionMasiva && (
            <button className="btn btn-primary" onClick={() => setModal("nuevo")}>
              {esCatalogoCosto ? "+ Nueva chapa" : "+ Nuevo recargo"}
            </button>
          )}
        </div>
      </div>

      {tab === "GRUESA" && modoSeleccionMasiva && (
        <div className="barra-seleccion-masiva">
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            {seleccionados.size} seleccionada{seleccionados.size === 1 ? "" : "s"}
          </span>
          <button className="btn btn-ghost" onClick={toggleSeleccionMasiva}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            disabled={seleccionados.size === 0}
            onClick={() => setModalMasivo(true)}
          >
            Aceptar
          </button>
        </div>
      )}

      <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 18, maxWidth: 640 }}>
        {esCatalogoCosto
          ? `A diferencia de Laminado en Frío y Negra, cada espesor/ancho de ${catalogo.label.toLowerCase()} tiene su propio costo en U$S/kg (no un % sobre un precio base compartido).`
          : "Esta tabla es la misma para todos los clientes — replica los porcentajes que en el Excel " +
            "original se repetían en la hoja de cada cliente (ej. \"base + 7%\" para espesor 16)."}
      </p>

      {esCatalogoCosto && incrementoActual !== null && (
        <form
          onSubmit={onGuardarIncremento}
          className="alert alert-warn"
          style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}
        >
          <span>Incremento general aplicado a toda la chapa {catalogo.label.toLowerCase()}:</span>
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
            aria-label={`Incremento general de ${catalogo.label.toLowerCase()}, en porcentaje`}
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
            <div className={`tab ${tab === "GRUESA" ? "active" : ""}`} onClick={() => setTab("GRUESA")}>
              Gruesas
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
                {esCatalogoCosto ? "+ Nueva chapa" : "+ Nuevo recargo"}
              </button>
            }
          />
        )}

        {items && items.length > 0 && !esCatalogoCosto && (
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

        {items && items.length > 0 && esCatalogoCosto && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  {tab === "GRUESA" && modoSeleccionMasiva && <th></th>}
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
                  const p = preciosPorClave[`${c.espesor}·${c.ancho_mm}`];
                  return (
                    <tr key={c.id}>
                      {tab === "GRUESA" && modoSeleccionMasiva && (
                        <td>
                          <input
                            type="checkbox"
                            checked={seleccionados.has(c.id)}
                            onChange={() => toggleSeleccionado(c.id)}
                          />
                        </td>
                      )}
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
                        <IncrementoCell chapa={c} actualizar={catalogo.actualizar} onGuardado={cargar} />
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

      {modal && !esCatalogoCosto && (
        <MarkupFormModal
          markup={modal === "nuevo" ? { tipo: tab } : modal}
          onClose={() => setModal(null)}
          onSaved={onSaved}
        />
      )}

      {modal && esCatalogoCosto && (
        <CatalogoCostoFormModal
          tipo={catalogo.tipo}
          chapa={modal === "nuevo" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={onSaved}
        />
      )}

      {modalMasivo && (
        <CambiarPrecioMasivoModal
          chapas={chapasSeleccionadasData}
          actualizar={catalogo.actualizar}
          onClose={() => setModalMasivo(false)}
          onGuardado={onGuardadoMasivo}
        />
      )}
    </>
  );
}
