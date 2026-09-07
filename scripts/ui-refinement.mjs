import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const indexPath = join(process.cwd(), 'dist', 'index.html');
let html = await readFile(indexPath, 'utf8');
const href = '/assets/css/presentation-refinement.css';

if (!html.includes(href)) {
  const marker = '<link rel="stylesheet" href="/assets/css/enhancements.css">';
  if (html.includes(marker)) {
    html = html.replace(marker, `${marker}\n  <link rel="stylesheet" href="${href}">`);
  } else {
    html = html.replace('</head>', `  <link rel="stylesheet" href="${href}">\n</head>`);
  }
}

await writeFile(indexPath, html, 'utf8');
console.log('Refinamiento visual final aplicado.');
