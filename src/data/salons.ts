export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountPct?: number;
  startDate: string; // ISO date YYYY-MM-DD
  endDate: string;   // ISO date YYYY-MM-DD
  conditions?: string;
}

export interface Salon {
  id: string;
  slug: string;
  name: string;
  category: string;
  location: string;
  distance: string;
  rating: number;
  reviews: number;
  desde: number;
  tags: string[];
  verified: boolean;
  featured: boolean;
  promoted?: boolean;
  phone: string;
  address: string;
  lat: number;
  lng: number;
  description: string;
  imageClass: string;
  nextSlot: string;
  badges?: string[];
  promotions?: Promotion[];
  cancelPolicy?: string;
}

export interface RecentReview {
  id: string;
  salonSlug: string;
  salonName: string;
  author: string;
  rating: number;
  text: string;
  service: string;
  date: string;
  ownerReply?: { text: string; date: string };
}

export interface PromoBanner {
  enabled: boolean;
  eyebrow: string;
  title: string;
  text: string;
  cta: string;
  query: string;
}

export const SALONS: Salon[] = [
  {
    id: 'feromi',
    slug: 'feromi',
    name: 'Feromi',
    category: 'Peluquería',
    location: 'Rubí',
    distance: '0.4 km',
    rating: 4.8,
    reviews: 132,
    desde: 18,
    tags: ['Corte', 'Color', 'Mechas'],
    verified: true,
    featured: true,
    promoted: true,
    phone: '+34931234567',
    address: 'Rubí, Barcelona',
    lat: 41.4938,
    lng: 2.0311,
    description: 'Peluquería de barrio con agenda online, coloración, mechas y cortes para toda la familia.',
    imageClass: 'salon-img-feromi',
    nextSlot: 'Hoy 17:30',
    badges: ['Abre ahora', 'Últimas plazas'],
    cancelPolicy: 'Cancelación gratuita hasta 2 horas antes de la cita. Pasado ese plazo el salón puede aplicar un cargo del 50% del servicio.',
    promotions: [
      {
        id: 'feromi-promo-1',
        title: '20% dto. en Color + Corte',
        description: 'Descuento especial en el pack Color + Corte para nuevos clientes.',
        discountPct: 20,
        startDate: '2026-06-01',
        endDate: '2026-06-30',
        conditions: 'Válido solo para nuevos clientes. No acumulable con otras ofertas.',
      },
      {
        id: 'feromi-promo-2',
        title: 'Manicura gratis con Mechas',
        description: 'Reserva un servicio de mechas y llévate una manicura básica sin coste.',
        startDate: '2026-06-15',
        endDate: '2026-07-15',
        conditions: 'Sujeto a disponibilidad. Cita previa obligatoria.',
      },
    ],
  },
  {
    id: 'lumiere-studio',
    slug: 'lumiere-studio',
    name: 'Lumière Studio',
    category: 'Peluquería',
    location: 'Barcelona',
    distance: '6.1 km',
    rating: 4.9,
    reviews: 408,
    desde: 45,
    tags: ['Balayage', 'Color', 'Keratina'],
    verified: true,
    featured: true,
    phone: '+34939876543',
    address: 'Eixample, Barcelona',
    lat: 41.3917,
    lng: 2.1649,
    description: 'Especialistas en color, balayage y tratamientos capilares de larga duración.',
    imageClass: 'salon-img-lumiere',
    nextSlot: 'Mañana 10:00',
    badges: ['Abre ahora'],
  },
  {
    id: 'barberia-marcel',
    slug: 'barberia-marcel',
    name: 'Barbería Marcel',
    category: 'Barbería',
    location: 'Terrassa',
    distance: '8.3 km',
    rating: 4.7,
    reviews: 96,
    desde: 12,
    tags: ['Corte', 'Barba', 'Navaja'],
    verified: true,
    featured: false,
    phone: '+34937654321',
    address: 'Terrassa, Barcelona',
    lat: 41.5632,
    lng: 2.0089,
    description: 'Barbería clásica con cortes rápidos, arreglo de barba y servicio de navaja.',
    imageClass: 'salon-img-marcel',
    nextSlot: 'Hoy 19:00',
    badges: ['Últimas plazas'],
  },
  {
    id: 'nuvo-beauty',
    slug: 'nuvo-beauty',
    name: 'Nuvo Beauty',
    category: 'Estética',
    location: 'Sabadell',
    distance: '9.0 km',
    rating: 4.6,
    reviews: 211,
    desde: 22,
    tags: ['Facial', 'Manicura', 'Depilación'],
    verified: true,
    featured: false,
    phone: '+34935551212',
    address: 'Sabadell, Barcelona',
    lat: 41.5483,
    lng: 2.1074,
    description: 'Centro de estética para manicura, faciales y depilación con reserva inmediata.',
    imageClass: 'salon-img-nuvo',
    nextSlot: 'Viernes 12:30',
    badges: ['Nuevo'],
  },
  {
    id: 'aura-spa',
    slug: 'aura-spa',
    name: 'Aura Spa',
    category: 'Masajes',
    location: 'Barcelona',
    distance: '8.1 km',
    rating: 4.9,
    reviews: 312,
    desde: 40,
    tags: ['Masaje', 'Spa', 'Ritual'],
    verified: true,
    featured: true,
    phone: '+34934445566',
    address: 'Gràcia, Barcelona',
    lat: 41.4066,
    lng: 2.1586,
    description: 'Masajes relajantes, rituales spa y tratamientos de bienestar con cabinas privadas.',
    imageClass: 'salon-img-aura',
    nextSlot: 'Mañana 18:00',
    badges: ['Abre ahora'],
  },
  {
    id: 'glow-studio',
    slug: 'glow-studio',
    name: 'Glow Studio',
    category: 'Maquillaje',
    location: 'Barcelona',
    distance: '9.5 km',
    rating: 4.8,
    reviews: 143,
    desde: 35,
    tags: ['Maquillaje', 'Imagen', 'Eventos'],
    verified: true,
    featured: true,
    phone: '+34930001122',
    address: 'Sants, Barcelona',
    lat: 41.3759,
    lng: 2.1372,
    description: 'Maquillaje social, eventos e imagen personal con profesionales certificados.',
    imageClass: 'salon-img-glow',
    nextSlot: 'Sábado 11:00',
    badges: ['Nuevo'],
  },
];

