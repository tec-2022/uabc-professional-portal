# UABC Professional Portal · Versión Base

Sitio web estático tipo portal académico/profesional, publicado como práctica base de interfaz, navegación y organización de contenido institucional.

## ✨ Lo que demuestra este proyecto
- Maquetación HTML para una experiencia tipo SPA con navegación lateral.
- Separación de estilos y lógica en archivos dedicados dentro de `assets/`.
- Interacciones de interfaz como modo oscuro, selector de idioma, galería, calendario, banner de cookies y reproductor flotante.
- Publicación de un sitio estático en Vercel.
- Admin Studio desacoplado en `/admin`, preparado para una futura persistencia real sin migrar todavía el contenido público.

## 🧱 Estructura
- `index.html`: HTML principal de la SPA.
- `assets/css/styles.css`: estilos principales del sitio.
- `assets/css/layout-fixes.css`: endurecimiento responsive y prevención de solapamientos.
- `assets/js/tailwind-config.js`: configuración visual y fallback local.
- `assets/js/app.js`: navegación, contenido CMS embebido, vistas e interacciones.
- `admin/`: consola de administración en modo preparación.
- `vercel.json`: routing y headers de publicación.

## 🛠️ Admin Studio
La ruta `/admin` permite cargar una copia del contenido CMS existente, editarla mediante formularios, guardar borradores locales, importar/exportar JSON y previsualizar cambios.

Por diseño, esta fase **no migra datos ni publica cambios**. El botón de publicación permanece deshabilitado hasta que se conecten autenticación y persistencia reales. Los límites y la futura integración están documentados en `admin/README.md`.

## 🚀 Demo
El sitio está publicado en: https://prueba-pi-eight.vercel.app

## Estado del proyecto
La web pública sigue funcionando con su contenido embebido actual. La interfaz administrativa ya está preparada para una fase posterior de backend sin exigir rehacer el editor.

## Nota técnica
Tailwind se usa vía CDN con hojas locales de respaldo. Para una futura fase de producción avanzada puede compilarse localmente con CLI/PostCSS. La persistencia del Admin Studio deberá activarse únicamente junto con autenticación y reglas de autorización reales.
