import { trackEvent, type AnalyticsEventName } from './analytics';
import { apiGet, apiPost } from '../shared/apiClient';
import { formatCurrency } from '../shared/formatters';
const BILLING_STATE_KEY = 'allop.billing.subscription';
const BILLING_EVENTS_KEY = 'allop.billing.events';

export type BillingPlanId = 'basic' | 'custom';
export type BillingInterval = 'monthly' | 'annual';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete';
export const CONTRACT_EMAIL = 'soporte@origar.es';

export interface BillingPlan {
  id: BillingPlanId;
  name: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  trialDays: number;
  employees: string;
  seats: string;
  bookings: string;
  reminders: string;
  support: string;
  features: string[];
  /** true → flujo Stripe Checkout; false → leads comercial / contrato */
  selfService: boolean;
  stripePriceEnvMonthly?: string;
  stripePriceEnvAnnual?: string;
}

export interface BillingProfile {
  salonName: string;
  contactName: string;
  email: string;
  phone: string;
  fiscalName: string;
  taxId: string;
  address: string;
  city: string;
  country: string;
  coupon: string;
}

export interface SubscriptionSnapshot {
  salonName: string;
  planId: BillingPlanId;
  interval: BillingInterval;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd: string;
  trialEndsAt?: string;
  gracePeriodEndsAt?: string;
  activationState: 'pending_setup' | 'active' | 'limited';
  portalUrl?: string;
  invoiceUrl?: string;
}

export interface BillingEvent {
  name: string;
  payload: Record<string, string | number | boolean | null>;
  createdAt: string;
}

export const BILLING_PLANS: BillingPlan[] = [
  {
    id: 'basic',
    name: 'Básico',
    monthlyPrice: 39,
    annualPrice: 390,
    trialDays: 0,
    employees: 'Hasta 7',
    seats: 'Gestor + cuentas de empleados',
    bookings: 'Sin limite',
    reminders: 'Básicos',
    support: 'Estándar',
    features: ['Alta self-service', 'Ficha pública', 'Agenda online', 'Cuentas para empleados', 'Recordatorios básicos', 'Sin revisión manual'],
    selfService: true,
    stripePriceEnvMonthly: 'STRIPE_PRICE_BASIC_MONTHLY',
    stripePriceEnvAnnual: 'STRIPE_PRICE_BASIC_ANNUAL',
  },
  {
    id: 'custom',
    name: 'A medida',
    monthlyPrice: null,
    annualPrice: null,
    trialDays: 0,
    employees: 'A medida',
    seats: 'A medida',
    bookings: 'A medida',
    reminders: 'SMS/email según contrato',
    support: 'Prioritario',
    features: ['Multi-salón', 'Roles avanzados', 'Integraciones a medida', 'Migración acompañada', 'Contrato personalizado'],
    selfService: false,
  },
];

export function normalizeBillingPlanId(value: string | null | undefined): BillingPlanId {
  if (value === 'basic' || value === 'starter') return 'basic';
  if (value === 'custom' || value === 'pro' || value === 'scale') return 'custom';
  return 'basic';
}

function readSubscription() {
  const raw = localStorage.getItem(BILLING_STATE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SubscriptionSnapshot;
  } catch {
    return null;
  }
}

function writeSubscription(subscription: SubscriptionSnapshot) {
  localStorage.setItem(BILLING_STATE_KEY, JSON.stringify(subscription));
}

function buildLocalSubscription(profile: BillingProfile, planId: BillingPlanId, interval: BillingInterval): SubscriptionSnapshot {
  const now = new Date();
  const plan = BILLING_PLANS.find((item) => item.id === planId) || BILLING_PLANS[0];
  const currentPeriodEnd = new Date(now);
  currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + (interval === 'annual' ? 12 : 1));
  const trialEndsAt = plan.trialDays ? new Date(now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000).toISOString() : undefined;

  return {
    salonName: profile.salonName,
    planId,
    interval,
    status: plan.trialDays ? 'trialing' : 'active',
    stripeCustomerId: `cus_pending_${Date.now()}`,
    stripeSubscriptionId: `sub_pending_${Date.now()}`,
    currentPeriodEnd: currentPeriodEnd.toISOString(),
    trialEndsAt,
    activationState: plan.selfService ? 'active' : 'pending_setup',
  };
}

export function getBillingPlan(planId: BillingPlanId | string | null | undefined) {
  const normalizedPlanId = normalizeBillingPlanId(planId);
  return BILLING_PLANS.find((plan) => plan.id === normalizedPlanId) || BILLING_PLANS[0];
}

export function formatPlanPrice(plan: BillingPlan, interval: BillingInterval) {
  const price = interval === 'annual' ? plan.annualPrice : plan.monthlyPrice;
  if (price === null) return 'Pedir presupuesto';
  return `${formatCurrency(price)}${interval === 'annual' ? '/ano' : '/mes'}`;
}

export function calculateVat(amount: number) {
  return Math.round(amount * 0.21 * 100) / 100;
}

