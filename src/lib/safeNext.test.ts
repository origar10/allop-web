import { describe, expect, it } from 'vitest';
import { getSafeNext } from './safeNext';

describe('getSafeNext', () => {
  it('deja pasar rutas internas', () => {
    expect(getSafeNext('/reservar/estudio-nacar-demo')).toBe('/reservar/estudio-nacar-demo');
    expect(getSafeNext('/mi-cuenta/reservas?x=1#y')).toBe('/mi-cuenta/reservas?x=1#y');
  });

  it.each([
    null, '', 'https://evil.com', 'evil.com', '//evil.com', '/\\evil.com', '/\\/evil.com',
    '/\t/evil.com', '/\n/evil.com', 'javascript:alert(1)', '%2F%2Fevil.com',
  ])('rechaza %j', (valor) => {
    expect(getSafeNext(valor as string | null)).toBe('/mi-cuenta');
  });
});
