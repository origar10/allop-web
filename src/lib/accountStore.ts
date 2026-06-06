import { SALONS } from '../data/salons';
import type { ClientProfile, ClientBooking } from './platformApi';
import type { ServiceItem } from './salonDetails';

export interface AccountBooking {
  id: string;
  salonSlug: string;
  salonName: string;
  serviceName: string;
  startsAt: string;
  status: 'confirmada' | 'pendiente' | 'cancelada' | 'completada';
  locator: string;
  price: number;
  canReview: boolean;
}

export interface AccountProfileDraft {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  photoUrl: string;
}

export interface NotificationPreferences {
  // Channels
  sms: boolean;
  email: boolean;
  whatsapp: boolean;
  // Transactional events (sent when at least one channel is active)
  confirmaciones: boolean;
  recordatorios: boolean;
  cancelaciones: boolean;
  // Commercial (fully optional)
  novedades: boolean;
  ofertas: boolean;
}

export type CommsEvent = 'confirmacion' | 'recordatorio_24h' | 'recordatorio_2h' | 'cancelacion';
export type CommsChannel = 'sms' | 'email' | 'whatsapp';

export interface CommsHistoryEntry {
  id: string;
  event: CommsEvent;
  channel: CommsChannel;
  salonName: string;
  serviceName: string;
  bookingDate: string;
  bookingTime: string;
  sentAt: string;
  locator?: string;
}

export interface AccountReview {
  bookingId: string;
  rating: number;
  text: string;
  createdAt: string;
}

const FAVORITES_KEY = 'allop.account.favorites';
const BOOKINGS_KEY = 'allop.account.bookings';
const PROFILE_KEY = 'allop.account.profile';
const PREFS_KEY = 'allop.account.notificationPrefs';
const REVIEWS_KEY = 'allop.account.reviews';
const COMMS_KEY = 'allop.account.commsHistory';

const PREFS_DEFAULT: NotificationPreferences = {
  sms: true,
  email: false,
  whatsapp: false,
  confirmaciones: true,
  recordatorios: true,
  cancelaciones: true,
  novedades: false,
  ofertas: false,
};

function readJson<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || '') as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadFavoriteSlugs() {
  return readJson<string[]>(FAVORITES_KEY, []);
}

export function saveFavoriteSlugs(slugs: string[]) {
  writeJson(FAVORITES_KEY, [...new Set(slugs)]);
}

export function isFavoriteSalon(slug: string) {
  return loadFavoriteSlugs().includes(slug);
}

export function toggleFavoriteSalon(slug: string) {
  const current = loadFavoriteSlugs();
  const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug];
  saveFavoriteSlugs(next);
  return next.includes(slug);
}

export function loadStoredBookings() {
  return readJson<AccountBooking[]>(BOOKINGS_KEY, []);
}

export function saveStoredBookings(bookings: AccountBooking[]) {
  writeJson(BOOKINGS_KEY, bookings);
}

export function addStoredBooking(booking: AccountBooking) {
  const current = loadStoredBookings();
  saveStoredBookings([booking, ...current.filter((item) => item.id !== booking.id)]);
}

export function cancelStoredBooking(id: string) {
  const next = loadStoredBookings().map((booking) => (
    booking.id === id ? { ...booking, status: 'cancelada' as const } : booking
  ));
  saveStoredBookings(next);
  return next;
}

export function bookingFromApi(item: ClientBooking, salonSlug: string, salonName: string): AccountBooking {
  const status = item.estado === 'cancelada' || item.estado === 'cancelled'
    ? 'cancelada'
    : item.estado === 'completada' || item.estado === 'completed'
      ? 'completada'
      : item.estado === 'confirmada' || item.estado === 'confirmed'
        ? 'confirmada'
        : 'pendiente';

  return {
    id: String(item.id),
    salonSlug,
    salonName,
    serviceName: item.servicio?.nombre || 'Reserva',
    startsAt: item.fecha_hora_inicio || new Date().toISOString(),
    status,
    locator: `ALP-${String(item.id).padStart(6, '0').slice(-6)}`,
    price: SALONS.find((salon) => salon.slug === salonSlug)?.desde || 0,
    canReview: status === 'completada',
  };
}

