# Roadmap

La demo 3.0 se considera funcionalmente completa como base profesional. Las siguientes etapas son opcionales y corresponden a una implementación real, no a pendientes necesarios para que la plantilla se vea terminada.

## Estado actual — 3.0

- Build estático reproducible.
- Sistema visual consolidado en producción.
- Claro/oscuro con tokens semánticos y contrato de contraste.
- Navegación limpia, responsive y accesible.
- Perfil, publicaciones, investigación, docencia, eventos, blog, galería, podcast y contacto.
- Resumen de Inicio, estados vacíos y acciones de ficha.
- SEO, sitemap, RSS, búsqueda global y fichas individuales.
- PWA opcional mediante configuración.
- Panel de administración humano con borradores, preview y protección de cambios sin guardar.
- Branding, features y secciones centralizados en `portal.config.json`.
- Playwright, axe y visual smoke en GitHub Actions.
- Datos de ejemplo identificados como demostrativos.

## Siguiente etapa opcional — persistencia real

1. Autenticación para administradores.
2. Base de datos para contenido, borradores y publicación.
3. Storage para imágenes, audio y documentos.
4. Roles y permisos.
5. Historial de versiones y restauración.
6. Flujo borrador → revisión → publicación.
7. Auditoría de cambios.

Supabase Auth + Postgres + Storage + RLS es una opción compatible, pero la interfaz no depende de ese proveedor.

## Integraciones académicas opcionales

- ORCID / Crossref para metadatos.
- Importación BibTeX/RIS.
- Exportación de citas en APA/BibTeX.
- Sincronización de publicaciones desde fuentes externas verificadas.
- Métricas respetuosas de privacidad.
- Multi-perfil para departamentos, cuerpos académicos o grupos de investigación.

## Principio de arquitectura

La demo debe seguir funcionando aunque ninguna integración opcional esté conectada. Persistencia e integraciones amplían el producto; nunca deben ser requisito para renderizar la experiencia pública.
