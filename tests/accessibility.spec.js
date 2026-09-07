const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const pages = ['/', '/publicaciones', '/investigacion', '/contacto', '/admin'];

for (const route of pages) {
  test(`accessibility: ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa'])
      .analyze();
    const serious = results.violations.filter(v => ['serious','critical'].includes(v.impact));
    expect(serious, serious.map(v => `${v.id}: ${v.help}`).join('\n')).toEqual([]);
  });
}
