import { expect, test, type Route } from '@playwright/test';

// La base de la API cambia según .env.local; se intercepta cualquier origen.
const API = '**/api';

const salon = {
  slug: 'demo',
  nombre: 'Salón Demo',
  ciudad: 'Barcelona',
  direccion: 'Carrer de Prova 1',
  telefono: '+34 600 000 000',
  rating: null,
  num_reviews: 0,
  reviews: [],
  servicios_basicos: [
    { id: 11, nombre: 'Corte mujer', duracion_min: 45, precio: 25, categoria: 'Corte', visible: true },
    { id: 12, nombre: 'Tinte', duracion_min: 90, precio: null, categoria: 'Color', visible: true },
  ],
  horario_apertura: [],
};

function json(route: Route, body: unknown) {
  return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
}

function eachDay(desde: string, hasta: string) {
  const days: string[] = [];
  const cursor = new Date(`${desde}T12:00:00`);
  const end = new Date(`${hasta}T12:00:00`);
  while (cursor <= end) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, '0');
    const d = String(cursor.getDate()).padStart(2, '0');
    days.push(`${y}-${m}-${d}`);
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

test('booking uses real services, team and free slots, and asks to log in before confirming', async ({ page }) => {
  await page.route(`${API}/**`, (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace(/^.*?\/api(?=\/)/, '');

    if (path === '/salones/demo') return json(route, salon);
    if (path === '/salones/demo/servicios') return json(route, salon.servicios_basicos);
    if (path === '/salones/demo/servicios/11/empleados') {
      return json(route, [{ id: 1, nombre: 'Laura' }, { id: 2, nombre: 'Marc' }]);
    }
    if (path === '/salones/demo/disponibilidad/rango') {
      const days = eachDay(url.searchParams.get('desde')!, url.searchParams.get('hasta')!);
      return json(route, { days: days.map((fecha, i) => ({ fecha, status: i % 7 === 6 ? 'closed' : 'available', slotCount: 3 })) });
    }
    if (path === '/salones/demo/disponibilidad') return json(route, { status: 'available', slots: ['10:00', '10:30', '16:00'] });
    return route.fulfill({ status: 404, body: '{}' });
  });

  await page.goto('/');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.goto('/reservar/demo');

  await expect(page.getByRole('heading', { name: 'Salón Demo' })).toBeVisible();

  // Paso 1: servicios reales agrupados, el que no enseña precio no inventa uno.
  await expect(page.getByRole('button', { name: /Tinte/ })).not.toContainText('€');
  await page.getByRole('button', { name: /Corte mujer/ }).click();
  await page.getByRole('button', { name: /continuar/i }).click();

  // Paso 2: equipo real del salón + "cualquiera".
  await expect(page.getByRole('button', { name: /Laura/ })).toBeVisible();
  await page.getByRole('button', { name: /Marc/ }).click();
  await page.getByRole('button', { name: /continuar/i }).click();

  // Paso 3: solo horas libres que devuelve el salón.
  await expect(page.getByRole('button', { name: '16:00' })).toBeVisible();
  await page.getByRole('button', { name: '10:30' }).click();
  await page.getByRole('button', { name: /continuar/i }).click();

  // Paso 4: sin sesión no se confirma nada; se pide entrar.
  await expect(page.getByRole('heading', { name: /entra para confirmar/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /entrar o registrarme/i })).toHaveAttribute('href', '/login?next=/reservar/demo');
});

test('booking shows an error instead of inventing slots when the salon is unreachable', async ({ page }) => {
  await page.route(`${API}/**`, (route) => {
    const path = new URL(route.request().url()).pathname.replace(/^.*?\/api(?=\/)/, '');
    if (path === '/salones/demo') return json(route, salon);
    return route.abort();
  });

  await page.goto('/reservar/demo?service=11');

  // Sin equipo que elegir salta directo a la agenda, que no se puede consultar.
  await expect(page.getByText(/no se pudo consultar la agenda/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /^\d{2}:\d{2}$/ })).toHaveCount(0);
});