export const RECENT_REVIEWS: RecentReview[] = [
  {
    id: 'review-feromi-1',
    salonSlug: 'feromi',
    salonName: 'Feromi',
    author: 'Laura M.',
    rating: 5,
    text: 'Reserva rápida, trato cercano y el color quedó justo como quería.',
    service: 'Color y corte',
    date: 'Hace 2 días',
    ownerReply: {
      text: '¡Muchas gracias Laura! Fue un placer atenderte. Te esperamos pronto.',
      date: 'Hace 1 día',
    },
  },
  {
    id: 'review-lumiere-1',
    salonSlug: 'lumiere-studio',
    salonName: 'Lumière Studio',
    author: 'Marta R.',
    rating: 5,
    text: 'Muy puntuales y con una explicación clara del tratamiento.',
    service: 'Balayage',
    date: 'Hace 4 días',
  },
  {
    id: 'review-marcel-1',
    salonSlug: 'barberia-marcel',
    salonName: 'Barbería Marcel',
    author: 'Carlos P.',
    rating: 4.8,
    text: 'Buen corte, buen precio y sin tener que llamar para encontrar hora.',
    service: 'Corte y barba',
    date: 'Esta semana',
  },
];

export const PROMO_BANNER: PromoBanner = {
  enabled: true,
  eyebrow: 'Promoción activa',
  title: 'Huecos con descuento esta semana',
  text: 'Encuentra salones con últimas plazas y precios especiales en servicios de corte, color y manicura.',
  cta: 'Ver ofertas',
  query: 'Últimas plazas',
};
