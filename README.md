# Lista de Precios — Frontend (React + Vite) — LAUSANE S.A.C.

Interfaz web para el backend de Django REST Framework, con la identidad
visual de Lausane (blanco y rojo). Reemplaza el uso directo del Excel y del
admin de Django: login propio, listado y edición de clientes, catálogo de
tubos, tabla de recargos por espesor, configuración de precios base, la
cotización del dólar en tiempo real, y un **carrito de presupuestos** por
cliente que se puede enviar por email, WhatsApp, PDF o Excel.

## Requisitos

- Node.js 18 o superior
- El backend de Django corriendo (ver el proyecto `lista_precios_django`)

## Instalación

```bash
npm install
cp .env.example .env
```

Abrí `.env` y verificá que `VITE_API_URL` apunte a tu backend:

```
VITE_API_URL=http://localhost:8000/api
```

## Correr en desarrollo

```bash
npm run dev
```

Por defecto queda en `http://localhost:5173`.

**Importante**: el backend de Django tiene que tener ese origen habilitado en
`CORS_ALLOWED_ORIGINS` (en el `.env` del backend). Si usás el puerto por
defecto de Vite:

```
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## Compilar para producción

```bash
npm run build
```

Genera la carpeta `dist/` con los archivos estáticos, listos para servir con
nginx, Vercel, Netlify, o el mismo Django (WhiteNoise) — lo que uses.

```bash
npm run preview   # para probar el build de producción localmente
```

## Estructura

```
src/
  api/          # llamadas a la API (axios), un archivo por recurso
  components/   # piezas reutilizables (layout, modales de formulario, etc.)
  context/      # sesión (JWT) y cotización del dólar, compartidos por toda la app
  pages/        # una página por sección (Clientes, Tubos, Configuración, etc.)
  styles/       # sistema de diseño (tokens de color, tipografía, componentes)
```

## Qué incluye

- **Login con JWT**, con refresco automático del token cuando vence.
- **Clientes**: listar (con búsqueda y paginación), crear, editar (incluye
  email y WhatsApp), dar de baja, y ver la lista de precios calculada de
  cada uno (chapa DD/Negra por espesor, y tubos).
- **Carrito de presupuesto**: desde la ficha de un cliente, agregás chapa
  y/o tubos con la cantidad que necesites. El carrito queda guardado en el
  navegador (persiste si recargás la página) y está scoped a un cliente por
  vez.
- **Presupuestos**: al generar el presupuesto desde el carrito, se crea en
  el backend con los precios congelados. Desde el detalle podés:
  - Ver el PDF con la identidad de Lausane
  - Descargarlo en PDF o Excel
  - Enviarlo por email (con un mensaje personalizable)
  - Enviarlo por WhatsApp (abre `wa.me` con un link para que el cliente vea
    el presupuesto sin necesidad de loguearse)
  - Ver el historial completo de presupuestos generados
- **Tubos**: catálogo editable con el precio de venta ya calculado.
- **Recargos por espesor** (chapa): tabla global editable.
- **Configuración**: precios base DD/Negra, % de incremento de tubos, y
  carga manual de cotización del dólar que **fuerza** ese valor en todos los
  cálculos (en vez de la oficial online) hasta que se vuelva a la oficial.
- **Cotización del dólar** visible en el header en todo momento, con
  actualización automática cada 5 minutos, botón para forzar el refresco, y
  — cuando está forzada a mano — la cotización oficial online al lado, de
  referencia.

## Notas

- El token de sesión y el carrito se guardan en `localStorage` del
  navegador — es normal y esperado para una SPA como esta.
- El logo (`public/logo-lausane.png`) y los colores de marca están en
  `src/styles/index.css` (variables `--accent`, `--accent-strong`, etc.) —
  para ajustar el tono de rojo o cambiar el logo, es el único lugar que hay
  que tocar.
- Si el build de Vite falla por versión de Node, actualizá a Node 18+.
# Lausane-Front-end
