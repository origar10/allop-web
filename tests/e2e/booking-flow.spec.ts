import { expect, test } from '@playwright/test';

test('booking flow can be completed as a guest with local fallback', async ({ page }) => {
  await page.route('https://api.allop.es/api/**', (route) => route.abort());

  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/reservar/feromi');

  await expect(page.getByRole('heading', { name: 'Feromi' })).toBeVisible();

  await page.getByRole('button', { name: /continuar/i }).click();
  await page.getByRole('button', { name: /continuar/i }).click();
  await page.getByRole('button', { name: /continuar/i }).click();
  await page.getByRole('button', { name: /continuar/i }).click();

  await page.getByLabel('Nombre').fill('Cliente Test');
  await page.getByLabel(/tel.fono/i).fill('+34600111222');
  await page.getByLabel('Email opcional').fill('cliente@example.com');

  await page.getByRole('button', { name: /confirmar reserva/i }).click();

  await expect(page.getByRole('heading', { name: /reserva recibida/i })).toBeVisible();
  await expect(page.getByText(/ALP-/)).toBeVisible();
  await expect(page.getByText(/hemos preparado la confirmaci.n por SMS\/email/i)).toBeVisible();
});
