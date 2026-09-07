# Personalización de la plantilla

La versión 3.0 está diseñada para reutilizarse sin rehacer la arquitectura ni tocar reglas visuales internas.

## 1. Identidad y dominio

Edita `portal.config.json`:

- `site.baseUrl`, título, descripción e idioma;
- `branding.profile.name`, cargo e institución en ES/EN;
- `branding.colors` para verde principal, acción y acento;
- `site.defaultTheme`;
- `sections` para activar/desactivar áreas del menú;
- `features` para búsqueda, bilingüismo, PWA, métricas y otras capacidades.

El build genera `dist/assets/data/site-config.js`, que expone esta configuración al runtime sin duplicarla manualmente en HTML.

## 2. Contenido de ejemplo

Los datos demostrativos siguen en `assets/js/app.js` dentro de `window.CMS_CONTENT` para que la base funcione sin backend. Durante `npm run build` se extraen a `dist/assets/data/content.js` y `content.json`.

Para una implementación real sustituye nombres de publicaciones, proyectos, cursos, eventos, fotografías, CV, enlaces académicos y textos legales. La demo puede conservarlos mientras se presente explícitamente como datos de ejemplo.

## 3. Colores y diseño

No edites colores componente por componente. Ajusta primero `portal.config.json` y los tokens descritos en [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md).

Los módulos CSS fuente se consolidan en `dist/assets/css/portal.css`; por eso no debes añadir otra hoja “fix.css” al final del HTML.

## 4. PWA

`features.pwa` controla si la aplicación registra Service Worker.

- `false` — recomendado para demos que cambian con frecuencia. También elimina workers/caches antiguos del navegador.
- `true` — útil cuando se desea soporte offline estable.

## 5. Panel de administración

`/admin` es un editor local de preparación. Permite borradores y preview, pero no publica. La interfaz protege cambios sin guardar y comunica el estado del borrador.

No debe presentarse como autenticado hasta conectar una capa real de identidad y permisos.

## 6. Backend futuro

Supabase u otro backend puede reemplazar la persistencia local. La migración debe conservar:

1. contenido publicado separado de borradores;
2. roles y permisos;
3. historial/versiones;
4. preview antes de publicar;
5. portal público independiente del proveedor.

## 7. Comprobación

```bash
npm install
npm run check
npx playwright install chromium
npm run test:e2e
npm run test:visual
```

GitHub Actions ejecuta este flujo automáticamente.
