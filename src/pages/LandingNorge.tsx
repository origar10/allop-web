import { ArrowRight, AtSign, Bell, CalendarCheck, Check, Globe, Smartphone, Users, X } from 'lucide-react';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { region } from '../lib/region';
import { fechaGratis, fmtMoney, tr } from '../lib/tr';
import { setSeo } from '../lib/seo';
import { apiPost } from '../shared/apiClient';

// Portada de los países con alta self-service y prueba gratis (Noruega). Idea de Ramon (campaña de
// Stavanger, oct 2026): el dueño escribe el nombre de su local y ve al momento cómo queda SU
// página de reservas; de ahí, prueba gratis o «te lo montamos nosotros» (lead → CRM + aviso).
// Sin promesas que no se cumplen: la página de reservas está lista el mismo día; la app con su
// marca es del plan a medida.

type Nicho = 'frisor' | 'barber' | 'massasje' | 'hudpleie' | 'tatovering';

const NICHOS: { id: Nicho; nombre: string; servicios: [string, number, number][] }[] = [
  { id: 'frisor', nombre: tr('Peluquería'), servicios: [[tr('Corte de mujer'), 690, 60], [tr('Corte de hombre'), 450, 30], [tr('Color completo'), 1490, 120], [tr('Mechas'), 1890, 150]] },
  { id: 'barber', nombre: tr('Barbería'), servicios: [[tr('Corte de pelo'), 420, 30], [tr('Corte + barba'), 590, 45], [tr('Arreglo de barba'), 290, 20], [tr('Afeitado clásico'), 390, 30]] },
  { id: 'massasje', nombre: tr('Masaje y tratamientos'), servicios: [[tr('Masaje relajante'), 790, 60], [tr('Masaje deportivo'), 890, 60], [tr('Masaje de espalda'), 550, 30], [tr('Piedras calientes'), 990, 75]] },
  { id: 'hudpleie', nombre: tr('Estética'), servicios: [[tr('Limpieza facial'), 890, 60], [tr('Manicura'), 490, 45], [tr('Pestañas y cejas'), 390, 30], [tr('Depilación con cera'), 450, 30]] },
  // Mismo catálogo que la categoría «Tatovering & piercing» del salón demo (el botón lleva a ella).
  { id: 'tatovering', nombre: tr('Tatuajes y piercing'), servicios: [[tr('Consulta'), 0, 30], [tr('Tatuaje pequeño'), 1200, 60], [tr('Sesión de medio día'), 3500, 180], [tr('Sesión de día completo'), 6500, 360]] },
];

const COLORES = [
  { hex: '#B08D57', nombre: tr('Dorado') },
  { hex: '#2563EB', nombre: tr('Azul nórdico') },
  { hex: '#111827', nombre: tr('Negro') },
  { hex: '#059669', nombre: tr('Verde') },
];

const iniciales = (nombre: string) =>
  nombre.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || 'A';

