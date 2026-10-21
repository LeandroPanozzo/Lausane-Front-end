import Icon from "../../components/Icon";

export default function Historia() {
  return (
    <>
      <section className="pub-hero-band">
        <div className="pub-page-hero">
          <span className="pub-eyebrow">Nuestra empresa</span>
          <h1>Más de 60 años distribuyendo acero</h1>
        </div>
      </section>

      <section className="pub-section">
        <div className="pub-prose">
          <p>
            Lausane es una empresa familiar fundada por Luciano Deletraz, con más de 60 años de trayectoria en
            el mercado siderometalúrgico nacional. Somos distribuidores oficiales de chapas planas y tubos de
            acero Ternium.
          </p>
          <p>
            Con el correr de los años nos afianzamos en nuestra planta actual sobre Carlos Berg 2825, en la
            Ciudad de Buenos Aires, donde funcionamos hasta hoy. El predio supera los 1.000 m² e incluye
            puentes grúa propios, flota de transporte dedicada, materiales con certificado de calidad de
            planta y stock permanente para responder rápido a cada pedido.
          </p>
          <p>
            A lo largo de este camino acompañamos a carrocerías y carpinterías metálicas, fabricantes de
            muebles metálicos, galpones industriales, autopartistas, talleres navales y productores de
            maquinaria agrícola — siempre con el mismo compromiso: entregar productos de la más alta calidad,
            cumplir los plazos acordados y ofrecer un trato personalizado antes y después de cada venta.
          </p>
        </div>

        <div className="pub-photo-grid pub-feature-grid-top">
          <div className="pub-photo-card">
            <img src="/img/historia/acerca.jpg" alt="Depósito de Lausane con puentes grúa" loading="lazy" />
            <div className="pub-photo-caption">Nuestro depósito de más de 1.000 m², con puentes grúa propios.</div>
          </div>
          <div className="pub-photo-card">
            <img src="/img/historia/flota.jpg" alt="Camión de la flota propia de Lausane" loading="lazy" />
            <div className="pub-photo-caption">Parte de nuestra flota de transporte dedicada.</div>
          </div>
        </div>
      </section>

      <section className="pub-section pub-section-alt">
        <div className="pub-section-head">
          <span className="pub-eyebrow">Nuestra infraestructura</span>
          <h2>Lo que nos permite responder rápido</h2>
        </div>
        <div className="pub-feature-grid">
          <div className="pub-feature">
            <span className="pub-feature-icon"><Icon name="factory" /></span>
            <h3>+1.000 m² de depósito</h3>
            <p>Con puentes grúa propios para mover y despachar material sin demoras.</p>
          </div>
          <div className="pub-feature">
            <span className="pub-feature-icon"><Icon name="truck" /></span>
            <h3>Flota propia</h3>
            <p>Transporte dedicado que nos permite cumplir con los plazos de entrega.</p>
          </div>
          <div className="pub-feature">
            <span className="pub-feature-icon"><Icon name="shieldCheck" /></span>
            <h3>Calidad certificada</h3>
            <p>Materiales de planta, con certificado de calidad en cada lote.</p>
          </div>
          <div className="pub-feature">
            <span className="pub-feature-icon"><Icon name="box" /></span>
            <h3>Stock permanente</h3>
            <p>Inventario disponible todo el año para no frenar tu producción.</p>
          </div>
        </div>
      </section>
    </>
  );
}
