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
  serviciosBasicos?: Array<{ nombre: string; duracion_min: number; precio: number | null; visible: boolean }>;
  horarioApertura?: Array<{ dia: string; abierto: boolean; franjas: Array<{ inicio: string; fin: string }> }>;
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
