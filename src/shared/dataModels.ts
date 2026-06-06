// Modelos de dominio — allop-web
//
// Entidades completas del negocio: campos, relaciones y tipos de estado.
// Distinción respecto a apiContracts.ts:
//   - apiContracts.ts  → formas HTTP (request/response de cada endpoint)
//   - dataModels.ts    → entidades del dominio con todos sus campos y relaciones
//
// Las capas lib/* y pages/* deben importar tipos de aquí cuando necesiten
// el modelo completo, y de apiContracts.ts cuando mapeen respuestas de API.

// ─────────────────────────────────────────────────────────────────────────────
// SALON
// ─────────────────────────────────────────────────────────────────────────────

export type SalonStatus = 'draft' | 'review' | 'active' | 'suspended' | 'deleted';

export type SalonCategory =
  | 'peluqueria'
  | 'barberia'
  | 'estetica'
  | 'unas'
  | 'masajes'
  | 'maquillaje';

export interface HorarioSemana {
  lunes?: string | null;
  martes?: string | null;
  miercoles?: string | null;
  jueves?: string | null;
  viernes?: string | null;
  sabado?: string | null;
  domingo?: string | null;
}

export interface Salon {
  id: string;
  slug: string;

  // Identidad
  nombreComercial: string;
  descripcionCorta: string;
  descripcionLarga?: string;

  // Taxonomía
  categoriasPrincipal: SalonCategory;
  categoriasSecundarias?: SalonCategory[];
  tags?: string[];

  // Localización
  direccion: string;
  ciudad: string;
  codigoPostal?: string;
  provincia?: string;
  pais?: string;
  lat: number;
  lng: number;

  // Contacto
  telefono: string;
  email?: string;
  web?: string;
  instagram?: string;
  facebook?: string;

  // Valoración (campos calculados)
  rating: number;
  totalResenas: number;

  // Negocio
  precioDesde: number;
  moneda?: string;
  horarios?: HorarioSemana;

  // Estado
  verificado: boolean;
  destacado: boolean;
  status: SalonStatus;
  fechaAlta: string;

