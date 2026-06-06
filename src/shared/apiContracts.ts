// API v1 — contratos de tipos para allop-web
//
// Fuente de verdad de todas las formas HTTP entre el frontend y la API.
// Base URL: VITE_API_URL (default: https://api.allop.es/api)
// Prefijo de versión: /v1/  (ver docs/api-contracts.md para la estrategia)
//
// Cada sección corresponde a un dominio funcional. Las capas lib/* importan
// desde aquí en lugar de definir tipos propios sueltos.

// ─────────────────────────────────────────────────────────────────────────────
// COMÚN
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiErrorBody {
  message: string;
  error?: string;
  code?: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH CLIENTE
// POST /v1/auth/cliente/otp/request
// POST /v1/auth/cliente/otp/verify
// POST /v1/auth/cliente/register
// POST /v1/auth/cliente/login
// GET  /v1/clientes/me  (Bearer)
// ─────────────────────────────────────────────────────────────────────────────

export type AuthPurpose = 'LOGIN' | 'REGISTER';

export interface OtpRequestBody {
  telefono: string;
  purpose: AuthPurpose;
}

export interface OtpRequestResponse {
  challengeId: number;
  expiresInSeconds?: number;
  channel?: string;
  /** Solo en entornos de desarrollo/staging */
  debugCode?: string;
}

export interface OtpVerifyBody {
  challengeId: number;
  telefono: string;
  code: string;
  purpose: AuthPurpose;
}

export interface OtpVerifyResponse {
  verificationToken: string;
  expiresInSeconds?: number;
}

export interface ClientRegisterBody {
  nombre: string;
  apellidos?: string;
  email?: string;
  telefono: string;
  verificationToken: string;
  consentimientoRGPD: true;
}

export interface ClientLoginBody {
  telefono: string;
  verificationToken: string;
}

/** Respuesta de /register y /login */
export interface ClientAuthResponse {
  token: string;
  expiresAt?: string;
  cliente: ClientProfileV1;
}

export interface ClientProfileV1 {
  id: number;
  nombre: string;
  apellidos?: string | null;
  email?: string | null;
  telefono?: string | null;
  puntosFidelizacion?: number;
  sesionesFidelizacion?: number;
  cortesGratisDisponibles?: number;
  tierFidelizacion?: string | null;
  consentimientoRGPD?: boolean;
  fechaRegistro?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SALONES — MARKETPLACE
// GET /v1/salones  (búsqueda paginada con filtros)
// GET /v1/salones/:slug  (detalle completo)
// ─────────────────────────────────────────────────────────────────────────────

/** Query params de GET /v1/salones */
export interface MarketplaceSearchParams {
  q?: string;
  ciudad?: string;
  categoria?: string;
  precioMax?: number;
  ratingMin?: number;
  lat?: number;
  lng?: number;
  /** "hoy" | "manana" | "semana" */
  disponibilidad?: string;
  page?: number;
  perPage?: number;
  orden?: 'recomendados' | 'rating' | 'precio' | 'distancia' | 'disponibilidad';
}

export interface MarketplaceSalonItem {
  id: string | number;
  slug: string;
  nombre: string;
  categoria: string;
  ciudad: string;
  direccion: string;
  lat: number;
  lng: number;
  /** km desde las coordenadas del query, si se pasó lat/lng */
  distancia?: number;
  rating: number;
  reviews: number;
  precioDesde: number;
  telefono: string;
  descripcion: string;
  imageUrl?: string;
  /** ISO o texto legible, p. ej. "Hoy 16:00" */
  nextSlot?: string;
  badges?: Array<'abre_ahora' | 'ultimas_plazas' | 'nuevo' | 'verificado' | 'destacado'>;
  tags: string[];
  verified: boolean;
  featured: boolean;
}

export interface HorarioSemana {
  lunes?: string | null;
  martes?: string | null;
  miercoles?: string | null;
  jueves?: string | null;
  viernes?: string | null;
  sabado?: string | null;
  domingo?: string | null;
}

export interface ServiceItem {
  id: string;
  nombre: string;
  descripcion?: string;
  /** minutos */
  duracion: number;
  /** EUR */
  precio: number;
  categoria?: string;
  activo: boolean;
}

export interface ProfessionalItem {
  id: string;
  nombre: string;
  foto?: string;
  especialidades?: string[];
  activo: boolean;
}

export interface SalonPhoto {
  id: string;
  url: string;
  alt?: string;
  esPortada: boolean;
  orden: number;
}

export interface ReviewItem {
  id: string;
  rating: number;
  comentario?: string;
  clienteNombre: string;
  fecha: string;
  servicioNombre?: string;
  respuestaSalon?: string;
  estado: 'visible' | 'pendiente' | 'rechazado';
}

export interface SalonDetail extends MarketplaceSalonItem {
  descripcionLarga?: string;
  horarios: HorarioSemana;
  servicios: ServiceItem[];
  profesionales: ProfessionalItem[];
  fotos: SalonPhoto[];
  resenas: ReviewItem[];
  resenaTotal: number;
  distribucionEstrellas: Partial<Record<1 | 2 | 3 | 4 | 5, number>>;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  redesSociales?: { instagram?: string; facebook?: string; web?: string };
}

// ─────────────────────────────────────────────────────────────────────────────
// DISPONIBILIDAD
// GET /v1/salones/:slug/disponibilidad?serviceId=&professionalId=&desde=&hasta=
// ─────────────────────────────────────────────────────────────────────────────

/** Query params de disponibilidad */
export interface AvailabilityQuery {
  serviceId?: string;
  /** "any" se omite */
  professionalId?: string;
  /** YYYY-MM-DD */
  desde?: string;
  /** YYYY-MM-DD */
  hasta?: string;
}

export interface AvailabilitySlot {
  /** YYYY-MM-DD */
  id: string;
  /** "Lun 9 jun" */
  label: string;
  /** ["10:00", "10:30", ...] */
  times: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// RESERVAS
// POST /v1/reservas  (header Idempotency-Key obligatorio)
// GET  /v1/clientes/me/reservas  (Bearer)
// POST /v1/reservas/:id/cancelar
// POST /v1/reservas/:id/resenas  (Bearer)
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateBookingBody {
  salonSlug: string;
  serviceId: string;
  /** null = "cualquier profesional disponible" */
  professionalId: string | null;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM */
  time: string;
  clientName: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface BookingConfirmationV1 {
  id: string;
  /** "ALP-XXXXXX" */
  locator: string;
  status: 'confirmed' | 'pending';
  message: string;
  /** "SMS enviado a +34..." */
  notification: string;
  cancelUrl?: string;
}

export type BookingEstado = 'pendiente' | 'confirmada' | 'cancelada' | 'completada' | 'no_show';

export interface ClientBookingItem {
  id: number | string;
  locator?: string;
  estado: BookingEstado;
  /** ISO 8601 */
  fechaHoraInicio: string;
  fechaHoraFin?: string;
  salon: { slug: string; nombre: string; ciudad?: string };
  servicio: { id: string; nombre: string; precio: number };
  profesional?: { id: string; nombre: string };
  notas?: string;
  canCancel?: boolean;
  canReview?: boolean;
}

export interface CancelBookingBody {
  motivo?: string;
}

export interface CancelBookingResponse {
  id: string;
  estado: 'cancelada';
  message: string;
}

export interface CreateReviewBody {
  rating: 1 | 2 | 3 | 4 | 5;
  comentario?: string;
}

export interface CreateReviewResponse {
  id: string;
  estado: 'pendiente' | 'visible';
  message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// FAVORITOS
// GET    /v1/clientes/me/favoritos  (Bearer)
// POST   /v1/clientes/me/favoritos
// DELETE /v1/clientes/me/favoritos/:salonSlug  → 204
// ─────────────────────────────────────────────────────────────────────────────

export type FavoritesResponse = MarketplaceSalonItem[];

export interface AddFavoriteBody {
  salonSlug: string;
}

export interface FavoriteResponse {
  salonSlug: string;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// LEADS B2B
// POST /v1/leads/b2b
// ─────────────────────────────────────────────────────────────────────────────

export interface BusinessLeadBody {
  salonName: string;
  contactName: string;
  phone: string;
  email: string;
  city: string;
  teamSize: string;
  message?: string;
  /** origen del formulario: "business_landing" | "marketplace_cta" | etc. */
  source: string;
}

export interface BusinessLeadResponse {
  id: string;
  message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// BILLING / STRIPE
// POST /v1/billing/checkout-sessions
// POST /v1/billing/customer-portal
// GET  /v1/billing/subscription  (Bearer de salón)
// POST /v1/billing/webhook  (Stripe-Signature)
// ─────────────────────────────────────────────────────────────────────────────

export type BillingPlanId = 'basic' | 'custom';
export type BillingInterval = 'monthly' | 'annual';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete';

export interface BillingProfileBody {
  salonName: string;
  contactName: string;
  email: string;
  phone: string;
  fiscalName: string;
  taxId: string;
  address: string;
  city: string;
  country: string;
  coupon?: string;
}

export interface CheckoutSessionBody {
  planId: BillingPlanId;
  interval: BillingInterval;
  profile: BillingProfileBody;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResponse {
  /** URL de Stripe Checkout a la que redirigir al usuario */
  url: string;
  subscription?: SubscriptionSnapshotV1;
}

export interface CustomerPortalResponse {
  /** URL del portal de Stripe */
  url: string;
}

export interface SubscriptionSnapshotV1 {
  planId: BillingPlanId;
  interval: BillingInterval;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  /** ISO 8601 */
  currentPeriodEnd: string;
  trialEndsAt?: string;
  gracePeriodEndsAt?: string;
  activationState: 'pending_setup' | 'active' | 'limited';
  portalUrl?: string;
  invoiceUrl?: string;
  salonName?: string;
}

/**
 * Eventos Stripe esperados en POST /v1/billing/webhook.
 * El backend debe verificar la firma con `STRIPE_WEBHOOK_SECRET` antes de procesar.
 * Respuesta debe ser siempre 2xx para evitar reintentos.
 */
export type StripeWebhookEventType =
  | 'checkout.session.completed'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'invoice.paid'
  | 'invoice.payment_failed';
