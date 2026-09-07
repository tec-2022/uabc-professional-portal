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

function humanizeDetail(html) {
  html = html.replaceAll(legacyBase, configuredBase);
  if (!html.includes('/assets/css/showcase.css')) {
    html = html.replace('</head>', '<link rel="stylesheet" href="/assets/css/showcase.css"></head>');
  }

  html = html.replace(/<p class="detail-kicker">([^<]+)<\/p>/i, (_, raw) => {
    const key = raw.trim().toLowerCase();
    const label = sectionLabels[key] || raw.trim();
    return `<p class="detail-kicker">${label}<span class="detail-demo-badge">Demo</span></p>`;
  });

  html = html.replace(/← Volver a ([^<]+)<\/a>/i, (_, raw) => {
    const key = raw.trim().toLowerCase();
    return `← Volver a ${sectionLabels[key] || raw.trim()}</a>`;
  });

  html = html.replace(/<dt>([^<]+)<\/dt>/g, (_, raw) => {
    const key = raw.trim().toLowerCase().replace(/\s+/g, '_');
    const label = fieldLabels[key] || raw.trim().replace(/[_-]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    return `<dt>${label}</dt>`;
  });

  return html;
}

async function polishDetails() {
  const files = await collectDetailIndexes(DIST);
  for (const path of files) {
    let html = await readFile(path, 'utf8');
    if (!html.includes('detail-page')) continue;
    html = humanizeDetail(html);
    await writeFile(path, html, 'utf8');
  }
  return files.length;
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
console.log(`Showcase profesional aplicado: ${details} páginas revisadas y enlaces demo protegidos.`);
