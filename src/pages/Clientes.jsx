import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarClientes, eliminarCliente } from "../api/clientes";
import { Loading, EmptyState, Pagination } from "../components/Ui";
import ClienteFormModal from "../components/ClienteFormModal";

export default function Clientes() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null); // null | "nuevo" | cliente
  const [borrando, setBorrando] = useState(null);

  const cargar = useCallback(async () => {
    setError(null);
    try {
      const res = await listarClientes({ search, page });
      setData(res);
    } catch {
      setError("No se pudo cargar la lista de clientes.");
    }
  }, [search, page]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  function onSaved() {
    setModal(null);
    cargar();
  }

  async function onEliminar(cliente) {
    if (!window.confirm(`¿Dar de baja al cliente "${cliente.nombre}" (#${cliente.numero})?`)) return;
    setBorrando(cliente.id);
    try {
      await eliminarCliente(cliente.id);
      cargar();
    } catch {
      alert("No se pudo eliminar el cliente.");
    } finally {
      setBorrando(null);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Clientes</span>
          <h1>Clientes y coeficientes</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setModal("nuevo")}>
          + Nuevo cliente
        </button>
      </div>

      <div className="panel">
        <div className="toolbar">
          <input
            className="input search-input"
            placeholder="Buscar por nombre o número…"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
          <span className="cell-muted" style={{ fontSize: 12.5 }}>
            {data ? `${data.count} clientes` : ""}
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
            title="No hay clientes todavía"
            subtitle="Creá el primero a mano o importá tu Excel desde la sección Importar."
            action={
              <button className="btn btn-primary" onClick={() => setModal("nuevo")}>
                + Nuevo cliente
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
                    <th>N°</th>
                    <th>Nombre</th>
                    <th className="col-right">% Incr. DD</th>
                    <th className="col-right">% Incr. Negra</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((c) => (
                    <tr key={c.id}>
                      <td className="num cell-muted">{c.numero}</td>
                      <td>
                        <Link to={`/app/clientes/${c.id}`}>{c.nombre}</Link>
                      </td>
                      <td className="num col-right">{Number(c.incremento_dd).toFixed(2)}%</td>
                      <td className="num col-right">{Number(c.incremento_negra).toFixed(2)}%</td>
                      <td>
                        <span className={`badge ${c.activo ? "badge-ok" : "badge-danger"}`}>
                          {c.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td>
                        <div className="cell-actions">
                          <Link className="btn btn-sm" to={`/app/clientes/${c.id}`}>
                            Precios
                          </Link>
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
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination count={data.count} page={page} onPageChange={setPage} />
          </>
        )}
      </div>

      {modal && (
        <ClienteFormModal
          cliente={modal === "nuevo" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={onSaved}
        />
      )}
    </>
  );
}
