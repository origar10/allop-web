import type { Salon } from '../data/salons';

export interface ServiceItem {
  id: string;
  name: string;
  duration: string;
  durationMinutes: number;
  price: number;
}

export interface ProfessionalItem {
  id: string;
  name: string;
  role: string;
  services: string;
}

export const WEEK_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const TIME_SLOTS = ['10:00', '11:30', '13:00', '16:30', '18:00', '19:30'];

function slugPart(value: string) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function getServices(salon: Salon): ServiceItem[] {
  const base = [
    { name: salon.tags[0] || salon.category, duration: '45 min', durationMinutes: 45, price: salon.desde },
    { name: salon.tags[1] || `Servicio ${salon.category}`, duration: '60 min', durationMinutes: 60, price: salon.desde + 12 },
    { name: salon.tags[2] || 'Tratamiento completo', duration: '90 min', durationMinutes: 90, price: salon.desde + 24 },
  ];

  return base.map((service) => {
    const name = service.name.length < 18 ? `${service.name} ${salon.category}` : service.name;

    return {
      ...service,
      id: `${salon.slug}-${slugPart(name)}`,
      name,
    };
  });
}

export function getProfessionals(salon: Salon): ProfessionalItem[] {
  const firstName = salon.name.split(' ')[0];

  return [
    {
      id: 'any',
      name: 'Cualquiera disponible',
      role: 'Asignación automática',
      services: salon.tags.join(' · ') || salon.category,
    },
    {
      id: `${salon.slug}-lead`,
      name: `${firstName} Studio`,
      role: 'Especialista principal',
      services: salon.tags.slice(0, 2).join(' · ') || salon.category,
    },
    {
      id: `${salon.slug}-team`,
      name: 'Equipo Allop verificado',
      role: 'Profesional disponible',
      services: salon.tags.slice(1).join(' · ') || 'Servicios del salón',
    },
  ];
}

export function getAvailableDates() {
  const formatter = new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });

  return Array.from({ length: 5 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);

    return {
      id: date.toISOString().slice(0, 10),
      label: index === 0 ? 'Hoy' : index === 1 ? 'Mañana' : formatter.format(date),
      value: date,
    };
  });
}
