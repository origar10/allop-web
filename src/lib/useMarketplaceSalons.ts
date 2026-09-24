import { useEffect, useState } from 'react';
import type { Salon } from '../data/salons';
import { listMarketplaceSalons } from './salonsApi';

/** Salones publicados en el marketplace; null mientras cargan, [] si no hay o la API falla. */
export function useMarketplaceSalons(): Salon[] | null {
  const [salons, setSalons] = useState<Salon[] | null>(null);

  useEffect(() => {
    let active = true;
    listMarketplaceSalons()
      .then((items) => { if (active) setSalons(items); })
      .catch(() => { if (active) setSalons([]); });
    return () => { active = false; };
  }, []);

  return salons;
}
