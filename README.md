# Portal Profesional UABC

Sitio web estático tipo portal académico/profesional, publicado como práctica de interfaz, navegación y organización de contenido institucional.

## ✨ Lo que demuestra este proyecto
- Maquetación HTML para una experiencia tipo SPA con navegación lateral.
- Separación de estilos y lógica en archivos dedicados dentro de `assets/`.
- Interacciones de interfaz como modo oscuro, selector de idioma, galería, calendario, banner de cookies y reproductor flotante.
- Publicación de un sitio estático en Vercel.

## 🧱 Estructura
- `index.html`: HTML principal de la SPA.
- `assets/css/styles.css`: estilos principales del sitio.
- `assets/js/tailwind-config.js`: configuración visual usada por Tailwind CDN.
- `assets/js/app.js`: lógica de navegación, vistas e interacciones.

## 🚀 Demo
El sitio está publicado en: https://prueba-pi-eight.vercel.app

## Nota técnica
Tailwind se usa vía CDN. Para un proyecto de producción conviene compilar Tailwind de forma local con CLI/PostCSS, pero esta versión funciona como sitio estático listo para publicar.
