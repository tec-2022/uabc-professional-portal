import { access, readFile, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

let failures = 0;
const pass = message => console.log(`✓ ${message}`);
const fail = message => { failures++; console.error(`✗ ${message}`); };

const required = [
  'dist/assets/css/portal.css',
  'dist/assets/js/product-v3.js',
  'dist/assets/data/site-config.js',
  'dist/admin/admin-bundle.css',
  'dist/admin/admin-bundle.js'
];
for (const path of required) {
  try { await access(path); pass(`${path} existe`); } catch { fail(`${path} falta`); }
}

for (const path of ['dist/assets/js/product-v3.js','dist/admin/admin-bundle.js','dist/assets/js/pwa-cleanup.js']) {
  try { execFileSync(process.execPath,['--check',path],{stdio:'pipe'}); pass(`${path} tiene sintaxis válida`); }
  catch { fail(`${path} contiene JavaScript inválido`); }
}

const config = JSON.parse(await readFile('portal.config.json','utf8'));
const index = await readFile('dist/index.html','utf8');
const portalCss = await readFile('dist/assets/css/portal.css','utf8');
const product = await readFile('dist/assets/js/product-v3.js','utf8');
const enhancements = await readFile('dist/assets/js/enhancements.js','utf8');
const admin = await readFile('dist/admin/index.html','utf8');
const adminJs = await readFile('dist/admin/admin-bundle.js','utf8');
const cssSize = (await stat('dist/assets/css/portal.css')).size;

if (config.template?.version !== '3.0.0') fail('La configuración no declara versión 3.0.0'); else pass('Configuración 3.0 activa');
if (!config.branding?.profile?.name?.es || !config.branding?.colors?.primary) fail('Branding central incompleto'); else pass('Branding centralizado');

const legacyCss = ['tailwind.css','styles.css','layout-fixes.css','enhancements.css','presentation-refinement.css','showcase.css','theme-system.css','contrast-contract.css','product-v3.css'];
const loadedLegacy = legacyCss.filter(name => new RegExp(`<link[^>]+${name.replace('.','\\.')}`,'i').test(index));
if (loadedLegacy.length) fail(`Producción todavía carga CSS fragmentado: ${loadedLegacy.join(', ')}`); else pass('Portal público carga un único bundle CSS local');
if (!index.includes('/assets/css/portal.css')) fail('portal.css no está enlazado'); else pass('portal.css enlazado');
if (cssSize < 25000) fail('portal.css parece incompleto'); else pass(`portal.css consolidado (${Math.round(cssSize/1024)} KB)`);

if (!index.includes('/assets/data/site-config.js') || !index.includes('/assets/js/product-v3.js')) fail('Runtime 3.0 incompleto'); else pass('Config + runtime 3.0 enlazados');
if (!product.includes('portal-home-summary') || !product.includes('portal-empty-state') || !product.includes('Copiar referencia')) fail('Faltan componentes de producto 3.0'); else pass('Métricas, estados vacíos y referencias activos');
if (!portalCss.includes(':focus-visible') || !portalCss.includes('prefers-reduced-motion')) fail('Faltan contratos de accesibilidad visual'); else pass('Focus y reduced-motion protegidos');

if (config.features?.pwa === false) {
  if (!index.includes('/assets/js/pwa-cleanup.js')) fail('La demo desactiva PWA pero no limpia workers anteriores'); else pass('Demo limpia Service Workers anteriores');
  if (/serviceWorker\.register/.test(enhancements)) fail('La demo todavía registra el Service Worker'); else pass('PWA realmente desactivada en el runtime demo');
}

if (!admin.includes('/admin/admin-bundle.css') || !admin.includes('/admin/admin-bundle.js')) fail('Admin no usa bundles consolidados'); else pass('Admin usa bundles consolidados');
if (/admin-(friendly|pro|consistency|v3)\.css/.test(admin)) fail('Admin aún carga CSS fragmentado'); else pass('CSS del admin consolidado');
if (!adminJs.includes('admin-save-state') || !adminJs.includes('beforeunload')) fail('Admin no protege cambios sin guardar'); else pass('Admin protege y comunica cambios sin guardar');

if (failures) {
  console.error(`\nPhase 3 audit falló con ${failures} problema(s).`);
  process.exit(1);
}
console.log('\nPhase 3 product audit aprobado.');
