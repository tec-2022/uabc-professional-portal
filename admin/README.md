# Panel de administración — modo demo

Este directorio contiene la interfaz administrativa de la plantilla. Está diseñada para sentirse como un panel real sin fingir una capa de publicación que todavía no existe.

## Estado actual

- Ruta: `/admin`
- Lee una copia del contenido que utiliza el portal público.
- Presenta etiquetas y ayudas comprensibles para usuarios no técnicos.
- Permite editar todas las secciones detectadas.
- Incluye campos bilingües ES/EN.
- Muestra vista previa de imágenes y acceso directo a enlaces válidos.
- Resume los elementos de listas por título o nombre cuando es posible.
- Guarda borradores en `localStorage` del navegador.
- Permite cargar y descargar copias desde **Más opciones**.
- Incluye vista previa en tamaño computadora o celular.
- Revisa campos pendientes, traducciones incompletas y posibles repeticiones.
- La publicación permanece deshabilitada deliberadamente.

## Límites de la demo

- No migra información a Supabase ni a otra base de datos.
- No modifica el contenido publicado.
- No sube imágenes o documentos a un servicio remoto.
- No incluye autenticación ficticia del lado del cliente.
- No publica borradores.

## Evolución opcional

Cuando se active una administración real, la capa local puede sustituirse por un adaptador de persistencia con:

1. autenticación para administradores;
2. base de datos para contenido y versiones;
3. almacenamiento para imágenes, CV, documentos y audio;
4. roles y permisos;
5. estados de borrador/publicado y auditoría de cambios;
6. migración controlada del contenido únicamente cuando se autorice.

La interfaz está desacoplada de la persistencia: conectar un backend no debe obligar a reconstruir el panel.
