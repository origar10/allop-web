import { ArrowRight, BarChart3, CalendarDays, CheckCircle, CreditCard, MessageCircle, ShieldCheck, Sparkles, Store, Users } from 'lucide-react';

interface BusinessProps {
  supportEmail: string;
  dashboardUrl: string;
}

const plans = [
  {
    name: 'Starter',
    price: '39 €',
    detail: 'Para salones que quieren empezar con reservas online.',
    features: ['Marketplace público', 'Agenda online', 'Recordatorios básicos', 'Ficha del salón'],
  },
  {
    name: 'Pro',
    price: '79 €',
    detail: 'Para equipos que quieren centralizar operación y caja.',
    features: ['Agenda por profesionales', 'Caja y cobros', 'Clientes e historial', 'Inventario básico'],
    featured: true,
  },
  {
    name: 'Scale',
    price: 'A medida',
    detail: 'Para marcas, varios salones o necesidades avanzadas.',
    features: ['Multi-salón', 'Roles avanzados', 'Soporte prioritario', 'Integraciones a medida'],
  },
];

const modules = [
  { icon: <CalendarDays size={22} />, title: 'Agenda y reservas', text: 'Reservas online, disponibilidad por profesional y gestión de citas desde el panel.' },
  { icon: <CreditCard size={22} />, title: 'Caja y facturación', text: 'Cobros, cierres de caja, facturas y trazabilidad de movimientos diarios.' },
  { icon: <Users size={22} />, title: 'Clientes', text: 'Historial, fidelización, notas internas y seguimiento de próximas visitas.' },
  { icon: <BarChart3 size={22} />, title: 'Operativa', text: 'Ventas, inventario, empleados, permisos y métricas para tomar decisiones.' },
];

export default function Business({ supportEmail, dashboardUrl }: BusinessProps) {
  const demoHref = `mailto:${supportEmail}?subject=Quiero%20registrar%20mi%20salon%20en%20Allop&body=Hola%20Allop,%0A%0AQuiero%20informacion%20para%20registrar%20mi%20salon.%0A%0ANombre%20del%20salon:%0ACiudad:%0ATelefono:%0A`;

  return (
    <>
      <section className="business-hero">
        <div className="container business-hero-grid">
          <div className="business-hero-copy">
            <p className="eyebrow">Allop para salones</p>
            <h1>Todo lo que necesita tu salón para reservar, cobrar y crecer.</h1>
            <p>
              Allop une marketplace, agenda, caja, clientes, empleados e inventario en una plataforma pensada para peluquerías, barberías y centros de estética.
            </p>
            <div className="business-actions">
              <a className="btn btn-lg btn-primary" href={demoHref}>
                Solicitar información
                <ArrowRight size={16} />
              </a>
              <a className="btn btn-lg btn-ghost" href={dashboardUrl}>Entrar al dashboard</a>
            </div>
          </div>
          <div className="business-visual" aria-label="Panel de gestión Allop">
            <div className="business-panel">
              <div className="business-panel-top">
                <span>Hoy</span>
                <strong>12 citas</strong>
              </div>
              <div className="business-panel-row"><CalendarDays size={17} /> 10:30 Corte + color</div>
              <div className="business-panel-row"><CreditCard size={17} /> Caja abierta · 284 €</div>
              <div className="business-panel-row"><Users size={17} /> 3 clientes nuevos</div>
            </div>
          </div>
        </div>
      </section>

      <section className="business-band" id="operativa">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="eyebrow">Operativa diaria</p>
              <h2 className="section-title">Una rutina completa, no solo un calendario.</h2>
            </div>
          </div>
          <div className="business-modules">
            {modules.map((module) => (
              <article className="business-module" key={module.title}>
                <div className="business-module-icon">{module.icon}</div>
                <h3>{module.title}</h3>
                <p>{module.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="business-section" id="precios">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="eyebrow">Precios</p>
              <h2 className="section-title">Planes claros para empezar y escalar.</h2>
            </div>
          </div>
          <div className="business-pricing">
            {plans.map((plan) => (
              <article className={`business-plan ${plan.featured ? 'featured' : ''}`} key={plan.name}>
                {plan.featured && <span className="plan-badge">Recomendado</span>}
                <h3>{plan.name}</h3>
                <div className="plan-price">{plan.price}<span>{plan.price.includes('€') ? '/mes' : ''}</span></div>
                <p>{plan.detail}</p>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}><CheckCircle size={16} /> {feature}</li>
                  ))}
                </ul>
                <a className={plan.featured ? 'btn btn-primary' : 'btn btn-ghost'} href={demoHref}>Hablar con Allop</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="business-band">
        <div className="container business-process">
          <article>
            <Store size={24} />
            <h3>1. Revisamos tu salón</h3>
            <p>Recogemos tus datos, servicios, horarios y necesidades de equipo.</p>
          </article>
          <article>
            <Sparkles size={24} />
            <h3>2. Creamos tu sistema</h3>
            <p>Preparamos ficha pública, dashboard, roles y configuración inicial.</p>
          </article>
          <article>
            <ShieldCheck size={24} />
            <h3>3. Sales a producción</h3>
            <p>Publicamos tu presencia en Allop y te acompañamos en los primeros días.</p>
          </article>
        </div>
      </section>

      <section className="business-final" id="empresa">
        <div className="container business-final-inner">
          <div>
            <p className="eyebrow">Alta de salón</p>
            <h2>Cuéntanos qué necesitas y te guiamos.</h2>
            <p>No hace falta tener todo decidido. Con el nombre del salón, ciudad y una forma de contacto podemos preparar una propuesta.</p>
          </div>
          <div className="business-actions">
            <a className="btn btn-lg btn-white" href={demoHref}>
              <MessageCircle size={17} />
              Contactar
            </a>
            <a className="btn btn-lg btn-outline-white" href={dashboardUrl}>Ya tengo cuenta</a>
          </div>
        </div>
      </section>
    </>
  );
}
