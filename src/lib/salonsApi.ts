import { SALONS, type PublicReview, type PublicService, type Salon } from '../data/salons';
import { apiGet } from '../shared/apiClient';
import { cachedRequest } from '../shared/requestCache';

type PublicSalonPayload = Partial<{
  id: string | number;
  slug: string;
  nombre: string;
  name: string;
  categoria: string;
  category: string;
  ciudad: string;
  location: string;
  distancia: string | number;
  distance: string | number;
  distancia_km: number | null;
  rating: string | number | null;
  reviews: string | number | ApiReview[];
  num_reviews: number;
  web: string | null;
  desde: string | number;
  precioDesde: string | number;
  telefono: string;
  phone: string;
  direccion: string;
  address: string;
  lat: string | number;
  lng: string | number;
  descripcion: string;
  description: string;
  imageClass: string;
  foto_portada: string | null;
  galeria: string[];
  nextSlot: string;
  servicios_basicos: PublicService[] | null;
  horario_apertura: Array<{ dia: string; abierto: boolean; franjas: Array<{ inicio: string; fin: string }> }> | null;
  proximoHueco: string;
  badges: string[];
  tags: string[];
  verified: boolean;
  featured: boolean;
}>;

type ApiReview = Partial<{
  id: string | number;
  cliente_nombre: string;
  puntuacion: number;
  texto: string | null;
  respuesta_salon: string | null;
  fecha: string;
}>;

function mapReviews(value: unknown): PublicReview[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return (value as ApiReview[]).map((r, i) => ({
    id: String(r.id ?? i),
    author: r.cliente_nombre || 'Cliente',
    rating: Number(r.puntuacion) || 0,
    text: r.texto || '',
    date: r.fecha ? new Date(r.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
    ownerReply: r.respuesta_salon || undefined,
  }));
}

function asNumber(value: unknown, fallback: number) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace(',', '.'));
    if (Number.isFinite(parsed)) return parsed;
  }

  return fallback;
}

function asDistance(value: unknown, fallback: string) {
  if (typeof value === 'number' && Number.isFinite(value)) return `${value.toFixed(1)} km`;
  if (typeof value === 'string' && value.trim()) return value;
  return fallback;
}

function isRealUrl(url: string | null | undefined): url is string {
  return typeof url === 'string' && url.startsWith('http') && !url.startsWith('data:');
}

function buildPhotos(portada: string | null | undefined, galeria: string[] | undefined): string[] | undefined {
  const all = [portada, ...(galeria ?? [])].filter(isRealUrl);
  return all.length > 0 ? all : undefined;
}

function mapApiSalon(item: PublicSalonPayload, index: number): Salon {
  const fallback = SALONS.length > 0 ? SALONS[index % SALONS.length] : undefined;
  const slug = item.slug || fallback?.slug || `salon-${index}`;
  const name = item.nombre || item.name || fallback?.name || slug;

  return {
    id: String(item.id || slug),
    slug,
    name,
    category: item.categoria || item.category || fallback?.category || 'Peluquería',
    location: item.ciudad || item.location || fallback?.location || '',
    distance: asDistance(item.distancia_km ?? item.distancia ?? item.distance, fallback?.distance ?? ''),
    rating: asNumber(item.rating, fallback?.rating ?? 0),
    reviews: asNumber(item.num_reviews ?? (Array.isArray(item.reviews) ? item.reviews.length : item.reviews), fallback?.reviews ?? 0),
    reviewsList: mapReviews(item.reviews),
    web: item.web || undefined,
    desde: asNumber(item.desde || item.precioDesde, fallback?.desde ?? 0),
    tags: Array.isArray(item.tags) && item.tags.length ? item.tags : (fallback?.tags ?? []),
    verified: typeof item.verified === 'boolean' ? item.verified : (fallback?.verified ?? false),
    featured: typeof item.featured === 'boolean' ? item.featured : (fallback?.featured ?? false),
    phone: item.telefono || item.phone || fallback?.phone || '',
    address: item.direccion || item.address || fallback?.address || '',
    lat: asNumber(item.lat, fallback?.lat ?? 0),
    lng: asNumber(item.lng, fallback?.lng ?? 0),
    description: item.descripcion || item.description || fallback?.description || '',
    imageClass: item.imageClass || fallback?.imageClass || '',
    photos: buildPhotos(item.foto_portada, item.galeria),
    nextSlot: item.nextSlot || item.proximoHueco || fallback?.nextSlot || '',
    badges: Array.isArray(item.badges) ? item.badges : (fallback?.badges ?? []),
    serviciosBasicos: Array.isArray(item.servicios_basicos) ? item.servicios_basicos : undefined,
    horarioApertura: Array.isArray(item.horario_apertura) ? item.horario_apertura : undefined,
  };
}

export async function getSalonBySlug(slug: string, signal?: AbortSignal): Promise<Salon> {
  const item = await apiGet<PublicSalonPayload>(`/salones/${encodeURIComponent(slug)}`, signal ? { signal } : undefined);
  return mapApiSalon(item, 0);
}

export async function listMarketplaceSalons(signal?: AbortSignal): Promise<Salon[]> {
  const payload = signal
    ? await apiGet<unknown>('/salones', { signal })
    : await cachedRequest('marketplace:salons', () => apiGet<unknown>('/salones'));
  const items: PublicSalonPayload[] = Array.isArray(payload)
    ? payload as PublicSalonPayload[]
    : typeof payload === 'object' && payload !== null && 'items' in payload && Array.isArray(payload.items)
      ? payload.items as PublicSalonPayload[]
      : [];

  if (!items.length) {
    throw new Error('La API no devolvió salones publicados.');
  }

  return items.map((item, index) => mapApiSalon(item, index));
}
