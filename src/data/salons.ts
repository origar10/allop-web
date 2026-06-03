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
  phone: string;
  address: string;
  description: string;
  imageClass: string;
  nextSlot: string;
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
    phone: '+34931234567',
    address: 'Rubí, Barcelona',
    description: 'Peluquería de barrio con agenda online, coloración, mechas y cortes para toda la familia.',
    imageClass: 'salon-img-feromi',
    nextSlot: 'Hoy 17:30',
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
    description: 'Especialistas en color, balayage y tratamientos capilares de larga duración.',
    imageClass: 'salon-img-lumiere',
    nextSlot: 'Mañana 10:00',
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
    description: 'Barbería clásica con cortes rápidos, arreglo de barba y servicio de navaja.',
    imageClass: 'salon-img-marcel',
    nextSlot: 'Hoy 19:00',
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
    description: 'Centro de estética para manicura, faciales y depilación con reserva inmediata.',
    imageClass: 'salon-img-nuvo',
    nextSlot: 'Viernes 12:30',
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
    description: 'Masajes relajantes, rituales spa y tratamientos de bienestar con cabinas privadas.',
    imageClass: 'salon-img-aura',
    nextSlot: 'Mañana 18:00',
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
    description: 'Maquillaje social, eventos e imagen personal con profesionales certificados.',
    imageClass: 'salon-img-glow',
    nextSlot: 'Sábado 11:00',
  },
];