export default function LandingNorge() {
  const dias = region().prueba_gratis_dias ?? 14;
  // Promoción de lanzamiento: «gratis hasta…» sustituye a los días de prueba en los textos.
  const gratis = fechaGratis();
  const [nombre, setNombre] = useState('');
  const [nicho, setNicho] = useState<Nicho>('frisor');
  const [color, setColor] = useState(COLORES[0].hex);
  const servicios = useMemo(() => NICHOS.find((n) => n.id === nicho)!.servicios, [nicho]);
  const nombreMostrado = nombre.trim() || tr('Tu salón');
  const demoUrl = `https://demo.${region().dominio}/?salong=${encodeURIComponent(nombreMostrado)}&type=${nicho}`;

  useEffect(() => {
    setSeo({
      title: tr('Sistema de reservas para tu salón | Allop'),
      description: tr('Página de reservas propia, agenda y app para tu equipo. Precio fijo, sin comisiones por reserva. {n} días gratis, sin tarjeta.', { n: dias }),
      canonicalPath: '/',
    });
  }, [dias]);

  return (
    <div className="landing-no">
      <style>{CSS}</style>

      <section className="lno-hero container">
        <span className="lno-badge">{gratis ? tr('Nuevo en Noruega · gratis hasta el {fecha}', { fecha: gratis }) : tr('Nuevo en Noruega · {n} días gratis, sin tarjeta', { n: dias })}</span>
        <h1>{tr('Tu propio sistema de reservas, con tu nombre, listo hoy.')}</h1>
        <p className="lno-sub">{tr('La plataforma que ya usan salones en España, ahora para barberías y salones independientes de Noruega. Precio fijo, sin comisiones por reserva y sin permanencia.')}</p>
        <div className="lno-ctas">
          <a className="btn btn-primary btn-lg" href="#simulador">{tr('Ver cómo quedaría tu salón')} <ArrowRight size={16} /></a>
          <Link className="btn btn-ghost btn-lg" to="/business/alta">{tr('Empezar gratis')}</Link>
        </div>
      </section>

      <section id="simulador" className="lno-sim container">
        <div className="lno-controls">
          <h2>{tr('Pruébalo con tu salón')}</h2>
          <label>{tr('¿Cómo se llama tu salón?')}
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder={tr('Ej. Fjord Barbershop')} maxLength={40} />
          </label>
          <label>{tr('Tipo de negocio')}
            <select value={nicho} onChange={(e) => setNicho(e.target.value as Nicho)}>
              {NICHOS.map((n) => <option key={n.id} value={n.id}>{n.nombre}</option>)}
            </select>
          </label>
          <div className="lno-label">{tr('Color de tu marca')}</div>
          <div className="lno-colores">
            {COLORES.map((c) => (
              <button key={c.hex} type="button" title={c.nombre} aria-label={c.nombre} aria-pressed={color === c.hex}
                className={color === c.hex ? 'on' : ''} style={{ background: c.hex }} onClick={() => setColor(c.hex)} />
            ))}
          </div>
          <a className="btn btn-primary" href={demoUrl} target="_blank" rel="noopener noreferrer">
            {tr('Probar la demo real')} <ArrowRight size={16} />
          </a>
          <p className="lno-nota">{tr('La demo abre una página de reservas de verdad con el nombre que has escrito.')}</p>
        </div>

        <div className="lno-phone" aria-label={tr('Vista previa de tu página de reservas')}>
          <div className="lno-screen">
            <div className="lno-top" style={{ background: color }}>
              <div className="lno-logo">{iniciales(nombreMostrado)}</div>
              <div className="lno-nombre">{nombreMostrado}</div>
              <div className="lno-tag">{tr('Reserva online')}</div>
            </div>
            <div className="lno-lista">
              <div className="lno-h">{tr('Elige un servicio')}</div>
              {servicios.map(([s, precio, min]) => (
                <div key={s} className="lno-serv">
                  <div><strong>{s}</strong><span>{min} min</span></div>
                  <span style={{ color }}>{precio === 0 ? tr('Gratis') : fmtMoney(precio, 0)}</span>
                </div>
              ))}
              <button type="button" className="lno-reservar" style={{ background: color }}>{tr('Reservar cita')}</button>
            </div>
          </div>
        </div>
      </section>

      <section className="lno-pilares container">
        <h2>{tr('Todo lo que necesita tu salón')}</h2>
        <div className="lno-grid">
          <article><Globe size={22} /><h3>{tr('Tu página de reservas')}</h3><p>{tr('Un enlace propio para la bio de Instagram y Google Maps. Tus clientes reservan en segundos, de día o de noche.')}</p></article>
          <article><CalendarCheck size={22} /><h3>{tr('Agenda y panel web')}</h3><p>{tr('Horarios, equipo, clientes e historial en un solo sitio, desde el ordenador o el móvil.')}</p></article>
          <article><Bell size={22} /><h3>{tr('Recordatorios automáticos')}</h3><p>{tr('Menos citas olvidadas: tus clientes reciben el aviso antes de venir.')}</p></article>
          <article><Smartphone size={22} /><h3>{tr('App para tu equipo')}</h3><p>{tr('Allop Pro en el móvil de cada profesional, con aviso al instante de cada reserva.')}</p></article>
        </div>
      </section>

      <section className="lno-comp container">
        <h2>{tr('¿Por qué no seguir con los mensajes?')}</h2>
        <table>
          <thead><tr><th></th><th>{tr('Instagram / WhatsApp')}</th><th>{tr('Grandes plataformas')}</th><th className="lno-yo">{tr('Allop')}</th></tr></thead>
          <tbody>
            {([
              [tr('Reservas a cualquier hora'), false, true, true],
              [tr('Recordatorios automáticos'), false, true, true],
              [tr('Tu nombre y tu marca'), true, false, true],
              [tr('Sin comisión por reserva'), true, false, true],
              [tr('Te lo dejamos montado'), false, false, true],
            ] as [string, boolean, boolean, boolean][]).map(([fila, a, b, c]) => (
              <tr key={fila}><td>{fila}</td>{[a, b, c].map((ok, i) => <td key={i} className={i === 2 ? 'lno-yo' : ''}>{ok ? <Check size={18} /> : <X size={18} />}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="lno-cierre container">
        <div className="lno-card">
          <h2>{tr('Empieza hoy, gratis')}</h2>
          <p>{gratis
            ? tr('Crea tu cuenta en dos minutos y usa Allop gratis hasta el {fecha}. Sin tarjeta: estamos en fase de pruebas.', { fecha: gratis })
            : tr('Crea tu cuenta en dos minutos y prueba Allop {n} días. Sin tarjeta: al terminar decides si sigues.', { n: dias })}</p>
          <Link className="btn btn-primary btn-lg" to="/business/alta">{gratis ? tr('Crear cuenta gratis') : tr('Empezar {n} días gratis', { n: dias })}</Link>
        </div>
        <FormularioMontaje />
      </section>
    </div>
  );
}

/** «Te lo montamos nosotros»: lead al CRM (POST /leads/b2b) con aviso al equipo. */
function FormularioMontaje() {
  const [f, setF] = useState({ salonName: '', instagram: '', contactName: '', phone: '', email: '', website: '' });
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'ok' | 'error'>('idle');
  const [error, setError] = useState('');

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!f.salonName.trim() || (!f.phone.trim() && !f.email.trim())) {
      setError(tr('Dinos el nombre del salón y un teléfono o un email.'));
      return;
    }
    setEstado('enviando');
    setError('');
    try {
      await apiPost('/leads/b2b', { ...f, source: 'landing-no' });
      setEstado('ok');
    } catch {
      setEstado('error');
      setError(tr('No se ha podido enviar. Inténtalo de nuevo o escríbenos.'));
    }
  };

  if (estado === 'ok') {
    return <div className="lno-card"><h2>{tr('¡Gracias!')}</h2><p>{tr('Te escribimos muy pronto para dejar tu salón listo.')}</p></div>;
  }
  return (
    <form className="lno-card lno-form" onSubmit={enviar}>
      <h2>{tr('O te lo montamos nosotros')}</h2>
      <p>{tr('Danos tu Instagram o tu web: sacamos tus servicios y precios y te dejamos la cuenta lista.')}</p>
      <input type="text" name="website" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} style={{ display: 'none' }} tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <label>{tr('Nombre del salón')}<input value={f.salonName} onChange={(e) => setF({ ...f, salonName: e.target.value })} /></label>
      <label><span><AtSign size={14} /> {tr('Instagram o web')}</span><input value={f.instagram} onChange={(e) => setF({ ...f, instagram: e.target.value })} placeholder="@" /></label>
      <label><span><Users size={14} /> {tr('Tu nombre')}</span><input autoComplete="name" value={f.contactName} onChange={(e) => setF({ ...f, contactName: e.target.value })} /></label>
      <div className="lno-dos">
        <label>{tr('Teléfono / WhatsApp')}<input type="tel" autoComplete="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
        <label>{tr('Email')}<input type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
      </div>
      {error && <p className="auth-message err" role="alert">{error}</p>}
      <button className="btn btn-primary" type="submit" disabled={estado === 'enviando'}>
        {estado === 'enviando' ? tr('Enviando…') : tr('Quiero que me lo montéis')}
      </button>
    </form>
  );
}

const CSS = `
.landing-no h1{font-size:clamp(2rem,5vw,3.2rem);line-height:1.1;margin:.6rem 0 1rem;max-width:20ch}
.landing-no h2{font-size:clamp(1.4rem,3vw,2rem);margin:0 0 1rem}
.lno-hero{padding:4rem 16px 2.5rem}
.lno-badge{display:inline-block;padding:.35rem .75rem;border-radius:999px;background:var(--surface-2,rgba(127,127,127,.12));font-size:.85rem;font-weight:600}
.lno-sub{font-size:1.1rem;max-width:60ch;opacity:.85}
.lno-ctas{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:1.5rem}
.lno-sim{display:grid;grid-template-columns:1fr 320px;gap:3rem;align-items:center;padding:3rem 16px}
@media (max-width:820px){.lno-sim{grid-template-columns:1fr}.lno-phone{margin:0 auto}}
.lno-controls{display:flex;flex-direction:column;gap:1rem;max-width:420px}
.lno-controls label,.lno-form label{display:flex;flex-direction:column;gap:.35rem;font-weight:600;font-size:.92rem}
.lno-controls input,.lno-controls select,.lno-form input{padding:.7rem .8rem;border-radius:10px;border:1px solid var(--border,rgba(127,127,127,.35));background:var(--surface,transparent);color:inherit;font:inherit}
.lno-label{font-weight:600;font-size:.92rem}
.lno-colores{display:flex;gap:.6rem}
.lno-colores button{width:34px;height:34px;border-radius:50%;border:3px solid transparent;cursor:pointer}
.lno-colores button.on{border-color:var(--text,#111);box-shadow:0 0 0 2px var(--bg,#fff) inset}
.lno-nota{font-size:.85rem;opacity:.7;margin:0}
.lno-phone{width:300px;height:600px;border-radius:44px;background:#0b0f17;padding:12px;box-shadow:0 30px 60px rgba(0,0,0,.25)}
.lno-screen{width:100%;height:100%;border-radius:34px;overflow:hidden;background:#f7f7f5;color:#111;display:flex;flex-direction:column}
.lno-top{color:#fff;text-align:center;padding:2.2rem 1rem 1.2rem;transition:background .2s}
.lno-logo{width:58px;height:58px;border-radius:50%;margin:0 auto .6rem;background:rgba(255,255,255,.2);display:grid;place-items:center;font-weight:700;font-size:1.3rem;border:2px solid rgba(255,255,255,.6)}
.lno-nombre{font-weight:700;font-size:1.15rem;word-break:break-word}
.lno-tag{font-size:.8rem;opacity:.85}
.lno-lista{padding:1rem;display:flex;flex-direction:column;gap:.55rem;flex:1}
.lno-h{font-weight:700;font-size:.9rem;margin-bottom:.2rem}
.lno-serv{display:flex;justify-content:space-between;align-items:center;background:#fff;border-radius:12px;padding:.65rem .8rem;font-size:.85rem}
.lno-serv div{display:flex;flex-direction:column}.lno-serv div span{opacity:.6;font-size:.75rem}
.lno-serv>span{font-weight:700}
.lno-reservar{margin-top:auto;border:0;color:#fff;font-weight:700;padding:.85rem;border-radius:12px;font:inherit;font-weight:700}
.lno-pilares{padding:3rem 16px}
.lno-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.lno-grid article{border:1px solid var(--border,rgba(127,127,127,.25));border-radius:16px;padding:1.2rem}
.lno-grid h3{margin:.6rem 0 .4rem;font-size:1.05rem}.lno-grid p{margin:0;opacity:.8;font-size:.95rem}
.lno-comp{padding:3rem 16px;overflow-x:auto}
.lno-comp table{width:100%;border-collapse:collapse;min-width:520px}
.lno-comp th,.lno-comp td{padding:.75rem;text-align:center;border-bottom:1px solid var(--border,rgba(127,127,127,.2))}
.lno-comp td:first-child,.lno-comp th:first-child{text-align:left}
.lno-yo{background:rgba(37,99,235,.08);font-weight:700}
.lno-cierre{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;padding:3rem 16px 4rem}
@media (max-width:820px){.lno-cierre{grid-template-columns:1fr}}
.lno-card{border:1px solid var(--border,rgba(127,127,127,.25));border-radius:20px;padding:1.6rem;display:flex;flex-direction:column;gap:.8rem;align-items:flex-start}
.lno-form{align-items:stretch}.lno-form label span{display:inline-flex;gap:.35rem;align-items:center}
.lno-dos{display:grid;grid-template-columns:1fr 1fr;gap:.8rem}
@media (max-width:520px){.lno-dos{grid-template-columns:1fr}}
`;
