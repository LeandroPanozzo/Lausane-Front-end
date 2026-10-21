import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Inicio", end: true },
  { to: "/nuestra-historia", label: "Nuestra Historia" },
  { to: "/productos", label: "Productos" },
  { to: "/ubicacion", label: "Ubicación" },
  { to: "/etica-y-compliance", label: "Ética y Compliance" },
];

export default function PublicLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuAbierto(false);
  }, [location.pathname]);

  return (
    <div className="pub-shell">
      <header className="pub-header">
        <div className="pub-header-inner">
          <NavLink to="/" className="pub-brand" end>
            <img src="/logo-lausane.png" alt="Lausane S.A.C." className="logo-img" />
          </NavLink>

          <button
            className="pub-menu-btn"
            aria-label="Abrir menú"
            onClick={() => setMenuAbierto((v) => !v)}
          >
            {menuAbierto ? "✕" : "☰"}
          </button>

          <nav className={`pub-nav ${menuAbierto ? "open" : ""}`}>
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `pub-nav-link ${isActive ? "active" : ""}`}
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink to="/contacto" className="btn btn-primary pub-nav-cta">
              Pedí tu cotización
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="pub-main">
        <Outlet />
      </main>

      <footer className="pub-footer">
        <div className="pub-footer-inner">
          <div className="pub-footer-brand">
            <span className="logo-chip">
              <img src="/logo-lausane.png" alt="Lausane S.A.C." className="logo-img" />
            </span>
            <p>Distribuidores oficiales de chapas y tubos de acero Ternium. Más de 60 años en el mercado siderometalúrgico nacional.</p>
          </div>

          <div className="pub-footer-col">
            <h4>Navegación</h4>
            <NavLink to="/">Inicio</NavLink>
            <NavLink to="/nuestra-historia">Nuestra Historia</NavLink>
            <NavLink to="/productos">Productos</NavLink>
            <NavLink to="/ubicacion">Ubicación</NavLink>
            <NavLink to="/etica-y-compliance">Ética y Compliance</NavLink>
            <NavLink to="/contacto">Contacto</NavLink>
          </div>

          <div className="pub-footer-col">
            <h4>Contacto</h4>
            <a href="tel:+541149199464">4919-9464 / 9788 / 8193</a>
            <a href="mailto:lausaneventas@lausane.com.ar">lausaneventas@lausane.com.ar</a>
            <span>Carlos Berg 2825, C.A.B.A.</span>
          </div>
        </div>
        <div className="pub-footer-bottom">© {new Date().getFullYear()} Lausane S.A.C. — Todos los derechos reservados.</div>
      </footer>
    </div>
  );
}
