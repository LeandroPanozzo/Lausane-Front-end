import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import DolarGauge from "./DolarGauge";
import { useCart } from "../context/CartContext";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { cantidadItems } = useCart();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      <div className="main-content">
        <div className="topbar">
          <button
            className="btn btn-ghost btn-sm mobile-menu-btn"
            aria-label="Abrir menú"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            ☰
          </button>
          <div className="topbar-right">
            <button className="cart-button" onClick={() => navigate("/app/carrito")}>
              🛒<span className="cart-button-label"> Carrito</span>
              {cantidadItems > 0 && <span className="cart-count">{cantidadItems}</span>}
            </button>
            <DolarGauge />
          </div>
        </div>
        <div className="page">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
