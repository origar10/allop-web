import { ArrowRight, CheckCircle, CreditCard, FileText, Lock, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BILLING_PLANS,
  type BillingInterval,
  type BillingPlanId,
  type BillingProfile,
  calculateVat,
  createCheckoutSession,
  formatPlanPrice,
  getBillingPlan,
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
  const initialPlan = (searchParams.get('plan') as BillingPlanId) || 'pro';
  const [planId, setPlanId] = useState<BillingPlanId>(BILLING_PLANS.some((plan) => plan.id === initialPlan) ? initialPlan : 'pro');
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const [profile, setProfile] = useState<BillingProfile>(emptyProfile);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const plan = getBillingPlan(planId);
  const basePrice = interval === 'annual' ? plan.annualPrice : plan.monthlyPrice;
  const vat = basePrice === null ? null : calculateVat(basePrice);
  const finalPrice = basePrice === null || vat === null ? null : basePrice + vat;

  useEffect(() => {
    setSeo({
      title: 'Alta self-service para salones | Allop',
      description: 'Elige plan, introduce datos fiscales y empieza el alta B2B de Allop mediante Stripe Checkout.',
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

  const submitCheckout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (planId === 'scale') {
      navigate('/business#business-contact');
      return;
    }

    if (!profile.salonName.trim() || !profile.contactName.trim() || !profile.email.trim() || !profile.taxId.trim()) {
      setMessage('Indica salon, contacto, email y NIF/CIF para preparar la factura.');
      return;
    }

    setSubmitting(true);
    const result = await createCheckoutSession(planId, interval, profile);
    setSubmitting(false);

    if (result.localFallback) {
      setMessage('Checkout simulado guardado. Cuando el backend Stripe responda, esta accion redirigira a Stripe Checkout.');
      navigate(result.url);
      return;
    }

    window.location.href = result.url;
  };

  return (
    <section className="billing-page">
      <div className="container billing-layout">
        <div className="billing-copy">
          <p className="eyebrow">Alta self-service B2B</p>
          <h1>Elige plan y empieza sin esperar a una demo.</h1>
          <p>Este flujo es solo para salones B2B. Los pagos de clientes por reserva quedan como decision futura: prepago, senal, no-show fee o pago completo.</p>
          <div className="billing-security">
            <span><ShieldCheck size={16} /> Tarjeta solo en Stripe</span>
            <span><RotateCcw size={16} /> Portal para facturas y cambios</span>
            <span><Lock size={16} /> Secret keys solo en backend</span>
          </div>
        </div>

        <form className="billing-card" onSubmit={submitCheckout}>
          <div className="billing-toggle" aria-label="Intervalo de facturacion">
            <button type="button" className={interval === 'monthly' ? 'active' : ''} onClick={() => setInterval('monthly')}>Mensual</button>
            <button type="button" className={interval === 'annual' ? 'active' : ''} onClick={() => setInterval('annual')}>Anual</button>
          </div>

          <div className="billing-plans">
            {BILLING_PLANS.map((item) => (
              <button key={item.id} type="button" className={planId === item.id ? 'active' : ''} onClick={() => setPlanId(item.id)}>
                <strong>{item.name}</strong>
                <span>{formatPlanPrice(item, interval)}</span>
                {item.trialDays > 0 && <small>{item.trialDays} dias de trial</small>}
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
              <strong>{basePrice === null ? 'A medida' : `${basePrice} EUR`}</strong>
              <span>IVA 21%</span>
              <strong>{vat === null ? 'A medida' : `${vat.toFixed(2)} EUR`}</strong>
              <span>Total</span>
              <strong>{finalPrice === null ? 'Hablar con ventas' : `${finalPrice.toFixed(2)} EUR`}</strong>
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

          {message && <p className={`auth-message ${message.startsWith('Indica') ? 'err' : 'ok'}`}>{message}</p>}

          <button className="btn btn-primary btn-lg" type="submit" disabled={submitting}>
            <CreditCard size={16} />
            {submitting ? 'Preparando checkout...' : planId === 'scale' ? 'Solicitar propuesta' : 'Ir a Stripe Checkout'}
          </button>
          <p className="billing-note"><FileText size={14} /> Allop no guarda datos de tarjeta. Stripe gestiona el pago, metodo de cobro y facturas.</p>
        </form>
      </div>

      <div className="container billing-next">
        <article><Sparkles size={18} /><strong>Onboarding</strong><span>Tras el pago queda pendiente configurar servicios, horarios y equipo.</span></article>
        <article><CheckCircle size={18} /><strong>Grace period</strong><span>Impago: 7 dias de aviso antes de limitar modulos no esenciales.</span></article>
        <article><ArrowRight size={18} /><strong>Portal</strong><span>El salon podra cambiar plan, tarjeta, facturas y cancelacion desde Stripe Customer Portal.</span></article>
      </div>
    </section>
  );
}
