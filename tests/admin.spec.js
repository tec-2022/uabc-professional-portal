const { test, expect } = require('@playwright/test');

test.describe('administration panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByRole('heading',{ name:'Administrar contenido' })).toBeVisible();
  });

  test('uses human language and consolidated product UI', async ({ page }) => {
    await expect(page.getByText('Edición segura')).toBeVisible();
    await expect(page.locator('.admin-save-state')).toBeVisible();
    await expect(page.getByText(/JSON|Objeto|backend/i)).toHaveCount(0);
  });

  test('marks edits as pending and protects unsaved work', async ({ page }) => {
    const input = page.locator('#editor input, #editor textarea').first();
    await expect(input).toBeVisible();
    await input.fill(`${await input.inputValue()} `);
    await expect(page.locator('.admin-save-state')).toContainText('Cambios sin guardar');
    await expect(page.locator('body')).toHaveClass(/admin-has-unsaved/);
  });

  test('saving a draft clears the visible pending state', async ({ page }) => {
    const input = page.locator('#editor input, #editor textarea').first();
    await input.fill(`${await input.inputValue()} `);
    await page.locator('#saveBtn').click();
    await expect(page.locator('.admin-save-state')).toContainText('Borrador guardado');
    await expect(page.locator('body')).not.toHaveClass(/admin-has-unsaved/);
  });

  test('desktop and mobile previews remain available', async ({ page }) => {
    await expect(page.getByRole('button',{ name:'Computadora' })).toBeVisible();
    await expect(page.getByRole('button',{ name:'Celular' })).toBeVisible();
    await expect(page.locator('#previewFrame')).toBeVisible();
  });
});
