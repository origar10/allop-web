import {
  ArrowRight,
  BarChart3,
  Calculator,
  CalendarDays,
  CheckCircle,
  ChevronDown,
  ClipboardCheck,
  Clock,
  CreditCard,
  Crown,
  Globe,
  Headphones,
  MessageSquare,
  Receipt,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  Users,
} from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { submitBusinessLead } from '../lib/businessLeads';
import { trackEvent } from '../lib/analytics';
import { fetchPublicPricing } from '../lib/billingApi';

interface BusinessProps {
  supportEmail: string;
  dashboardUrl: string;
}

const SIGNUP_HREF = '/business/alta?plan=basic';

/** Precio del plan Básico por defecto; la API lo actualiza si el panel lo cambia. */
const DEFAULT_PRICING = { monthly: 39, annual: 350 };

const basicFeatures = [
  'Agenda online y reservas las 24 horas',
  'Ficha de tu salón en allop.es',
  'Cuentas para tu equipo (hasta 7)',
  'App Allop Pro en el móvil de cada profesional',
  'Recordatorios de cita',
  'Clientes con historial y notas',
  'Reservas ilimitadas',
  'Sin permanencia',
];

const startSteps = [
  { icon: <Sparkles size={22} />, title: 'Crea tu cuenta', text: 'Rellena los datos del salón y elige pago mensual o anual. En unos minutos tienes el panel listo.' },
  { icon: <ClipboardCheck size={22} />, title: 'Añade servicios y horario', text: 'Precios, duraciones, horario y tu equipo. Puedes cambiarlo cuando quieras.' },
  { icon: <CalendarDays size={22} />, title: 'Empieza a recibir reservas', text: 'Comparte tu enlace de reservas y gestiona la agenda desde el ordenador o el móvil.' },
];

const modules = [
  { icon: <CalendarDays size={22} />, title: 'Agenda y reservas', text: 'Reservas online, disponibilidad por profesional y gestión de citas desde el panel o la app.' },
  { icon: <Users size={22} />, title: 'Clientes', text: 'Historial, notas internas y seguimiento de próximas visitas de cada cliente.' },
  { icon: <Smartphone size={22} />, title: 'App para tu equipo', text: 'Con Allop Pro cada profesional ve su agenda, sus clientes y ficha desde el móvil.' },
  { icon: <BarChart3 size={22} />, title: 'Cobros y números', text: 'Cobros, ventas del día y ocupación para saber cómo va el salón de un vistazo.' },
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
  { icon: <Receipt size={20} />, name: 'TPV y caja', text: 'Cobros y ventas del día conectados con la agenda.' },
  { icon: <MessageSquare size={20} />, name: 'WhatsApp y SMS', text: 'Recordatorios y confirmaciones, siempre con el consentimiento del cliente.' },
  { icon: <CreditCard size={20} />, name: 'Pago con tarjeta', text: 'Tu suscripción se paga con tarjeta de forma segura a través de Stripe.' },
  { icon: <Headphones size={20} />, name: 'Soporte', text: 'Te ayudamos por email cuando lo necesites.' },
];

const faqs = [
  ['¿Qué incluye el plan Básico?', 'Agenda online, ficha en allop.es, cuentas y app para tu equipo (hasta 7 personas), clientes con historial y recordatorios. Reservas ilimitadas.'],
  ['¿Necesito hablar con alguien para empezar?', 'No. Te das de alta online, pagas con tarjeta y empiezas a configurar tu salón en el momento. Si te atascas, te ayudamos por email.'],
  ['¿Tengo permanencia?', 'No. El plan Básico es mes a mes (o anual, si prefieres ahorrar) y lo puedes cancelar cuando quieras.'],
  ['¿Cuánto tardo en tenerlo listo?', 'El alta son unos minutos. Con tus servicios, horario y equipo a mano, puedes recibir reservas el mismo día.'],
  ['¿Necesito cambiar mi TPV?', 'No. Allop puede convivir con tu forma de cobrar actual.'],
  ['¿Cuándo tiene sentido A medida?', 'Cuando quieres tu propia marca en todas partes: web y apps con tu nombre, varias sedes o una migración completa desde otro programa. Lo estudiamos contigo caso a caso.'],
  ['¿Dónde se guardan los datos de mi tarjeta?', 'En Stripe, el proveedor de pagos. Allop no guarda datos de tarjeta.'],
];

