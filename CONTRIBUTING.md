# Contribuir

Gracias por mejorar Academic Professional Portal.

## Flujo recomendado

1. Crea una rama desde `main`.
2. Mantén los cambios enfocados y compatibles con la demo sin backend.
3. Ejecuta `npm run check` antes de abrir un Pull Request.
4. No incluyas credenciales, tokens, datos personales sensibles ni secretos.
5. Si cambias la estructura de `CMS_CONTENT`, conserva compatibilidad con el Admin Studio y el build extractor.

## Criterios de aceptación

- Sin regresiones responsive ni overflow horizontal.
- Navegación por teclado funcional.
- Sin dependencia de Tailwind CDN en producción.
- `/admin` no debe publicar sin autenticación/backend real.
- Los datos de muestra pueden mantenerse, pero deben estar claramente identificados como demo.
- El build y Quality Gate deben terminar correctamente.

## Commits

Usa mensajes breves y descriptivos, por ejemplo:

- `Improve publication cards`
- `Fix mobile sidebar overflow`
- `Add academic profile schema`

## Pull Requests

Incluye:

- qué problema resuelve;
- qué se modificó;
- cómo se probó;
- capturas si hay cambios visuales;
- riesgos o compatibilidad relevante.
