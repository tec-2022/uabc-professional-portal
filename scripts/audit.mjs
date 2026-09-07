import { access, readFile, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

let failures = 0;
const pass = message => console.log(`✓ ${message}`);
const fail = message => { failures++; console.error(`✗ ${message}`); };

const required = [
  'dist/index.html','dist/admin/index.html','dist/assets/css/portal.css','dist/assets/js/product-v3.js',
  'dist/assets/data/content.js','dist/assets/data/content.json','dist/assets/data/search-index.json','dist/assets/data/site-config.js',
  'dist/admin/admin-bundle.css','dist/admin/admin-bundle.js','dist/manifest.webmanifest','dist/service-worker.js',
  'dist/sitemap.xml','dist/feed.xml','dist/offline.html','dist/template-info.json'
];
for (const file of required) {
  try { await access(file); pass(`${file} existe`); } catch { fail(`${file} falta`); }
}

const jsFiles = [
  'dist/assets/js/app.js','dist/assets/js/enhancements.js','dist/assets/js/showcase.js','dist/assets/js/theme-system.js',
  'dist/assets/js/product-v3.js','dist/assets/js/pwa-cleanup.js','dist/service-worker.js','dist/admin/admin-bundle.js'
];
for (const file of jsFiles) {
  try { execFileSync(process.execPath,['--check',file],{stdio:'pipe'}); pass(`${file} tiene sintaxis válida`); }
  catch (error) { fail(`${file} contiene JavaScript inválido: ${error?.stderr?.toString?.().split('\n').slice(-2).join(' ') || 'error'}`); }
}

const config = JSON.parse(await readFile('portal.config.json','utf8'));
const index = await readFile('dist/index.html','utf8');
const app = await readFile('dist/assets/js/app.js','utf8');
const enhancements = await readFile('dist/assets/js/enhancements.js','utf8');
const content = await readFile('dist/assets/data/content.js','utf8');
const portalCss = await readFile('dist/assets/css/portal.css','utf8');
const product = await readFile('dist/assets/js/product-v3.js','utf8');
const admin = await readFile('dist/admin/index.html','utf8');
const adminJs = await readFile('dist/admin/admin-bundle.js','utf8');
const serviceWorker = await readFile('dist/service-worker.js','utf8');
const vercel = await readFile('vercel.json','utf8');
const templateInfo = JSON.parse(await readFile('dist/template-info.json','utf8'));
const cssSize = (await stat('dist/assets/css/portal.css')).size;

if (config.template?.version !== '3.0.0') fail('portal.config.json no declara la versión 3.0.0'); else pass('Versión 3.0.0 declarada');
if (!config.branding?.profile?.name?.es || !config.branding?.colors?.primary) fail('Branding central incompleto'); else pass('Branding centralizado');
if (!templateInfo.sampleData || templateInfo.mode !== 'demo') fail('La demo no declara sampleData/mode correctamente'); else pass('Modo demo explícito');

if (/cdn\.tailwindcss\.com/.test(index)) fail('Producción aún usa Tailwind CDN'); else pass('Tailwind CDN eliminado');
if (/tu-dominio\.com/.test(index)) fail('Canonical placeholder presente'); else pass('Canonical real configurado');
if (/sitio web oficial/i.test(index)) fail('La demo se presenta como sitio oficial'); else pass('Metadata honesta de demo');
if (!index.includes('template-demo-notice')) fail('Falta indicador de datos demo'); else pass('Indicador demo presente');

const localCssLinks = [...index.matchAll(/<link[^>]+href=["']([^"']+\.css)["']/gi)].map(match => match[1]).filter(href => !/^https?:/i.test(href));
if (localCssLinks.length !== 1 || !localCssLinks[0].endsWith('/assets/css/portal.css')) {
  fail(`El portal carga CSS local fragmentado: ${localCssLinks.join(', ') || 'ninguno'}`);
} else pass('Un único bundle CSS local gobierna el portal');
if (cssSize < 25000) fail('portal.css parece incompleto'); else pass(`portal.css consolidado: ${Math.round(cssSize/1024)} KB`);

for (const token of ['--ui-canvas','--ui-heading','html.dark',':focus-visible','prefers-reduced-motion','.portal-empty-state','.portal-home-summary']) {
  if (!portalCss.includes(token)) fail(`portal.css no contiene ${token}`);
}
if (!failures) pass('Tema, contraste, componentes y accesibilidad visual consolidados');

if (!/window\.PORTAL_CONTENT/.test(content)) fail('Contenido externo no generado'); else pass('Contenido separado de la lógica');
if (!app.includes('window.CMS_CONTENT = window.CMS_CONTENT || window.PORTAL_CONTENT || {};')) fail('app.js no consume contenido externo'); else pass('app.js consume contenido externo');
if (!app.includes('CLEAN_ROUTE_PATHS') || !app.includes('history.pushState') || !app.includes("window.addEventListener('popstate', render)")) fail('Router limpio no está activo'); else pass('Router path-native activo');
if (/function armRoute\(|function cleanRoute\(/.test(enhancements)) fail('enhancements.js conserva un segundo router'); else pass('No hay router paralelo en producción');

if (!index.includes('/assets/data/site-config.js') || !index.includes('/assets/js/product-v3.js')) fail('Runtime de producto 3.0 no está enlazado'); else pass('Runtime de producto 3.0 activo');
if (!product.includes('portal-home-summary') || !product.includes('portal-empty-state') || !product.includes('Copiar referencia')) fail('Faltan mejoras visibles de producto'); else pass('Métricas, estados vacíos y herramientas de publicación activos');

if (/Importar JSON|Exportar JSON|Admin Studio|Modo preparación|Sin migración/i.test(admin)) fail('Admin expone terminología técnica'); else pass('Admin mantiene lenguaje humano');
if (!/class="btn publish"[^>]*disabled/.test(admin)) fail('Admin permite publicar sin backend'); else pass('Publicación segura: desactivada sin backend');
if (!admin.includes('/admin/admin-bundle.css') || !admin.includes('/admin/admin-bundle.js')) fail('Admin no usa bundles consolidados'); else pass('Admin consolidado en un CSS y un runtime');
if (!adminJs.includes('admin-save-state') || !adminJs.includes('beforeunload')) fail('Admin no protege cambios sin guardar'); else pass('Admin protege cambios sin guardar');

if (config.features?.pwa === false) {
  if (!index.includes('/assets/js/pwa-cleanup.js')) fail('PWA desactivada sin cleanup'); else pass('PWA opcional: cleanup activo en demo');
  if (/serviceWorker\.register/.test(enhancements)) fail('Demo todavía registra Service Worker'); else pass('Demo no registra Service Worker');
} else if (!/academic-portal-v3/.test(serviceWorker)) fail('Service Worker 3.0 no está listo');

if (!/no-cache, max-age=0, must-revalidate/.test(vercel)) fail('Assets de aplicación no fuerzan revalidación'); else pass('Vercel revalida assets mutables');
if ((index.match(/href="#\/contacto"/g) || []).length > 1) fail('Contacto está duplicado en el menú'); else pass('Menú sin duplicados');

if (failures) {
  console.error(`\nQuality Gate 3.0 falló con ${failures} problema(s).`);
  process.exit(1);
}
console.log('\nQuality Gate 3.0 aprobado.');
