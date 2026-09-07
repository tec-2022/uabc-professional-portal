import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const BASE_URL = 'https://prueba-pi-eight.vercel.app';
const ROUTE_PATHS = {
  home:'/', eventos:'/eventos', publicaciones:'/publicaciones', investigacion:'/investigacion',
  docencia:'/docencia', blog:'/blog', galeria:'/galeria', podcast:'/podcast', contacto:'/contacto',
  privacidad:'/privacidad', cookies:'/cookies'
};

const read = path => readFile(join(ROOT, path), 'utf8');
const out = path => join(DIST, path);
const ensure = path => mkdir(dirname(out(path)), { recursive:true });

function findObjectLiteral(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) throw new Error(`No se encontró el marcador: ${marker}`);
  const start = source.indexOf('{', markerIndex);
  if (start < 0) throw new Error('No se encontró el inicio de CMS_CONTENT.');

  let depth = 0, quote = null, escape = false, lineComment = false, blockComment = false;
  for (let i = start; i < source.length; i++) {
    const c = source[i], n = source[i + 1];
    if (lineComment) { if (c === '\n') lineComment = false; continue; }
    if (blockComment) { if (c === '*' && n === '/') { blockComment = false; i++; } continue; }
    if (quote) {
      if (escape) { escape = false; continue; }
      if (c === '\\') { escape = true; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '/' && n === '/') { lineComment = true; i++; continue; }
    if (c === '/' && n === '*') { blockComment = true; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '{') depth++;
    if (c === '}') {
      depth--;
      if (depth === 0) return { start, end:i, literal:source.slice(start, i + 1), markerIndex };
    }
  }
  throw new Error('CMS_CONTENT tiene llaves sin balancear.');
}

function localized(value) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(localized).filter(Boolean).join(' · ');
  if (typeof value === 'object' && ('es' in value || 'en' in value)) return localized(value.es ?? value.en);
  return '';
}

function compactText(value, limit = 800) {
  const parts = [];
  const walk = node => {
    if (parts.join(' ').length >= limit || node == null) return;
    if (typeof node === 'string' || typeof node === 'number') { parts.push(String(node)); return; }
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (typeof node === 'object') {
      if ('es' in node || 'en' in node) { parts.push(localized(node)); return; }
      Object.values(node).forEach(walk);
    }
  };
  walk(value);
  return parts.join(' ').replace(/\s+/g, ' ').trim().slice(0, limit);
}

function titleFor(record, fallback = 'Contenido académico') {
  for (const key of ['title','titulo','name','label','topic','course','project','type']) {
    const text = localized(record?.[key]);
    if (text) return text;
  }
  const text = compactText(record, 120);
  return text || fallback;
}

function slugify(value) {
  return localized(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0, 90) || 'registro';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function recordEntries(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return [];
  return Object.entries(record).filter(([, value]) => value != null && localized(value) !== '').map(([key, value]) => [key, localized(value) || compactText(value, 500)]);
}

function sectionRecords(content, section) {
  const value = content?.[section];
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];
  for (const key of ['items','projects','posts','episodes','publications','entries','articles']) {
    if (Array.isArray(value[key])) return value[key];
  }
  return [];
}

function detailHtml(section, record, url) {
  const title = titleFor(record);
  const summary = localized(record?.abstract || record?.description || record?.desc || record?.summary || '') || compactText(record, 300);
  const rows = recordEntries(record).map(([key, value]) => {
    const isUrl = /^https?:\/\//i.test(value);
    const rendered = isUrl ? `<a href="${escapeHtml(value)}" rel="noopener noreferrer">${escapeHtml(value)}</a>` : escapeHtml(value);
    return `<dt>${escapeHtml(key.replace(/[_-]/g,' '))}</dt><dd>${rendered}</dd>`;
  }).join('');
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)} · Portal Académico</title><meta name="description" content="${escapeHtml(summary.slice(0,160))}"><link rel="canonical" href="${BASE_URL}${url}"><meta property="og:type" content="article"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(summary.slice(0,180))}"><meta property="og:url" content="${BASE_URL}${url}"><link rel="stylesheet" href="/assets/css/tailwind.css"><link rel="stylesheet" href="/assets/css/enhancements.css"><meta name="theme-color" content="#083321"></head><body class="detail-page"><main class="detail-shell"><a class="detail-back" href="${ROUTE_PATHS[section] || '/'}">← Volver a ${escapeHtml(section)}</a><p class="detail-kicker">${escapeHtml(section)}</p><h1 class="detail-title">${escapeHtml(title)}</h1><p class="detail-summary">${escapeHtml(summary)}</p><section class="detail-card"><dl class="detail-grid">${rows}</dl></section></main></body></html>`;
}

function flattenSearch(content, detailUrls) {
  const labels = {home:'Inicio',eventos:'Eventos',publicaciones:'Publicaciones',investigacion:'Investigación',docencia:'Docencia',blog:'Blog',galeria:'Galería',podcast:'Podcast'};
  const result = [];
  for (const [section, value] of Object.entries(content || {})) {
    const route = ROUTE_PATHS[section] || '/';
    const records = Array.isArray(value) ? value : sectionRecords(content, section);
    if (records.length) {
      records.forEach((record, index) => {
        const title = titleFor(record, `${labels[section] || section} ${index + 1}`);
        result.push({ section, sectionLabel:labels[section] || section, title, text:compactText(record, 650), url:detailUrls.get(`${section}:${index}`) || route });
      });
    } else {
      result.push({ section, sectionLabel:labels[section] || section, title:labels[section] || section, text:compactText(value, 650), url:route });
    }
  }
  return result;
}

