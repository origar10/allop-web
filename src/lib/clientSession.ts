import type { ClientAuthResponse } from './platformApi';

export interface ClientSession extends ClientAuthResponse {
  salonSlug: string;
  salonName: string;
  createdAt: string;
}

const CURRENT_SESSION_KEY = 'allop.client.session';

export function clientSessionKey(slug: string) {
  return `allop.client.session.${slug}`;
}

export function legacyClientSessionKey(slug: string) {
  return `allop.session.${slug}`;
}

export function saveClientSession(session: ClientSession) {
  const serialized = JSON.stringify(session);

  localStorage.setItem(CURRENT_SESSION_KEY, serialized);
  localStorage.setItem(clientSessionKey(session.salonSlug), serialized);
  localStorage.setItem(legacyClientSessionKey(session.salonSlug), JSON.stringify({
    token: session.token,
    cliente: session.cliente,
  }));
}

export function loadClientSession(slug?: string): ClientSession | null {
  const key = slug ? clientSessionKey(slug) : CURRENT_SESSION_KEY;

  try {
    const session = JSON.parse(localStorage.getItem(key) || 'null') as ClientSession | null;
    if (session?.token) return session;
    if (!slug) return null;

    const globalSession = JSON.parse(localStorage.getItem(CURRENT_SESSION_KEY) || 'null') as ClientSession | null;
    return globalSession?.token ? globalSession : null;
  } catch {
    return null;
  }
}

export function clearClientSession(slug?: string) {
  const session = loadClientSession(slug);
  const targetSlug = slug || session?.salonSlug;

  localStorage.removeItem(CURRENT_SESSION_KEY);

  if (targetSlug) {
    localStorage.removeItem(clientSessionKey(targetSlug));
    localStorage.removeItem(legacyClientSessionKey(targetSlug));
  }
}
