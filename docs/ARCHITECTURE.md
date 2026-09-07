# Arquitectura del UABC Professional Portal

## Objetivo
Mantener el portal público estable y estático, pero con una arquitectura que permita activar administración real más adelante sin rehacer la interfaz ni migrar datos antes de tiempo.

## Capas

1. **Fuente pública**: `index.html`, `assets/js/app.js`, estilos y templates.
2. **Contenido legado**: el objeto `window.CMS_CONTENT` continúa en el código fuente para compatibilidad y no se migra a una base de datos.
3. **Build**: `scripts/build.mjs` extrae ese objeto, genera `dist/assets/data/content.js` y `content.json`, y produce un `app.js` de producción que consume la capa de datos externa.
4. **Presentación**: Tailwind se compila localmente en `dist/assets/css/tailwind.css`; producción ya no depende de Tailwind CDN.
5. **Admin Studio**: `/admin` trabaja con copias/borradores locales y no puede publicar.
6. **SEO y navegación**: rutas limpias, metadata dinámica, sitemap, RSS, fichas estáticas y datos estructurados.
7. **PWA**: manifest + service worker con caché limitada a recursos propios.
8. **Calidad**: `npm run check` construye y audita el bundle; GitHub Actions ejecuta el mismo control.

## Activación futura del backend
La futura conexión a Supabase debe sustituir la persistencia local del Admin Studio por Auth/Postgres/Storage/RLS. El contenido actual no debe migrarse automáticamente: la migración debe ser un paso explícito, reversible y validado.

## Principios
- No secretos en el frontend.
- No autenticación ficticia.
- No publicar desde `/admin` hasta existir autorización real.
- Mantener la web pública funcional si servicios externos fallan.
- Accesibilidad y responsive como requisitos de regresión.