export function createLocalBooking(params: {
  id: string;
  salonSlug: string;
  salonName: string;
  service: ServiceItem;
  date: string;
  time: string;
  locator: string;
}) {
  const startsAt = new Date(`${params.date}T${params.time.replace(/^.*?(\d{2}:\d{2}).*$/, '$1')}:00`);

  return {
    id: params.id,
    salonSlug: params.salonSlug,
    salonName: params.salonName,
    serviceName: params.service.name,
    startsAt: Number.isNaN(startsAt.getTime()) ? new Date().toISOString() : startsAt.toISOString(),
    status: 'pendiente' as const,
    locator: params.locator,
    price: params.service.price,
    canReview: false,
  };
}

export function fallbackBookings() {
  const first = SALONS[0];
  const second = SALONS[1];
  const third = SALONS[2];
  const now = new Date();
  const upcoming = new Date(now);
  upcoming.setDate(now.getDate() + 2);
  const completed = new Date(now);
  completed.setDate(now.getDate() - 12);

  return [
    {
      id: 'fallback-next',
      salonSlug: first.slug,
      salonName: first.name,
      serviceName: 'Corte Peluquería',
      startsAt: upcoming.toISOString(),
      status: 'confirmada' as const,
      locator: 'ALP-DEMO1',
      price: first.desde,
      canReview: false,
    },
    {
      id: 'fallback-completed',
      salonSlug: second.slug,
      salonName: second.name,
      serviceName: 'Balayage',
      startsAt: completed.toISOString(),
      status: 'completada' as const,
      locator: 'ALP-DEMO2',
      price: second.desde + 12,
      canReview: true,
    },
    {
      id: 'fallback-cancelled',
      salonSlug: third.slug,
      salonName: third.name,
      serviceName: 'Corte y barba',
      startsAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 25).toISOString(),
      status: 'cancelada' as const,
      locator: 'ALP-DEMO3',
      price: third.desde,
      canReview: false,
    },
  ];
}

export function loadProfileDraft(profile: ClientProfile): AccountProfileDraft {
  const stored = readJson<Partial<AccountProfileDraft>>(PROFILE_KEY, {});

  return {
    nombre: stored.nombre || profile.nombre || '',
    apellidos: stored.apellidos || profile.apellidos || '',
    email: stored.email || '',
    telefono: stored.telefono || profile.telefono || '',
    photoUrl: stored.photoUrl || '',
  };
}

export function saveProfileDraft(profile: AccountProfileDraft) {
  writeJson(PROFILE_KEY, profile);
}

export function loadNotificationPreferences(): NotificationPreferences {
  const stored = readJson<Partial<NotificationPreferences>>(PREFS_KEY, {});
  return { ...PREFS_DEFAULT, ...stored };
}

export function saveNotificationPreferences(prefs: NotificationPreferences) {
  writeJson(PREFS_KEY, prefs);
}

export function loadCommsHistory(): CommsHistoryEntry[] {
  return readJson<CommsHistoryEntry[]>(COMMS_KEY, []);
}

export function addCommsHistoryEntry(entry: Omit<CommsHistoryEntry, 'id' | 'sentAt'>) {
  const current = loadCommsHistory();
  const newEntry: CommsHistoryEntry = {
    ...entry,
    id: `comms-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    sentAt: new Date().toISOString(),
  };
  writeJson(COMMS_KEY, [newEntry, ...current].slice(0, 50));
}

export function loadReviews() {
  return readJson<AccountReview[]>(REVIEWS_KEY, []);
}

export function saveReview(review: AccountReview) {
  const current = loadReviews();
  writeJson(REVIEWS_KEY, [review, ...current.filter((item) => item.bookingId !== review.bookingId)]);
}

export function exportAccountData() {
  return {
    profile: readJson<Partial<AccountProfileDraft>>(PROFILE_KEY, {}),
    notificationPreferences: loadNotificationPreferences(),
    favorites: loadFavoriteSlugs(),
    bookings: loadStoredBookings(),
    reviews: loadReviews(),
    commsHistory: loadCommsHistory(),
    exportedAt: new Date().toISOString(),
  };
}

export function deleteAccountData() {
  localStorage.removeItem(FAVORITES_KEY);
  localStorage.removeItem(BOOKINGS_KEY);
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(PREFS_KEY);
  localStorage.removeItem(REVIEWS_KEY);
  localStorage.removeItem(COMMS_KEY);
}
