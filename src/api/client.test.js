import { describe, expect, it } from "vitest";
import { extraerMensajeError } from "./client";

describe("extraerMensajeError", () => {
  it("usa el mensaje de red cuando no hay respuesta del servidor", () => {
    const error = { message: "Network Error" };
    expect(extraerMensajeError(error)).toBe("Network Error");
  });

  it("devuelve el fallback si no hay nada más para mostrar", () => {
    expect(extraerMensajeError({}, "Fallback")).toBe("Fallback");
  });

  it("prioriza 'detail' cuando DRF lo manda", () => {
    const error = { response: { data: { detail: "No encontrado." } } };
    expect(extraerMensajeError(error)).toBe("No encontrado.");
  });

  it("arma un mensaje legible a partir de errores de validación por campo", () => {
    const error = { response: { data: { email: ["Ingresá un email válido."] } } };
    expect(extraerMensajeError(error)).toBe("email: Ingresá un email válido.");
  });

  it("no antepone el nombre de campo para non_field_errors", () => {
    const error = { response: { data: { non_field_errors: ["Las credenciales no coinciden."] } } };
    expect(extraerMensajeError(error)).toBe("Las credenciales no coinciden.");
  });
});
