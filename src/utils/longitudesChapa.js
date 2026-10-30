// Longitudes estándar disponibles según el ancho de la chapa (mm). Lo que no
// está acá permite cargar la longitud a mano igual (ver AgregarAlCarrito).
export const LONGITUDES_POR_ANCHO = {
  1000: [2000],
  1220: [2440, 3000],
  1245: [2440, 3000, 6000],
  1500: [3000, 6000],
};

export function opcionesLongitud(anchoMm) {
  return LONGITUDES_POR_ANCHO[Number(anchoMm)] || [];
}
