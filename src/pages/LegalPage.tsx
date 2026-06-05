import { Link, Navigate, useParams } from 'react-router-dom';

interface LegalSection {
  heading: string;
  text: string[];
}

const LEGAL_CONTENT: Record<string, { title: string; updatedAt: string; intro: string; sections: LegalSection[] }> = {
  privacidad: {
    title: 'Politica de privacidad',
    updatedAt: '2026-06-05',
    intro: 'Esta politica explica como Allop trata datos de clientes y salones para prestar el marketplace, reservas, soporte y software operativo.',
    sections: [
      { heading: 'Responsable', text: ['Responsable: Origar SL, titular de Allop. Contacto: soporte@allop.es.'] },
      { heading: 'Datos tratados', text: ['Telefono para OTP, confirmaciones y avisos transaccionales.', 'Email si lo facilitas para confirmaciones, soporte y comunicaciones operativas.', 'Datos de reserva: salon, servicio, profesional, fecha, hora, estado y localizador.', 'Geolocalizacion opcional para ordenar resultados cercanos.'] },
      { heading: 'Finalidades', text: ['Gestionar acceso, reservas, soporte, favoritos, resenas verificadas y comunicaciones transaccionales.', 'Mejorar disponibilidad, seguridad, deteccion de errores y experiencia de busqueda.'] },
      { heading: 'Base juridica', text: ['Ejecucion de contrato o medidas precontractuales para reservas y servicios.', 'Consentimiento para analitica y comunicaciones no estrictamente necesarias.', 'Interes legitimo para seguridad, prevencion de abuso y mejora operativa.'] },
      { heading: 'Derechos', text: ['Puedes solicitar acceso, rectificacion, supresion, oposicion, limitacion y portabilidad desde Mi cuenta o Contacto.', 'La eliminacion local borra datos guardados en este navegador; la supresion completa de backend requiere solicitud de soporte para verificar identidad.'] },
    ],
  },
  terminos: {
    title: 'Terminos y condiciones',
    updatedAt: '2026-06-05',
    intro: 'Estos terminos regulan el uso de Allop como marketplace para clientes y software operativo para salones.',
    sections: [
      { heading: 'Servicio', text: ['Allop permite buscar salones, consultar fichas, reservar servicios y gestionar informacion operativa.', 'Para salones, Allop puede ofrecer agenda, caja, clientes, equipo, facturacion, suscripciones y soporte.'] },
      { heading: 'Reservas', text: ['Las reservas pueden quedar pendientes o confirmadas segun disponibilidad y reglas del salon.', 'El salon es responsable de prestar el servicio contratado y comunicar condiciones especificas de cancelacion, retrasos o no-show.'] },
      { heading: 'Cuenta', text: ['El usuario debe facilitar datos veraces y mantener la confidencialidad del acceso OTP o cuenta.', 'Allop puede limitar funcionalidades si detecta abuso, spam, fraude o incumplimiento.'] },
      { heading: 'Pagos B2B', text: ['Las suscripciones B2B se gestionan mediante Stripe Checkout y Stripe Customer Portal cuando el self-service este activo.', 'Allop no guarda datos de tarjeta.'] },
      { heading: 'Cambios', text: ['Podemos actualizar estos terminos. La version publicada indicara la fecha de ultima actualizacion.'] },
    ],
  },
  cookies: {
    title: 'Politica de cookies',
    updatedAt: '2026-06-05',
    intro: 'Allop usa cookies tecnicas y puede usar analitica privacy-first solo con consentimiento previo.',
    sections: [
      { heading: 'Cookies tecnicas', text: ['Necesarias para recordar sesion, preferencias, reservas locales, favoritos y consentimiento de cookies. No requieren consentimiento previo.'] },
      { heading: 'Analitica', text: ['Plausible solo se carga si aceptas la analitica en el banner.', 'Si rechazas, no se carga el script externo y los eventos quedan como fallback local no enviado.'] },
      { heading: 'Gestion', text: ['Puedes cambiar la decision borrando el almacenamiento local del navegador o contactando con soporte para ayuda.'] },
    ],
  },
  'aviso-legal': {
    title: 'Aviso legal',
    updatedAt: '2026-06-05',
    intro: 'Informacion general del titular de Allop.',
    sections: [
      { heading: 'Titular', text: ['Origar SL, titular del producto Allop. Datos societarios completos pendientes de revision final por gestor o asesor legal antes de produccion real.'] },
      { heading: 'Contacto', text: ['Email operativo: soporte@allop.es.', 'Para prensa, privacidad, soporte o empleo usa la pagina de contacto.'] },
      { heading: 'Propiedad intelectual', text: ['Marca, diseno, textos, software y contenidos de Allop pertenecen a Origar SL o a sus respectivos titulares.'] },
    ],
  },
  rgpd: {
    title: 'Informacion RGPD',
    updatedAt: '2026-06-05',
    intro: 'Resumen practico de derechos y canales para clientes y salones.',
    sections: [
      { heading: 'Derechos disponibles', text: ['Acceso, rectificacion, supresion, portabilidad, oposicion y limitacion del tratamiento.'] },
      { heading: 'Como solicitarlos', text: ['Desde Mi cuenta puedes exportar o borrar datos locales.', 'Para solicitudes sobre datos en backend escribe desde Contacto indicando telefono, email y contexto de la reserva o salon.'] },
      { heading: 'Verificacion', text: ['Podemos pedir informacion adicional para verificar identidad antes de entregar o eliminar datos.'] },
    ],
  },
  dpa: {
    title: 'DPA para salones',
    updatedAt: '2026-06-05',
    intro: 'Acuerdo base de tratamiento de datos para salones que usan Allop como software operativo.',
    sections: [
      { heading: 'Roles', text: ['El salon actua como responsable de los datos de sus clientes cuando usa Allop para gestionar reservas, agenda, comunicaciones e historial.', 'Allop/Origar SL actua como encargado del tratamiento respecto a esos datos operativos.'] },
      { heading: 'Objeto y duracion', text: ['Tratamiento necesario para prestar software de agenda, reservas, caja, clientes, soporte, facturacion y comunicaciones transaccionales.', 'La duracion queda vinculada al contrato o suscripcion B2B del salon.'] },
      { heading: 'Medidas', text: ['Control de acceso por cuenta, minimizacion de datos, registros operativos, backups segun entorno y separacion de secretos en backend.', 'Stripe trata datos de pago directamente cuando se activa self-service.'] },
      { heading: 'Subencargados', text: ['Podran intervenir proveedores de hosting, mensajeria, analitica consentida, soporte y pagos. Se documentaran antes de produccion real.'] },
      { heading: 'Fin de servicio', text: ['Al terminar el servicio, el salon podra solicitar exportacion, devolucion o supresion de datos conforme a plazos legales y obligaciones fiscales.'] },
    ],
  },
};

export default function LegalPage() {
  const { slug = '' } = useParams();
  const content = LEGAL_CONTENT[slug];

  if (!content) return <Navigate to="/" replace />;

  return (
    <section className="legal-page">
      <div className="container legal-content">
        <p className="eyebrow">Legal · Actualizado {content.updatedAt}</p>
        <h1>{content.title}</h1>
        <p>{content.intro}</p>
        {content.sections.map((section) => (
          <article key={section.heading}>
            <h2>{section.heading}</h2>
            {section.text.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </article>
        ))}
        <div className="legal-links">
          <Link to="/privacidad">Privacidad</Link>
          <Link to="/terminos">Terminos</Link>
          <Link to="/cookies">Cookies</Link>
          <Link to="/rgpd">RGPD</Link>
          <Link to="/dpa">DPA salones</Link>
        </div>
      </div>
    </section>
  );
}
