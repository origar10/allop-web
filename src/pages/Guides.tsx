import { ArrowRight, BookOpen, CheckCircle, Scissors } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { EDITORIAL_GUIDES, findGuide } from '../lib/taxonomy';
import { setSeo } from '../lib/seo';

export default function Guides() {
  const { audience = '', slug = '' } = useParams();
  const location = useLocation();
  const guide = audience && slug ? findGuide(audience, slug) : undefined;
  const isDetail = Boolean(audience && slug);
  const isInvalidDetail = isDetail && !guide;

  useEffect(() => {
    setSeo({
      title: guide ? `${guide.title} | Guias Allop` : 'Guias Allop para clientes y salones',
      description: guide?.summary || 'Guias evergreen para elegir salon, preparar una reserva y digitalizar la operativa de un salon.',
      canonicalPath: guide ? `/guias/${guide.audience}/${guide.slug}` : location.pathname === '/blog' ? '/blog' : '/guias',
    });
  }, [guide, location.pathname]);

  if (isInvalidDetail) return <Navigate to="/guias" replace />;

  if (guide) {
    return (
      <section className="guide-page">
        <div className="container guide-layout">
          <article className="guide-article">
            <p className="eyebrow">{guide.audience === 'clientes' ? 'Guia para clientes' : 'Guia para salones'}</p>
            <h1>{guide.title}</h1>
            <p className="guide-summary">{guide.summary}</p>
            {guide.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                <p>{section.body}</p>
              </section>
            ))}
            <Link className="btn btn-primary" to="/guias">
              <BookOpen size={16} />
              Ver todas las guias
            </Link>
          </article>
          <aside className="guide-side">
            <h2>Enlaces utiles</h2>
            <Link to="/#buscar">Buscar salon <ArrowRight size={14} /></Link>
            <Link to="/confianza">Reservas verificadas <ArrowRight size={14} /></Link>
            <Link to="/business">Allop para salones <ArrowRight size={14} /></Link>
          </aside>
        </div>
      </section>
    );
  }

  const clientGuides = EDITORIAL_GUIDES.filter((item) => item.audience === 'clientes');
  const businessGuides = EDITORIAL_GUIDES.filter((item) => item.audience === 'salones');

  return (
    <section className="guide-page">
      <div className="container">
        <div className="guide-hero">
          <p className="eyebrow">Contenido editorial</p>
          <h1>Guias Allop</h1>
          <p>Contenido evergreen para clientes que reservan y para salones que quieren ordenar su operativa.</p>
        </div>
        <div className="guide-grid">
          <GuideColumn icon={<Scissors size={20} />} title="Clientes" guides={clientGuides} />
          <GuideColumn icon={<CheckCircle size={20} />} title="Salones" guides={businessGuides} />
        </div>
      </div>
    </section>
  );
}

function GuideColumn({ icon, title, guides }: { icon: ReactNode; title: string; guides: typeof EDITORIAL_GUIDES }) {
  return (
    <article className="guide-column">
      <h2>{icon} {title}</h2>
      {guides.map((guide) => (
        <Link className="guide-card" key={guide.slug} to={`/guias/${guide.audience}/${guide.slug}`}>
          <strong>{guide.title}</strong>
          <span>{guide.summary}</span>
          <em>Leer guia <ArrowRight size={13} /></em>
        </Link>
      ))}
    </article>
  );
}
