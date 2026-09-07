/* Paleta UABC + modo oscuro en Tailwind */
(() => {
  const currentScript = document.currentScript;
  const resolveAsset = (relativePath, fallback) => currentScript
    ? new URL(relativePath, currentScript.src).href
    : fallback;

  /* CSS local de respaldo: mantiene la interfaz utilizable sin depender del CDN. */
  const criticalHref = resolveAsset('../css/critical.css', '/assets/css/critical.css');
  if (!document.querySelector('link[data-critical-css]')) {
    const criticalCss = document.createElement('link');
    criticalCss.rel = 'stylesheet';
    criticalCss.href = criticalHref;
    criticalCss.dataset.criticalCss = 'true';
    document.head.appendChild(criticalCss);
  }

  /* Capa final de responsive/layout. Se carga al terminar de parsear el documento. */
  const layoutHref = resolveAsset('../css/layout-fixes.css', '/assets/css/layout-fixes.css');
  const finalizeLayout = () => {
    if (!document.querySelector('link[data-layout-fixes]')) {
      const layoutCss = document.createElement('link');
      layoutCss.rel = 'stylesheet';
      layoutCss.href = layoutHref;
      layoutCss.dataset.layoutFixes = 'true';
      document.head.appendChild(layoutCss);
    }

    /*
     * El HTML fuente original tenía un enlace de Contacto repetido. Mantener esta
     * normalización aquí evita duplicados sin contaminar el marcado renderizado.
     */
    const nav = document.querySelector('#sidebar nav');
    if (nav) {
      const seen = new Set();
      nav.querySelectorAll('.menu-link[href]').forEach((link) => {
        const href = link.getAttribute('href');
        if (!href) return;
        if (seen.has(href)) {
          link.remove();
          return;
        }
        seen.add(href);
      });

      /* Contacto queda como última opción principal; Podcast justo antes. */
      const podcast = nav.querySelector('.menu-link[href="#/podcast"]');
      const contact = nav.querySelector('.menu-link[href="#/contacto"]');
      if (podcast && contact) nav.insertBefore(podcast, contact);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', finalizeLayout, { once: true });
  } else {
    finalizeLayout();
  }

  const UABC_GREEN = '#0b6b3a';
  const UABC_GOLD  = '#c9a227';
  const UABC_DARK  = '#083321';

  /* Evita ReferenceError si cdn.tailwindcss.com no está disponible. */
  window.tailwind = window.tailwind || {};
  window.tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
          display: ['Inter', 'sans-serif']
        },
        colors: {
          primary: {
            50:'#ecf7f1',100:'#d6efe2',200:'#a7dfc2',300:'#77cfa3',400:'#47bf83',
            500: UABC_GREEN, 600:'#0a5f35',700:'#094f2c',800:'#0a4226',900: UABC_DARK
          },
          accent: {
            50:'#fff8e6',100:'#ffefc2',200:'#ffe28a',300:'#ffd452',400:'#ffca2e',
            500: UABC_GOLD, 600:'#b88a1e',700:'#8f6b18',800:'#6b5012',900:'#513d0e'
          },
          slateDeep: '#0f172a'
        },
        boxShadow: {
          soft: '0 10px 25px -10px rgba(2,6,23,0.25)',
          glow: '0 0 15px rgba(201, 162, 39, 0.3)'
        },
        animation: {
          'fade-in': 'fadeIn 0.3s ease-in',
          float: 'float 6s ease-in-out infinite'
        },
        keyframes: {
          fadeIn: { '0%':{opacity:'0',transform:'translateY(10px)'}, '100%':{opacity:'1',transform:'translateY(0)'} },
          float:   { '0%,100%':{transform:'translateY(0)'}, '50%':{transform:'translateY(-10px)'} }
        }
      }
    }
  };
})();
