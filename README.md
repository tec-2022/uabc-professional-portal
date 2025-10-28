# Portal Profesional UABC

Proyecto estático generado automáticamente a partir del archivo `index.html`.

## Estructura
- `index.html`
  - HTML principal de la SPA (sidebar, templates de cada sección, etc.).
  - Ya NO contiene el bloque gigante `<style>` ni el gran `<script>` inline.

- `assets/css/styles.css`
  - Todo el CSS que estaba dentro de `<style> ... </style>` en el `<head>`.

- `assets/js/tailwind-config.js`
  - Configuración Tailwind (colores UABC personalizados, dark mode, etc.).

- `assets/js/app.js`
  - Toda la lógica JS de la app:
    - Router y render dinámico de vistas `#/home`, `#/publicaciones`, etc.
    - Calendario (FullCalendar).
    - Lightbox de la galería.
    - Modo oscuro / selector de idioma.
    - Banner de cookies.
    - Reproductor de podcast flotante.
    - Sidebar responsive, etc.

## Cómo subirlo a GitHub
1. Sube TODO el contenido de esta carpeta a un repo nuevo.
2. Haz commit y push.
3. (Opcional) Activa GitHub Pages apuntando a la rama principal.

## Nota sobre Tailwind CDN
Tailwind sigue usándose vía CDN. En producción real es recomendable compilar Tailwind de forma local (CLI/PostCSS),
pero esto ya funciona como sitio estático listo para publicar.
