export default function Ubicacion() {
  return (
    <>
      <section className="pub-hero-band">
        <div className="pub-page-hero">
          <span className="pub-eyebrow">Cómo llegar</span>
          <h1>Ubicación</h1>
          <p>Estamos en Carlos Berg 2825, C.A.B.A.</p>
        </div>
      </section>

      <section className="pub-section pub-two-col">
        <div>
          <h2>Datos de contacto</h2>
          <ul className="pub-bullet-list">
            <li>Carlos Berg 2825, C.A.B.A., Argentina</li>
            <li>
              Tel: <a href="tel:+541149199464">4919-9464 / 9788 / 8193</a>
            </li>
            <li>
              Email: <a href="mailto:lausaneventas@lausane.com.ar">lausaneventas@lausane.com.ar</a>
            </li>
          </ul>
          <p>
            Contamos con depósito propio de más de 1.000 m² con puentes grúa y flota de transporte
            dedicada para despachar tu pedido.
          </p>
        </div>
        <div className="pub-map-wrap">
          <iframe
            title="Ubicación de Lausane S.A.C."
            src="https://maps.google.com/maps?q=Carlos%20Berg%202825%2C%20CABA%2C%20Argentina&t=&z=15&ie=UTF8&iwloc=&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </>
  );
}