function rss(content) {
  const items = [];
  for (const section of ['blog','podcast']) {
    sectionRecords(content, section).slice(0,20).forEach((record, index) => {
      const title = titleFor(record, `${section} ${index + 1}`);
      const description = compactText(record, 400);
      const link = `${BASE_URL}${ROUTE_PATHS[section]}`;
      items.push(`<item><title><![CDATA[${title}]]></title><link>${link}</link><guid isPermaLink="false">${section}-${index}-${slugify(title)}</guid><description><![CDATA[${description}]]></description></item>`);
    });
  }
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Portal Académico · Eduardo Ahumada-Tello</title><link>${BASE_URL}</link><description>Actualizaciones académicas, blog y podcast.</description><language>es-mx</language>${items.join('')}</channel></rss>`;
}

await rm(DIST, { recursive:true, force:true });
await mkdir(DIST, { recursive:true });
for (const path of ['index.html','assets','admin','manifest.webmanifest','service-worker.js','offline.html','robots.txt']) {
  await cp(join(ROOT,path), out(path), { recursive:true });
}

const appSource = await read('assets/js/app.js');
const marker = 'window.CMS_CONTENT = window.CMS_CONTENT || {';
const extracted = findObjectLiteral(appSource, marker);
const content = vm.runInNewContext(`(${extracted.literal})`, Object.create(null), { timeout:1500 });
await ensure('assets/data/content.js');
await writeFile(out('assets/data/content.js'), `/* Generated at build time from the legacy embedded CMS object. */\nwindow.PORTAL_CONTENT = ${JSON.stringify(content, null, 2)};\n`, 'utf8');
await writeFile(out('assets/data/content.json'), JSON.stringify(content, null, 2), 'utf8');

let afterObject = extracted.end + 1;
while (/\s/.test(appSource[afterObject] || '')) afterObject++;
if (appSource[afterObject] === ';') afterObject++;
const transformedApp = appSource.slice(0, extracted.markerIndex) + 'window.CMS_CONTENT = window.CMS_CONTENT || window.PORTAL_CONTENT || {};\n' + appSource.slice(afterObject);
await writeFile(out('assets/js/app.js'), transformedApp, 'utf8');

let html = await read('index.html');
html = html.replace(/<script src="https:\/\/cdn\.tailwindcss\.com">[\s\S]*?<\/script>/, '');
html = html.replace(/\s*<script src="assets\/js\/tailwind-config\.js"><\/script>/, '');
html = html.replace('<link rel="canonical" href="https://tu-dominio.com">', `<link rel="canonical" href="${BASE_URL}/">`);
html = html.replace('<link rel="stylesheet" href="assets/css/styles.css">', '<link rel="stylesheet" href="/assets/css/tailwind.css">\n  <link rel="stylesheet" href="/assets/css/styles.css">\n  <link rel="stylesheet" href="/assets/css/layout-fixes.css">\n  <link rel="stylesheet" href="/assets/css/enhancements.css">\n  <link rel="manifest" href="/manifest.webmanifest">\n  <link rel="alternate" type="application/rss+xml" title="Portal académico" href="/feed.xml">\n  <meta name="theme-color" content="#083321">');
/* app.js must register its DOMContentLoaded router before enhancements.js cleans the temporary hash. */
html = html.replace('<script src="assets/js/app.js"></script>', '<script src="/assets/data/content.js"></script>\n  <script src="assets/js/app.js"></script>\n  <script src="/assets/js/enhancements.js"></script>');
const contactLink = /\s*<a href="#\/contacto" class="menu-link[\s\S]*?<\/a>/g;
const contacts = html.match(contactLink) || [];
if (contacts.length > 1) {
  let seen = 0;
  html = html.replace(contactLink, match => (++seen === 1 ? '' : match));
}
await writeFile(out('index.html'), html, 'utf8');

const detailUrls = new Map();
for (const section of ['publicaciones','investigacion','blog','podcast']) {
  const records = sectionRecords(content, section);
  const used = new Set();
  for (let i = 0; i < records.length; i++) {
    let slug = slugify(titleFor(records[i], `${section}-${i + 1}`));
    if (used.has(slug)) slug = `${slug}-${i + 1}`;
    used.add(slug);
    const url = `${ROUTE_PATHS[section]}/${slug}`;
    detailUrls.set(`${section}:${i}`, url);
    await ensure(`${section}/${slug}/index.html`);
    await writeFile(out(`${section}/${slug}/index.html`), detailHtml(section, records[i], url), 'utf8');
  }
}

const searchIndex = flattenSearch(content, detailUrls);
await writeFile(out('assets/data/search-index.json'), JSON.stringify(searchIndex, null, 2), 'utf8');
await writeFile(out('feed.xml'), rss(content), 'utf8');

const sitemapPaths = [...new Set([...Object.values(ROUTE_PATHS), ...detailUrls.values()])];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapPaths.map(path => `<url><loc>${BASE_URL}${path}</loc></url>`).join('')}</urlset>`;
await writeFile(out('sitemap.xml'), sitemap, 'utf8');

console.log(`Build listo: ${searchIndex.length} entradas de búsqueda y ${detailUrls.size} fichas individuales.`);
