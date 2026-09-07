const { test, expect } = require('@playwright/test');

const routes = [
  ['/', 'Dr.'],
  ['/eventos', 'Eventos'],
  ['/publicaciones', 'Publicaciones'],
  ['/investigacion', 'Investigación'],
  ['/docencia', 'Docencia'],
  ['/blog', 'Blog'],
  ['/galeria', 'Galería'],
  ['/podcast', 'Podcast'],
  ['/contacto', 'Contacto'],
  ['/privacidad', 'Privacidad'],
  ['/cookies', 'Cookies']
];

test.describe('public portal', () => {
  for (const [route, heading] of routes) {
    test(`${route} renders its own section`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('#app > section')).toBeVisible();
      await expect(page.locator('#app')).toContainText(heading, { ignoreCase:true });
      await expect(page).toHaveURL(new RegExp(`${route === '/' ? '/?$' : route}`));
    });
  }

  test('home exposes the finished demo summary', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.portal-home-summary')).toBeVisible();
    await expect(page.locator('.portal-metric')).toHaveCount(4);
    await expect(page.getByRole('link',{ name:/Ver publicaciones|View publications/i })).toBeVisible();
  });

  test('menu uses clean route navigation', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link',{ name:'Publicaciones', exact:true }).first();
    await link.click();
    await expect(page).toHaveURL(/\/publicaciones$/);
    await expect(page.locator('#app h2').first()).toContainText('Publicaciones');
  });

  test('dark and light themes keep semantic surfaces', async ({ page }) => {
    await page.goto('/publicaciones');
    await page.evaluate(() => localStorage.setItem('theme','dark'));
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/dark/);
    const dark = await page.locator('main').evaluate(el => getComputedStyle(el).backgroundImage + getComputedStyle(el).backgroundColor);
    expect(dark).not.toMatch(/rgb\(255, 255, 255\)/);

    await page.evaluate(() => localStorage.setItem('theme','light'));
    await page.reload();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('global search opens and returns results', async ({ page }) => {
    await page.goto('/');
    await page.locator('#globalSearchButton').click();
    await expect(page.locator('#globalSearchDialog')).toHaveAttribute('open','');
    await page.locator('#globalSearchInput').fill('datos');
    await expect(page.locator('#globalSearchResults')).not.toBeEmpty();
  });

  test('publication cards expose copy-reference tooling', async ({ page }) => {
    await page.goto('/publicaciones');
    const button = page.getByRole('button',{ name:/Copiar referencia|Copy reference/i }).first();
    await expect(button).toBeVisible();
  });

  test('demo does not retain a registered service worker', async ({ page }) => {
    await page.goto('/');
    const registrations = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return 0;
      await new Promise(resolve => setTimeout(resolve, 150));
      return (await navigator.serviceWorker.getRegistrations()).length;
    });
    expect(registrations).toBe(0);
  });
});
