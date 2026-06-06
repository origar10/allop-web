import { apiGet, apiPost } from '../shared/apiClient';
import { cachedRequest } from '../shared/requestCache';

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

export function listPublicSalons(signal?: AbortSignal) {
  if (signal) return apiGet<PublicSalon[]>('/salones', { signal });
  return cachedRequest('platform:public-salons', () => apiGet<PublicSalon[]>('/salones'));
}

export function requestClientOtp(slug: string, telefono: string, purpose: ClientAuthPurpose) {
  return apiPost<ClientOtpRequest>(`/salones/${encodeURIComponent(slug)}/auth/cliente/otp/request`, { telefono, purpose });
}

export function verifyClientOtp(
  slug: string,
  params: { challengeId: number; telefono: string; code: string; purpose: ClientAuthPurpose },
) {
  return apiPost<ClientOtpVerification>(`/salones/${encodeURIComponent(slug)}/auth/cliente/otp/verify`, params);
}

export function registerClient(
  slug: string,
  params: { nombre: string; apellidos?: string; email?: string; telefono: string; verificationToken: string },
) {
  return apiPost<ClientAuthResponse>(`/salones/${encodeURIComponent(slug)}/auth/cliente/register`, { ...params, consentimientoRGPD: true });
}

export function loginClient(slug: string, params: { telefono: string; verificationToken: string }) {
  return apiPost<ClientAuthResponse>(`/salones/${encodeURIComponent(slug)}/auth/cliente/login`, params);
}

export async function getClientMe(slug: string, token: string, signal?: AbortSignal) {
  try {
    return await apiGet<ClientProfile>('/clientes/me', { token, signal });
  } catch (error) {
    if (signal?.aborted) throw error;
    return apiGet<ClientProfile>(`/salones/${encodeURIComponent(slug)}/auth/cliente/me`, { token, signal });
  }
}

export async function getClientBookings(slug: string, token: string, signal?: AbortSignal) {
  try {
    return await apiGet<ClientBooking[]>('/clientes/me/reservas', { token, signal });
  } catch (error) {
    if (signal?.aborted) throw error;
    return apiGet<ClientBooking[]>(`/salones/${encodeURIComponent(slug)}/clientes/me/reservas`, { token, signal });
  }
}
