import { useState } from "react";
import { Link } from "react-router-dom";
import { solicitarResetPassword } from "../api/auth";
import { extraerMensajeError } from "../api/client";

export default function RecuperarPassword() {
  const [username, setUsername] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await solicitarResetPassword(username);
      setEnviado(true);
    } catch (err) {
      setError(extraerMensajeError(err, "No se pudo procesar el pedido."));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <img src="/logo-lausane.png" alt="Lausane S.A.C." className="logo-img" />
        </div>

        {enviado ? (
          <div className="alert alert-ok">
            Si el usuario existe y tiene un email cargado, le enviamos un correo con instrucciones
            para elegir una contraseña nueva.
          </div>
        ) : (
          <>
            <p className="hint" style={{ marginTop: 0, marginBottom: 14 }}>
              Ingresá tu usuario y te mandamos un email (a la dirección cargada en tu cuenta) con un
              link para elegir una contraseña nueva.
            </p>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={onSubmit}>
              <div className="field">
                <label htmlFor="username">Usuario</label>
                <input
                  id="username"
                  className="input"
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={enviando}>
                {enviando ? "Enviando…" : "Enviar instrucciones"}
              </button>
            </form>
          </>
        )}

        <div style={{ textAlign: "center", marginTop: 14 }}>
          <Link to="/login" style={{ fontSize: 13 }}>
            Volver a iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
