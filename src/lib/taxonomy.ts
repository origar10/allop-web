import { SALONS } from '../data/salons';

export interface TaxonomyService {
  slug: string;
  label: string;
  category: string;
  aliases: string[];
  description: string;
}

export interface TaxonomyCity {
  slug: string;
  label: string;
  province: string;
  description: string;
}

export interface TaxonomyCategory {
  slug: string;
  label: string;
  description: string;
  serviceSlugs: string[];
}

export interface ServiceCityRoute {
  serviceSlug: string;
  citySlug: string;
  priority: number;
}

export interface EditorialFaq {
  intent: 'precio' | 'duracion' | 'preparacion' | 'cancelacion' | 'reservas';
  question: string;
  answer: string;
}

export interface EditorialGuide {
  audience: 'clientes' | 'salones';
  slug: string;
  title: string;
  summary: string;
  sections: { heading: string; body: string }[];
}

export const SERVICES: TaxonomyService[] = [
  {
    slug: 'peluqueria',
    label: 'Peluquería',
    category: 'Cabello',
    aliases: ['peluqueria', 'corte', 'color', 'mechas', 'balayage', 'keratina'],
    description: 'Cortes, coloración, tratamientos capilares y servicios de mantenimiento.',
  },
  {
    slug: 'barberia',
    label: 'Barbería',
    category: 'Cabello',
    aliases: ['barberia', 'barba', 'navaja', 'corte'],
    description: 'Corte masculino, arreglo de barba, afeitado y acabados con navaja.',
  },
  {
    slug: 'estetica',
    label: 'Estética',
    category: 'Belleza',
    aliases: ['estetica', 'facial', 'depilacion', 'cejas'],
    description: 'Tratamientos faciales, depilación, cejas y servicios de cuidado personal.',
  },
  {
    slug: 'unas',
    label: 'Unas',
    category: 'Belleza',
    aliases: ['unas', 'manicura', 'pedicura', 'semipermanente'],
    description: 'Manicura, pedicura y tratamientos de unas con cita online.',
  },
  {
    slug: 'masajes',
    label: 'Masajes',
    category: 'Bienestar',
    aliases: ['masajes', 'masaje', 'spa', 'ritual', 'relajante'],
    description: 'Masajes relajantes, rituales spa y experiencias de bienestar.',
  },
  {
    slug: 'maquillaje',
    label: 'Maquillaje',
    category: 'Belleza',
    aliases: ['maquillaje', 'eventos', 'imagen'],
    description: 'Maquillaje social, eventos, asesoria de imagen y preparación para ocasiones.',
  },
  {
    slug: 'manicura',
    label: 'Manicura',
    category: 'Belleza',
    aliases: ['manicura', 'unas', 'semipermanente'],
    description: 'Manicura clásica, semipermanente y servicios de cuidado de manos.',
  },
  {
    slug: 'corte',
    label: 'Corte de pelo',
    category: 'Cabello',
    aliases: ['corte', 'corte de pelo', 'peluqueria', 'barberia'],
    description: 'Cortes de pelo para todos los estilos, con precio y disponibilidad visibles.',
  },
];

export const CITIES: TaxonomyCity[] = [
  {
    slug: 'barcelona',
    label: 'Barcelona',
    province: 'Barcelona',
    description: 'Salones en Barcelona con reserva online, reseñas verificadas y horarios visibles.',
  },
  {
    slug: 'rubi',
    label: 'Rubí',
    province: 'Barcelona',
    description: 'Peluquerías, barberías y centros de estética en Rubí para reservar sin llamar.',
  },
  {
    slug: 'sabadell',
    label: 'Sabadell',
    province: 'Barcelona',
    description: 'Centros de belleza y bienestar en Sabadell con citas online y soporte Allop.',
  },
  {
    slug: 'terrassa',
    label: 'Terrassa',
    province: 'Barcelona',
    description: 'Barberías, peluquerías y servicios de belleza en Terrassa con disponibilidad clara.',
  },
];

export const CATEGORIES: TaxonomyCategory[] = [
  {
    slug: 'cabello',
    label: 'Cabello',
    description: 'Peluquerías, barberías, color, cortes y tratamientos capilares con reserva online.',
    serviceSlugs: ['peluqueria', 'barberia', 'corte'],
  },
  {
    slug: 'belleza',
    label: 'Belleza',
    description: 'Servicios de estética, manicura, maquillaje, depilación y cuidado personal.',
    serviceSlugs: ['estetica', 'unas', 'manicura', 'maquillaje'],
  },
  {
    slug: 'bienestar',
    label: 'Bienestar',
    description: 'Masajes, spa y tratamientos de bienestar para reservar sin llamadas.',
    serviceSlugs: ['masajes'],
  },
];

export const SERVICE_CITY_ROUTES: ServiceCityRoute[] = [
  { serviceSlug: 'peluqueria', citySlug: 'rubi', priority: 1 },
  { serviceSlug: 'barberia', citySlug: 'terrassa', priority: 1 },
  { serviceSlug: 'estetica', citySlug: 'sabadell', priority: 2 },
  { serviceSlug: 'manicura', citySlug: 'barcelona', priority: 2 },
  { serviceSlug: 'masajes', citySlug: 'barcelona', priority: 2 },
];

