import type { Salon } from '../data/salons';

export function normalize(value: string) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

export function matchesQuery(salon: Salon, query: string, city: string) {
  const haystack = normalize([salon.name, salon.category, salon.location, salon.tags.join(' ')].join(' '));
  const normalizedQuery = normalize(query);
  const normalizedCity = normalize(city);

  return (!normalizedQuery || haystack.includes(normalizedQuery)) &&
    (!normalizedCity || normalize(salon.location).includes(normalizedCity));
}
