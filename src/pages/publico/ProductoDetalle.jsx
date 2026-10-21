import { Link, Navigate, useParams } from "react-router-dom";
import { buscarProducto } from "../../data/productos";

export default function ProductoDetalle() {
  const { categoria, slug } = useParams();
  const producto = buscarProducto(categoria, slug);

  if (!producto) return <Navigate to="/productos" replace />;

  return (
    <>
      <section className="pub-hero-band">
        <div className="pub-page-hero">
          <span className="pub-eyebrow">
            <Link to="/productos" style={{ color: "inherit" }}>Productos</Link> / {categoria === "tubos" ? "Tubos" : "Chapas"}
          </span>
          <h1>{producto.nombre}</h1>
          <p>{producto.resumen}</p>
        </div>
      </section>

      <section className="pub-section">
        <div className="pub-product-hero">
          <img src={producto.imagen} alt={producto.nombre} loading="lazy" />
          <div className="pub-prose">
            <p>{producto.descripcion}</p>
          </div>
        </div>

        {producto.formas && (
          <div className="pub-feature-grid pub-feature-grid-top">
            {producto.formas.map((f) => (
              <div className="pub-feature" key={f.titulo}>
                <h3>{f.titulo}</h3>
                <p>{f.texto}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="pub-section pub-section-alt">
        <div className="pub-two-col">
          {producto.normas && (
            <div>
              <h2>Normas</h2>
              <ul className="pub-bullet-list">
                {producto.normas.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h2>Aplicaciones</h2>
            <ul className="pub-bullet-list">
              {producto.aplicaciones.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="pub-cta-band">
        <h2>¿Te interesa este producto?</h2>
        <p>Contanos la medida y cantidad que necesitás y te pasamos precio.</p>
        <Link className="btn btn-primary btn-lg" to="/contacto">Pedí tu cotización</Link>
      </section>
    </>
  );
}
