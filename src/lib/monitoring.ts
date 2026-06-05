const MONITORING_ENDPOINT = import.meta.env.VITE_MONITORING_ENDPOINT as string | undefined;
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
const ERROR_KEY = 'allop.monitoring.errors';

interface ErrorPayload {
  message: string;
  stack?: string;
  path: string;
  componentStack?: string;
  source: 'boundary' | 'window' | 'promise' | 'manual';
  createdAt: string;
}

function storeError(payload: ErrorPayload) {
  const current = JSON.parse(localStorage.getItem(ERROR_KEY) || '[]') as ErrorPayload[];
  localStorage.setItem(ERROR_KEY, JSON.stringify([payload, ...current].slice(0, 50)));
}

async function sendError(payload: ErrorPayload) {
  const endpoint = MONITORING_ENDPOINT || SENTRY_DSN;
  if (!endpoint) return;

  await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => undefined);
}

export function captureError(error: unknown, source: ErrorPayload['source'] = 'manual', componentStack?: string) {
  const payload: ErrorPayload = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    path: window.location.pathname,
    componentStack,
    source,
    createdAt: new Date().toISOString(),
  };

  storeError(payload);
  void sendError(payload);
}

export function initMonitoring() {
  window.addEventListener('error', (event) => {
    captureError(event.error || event.message, 'window');
  });

  window.addEventListener('unhandledrejection', (event) => {
    captureError(event.reason || 'Unhandled promise rejection', 'promise');
  });
}
