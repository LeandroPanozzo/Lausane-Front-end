import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/app", label: "Panel", icon: "01", end: true },
  { to: "/app/clientes", label: "Clientes", icon: "02" },
  { to: "/app/tubos", label: "Tubos", icon: "03" },
  { to: "/app/markups-chapa", label: "Chapas", icon: "04" },
  { to: "/app/presupuestos", label: "Presupuestos", icon: "05" },
  { to: "/app/configuracion", label: "Precios Base", icon: "06" },
];

export default function Sidebar({ open, onNavigate }) {
  const { username, logout } = useAuth();

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-brand">
        <img src="/logo-lausane.png" alt="Lausane S.A.C." className="logo-img" />
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span className="nav-left">
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div className="sidebar-user">
          Conectado como
          <strong>{username || "usuario"}</strong>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={logout} style={{ width: "100%" }}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
