# Sistema visual 3.0

La versión 3.0 usa tokens semánticos en lugar de decidir colores por componente. El objetivo es que una misma jerarquía funcione en claro y oscuro sin reglas contradictorias.

## Tokens principales

- `--ui-canvas`: fondo general.
- `--ui-surface`: tarjetas y superficies.
- `--ui-surface-soft`: superficies secundarias.
- `--ui-heading`: títulos y texto de máxima jerarquía.
- `--ui-text`: texto normal.
- `--ui-muted`: metadatos y ayudas.
- `--ui-link`: enlaces y acciones secundarias.
- `--ui-line`: bordes.
- `--ui-green-2`: acción principal.
- `--ui-gold`: acento de marca.

Los valores claro/oscuro se definen en `assets/css/theme-system.css`. `contrast-contract.css` protege colores intencionales heredados y `product-v3.css` añade únicamente componentes 3.0.

## Componentes semánticos

- `portal-page-title`: título de página.
- `portal-section-heading`: título interno.
- `portal-card-title`: título dentro de tarjetas.
- `portal-meta`: metadatos sin color intencional.
- `portal-home-summary` / `portal-metric`: resumen del Inicio.
- `portal-action`: CTA y acciones rápidas.
- `portal-empty-state`: estado vacío.
- `portal-card-tool`: acción secundaria dentro de una ficha.
- `portal-inline-status`: estado informativo discreto.

## Producción

Los módulos fuente siguen separados para facilitar mantenimiento. `scripts/v3-consolidate.mjs` los combina después del build en `dist/assets/css/portal.css`. El HTML de producción carga un solo CSS local del portal, evitando depender del orden accidental de múltiples hojas.

El admin sigue la misma idea: los módulos fuente se consolidan en `dist/admin/admin-bundle.css` y su runtime en `dist/admin/admin-bundle.js`.

## Reglas

1. No añadir colores hexadecimales a un componente si existe un token equivalente.
2. No crear otra hoja de overrides de modo oscuro; extender los tokens o el componente semántico.
3. Todo control interactivo debe conservar `:focus-visible`.
4. Animaciones deben respetar `prefers-reduced-motion`.
5. Texto pequeño con un color intencional no debe transformarse en `portal-meta`.
6. Probar claro y oscuro antes de aceptar un cambio visual.
