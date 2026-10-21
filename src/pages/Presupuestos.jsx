import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarPresupuestos } from "../api/presupuestos";
import { Loading, EmptyState, Pagination } from "../components/Ui";

export default function Presupuestos() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setError(null);
    try {
      const res = await listarPresupuestos({ page });
      setData(res);
    } catch {
      setError("No se pudo cargar el historial de presupuestos.");
    }
  }, [page]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Historial</span>
          <h1>Presupuestos</h1>
        </div>
        <Link className="btn btn-primary" to="/app/clientes">
          + Armar nuevo presupuesto
        </Link>
      </div>

      <div className="panel">
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
            title="Todavía no armaste ningún presupuesto"
            subtitle="Entrá a la ficha de un cliente, agregá productos al carrito, y generá el presupuesto."
            action={
              <Link className="btn btn-primary" to="/app/clientes">
                Ir a Clientes
              </Link>
            }
          />
        )}

        {data && data.results.length > 0 && (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Cliente</th>
                    <th>Estado</th>
                    <th className="col-right">Total</th>
                    <th>Fecha</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((p) => (
                    <tr key={p.id}>
                      <td className="num">{p.codigo}</td>
                      <td>{p.cliente_detalle.nombre}</td>
                      <td>
                        <span className={`badge ${p.estado === "enviado" ? "badge-ok" : "badge-warn"}`}>
                          {p.estado === "enviado" ? "Enviado" : "Borrador"}
                        </span>
                      </td>
                      <td className="num col-right">
                        ${Number(p.total_pesos).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="cell-muted">{new Date(p.creado).toLocaleDateString("es-AR")}</td>
                      <td>
                        <Link className="btn btn-sm" to={`/app/presupuestos/${p.id}`}>
                          Ver
                        </Link>
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
    </>
  );
}
