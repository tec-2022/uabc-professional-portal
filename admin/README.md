# Admin Studio — modo preparación

Este directorio prepara el panel administrativo del portal **sin migrar el contenido actual y sin conectar un backend**.

## Estado actual

- Ruta: `/admin`
- Lee una copia de `window.CMS_CONTENT` desde el portal público.
- Permite editar todas las secciones detectadas en esa estructura.
- Guarda borradores únicamente en `localStorage` del navegador.
- Permite importar y exportar el contenido como JSON.
- Incluye previsualización del borrador usando el renderer público existente.
- El botón **Publicar** permanece deshabilitado deliberadamente.
- El portal público continúa leyendo el contenido embebido actual de `assets/js/app.js`.

## Qué NO hace

- No migra información a Supabase ni a otra base de datos.
- No modifica `CMS_CONTENT` del sitio público.
- No sube imágenes ni archivos a Storage.
- No incluye autenticación ficticia del lado del cliente.
- No publica borradores.

## Preparado para la fase de backend

Cuando se decida activar administración real, la capa local puede sustituirse por un adaptador de persistencia con:

1. Supabase Auth para acceso de administradores.
2. Postgres para contenido estructurado y versiones.
3. Storage para imágenes, CV, documentos y audio.
4. RLS para impedir escrituras no autorizadas.
5. Estados `draft` / `published` y auditoría de cambios.
6. Migración controlada de `window.CMS_CONTENT` sólo cuando se autorice.

La interfaz del editor está desacoplada de la persistencia: el objetivo es que esa fase cambie el origen/destino de datos, no que obligue a rehacer el panel.
