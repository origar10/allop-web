import { BadgeCheck, CalendarDays, Heart, MessageCircle, ShieldCheck, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const trustItems = [
  ['Reservas verificadas', 'Las reservas quedan vinculadas a teléfono, salón, servicio y hora para evitar confusiones.'],
  ['Reseñas tras visita', 'Las reseñas se muestran como verificadas cuando proceden de una reserva completada.'],
  ['Salones revisables', 'Puedes reportar datos incorrectos y los propietarios pueden reclamar su ficha.'],
  ['Privacidad entendible', 'Teléfono, SMS, email y geolocalización se usan para reservar, avisar y mejorar resultados.'],
];

export default function Trust() {
  return (
    <section className="trust-page">
      <div className="container">
        <div className="trust-hero">
          <p className="eyebrow">Confianza Allop</p>
          <h1>Reservar belleza y bienestar con información clara.</h1>
          <p>Allop es marketplace para clientes y software operativo para salones. Conectamos búsqueda, reserva, confirmación y soporte sin ocultar el estado real de cada cita.</p>
        </div>

        <div className="trust-grid">
          {trustItems.map(([title, text]) => (
            <article key={title}>
              <ShieldCheck size={22} />
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </div>

        <div className="trust-policy-grid">
          <article>
            <CalendarDays size={22} />
            <h2>Cancelación, retrasos y no-show</h2>
            <p>Antes de confirmar una reserva mostramos si la cita queda pendiente o confirmada. Las cancelaciones deben hacerse desde la confirmación o cuenta cliente. Si llegas tarde o no acudes, el salón puede aplicar sus reglas internas si fueron comunicadas.</p>
          </article>
          <article>
            <BadgeCheck size={22} />
            <h2>Cómo verificamos salones</h2>
            <p>Mostramos badges cuando una ficha tiene datos consistentes, contacto operativo o gestión desde Allop. Si detectas información incorrecta, puedes reportarla desde la ficha o contacto.</p>
          </article>
          <article>
            <Star size={22} />
            <h2>Cómo verificamos reseñas</h2>
            <p>Priorizamos reseñas asociadas a reservas completadas. Las opiniones pueden moderarse si contienen datos ofensivos, spam o información que no corresponde a la visita.</p>
          </article>
          <article>
            <Heart size={22} />
            <h2>Privacidad práctica</h2>
            <p>El teléfono se usa para OTP y avisos transaccionales; el email para confirmaciones si lo das; la geolocalización solo para ordenar resultados cercanos y no se exige para reservar.</p>
          </article>
        </div>

        <div className="trust-cta">
          <MessageCircle size={22} />
          <div>
            <h2>¿Necesitas ayuda con una reserva o una ficha?</h2>
            <p>Contacta con soporte e incluye el localizador si lo tienes.</p>
          </div>
          <Link className="btn btn-primary" to="/contacto">Contactar</Link>
        </div>
      </div>
    </section>
  );
}
