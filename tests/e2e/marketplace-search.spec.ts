import { expect, test } from '@playwright/test';

test('home search scrolls to visible marketplace results', async ({ page }) => {
  await page.route('https://api.allop.es/api/**', (route) => route.abort());

  await page.goto('/');

  await page.locator('.hero').getByLabel('Servicio').fill('feromi');
  await page.locator('.hero').getByRole('button', { name: /buscar/i }).click();

  await expect(page.locator('#marketplace-results')).toBeInViewport();
  await expect(page.getByRole('heading', { name: 'Resultados' })).toBeVisible();
  await expect(page.locator('#marketplace-results').getByLabel('Abrir ficha de Feromi')).toBeVisible();
});
