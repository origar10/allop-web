import { ArrowRight, CheckCircle, CreditCard, FileText, Lock, MessageCircle, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { firstError, validateEmail, validateName, validatePhone, validateTaxId } from '../lib/validation';
import {
  BILLING_PLANS,
  CONTRACT_EMAIL,
  type BillingInterval,
  type BillingPlanId,
  type BillingProfile,
  buildContractMailto,
  calculateVat,
  createCheckoutSession,
  registerSalon,
  formatPlanPrice,
  getBillingPlan,
  normalizeBillingPlanId,
  recordBillingEvent,
  fetchPublicPricing,
  applyPublicPricing,
} from '../lib/billingApi';
import { setSeo } from '../lib/seo';

const emptyProfile: BillingProfile = {
  salonName: '',
  contactName: '',
  email: '',
  phone: '',
  fiscalName: '',
  taxId: '',
  address: '',
  city: '',
  country: 'ES',
  coupon: '',
};

export default function BusinessSignup() {
  const [searchParams] = useSearchParams();
  const initialPlan = normalizeBillingPlanId(searchParams.get('plan'));
  const [planId, setPlanId] = useState<BillingPlanId>(BILLING_PLANS.some((plan) => plan.id === initialPlan) ? initialPlan : 'basic');
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const [profile, setProfile] = useState<BillingProfile>(emptyProfile);
  const [honeypot, setHoneypot] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [, setPricingReady] = useState(0);
  const plan = getBillingPlan(planId);
  const canSelectInterval = plan.monthlyPrice !== null || plan.annualPrice !== null;
  const basePrice = interval === 'annual' ? plan.annualPrice : plan.monthlyPrice;
  const vat = basePrice === null ? null : calculateVat(basePrice);
  const finalPrice = basePrice === null || vat === null ? null : basePrice + vat;
  const messageIsError = Boolean(message);

  useEffect(() => {
    setSeo({
      title: 'Da de alta tu salón | Allop',
      description: 'Crea tu cuenta del plan Básico en unos minutos o solicita Allop A medida.',
      canonicalPath: '/business/alta',
    });
  }, []);

  useEffect(() => {
    recordBillingEvent('plan_viewed', { planId, interval });
  }, [planId, interval]);

  useEffect(() => {
    fetchPublicPricing().then((pricing) => {
      if (pricing) { applyPublicPricing(pricing); setPricingReady((n) => n + 1); }
    });
  }, []);

  const planRows = [
    ['Usuarios', plan.seats],
    ['Empleados', plan.employees],
    ['Reservas', plan.bookings],
    ['Recordatorios', plan.reminders],
    ['Soporte', plan.support],
  ];

  const submitSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (honeypot) return;

    const error = firstError(
      validateName(profile.salonName, 'El nombre del salon'),
      validateName(profile.contactName, 'El nombre de contacto'),
      validateEmail(profile.email),
      validatePhone(profile.phone),
      validateTaxId(profile.taxId),
    );
    if (error) {
      setMessage(error);
      return;
    }
    if (plan.selfService && password.length < 8) {
      setMessage('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setSubmitting(true);

    if (!plan.selfService) {
      recordBillingEvent('contract_requested', { planId, salonName: profile.salonName, email: profile.email || null });
      setSubmitting(false);
      window.location.assign(buildContractMailto(profile, plan.name));
      return;
    }

    try {
      // 1) Se crea la cuenta del salón (con su contraseña) y 2) se abre el pago enlazado a ella.
      const cuenta = await registerSalon(profile, password);
      const result = await createCheckoutSession(planId, interval, profile, cuenta.slug);
      window.location.assign(result.url);
    } catch (err) {
      setSubmitting(false);
      setMessage(err instanceof Error && err.message ? err.message : 'No se ha podido completar el alta. Inténtalo de nuevo.');
    }
  };

  return (
    <section className="billing-page">
      <div className="container billing-layout">
        <div className="billing-copy">
          <p className="eyebrow">Alta de salón</p>
          <h1>Tu salón en Allop, en unos minutos.</h1>
          <p>Con el plan Básico creas tu cuenta ahora mismo y empiezas a configurar tu salón al momento. Si buscas web y apps con tu marca, solicita Allop A medida y te escribimos personalmente.</p>
          <div className="billing-security">
            <span><ShieldCheck size={16} /> Activo al momento</span>
            <span><RotateCcw size={16} /> Lo cambias cuando quieras</span>
            <span><Lock size={16} /> Pago seguro, sin permanencia</span>
          </div>
        </div>

        <form className="billing-card" onSubmit={submitSignup}>
          <label style={{ display: 'none' }} aria-hidden="true">
            No rellenar<input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} />
          </label>

          {canSelectInterval && (
            <div className="billing-toggle" aria-label="Forma de pago">
              <button type="button" className={interval === 'monthly' ? 'active' : ''} onClick={() => setInterval('monthly')}>Mensual</button>
              <button type="button" className={interval === 'annual' ? 'active' : ''} onClick={() => setInterval('annual')}>Anual</button>
            </div>
          )}

          <div className="billing-plans">
            {BILLING_PLANS.map((item) => (
              <button key={item.id} type="button" className={planId === item.id ? 'active' : ''} onClick={() => setPlanId(item.id)}>
                <strong>{item.name}</strong>
                <span>{formatPlanPrice(item, interval)}</span>
                {item.selfService ? <small>Activo al momento</small> : <small>Por solicitud</small>}
              </button>
            ))}
          </div>

          <div className="billing-summary">
            <h2>{plan.name}</h2>
            <p>{plan.features.join(' · ')}</p>
            <div className="billing-limit-grid">
              {planRows.map(([label, value]) => (
                <span key={label}><strong>{label}</strong>{value}</span>
              ))}
            </div>
            <div className="billing-total">
              <span>Precio</span>
              <strong>{basePrice === null ? 'Pedir presupuesto' : `${basePrice} EUR`}</strong>
              <span>IVA 21%</span>
              <strong>{vat === null ? 'Se confirma antes de contratar' : `${vat.toFixed(2)} EUR`}</strong>
              <span>Total</span>
              <strong>{finalPrice === null ? (plan.selfService ? 'Alta online' : 'Según proyecto') : `${finalPrice.toFixed(2)} EUR`}</strong>
            </div>
          </div>

          <div className="auth-two-cols">
            <label>Salón<input value={profile.salonName} onChange={(event) => setProfile({ ...profile, salonName: event.target.value })} /></label>
            <label>Contacto<input value={profile.contactName} onChange={(event) => setProfile({ ...profile, contactName: event.target.value })} /></label>
          </div>
          <div className="auth-two-cols">
            <label>Email de facturación<input type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} /></label>
            <label>Teléfono<input type="tel" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} /></label>
          </div>
          <div className="auth-two-cols">
            <label>Razón social<input value={profile.fiscalName} onChange={(event) => setProfile({ ...profile, fiscalName: event.target.value })} /></label>
            <label>NIF/CIF<input value={profile.taxId} onChange={(event) => setProfile({ ...profile, taxId: event.target.value })} /></label>
          </div>
          {plan.selfService && (
            <label>Contraseña para entrar en tu panel y en la app
              <input type="password" autoComplete="new-password" minLength={8} value={password}
                onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo 8 caracteres" />
            </label>
          )}
          <label>Dirección fiscal<input value={profile.address} onChange={(event) => setProfile({ ...profile, address: event.target.value })} /></label>
          <div className="auth-two-cols">
            <label>Ciudad<input value={profile.city} onChange={(event) => setProfile({ ...profile, city: event.target.value })} /></label>
            <label>Cupón<input value={profile.coupon} onChange={(event) => setProfile({ ...profile, coupon: event.target.value })} placeholder="Opcional" /></label>
          </div>

          {message && (
            <p className={`auth-message ${messageIsError ? 'err' : 'ok'}`} role={messageIsError ? 'alert' : 'status'} aria-live={messageIsError ? 'assertive' : 'polite'}>
              {message}
            </p>
          )}

          <button className="btn btn-primary btn-lg" type="submit" disabled={submitting}>
            {submitting && <span className="inline-spinner" aria-hidden="true" />}
            {plan.selfService ? <CreditCard size={16} /> : <MessageCircle size={16} />}
            {submitting ? 'Preparando...' : plan.selfService ? 'Continuar al pago' : 'Solicitar A medida'}
          </button>
          {plan.selfService
            ? <p className="billing-note"><FileText size={14} /> El pago lo gestiona Stripe de forma segura. Allop no guarda los datos de tu tarjeta.</p>
            : <p className="billing-note"><FileText size={14} /> Se abrirá un correo a {CONTRACT_EMAIL} con tus datos para estudiar tu proyecto.</p>
          }
        </form>
      </div>

      <div className="container billing-next">
        <article><Sparkles size={18} /><strong>Activo al momento</strong><span>El plan Básico queda activo en cuanto completas el alta.</span></article>
        <article><CheckCircle size={18} /><strong>Configuración</strong><span>Después añades servicios, horarios, equipo y datos fiscales a tu ritmo.</span></article>
        <article><ArrowRight size={18} /><strong>A medida</strong><span>Web y apps con tu marca. Escríbenos a {CONTRACT_EMAIL} y lo estudiamos contigo.</span></article>
      </div>
    </section>
  );
}
