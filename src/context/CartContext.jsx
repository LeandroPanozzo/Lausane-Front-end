import { createContext, useCallback, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "lp_carrito";

function cargarInicial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

let contadorIdTemporal = 0;
function nuevoIdTemporal() {
  contadorIdTemporal += 1;
  return `tmp-${Date.now()}-${contadorIdTemporal}`;
}

export function CartProvider({ children }) {
  const [carrito, setCarrito] = useState(cargarInicial);

  useEffect(() => {
    if (carrito) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [carrito]);

  /** Agrega un ítem. Si el carrito tiene otro cliente activo, hay que confirmar antes de llamar a esto. */
  const agregarItem = useCallback((cliente, item) => {
    setCarrito((actual) => {
      const base =
        actual && actual.cliente.id === cliente.id
          ? actual
          : { cliente, items: [] };
      return { ...base, items: [...base.items, { id: nuevoIdTemporal(), ...item }] };
    });
  }, []);

  const quitarItem = useCallback((itemId) => {
    setCarrito((actual) => {
      if (!actual) return actual;
      const items = actual.items.filter((i) => i.id !== itemId);
      return items.length ? { ...actual, items } : null;
    });
  }, []);

  const actualizarCantidad = useCallback((itemId, cantidad) => {
    setCarrito((actual) => {
      if (!actual) return actual;
      return {
        ...actual,
        items: actual.items.map((i) => (i.id === itemId ? { ...i, cantidad } : i)),
      };
    });
  }, []);

  const vaciarCarrito = useCallback(() => setCarrito(null), []);

  const clienteActivoId = carrito?.cliente?.id ?? null;
  const cantidadItems = carrito?.items?.length ?? 0;
  const totalPesos = (carrito?.items ?? []).reduce(
    (acc, i) => acc + Number(i.cantidad) * Number(i.precio_unitario_pesos),
    0
  );

  return (
    <CartContext.Provider
      value={{
        carrito,
        clienteActivoId,
        cantidadItems,
        totalPesos,
        agregarItem,
        quitarItem,
        actualizarCantidad,
        vaciarCarrito,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