const comparisonRows = [
  ['Reservas online', 'Manual por llamada', 'WhatsApp manual', 'Google Calendar sin cliente', 'Incluido'],
  ['Recordatorios', 'A mano o inexistentes', 'Mensajes sueltos', 'No transaccional', 'Automáticos'],
  ['Historial de clientes', 'Disperso', 'Conversaciones', 'No estructurado', 'Centralizado'],
  ['Caja y operaciones', 'Separado', 'Separado', 'No incluido', 'Conectado'],
  ['Visibilidad', 'No disponible', 'No disponible', 'No disponible', 'Ficha en allop.es'],
];

const useCases = [
  ['Peluquería', 'Color, cortes, profesionales por agenda y tratamientos recurrentes.'],
  ['Barbería', 'Huecos rápidos, repetición de clientes y gestión de sillones.'],
  ['Estética', 'Cabinas, servicios largos, historial y seguimiento de tratamientos.'],
  ['Uñas', 'Reservas frecuentes, bonos, recordatorios y agenda por técnica.'],
  ['Spa', 'Rituales, cabinas, reservas anticipadas y coordinación de equipo.'],
];

const customPillars = [
  { icon: <Globe size={22} />, title: 'Tu web de reservas', text: 'Con tu marca, tus colores y tu estilo. Tus clientes reservan contigo, no en un directorio.' },
  { icon: <Smartphone size={22} />, title: 'Tus propias apps', text: 'App para tus clientes y app para tu equipo, con tu nombre y tu logo en App Store y Google Play.' },
  { icon: <Server size={22} />, title: 'Un servidor solo para ti', text: 'Tu salón funciona en su propia instalación, con sus datos separados y a su ritmo.' },
  { icon: <Crown size={22} />, title: 'Acompañamiento personal', text: 'Una persona de Allop contigo de principio a fin: migración, formación y lanzamiento.' },
];

const customProcess = [
  ['Conversación', 'Nos cuentas tu salón y lo que quieres conseguir. Te decimos con sinceridad si A medida encaja.'],
  ['Diseño', 'Preparamos tu web y tus apps con tu identidad de marca.'],
  ['Migración', 'Traemos tu agenda y tus clientes desde Booksy, Fresha, Excel o papel.'],
  ['Formación', 'Una sesión con tu equipo para arrancar con seguridad.'],
  ['Lanzamiento', 'Publicamos tus apps y te acompañamos los primeros días.'],
];

function buildTestimonialImage(baseUrl: string, width: number) {
  return `${baseUrl}?auto=format&fm=webp&fit=crop&w=${width}&q=72`;
}

function formatEuros(value: number) {
  return `${Number.isInteger(value) ? value : value.toFixed(2).replace('.', ',')} €`;
}

