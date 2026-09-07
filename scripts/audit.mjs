import { access, readFile, stat } from 'node:fs/promises';

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

const index = await readFile('dist/index.html','utf8');
const app = await readFile('dist/assets/js/app.js','utf8');
const content = await readFile('dist/assets/data/content.js','utf8');
const admin = await readFile('dist/admin/index.html','utf8');
const manifest = await readFile('dist/manifest.webmanifest','utf8');
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

if (failures) {
  console.error(`\nAuditoría falló con ${failures} problema(s).`);
  process.exit(1);
}
console.log('\nAuditoría estructural aprobada.');
