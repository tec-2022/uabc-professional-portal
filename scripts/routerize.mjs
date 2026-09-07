import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = join(process.cwd(), 'dist');
const appPath = join(DIST, 'assets/js/app.js');
const enhancementsPath = join(DIST, 'assets/js/enhancements.js');

let app = await readFile(appPath, 'utf8');

const oldRoute = `function routeNameFromHash(){ const hash = window.location.hash || '#/home'; return hash.replace('#/','').toLowerCase(); }`;
const newRoute = `const CLEAN_ROUTE_PATHS = {
      home: '/', eventos: '/eventos', publicaciones: '/publicaciones', investigacion: '/investigacion',
      docencia: '/docencia', blog: '/blog', galeria: '/galeria', podcast: '/podcast', contacto: '/contacto',
      privacidad: '/privacidad', cookies: '/cookies'
    };
    const CLEAN_PATH_ROUTES = Object.fromEntries(Object.entries(CLEAN_ROUTE_PATHS).map(([route, path]) => [path, route]));
    function cleanPathForRoute(route){ return CLEAN_ROUTE_PATHS[route] || '/'; }
    function routeNameFromHash(){
      const hash = (window.location.hash || '').replace(/^#\//, '').toLowerCase();
      if (hash && CLEAN_ROUTE_PATHS[hash]) return hash;
      const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
      return CLEAN_PATH_ROUTES[pathname] || 'home';
    }`;

if (!app.includes(oldRoute)) throw new Error('No se encontró el router hash legado en app.js.');
app = app.replace(oldRoute, newRoute);

const oldSetActive = `function setActive(route){
      links().forEach(a=>{
        const r = a.getAttribute('href').replace('#/','').toLowerCase();
        a.classList.toggle('active-menu-item', r === route);
      });
    }`;
const newSetActive = `function setActive(route){
      links().forEach(a=>{
        const href = a.getAttribute('href') || '';
        const cleanHref = href.replace(/\/+$/, '') || '/';
        const r = href.startsWith('#/')
          ? href.slice(2).toLowerCase()
          : (CLEAN_PATH_ROUTES[cleanHref] || '');
        a.classList.toggle('active-menu-item', r === route);
      });
    }`;
if (!app.includes(oldSetActive)) throw new Error('No se encontró setActive legado en app.js.');
app = app.replace(oldSetActive, newSetActive);

const oldHashListener = `window.addEventListener('hashchange', render);`;
const newHistoryListeners = `window.addEventListener('hashchange', render);
    window.addEventListener('popstate', render);`;
if (!app.includes(oldHashListener)) throw new Error('No se encontró listener hashchange en app.js.');
app = app.replace(oldHashListener, newHistoryListeners);

const oldMenu = `links().forEach(a=>{
        a.addEventListener('click', (ev)=>{
          ev.preventDefault();
          const href=a.getAttribute('href');
          if(window.location.hash!==href){ window.location.hash=href; } else { render(); }
          if (isMobile()) closeSidebar();
        });
      });`;
const newMenu = `links().forEach(a=>{
        a.addEventListener('click', (ev)=>{
          if (ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
          ev.preventDefault();
          const href = a.getAttribute('href') || '';
          const route = href.startsWith('#/')
            ? href.slice(2).toLowerCase()
            : (CLEAN_PATH_ROUTES[href.replace(/\/+$/, '') || '/'] || '');
          if (!CLEAN_ROUTE_PATHS[route]) return;
          const target = cleanPathForRoute(route);
          const current = window.location.pathname.replace(/\/+$/, '') || '/';
          if (current !== target || window.location.hash) {
            history.pushState({ route }, '', target + (window.location.search || ''));
          }
          render();
          if (isMobile()) closeSidebar();
        });
      });`;
if (!app.includes(oldMenu)) throw new Error('No se encontró navegación de menú legada en app.js.');
app = app.replace(oldMenu, newMenu);

const oldInit = `applyTheme();
      translate();
      render();
      initCookieBanner();`;
const newInit = `applyTheme();
      translate();
      render();
      // Normaliza enlaces antiguos #/ruta a la URL limpia después del primer render.
      if (window.location.hash.startsWith('#/')) {
        const initialRoute = routeNameFromHash();
        history.replaceState({ route: initialRoute }, '', cleanPathForRoute(initialRoute) + (window.location.search || ''));
      }
      initCookieBanner();`;
if (!app.includes(oldInit)) throw new Error('No se encontró bloque de inicialización del router en app.js.');
app = app.replace(oldInit, newInit);

await writeFile(appPath, app, 'utf8');

let enhancements = await readFile(enhancementsPath, 'utf8');
const seoStart = enhancements.indexOf("(() => {\n  'use strict';\n\n  const BASE = 'https://prueba-pi-eight.vercel.app';");
if (seoStart <= 0) throw new Error('No se pudo localizar el inicio del módulo SEO para retirar el bridge de rutas legado.');
enhancements = `/* Routing is owned exclusively by app.js in production. */\n${enhancements.slice(seoStart)}`;
await writeFile(enhancementsPath, enhancements, 'utf8');

console.log('Router de producción convertido a rutas limpias nativas; bridge hash eliminado.');
