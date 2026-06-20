const TOKEN_KEY = 'allop_dashboard_token';

export interface SalonSession {
  slug: string;
  nombre: string;
  plan: string;
  contenedor_url: string;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function decodeSession(token: string): SalonSession | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      slug: payload.slug,
      nombre: payload.nombre || payload.slug,
      plan: payload.plan,
      contenedor_url: payload.contenedor_url,
    };
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
