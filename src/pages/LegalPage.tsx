import { Link, Navigate, useParams } from 'react-router-dom';

import { tr, idioma } from '../lib/tr';
import { region } from '../lib/region';
import { LEGAL_NORGE, ENLACES_LEGALES_NORGE, RUTA_LEGAL_NORGE } from './legalNorge';
interface LegalSection {
  heading: string;
  text: string[];
}

const LEGAL_CONTENT: Record<string, { title: string; updatedAt: string; intro: string; sections: LegalSection[] }> = {
  privacidad: {
    title: tr('Política de privacidad'),
    updatedAt: '2026-06-05',
    intro: 'Esta política explica como Allop trata datos de clientes y salones para prestar el marketplace, reservas, soporte y software operativo.',
    sections: [
      { heading: 'Responsable', text: ['Responsable: Origar SL, titular de Allop. Contacto: soporte@allop.es.'] },
      { heading: 'Datos tratados', text: ['Teléfono para OTP, confirmaciones y avisos transaccionales.', 'Email si lo facilitas para confirmaciones, soporte y comunicaciones operativas.', 'Datos de reserva: salón, servicio, profesional, fecha, hora, estado y localizador.', 'Geolocalización opcional para ordenar resultados cercanos.'] },
      { heading: 'Finalidades', text: ['Gestionar acceso, reservas, soporte, favoritos, reseñas verificadas y comunicaciones transaccionales.', 'Mejorar disponibilidad, seguridad, detección de errores y experiencia de búsqueda.'] },
      { heading: 'Base juridica', text: ['Ejecución de contrato o medidas precontractuales para reservas y servicios.', 'Consentimiento para analítica y comunicaciones no estrictamente necesarias.', 'Interes legitimo para seguridad, prevención de abuso y mejora operativa.'] },
      { heading: 'Derechos', text: ['Puedes solicitar acceso, rectificación, supresión, oposición, limitación y portabilidad desde Mi cuenta o Contacto.', 'La eliminación local borra datos guardados en este navegador; la supresión completa de backend requiere solicitud de soporte para verificar identidad.'] },
    ],
  },
  terminos: {
    title: tr('Términos y condiciones'),
    updatedAt: '2026-06-05',
    intro: 'Estos términos regulan el uso de Allop como marketplace para clientes y software operativo para salones.',
    sections: [
      { heading: 'Servicio', text: ['Allop permite buscar salones, consultar fichas, reservar servicios y gestionar información operativa.', 'Para salones, Allop puede ofrecer agenda, caja, clientes, equipo, facturación, suscripciones y soporte.'] },
      { heading: 'Reservas', text: ['Las reservas pueden quedar pendientes o confirmadas según disponibilidad y reglas del salón.', 'El salón es responsable de prestar el servicio contratado y comunicar condiciones especificas de cancelación, retrasos o no-show.'] },
      { heading: 'Cuenta', text: ['El usuario debe facilitar datos veraces y mantener la confidencialidad del acceso OTP o cuenta.', 'Allop puede limitar funcionalidades si detecta abuso, spam, fraude o incumplimiento.'] },
      { heading: 'Pagos B2B', text: ['Las suscripciones B2B se gestionan mediante Stripe Checkout y Stripe Customer Portal cuando el alta online esté activa.', 'Allop no guarda datos de tarjeta.'] },
      { heading: 'Cambios', text: ['Podemos actualizar estos términos. La versión publicada indicara la fecha de última actualización.'] },
    ],
  },
  cookies: {
    title: tr('Política de cookies'),
    updatedAt: '2026-06-05',
    intro: 'Allop usa cookies técnicas y puede usar analítica privacy-first solo con consentimiento previo.',
    sections: [
      { heading: 'Cookies técnicas', text: ['Necesarias para recordar sesión, preferencias, reservas locales, favoritos y consentimiento de cookies. No requieren consentimiento previo.'] },
      { heading: 'Analítica', text: ['Plausible solo se carga si aceptas la analítica en el banner.', 'Si rechazas, no se carga el script externo y los eventos quedan como fallback local no enviado.'] },
      { heading: 'Gestión', text: ['Puedes cambiar la decisión borrando el almacenamiento local del navegador o contactando con soporte para ayuda.'] },
    ],
  },
  'aviso-legal': {
    title: tr('Aviso legal'),
    updatedAt: '2026-06-05',
    intro: 'Información general del titular de Allop.',
    sections: [
      { heading: 'Titular', text: ['Origar SL, titular del producto Allop. Datos societarios completos pendientes de revisión final por gestor o asesor legal antes de producción real.'] },
      { heading: 'Contacto', text: ['Email operativo: soporte@allop.es.', 'Para prensa, privacidad, soporte o empleo usa la página de contacto.'] },
      { heading: 'Propiedad intelectual', text: ['Marca, diseno, textos, software y contenidos de Allop pertenecen a Origar SL o a sus respectivos titulares.'] },
    ],
  },
  rgpd: {
    title: tr('Información RGPD'),
    updatedAt: '2026-06-05',
    intro: 'Resumen práctico de derechos y canales para clientes y salones.',
    sections: [
      { heading: 'Derechos disponibles', text: ['Acceso, rectificación, supresión, portabilidad, oposición y limitación del tratamiento.'] },
      { heading: 'Como solicitarlos', text: ['Desde Mi cuenta puedes exportar o borrar datos locales.', 'Para solicitudes sobre datos en backend escribe desde Contacto indicando teléfono, email y contexto de la reserva o salón.'] },
      { heading: 'Verificación', text: ['Podemos pedir información adicional para verificar identidad antes de entregar o eliminar datos.'] },
    ],
  },
  dpa: {
    title: tr('DPA para salones'),
    updatedAt: '2026-06-05',
    intro: 'Acuerdo base de tratamiento de datos para salones que usan Allop como software operativo.',
    sections: [
      { heading: 'Roles', text: ['El salón actua como responsable de los datos de sus clientes cuando usa Allop para gestionar reservas, agenda, comunicaciones e historial.', 'Allop/Origar SL actua como encargado del tratamiento respecto a esos datos operativos.'] },
      { heading: 'Objeto y duración', text: ['Tratamiento necesario para prestar software de agenda, reservas, caja, clientes, soporte, facturación y comunicaciones transaccionales.', 'La duración queda vinculada al contrato o suscripción B2B del salón.'] },
      { heading: 'Medidas', text: ['Control de acceso por cuenta, minimización de datos, registros operativos, backups según entorno y separación de secretos en backend.', 'Stripe trata datos de pago directamente en el alta online.'] },
      { heading: 'Subencargados', text: ['Podran intervenir proveedores de hosting, mensajeria, analítica consentida, soporte y pagos. Se documentaran antes de producción real.'] },
      { heading: 'Fin de servicio', text: ['Al terminar el servicio, el salón podra solicitar exportación, devolución o supresión de datos conforme a plazos legales y obligaciones fiscales.'] },
    ],
  },
  'eliminar-cuenta': {
    title: tr('Eliminar tu cuenta y tus datos'),
    updatedAt: '2026-06-17',
    intro: 'Esta página explica como solicitar la eliminación de tu cuenta y de los datos asociados en las aplicaciones móviles de Origar SL (Allop y las apps propias de cada salón, como Peluquería Feromi, Jessica Portales, Pels Pels u Olga Calzado), tanto desde la propia app como escribiendo a soporte.',
    sections: [
      { heading: 'Responsable', text: ['La app Allop y las apps propias de cada salón son titularidad de Origar SL (desarrollador "Origar" en Google Play y App Store). Para cualquier solicitud sobre tus datos: soporte@allop.es.'] },
      { heading: 'Eliminar la cuenta desde la app', text: [
        'Abre la app (Allop o la de tu salón) e inicia sesión con tu número de teléfono.',
        'Entra en la sección "Mas" o "Perfil".',
        'Pulsa "Eliminar cuenta" y confirma la acción.',
        'Tu cuenta y los datos personales asociados se eliminan de forma permanente.',
      ] },
      { heading: 'Eliminar la cuenta por correo', text: [
        'Si no puedes acceder a la app, escribe a soporte@allop.es con el asunto "Eliminar cuenta", indicando el número de teléfono asociado a tu cuenta.',
        'Podemos pedir información adicional para verificar tu identidad antes de eliminar los datos.',
        'Tramitamos la solicitud en un plazo máximo de 30 días.',
      ] },
      { heading: 'Que datos se eliminan', text: [
        'Datos de perfil: nombre y número de teléfono.',
        'Actividad en la app: reservas, citas y notas que hayas creado.',
        'Token de notificaciones push (Firebase Cloud Messaging) asociado a tu dispositivo.',
      ] },
      { heading: 'Que datos se conservan', text: [
        'Podemos conservar registros minimos que la ley nos obliga a guardar (por ejemplo, obligaciones fiscales o contables cuando apliquen) durante los plazos legales correspondientes.',
        'Transcurridos esos plazos, los datos se eliminan o anonimizan de forma definitiva.',
      ] },
    ],
  },
};

