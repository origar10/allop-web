import { expect, test } from '@playwright/test';

test('home search opens the dedicated results page', async ({ page }) => {
  await page.route('https://api.allop.es/api/**', (route) => route.abort());

  await page.goto('/');

  await page.locator('.hero').getByLabel('Servicio').fill('feromi');
  await page.locator('.hero').getByRole('button', { name: /buscar/i }).click();

  await expect(page).toHaveURL(/\/buscar\?q=feromi/);
  await expect(page.getByRole('heading', { name: /Resultados de busqueda/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Resultados', exact: true })).toBeVisible();
  await expect(page.getByLabel('Abrir ficha de Feromi')).toBeVisible();

  await page.getByRole('button', { name: /Mapa/i }).click();
  await expect(page.locator('.market-map-layout')).toBeVisible();
});
