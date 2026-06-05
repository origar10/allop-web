import { AlertTriangle, ArrowRight, CheckCircle, CreditCard, Lock, Receipt } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getBillingPlan, getSubscriptionStatus, openCustomerPortal, recordBillingEvent, type SubscriptionSnapshot } from '../lib/billingApi';
import { setSeo } from '../lib/seo';

export default function BusinessBillingResult({ mode }: { mode: 'success' | 'cancel' }) {
  const [searchParams] = useSearchParams();
  const [subscription, setSubscription] = useState<SubscriptionSnapshot | null>(null);
  const [portalMessage, setPortalMessage] = useState('');
  const planId = searchParams.get('plan') || subscription?.planId || 'pro';
  const plan = getBillingPlan(planId === 'starter' || planId === 'pro' || planId === 'scale' ? planId : 'pro');
  const fallback = searchParams.get('fallback') === '1';

  useEffect(() => {
    setSeo({
      title: mode === 'success' ? 'Alta recibida | Allop Business' : 'Checkout cancelado | Allop Business',
      description: mode === 'success' ? 'Estado de activacion de la suscripcion B2B de Allop.' : 'Recupera el alta self-service de Allop Business.',
      canonicalPath: mode === 'success' ? '/business/alta/success' : '/business/alta/cancel',
    });
    recordBillingEvent(mode === 'success' ? 'checkout_completed' : 'checkout_abandoned', { fallback });
    getSubscriptionStatus().then(setSubscription);
  }, [fallback, mode]);

  const openPortal = async () => {
    const result = await openCustomerPortal();
    if (result.localFallback) {
      setPortalMessage('Portal simulado. Cuando el backend responda, esta accion abrira Stripe Customer Portal.');
      return;
    }
    window.location.href = result.url;
  };

  if (mode === 'cancel') {
    return (
      <section className="billing-page">
        <div className="container billing-result">
          <AlertTriangle size={36} />
          <p className="eyebrow">Checkout cancelado</p>
          <h1>No se ha activado ningun pago.</h1>
          <p>Puedes volver al alta con el plan seleccionado, pedir ayuda o dejarlo para demo comercial. No se han guardado datos de tarjeta en Allop.</p>
          <div className="billing-result-actions">
            <Link className="btn btn-primary btn-lg" to={`/business/alta?plan=${plan.id}`}>
              Recuperar alta
              <ArrowRight size={16} />
            </Link>
            <Link className="btn btn-ghost btn-lg" to="/business#business-contact">Hablar con Allop</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="billing-page">
      <div className="container billing-result">
        <CheckCircle size={38} />
        <p className="eyebrow">Alta recibida</p>
        <h1>{fallback ? 'Checkout simulado preparado.' : 'Suscripcion enviada a Stripe.'}</h1>
        <p>El plan {plan.name} queda asociado al salon y el estado de activacion queda pendiente de configurar servicios, agenda, equipo y permisos.</p>
        <div className="billing-status-grid">
          <article><CreditCard size={18} /><strong>{subscription?.status || 'trialing'}</strong><span>Estado de suscripcion</span></article>
          <article><Receipt size={18} /><strong>{subscription?.stripeSubscriptionId || 'sub pendiente'}</strong><span>ID de suscripcion</span></article>
          <article><Lock size={18} /><strong>{subscription?.activationState || 'pending_setup'}</strong><span>Activacion del salon</span></article>
        </div>
        <div className="billing-alerts">
          <span>Pago fallido o tarjeta caducada: aviso inmediato y 7 dias de grace period.</span>
          <span>Trial terminando: aviso 3 dias antes de la primera factura.</span>
          <span>Suscripcion cancelada: acceso limitado al finalizar periodo vigente.</span>
        </div>
        {portalMessage && <p className="auth-message ok">{portalMessage}</p>}
        <div className="billing-result-actions">
          <button className="btn btn-primary btn-lg" type="button" onClick={openPortal}>
            <CreditCard size={16} />
            Abrir Customer Portal
          </button>
          <Link className="btn btn-ghost btn-lg" to="/business">Volver a Business</Link>
        </div>
      </div>
    </section>
  );
}
