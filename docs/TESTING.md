# Pruebas y control visual

La Fase 3 añade pruebas de navegador reales sobre el build final de `dist/`.

## Comandos

```bash
npm run check
npx playwright install chromium
npm run test:e2e
npm run test:visual
```

`npm run serve` inicia el servidor de prueba en `127.0.0.1:4173` sin depender de un servidor externo.

## E2E

`tests/portal.spec.js` comprueba:

- todas las rutas principales;
- navegación desde el menú;
- resumen profesional del Inicio;
- persistencia claro/oscuro;
- buscador global;
- herramientas de Publicaciones;
- que la demo no conserve un Service Worker activo cuando PWA está desactivada.

`tests/admin.spec.js` comprueba:

- lenguaje de usuario no técnico;
- estado de cambios sin guardar;
- guardado de borradores;
- preview de computadora/celular.

## Accesibilidad

`tests/accessibility.spec.js` ejecuta axe sobre Inicio, Publicaciones, Investigación, Contacto y Admin con reglas WCAG 2 A/AA y 2.1 A/AA. El CI falla ante violaciones `serious` o `critical`.

## Revisión visual

`tests/visual-smoke.spec.js` captura rutas representativas en claro y oscuro usando los proyectos desktop y mobile de Playwright. Las imágenes se adjuntan al artifact `browser-quality` del workflow.

Estas capturas son deliberadamente un **visual smoke review**, no un baseline binario rígido. La geometría y contraste crítico se protegen además con la auditoría estructural y axe. Si el proyecto adopta snapshots pixel-perfect en el futuro, los PNG base deben generarse y revisarse explícitamente antes de versionarlos.

## Antes de fusionar

1. `npm run check` en verde.
2. E2E en verde.
3. axe sin violaciones serias/críticas.
4. Revisar artifacts visuales si hubo cambios de UI.
5. Verificar Inicio, Publicaciones, Contacto y Admin en claro/oscuro.
