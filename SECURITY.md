# Seguridad

## Estado actual
El portal público es estático. `/admin` está en modo preparación: no existe una operación de publicación ni un backend al que pueda escribir.

## Reporte de vulnerabilidades
Si detectas una vulnerabilidad, evita publicar credenciales, datos personales o pasos de explotación en un issue público. Contacta al responsable del repositorio por un canal privado de GitHub cuando esté disponible.

## Controles incluidos
- Content Security Policy y headers defensivos desde Vercel.
- `X-Robots-Tag` y `no-store` para `/admin`.
- Botón Publicar deshabilitado mientras no haya backend y autenticación real.
- Sin claves API ni secretos en el repositorio.
- Service Worker limitado a peticiones GET del mismo origen.

## Fase futura
Al activar Supabase: Auth, MFA cuando aplique, RLS por defecto, Storage con políticas explícitas, auditoría de cambios, versiones y separación `draft/published`.
