import { Download, Mail, Newspaper } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { setSeo } from '../lib/seo';

import { tr } from '../lib/tr';
export default function Press({ supportEmail }: { supportEmail: string }) {
  useEffect(() => {
    setSeo({
      title: tr('Prensa y media kit | Allop'),
      description: 'Recursos de marca, descripción corta y contacto de prensa de Allop.',
      canonicalPath: '/prensa',
    });
  }, []);

  return (
    <section className="press-page">
      <div className="container press-layout">
        <article className="press-hero">
          <p className="eyebrow">{tr('Media kit')}</p>
          <img src="/allop-icon.svg" alt={tr('Logo Allop')} width="72" height="72" decoding="async" />
          <h1>{tr('Allop')}</h1>
          <p>{tr('Allop conecta clientes con salones verificados y ofrece a los negocios una plataforma para gestionar reservas, agenda, caja, clientes y equipos.')}</p>
          <div className="press-actions">
            <a className="btn btn-primary" href={`mailto:${supportEmail}?subject=Prensa%20Allop`}>
              <Mail size={16} />
              {tr('Contacto prensa')}
            </a>
            <a className="btn btn-ghost" href="/allop-icon.svg" download>
              <Download size={16} />
              {tr('Descargar logo')}
            </a>
          </div>
        </article>

        <aside className="press-resources">
          <h2><Newspaper size={18} />{' '}{tr('Recursos')}</h2>
          <div>
            <strong>{tr('Descripción corta')}</strong>
            <p>{tr('Marketplace y software operativo para salones de belleza, peluquería, barbería y bienestar.')}</p>
          </div>
          <div>
            <strong>{tr('Uso de marca')}</strong>
            <p>{tr('Usar el logo con margen suficiente, sin deformarlo y sobre fondos con contraste.')}</p>
          </div>
          <div>
            <strong>{tr('Empresa')}</strong>
            <p>{tr('Allop es un producto de Origar SL. Para datos societarios finales, usar siempre la información legal publicada.')}</p>
          </div>
          <Link className="see-all" to="/contacto">{tr('Otras consultas')}{' '}<Mail size={14} /></Link>
        </aside>
      </div>
    </section>
  );
}
