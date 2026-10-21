import { useState } from "react";
import Modal from "./Modal";
import { crearCliente, actualizarCliente } from "../api/clientes";
import { extraerMensajeError } from "../api/client";

const VACIO = { numero: "", nombre: "", email: "", telefono: "", incremento_dd: "", incremento_negra: "", activo: true, notas: "" };

export default function ClienteFormModal({ cliente, onClose, onSaved }) {
  const editando = Boolean(cliente);
  const [form, setForm] = useState(
    cliente
      ? {
          numero: cliente.numero,
          nombre: cliente.nombre,
          email: cliente.email || "",
          telefono: cliente.telefono || "",
          incremento_dd: cliente.incremento_dd,
          incremento_negra: cliente.incremento_negra,
          activo: cliente.activo,
          notas: cliente.notas || "",
        }
      : VACIO
  );
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      const payload = {
        ...form,
        numero: Number(form.numero),
        incremento_dd: Number(form.incremento_dd),
        incremento_negra: Number(form.incremento_negra),
      };
      const resultado = editando ? await actualizarCliente(cliente.id, payload) : await crearCliente(payload);
      onSaved(resultado);
    } catch (err) {
      setError(extraerMensajeError(err, "No se pudo guardar el cliente."));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal
      title={editando ? `Editar cliente #${cliente.numero}` : "Nuevo cliente"}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={onSubmit} disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar cliente"}
          </button>
        </>
      }
    >
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="form-grid">
          <div className="field">
            <label>Número de cliente</label>
            <input
              className="input"
              type="number"
              value={form.numero}
              onChange={(e) => set("numero", e.target.value)}
              required
            />
          </div>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label>Nombre / alias</label>
            <input
              className="input"
              value={form.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              placeholder="Ej: FABRICAL o tato/rolando/alpes"
              required
            />
          </div>
          <div className="field">
            <label>Email (para enviar presupuestos)</label>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="cliente@ejemplo.com"
            />
          </div>
          <div className="field">
            <label>WhatsApp (con código de país)</label>
            <input
              className="input"
              value={form.telefono}
              onChange={(e) => set("telefono", e.target.value)}
              placeholder="5491122334455"
            />
          </div>
          <div className="field">
            <label>% Incremento DD</label>
            <input
              className="input num"
              type="number"
              step="0.01"
              value={form.incremento_dd}
              onChange={(e) => set("incremento_dd", e.target.value)}
              required
            />
            <div className="hint">Ej: 8 significa 8%, no 0.08</div>
          </div>
          <div className="field">
            <label>% Incremento Negra</label>
            <input
              className="input num"
              type="number"
              step="0.01"
              value={form.incremento_negra}
              onChange={(e) => set("incremento_negra", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="field">
          <label>Notas (opcional)</label>
          <textarea
            className="input"
            rows={2}
            value={form.notas}
            onChange={(e) => set("notas", e.target.value)}
          />
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginTop: 4 }}>
          <input type="checkbox" checked={form.activo} onChange={(e) => set("activo", e.target.checked)} />
          Cliente activo
        </label>
      </form>
    </Modal>
  );
}
