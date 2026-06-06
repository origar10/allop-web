import {
  ArrowRight,
  BarChart3,
  Calculator,
  CalendarDays,
  CheckCircle,
  ChevronDown,
  ClipboardCheck,
  CreditCard,
  FileText,
  Headphones,
  MessageCircle,
  MessageSquare,
  PlayCircle,
  Receipt,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
} from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { submitBusinessLead } from '../lib/businessLeads';
import { trackEvent } from '../lib/analytics';
import { CONTRACT_EMAIL } from '../lib/billingApi';

interface BusinessProps {
  supportEmail: string;
  dashboardUrl: string;
}

const plans = [
  {
    name: 'Basico',
    price: 'Pedir presupuesto',
    period: '',
    detail: 'Para salones que quieren crear su cuenta y empezar sin revision manual.',
    features: ['Alta self-service', 'Marketplace publico', 'Agenda online', 'Recordatorios basicos', 'Ficha del salon'],
    limits: ['1 sede', 'Hasta 3 empleados', 'Soporte estandar'],
    selfService: true,
    cta: 'Crear cuenta',
    href: '/business/alta?plan=basic',
    external: false,
  },
  {
    name: 'A medida',
    price: 'Pedir presupuesto',
    period: '',
    detail: 'Para marcas, varios salones o necesidades avanzadas.',
    features: ['Multi-salon', 'Roles avanzados', 'Soporte prioritario', 'Integraciones a medida'],
    limits: ['Varias sedes', 'Usuarios ilimitados', 'Acompanamiento dedicado'],
    featured: true,
    selfService: false,
    cta: 'Pedir presupuesto',
    href: `mailto:${CONTRACT_EMAIL}?subject=${encodeURIComponent('Presupuesto Allop A medida')}`,
    external: true,
  },
];

const modules = [
  { icon: <CalendarDays size={22} />, title: 'Agenda y reservas', text: 'Reservas online, disponibilidad por profesional y gestión de citas desde el panel.' },
  { icon: <CreditCard size={22} />, title: 'Caja y facturación', text: 'Cobros, cierres de caja, facturas y trazabilidad de movimientos diarios.' },
  { icon: <Users size={22} />, title: 'Clientes', text: 'Historial, fidelización, notas internas y seguimiento de próximas visitas.' },
  { icon: <BarChart3 size={22} />, title: 'Operativa', text: 'Ventas, inventario, empleados, permisos y métricas para tomar decisiones.' },
];

const metrics = [
  ['500+', 'salones preparados'],
  ['42k', 'reservas gestionadas'],
  ['96%', 'satisfacción estimada'],
];

const testimonials = [
  {
    name: 'Marta Soler',
    salon: 'Lumière Studio, Barcelona',
    context: 'Equipo de 7 personas',
    result: 'Menos llamadas y 18% menos huecos vacíos',
    text: 'Pasamos de agenda manual a tener reservas online y recordatorios sin cambiar nuestra forma de trabajar.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
  },
  {
    name: 'Jordi Campos',
    salon: 'Barbería Marcel, Terrassa',
    context: 'Barbería de 3 sillones',
    result: 'Caja y agenda revisadas al cierre',
    text: 'El equipo ve la agenda, caja y clientes en el mismo sitio. Hemos reducido llamadas y huecos perdidos.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
  },
  {
    name: 'Núria Vidal',
    salon: 'Nuvo Beauty, Sabadell',
    context: 'Centro de estética con 5 cabinas',
    result: 'Servicios y profesionales ordenados',
    text: 'Nos ayudó a ordenar servicios, profesionales y reservas sin tener que montar un sistema desde cero.',
    image: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56',
  },
];

const integrations = [
  { icon: <Receipt size={20} />, name: 'TPV y caja', text: 'Preparado para conectar cobros, cierres y facturación.' },
  { icon: <MessageSquare size={20} />, name: 'WhatsApp/SMS', text: 'Recordatorios y confirmaciones según consentimiento.' },
  { icon: <CreditCard size={20} />, name: 'Stripe', text: 'Base preparada para suscripciones y portal de cliente.' },
  { icon: <Headphones size={20} />, name: 'Soporte', text: 'Canales de soporte y seguimiento operativo para salones.' },
];

