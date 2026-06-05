const ANALYTICS_EVENTS_KEY = 'allop.analytics.events';
const ANALYTICS_CONSENT_KEY = 'allop.analytics.consent';
const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined;

export type AnalyticsEventName =
  | 'page_view'
  | 'search'
  | 'salon_click'
  | 'booking_started'
  | 'booking_completed'
  | 'registration_completed'
  | 'business_lead_submitted'
  | 'plan_viewed'
  | 'checkout_started'
  | 'checkout_completed'
  | 'checkout_abandoned'
  | 'portal_opened'
  | 'billing_webhook_synced';

export type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;
export type AnalyticsConsent = 'accepted' | 'rejected' | null;

declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: AnalyticsProps }) => void;
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
}

export function trackPageView(pathname: string) {
  trackEvent('page_view', { path: pathname });
}