export const EDITORIAL_FAQS: EditorialFaq[] = [
  {
    intent: 'precio',
    question: 'Cuanto cuesta reservar un servicio en Allop?',
    answer: 'La reserva en Allop no añade una comisión visible al cliente. Cada salón muestra su precio desde y el detalle final se revisa antes de confirmar.',
  },
  {
    intent: 'duracion',
    question: 'Como se calcula la duración de la cita?',
    answer: 'La duración depende del servicio y del profesional. En el flujo de reserva se indica el tiempo estimado para que puedas elegir una hora realista.',
  },
  {
    intent: 'preparacion',
    question: 'Tengo que preparar algo antes de ir al salón?',
    answer: 'Para color, tratamientos o maquillaje conviene explicar el resultado que buscas y llegar con unos minutos de margen. Si el servicio requiere preparación especial, el salón puede indicarlo en la ficha.',
  },
  {
    intent: 'cancelacion',
    question: 'Puedo cancelar una reserva?',
    answer: 'Sí, puedes cancelar desde la confirmación o desde tu área de cliente. Las condiciones concretas dependen de la política del salón y se muestran antes de reservar.',
  },
  {
    intent: 'reservas',
    question: 'La reserva queda confirmada al momento?',
    answer: 'Algunos salones confirman automáticamente y otros revisan la solicitud. Allop muestra si la cita queda pendiente o confirmada para evitar prometer disponibilidad falsa.',
  },
];

export const EDITORIAL_GUIDES: EditorialGuide[] = [
  {
    audience: 'clientes',
    slug: 'como-elegir-salon',
    title: 'Cómo elegir salón sin improvisar',
    summary: 'Criterios prácticos para comparar precio, disponibilidad, reseñas y especialidad antes de reservar.',
    sections: [
      { heading: 'Especialidad', body: 'Busca salones que mencionen claramente el servicio que necesitas: color, barbería, unas, tratamientos o eventos.' },
      { heading: 'Reseñas', body: 'Prioriza opiniones recientes y verificadas. Fijate en puntualidad, trato, claridad del precio y resultado.' },
      { heading: 'Disponibilidad', body: 'Elige una hora con margen y revisa si la reserva queda confirmada o pendiente de validación del salón.' },
    ],
  },
  {
    audience: 'clientes',
    slug: 'que-preguntar-antes-de-reservar',
    title: 'Que preguntar antes de reservar',
    summary: 'Preguntas útiles sobre precio final, duración, preparación y política de cancelación.',
    sections: [
      { heading: 'Precio final', body: 'Pregunta si el precio desde incluye lavado, peinado, producto extra o diagnostico previo.' },
      { heading: 'Tiempo real', body: 'Confirma la duración si vas justo de agenda, sobre todo en color, tratamientos y servicios combinados.' },
      { heading: 'Cambios', body: 'Revisa como cancelar o mover la cita y cuanto margen pide el salón.' },
    ],
  },
  {
    audience: 'clientes',
    slug: 'cuidado-post-servicio',
    title: 'Cuidado post-servicio',
    summary: 'Consejos evergreen para mantener el resultado tras corte, color, manicura o tratamiento.',
    sections: [
      { heading: 'Después de color', body: 'Usa productos recomendados por el profesional y evita lavados agresivos durante los primeros días.' },
      { heading: 'Después de manicura', body: 'Protege las manos de productos abrasivos y reserva mantenimiento antes de que el servicio pierda forma.' },
      { heading: 'Seguimiento', body: 'Guarda el salón favorito para repetir con el mismo equipo si el resultado encaja.' },
    ],
  },
  {
    audience: 'salones',
    slug: 'reducir-ausencias',
    title: 'Reducir ausencias en el salón',
    summary: 'Medidas simples para bajar no-shows con recordatorios, reglas claras y seguimiento.',
    sections: [
      { heading: 'Recordatorios', body: 'Envia avisos 24 horas antes y el mismo dia para que el cliente recuerde la cita.' },
      { heading: 'Política clara', body: 'Explica cancelación, retrasos y no-show antes de confirmar la reserva.' },
      { heading: 'Historial', body: 'Registra incidencias para detectar patrones y ajustar la agenda.' },
    ],
  },
  {
    audience: 'salones',
    slug: 'organizar-agenda',
    title: 'Organizar agenda de salón',
    summary: 'Como ordenar servicios, duraciones, profesionales y huecos para vender mejor la disponibilidad.',
    sections: [
      { heading: 'Servicios', body: 'Define duración y precio desde para cada servicio y evita bloques genericos dificiles de reservar.' },
      { heading: 'Profesionales', body: 'Asigna servicios por empleado para mostrar disponibilidad real sin llamadas manuales.' },
      { heading: 'Buffer', body: 'Reserva margen entre citas complejas para evitar retrasos en cadena.' },
    ],
  },
  {
    audience: 'salones',
    slug: 'captar-y-fidelizar-clientes',
    title: 'Captar y fidelizar clientes',
    summary: 'Acciones concretas para convertir búsquedas locales en reservas recurrentes.',
    sections: [
      { heading: 'Ficha pública', body: 'Mantener fotos, servicios, horarios y políticas al dia ayuda a que el cliente decida sin llamar.' },
      { heading: 'Reseñas', body: 'Pide valoración después de una visita completada y responde con contexto cuando sea necesario.' },
      { heading: 'Repetición', body: 'Usa favoritos, recordatorios y puntos para que la siguiente cita sea fácil de cerrar.' },
    ],
  },
];

export function normalizeSlug(value: string) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function normalizeSearch(value: string) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

export function findService(slug: string) {
  return SERVICES.find((service) => service.slug === slug);
}

export function findCity(slug: string) {
  return CITIES.find((city) => city.slug === slug);
}

export function findCategory(slug: string) {
  return CATEGORIES.find((category) => category.slug === slug);
}

export function findGuide(audience: string, slug: string) {
  return EDITORIAL_GUIDES.find((guide) => guide.audience === audience && guide.slug === slug);
}

export function matchesService(value: string, service: TaxonomyService) {
  const haystack = normalizeSearch(value);
  return service.aliases.some((alias) => haystack.includes(normalizeSearch(alias)));
}

export function topSalonSlugs() {
  return SALONS.map((salon) => salon.slug);
}
