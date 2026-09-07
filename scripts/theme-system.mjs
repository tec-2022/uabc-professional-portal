import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const THEME_CSS = '/assets/css/theme-system.css';
const CONTRAST_CSS = '/assets/css/contrast-contract.css';
const THEME_JS = '/assets/js/theme-system.js';
const ADMIN_CSS = '/admin/admin-consistency.css';

function injectTheme(html) {
  if (!html.includes(THEME_CSS)) {
    const showcase = '<link rel="stylesheet" href="/assets/css/showcase.css">';
    html = html.includes(showcase)
      ? html.replace(showcase, `${showcase}\n  <link rel="stylesheet" href="${THEME_CSS}">`)
      : html.replace('</head>', `  <link rel="stylesheet" href="${THEME_CSS}">\n</head>`);
  }

  if (!html.includes(CONTRAST_CSS)) {
    const theme = `<link rel="stylesheet" href="${THEME_CSS}">`;
    html = html.includes(theme)
      ? html.replace(theme, `${theme}\n  <link rel="stylesheet" href="${CONTRAST_CSS}">`)
      : html.replace('</head>', `  <link rel="stylesheet" href="${CONTRAST_CSS}">\n</head>`);
  }

  if (!html.includes(THEME_JS)) {
    /* Head loading applies the saved theme before the body paints. */
    html = html.replace('</head>', `  <script src="${THEME_JS}"></script>\n</head>`);
  }
  return html;
}

async function removeConflictingLegacyPresentationLayer() {
  const path = join(DIST, 'assets/css/enhancements.css');
  let css = await readFile(path, 'utf8');
  const label = 'Professional academic presentation layer';
  const labelIndex = css.indexOf(label);
  if (labelIndex < 0) return false;

  const start = css.lastIndexOf('/*', labelIndex);
  const scrollMarker = '/* Scrollable modal surfaces with visually hidden scrollbars.';
  const scrollStart = css.indexOf(scrollMarker, labelIndex);
  if (start < 0) throw new Error('No se pudo localizar el inicio de la capa visual heredada.');

  css = scrollStart > start
    ? `${css.slice(0, start).trimEnd()}\n\n${css.slice(scrollStart)}`
    : `${css.slice(0, start).trimEnd()}\n`;
  await writeFile(path, css, 'utf8');
  return true;
}

async function updateMainPage() {
  const path = join(DIST, 'index.html');
  let html = await readFile(path, 'utf8');
  html = injectTheme(html);
  await writeFile(path, html, 'utf8');
}

async function collectDetailPages(dir, files = []) {
  const entries = await readdir(dir, { withFileTypes:true });
  for (const entry of entries) {
    if (['admin','assets'].includes(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await collectDetailPages(path, files);
    else if (entry.name === 'index.html' && path !== join(DIST, 'index.html')) files.push(path);
  }
  return files;
}

async function updateDetailPages() {
  const files = await collectDetailPages(DIST);
  let updated = 0;
  for (const path of files) {
    let html = await readFile(path, 'utf8');
    if (!html.includes('detail-page')) continue;
    html = injectTheme(html);
    await writeFile(path, html, 'utf8');
    updated++;
  }
  return updated;
}

async function updateAdmin() {
  const path = join(DIST, 'admin/index.html');
  let html = await readFile(path, 'utf8');
  if (!html.includes(ADMIN_CSS)) {
    const marker = '<link rel="stylesheet" href="/admin/admin-pro.css">';
    html = html.includes(marker)
      ? html.replace(marker, `${marker}\n  <link rel="stylesheet" href="${ADMIN_CSS}">`)
      : html.replace('</head>', `  <link rel="stylesheet" href="${ADMIN_CSS}">\n</head>`);
  }
  await writeFile(path, html, 'utf8');
}

const removed = await removeConflictingLegacyPresentationLayer();
await updateMainPage();
const detailCount = await updateDetailPages();
await updateAdmin();

console.log(`Sistema visual final aplicado: capa heredada ${removed ? 'retirada' : 'no presente'}, contrato de contraste activo, ${detailCount} fichas sincronizadas.`);
