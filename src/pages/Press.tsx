import { Download, Mail, Newspaper } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { setSeo } from '../lib/seo';

export default function Press({ supportEmail }: { supportEmail: string }) {
  useEffect(() => {
    setSeo({
      title: 'Prensa y media kit | Allop',
      description: 'Recursos de marca, descripcion corta y contacto de prensa de Allop.',
      canonicalPath: '/prensa',
    });
  }, []);

  return (
    <section className="press-page">
      <div className="container press-layout">
        <article className="press-hero">
          <p className="eyebrow">Media kit</p>
          <img src="/allop-icon.svg" alt="Logo Allop" width="72" height="72" decoding="async" />
          <h1>Allop</h1>
          <p>Allop conecta clientes con salones verificados y ofrece a los negocios una plataforma para gestionar reservas, agenda, caja, clientes y equipos.</p>
          <div className="press-actions">
            <a className="btn btn-primary" href={`mailto:${supportEmail}?subject=Prensa%20Allop`}>
              <Mail size={16} />
              Contacto prensa
            </a>
            <a className="btn btn-ghost" href="/allop-icon.svg" download>
              <Download size={16} />
              Descargar logo
            </a>
          </div>
        </article>

        <aside className="press-resources">
          <h2><Newspaper size={18} /> Recursos</h2>
          <div>
            <strong>Descripcion corta</strong>
            <p>Marketplace y software operativo para salones de belleza, peluqueria, barberia y bienestar.</p>
          </div>
          <div>
            <strong>Uso de marca</strong>
            <p>Usar el logo con margen suficiente, sin deformarlo y sobre fondos con contraste.</p>
          </div>
          <div>
            <strong>Empresa</strong>
            <p>Allop es un producto de Origar SL. Para datos societarios finales, usar siempre la informacion legal publicada.</p>
          </div>
          <Link className="see-all" to="/contacto">Otras consultas <Mail size={14} /></Link>
        </aside>
      </div>
    </section>
  );
}
