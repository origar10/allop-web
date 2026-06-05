const SUPPORT_REQUESTS_KEY = 'allop.support.requests';

export interface SupportRequest {
  reason: string;
  name: string;
  email: string;
  phone: string;
  bookingLocator?: string;
  salonSlug?: string;
  message: string;
  createdAt: string;
}

export function saveSupportRequest(request: SupportRequest) {
  const current = JSON.parse(localStorage.getItem(SUPPORT_REQUESTS_KEY) || '[]') as SupportRequest[];
  localStorage.setItem(SUPPORT_REQUESTS_KEY, JSON.stringify([request, ...current]));
}