const faqs = [
  ['¿Tengo permanencia?', 'No planteamos permanencia para empezar. Si se contrata un plan anual o una migración a medida, se acuerda por escrito.'],
  ['¿Podéis migrar mi agenda actual?', 'Sí. Podemos partir de papel, Excel, Google Calendar u otro software, y ordenar servicios, horarios y equipo.'],
  ['¿Cuánto tarda el alta?', 'Un salón sencillo puede estar preparado en pocos días si tenemos servicios, horarios y datos básicos.'],
  ['¿Necesito cambiar mi TPV?', 'No para empezar. Allop puede convivir con tu operativa actual y conectar integraciones cuando tenga sentido.'],
  ['¿Qué pasa con pagos y facturas?', 'Los planes B2B se pueden preparar para suscripción y facturación. La parte sensible de tarjeta debe quedar en Stripe si se activa self-service.'],
  ['¿Incluye formación?', 'Sí. El onboarding contempla una sesión inicial para servicios, agenda, equipo y primeras reservas.'],
  ['¿Puedo cancelar?', 'Sí. La cancelación del servicio se acuerda según el plan contratado y el estado de configuración o migración.'],
];

const comparisonRows = [
  ['Reservas online', 'Manual por llamada', 'WhatsApp manual', 'Google Calendar sin cliente', 'Incluido'],
  ['Recordatorios', 'A mano o inexistentes', 'Mensajes sueltos', 'No transaccional', 'Automáticos'],
  ['Historial de clientes', 'Disperso', 'Conversaciones', 'No estructurado', 'Centralizado'],
  ['Caja y operaciones', 'Separado', 'Separado', 'No incluido', 'Conectado'],
  ['Visibilidad marketplace', 'No disponible', 'No disponible', 'No disponible', 'Ficha pública Allop'],
];

const planLimitRows = [
  ['Usuarios', '1 usuario gestor', 'A medida'],
  ['Empleados', 'Hasta 3', 'A medida'],
  ['Sedes', '1', 'Varias sedes'],
  ['Reservas/mes', '300', 'A medida'],
  ['Recordatorios', 'Basicos', 'SMS/email segun contrato'],
  ['Soporte', 'Estandar', 'Prioritario'],
];

const useCases = [
  ['Peluquería', 'Color, cortes, profesionales por agenda y tratamientos recurrentes.'],
  ['Barbería', 'Huecos rápidos, repetición de clientes y gestión de sillones.'],
  ['Estética', 'Cabinas, servicios largos, historial y seguimiento de tratamientos.'],
  ['Uñas', 'Reservas frecuentes, bonos, recordatorios y agenda por técnica.'],
  ['Spa', 'Rituales, cabinas, reservas anticipadas y coordinación de equipo.'],
];

const onboarding = [
  ['Demo', 'Revisamos negocio, volumen, equipo y objetivo.'],
  ['Configuración', 'Creamos servicios, horarios, profesionales y permisos.'],
  ['Migración', 'Pasamos agenda y clientes desde papel, Excel o calendario.'],
  ['Formación', 'Sesión corta para el equipo y primeros casos reales.'],
  ['Producción', 'Publicamos ficha, activamos reservas y revisamos primeros días.'],
];

function buildTestimonialImage(baseUrl: string, width: number) {
  return `${baseUrl}?auto=format&fm=webp&fit=crop&w=${width}&q=72`;
}

