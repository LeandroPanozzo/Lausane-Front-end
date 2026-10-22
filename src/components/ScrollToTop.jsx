import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** React Router no hace esto solo: al navegar a otra página (ej. un link de
 * "ver más"), sin esto el scroll queda donde estaba en la página anterior en
 * vez de arrancar arriba de todo. */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
