export type ClientAuthPurpose = 'LOGIN' | 'REGISTER';

export interface PublicSalon {
  slug: string;
  nombre: string;
  ciudad?: string | null;
}

export interface ClientOtpRequest {
  challengeId: number;
  expiresInSeconds?: number;
  channel?: string;
  debugCode?: string;
}

export interface ClientOtpVerification {
  verificationToken: string;
  expiresInSeconds?: number;
}

export interface ClientProfile {
  id: number;
  nombre: string;
  apellidos?: string | null;
  telefono?: string | null;
  puntosFidelizacion?: number;
  sesionesFidelizacion?: number;
  cortesGratisDisponibles?: number;
  tierFidelizacion?: string | null;
  consentimientoRGPD?: boolean;
  fechaRegistro?: string;
}

export interface ClientAuthResponse {
  token: string;
  cliente: ClientProfile;
}

export interface ClientBooking {
  id: number;
  estado?: string;
  fecha_hora_inicio?: string;
  servicio?: {
    nombre?: string;
  };
}

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://api.allop.es/api').replace(/\/$/, '');

async function platformRequest<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string } = {},
): Promise<T> {
  const headers: HeadersInit = { Accept: 'application/json' };

  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const data = payload as { message?: string; error?: string };
    throw new Error(data.message || data.error || 'No se pudo completar la solicitud.');
  }

  return payload as T;
}

export function listPublicSalons() {
  return platformRequest<PublicSalon[]>('/salones');
}

export function requestClientOtp(slug: string, telefono: string, purpose: ClientAuthPurpose) {
  return platformRequest<ClientOtpRequest>(`/salones/${encodeURIComponent(slug)}/auth/cliente/otp/request`, {
    method: 'POST',
    body: { telefono, purpose },
  });
}

export function verifyClientOtp(
  slug: string,
  params: { challengeId: number; telefono: string; code: string; purpose: ClientAuthPurpose },
) {
  return platformRequest<ClientOtpVerification>(`/salones/${encodeURIComponent(slug)}/auth/cliente/otp/verify`, {
    method: 'POST',
    body: params,
  });
}

export function registerClient(
  slug: string,
  params: { nombre: string; apellidos?: string; telefono: string; verificationToken: string },
) {
  return platformRequest<ClientAuthResponse>(`/salones/${encodeURIComponent(slug)}/auth/cliente/register`, {
    method: 'POST',
    body: { ...params, consentimientoRGPD: true },
  });
}

export function loginClient(slug: string, params: { telefono: string; verificationToken: string }) {
  return platformRequest<ClientAuthResponse>(`/salones/${encodeURIComponent(slug)}/auth/cliente/login`, {
    method: 'POST',
    body: params,
  });
}

export function getClientMe(slug: string, token: string) {
  return platformRequest<ClientProfile>(`/salones/${encodeURIComponent(slug)}/auth/cliente/me`, { token });
}

export function getClientBookings(slug: string, token: string) {
  return platformRequest<ClientBooking[]>(`/salones/${encodeURIComponent(slug)}/clientes/me/reservas`, { token });
}
