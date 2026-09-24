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
  photos?: string[];
  nextSlot: string;
  badges?: string[];
  promotions?: Promotion[];
  cancelPolicy?: string;
  /** Web propia del salón (de su ficha). */
  web?: string;
  /** Reseñas publicadas (solo en la ficha de detalle). */
  reviewsList?: PublicReview[];
  serviciosBasicos?: PublicService[];
  horarioApertura?: Array<{ dia: string; abierto: boolean; franjas: Array<{ inicio: string; fin: string }> }>;
}

/** Servicio tal cual lo publica el salón en su ficha de allop.es. */
export interface PublicService {
  id?: number | null;
  nombre: string;
  duracion_min: number;
  /** null = el salón no enseña el precio. */
  precio: number | null;
  categoria?: string | null;
  visible?: boolean;
}

export interface PublicReview {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  ownerReply?: string;
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

export const SALONS: Salon[] = [];

export const RECENT_REVIEWS: RecentReview[] = [];
