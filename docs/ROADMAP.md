# Roadmap

El portal ya funciona como una demo profesional completa. Las siguientes etapas son opcionales y están pensadas para una implementación real, no para completar la demo.

## Estado actual — 2.2

- Build estático reproducible.
- Tailwind compilado localmente.
- Navegación limpia y responsive.
- Perfil, publicaciones, investigación, docencia, eventos, blog, galería y podcast.
- SEO, sitemap, RSS, PWA y búsqueda global.
- Fichas individuales generadas en build.
- Panel de administración amigable con borradores locales y vista previa.
- Datos de ejemplo claramente identificados.
- Quality Gate en GitHub Actions.

## Siguiente etapa opcional — persistencia real

1. Autenticación para administradores.
2. Base de datos para contenido y borradores.
3. Storage para imágenes, audio y documentos.
4. Roles y permisos.
5. Historial de versiones y restauración.
6. Publicación con revisión previa.
7. Auditoría de cambios.

Una implementación recomendada puede usar Supabase Auth + Postgres + Storage + RLS, aunque la interfaz no depende de ese proveedor.

## Después de persistencia

- Edición colaborativa.
- Flujo autor → revisor → publicación.
- Integración ORCID / Crossref para metadatos académicos.
- Importación BibTeX/RIS.
- Métricas de contenido y visitas con una solución respetuosa de privacidad.
- Multi-perfil para departamentos, cuerpos académicos o grupos de investigación.

## Principio de arquitectura

La demo debe seguir funcionando aunque ninguna integración opcional esté conectada. La capa de persistencia amplía el producto; no debe convertirse en un requisito para renderizar el portal público.
