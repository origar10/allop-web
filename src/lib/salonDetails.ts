import type { PublicService, Salon } from '../data/salons';

export interface ServiceItem {
  /** Id del servicio en el core del salón (lo que se reserva). */
  id: string;
  name: string;
  duration: string;
  durationMinutes: number;
  /** null = el salón no enseña el precio en allop.es. */
  price: number | null;
  category: string | null;
}

export interface ProfessionalItem {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string | null;
  avatarColor?: string | null;
}

export const ANY_PROFESSIONAL: ProfessionalItem = {
  id: 'any',
  name: 'Cualquiera disponible',
  role: 'Te asignamos quien tenga hueco',
};

export const WEEK_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export function formatDuration(minutes: number) {
  if (minutes >= 60) {
    const rest = minutes % 60;
    return `${Math.floor(minutes / 60)} h${rest ? ` ${rest} min` : ''}`;
  }
  return `${minutes} min`;
}

export function formatPrice(price: number | null | undefined) {
  if (price === null || price === undefined) return null;
  return `${Number.isInteger(price) ? price : price.toFixed(2).replace('.', ',')} €`;
}

export function toServiceItem(s: PublicService): ServiceItem | null {
  if (!s.id) return null;
  const minutes = Number(s.duracion_min) || 30;
  return {
    id: String(s.id),
    name: s.nombre,
    duration: formatDuration(minutes),
    durationMinutes: minutes,
    price: s.precio ?? null,
    category: s.categoria?.trim() || null,
  };
}

/** Servicios que el salón publica en su ficha y se pueden reservar (los que tienen id del core). */
export function getServices(salon: Salon): ServiceItem[] {
  return (salon.serviciosBasicos ?? [])
    .filter((s) => s.visible !== false)
    .map(toServiceItem)
    .filter((s): s is ServiceItem => s !== null);
}

/** Agrupa por categoría manteniendo el orden en que las publica el salón. */
export function groupByCategory<T extends { category: string | null }>(items: T[]) {
  const groups: Array<{ category: string | null; items: T[] }> = [];
  // "Color" y "COLOR" son la misma categoría; se muestra el nombre del primero.
  const key = (category: string | null) => category?.trim().toLowerCase() || null;
  for (const item of items) {
    const group = groups.find((g) => key(g.category) === key(item.category));
    if (group) group.items.push(item);
    else groups.push({ category: item.category, items: [item] });
  }
  return groups;
}

function localIsoDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getAvailableDates(days = 14) {
  const formatter = new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });

  return Array.from({ length: days }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);

    return {
      // Fecha LOCAL: con toISOString() el día se corría a medianoche (UTC) y se pedían huecos del día anterior.
      id: localIsoDate(date),
      label: index === 0 ? 'Hoy' : index === 1 ? 'Mañana' : formatter.format(date),
      value: date,
    };
  });
}
