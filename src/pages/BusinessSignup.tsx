import { ArrowRight, CheckCircle, CreditCard, FileText, Lock, MessageCircle, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { firstError, validateEmail, validateName, validatePhone, validateTaxId } from '../lib/validation';
import {
  BILLING_PLANS,
  CONTRACT_EMAIL,
  type BillingInterval,
  type BillingPlanId,
  type BillingProfile,
  buildContractMailto,
  buildSelfServiceSignup,
  calculateVat,
  formatPlanPrice,
  getBillingPlan,
  normalizeBillingPlanId,
  recordBillingEvent,
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPlan = normalizeBillingPlanId(searchParams.get('plan'));
  const [planId, setPlanId] = useState<BillingPlanId>(BILLING_PLANS.some((plan) => plan.id === initialPlan) ? initialPlan : 'basic');
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const [profile, setProfile] = useState<BillingProfile>(emptyProfile);
  const [honeypot, setHoneypot] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const plan = getBillingPlan(planId);
  const canSelectInterval = plan.monthlyPrice !== null || plan.annualPrice !== null;
  const basePrice = interval === 'annual' ? plan.annualPrice : plan.monthlyPrice;
  const vat = basePrice === null ? null : calculateVat(basePrice);
  const finalPrice = basePrice === null || vat === null ? null : basePrice + vat;
  const messageIsError = Boolean(message);

  useEffect(() => {
    setSeo({
      title: 'Alta self-service para salones | Allop',
      description: 'Crea una cuenta Basico self-service o pide presupuesto para Allop a medida.',
      canonicalPath: '/business/alta',
    });
  }, []);

  useEffect(() => {
    recordBillingEvent('plan_viewed', { planId, interval });
  }, [planId, interval]);

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

    setSubmitting(true);

    if (!plan.selfService) {
      recordBillingEvent('contract_requested', { planId, salonName: profile.salonName, email: profile.email || null });
      setSubmitting(false);
      window.location.assign(buildContractMailto(profile, plan.name));
      return;
    }

    buildSelfServiceSignup(profile, planId, interval);
    setSubmitting(false);
    navigate(`/business/alta/success?plan=${planId}&interval=${interval}&selfService=1`);
  };

  return (
    <section className="billing-page">
      <div className="container billing-layout">
        <div className="billing-copy">
          <p className="eyebrow">Alta B2B</p>
          <h1>Basico: cuenta self-service. A medida: pedir presupuesto.</h1>
          <p>Basico permite crear la cuenta sin revision manual. A medida se gestiona por contrato y abre un correo directo a {CONTRACT_EMAIL}.</p>
          <div className="billing-security">
            <span><ShieldCheck size={16} /> Alta Basico sin revision</span>
            <span><RotateCcw size={16} /> Configuracion editable despues</span>
            <span><Lock size={16} /> Contratos por email corporativo</span>
          </div>
        </div>

        <form className="billing-card" onSubmit={submitSignup}>
          <label style={{ display: 'none' }} aria-hidden="true">
            No rellenar<input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} />
          </label>

          {canSelectInterval && (
            <div className="billing-toggle" aria-label="Intervalo de facturacion">
              <button type="button" className={interval === 'monthly' ? 'active' : ''} onClick={() => setInterval('monthly')}>Mensual</button>
              <button type="button" className={interval === 'annual' ? 'active' : ''} onClick={() => setInterval('annual')}>Anual</button>
            </div>
          )}

          <div className="billing-plans">
            {BILLING_PLANS.map((item) => (
              <button key={item.id} type="button" className={planId === item.id ? 'active' : ''} onClick={() => setPlanId(item.id)}>
                <strong>{item.name}</strong>
                <span>{formatPlanPrice(item, interval)}</span>
                {item.selfService && <small>Alta sin revision manual</small>}
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
              <strong>{finalPrice === null ? (plan.selfService ? 'Alta self-service' : 'Contrato por email') : `${finalPrice.toFixed(2)} EUR`}</strong>
            </div>
          </div>

          <div className="auth-two-cols">
            <label>Salon<input value={profile.salonName} onChange={(event) => setProfile({ ...profile, salonName: event.target.value })} /></label>
            <label>Contacto<input value={profile.contactName} onChange={(event) => setProfile({ ...profile, contactName: event.target.value })} /></label>
          </div>
          <div className="auth-two-cols">
            <label>Email facturacion<input type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} /></label>
            <label>Telefono<input type="tel" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} /></label>
          </div>
          <div className="auth-two-cols">
            <label>Razon social<input value={profile.fiscalName} onChange={(event) => setProfile({ ...profile, fiscalName: event.target.value })} /></label>
            <label>NIF/CIF<input value={profile.taxId} onChange={(event) => setProfile({ ...profile, taxId: event.target.value })} /></label>
          </div>
          <label>Direccion fiscal<input value={profile.address} onChange={(event) => setProfile({ ...profile, address: event.target.value })} /></label>
          <div className="auth-two-cols">
            <label>Ciudad<input value={profile.city} onChange={(event) => setProfile({ ...profile, city: event.target.value })} /></label>
            <label>Cupon<input value={profile.coupon} onChange={(event) => setProfile({ ...profile, coupon: event.target.value })} placeholder="Opcional" /></label>
          </div>

          {message && (
            <p className={`auth-message ${messageIsError ? 'err' : 'ok'}`} role={messageIsError ? 'alert' : 'status'} aria-live={messageIsError ? 'assertive' : 'polite'}>
              {message}
            </p>
          )}

          <button className="btn btn-primary btn-lg" type="submit" disabled={submitting}>
            {submitting && <span className="inline-spinner" aria-hidden="true" />}
            {plan.selfService ? <CreditCard size={16} /> : <MessageCircle size={16} />}
            {submitting ? 'Preparando...' : plan.selfService ? 'Crear cuenta Basico' : 'Enviar correo a contratos'}
          </button>
          {plan.selfService
            ? <p className="billing-note"><FileText size={14} /> Sin revision manual: al completar el alta se crea la cuenta y puedes configurar servicios, horarios y equipo.</p>
            : <p className="billing-note"><FileText size={14} /> A medida se solicita por contrato. El formulario abrira un correo a {CONTRACT_EMAIL} con tus datos.</p>
          }
        </form>
      </div>

      <div className="container billing-next">
        <article><Sparkles size={18} /><strong>Self-service</strong><span>Basico queda activo al completar el formulario, sin cola de revision.</span></article>
        <article><CheckCircle size={18} /><strong>Configuracion</strong><span>Despues puedes ordenar servicios, horarios, equipo y datos fiscales.</span></article>
        <article><ArrowRight size={18} /><strong>Contrato</strong><span>A medida se centraliza por email en {CONTRACT_EMAIL}.</span></article>
      </div>
    </section>
  );
}
