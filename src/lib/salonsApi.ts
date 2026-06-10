import { SALONS, type Salon } from '../data/salons';
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
  rating: string | number;
  reviews: string | number;
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
  proximoHueco: string;
  badges: string[];
  tags: string[];
  verified: boolean;
  featured: boolean;
}>;

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
  const fallback = SALONS[index % SALONS.length];
  const slug = item.slug || fallback.slug;
  const name = item.nombre || item.name || fallback.name;

  return {
    id: String(item.id || slug),
    slug,
    name,
    category: item.categoria || item.category || fallback.category,
    location: item.ciudad || item.location || fallback.location,
    distance: asDistance(item.distancia || item.distance, fallback.distance),
    rating: asNumber(item.rating, fallback.rating),
    reviews: asNumber(item.reviews, fallback.reviews),
    desde: asNumber(item.desde || item.precioDesde, fallback.desde),
    tags: Array.isArray(item.tags) && item.tags.length ? item.tags : fallback.tags,
    verified: typeof item.verified === 'boolean' ? item.verified : fallback.verified,
    featured: typeof item.featured === 'boolean' ? item.featured : fallback.featured,
    phone: item.telefono || item.phone || fallback.phone,
    address: item.direccion || item.address || fallback.address,
    lat: asNumber(item.lat, fallback.lat),
    lng: asNumber(item.lng, fallback.lng),
    description: item.descripcion || item.description || fallback.description,
    imageClass: item.imageClass || fallback.imageClass,
    photos: buildPhotos(item.foto_portada, item.galeria),
    nextSlot: item.nextSlot || item.proximoHueco || fallback.nextSlot,
    badges: Array.isArray(item.badges) ? item.badges : fallback.badges,
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