export function recordBillingEvent(name: string, payload: BillingEvent['payload']) {
  const event: BillingEvent = { name, payload, createdAt: new Date().toISOString() };
  const current = JSON.parse(localStorage.getItem(BILLING_EVENTS_KEY) || '[]') as BillingEvent[];
  localStorage.setItem(BILLING_EVENTS_KEY, JSON.stringify([event, ...current].slice(0, 50)));
  trackEvent(name as AnalyticsEventName, payload);
}

export async function createCheckoutSession(planId: BillingPlanId, interval: BillingInterval, profile: BillingProfile) {
  const plan = getBillingPlan(planId);
  recordBillingEvent('checkout_started', { planId, interval, salonName: profile.salonName, coupon: profile.coupon || null });

  if (!plan.selfService) {
    recordBillingEvent('contract_requested', { planId, salonName: profile.salonName, email: profile.email || null });
    return { url: buildContractMailto(profile, plan.name), localFallback: true };
  }

  const payload = {
    planId,
    interval,
    profile,
    successUrl: `${window.location.origin}/business/alta/success?plan=${planId}&interval=${interval}`,
    cancelUrl: `${window.location.origin}/business/alta/cancel?plan=${planId}&interval=${interval}`,
  };

  try {
    const data = await apiPost<{ url?: string; subscription?: SubscriptionSnapshot }>('/billing/checkout-sessions', payload);
    if (data.subscription) writeSubscription(data.subscription);
    if (!data.url) throw new Error('El backend no devolvio URL de Checkout.');

    return { url: data.url, localFallback: false };
  } catch {
    const subscription = buildLocalSubscription(profile, planId, interval);
    writeSubscription(subscription);
    return { url: `/business/alta/success?plan=${planId}&interval=${interval}&fallback=1`, localFallback: true };
  }
}

export function buildSelfServiceSignup(profile: BillingProfile, planId: BillingPlanId = 'basic', interval: BillingInterval = 'monthly') {
  const subscription = buildLocalSubscription(profile, planId, interval);
  writeSubscription(subscription);
  recordBillingEvent('self_service_signup_completed', { planId, salonName: profile.salonName, email: profile.email || null });
  return subscription;
}

export function buildContractMailto(profile: BillingProfile, planName = 'A medida') {
  const subject = encodeURIComponent(`Contrato Allop ${planName} - ${profile.salonName || 'salón'}`);
  const body = encodeURIComponent([
    `Hola, quiero pedir presupuesto/contrato para el plan ${planName}.`,
    '',
    `Salón: ${profile.salonName || '-'}`,
    `Contacto: ${profile.contactName || '-'}`,
    `Email: ${profile.email || '-'}`,
    `Teléfono: ${profile.phone || '-'}`,
    `Razón social: ${profile.fiscalName || '-'}`,
    `NIF/CIF: ${profile.taxId || '-'}`,
    `Dirección fiscal: ${profile.address || '-'}`,
    `Ciudad: ${profile.city || '-'}`,
    `Cupón: ${profile.coupon || '-'}`,
  ].join('\n'));
  return `mailto:${CONTRACT_EMAIL}?subject=${subject}&body=${body}`;
}

export async function openCustomerPortal() {
  recordBillingEvent('portal_opened', {});

  try {
    const data = await apiPost<{ url?: string }>('/billing/customer-portal');
    if (!data.url) throw new Error('El backend no devolvio URL de portal.');

    return { url: data.url, localFallback: false };
  } catch {
    const subscription = readSubscription();
    if (subscription) {
      writeSubscription({ ...subscription, portalUrl: '/business/alta/success?portal=fallback' });
    }
    return { url: '/business/alta/success?portal=fallback', localFallback: true };
  }
}

export async function getSubscriptionStatus() {
  try {
    const subscription = await apiGet<SubscriptionSnapshot>('/billing/subscription');
    writeSubscription(subscription);
    return subscription;
  } catch {
    return readSubscription();
  }
}

export function applyWebhookSnapshot(eventName: string, subscription: SubscriptionSnapshot) {
  recordBillingEvent(eventName, {
    planId: subscription.planId,
    status: subscription.status,
    stripeCustomerId: subscription.stripeCustomerId || null,
    stripeSubscriptionId: subscription.stripeSubscriptionId || null,
  });
  writeSubscription(subscription);
}

export function isModuleLocked(subscription: SubscriptionSnapshot | null, module: 'agenda' | 'caja' | 'clientes' | 'multi_salon') {
  if (!subscription) return true;
  if (subscription.status === 'past_due' && subscription.gracePeriodEndsAt && new Date(subscription.gracePeriodEndsAt) < new Date()) return true;
  if (subscription.status === 'canceled' || subscription.status === 'incomplete') return true;
  if (module === 'multi_salon') return subscription.planId !== 'custom';
  if (module === 'caja' || module === 'clientes') return subscription.planId === 'basic';
  return false;
}
