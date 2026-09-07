import { appendFile } from 'node:fs/promises';
import { join } from 'node:path';

const cssPath = join(process.cwd(), 'dist/assets/css/enhancements.css');

const css = `

/* Scrollable modal surfaces with visually hidden scrollbars. */
.global-search-dialog,
.search-results,
.uabc-lb-dialog,
#socialPanel,
#cookieBanner {
  scrollbar-width: none;
  -ms-overflow-style: none;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.global-search-dialog {
  overflow-y: auto;
  overflow-x: hidden;
}

.uabc-lb-dialog {
  overflow-y: auto !important;
  overflow-x: hidden !important;
}

.global-search-dialog::-webkit-scrollbar,
.search-results::-webkit-scrollbar,
.uabc-lb-dialog::-webkit-scrollbar,
#socialPanel::-webkit-scrollbar,
#cookieBanner::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}
`;

await appendFile(cssPath, css, 'utf8');
console.log('Modal scrolling habilitado con scrollbars visualmente ocultos.');
