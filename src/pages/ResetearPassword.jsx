import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { confirmarResetPassword } from "../api/auth";
import { extraerMensajeError } from "../api/client";

export default function ResetearPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setGuardando(true);
    try {
      await confirmarResetPassword(uid, token, password);
      navigate("/login", { state: { passwordActualizada: true } });
    } catch (err) {
      setError(extraerMensajeError(err, "El link no es válido o ya expiró."));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <img src="/logo-lausane.png" alt="Lausane S.A.C." className="logo-img" />
        </div>

        <p className="hint" style={{ marginTop: 0, marginBottom: 14 }}>
          Elegí tu contraseña nueva.
        </p>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="password">Contraseña nueva</label>
            <input
              id="password"
              type="password"
              className="input"
              autoFocus
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="field">
            <label htmlFor="confirmacion">Repetir contraseña</label>
            <input
              id="confirmacion"
              type="password"
              className="input"
              autoComplete="new-password"
              value={confirmacion}
              onChange={(e) => setConfirmacion(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar contraseña"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 14 }}>
          <Link to="/login" style={{ fontSize: 13 }}>
            Volver a iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
