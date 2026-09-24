import { expect, test } from '@playwright/test';

const salones = [
  { id: 1, slug: 'feromi', nombre: 'Feromi', ciudad: 'Barcelona', rating: 4.8, num_reviews: 12, desde: 20, lat: 41.39, lng: 2.17 },
  { id: 2, slug: 'otro', nombre: 'Otro Salón', ciudad: 'Girona', rating: 0, num_reviews: 0, desde: 0, lat: 0, lng: 0 },
];

test('home search opens the dedicated results page', async ({ page }) => {
  // La base de la API cambia según .env.local; se intercepta cualquier origen.
  await page.route('**/api/**', (route) => {
    const path = new URL(route.request().url()).pathname.replace(/^.*?\/api(?=\/)/, '');
    if (path === '/salones') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(salones) });
    }
    return route.abort();
  });

  await page.goto('/');

  await page.locator('.hero').getByLabel('Servicio').fill('feromi');
  await page.locator('.hero').getByRole('button', { name: /buscar/i }).click();

  await expect(page).toHaveURL(/\/buscar\?q=feromi/);
  await expect(page.getByRole('heading', { name: /Resultados de busqueda/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Resultados', exact: true })).toBeVisible();
  await expect(page.getByLabel('Abrir ficha de Feromi')).toBeVisible();
  await expect(page.getByLabel('Abrir ficha de Otro Salón')).toHaveCount(0);

  await page.getByRole('button', { name: /Mapa/i }).click();
  await expect(page.locator('.market-map-layout')).toBeVisible();
});