export default function LegalPage() {
  const { slug = '' } = useParams();
  // Noruega: textos propios (bokmål/inglés) en lugar de los de España.
  const norge = region().code === 'no' ? LEGAL_NORGE[idioma() === 'en' ? 'en' : 'nb'] : null;
  const content = norge ? norge[RUTA_LEGAL_NORGE[slug] ?? slug] : LEGAL_CONTENT[slug];

  if (!content) return <Navigate to="/404" replace />;

  return (
    <section className="legal-page">
      <div className="container legal-content">
        <p className="eyebrow">{tr('Legal · Actualizado')}{' '}{content.updatedAt}</p>
        <h1>{content.title}</h1>
        <p>{content.intro}</p>
        {content.sections.map((section) => (
          <article key={section.heading}>
            <h2>{section.heading}</h2>
            {section.text.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </article>
        ))}
        {norge ? (
          <div className="legal-links">
            {ENLACES_LEGALES_NORGE.map((k) => <Link key={k} to={`/${k}`}>{norge[RUTA_LEGAL_NORGE[k]].title}</Link>)}
          </div>
        ) : (
        <div className="legal-links">
          <Link to="/privacidad">{tr('Privacidad')}</Link>
          <Link to="/terminos">{tr('Términos')}</Link>
          <Link to="/cookies">{tr('Cookies')}</Link>
          <Link to="/rgpd">RGPD</Link>
          <Link to="/dpa">{tr('DPA salones')}</Link>
          <Link to="/eliminar-cuenta">{tr('Eliminar cuenta')}</Link>
        </div>
        )}
      </div>
    </section>
  );
}
