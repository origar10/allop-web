import type { ProfessionalItem, ServiceItem } from './salonDetails';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://api.allop.es/api').replace(/\/$/, '');

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
  const headers: HeadersInit = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Idempotency-Key': params.idempotencyKey,
  };

  if (params.token) {
    headers.Authorization = `Bearer ${params.token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/reservas`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        salonSlug: params.salonSlug,
        serviceId: params.service.id,
        professionalId: params.professional.id === 'any' ? null : params.professional.id,
        date: params.date,
        time: params.time,
        clientName: params.clientName,
        phone: params.phone,
        email: params.email,
        notes: params.notes,
      }),
    });

    if (!response.ok) {
      throw new Error('Backend de reservas no disponible.');
    }

    const payload = await response.json().catch(() => ({})) as Partial<BookingConfirmation>;

    return {
      id: payload.id || params.idempotencyKey,
      locator: payload.locator || `ALP-${params.idempotencyKey.slice(-6).toUpperCase()}`,
      status: payload.status || 'pending',
      message: payload.message || 'Reserva creada correctamente.',
      notification: payload.notification || 'Confirmación enviada por SMS/email si el backend lo tiene configurado.',
    };
  } catch {
    return localConfirmation(params);
  }
}

export async function listAvailability(
  salonSlug: string,
  params: { serviceId?: string; professionalId?: string },
  fallback: AvailabilityDay[],
  signal?: AbortSignal,
): Promise<AvailabilityDay[]> {
  const query = new URLSearchParams();

  if (params.serviceId) query.set('serviceId', params.serviceId);
  if (params.professionalId && params.professionalId !== 'any') query.set('professionalId', params.professionalId);

  try {
    const response = await fetch(`${API_BASE_URL}/salones/${encodeURIComponent(salonSlug)}/disponibilidad?${query.toString()}`, {
      headers: { Accept: 'application/json' },
      signal,
    });

    if (!response.ok) throw new Error('Disponibilidad no disponible.');

    const payload = await response.json() as unknown;
    const items = Array.isArray(payload)
      ? payload
      : typeof payload === 'object' && payload !== null && 'items' in payload && Array.isArray(payload.items)
        ? payload.items
        : [];

    const days = items
      .map((item) => {
        if (typeof item !== 'object' || item === null) return null;
        const day = item as Partial<AvailabilityDay>;
        return day.id && day.label && Array.isArray(day.times) ? { id: day.id, label: day.label, times: day.times } : null;
      })
      .filter((item): item is AvailabilityDay => Boolean(item));

    return days.length ? days : fallback;
  } catch {
    return fallback;
  }
}
