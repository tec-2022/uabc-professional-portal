# Changelog

Todos los cambios relevantes del proyecto se documentan aquí.

## 3.0.0 — 2026-09-07

### Sistema visual
- Producción consolidada en un único `portal.css` local.
- Tokens semánticos para claro/oscuro, títulos, texto, metadatos, enlaces y superficies.
- Componentes 3.0 para métricas, acciones, estados vacíos y herramientas de ficha.
- Focus visible y `prefers-reduced-motion` protegidos por el Quality Gate.

### Experiencia pública
- Inicio con resumen académico demostrativo y accesos rápidos.
- Estados vacíos coherentes en secciones dinámicas.
- Acción “Copiar referencia” en Publicaciones.
- Branding, secciones y SEO complementario alimentados desde `portal.config.json`.
- PWA configurable y desactivada por defecto en la demo para evitar bundles obsoletos.

### Administración
- CSS y JavaScript de producción consolidados en bundles propios.
- Estado visible de cambios sin guardar / borrador guardado.
- Protección antes de abandonar la página con cambios pendientes.
- Guía contextual de la sección que se está editando.
- La publicación continúa desactivada hasta disponer de backend real.

### Calidad
- Auditoría estructural 3.0 unificada.
- Playwright para navegación, rutas, tema, búsqueda y Admin.
- Axe para WCAG A/AA.
- Capturas visuales automatizadas en claro/oscuro, escritorio/móvil.
- Servidor local de pruebas sin dependencias adicionales.

### Configuración y documentación
- `portal.config.json` centraliza branding, colores, secciones y feature flags.
- Nuevas guías de sistema visual y pruebas.
- README actualizado a la arquitectura real 3.0.

## 2.2.0 — 2026-09-07

### Presentación
- Nueva capa `showcase.css` para un acabado más editorial y consistente.
- Tarjetas, títulos, formularios y fichas individuales con una misma jerarquía visual.
- Indicador de demo rediseñado.
- Tratamiento amable de enlaces placeholder.
- Fichas individuales con etiquetas legibles.

### Administración
- Panel con mayor jerarquía visual y ayudas contextuales.
- Vista previa de imágenes y acceso directo a enlaces válidos.
- Revisión orientativa del contenido.

## 2.1.0 — 2026-09-07

- Tailwind compilado localmente.
- Build reproducible en `dist/`.
- Rutas limpias con History API.
- SEO, sitemap, RSS, PWA y fichas individuales.
- Panel de administración preparado sin migración de datos.
- Mejoras de contraste, responsive, seguridad y accesibilidad.
