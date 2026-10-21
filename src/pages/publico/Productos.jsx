import { Link } from "react-router-dom";
import { CHAPAS, TUBOS } from "../../data/productos";

export default function Productos() {
  return (
    <>
      <section className="pub-hero-band">
        <div className="pub-page-hero">
          <span className="pub-eyebrow">Catálogo</span>
          <h1>Productos</h1>
          <p>Chapas y tubos de acero Ternium, con stock permanente y corte a medida.</p>
        </div>
      </section>

      <section className="pub-section">
        <img className="pub-banner-img" src="/img/home/chapas-cat.jpg" alt="Chapas de acero apiladas" loading="lazy" />
        <div className="pub-section-head">
          <h2>Chapas</h2>
        </div>
        <div className="pub-card-grid">
          {CHAPAS.map((p) => (
            <Link key={p.slug} to={`/productos/chapas/${p.slug}`} className="pub-card">
              <img className="pub-card-img" src={p.imagen} alt={p.nombre} loading="lazy" />
              <div className="pub-card-body">
                <h3>{p.nombre}</h3>
                <p>{p.resumen}</p>
                <span className="pub-card-link">Ver más →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="pub-section pub-section-alt">
        <img className="pub-banner-img" src="/img/home/tubos-cat.jpg" alt="Tubos de acero apilados" loading="lazy" />
        <div className="pub-section-head">
          <h2>Tubos</h2>
        </div>
        <div className="pub-card-grid">
          {TUBOS.map((p) => (
            <Link key={p.slug} to={`/productos/tubos/${p.slug}`} className="pub-card">
              <img className="pub-card-img" src={p.imagen} alt={p.nombre} loading="lazy" />
              <div className="pub-card-body">
                <h3>{p.nombre}</h3>
                <p>{p.resumen}</p>
                <span className="pub-card-link">Ver más →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
