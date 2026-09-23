import { describe, expect, it } from 'vitest';
import type { Salon } from '../data/salons';
import { matchesQuery, normalize } from './searchUtils';

const salon: Salon = {
  id: 'mi-salon-1',
  slug: 'mi-salon',
  name: 'Mi Salón',
  category: 'Peluquería',
  location: 'Rubí',
  distance: '1.0 km',
  rating: 4.9,
  reviews: 120,
  desde: 15,
  tags: ['mechas', 'corte', 'color'],
  verified: true,
  featured: false,
  phone: '+34600000001',
  address: 'Calle Mayor 1',
  lat: 41.49,
  lng: 2.03,
  description: 'Peluquería en Rubí',
  imageClass: 'salon-img-default',
  nextSlot: 'Mañana 09:00',
  searchText: 'peluqueria rubi mechas corte color',
  promotions: [],
};

describe('normalize', () => {
  it('lowercases and removes Spanish/Catalan accents', () => {
    expect(normalize('Peluquería en Rubí')).toBe('peluqueria en rubi');
    expect(normalize('Barbería Mañana')).toBe('barberia manana');
  });
});

describe('matchesQuery', () => {
  it('matches salon fields without depending on accents or case', () => {
    expect(matchesQuery(salon, 'peluqueria', 'rubi')).toBe(true);
    expect(matchesQuery(salon, 'MECHAS', '')).toBe(true);
  });

  it('rejects queries or cities outside the salon searchable text', () => {
    expect(matchesQuery(salon, 'masaje', 'rubi')).toBe(false);
    expect(matchesQuery(salon, 'peluqueria', 'terrassa')).toBe(false);
  });
});
