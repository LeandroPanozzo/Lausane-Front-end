import { useState } from "react";
import { enviarContacto } from "../../api/contacto";
import { extraerMensajeError } from "../../api/client";

const VACIO = { nombre: "", email: "", telefono: "", asunto: "", mensaje: "" };

export default function Contacto() {
  const [form, setForm] = useState(VACIO);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState(null);

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await enviarContacto(form);
      setEnviado(true);
      setForm(VACIO);
    } catch (err) {
      setError(extraerMensajeError(err, "No se pudo enviar el mensaje. Probá de nuevo en un momento."));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <section className="pub-hero-band">
        <div className="pub-page-hero">
          <span className="pub-eyebrow">Contacto</span>
          <h1>Hablemos</h1>
          <p>Contanos qué necesitás y te respondemos a la brevedad.</p>
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
        </div>

        <div className="pub-card">
          {enviado && (
            <div className="alert alert-ok">
              ¡Gracias! Recibimos tu mensaje y te vamos a contactar a la brevedad.
            </div>
          )}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                className="input"
                value={form.nombre}
                onChange={(e) => set("nombre", e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="telefono">Teléfono / WhatsApp</label>
              <input
                id="telefono"
                className="input"
                value={form.telefono}
                onChange={(e) => set("telefono", e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="asunto">Asunto</label>
              <input
                id="asunto"
                className="input"
                value={form.asunto}
                onChange={(e) => set("asunto", e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="mensaje">Mensaje</label>
              <textarea
                id="mensaje"
                className="input"
                rows={5}
                value={form.mensaje}
                onChange={(e) => set("mensaje", e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={enviando}>
              {enviando ? "Enviando…" : "Enviar mensaje"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
