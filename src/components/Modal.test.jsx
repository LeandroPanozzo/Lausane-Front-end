import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Modal from "./Modal";

/**
 * Regresión del bug: la barra de scroll de un modal alto vivía sobre el
 * propio overlay (que tenía overflow-y:auto), así que arrastrarla se
 * interpretaba como "click afuera" y cerraba el modal. El fix movió el
 * scroll a .modal-body (adentro de .modal), así que un mousedown ahí no
 * debe disparar onClose.
 */
describe("Modal", () => {
  it("cierra al hacer mousedown directo sobre el overlay", () => {
    const onClose = vi.fn();
    render(
      <Modal title="Título" onClose={onClose}>
        contenido
      </Modal>
    );
    fireEvent.mouseDown(screen.getByText("contenido").closest(".modal-overlay"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("no cierra al hacer mousedown adentro del modal (incluye la zona de scroll del body)", () => {
    const onClose = vi.fn();
    render(
      <Modal title="Título" onClose={onClose}>
        contenido
      </Modal>
    );
    fireEvent.mouseDown(screen.getByText("contenido"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("cierra con la tecla Escape", () => {
    const onClose = vi.fn();
    render(
      <Modal title="Título" onClose={onClose}>
        contenido
      </Modal>
    );
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
