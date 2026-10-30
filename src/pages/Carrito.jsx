import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { crearPresupuesto } from "../api/presupuestos";
import { useDolar } from "../context/DolarContext";
import { extraerMensajeError } from "../api/client";
import { EmptyState } from "../components/Ui";

export default function Carrito() {
  const { carrito, quitarItem, actualizarCantidad, vaciarCarrito } = useCart();
  const { cotizacion } = useDolar();
  const navigate = useNavigate();
  const [notas, setNotas] = useState("");
  const [error, setError] = useState(null);
  const [generando, setGenerando] = useState(false);

  if (!carrito || carrito.items.length === 0) {
    return (
      <>
        <div className="page-header">
          <div>
            <span className="eyebrow">Presupuesto</span>
            <h1>Carrito</h1>
          </div>
        </div>
        <div className="panel">
          <EmptyState
            icon="⊘"
            title="El carrito está vacío"
            subtitle="Entrá a la ficha de un cliente y agregá chapa o tubos a su presupuesto."
            action={
              <button className="btn btn-primary" onClick={() => navigate("/app/clientes")}>
                Ir a Clientes
              </button>
            }
          />
        </div>
      </>
    );
  }

  const total = carrito.items.reduce((acc, i) => acc + Number(i.cantidad) * Number(i.precio_unitario_pesos), 0);

  async function onGenerarPresupuesto() {
    if (!cotizacion) {
      setError("No se pudo obtener la cotización del dólar todavía. Probá de nuevo en un momento.");
      return;
    }
    setError(null);
    setGenerando(true);
    try {
      const payload = {
        cliente: carrito.cliente.id,
        cotizacion_dolar: cotizacion.venta,
        notas,
        items: carrito.items.map(({ tipo, descripcion, cantidad, unidad, precio_unitario_pesos, longitud_mm }) => ({
          tipo,
          descripcion,
          cantidad,
          unidad,
          precio_unitario_pesos,
          ...(longitud_mm ? { longitud_mm } : {}),
        })),
      };
      const presupuesto = await crearPresupuesto(payload);
      vaciarCarrito();
      navigate(`/app/presupuestos/${presupuesto.id}`);
    } catch (err) {
      setError(extraerMensajeError(err, "No se pudo generar el presupuesto."));
    } finally {
      setGenerando(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Presupuesto para {carrito.cliente.nombre}</span>
          <h1>Carrito</h1>
        </div>
        <button className="btn btn-ghost" onClick={vaciarCarrito}>
          Vaciar carrito
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="panel">
        <div className="panel-body">
          {carrito.items.map((item) => (
            <div className="cart-line" key={item.id}>
              <div className="cart-line-desc">
                <div className="desc-title">{item.descripcion}</div>
                <div className="desc-sub num">
                  ${Number(item.precio_unitario_pesos).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / {item.unidad}
                </div>
              </div>
              <input
                className="input num qty-input"
                type="number"
                min="0"
                step="any"
                value={item.cantidad}
                onChange={(e) => actualizarCantidad(item.id, e.target.value)}
              />
              <div className="num" style={{ minWidth: 110, textAlign: "right", fontWeight: 600 }}>
                ${(Number(item.cantidad) * Number(item.precio_unitario_pesos)).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => quitarItem(item.id)} aria-label="Quitar">
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="field" style={{ marginTop: 18 }}>
        <label>Notas para el presupuesto (opcional)</label>
        <textarea
          className="input"
          rows={2}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Ej: entrega en 5 días hábiles, forma de pago, etc."
        />
      </div>

      <div className="total-banner">
        <div>
          <div className="total-label">Total del presupuesto</div>
          <div className="total-value">${total.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <button className="btn btn-primary" onClick={onGenerarPresupuesto} disabled={generando}>
          {generando ? "Generando…" : "Generar presupuesto →"}
        </button>
      </div>
    </>
  );
}
