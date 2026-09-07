import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const config = JSON.parse(await readFile(join(ROOT, 'portal.config.json'), 'utf8'));
const configuredBase = String(config.site?.baseUrl || 'https://prueba-pi-eight.vercel.app').replace(/\/$/, '');
const legacyBase = 'https://prueba-pi-eight.vercel.app';

const sectionLabels = {
  publicaciones:'Publicaciones', investigacion:'Investigación', blog:'Blog académico', podcast:'Podcast',
  eventos:'Eventos', docencia:'Docencia', galeria:'Galería', contacto:'Contacto'
};
const fieldLabels = {
  title:'Título', titulo:'Título', name:'Nombre', label:'Nombre', authors:'Autores', author:'Autor',
  year:'Año', date:'Fecha', type:'Tipo', venue:'Publicación / medio', journal:'Revista', doi:'DOI',
  url:'Enlace', href:'Enlace', description:'Descripción', desc:'Descripción', abstract:'Resumen',
  summary:'Resumen', duration:'Duración', audio:'Audio', image:'Imagen', img:'Imagen', topic:'Tema',
  course:'Curso', project:'Proyecto', status:'Estado', institution:'Institución', university:'Universidad'
};
const typeLabels = {
  journal:'Artículo de revista', conference:'Ponencia / conferencia', book:'Libro', chapter:'Capítulo de libro',
  project:'Proyecto', podcast:'Podcast', article:'Artículo'
};
const fallbackSummaries = {
  publicaciones:'Ficha académica de demostración con autores, año, medio de publicación y referencias asociadas.',
  investigacion:'Ficha de investigación incluida para mostrar cómo se presentan proyectos, líneas y colaboraciones en la plantilla.',
  blog:'Entrada de demostración incluida para mostrar la presentación editorial del blog académico.',
  podcast:'Episodio de demostración incluido para mostrar la experiencia de audio y sus metadatos.'
};

async function injectMainAssets() {
  const path = join(DIST, 'index.html');
  let html = await readFile(path, 'utf8');
  if (!html.includes('/assets/css/showcase.css')) {
    html = html.replace('</head>', '  <link rel="stylesheet" href="/assets/css/showcase.css">\n</head>');
  }
  if (!html.includes('/assets/js/showcase.js')) {
    html = html.replace('</body>', '  <script src="/assets/js/showcase.js" defer></script>\n</body>');
  }
  html = html.replaceAll(legacyBase, configuredBase);
  await writeFile(path, html, 'utf8');
}

async function collectDetailIndexes(dir, out = []) {
  const entries = await readdir(dir, { withFileTypes:true });
  for (const entry of entries) {
    if (['admin','assets'].includes(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await collectDetailIndexes(path, out);
    else if (entry.name === 'index.html' && path !== join(DIST, 'index.html')) out.push(path);
  }
  return out;
}

function replaceMetaDescription(html, summary) {
  const safe = summary.replace(/"/g, '&quot;');
  html = html.replace(/<meta name="description" content="[^"]*">/i, `<meta name="description" content="${safe}">`);
  html = html.replace(/<meta property="og:description" content="[^"]*">/i, `<meta property="og:description" content="${safe}">`);
  return html;
}

function humanizeDetail(html) {
  html = html.replaceAll(legacyBase, configuredBase);
  if (!html.includes('/assets/css/showcase.css')) {
    html = html.replace('</head>', '<link rel="stylesheet" href="/assets/css/showcase.css"></head>');
  }
  if (!html.includes('/assets/js/showcase.js')) {
    html = html.replace('</body>', '<script src="/assets/js/showcase.js" defer></script></body>');
  }

  const rawSection = html.match(/<p class="detail-kicker">([^<]+)<\/p>/i)?.[1]?.trim().toLowerCase() || '';
  const sectionLabel = sectionLabels[rawSection] || rawSection;

  html = html.replace(/<p class="detail-kicker">([^<]+)<\/p>/i,
    `<p class="detail-kicker">${sectionLabel}<span class="detail-demo-badge">Demo</span></p>`);

  html = html.replace(/← Volver a ([^<]+)<\/a>/i, (_, raw) => {
    const key = raw.trim().toLowerCase();
    return `← Volver a ${sectionLabels[key] || raw.trim()}</a>`;
  });

  html = html.replace(/<dt>([^<]+)<\/dt>/g, (_, raw) => {
    const key = raw.trim().toLowerCase().replace(/\s+/g, '_');
    const label = fieldLabels[key] || raw.trim().replace(/[_-]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    return `<dt>${label}</dt>`;
  });

  html = html.replace(/<dt>Tipo<\/dt><dd>([^<]+)<\/dd>/i, (_, rawType) => {
    const key = rawType.trim().toLowerCase();
    return `<dt>Tipo</dt><dd>${typeLabels[key] || rawType.trim()}</dd>`;
  });

  html = html.replace(/<dt>DOI<\/dt><dd><a[^>]+href="[^"]*10\.xxxx[^"]*"[^>]*>[^<]*<\/a><\/dd>/i,
    '<dt>DOI</dt><dd><span class="detail-placeholder">DOI de demostración</span></dd>');
  html = html.replace(/<dt>Enlace<\/dt><dd>#<\/dd>/i,
    '<dt>Enlace</dt><dd><span class="detail-placeholder">Enlace de demostración</span></dd>');

  const summaryMatch = html.match(/<p class="detail-summary">([\s\S]*?)<\/p>/i);
  if (summaryMatch) {
    const summary = summaryMatch[1].replace(/<[^>]*>/g, '').trim();
    const looksRaw = /https?:\/\//i.test(summary) || /(^|\s)#(\s|$)/.test(summary) || /^(journal|conference|book|chapter)\b/i.test(summary);
    if (looksRaw && fallbackSummaries[rawSection]) {
      const cleanSummary = fallbackSummaries[rawSection];
      html = html.replace(/<p class="detail-summary">[\s\S]*?<\/p>/i, `<p class="detail-summary">${cleanSummary}</p>`);
      html = replaceMetaDescription(html, cleanSummary);
    }
  }

  return html;
}

async function polishDetails() {
  const files = await collectDetailIndexes(DIST);
  let polished = 0;
  for (const path of files) {
    let html = await readFile(path, 'utf8');
    if (!html.includes('detail-page')) continue;
    html = humanizeDetail(html);
    await writeFile(path, html, 'utf8');
    polished++;
  }
  return polished;
}

async function normalizeGeneratedBaseUrls() {
  for (const name of ['sitemap.xml','feed.xml']) {
    const path = join(DIST, name);
    let text = await readFile(path, 'utf8');
    text = text.replaceAll(legacyBase, configuredBase);
    await writeFile(path, text, 'utf8');
  }
}

await injectMainAssets();
const details = await polishDetails();
await normalizeGeneratedBaseUrls();
console.log(`Showcase profesional aplicado: ${details} fichas humanizadas y enlaces demo protegidos.`);