export default function Business({ supportEmail, dashboardUrl }: BusinessProps) {
  const [openFaq, setOpenFaq] = useState(0);
  const [lead, setLead] = useState({
    salonName: '',
    contactName: '',
    phone: '',
    email: '',
    city: '',
    teamSize: '1 sede',
    message: '',
  });
  const [leadMessage, setLeadMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [monthlyBookings, setMonthlyBookings] = useState(280);
  const [noShowRate, setNoShowRate] = useState(8);
  const [adminHours, setAdminHours] = useState(35);
  const [pricing, setPricing] = useState(DEFAULT_PRICING);

  useEffect(() => {
    fetchPublicPricing().then((result) => {
      if (result) setPricing({ monthly: result.basicoMonthly, annual: result.basicoAnnual });
    });
  }, []);

  const monthlyPrice = formatEuros(pricing.monthly);
  const annualSaving = Math.max(0, Math.round(pricing.monthly * 12 - pricing.annual));
  const avoidedNoShows = Math.round(monthlyBookings * (noShowRate / 100) * 0.45);
  const savedHours = Math.round(adminHours * 0.35);
  const estimatedValue = avoidedNoShows * 28 + savedHours * 14;

  const trackSignup = (placement: string) => trackEvent('business_signup_cta', { placement });

  const submitLead = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!lead.salonName.trim() || !lead.contactName.trim() || !lead.phone.trim()) {
      setLeadMessage('Indica nombre del salón, persona de contacto y teléfono.');
      return;
    }

    setSubmitting(true);
    const result = await submitBusinessLead({
      ...lead,
      source: 'business_landing_a_medida',
      createdAt: new Date().toISOString(),
    });
    setSubmitting(false);
    trackEvent('business_lead_submitted', {
      source: 'business_landing_a_medida',
      storedLocally: result.storedLocally,
      teamSize: lead.teamSize,
    });
    setLeadMessage('Solicitud recibida. Revisamos cada proyecto con calma y te escribiremos en unos días.');
    setLead({
      salonName: '',
      contactName: '',
      phone: '',
      email: '',
      city: '',
      teamSize: '1 sede',
      message: '',
    });
  };

  return (
    <>
      <section className="business-hero">
        <div className="container business-hero-grid">
          <div className="business-hero-copy">
            <p className="eyebrow">Allop para salones · Plan Básico</p>
            <h1>Tu salón con reservas online desde hoy, por {monthlyPrice} al mes.</h1>
            <p>
              Agenda, ficha en allop.es, clientes y una app para todo tu equipo. Te das de alta en unos minutos, sin llamadas ni permanencia.
            </p>
            <div className="business-actions">
              <Link className="btn btn-lg btn-primary" to={SIGNUP_HREF} onClick={() => trackSignup('hero')}>
                Empezar ahora
                <ArrowRight size={16} />
              </Link>
              <a className="btn btn-lg btn-ghost" href="#precios">Ver qué incluye</a>
            </div>
            <ul className="business-hero-trust" aria-label="Condiciones del plan Básico">
              <li><CheckCircle size={15} /> Alta online en minutos</li>
              <li><CheckCircle size={15} /> Sin permanencia</li>
              <li><CheckCircle size={15} /> Reservas ilimitadas</li>
            </ul>
            <p className="business-hero-alt">
              ¿Ya tienes cuenta? <a href={dashboardUrl}>Entra en tu panel</a>
            </p>
          </div>
          <div className="business-visual" aria-label="Panel de gestión Allop">
            <div className="business-panel">
              <div className="business-panel-top">
                <span>Hoy</span>
                <strong>12 citas</strong>
              </div>
              <div className="business-panel-row"><CalendarDays size={17} /> 10:30 Corte + color</div>
              <div className="business-panel-row"><CreditCard size={17} /> Cobrado hoy · 284 €</div>
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

      <section className="business-band" id="empezar">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="eyebrow">Empieza hoy</p>
              <h2 className="section-title">Tres pasos y tu salón ya recibe reservas.</h2>
            </div>
          </div>
          <div className="business-steps">
            {startSteps.map((step, index) => (
              <article key={step.title}>
                <div className="business-step-number">{index + 1}</div>
                <div className="business-module-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="business-section" id="operativa">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="eyebrow">Tu día a día</p>
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

      <section className="business-band" id="precios">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="eyebrow">Precio</p>
              <h2 className="section-title">Un plan con todo lo que necesita tu salón.</h2>
            </div>
          </div>
          <article className="business-basic-plan">
            <div className="business-basic-price">
              <span className="plan-badge">Plan Básico</span>
              <div className="plan-price">{monthlyPrice}<span>/mes + IVA</span></div>
              <p>O {formatEuros(pricing.annual)} al año{annualSaving > 0 ? ` y te ahorras ${annualSaving} €` : ''}.</p>
              <Link className="btn btn-lg btn-primary" to={SIGNUP_HREF} onClick={() => trackSignup('pricing')}>
                Crear mi cuenta
                <ArrowRight size={16} />
              </Link>
              <small>Sin permanencia. Cancela cuando quieras.</small>
            </div>
            <ul className="business-basic-features">
              {basicFeatures.map((feature) => (
                <li key={feature}><CheckCircle size={17} /> {feature}</li>
              ))}
            </ul>
          </article>
          <p className="business-custom-teaser">
            <Crown size={16} />
            ¿Buscas tu propia web y tus propias apps con tu marca? <a href="#a-medida">Descubre Allop A medida</a>
          </p>
        </div>
      </section>

      <section className="business-section">
        <div className="container business-calculator-grid">
          <div>
            <p className="eyebrow">Calculadora de ahorro</p>
            <h2 className="section-title">Estima citas perdidas evitadas y tiempo recuperado.</h2>
            <p className="business-demo-copy">Una estimación orientativa de lo que recuperas con reservas online y recordatorios.</p>
            <Link className="btn btn-primary business-calculator-cta" to={SIGNUP_HREF} onClick={() => trackSignup('calculator')}>
              Empezar por {monthlyPrice}/mes
            </Link>
          </div>
          <div className="business-calculator">
            <label>Reservas al mes <strong>{monthlyBookings}</strong><input type="range" min="40" max="1200" step="20" value={monthlyBookings} onChange={(event) => setMonthlyBookings(Number(event.target.value))} /></label>
            <label>Clientes que no se presentan <strong>{noShowRate}%</strong><input type="range" min="1" max="25" step="1" value={noShowRate} onChange={(event) => setNoShowRate(Number(event.target.value))} /></label>
            <label>Horas de gestión al mes <strong>{adminHours} h</strong><input type="range" min="5" max="120" step="5" value={adminHours} onChange={(event) => setAdminHours(Number(event.target.value))} /></label>
            <div className="calculator-results">
              <article><Calculator size={20} /><strong>{avoidedNoShows}</strong><span>citas perdidas evitables al mes</span></article>
              <article><Clock size={20} /><strong>{savedHours} h</strong><span>tiempo recuperado</span></article>
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
              <p className="eyebrow">Para cada tipo de salón</p>
              <h2 className="section-title">Adaptado a cómo trabajas.</h2>
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
              <h2 className="section-title">Encaja con lo que ya usas.</h2>
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
            <p className="eyebrow">Preguntas frecuentes</p>
            <h2 className="section-title">Antes de dar el salto.</h2>
          </div>
          <div className="business-faq">
            {faqs.map(([question, answer], index) => (
              <article className={openFaq === index ? 'active' : ''} key={question}>
                <button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? -1 : index)}>
                  {question}
                  <ChevronDown size={16} />
                </button>
                {openFaq === index && <p>{answer}</p>}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="business-final" id="empresa">
        <div className="container business-final-inner">
          <div>
            <p className="eyebrow">Plan Básico</p>
            <h2>Empieza hoy y recibe tu primera reserva online esta misma semana.</h2>
            <p>{monthlyPrice} al mes, sin permanencia. Configuras tu salón a tu ritmo y lo cambias cuando quieras.</p>
          </div>
          <div className="business-actions">
            <Link className="btn btn-lg btn-white" to={SIGNUP_HREF} onClick={() => trackSignup('final')}>
              Crear mi cuenta
              <ArrowRight size={17} />
            </Link>
            <a className="btn btn-lg btn-outline-white" href={dashboardUrl}>Ya tengo cuenta</a>
          </div>
        </div>
      </section>

      <section className="business-exclusive" id="a-medida" aria-labelledby="a-medida-title">
        <div className="container">
          <div className="business-exclusive-head">
            <p className="business-exclusive-eyebrow"><Crown size={15} /> Allop A medida</p>
            <h2 id="a-medida-title">Tu marca, en todas partes.</h2>
            <p>
              Para salones que quieren su propia web y sus propias apps, con el motor de Allop por dentro.
              Trabajamos con pocos salones a la vez para cuidar cada lanzamiento como si fuera el nuestro.
            </p>
          </div>

          <div className="business-exclusive-pillars">
            {customPillars.map((pillar) => (
              <article key={pillar.title}>
                <div className="business-exclusive-icon">{pillar.icon}</div>
                <h3>{pillar.title}</h3>
                <p>{pillar.text}</p>
              </article>
            ))}
          </div>

          <div className="business-exclusive-process">
            <h3>Así lo lanzamos contigo</h3>
            <ol>
              {customProcess.map(([title, text]) => (
                <li key={title}>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="business-exclusive-contact" id="business-contact">
            <div>
              <h3>Solicita tu plaza</h3>
              <p>Cuéntanos tu proyecto. Estudiamos cada solicitud y te respondemos personalmente con una propuesta.</p>
              <p className="business-exclusive-note"><ShieldCheck size={16} /> Precio según proyecto. Sin compromiso hasta que firmes.</p>
              <a className="business-email-link" href={`mailto:${supportEmail}`}>O escríbenos a {supportEmail}</a>
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
                <label>Sedes<select value={lead.teamSize} onChange={(event) => setLead({ ...lead, teamSize: event.target.value })}>
                  <option value="1 sede">1 sede</option>
                  <option value="2-3 sedes">2 o 3 sedes</option>
                  <option value="4+ sedes">4 sedes o más</option>
                </select></label>
              </div>
              <label>Qué te gustaría conseguir<textarea value={lead.message} onChange={(event) => setLead({ ...lead, message: event.target.value })} rows={4} placeholder="Por ejemplo: app propia para mis clientas, migrar desde Booksy…" /></label>
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
                {submitting ? 'Enviando...' : 'Solicitar acceso'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