export default function Business({ supportEmail, dashboardUrl }: BusinessProps) {
  const [openFaq, setOpenFaq] = useState(0);
  const [lead, setLead] = useState({
    salonName: '',
    contactName: '',
    phone: '',
    email: '',
    city: '',
    teamSize: '1-3',
    message: '',
  });
  const [leadMessage, setLeadMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [monthlyBookings, setMonthlyBookings] = useState(280);
  const [noShowRate, setNoShowRate] = useState(8);
  const [adminHours, setAdminHours] = useState(35);
  const demoHref = '#business-contact';
  const avoidedNoShows = Math.round(monthlyBookings * (noShowRate / 100) * 0.45);
  const savedHours = Math.round(adminHours * 0.35);
  const estimatedValue = avoidedNoShows * 28 + savedHours * 14;

  const submitLead = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!lead.salonName.trim() || !lead.contactName.trim() || !lead.phone.trim()) {
      setLeadMessage('Indica nombre del salón, persona de contacto y teléfono.');
      return;
    }

    setSubmitting(true);
    const result = await submitBusinessLead({
      ...lead,
      source: 'business_landing',
      createdAt: new Date().toISOString(),
    });
    setSubmitting(false);
    trackEvent('business_lead_submitted', {
      source: 'business_landing',
      storedLocally: result.storedLocally,
      teamSize: lead.teamSize,
    });
    setLeadMessage(result.storedLocally
      ? 'Solicitud guardada. El CRM no respondió, pero no se ha perdido el lead.'
      : 'Solicitud enviada. Te contactaremos para preparar la demo.');
    setLead({
      salonName: '',
      contactName: '',
      phone: '',
      email: '',
      city: '',
      teamSize: '1-3',
      message: '',
    });
  };

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
                Solicitar demo
                <ArrowRight size={16} />
              </a>
              <a className="btn btn-lg btn-ghost" href="#business-demo">
                <PlayCircle size={16} />
                Ver demo del panel
              </a>
              <Link className="btn btn-lg btn-ghost" to="/business/alta?plan=basic">
                <CreditCard size={16} />
                Empezar self-service
              </Link>
              <a className="btn btn-lg btn-ghost" href={dashboardUrl}>Acceder al panel</a>
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

      <section className="business-metrics">
        <div className="container business-metrics-grid">
          {metrics.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </article>
          ))}
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

      <section className="business-section" id="business-demo">
        <div className="container business-demo-grid">
          <div>
            <p className="eyebrow">Demo del panel</p>
            <h2 className="section-title">Un tour de 30 segundos por la operativa del salón.</h2>
            <p className="business-demo-copy">Agenda, caja, clientes y equipo conviven en una pantalla preparada para el día a día: mirar huecos, cobrar, revisar clientes y cerrar jornada.</p>
          </div>
          <div className="business-demo-panel">
            <div className="demo-timeline">
              <span style={{ width: '72%' }} />
            </div>
            <div className="demo-screen">
              <article><CalendarDays size={18} /><strong>Agenda</strong><span>12 citas hoy</span></article>
              <article><CreditCard size={18} /><strong>Caja</strong><span>284 € abiertos</span></article>
              <article><Users size={18} /><strong>Clientes</strong><span>3 nuevos</span></article>
              <article><BarChart3 size={18} /><strong>Operativa</strong><span>Stock bajo en color</span></article>
            </div>
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
                {plan.featured && <span className="plan-badge">Por contrato</span>}
                <h3>{plan.name}</h3>
                <div className="plan-price">{plan.price}{plan.period && <span>{plan.period}</span>}</div>
                <p>{plan.detail}</p>
                <ul>
                  {[...plan.features, ...plan.limits].map((feature) => (
                    <li key={feature}><CheckCircle size={16} /> {feature}</li>
                  ))}
                </ul>
                {plan.external
                  ? <a className={plan.featured ? 'btn btn-primary' : 'btn btn-ghost'} href={plan.href}>{plan.cta}</a>
                  : <Link className={plan.featured ? 'btn btn-primary' : 'btn btn-ghost'} to={plan.href}>{plan.cta}</Link>
                }
              </article>
            ))}
          </div>

          <div className="business-plan-table" aria-label="Comparativa de planes">
            <div className="plan-table-row head">
              <span>Función</span>
              <strong>Basico</strong>
              <strong>A medida</strong>
            </div>
            {['Marketplace', 'Agenda', 'Caja', 'Clientes', 'Inventario', 'Soporte'].map((row, index) => (
              <div className="plan-table-row" key={row}>
                <span>{row}</span>
                <strong>{index < 2 ? 'Incluido' : index === 5 ? 'Estandar' : 'Opcional'}</strong>
                <strong>{index < 5 ? 'Incluido' : 'Prioritario'}</strong>
              </div>
            ))}
          </div>

          <div className="business-limit-table" aria-label="Límites de planes">
            <div className="plan-table-row head">
              <span>Límite</span>
              <strong>Basico</strong>
              <strong>A medida</strong>
            </div>
            {planLimitRows.map(([limit, basic, custom]) => (
              <div className="plan-table-row" key={limit}>
                <span>{limit}</span>
                <strong>{basic}</strong>
                <strong>{custom}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="business-band">
        <div className="container business-includes-grid">
          <div>
            <p className="eyebrow">Qué incluye</p>
            <h2 className="section-title">Módulos concretos para operar el salón.</h2>
          </div>
          <div className="business-includes-list">
            {modules.map((module) => (
              <article key={module.title}>
                {module.icon}
                <div>
                  <h3>{module.title}</h3>
                  <p>{module.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="business-section">
        <div className="container business-calculator-grid">
          <div>
            <p className="eyebrow">Calculadora de ahorro</p>
            <h2 className="section-title">Estima no-shows evitados y tiempo recuperado.</h2>
            <p className="business-demo-copy">Es una estimación orientativa para hablar en la demo con números sobre reservas, ausencias y horas de gestión.</p>
          </div>
          <div className="business-calculator">
            <label>Reservas mensuales <strong>{monthlyBookings}</strong><input type="range" min="40" max="1200" step="20" value={monthlyBookings} onChange={(event) => setMonthlyBookings(Number(event.target.value))} /></label>
            <label>No-shows actuales <strong>{noShowRate}%</strong><input type="range" min="1" max="25" step="1" value={noShowRate} onChange={(event) => setNoShowRate(Number(event.target.value))} /></label>
            <label>Horas de gestión/mes <strong>{adminHours} h</strong><input type="range" min="5" max="120" step="5" value={adminHours} onChange={(event) => setAdminHours(Number(event.target.value))} /></label>
            <div className="calculator-results">
              <article><Calculator size={20} /><strong>{avoidedNoShows}</strong><span>no-shows evitables/mes</span></article>
              <article><ClockIcon /><strong>{savedHours} h</strong><span>tiempo recuperado</span></article>
              <article><CreditCard size={20} /><strong>{estimatedValue} €</strong><span>valor mensual estimado</span></article>
            </div>
          </div>
        </div>
      </section>

      <section className="business-band" id="clientes">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="eyebrow">Clientes</p>
              <h2 className="section-title">Salones que ya trabajan con una operativa más ordenada.</h2>
            </div>
          </div>
          <div className="business-testimonials">
            {testimonials.map((testimonial) => (
              <article key={testimonial.name}>
                <img
                  src={buildTestimonialImage(testimonial.image, 160)}
                  srcSet={`${buildTestimonialImage(testimonial.image, 120)} 120w, ${buildTestimonialImage(testimonial.image, 160)} 160w, ${buildTestimonialImage(testimonial.image, 240)} 240w`}
                  sizes="58px"
                  alt={testimonial.name}
                  loading="lazy"
                  decoding="async"
                  width="58"
                  height="58"
                />
                <p>{testimonial.text}</p>
                <strong>{testimonial.name}</strong>
                <span>{testimonial.salon}</span>
                <small>{testimonial.context} · {testimonial.result}</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="business-section">
        <div className="container business-compare-grid">
          <div>
            <p className="eyebrow">Allop vs agenda de papel</p>
            <h2 className="section-title">Menos tareas manuales, más control del negocio.</h2>
          </div>
          <div className="business-comparison">
            {comparisonRows.map(([feature, paper, whatsapp, calendar, allop]) => (
              <div key={feature}>
                <span>{feature}</span>
                <small>{paper}</small>
                <small>{whatsapp}</small>
                <small>{calendar}</small>
                <strong>{allop}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="business-section">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="eyebrow">Casos de uso</p>
              <h2 className="section-title">Adaptado por tipo de negocio.</h2>
            </div>
          </div>
          <div className="business-use-cases">
            {useCases.map(([name, text]) => (
              <article key={name}>
                <Store size={20} />
                <h3>{name}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="business-band">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="eyebrow">Integraciones</p>
              <h2 className="section-title">Conectores preparados para crecer sin rehacer tu operación.</h2>
            </div>
          </div>
          <div className="business-integrations">
            {integrations.map((integration) => (
              <article key={integration.name}>
                <div className="business-module-icon">{integration.icon}</div>
                <h3>{integration.name}</h3>
                <p>{integration.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="business-section">
        <div className="container business-faq-grid">
          <div>
            <p className="eyebrow">FAQ salones</p>
            <h2 className="section-title">Preguntas antes de dar el salto.</h2>
          </div>
          <div className="business-faq">
            {faqs.map(([question, answer], index) => (
              <article className={openFaq === index ? 'active' : ''} key={question}>
                <button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)}>
                  {question}
                  <ChevronDown size={16} />
                </button>
                {openFaq === index && <p>{answer}</p>}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="business-band">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="eyebrow">Onboarding</p>
              <h2 className="section-title">De demo a producción sin perder tu operativa.</h2>
            </div>
          </div>
          <div className="business-process">
            {onboarding.map(([title, text], index) => (
              <article key={title}>
                {index === 0 ? <MessageCircle size={24} /> : index === 1 ? <Sparkles size={24} /> : index === 2 ? <ClipboardCheck size={24} /> : index === 3 ? <Users size={24} /> : <ShieldCheck size={24} />}
                <h3>{index + 1}. {title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="business-section">
        <div className="container business-lead-magnet">
          <FileText size={24} />
          <div>
            <p className="eyebrow">Guía gratuita</p>
            <h2>Checklist de digitalización y guía anti no-show para salones</h2>
            <p>Un recurso práctico para revisar agenda, recordatorios, políticas de cancelación y datos mínimos antes de activar reservas online.</p>
          </div>
          <a className="btn btn-primary btn-lg" href="#business-contact">Pedir checklist</a>
        </div>
      </section>

      <section className="business-section" id="business-contact">
        <div className="container business-contact-grid">
          <div>
            <p className="eyebrow">Formulario de demo</p>
            <h2 className="section-title">Cuéntanos qué necesitas y te guiamos.</h2>
            <p className="business-demo-copy">Con el nombre del salón, ciudad y contacto podemos preparar una propuesta y activar el seguimiento comercial.</p>
            <div className="business-support-widget">
              <MessageCircle size={20} />
              <div>
                <strong>Soporte en vivo preparado</strong>
                <span>Widget operativo listo para conectar con Crisp, Intercom o el canal que decidáis.</span>
              </div>
            </div>
          </div>
          <form className="business-lead-form" onSubmit={submitLead}>
            <label>Nombre del salón<input value={lead.salonName} onChange={(event) => setLead({ ...lead, salonName: event.target.value })} /></label>
            <label>Persona de contacto<input value={lead.contactName} onChange={(event) => setLead({ ...lead, contactName: event.target.value })} /></label>
            <div className="auth-two-cols">
              <label>Teléfono<input value={lead.phone} onChange={(event) => setLead({ ...lead, phone: event.target.value })} type="tel" /></label>
              <label>Email<input value={lead.email} onChange={(event) => setLead({ ...lead, email: event.target.value })} type="email" /></label>
            </div>
            <div className="auth-two-cols">
              <label>Ciudad<input value={lead.city} onChange={(event) => setLead({ ...lead, city: event.target.value })} /></label>
              <label>Equipo<select value={lead.teamSize} onChange={(event) => setLead({ ...lead, teamSize: event.target.value })}>
                <option value="1-3">1-3 personas</option>
                <option value="4-12">4-12 personas</option>
                <option value="13+">13+ personas</option>
              </select></label>
            </div>
            <label>Mensaje<textarea value={lead.message} onChange={(event) => setLead({ ...lead, message: event.target.value })} rows={4} /></label>
            {leadMessage && (
              <p
                className={`auth-message ${leadMessage.includes('Indica') ? 'err' : 'ok'}`}
                role={leadMessage.includes('Indica') ? 'alert' : 'status'}
                aria-live={leadMessage.includes('Indica') ? 'assertive' : 'polite'}
              >
                {leadMessage}
              </p>
            )}
            <button className="btn btn-primary btn-lg" type="submit" disabled={submitting}>
              {submitting && <span className="inline-spinner" aria-hidden="true" />}
              {submitting ? 'Enviando...' : 'Solicitar demo'}
            </button>
            <a className="business-email-link" href={`mailto:${supportEmail}`}>También puedes escribir a {supportEmail}</a>
          </form>
        </div>
      </section>

      <section className="business-final" id="empresa">
        <div className="container business-final-inner">
          <div>
            <p className="eyebrow">Alta de salón</p>
            <h2>Tu operativa puede empezar ordenada desde la primera demo.</h2>
            <p>No hace falta tener todo decidido. Revisamos contigo servicios, horarios, equipo y próximos pasos.</p>
          </div>
          <div className="business-actions">
            <a className="btn btn-lg btn-white" href={demoHref}>
              <MessageCircle size={17} />
              Contactar
            </a>
            <Link className="btn btn-lg btn-outline-white" to="/business/alta?plan=basic">
              <CreditCard size={17} />
              Alta self-service
            </Link>
            <a className="btn btn-lg btn-outline-white" href={dashboardUrl}>Ya tengo cuenta</a>
          </div>
        </div>
      </section>
    </>
  );
}

function ClockIcon() {
  return <CalendarDays size={20} />;
}
