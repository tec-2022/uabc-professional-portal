import { readFile, writeFile, readdir, unlink, access } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const config = JSON.parse(await readFile(join(ROOT, 'portal.config.json'), 'utf8'));
const pwaEnabled = config.features?.pwa !== false;

const publicCssModules = [
  'tailwind.css',
  'styles.css',
  'layout-fixes.css',
  'enhancements.css',
  'template-demo.css',
  'presentation-refinement.css',
  'showcase.css',
  'theme-system.css',
  'contrast-contract.css',
  'product-v3.css'
];
const adminCssModules = [
  'admin.css','admin-enhancements.css','admin-friendly.css','admin-pro.css','admin-consistency.css','admin-v3.css'
];
const adminJsModules = ['admin.js','dashboard.js','admin-friendly.js','admin-pro.js','admin-v3.js'];

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

async function bundleFiles(directory, names, output, banner) {
  const parts = [];
  for (const name of names) {
    const path = join(directory, name);
    if (!(await exists(path))) continue;
    parts.push(`/* ---- ${name} ---- */\n${await readFile(path, 'utf8')}`);
  }
  await writeFile(join(directory, output), `${banner}\n${parts.join('\n\n')}\n`, 'utf8');
}

function stripStyles(html, names) {
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    html = html.replace(new RegExp(`\\s*<link[^>]+href=["'][^"']*${escaped}["'][^>]*>`, 'gi'), '');
  }
  return html;
}

function stripScripts(html, names) {
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    html = html.replace(new RegExp(`\\s*<script[^>]+src=["'][^"']*${escaped}["'][^>]*><\\/script>`, 'gi'), '');
  }
  return html;
}

async function collectDetailPages(dir, result = []) {
  for (const entry of await readdir(dir, { withFileTypes:true })) {
    if (['admin','assets'].includes(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await collectDetailPages(path, result);
    else if (entry.name === 'index.html' && path !== join(DIST,'index.html')) result.push(path);
  }
  return result;
}

await bundleFiles(
  join(DIST,'assets/css'),
  publicCssModules,
  'portal.css',
  '/* Academic Professional Portal 3.0 — consolidated production stylesheet */'
);
await bundleFiles(
  join(DIST,'admin'),
  adminCssModules,
  'admin-bundle.css',
  '/* Academic Professional Portal 3.0 — consolidated admin stylesheet */'
);
await bundleFiles(
  join(DIST,'admin'),
  adminJsModules,
  'admin-bundle.js',
  '/* Academic Professional Portal 3.0 — consolidated admin runtime */'
);

await writeFile(join(DIST,'assets/data/site-config.js'), `window.PORTAL_CONFIG = ${JSON.stringify(config, null, 2)};\n`, 'utf8');

let index = await readFile(join(DIST,'index.html'),'utf8');
index = stripStyles(index, publicCssModules);
if (!index.includes('/assets/css/portal.css')) index = index.replace('</head>', '  <link rel="stylesheet" href="/assets/css/portal.css">\n</head>');
if (!index.includes('/assets/data/site-config.js')) index = index.replace('</head>', '  <script src="/assets/data/site-config.js"></script>\n</head>');
if (!index.includes('/assets/js/product-v3.js')) index = index.replace('</body>', '  <script src="/assets/js/product-v3.js" defer></script>\n</body>');

if (!pwaEnabled) {
  if (!index.includes('/assets/js/pwa-cleanup.js')) index = index.replace('</body>', '  <script src="/assets/js/pwa-cleanup.js" defer></script>\n</body>');
  const enhancementsPath = join(DIST,'assets/js/enhancements.js');
  let enhancements = await readFile(enhancementsPath,'utf8');
  enhancements = enhancements.replace(/\(\(\) => \{\s*'use strict';\s*if \(!\('serviceWorker' in navigator\)[\s\S]*?serviceWorker\.register\('\/service-worker\.js'\)[\s\S]*?\}\);\s*\}\)\(\);?/m, '');
  await writeFile(enhancementsPath, enhancements, 'utf8');
}
await writeFile(join(DIST,'index.html'), index, 'utf8');

for (const path of await collectDetailPages(DIST)) {
  let html = await readFile(path,'utf8');
  if (!html.includes('detail-page')) continue;
  html = stripStyles(html, publicCssModules);
  if (!html.includes('/assets/css/portal.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/assets/css/portal.css"></head>');
  await writeFile(path, html, 'utf8');
}

const adminPath = join(DIST,'admin/index.html');
let admin = await readFile(adminPath,'utf8');
admin = stripStyles(admin, adminCssModules);
admin = stripScripts(admin, adminJsModules);
admin = admin.replace('</head>', '  <link rel="stylesheet" href="/admin/admin-bundle.css">\n</head>');
admin = admin.replace('</body>', '  <script src="/admin/admin-bundle.js"></script>\n</body>');
await writeFile(adminPath, admin, 'utf8');

const sw = `const CACHE='academic-portal-v3';\nconst CORE=['/','/offline.html','/manifest.webmanifest','/assets/css/portal.css','/assets/js/app.js','/assets/js/enhancements.js','/assets/js/product-v3.js','/assets/data/content.js','/assets/data/site-config.js','/assets/data/search-index.json'];\nconst networkFirst=async request=>{const cache=await caches.open(CACHE);try{const response=await fetch(request,{cache:'no-cache'});if(response?.ok) await cache.put(request,response.clone());return response;}catch{return (await cache.match(request))||(request.mode==='navigate'?await cache.match('/offline.html'):Response.error());}};\nself.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));\nself.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys()) if(key!==CACHE) await caches.delete(key);await self.clients.claim();})()));\nself.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(networkFirst(event.request));});\n`;
await writeFile(join(DIST,'service-worker.js'), sw, 'utf8');

console.log(`Phase 3 consolidada: portal.css + admin bundles; PWA ${pwaEnabled ? 'activa' : 'desactivada para la demo'}.`);
