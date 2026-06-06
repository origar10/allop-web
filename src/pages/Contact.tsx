import { type FormEvent, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { saveSupportRequest } from '../lib/supportStore';

export default function Contact({ supportEmail }: { supportEmail: string }) {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    reason: searchParams.get('motivo') || 'cliente',
    name: '',
    email: '',
    phone: '',
    bookingLocator: '',
    message: searchParams.get('salon') ? `Ficha relacionada: ${searchParams.get('salon')}` : '',
  });
  const [message, setMessage] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setMessage('Indica nombre, email y mensaje para poder responder.');
      return;
    }

    saveSupportRequest({
      ...form,
      salonSlug: searchParams.get('salon') || undefined,
      createdAt: new Date().toISOString(),
    });
    setMessage('Solicitud recibida. Respondemos normalmente en 1-2 días laborables.');
    setForm({ reason: 'cliente', name: '', email: '', phone: '', bookingLocator: '', message: '' });
  };

  return (
    <section className="contact-page">
      <div className="container contact-grid">
        <div>
          <p className="eyebrow">Contacto</p>
          <h1>Cuéntanos qué necesitas.</h1>
          <p>Soporte para clientes, salones, privacidad, prensa y empleo. Si escribes por una reserva, añade el localizador.</p>
          <div className="contact-details">
            <span>Email: <a href={`mailto:${supportEmail}`}>{supportEmail}</a></span>
            <span>Tiempo estimado: 1-2 días laborables</span>
            <span>Urgencias de reserva: incluye teléfono y localizador</span>
          </div>
        </div>
        <form className="business-lead-form" onSubmit={submit}>
          <label>Motivo<select value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })}>
            <option value="cliente">Cliente</option>
            <option value="salon">Salón</option>
            <option value="reportar-datos">Reportar datos incorrectos</option>
            <option value="reclamar-ficha">Reclamar ficha</option>
            <option value="privacidad">Privacidad</option>
            <option value="prensa">Prensa</option>
            <option value="empleo">Empleo</option>
          </select></label>
          <label>Nombre<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <div className="auth-two-cols">
            <label>Email<input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" /></label>
            <label>Teléfono<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} type="tel" /></label>
          </div>
          <label>Número de reserva opcional<input value={form.bookingLocator} onChange={(event) => setForm({ ...form, bookingLocator: event.target.value })} placeholder="ALP-..." /></label>
          <label>Mensaje<textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} rows={5} /></label>
          {message && (
            <p
              className={`auth-message ${message.startsWith('Indica') ? 'err' : 'ok'}`}
              role={message.startsWith('Indica') ? 'alert' : 'status'}
              aria-live={message.startsWith('Indica') ? 'assertive' : 'polite'}
            >
              {message}
            </p>
          )}
          <button className="btn btn-primary btn-lg" type="submit">Enviar solicitud</button>
        </form>
      </div>
    </section>
  );
}
