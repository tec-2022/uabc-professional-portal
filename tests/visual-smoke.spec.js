const { test, expect } = require('@playwright/test');

const routes = ['/', '/publicaciones', '/investigacion', '/docencia', '/admin'];

for (const route of routes) {
  for (const theme of ['light','dark']) {
    test(`visual smoke ${route} ${theme}`, async ({ page }, testInfo) => {
      await page.goto(route);
      await page.evaluate(value => localStorage.setItem('theme', value), theme);
      await page.reload();
      await page.waitForLoadState('networkidle');
      await expect(page.locator(route === '/admin' ? '.admin-shell' : '#app')).toBeVisible();
      const path = testInfo.outputPath(`${route.replace(/\W+/g,'-') || 'home'}-${theme}.png`);
      await page.screenshot({ path, fullPage:true, animations:'disabled' });
      await testInfo.attach(`visual-${theme}`, { path, contentType:'image/png' });
    });
  }
}
