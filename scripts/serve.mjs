import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = join(process.cwd(),'dist');
const port = Number(process.env.PORT || 4173);
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.xml':'application/xml; charset=utf-8','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const spaRoutes = new Set(['/','/inicio','/eventos','/publicaciones','/investigacion','/docencia','/blog','/galeria','/podcast','/contacto','/privacidad','/cookies']);

async function resolvePath(urlPath) {
  if (urlPath === '/admin' || urlPath === '/admin/') return join(root,'admin/index.html');
  if (spaRoutes.has(urlPath.replace(/\/$/, '') || '/')) return join(root,'index.html');
  const safe = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.(\/|\\|$))+/, '');
  const candidate = join(root, safe);
  try {
    const info = await stat(candidate);
    if (info.isDirectory()) return join(candidate,'index.html');
    return candidate;
  } catch {
    return null;
  }
}

createServer(async (req,res) => {
  const pathname = new URL(req.url,'http://localhost').pathname;
  const file = await resolvePath(pathname);
  if (!file) { res.writeHead(404); res.end('Not found'); return; }
  try {
    const body = await readFile(file);
    res.setHeader('Content-Type',types[extname(file)] || 'application/octet-stream');
    res.setHeader('Cache-Control','no-store');
    res.end(body);
  } catch {
    res.writeHead(404); res.end('Not found');
  }
}).listen(port,'127.0.0.1',() => console.log(`Portal test server: http://127.0.0.1:${port}`));
