// Puente con la extensión de Chrome "Lausane - Presupuestos por WhatsApp"
// (carpeta lausane-whatsapp-extension/ en la raíz del proyecto). Si está
// instalada, le mandamos el archivo y ella adjunta y manda el mensaje sola
// en WhatsApp Web. Si no está instalada, el llamado falla rápido y seguimos
// con el flujo normal (Web Share API / descarga manual).
//
// Usa un puerto (chrome.runtime.connect) en vez de sendMessage suelto porque
// necesitamos que la extensión nos pueda hablar de vuelta cuando termine la
// automatización en la pestaña de WhatsApp Web.
const EXTENSION_ID = "nkknooaiihdaghhhpbjiokeddbpjjdfi";
const TIMEOUT_CONFIRMACION_MS = 120000;

function archivoABase64(archivo) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result.split(",")[1]);
    lector.onerror = () => reject(lector.error);
    lector.readAsDataURL(archivo);
  });
}

/**
 * Intenta que la extensión adjunte y mande el archivo sola en WhatsApp Web.
 * Devuelve:
 *  - { disponible: false } si la extensión no está instalada (o no se pudo conectar).
 *  - { disponible: true, confirmado: true, exito, error } si llegó una confirmación real.
 *  - { disponible: true, confirmado: false } si se abrió WhatsApp Web pero no hubo
 *    confirmación a tiempo (igual es muy probable que haya funcionado).
 */
export async function intentarEnviarPorExtension({ telefono, texto, archivo }) {
  if (!(typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.connect)) {
    return { disponible: false };
  }

  const base64 = await archivoABase64(archivo);

  return new Promise((resolve) => {
    let resuelto = false;
    let port;
    try {
      port = chrome.runtime.connect(EXTENSION_ID, { name: "lausane-presupuesto" });
    } catch {
      resolve({ disponible: false });
      return;
    }

    const timeoutConfirmacion = setTimeout(() => {
      if (resuelto) return;
      resuelto = true;
      try {
        port.disconnect();
      } catch {
        /* ignorado */
      }
      resolve({ disponible: true, confirmado: false });
    }, TIMEOUT_CONFIRMACION_MS);

    port.onDisconnect.addListener(() => {
      if (resuelto) return;
      // Se cortó antes de que nos confirmen "en progreso": lo más probable es
      // que la extensión no esté instalada (sin ella, connect() igual devuelve
      // un puerto, pero se desconecta solo casi al instante).
      resuelto = true;
      clearTimeout(timeoutConfirmacion);
      resolve({ disponible: false });
    });

    port.onMessage.addListener((mensaje) => {
      if (resuelto) return;
      if (mensaje?.tipo === "whatsapp-en-progreso") return; // seguimos esperando el resultado final
      if (mensaje?.tipo === "whatsapp-resultado") {
        resuelto = true;
        clearTimeout(timeoutConfirmacion);
        resolve({ disponible: true, confirmado: true, exito: mensaje.exito, error: mensaje.error });
      }
    });

    port.postMessage({
      accion: "enviar-presupuesto-whatsapp",
      telefono,
      texto,
      archivo: { nombre: archivo.name, tipo: archivo.type, base64 },
    });
  });
}
