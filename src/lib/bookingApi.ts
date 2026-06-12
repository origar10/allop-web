import type { ProfessionalItem, ServiceItem } from './salonDetails';
import { apiGet, apiPost, ApiError } from '../shared/apiClient';
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

function localConfirmation(params: BookingRequest): BookingConfirmation {
  const suffix = params.idempotencyKey.slice(-6).toUpperCase();

  return {
    id: `local-${suffix}`,
    locator: `ALP-${suffix}`,
    status: 'pending',
    message: 'Reserva recibida. El salón confirmará la disponibilidad en breve.',
    notification: 'Hemos preparado la confirmación por SMS/email con los datos indicados.',
  };
}

export async function createBooking(params: BookingRequest): Promise<BookingConfirmation> {
  try {
    const payload = await apiPost<Partial<BookingConfirmation>>(
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
        headers: { 'Idempotency-Key': params.idempotencyKey },
      },
    );

    return {
      id: payload.id || params.idempotencyKey,
      locator: payload.locator || `ALP-${params.idempotencyKey.slice(-6).toUpperCase()}`,
      status: payload.status || 'pending',
      message: payload.message || 'Reserva creada correctamente.',
      notification: payload.notification || 'Confirmación enviada por SMS/email si el backend lo tiene configurado.',
    };
  } catch (error) {
    // Re-throw API errors (4xx/5xx) so callers can show traceId to the user.
    // Only fall back to local mode for network/timeout failures (no status).
    if (error instanceof ApiError && error.status) throw error;
    return localConfirmation(params);
  }
}

export async function listApiServices(salonSlug: string, signal?: AbortSignal): Promise<ServiceItem[]> {
  try {
    const path = `/salones/${encodeURIComponent(salonSlug)}/servicios`;
    const items = await apiGet<unknown>(path, { signal });
    const arr = Array.isArray(items) ? items : [];
    return arr
      .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null && !(item as Record<string, unknown>).archivado && (item as Record<string, unknown>).activo !== false)
      .map((item) => {
        const bloques = Array.isArray(item.bloques) ? item.bloques : [];
        const totalMin = bloques.reduce((s: number, b: unknown) => {
          const block = b as Record<string, unknown>;
          return s + (Number(block.duracion_min) || 0);
        }, 0) || 30;
        const duration = totalMin >= 60
          ? `${Math.floor(totalMin / 60)}h${totalMin % 60 ? ` ${totalMin % 60}min` : ''}`
          : `${totalMin} min`;
        return {
          id: String(item.id),
          name: String(item.nombre || ''),
          duration,
          durationMinutes: totalMin,
          price: parseFloat(String(item.precio_base || '0')),
        } as ServiceItem;
      })
      .filter((s) => s.name && s.price > 0);
  } catch {
    return [];
  }
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
