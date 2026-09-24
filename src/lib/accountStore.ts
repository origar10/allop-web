import type { ClientProfile, MarketplaceBooking } from './platformApi';
import type { ServiceItem } from './salonDetails';

export interface AccountBooking {
  id: string;
  salonSlug: string;
  salonName: string;
  serviceName: string;
  startsAt: string;
  status: 'confirmada' | 'pendiente' | 'cancelada' | 'completada';
  locator: string;
  price: number | null;
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

export function bookingFromApi(item: MarketplaceBooking): AccountBooking {
  const estado = item.estado.toLowerCase();
  const status = estado === 'cancelada' || estado === 'cancelled' || estado === 'no_show'
    ? 'cancelada'
    : estado === 'completada' || estado === 'completed'
      ? 'completada'
      : estado === 'confirmada' || estado === 'confirmed'
        ? 'confirmada'
        : 'pendiente';
  const startsAt = new Date(`${item.fecha}T${item.hora}:00`);

  return {
    id: String(item.id),
    salonSlug: item.salon.slug,
    salonName: item.salon.nombre,
    serviceName: item.servicio?.nombre || 'Reserva',
    startsAt: Number.isNaN(startsAt.getTime()) ? new Date().toISOString() : startsAt.toISOString(),
    status,
    locator: `ALP-${String(item.id).padStart(6, '0').slice(-6)}`,
    price: item.precio,
    canReview: status === 'completada' && !item.valorada,
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
