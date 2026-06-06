import { describe, expect, it } from 'vitest';
import { SALONS } from '../data/salons';
import { matchesQuery, normalize } from './searchUtils';

describe('normalize', () => {
  it('lowercases and removes Spanish/Catalan accents', () => {
    expect(normalize('Peluquería en Rubí')).toBe('peluqueria en rubi');
    expect(normalize('Barbería Mañana')).toBe('barberia manana');
  });
});

describe('matchesQuery', () => {
  it('matches salon fields without depending on accents or case', () => {
    const feromi = SALONS.find((salon) => salon.slug === 'feromi');

    expect(feromi).toBeDefined();
    expect(matchesQuery(feromi!, 'peluqueria', 'rubi')).toBe(true);
    expect(matchesQuery(feromi!, 'MECHAS', '')).toBe(true);
  });

  it('rejects queries or cities outside the salon searchable text', () => {
    const feromi = SALONS.find((salon) => salon.slug === 'feromi');

    expect(feromi).toBeDefined();
    expect(matchesQuery(feromi!, 'masaje', 'rubi')).toBe(false);
    expect(matchesQuery(feromi!, 'peluqueria', 'terrassa')).toBe(false);
  });
});
