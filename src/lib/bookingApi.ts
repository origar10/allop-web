import type { PublicService } from '../data/salons';
import { toServiceItem, type ProfessionalItem, type ServiceItem } from './salonDetails';
import { apiGet, apiPost } from '../shared/apiClient';
import { cachedRequest } from '../shared/requestCache';

export interface BookingRequest {
  salonSlug: string;
  service: ServiceItem;
  professional: ProfessionalItem;
  date: string;
  time: string;
  clientName: string;
  phone: string;
  email?: string;
  notes?: string;
  token?: string;
  idempotencyKey: string;
}

export interface BookingConfirmation {
  id: string;
  locator: string;
  status: 'confirmed' | 'pending';
  message: string;
  notification: string;
}

export interface AvailabilityDay {
  id: string;
  label: string;
  times: string[];
}

export type DayStatus = 'available' | 'full' | 'closed';

export interface RangeDay {
  fecha: string;
  status: DayStatus;
  slotCount: number;
}

export interface DaySlots {
  status: DayStatus;
  slots: string[];
}

// La plataforma devuelve la Reserva tal cual la crea el core del salón.
type CoreReserva = Partial<{ id: number | string; estado: string }>;

export async function createBooking(params: BookingRequest): Promise<BookingConfirmation> {
  // Sin red no se inventa una confirmación: el error llega a la pantalla y el cliente reintenta.
  const payload = await apiPost<CoreReserva>(
    `/salones/${encodeURIComponent(params.salonSlug)}/reservas`,
    {
      salonSlug: params.salonSlug,
      serviceId: params.service.id,
      professionalId: params.professional.id === 'any' ? null : params.professional.id,
      date: params.date,
      time: params.time,
      clientName: params.clientName,
      phone: params.phone,
      email: params.email,
      notes: params.notes,
    },
    {
      token: params.token,
      timeoutMs: 30000,
      headers: { 'Idempotency-Key': params.idempotencyKey },
    },
  );

  const id = String(payload.id ?? '');
  const confirmed = String(payload.estado ?? '').toLowerCase() === 'confirmada';
  return {
    id,
    locator: `ALP-${id.padStart(6, '0').slice(-6)}`,
    status: confirmed ? 'confirmed' : 'pending',
    message: confirmed
      ? 'Tu cita está confirmada. Ya aparece en la agenda del salón.'
      : 'El salón ha recibido tu solicitud y te confirmará la cita.',
    notification: 'Te llegará la confirmación por SMS al teléfono de tu cuenta.',
  };
}

// Servicios que el salón publica en allop.es (visibles y con id del core), en el orden de la ficha.
export async function listApiServices(salonSlug: string, signal?: AbortSignal): Promise<ServiceItem[]> {
  try {
    const items = await apiGet<unknown>(`/salones/${encodeURIComponent(salonSlug)}/servicios`, { signal });
    return (Array.isArray(items) ? items as PublicService[] : [])
      .map(toServiceItem)
      .filter((s): s is ServiceItem => s !== null && Boolean(s.name));
  } catch {
    return [];
  }
}

// Profesionales reales que hacen este servicio (el core ya descarta a quien lo tiene excluido).
export async function listProfessionals(salonSlug: string, serviceId: string, signal?: AbortSignal): Promise<ProfessionalItem[]> {
  const items = await apiGet<unknown>(
    `/salones/${encodeURIComponent(salonSlug)}/servicios/${encodeURIComponent(serviceId)}/empleados`,
    { signal },
  );
  return (Array.isArray(items) ? items : [])
    .filter((e): e is Record<string, unknown> => typeof e === 'object' && e !== null && e.estado_activo !== false)
    .map((e) => ({
      id: String(e.id),
      name: String(e.nombre || '').trim(),
      role: 'Profesional',
      avatarUrl: typeof e.avatar_url === 'string' ? e.avatar_url : null,
      avatarColor: typeof e.avatarColor === 'string' ? e.avatarColor : null,
    }))
    .filter((e) => e.name);
}

function isDayStatus(value: unknown): value is DayStatus {
  return value === 'available' || value === 'full' || value === 'closed';
}

// Estado de cada día en un rango (qué días abre el salón / tienen hueco), usando el
// MISMO endpoint que la app móvil del salón. Devuelve un mapa fecha -> {status, slotCount}.
export async function listAvailabilityRange(
  salonSlug: string,
  params: { serviceId?: string; professionalId?: string; desde: string; hasta: string },
  signal?: AbortSignal,
): Promise<Record<string, RangeDay>> {
  const query = new URLSearchParams();
  if (params.serviceId) query.set('serviceId', params.serviceId);
  if (params.professionalId && params.professionalId !== 'any') query.set('professionalId', params.professionalId);
  query.set('desde', params.desde);
  query.set('hasta', params.hasta);

  const path = `/salones/${encodeURIComponent(salonSlug)}/disponibilidad/rango?${query.toString()}`;
  const payload = signal
    ? await apiGet<unknown>(path, { signal })
    : await cachedRequest(`booking:range:${path}`, () => apiGet<unknown>(path), 30000);

  const rawDays = (payload && typeof payload === 'object' && 'days' in payload && Array.isArray((payload as { days: unknown[] }).days))
    ? (payload as { days: unknown[] }).days
    : [];

  const map: Record<string, RangeDay> = {};
  for (const item of rawDays) {
    if (typeof item !== 'object' || item === null) continue;
    const day = item as Record<string, unknown>;
    const fecha = typeof day.fecha === 'string' ? day.fecha : null;
    if (!fecha) continue;
    map[fecha] = {
      fecha,
      status: isDayStatus(day.status) ? day.status : 'closed',
      slotCount: Number(day.slotCount) || 0,
    };
  }
  return map;
}

// Horas REALES disponibles de un día concreto (sólo huecos libres), usando el mismo
// endpoint que la app móvil del salón. Devuelve los slots tal cual los calcula el core.
export async function listDaySlots(
  salonSlug: string,
  params: { serviceId?: string; professionalId?: string; date: string },
  signal?: AbortSignal,
): Promise<DaySlots> {
  const query = new URLSearchParams();
  if (params.serviceId) query.set('serviceId', params.serviceId);
  if (params.professionalId && params.professionalId !== 'any') query.set('professionalId', params.professionalId);
  query.set('date', params.date);

  const path = `/salones/${encodeURIComponent(salonSlug)}/disponibilidad?${query.toString()}`;
  const payload = signal
    ? await apiGet<unknown>(path, { signal })
    : await cachedRequest(`booking:day:${path}`, () => apiGet<unknown>(path), 30000);

  const obj = (payload && typeof payload === 'object') ? payload as Record<string, unknown> : {};
  const slots = Array.isArray(obj.slots)
    ? obj.slots.filter((s): s is string => typeof s === 'string')
    : [];
  return {
    status: isDayStatus(obj.status) ? obj.status : (slots.length ? 'available' : 'closed'),
    slots,
  };
}
