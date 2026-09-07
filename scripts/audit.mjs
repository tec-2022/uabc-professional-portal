import { access, readFile, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const mustExist = [
  'dist/index.html','dist/admin/index.html','dist/assets/css/tailwind.css','dist/assets/css/template-demo.css',
  'dist/assets/data/content.js','dist/assets/data/content.json','dist/assets/data/search-index.json',
  'dist/manifest.webmanifest','dist/service-worker.js','dist/sitemap.xml','dist/feed.xml','dist/offline.html',
  'dist/template-info.json'
];
let failures = 0;
const fail = message => { failures++; console.error(`✗ ${message}`); };
const pass = message => console.log(`✓ ${message}`);

for (const file of mustExist) {
  try { await access(file); pass(`${file} existe`); } catch { fail(`${file} falta`); }
}

for (const file of ['dist/assets/js/app.js','dist/assets/js/enhancements.js','dist/service-worker.js']) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio:'pipe' });
    pass(`${file} tiene sintaxis JavaScript válida`);
  } catch (error) {
    const detail = error?.stderr?.toString?.().trim();
    fail(`${file} contiene JavaScript inválido${detail ? `: ${detail.split('\n').slice(-3).join(' ')}` : ''}`);
  }
}

const index = await readFile('dist/index.html','utf8');
const app = await readFile('dist/assets/js/app.js','utf8');
const enhancements = await readFile('dist/assets/js/enhancements.js','utf8');
const content = await readFile('dist/assets/data/content.js','utf8');
const admin = await readFile('dist/admin/index.html','utf8');
const manifest = await readFile('dist/manifest.webmanifest','utf8');
const serviceWorker = await readFile('dist/service-worker.js','utf8');
const vercel = await readFile('vercel.json','utf8');
const templateInfo = JSON.parse(await readFile('dist/template-info.json','utf8'));
const cssSize = (await stat('dist/assets/css/tailwind.css')).size;

if (/cdn\.tailwindcss\.com/.test(index)) fail('Producción aún depende de Tailwind CDN'); else pass('Tailwind CDN eliminado de producción');
if (/tu-dominio\.com/.test(index)) fail('Canonical placeholder sigue presente'); else pass('Canonical real configurado');
if (!/window\.PORTAL_CONTENT/.test(content)) fail('Contenido externo no generado'); else pass('Contenido CMS separado en build');
const externalCmsMarker = 'window.CMS_CONTENT = window.CMS_CONTENT || window.PORTAL_CONTENT || {};';
if (!app.includes(externalCmsMarker)) fail('app.js no consume la capa de datos externa'); else pass('app.js consume la capa de datos externa');
if ((index.match(/href="#\/contacto"/g) || []).length > 1) fail('Contacto sigue duplicado'); else pass('Menú sin Contacto duplicado');
if (!/disabled[^>]*title="Se habilitará/.test(admin) && !/class="btn publish"[^>]*disabled/.test(admin)) fail('Publicar del admin no está bloqueado'); else pass('Admin sigue sin publicar sin backend');
if (cssSize < 10000) fail('Tailwind compilado parece demasiado pequeño'); else pass(`Tailwind compilado: ${Math.round(cssSize/1024)} KB`);
if (/sitio web oficial/i.test(index)) fail('La demo todavía se presenta como sitio oficial'); else pass('Metadata identifica una plantilla/demo, no un sitio oficial');
if (!/template-demo-notice/.test(index)) fail('Falta indicador discreto de datos demo'); else pass('Demo identifica visualmente los datos de ejemplo');
if (!templateInfo.sampleData || templateInfo.mode !== 'demo') fail('template-info.json no declara modo demo con sample data'); else pass('Modo demo/sample data declarado');
if (/Dr\. Eduardo Ahumada-Tello/i.test(manifest)) fail('Manifest PWA sigue ligado al perfil de muestra'); else pass('Manifest PWA desacoplado de los datos de muestra');

if (!app.includes('CLEAN_ROUTE_PATHS') || !app.includes('history.pushState') || !app.includes("window.addEventListener('popstate', render)")) {
  fail('app.js no contiene el router path-native esperado');
} else {
  pass('app.js controla navegación limpia con History API');
}
if (/function armRoute\(|function cleanRoute\(/.test(enhancements)) fail('enhancements.js todavía contiene un router paralelo'); else pass('No existe un segundo router en enhancements.js');

if (/uabc-portal-v2/.test(serviceWorker) || !/networkFirst/.test(serviceWorker) || !/cache:\s*'no-cache'/.test(serviceWorker)) fail('Service Worker puede servir bundles JS/CSS obsoletos'); else pass('Service Worker prioriza bundles frescos y versiona su caché');
if (!/assets\/js\/\(\.\*\)[\s\S]*no-cache, max-age=0, must-revalidate/.test(vercel)) fail('Vercel permite cachear JavaScript de la app demasiado tiempo'); else pass('JavaScript de aplicación se revalida en cada actualización');

if (failures) {
  console.error(`\nAuditoría falló con ${failures} problema(s).`);
  process.exit(1);
}
console.log('\nAuditoría estructural aprobada.');
