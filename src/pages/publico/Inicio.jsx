import { Link } from "react-router-dom";
import Icon from "../../components/Icon";
import { CHAPAS, TUBOS } from "../../data/productos";

export default function Inicio() {
  return (
    <>
      <section className="pub-hero-band">
        <div className="pub-hero">
          <div className="pub-hero-text">
            <span className="pub-eyebrow">Distribuidores oficiales Ternium</span>
            <h1>Chapas y tubos de acero, con stock permanente.</h1>
            <p>
              Somos una empresa familiar con más de 60 años de trayectoria en el mercado siderometalúrgico
              nacional. Ofrecemos los mejores precios, stock permanente, óptimas condiciones comerciales y
              asesoramiento técnico en cada venta.
            </p>
            <div className="pub-hero-actions">
              <Link className="btn btn-primary btn-lg" to="/contacto">Pedí tu cotización</Link>
              <Link className="btn btn-lg" to="/productos">Ver productos</Link>
            </div>
          </div>
          <div className="pub-hero-stats">
            <div className="pub-stat">
              <span className="pub-stat-value">+60</span>
              <span className="pub-stat-label">años en el mercado</span>
            </div>
            <div className="pub-stat">
              <span className="pub-stat-value">+1000m²</span>
              <span className="pub-stat-label">de depósito propio</span>
            </div>
            <div className="pub-stat">
              <span className="pub-stat-value">100%</span>
              <span className="pub-stat-label">flota de transporte propia</span>
            </div>
          </div>
        </div>
      </section>

      <section className="pub-section">
        <div className="pub-section-head">
          <span className="pub-eyebrow">Catálogo</span>
          <h2>Nuestros productos</h2>
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

      <section className="pub-section pub-section-alt">
        <div className="pub-section-head">
          <span className="pub-eyebrow">Servicios</span>
          <h2>Más que un proveedor de materiales</h2>
        </div>
        <div className="pub-feature-grid">
          <div className="pub-feature">
            <span className="pub-feature-icon"><Icon name="truck" /></span>
            <h3>Flota propia</h3>
            <p>Transporte dedicado para llegar a tiempo a tu obra o taller, sin depender de terceros.</p>
          </div>
          <div className="pub-feature">
            <span className="pub-feature-icon"><Icon name="scissors" /></span>
            <h3>Corte a medida</h3>
            <p>Chapa en tamaños estándar o cortada a la medida exacta que necesita tu proyecto.</p>
          </div>
          <div className="pub-feature">
            <span className="pub-feature-icon"><Icon name="box" /></span>
            <h3>Stock permanente</h3>
            <p>Materiales con certificado de calidad de planta, disponibles todo el año.</p>
          </div>
          <div className="pub-feature">
            <span className="pub-feature-icon"><Icon name="users" /></span>
            <h3>Atención personalizada</h3>
            <p>Asesoramiento técnico antes y después de la venta, de principio a fin.</p>
          </div>
        </div>
      </section>

      <section className="pub-section">
        <div className="pub-photo-grid">
          <div className="pub-photo-card">
            <img src="/img/home/flota.jpg" alt="Flota de transporte propia de Lausane" loading="lazy" />
            <div className="pub-photo-caption">Nuestra flota de transporte, lista para llegar a tu obra o taller.</div>
          </div>
          <div className="pub-photo-card">
            <img src="/img/home/cortes.jpg" alt="Servicio de corte a medida en planta" loading="lazy" />
            <div className="pub-photo-caption">Corte a medida en planta, con equipos propios.</div>
          </div>
        </div>
      </section>

      <section className="pub-section pub-section-alt">
        <div className="pub-section-head">
          <span className="pub-eyebrow">A quién le vendemos</span>
          <h2>Trabajamos con toda la industria metalúrgica</h2>
        </div>
        <ul className="pub-tag-list">
          <li>Carrocerías y carpintería metálica</li>
          <li>Fabricantes de muebles metálicos</li>
          <li>Galpones industriales</li>
          <li>Autopartistas</li>
          <li>Talleres navales</li>
          <li>Maquinaria agrícola</li>
        </ul>
      </section>

      <section className="pub-cta-band">
        <h2>¿Necesitás un precio hoy mismo?</h2>
        <p>Contanos qué necesitás y te respondemos a la brevedad.</p>
        <Link className="btn btn-primary btn-lg" to="/contacto">Hablar con ventas</Link>
      </section>
    </>
  );
}
