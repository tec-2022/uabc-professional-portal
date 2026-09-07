import { access, readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

let failures = 0;
const fail = message => { failures++; console.error(`✗ ${message}`); };
const pass = message => console.log(`✓ ${message}`);

const required = [
  'dist/assets/css/theme-system.css',
  'dist/assets/js/theme-system.js',
  'dist/admin/admin-consistency.css'
];
for (const path of required) {
  try { await access(path); pass(`${path} existe`); }
  catch { fail(`${path} falta`); }
}

try {
  execFileSync(process.execPath, ['--check', 'dist/assets/js/theme-system.js'], { stdio:'pipe' });
  pass('theme-system.js tiene sintaxis válida');
} catch (error) {
  fail(`theme-system.js contiene JavaScript inválido: ${error?.stderr?.toString?.().trim() || 'error desconocido'}`);
}

const index = await readFile('dist/index.html', 'utf8');
const themeCss = await readFile('dist/assets/css/theme-system.css', 'utf8');
const themeJs = await readFile('dist/assets/js/theme-system.js', 'utf8');
const enhancementsCss = await readFile('dist/assets/css/enhancements.css', 'utf8');
const admin = await readFile('dist/admin/index.html', 'utf8');
const serviceWorker = await readFile('dist/service-worker.js', 'utf8');

const showcasePos = index.indexOf('/assets/css/showcase.css');
const themePos = index.indexOf('/assets/css/theme-system.css');
if (themePos < 0) fail('theme-system.css no está enlazado en el portal');
else if (showcasePos >= 0 && themePos < showcasePos) fail('theme-system.css no carga después de showcase.css');
else pass('Sistema visual final carga al final de las capas públicas');

if (!index.includes('/assets/js/theme-system.js')) fail('theme-system.js no está enlazado');
else pass('Runtime semántico de tipografía está activo');

if (/Professional academic presentation layer/.test(enhancementsCss)) {
  fail('La capa visual heredada conflictiva sigue presente en producción');
} else {
  pass('Capa visual heredada conflictiva retirada del bundle final');
}

const darkChecks = [
  ['html.dark main', /html\.dark\s+main/],
  ['search oscuro', /html\.dark[\s\S]*\.search-input|\.search-panel[\s\S]*var\(--ui-surface\)/],
  ['formularios oscuros', /html\.dark\s+#app\s+input/],
  ['superficies semánticas', /--ui-surface:#111827/]
];
for (const [label, regex] of darkChecks) {
  if (!regex.test(themeCss)) fail(`Falta regla de ${label}`); else pass(`Tema incluye ${label}`);
}

for (const className of ['portal-profile-name','portal-page-title','portal-page-intro','portal-section-heading','portal-card-title']) {
  if (!themeJs.includes(className) || !themeCss.includes(`.${className}`)) fail(`Falta semántica ${className}`);
  else pass(`Jerarquía ${className} definida`);
}

if (!/\.portal-page-title[\s\S]*text-align:left\s*!important/.test(themeCss)) {
  fail('Los títulos principales no están normalizados a una alineación común');
} else {
  pass('Títulos principales comparten alineación y jerarquía');
}

if (!admin.includes('/admin/admin-consistency.css')) fail('El admin no carga la capa final de consistencia');
else pass('Admin carga la capa final de consistencia');

if (!serviceWorker.includes('/assets/css/theme-system.css') || !serviceWorker.includes('/assets/js/theme-system.js')) {
  fail('Service Worker no conoce los assets del sistema visual final');
} else {
  pass('Service Worker incluye los assets de tema y tipografía');
}

const routeTemplates = ['eventos','publicaciones','investigacion','docencia','blog','galeria','contacto','podcast','privacidad','cookies'];
for (const id of routeTemplates) {
  const pattern = new RegExp(`<template\\s+id=["']${id}["'][\\s\\S]*?<\\/template>`, 'i');
  const match = index.match(pattern)?.[0] || '';
  if (!/<h2\b/i.test(match)) fail(`La sección ${id} no tiene título h2`);
}
if (!failures) pass('Todas las secciones principales conservan un título semántico h2');

if (failures) {
  console.error(`\nAuditoría visual falló con ${failures} problema(s).`);
  process.exit(1);
}
console.log('\nAuditoría de tipografía y tema aprobada.');