  // SEO
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SALON MEDIA
// ─────────────────────────────────────────────────────────────────────────────

export type MediaEstado = 'pendiente' | 'aprobado' | 'rechazado';

export interface SalonMedia {
  id: string;
  salonId: string;
  url: string;
  alt?: string;
  esPortada: boolean;
  esGaleria: boolean;
  orden: number;
  estado: MediaEstado;
  uploadedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export interface Service {
  id: string;
  salonId: string;
  nombre: string;
  descripcion?: string;
  /** minutos */
  duracion: number;
  /** EUR */
  precio: number;
  categoriaServicio?: string;
  tags?: string[];
  activo: boolean;
  orden?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFESSIONAL
// ─────────────────────────────────────────────────────────────────────────────

export type DiaSemana =
  | 'lunes'
  | 'martes'
  | 'miercoles'
  | 'jueves'
  | 'viernes'
  | 'sabado'
  | 'domingo';

export interface ProfessionalScheduleDay {
  dia: DiaSemana;
  horaInicio: string;
  horaFin: string;
  activo: boolean;
}

export interface Professional {
  id: string;
  salonId: string;
  nombre: string;
  apellidos?: string;
  foto?: string;
  /** IDs de Service asignados */
  serviciosAsignados: string[];
  horario?: ProfessionalScheduleDay[];
  activo: boolean;
  fechaAlta: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// AVAILABILITY SLOT
// ─────────────────────────────────────────────────────────────────────────────

export interface AvailabilitySlot {
  id: string;
  salonId: string;
  serviceId: string;
  professionalId?: string | null;
  /** YYYY-MM-DD */
  fecha: string;
  /** HH:MM */
  horaInicio: string;
  /** HH:MM */
  horaFin: string;
  capacidad: number;
  reservado: number;
  disponible: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// BOOKING
// ─────────────────────────────────────────────────────────────────────────────

export type BookingEstado =
  | 'pendiente'
  | 'confirmada'
  | 'completada'
  | 'cancelada'
  | 'no_show';

export type BookingOrigen =
  | 'web'
  | 'app'
  | 'dashboard'
  | 'telefono'
  | 'walk_in';

export interface CancellationPolicy {
  /** horas antes de la cita para cancelar gratis */
  plazoGratuitoHoras: number;
  /** penalización en EUR si se cancela fuera de plazo */
  penalizacion?: number;
  descripcion?: string;
}

export interface Booking {
  id: string;
  /** "ALP-XXXXXX" */
  locator: string;

  // Relaciones
  salonId: string;
  salonSlug: string;
  /** null si es reserva como invitado */
  clientId?: string | null;
  serviceId: string;
  professionalId?: string | null;

  // Tiempo
  /** ISO 8601 */
  fechaHoraInicio: string;
  /** ISO 8601 */
  fechaHoraFin?: string;

  // Estado y origen
  estado: BookingEstado;
  origen: BookingOrigen;

  // Datos del cliente (snapshot en el momento de la reserva)
  clientName: string;
  clientPhone: string;
  clientEmail?: string;

  // Económico
  precio: number;
  moneda?: string;

  // Extra
  notas?: string;
  politicaCancelacion?: CancellationPolicy;
  idempotencyKey?: string;

  // Timestamps
  creadaEn: string;
  actualizadaEn?: string;
  canceladaEn?: string;
  motivoCancelacion?: string;

  // Campos computados (no persisten en BD)
  canCancel?: boolean;
  canReview?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// CLIENT
// ─────────────────────────────────────────────────────────────────────────────

export type TierFidelizacion = 'bronce' | 'plata' | 'oro' | 'vip';

export interface ClientNotificationPreferences {
  sms: boolean;
  email: boolean;
  whatsapp: boolean;
}

export interface Client {
  id: string | number;

  // Identidad
  nombre: string;
  apellidos?: string | null;
  email?: string | null;
  telefono: string;

  // Fidelización
  puntosFidelizacion?: number;
  sesionesFidelizacion?: number;
  cortesGratisDisponibles?: number;
  tier?: TierFidelizacion | null;

  // Consentimiento
  consentimientoRGPD: boolean;
  aceptaMarketing?: boolean;

  // Preferencias
  idiomaPreferido?: 'es' | 'ca' | 'en';
  notificaciones?: ClientNotificationPreferences;

  // Timestamps
  fechaRegistro: string;
  ultimoAcceso?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// REVIEW
// ─────────────────────────────────────────────────────────────────────────────

export type ReviewEstado = 'pendiente' | 'visible' | 'rechazado' | 'reportado';

export interface Review {
  id: string;

  // Relaciones
  bookingId: string;
  salonId: string;
  clientId: string;
  clientNombre: string;

  // Contenido
  rating: 1 | 2 | 3 | 4 | 5;
  comentario?: string;
  servicioNombre?: string;

  // Moderación
  estado: ReviewEstado;
  motivoRechazo?: string;

  // Respuesta del salón
  respuestaSalon?: string;
  respuestaEn?: string;

  // Timestamps
  creadaEn: string;
  publicadaEn?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// FAVORITE
// ─────────────────────────────────────────────────────────────────────────────

export interface Favorite {
  id?: string;
  clientId: string;
  salonId: string;
  salonSlug: string;
  creadoEn: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// BUSINESS LEAD
// ─────────────────────────────────────────────────────────────────────────────

export type LeadEstadoCRM =
  | 'nuevo'
  | 'contactado'
  | 'demo_agendada'
  | 'propuesta_enviada'
  | 'ganado'
  | 'perdido';

export interface BusinessLead {
  id?: string;

  // Datos del salón
  salonName: string;
  contactName: string;
  phone: string;
  email: string;
  city: string;
  teamSize: string;
  message?: string;

  // Atribución
  source: string;

  // CRM
  estadoCRM: LeadEstadoCRM;
  asignadoA?: string;
  notas?: string;

  // Timestamps
  createdAt: string;
  updatedAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAN
// ─────────────────────────────────────────────────────────────────────────────

export type BillingPlanId = 'basic' | 'custom';
export type BillingInterval = 'monthly' | 'annual';

export interface PlanLimits {
  empleados: string;
  seats: string;
  reservasMes: string;
  recordatorios: string;
  sedes?: string;
  soporte: string;
}

export interface Plan {
  id: BillingPlanId;
  nombre: string;
  descripcion: string;

  // Precio (null = a medida / contactar)
  precioMensual: number | null;
  precioAnual: number | null;
  trialDias: number;

  // Capacidades
  limites: PlanLimits;
  features: string[];

  // Stripe
  stripePriceIdMonthly?: string;
  stripePriceIdAnnual?: string;

  // Estado
  activo: boolean;
  destacado: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBSCRIPTION
// ─────────────────────────────────────────────────────────────────────────────

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete';

export type ActivationState = 'pending_setup' | 'active' | 'limited';

export interface Subscription {
  id?: string;

  // Relaciones
  salonId: string;
  salonName: string;
  planId: BillingPlanId;
  interval: BillingInterval;

  // Estado
  status: SubscriptionStatus;
  activationState: ActivationState;

  // Stripe
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;

  // Periodos (ISO 8601)
  currentPeriodStart?: string;
  currentPeriodEnd: string;
  trialEndsAt?: string;
  canceledAt?: string;
  gracePeriodEndsAt?: string;

  // URLs de gestión
  portalUrl?: string;
  invoiceUrl?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// INVOICE
// ─────────────────────────────────────────────────────────────────────────────

export type InvoiceEstado =
  | 'draft'
  | 'open'
  | 'paid'
  | 'void'
  | 'uncollectible';

export interface Invoice {
  id: string;

  // Relaciones
  salonId: string;
  subscriptionId?: string;

  // Económico
  importe: number;
  impuesto?: number;
  moneda: string;

  // Periodo facturado (ISO 8601)
  periodoDesde: string;
  periodoHasta: string;

  // Estado
  estado: InvoiceEstado;

  // Stripe
  stripeInvoiceId: string;

  // Acceso
  url?: string;
  pdf?: string;

  // Timestamps
  creadaEn: string;
  pagadaEn?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// BILLING PROFILE
// ─────────────────────────────────────────────────────────────────────────────

export interface BillingProfile {
  salonId: string;

  // Datos fiscales
  razonSocial: string;
  nifCif: string;
  direccionFiscal: string;
  ciudad: string;
  codigoPostal?: string;
  provincia?: string;
  pais: string;

  // Contacto facturación
  emailFacturacion: string;

  // Fiscalidad
  tipoIVA?: number;

  // Stripe
  stripeCustomerId?: string;
}
