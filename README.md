# Academic Professional Portal

![Quality Gate](https://github.com/tec-2022/uabc-professional-portal/actions/workflows/quality.yml/badge.svg)

**Plantilla profesional y reutilizable para portales académicos y de investigación.** Incluye perfil, publicaciones, investigación, docencia, eventos, blog, galería, podcast, búsqueda global, PWA y un Admin Studio preparado para una futura capa de persistencia.

> **Demo con datos de ejemplo.** El contenido incluido existe para demostrar componentes y flujos realistas. No debe interpretarse como un sitio institucional oficial ni como una fuente de información académica verificada.

## Demo

https://prueba-pi-eight.vercel.app

Admin Studio de preparación:

https://prueba-pi-eight.vercel.app/admin

El Admin Studio **no publica cambios** y no simula autenticación. Los borradores se guardan localmente hasta que se conecte un backend real.

## Qué incluye

- Portal responsive tipo SPA con navegación lateral.
- Tema claro/oscuro y contenido bilingüe ES/EN.
- Perfil académico, experiencia y formación.
- Publicaciones con búsqueda, filtros y fichas individuales.
- Investigación, proyectos y grupo de trabajo.
- Docencia, cursos y materiales.
- Eventos y calendario.
- Blog académico.
- Galería y lightbox.
- Podcast con reproductor flotante.
- Buscador global generado en build.
- SEO técnico, Open Graph, Schema.org, sitemap y RSS.
- PWA opcional con manifest, Service Worker y fallback offline.
- Tailwind compilado localmente.
- Headers de seguridad en Vercel.
- Admin Studio con edición local, import/export JSON, preview, auditoría de contenido y biblioteca de medios preparada.
- Quality Gate automático con GitHub Actions.

## Filosofía de la base

Este repositorio prioriza una demo que **se vea terminada aunque use sample data**. La arquitectura separa tres conceptos:

1. **Plantilla:** interfaz, build, navegación, SEO, accesibilidad y herramientas.
2. **Datos demo:** contenido de ejemplo que permite probar todos los estados de la UI.
3. **Persistencia futura:** backend opcional; actualmente no existe migración ni publicación remota.

La configuración general vive en `portal.config.json`.

## Inicio rápido

Requiere Node.js 24 recomendado (20+ compatible con el proyecto).

```bash
npm install
npm run check
```

Para generar únicamente producción:

```bash
npm run build
```

El resultado se escribe en `dist/`.

## Arquitectura

```text
.
├── admin/                  # Admin Studio en modo preparación
├── assets/
│   ├── css/                # Tailwind input + estilos del portal
│   └── js/                 # Router, renderers y mejoras progresivas
├── docs/                   # Arquitectura, personalización y datos demo
├── scripts/
│   ├── build.mjs           # Build, SEO, índices y extracción de contenido
│   └── audit.mjs           # Quality Gate estructural
├── portal.config.json      # Configuración de la plantilla/demo
├── tailwind.config.cjs
├── vercel.json
└── index.html
```

Durante el build, `CMS_CONTENT` se extrae a una capa independiente dentro de `dist/assets/data/`. **La fuente original no se migra a Supabase ni a ninguna base de datos.**

## Personalización

Consulta [`docs/CUSTOMIZATION.md`](docs/CUSTOMIZATION.md).

Ahí se documenta cómo cambiar identidad, dominio, branding, contenido, assets y posteriormente conectar un backend sin rehacer la interfaz.

## Datos de demostración

Consulta [`docs/DEMO-DATA.md`](docs/DEMO-DATA.md).

Los placeholders —por ejemplo enlaces `#`, DOI de muestra o imágenes remotas— se conservan para demostrar los estados soportados por la plantilla. Una implementación real debe sustituirlos y validar derechos de uso.

## Admin Studio

Ruta: `/admin`

Actualmente permite:

- cargar una copia del contenido existente;
- editar estructuras bilingües;
- añadir, duplicar, eliminar y reordenar registros;
- guardar borradores en `localStorage`;
- importar/exportar JSON;
- previsualizar escritorio/móvil;
- revisar salud del contenido y recursos multimedia.

**Publicar permanece bloqueado** hasta conectar autenticación y backend reales.

## Calidad y CI

Cada push/PR ejecuta `npm run check` en GitHub Actions. La auditoría verifica, entre otros puntos:

- build reproducible;
- Tailwind local en producción;
- separación de contenido y lógica;
- archivos PWA/SEO generados;
- menú sin duplicados;
- Admin Studio sin publicación insegura.

## Seguridad

Consulta [`SECURITY.md`](SECURITY.md). Nunca deben almacenarse tokens o secretos en el repositorio.

## Contribuir

Consulta [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Backend futuro

La base está preparada para conectar posteriormente Supabase Auth + Postgres + Storage + RLS u otra solución equivalente. Esa fase es opcional y debe mantener la separación entre contenido publicado, borradores y permisos.

---

**Estado:** base profesional demostrativa · sample data · sin migración de backend.
