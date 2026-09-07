import { access, readFile } from 'node:fs/promises';

let failures = 0;
const fail = message => { failures++; console.error(`✗ ${message}`); };
const pass = message => console.log(`✓ ${message}`);

for (const path of ['dist/assets/css/contrast-contract.css','dist/assets/js/theme-system.js']) {
  try { await access(path); pass(`${path} existe`); }
  catch { fail(`${path} falta`); }
}

const index = await readFile('dist/index.html','utf8');
const css = await readFile('dist/assets/css/contrast-contract.css','utf8');
const runtime = await readFile('dist/assets/js/theme-system.js','utf8');
const serviceWorker = await readFile('dist/service-worker.js','utf8');

const themePos = index.indexOf('/assets/css/theme-system.css');
const contractPos = index.indexOf('/assets/css/contrast-contract.css');
if (contractPos < 0) fail('El contrato de contraste no está enlazado');
else if (themePos >= 0 && contractPos < themePos) fail('El contrato de contraste carga antes del tema base');
else pass('Contrato de contraste carga al final');

const requiredRules = [
  ['texto blanco protegido', /#app \.text-white\s*\{\s*color:#fff\s*!important/],
  ['slate claro normalizado', /#app \.text-slate-600/],
  ['slate oscuro normalizado', /html\.dark #app \.dark\\:text-slate-300/],
  ['verde de marca legible', /#app \.text-primary-700/],
  ['dorado oscuro legible', /html\.dark #app \.dark\\:text-accent-300/],
  ['estados de color', /dark\\:text-red-300[\s\S]*dark\\:text-green-300/],
  ['texto de botones heredado', /button\.text-white \*/]
];
for (const [label, regex] of requiredRules) {
  if (!regex.test(css)) fail(`Falta ${label}`); else pass(`Contrato incluye ${label}`);
}

if (!runtime.includes('hasIntentionalColor') || !runtime.includes('INTENTIONAL_COLOR')) {
  fail('El runtime todavía puede convertir chips/badges coloreados en metadatos grises');
} else {
  pass('Runtime preserva colores intencionales de chips, badges y controles');
}

if (!serviceWorker.includes('/assets/css/contrast-contract.css') || !/v9-contrast-contract/.test(serviceWorker)) {
  fail('Service Worker no refresca el nuevo contrato de contraste');
} else {
  pass('Service Worker fuerza actualización del contrato de contraste');
}

if (failures) {
  console.error(`\nAuditoría de color falló con ${failures} problema(s).`);
  process.exit(1);
}
console.log('\nAuditoría de color claro/oscuro aprobada.');
