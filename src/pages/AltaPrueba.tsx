import { Link } from 'react-router-dom';
import { CheckCircle, CreditCard, Lock, MailCheck, ShieldCheck, Sparkles } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { firstError, validateEmail, validateName } from '../lib/validation';
import {
  type BillingProfile,
  applyPublicPricing,
  fetchPublicPricing,
  getBillingPlan,
  registerSalon,
} from '../lib/billingApi';
import { setSeo } from '../lib/seo';
import { region } from '../lib/region';
import { fmtMoney, tr } from '../lib/tr';

// Alta Tier 1 en países con prueba gratis SIN tarjeta (region.prueba_gratis_dias, Noruega):
//  - modo alta:  nombre, contacto, email, ciudad y contraseña → email de verificación → la cuenta
//                queda activa con N días gratis (lo hace el backend al verificar).
//  - modo pagar: /business/alta?pagar=1 (enlaces antiguos) → manda a iniciar sesión en el panel:
//                el pago se abre allí, con sesión (antes bastaba el slug y salía el email del salón).
// España no pasa por aquí: sigue con BusinessSignup (pago con prueba de Stripe al darse de alta).

const vacio: BillingProfile = {
  salonName: '', contactName: '', email: '', phone: '', fiscalName: '', taxId: '', address: '', city: '', country: '', coupon: '',
};

export default function AltaPrueba({ pagar }: { pagar: boolean }) {
  const dias = region().prueba_gratis_dias ?? 0;
  const [perfil, setPerfil] = useState<BillingProfile>(vacio);
  const [password, setPassword] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [hecho, setHecho] = useState(false);
  const [, setPrecios] = useState(0);
  const plan = getBillingPlan('basic');
  // Solo informativo (precio mensual): el pago se elige y se abre en el panel.
  const precio = plan.monthlyPrice;

  useEffect(() => {
    setSeo({
      title: pagar ? tr('Activa tu suscripción | Allop') : tr('Prueba Allop gratis | Allop'),
      description: tr('Sistema de reservas para tu salón con tu propia página de reservas. {n} días gratis, sin tarjeta.', { n: dias }),
      canonicalPath: '/business/alta',
    });
    fetchPublicPricing().then((p) => { if (p) { applyPublicPricing(p); setPrecios((n) => n + 1); } });
  }, [pagar, dias]);

  const alta = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (honeypot) return;
    const error = firstError(
      validateName(perfil.salonName, tr('El nombre del salón')),
      validateName(perfil.contactName, tr('Tu nombre')),
      validateEmail(perfil.email),
    );
    if (error) { setMensaje(error); return; }
    if (password.length < 8) { setMensaje(tr('La contraseña debe tener al menos 8 caracteres.')); return; }
    setEnviando(true);
    setMensaje('');
    try {
      await registerSalon(perfil, password);
      setHecho(true);
    } catch (err) {
      setMensaje(err instanceof Error && err.message ? err.message : tr('No se ha podido completar el alta. Inténtalo de nuevo.'));
    } finally {
      setEnviando(false);
    }
  };


  if (hecho) {
    return (
      <section className="billing-page">
        <div className="container billing-result">
          <MailCheck size={38} />
          <p className="eyebrow">{tr('Alta de salón')}</p>
          <h1>{tr('Revisa tu email.')}</h1>
          <p>{tr('Te hemos enviado un enlace a {email}. Al confirmarlo empiezan tus {n} días gratis y ya puedes entrar en tu panel.', { email: perfil.email.trim(), n: dias })}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="billing-page">
      <div className="container billing-layout">
        <div className="billing-copy">
          <p className="eyebrow">{pagar ? tr('Suscripción') : tr('Alta de salón')}</p>
          <h1>{pagar ? tr('Sigue usando Allop.') : tr('Tu salón con reservas online, en unos minutos.')}</h1>
          <p>{pagar
            ? tr('Activa la suscripción para seguir con tu agenda, tus clientes y tu página de reservas. Sin permanencia: la cancelas cuando quieras.')
            : tr('Crea tu cuenta y prueba Allop {n} días gratis. No pedimos tarjeta: al terminar la prueba decides si sigues.', { n: dias })}</p>
          <div className="billing-security">
            {pagar
              ? <><span><Lock size={16} /> {tr('Pago seguro con Stripe')}</span><span><ShieldCheck size={16} /> {tr('Sin permanencia')}</span></>
              : <><span><Sparkles size={16} /> {tr('{n} días gratis', { n: dias })}</span><span><CreditCard size={16} /> {tr('Sin tarjeta')}</span><span><ShieldCheck size={16} /> {tr('Sin permanencia')}</span></>}
          </div>
        </div>

        {pagar ? (
          <div className="billing-card">
            <div className="billing-summary">
              <h2>{tr('Básico')}</h2>
              <div className="billing-total">
                <span>{tr('Precio')}</span>
                <strong>{precio === null ? '—' : `${fmtMoney(precio, 0)} ${tr('/mes')}`}</strong>
              </div>
              <p>{tr('Activa la suscripción desde tu panel, en Suscripción. Si aún te quedan días de prueba, el primer cobro llega cuando terminan.')}</p>
            </div>
            <a className="btn btn-primary btn-lg" href={`https://dashboard.${region().dominio}/suscripcion`}>
              <Lock size={16} /> {tr('Entrar en mi panel')}
            </a>
          </div>
        ) : (
          <form className="billing-card" onSubmit={alta}>
            <label style={{ display: 'none' }} aria-hidden="true">
              {tr('No rellenar')}<input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
            </label>
            <div className="auth-two-cols">
              <label>{tr('Salón')}<input value={perfil.salonName} onChange={(e) => setPerfil({ ...perfil, salonName: e.target.value })} /></label>
              <label>{tr('Tu nombre')}<input autoComplete="name" value={perfil.contactName} onChange={(e) => setPerfil({ ...perfil, contactName: e.target.value })} /></label>
            </div>
            <div className="auth-two-cols">
              <label>{tr('Email')}<input type="email" autoComplete="email" value={perfil.email} onChange={(e) => setPerfil({ ...perfil, email: e.target.value })} /></label>
              <label>{tr('Teléfono (opcional)')}<input type="tel" autoComplete="tel" value={perfil.phone} onChange={(e) => setPerfil({ ...perfil, phone: e.target.value })} /></label>
            </div>
            <label>{tr('Ciudad')}<input value={perfil.city} onChange={(e) => setPerfil({ ...perfil, city: e.target.value })} /></label>
            <label>{tr('Contraseña para entrar en tu panel y en la app')}
              <input type="password" autoComplete="new-password" minLength={8} value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder={tr('Mínimo 8 caracteres')} />
            </label>
            {mensaje && <p className="auth-message err" role="alert">{mensaje}</p>}
            <button className="btn btn-primary btn-lg" type="submit" disabled={enviando}>
              {enviando && <span className="inline-spinner" aria-hidden="true" />}
              <CheckCircle size={16} /> {enviando ? tr('Preparando...') : tr('Empezar {n} días gratis', { n: dias })}
            </button>
            <p className="billing-note"><Lock size={14} /> {tr('Sin tarjeta. Al terminar la prueba te pediremos activar la suscripción para seguir.')}</p>
            <p className="billing-note">
              {tr('Al crear la cuenta aceptas las')}{' '}<Link to="/vilkar">{tr('condiciones para salones')}</Link>{' '}
              {tr('y la')}{' '}<Link to="/personvern">{tr('política de privacidad')}</Link>.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
