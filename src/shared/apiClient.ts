export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://api.allop.es/api').replace(/\/$/, '');

const DEFAULT_TIMEOUT_MS = 10000;

export interface ApiRequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
  signal?: AbortSignal;
  timeoutMs?: number;
  headers?: HeadersInit;
}

export class ApiError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
  traceId?: string;

  constructor(message: string, options: { status?: number; code?: string; details?: unknown; traceId?: string } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
    this.traceId = options.traceId;
  }
}

function buildSignal(signal?: AbortSignal, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const abortFromSource = () => controller.abort(signal?.reason);

  if (signal?.aborted) {
    abortFromSource();
  } else {
    signal?.addEventListener('abort', abortFromSource, { once: true });
  }

  if (timeoutMs > 0) {
    timeout = setTimeout(() => {
      controller.abort(new DOMException('Request timeout', 'TimeoutError'));
    }, timeoutMs);
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      if (timeout) clearTimeout(timeout);
      signal?.removeEventListener('abort', abortFromSource);
    },
  };
}

function normalizeError(error: unknown) {
  if (error instanceof ApiError) return error;
  if (error instanceof DOMException && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
    return new ApiError('Solicitud cancelada o agotada.', { code: error.name });
  }

  return new ApiError(error instanceof Error ? error.message : 'No se pudo conectar con Allop.', { details: error });
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', headers.get('Accept') || 'application/json');

  if (options.body !== undefined) {
    headers.set('Content-Type', headers.get('Content-Type') || 'application/json');
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const { signal, cleanup } = buildSignal(options.signal, options.timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method || 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal,
    });

    const payload = response.status === 204 ? undefined : await response.json().catch(() => undefined);
    const traceId = response.headers.get('X-Trace-Id') || response.headers.get('X-Request-Id') || undefined;

    if (!response.ok) {
      const data = payload as { message?: string; error?: string; code?: string } | undefined;
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        throw new ApiError('Demasiadas solicitudes. Espera un momento y vuelve a intentarlo.', {
          status: 429,
          code: 'RATE_LIMITED',
          details: retryAfter ? { retryAfter: Number(retryAfter) } : undefined,
          traceId,
        });
      }
      throw new ApiError(data?.message || data?.error || 'No se pudo completar la solicitud.', {
        status: response.status,
        code: data?.code,
        details: payload,
        traceId,
      });
    }

    return payload as T;
  } catch (error) {
    throw normalizeError(error);
  } finally {
    cleanup();
  }
}

export function apiGet<T>(path: string, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}) {
  return apiRequest<T>(path, { ...options, method: 'GET' });
}

export function apiPost<T>(path: string, body?: unknown, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}) {
  return apiRequest<T>(path, { ...options, method: 'POST', body });
}
