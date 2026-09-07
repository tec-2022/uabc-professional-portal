import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const config = JSON.parse(await readFile(join(ROOT, 'portal.config.json'), 'utf8'));
const site = config.site || {};
const demo = config.demo || {};
const template = config.template || {};

const indexPath = join(DIST, 'index.html');
let html = await readFile(indexPath, 'utf8');

const replaceMeta = (input, attr, key, value) => {
  if (!value) return input;
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`<meta\\s+${attr}=["']${escapedKey}["'][^>]*content=["'][^"']*["'][^>]*>`, 'i');
  const replacement = `<meta ${attr}="${key}" content="${String(value).replace(/"/g, '&quot;')}">`;
  return regex.test(input) ? input.replace(regex, replacement) : input.replace('</head>', `  ${replacement}\n</head>`);
};

html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${site.title || 'Academic Professional Portal · Demo'}</title>`);
html = replaceMeta(html, 'name', 'description', site.description);
html = replaceMeta(html, 'property', 'og:title', site.title);
html = replaceMeta(html, 'property', 'og:description', site.description);
html = replaceMeta(html, 'name', 'twitter:title', site.title);
html = replaceMeta(html, 'name', 'twitter:description', site.description);
html = replaceMeta(html, 'name', 'application-name', site.shortTitle || site.title);

if (!html.includes('/assets/css/template-demo.css')) {
  html = html.replace('</head>', '  <link rel="stylesheet" href="/assets/css/template-demo.css">\n</head>');
}

if (template.mode === 'demo' && demo.showNotice && !html.includes('template-demo-notice')) {
  const label = demo.label || 'Demo · Datos de ejemplo';
  const notice = demo.notice || 'Contenido demostrativo.';
  const badge = `\n  <aside class="template-demo-notice" role="note" aria-label="${notice.replace(/"/g, '&quot;')}" title="${notice.replace(/"/g, '&quot;')}"><strong>Demo</strong><span>${label.replace(/^Demo\s*[·-]?\s*/i, '')}</span></aside>\n`;
  html = html.replace('</body>', `${badge}</body>`);
}

await writeFile(indexPath, html, 'utf8');

const manifestPath = join(DIST, 'manifest.webmanifest');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
manifest.name = site.title || manifest.name;
manifest.short_name = site.shortTitle || manifest.short_name;
manifest.description = site.description || manifest.description;
manifest.theme_color = site.themeColor || manifest.theme_color;
manifest.lang = site.language || manifest.lang;
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

const feedPath = join(DIST, 'feed.xml');
let feed = await readFile(feedPath, 'utf8');
feed = feed.replace(/<channel><title><!\[CDATA\[[\s\S]*?\]\]><\/title>/i, `<channel><title><![CDATA[${site.title || 'Academic Professional Portal · Demo'}]]></title>`);
feed = feed.replace(/<channel><title>([\s\S]*?)<\/title>/i, `<channel><title>${site.title || 'Academic Professional Portal · Demo'}</title>`);
feed = feed.replace(/<description>[\s\S]*?<\/description>/i, `<description><![CDATA[${site.description || 'Professional academic portal template.'}]]></description>`);
await writeFile(feedPath, feed, 'utf8');

await writeFile(join(DIST, 'template-info.json'), JSON.stringify({
  name: template.name,
  version: template.version,
  mode: template.mode,
  sampleData: Boolean(template.sampleData),
  features: config.features || {}
}, null, 2) + '\n', 'utf8');

console.log(`Template profesional aplicado: ${template.name || 'Academic Professional Portal'} (${template.mode || 'standard'}).`);
