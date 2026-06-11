import { API_BASE_URL } from '../shared/apiClient';

const ANALYTICS_EVENTS_KEY = 'allop.analytics.events';
const ANALYTICS_CONSENT_KEY = 'allop.analytics.consent';
const ANALYTICS_SESSION_KEY = 'allop.analytics.session';
const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined;

export type AnalyticsEventName =
  | 'page_view'
  | 'search'
  | 'salon_click'
  | 'booking_started'
  | 'booking_completed'
  | 'booking_abandoned'
  | 'registration_completed'
  | 'business_lead_submitted'
  | 'plan_viewed'
  | 'checkout_started'
  | 'checkout_completed'
  | 'checkout_abandoned'
  | 'portal_opened'
  | 'billing_webhook_synced'
  | 'booking_step'
  | 'booking_cancelled';

export type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;
export type AnalyticsConsent = 'accepted' | 'rejected' | null;

declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: AnalyticsProps }) => void;
  }
}

// Mapeo de eventos del front a los tipos del embudo del backoffice (POST /api/eventos).
const FUNNEL_EVENT_MAP: Partial<Record<AnalyticsEventName, string>> = {
  search: 'busqueda',
  salon_click: 'ver_ficha',
  booking_started: 'reserva_iniciada',
  booking_completed: 'reserva_completada',
  registration_completed: 'registro_cliente',
};

// Identificador de sesión anónimo (sin datos personales) para agrupar el embudo.
function getAnonSession(): string {
  try {
    let id = localStorage.getItem(ANALYTICS_SESSION_KEY);
    if (!id) {
      id = (crypto.randomUUID?.() || Math.random().toString(36).slice(2)) as string;
      localStorage.setItem(ANALYTICS_SESSION_KEY, id);
    }
    return id;
  } catch {
    return 'anon';
  }
}

// Envío anónimo de eventos de producto al backoffice (fire-and-forget).
function forwardFunnelEvent(name: AnalyticsEventName, props: AnalyticsProps) {
  const tipo = FUNNEL_EVENT_MAP[name];
  if (!tipo) return;
  const salonSlug = typeof props.salonSlug === 'string' ? props.salonSlug : undefined;
  try {
    void fetch(`${API_BASE_URL}/eventos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({ tipo, salon_slug: salonSlug, sesion_id: getAnonSession() }),
    }).catch(() => {});
  } catch {
    // la analítica nunca debe romper la navegación
  }
}

function storeEvent(name: AnalyticsEventName, props: AnalyticsProps) {
  const current = JSON.parse(localStorage.getItem(ANALYTICS_EVENTS_KEY) || '[]') as Array<{
    name: string;
    props: AnalyticsProps;
    createdAt: string;
  }>;

  localStorage.setItem(ANALYTICS_EVENTS_KEY, JSON.stringify([
    { name, props, createdAt: new Date().toISOString() },
    ...current,
  ].slice(0, 100)));
}

export function initAnalytics() {
  if (!PLAUSIBLE_DOMAIN || getAnalyticsConsent() !== 'accepted' || document.getElementById('plausible-script')) return;

  const script = document.createElement('script');
  script.id = 'plausible-script';
  script.defer = true;
  script.dataset.domain = PLAUSIBLE_DOMAIN;
  script.src = 'https://plausible.io/js/script.js';
  document.head.appendChild(script);
}

export function getAnalyticsConsent(): AnalyticsConsent {
  const value = localStorage.getItem(ANALYTICS_CONSENT_KEY);
  return value === 'accepted' || value === 'rejected' ? value : null;
}

export function setAnalyticsConsent(value: Exclude<AnalyticsConsent, null>) {
  localStorage.setItem(ANALYTICS_CONSENT_KEY, value);

  if (value === 'accepted') {
    initAnalytics();
  }
}

export function trackEvent(name: AnalyticsEventName, props: AnalyticsProps = {}) {
  const cleanProps = Object.fromEntries(
    Object.entries(props).filter(([, value]) => value !== undefined),
  ) as AnalyticsProps;

  storeEvent(name, cleanProps);
  window.plausible?.(name, { props: cleanProps });
  forwardFunnelEvent(name, cleanProps);
}

export function trackPageView(pathname: string) {
  trackEvent('page_view', { path: pathname });
}
