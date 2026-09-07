# UABC Professional Portal

Portal académico/profesional estático con navegación tipo SPA, modo oscuro, contenido bilingüe, publicaciones, investigación, docencia, eventos, blog, galería, podcast y un **Admin Studio preparado sin backend ni migración**.

## Estado

La web pública continúa usando el contenido existente del proyecto. Durante el build, ese contenido se extrae automáticamente a una capa de datos independiente para producción; **no se mueve a Supabase ni a ninguna base de datos**.

## Mejoras de la versión 2

- Tailwind compilado localmente: producción deja de depender de `cdn.tailwindcss.com`.
- Build reproducible a `dist/`.
- `CMS_CONTENT` separado de la lógica en el bundle de producción.
- Rutas limpias (`/publicaciones`, `/investigacion`, `/blog`, etc.) con puente compatible con el router histórico.
- Metadata SEO por sección, canonical real y Schema.org `Person`.
- `sitemap.xml`, RSS y fichas individuales generadas para contenido estructurado.
- Buscador global con índice generado en build.
- Mejoras de accesibilidad: skip link, foco por navegación, `aria-current`, atajo `/` para búsqueda y reducción de movimiento.
- Mejoras de performance: lazy loading progresivo y CSS local.
- Headers de seguridad desde Vercel.
- PWA opcional con manifest, offline básico y Service Worker.
- Quality Gate en GitHub Actions.
- Admin Studio con dashboard de salud de contenido, detección de campos vacíos, bilingüe incompleto, duplicados y biblioteca de medios preparada.

## Desarrollo

Requiere Node.js 20+.

```bash
npm install
npm run build
npm run audit
```

`npm run check` ejecuta build + auditoría estructural. El resultado de producción se genera en `dist/`.

## Estructura clave

- `index.html`: fuente del portal público.
- `assets/js/app.js`: router/renderers e interacciones históricas.
- `assets/css/styles.css`: estilos específicos.
- `assets/css/layout-fixes.css`: hardening responsive.
- `assets/css/enhancements.css`: accesibilidad, buscador y páginas detalle.
- `scripts/build.mjs`: build, separación de datos, SEO técnico, fichas e índices.
- `scripts/audit.mjs`: comprobaciones de regresión.
- `admin/`: Admin Studio en modo preparación.
- `docs/ARCHITECTURE.md`: arquitectura y ruta futura a backend.

## Admin Studio

Ruta: `/admin`

Actualmente puede editar una copia, guardar borradores locales, importar/exportar JSON, previsualizar, auditar contenido y revisar medios. **Publicar permanece bloqueado** hasta conectar un backend con autenticación real.

## Deploy

Vercel ejecuta `npm run build` y sirve `dist/`. El deployment conserva la integración Git existente.

Demo: https://prueba-pi-eight.vercel.app

## Backend futuro

La arquitectura está preparada para Supabase Auth + Postgres + Storage + RLS, pero esa activación y la migración de contenido deben hacerse únicamente cuando se autoricen de forma explícita.
