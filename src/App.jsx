import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DolarProvider } from "./context/DolarContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import PublicLayout from "./components/PublicLayout";

import Login from "./pages/Login";
import RecuperarPassword from "./pages/RecuperarPassword";
import ResetearPassword from "./pages/ResetearPassword";

// Cada página pesada se separa en su propio chunk: el usuario descarga el
// bundle principal (sitio público + login) y recién trae Presupuestos/
// Configuración/etc. cuando navega a esa sección, en vez de todo junto.
const Panel = lazy(() => import("./pages/Panel"));
const Clientes = lazy(() => import("./pages/Clientes"));
const ClienteDetalle = lazy(() => import("./pages/ClienteDetalle"));
const Tubos = lazy(() => import("./pages/Tubos"));
const MarkupsChapa = lazy(() => import("./pages/MarkupsChapa"));
const Configuracion = lazy(() => import("./pages/Configuracion"));
const Carrito = lazy(() => import("./pages/Carrito"));
const Presupuestos = lazy(() => import("./pages/Presupuestos"));
const PresupuestoDetalle = lazy(() => import("./pages/PresupuestoDetalle"));

const Inicio = lazy(() => import("./pages/publico/Inicio"));
const Historia = lazy(() => import("./pages/publico/Historia"));
const Productos = lazy(() => import("./pages/publico/Productos"));
const ProductoDetalle = lazy(() => import("./pages/publico/ProductoDetalle"));
const Ubicacion = lazy(() => import("./pages/publico/Ubicacion"));
const Etica = lazy(() => import("./pages/publico/Etica"));
const Contacto = lazy(() => import("./pages/publico/Contacto"));

function CargandoPagina() {
  return <div className="loading-block"><span className="spinner" /> Cargando…</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DolarProvider>
          <CartProvider>
            <Suspense fallback={<CargandoPagina />}>
              <Routes>
                {/* Sitio público (lausane.com.ar) — sin botón de login, se
                    accede a /login solo escribiendo la URL directamente. */}
                <Route path="/" element={<PublicLayout />}>
                  <Route index element={<Inicio />} />
                  <Route path="nuestra-historia" element={<Historia />} />
                  <Route path="productos" element={<Productos />} />
                  <Route path="productos/:categoria/:slug" element={<ProductoDetalle />} />
                  <Route path="ubicacion" element={<Ubicacion />} />
                  <Route path="etica-y-compliance" element={<Etica />} />
                  <Route path="contacto" element={<Contacto />} />
                </Route>

                <Route path="/login" element={<Login />} />
                <Route path="/recuperar-contrasena" element={<RecuperarPassword />} />
                <Route path="/reset-password/:uid/:token" element={<ResetearPassword />} />

                {/* Sistema interno de precios/presupuestos, atrás de login. */}
                <Route
                  path="/app"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Panel />} />
                  <Route path="clientes" element={<Clientes />} />
                  <Route path="clientes/:id" element={<ClienteDetalle />} />
                  <Route path="tubos" element={<Tubos />} />
                  <Route path="markups-chapa" element={<MarkupsChapa />} />
                  <Route path="configuracion" element={<Configuracion />} />
                  <Route path="carrito" element={<Carrito />} />
                  <Route path="presupuestos" element={<Presupuestos />} />
                  <Route path="presupuestos/:id" element={<PresupuestoDetalle />} />
                </Route>
              </Routes>
            </Suspense>
          </CartProvider>
        </DolarProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
