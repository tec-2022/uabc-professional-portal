# Personalización de la plantilla

Esta base está diseñada para reutilizarse sin rehacer la arquitectura.

## 1. Identidad del producto

Edita `portal.config.json` para cambiar:

- nombre de la plantilla o implementación;
- URL pública;
- título y descripción SEO;
- idioma y color de tema;
- modo demo;
- activación de funcionalidades opcionales.

## 2. Contenido de ejemplo

Los datos demostrativos viven actualmente en `assets/js/app.js` dentro de `window.CMS_CONTENT`. Se mantienen ahí para que la base funcione sin backend.

Durante `npm run build`, el contenido se extrae a `dist/assets/data/content.js` y `content.json`; la fuente original no se migra ni se modifica.

## 3. Branding

Los colores principales se definen en `tailwind.config.cjs` y en las variables CSS existentes. Antes de publicar una implementación real, sustituye:

- nombre y cargo del perfil;
- institución;
- fotografías;
- enlaces académicos;
- CV;
- imágenes sociales / Open Graph;
- textos legales;
- dominio configurado.

## 4. Admin Studio

`/admin` funciona como editor local de preparación. No publica cambios y no debe considerarse autenticado hasta conectar un backend real.

## 5. Backend futuro

La plantilla puede conectarse posteriormente a Supabase u otro backend. La migración debe reemplazar únicamente la capa de persistencia; el portal público y el editor no necesitan rehacerse.

## 6. Comprobación antes de publicar una implementación

Ejecuta:

```bash
npm install
npm run check
```

El Quality Gate también se ejecuta automáticamente en GitHub Actions.
