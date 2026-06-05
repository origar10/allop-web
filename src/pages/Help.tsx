import { Link } from 'react-router-dom';

const clientFaq = [
  ['¿Cómo sé si mi reserva está confirmada?', 'La pantalla de confirmación indica si la reserva queda pendiente o confirmada. También verás el estado en Mi cuenta.'],
  ['¿Puedo cancelar?', 'Sí. Puedes cancelar desde la confirmación o desde el área de cliente mientras la reserva esté pendiente o confirmada.'],
  ['¿Por qué pedís teléfono?', 'Para enviar código de acceso, confirmar reservas y poder avisarte de cambios relevantes.'],
];

const salonFaq = [
  ['¿Allop es marketplace o software?', 'Ambas cosas: los clientes descubren salones y los salones pueden gestionar agenda, caja, clientes y equipo.'],
  ['¿Puedo reclamar mi ficha?', 'Sí. Desde la ficha o contacto puedes solicitar actualizar datos y tomar control operativo.'],
  ['¿Cómo llegan los leads B2B?', 'El formulario de /business guarda la solicitud y la envía al CRM/backend si está disponible.'],
];

export default function Help() {
  return (
    <section className="help-page">
      <div className="container">
        <div className="trust-hero">
          <p className="eyebrow">Centro de ayuda</p>
          <h1>Ayuda para clientes y salones.</h1>
          <p>Preguntas separadas para reservar con tranquilidad o gestionar tu negocio con Allop.</p>
        </div>
        <div className="help-grid">
          <section>
            <h2>Clientes</h2>
            {clientFaq.map(([question, answer]) => (
              <article key={question}>
                <h3>{question}</h3>
                <p>{answer}</p>
              </article>
            ))}
          </section>
          <section>
            <h2>Salones</h2>
            {salonFaq.map(([question, answer]) => (
              <article key={question}>
                <h3>{question}</h3>
                <p>{answer}</p>
              </article>
            ))}
          </section>
        </div>
        <div className="trust-cta">
          <div>
            <h2>¿No encuentras la respuesta?</h2>
            <p>Escríbenos con el motivo y número de reserva si aplica.</p>
          </div>
          <Link className="btn btn-primary" to="/contacto">Abrir soporte</Link>
        </div>
      </div>
    </section>
  );
}
