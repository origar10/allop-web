import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Scissors } from 'lucide-react';
import SalonCard from '../components/SalonCard';
import { SALONS } from '../data/salons';
import { CATEGORIES, CITIES, SERVICES } from '../lib/taxonomy';
import { setSeo } from '../lib/seo';
import { trackEvent } from '../lib/analytics';

export default function SalonsDirectory() {
  const navigate = useNavigate();

  useEffect(() => {
    setSeo({
      title: 'Directorio de salones | Allop',
      description: 'Directorio indexable de salones en Allop por ciudad, categoria y servicio.',
      canonicalPath: '/salones',
    });
  }, []);

  return (
    <section className="directory-page">
      <div className="container">
        <div className="directory-hero">
          <p className="eyebrow">Directorio Allop</p>
          <h1>Salones publicados</h1>
          <p>Explora salones verificados por ciudad, categoria y servicio. Cada ficha mantiene disponibilidad, precio desde y acceso a reserva.</p>
          <div className="directory-actions">
            <Link className="btn btn-primary btn-lg" to="/buscar">
              <Scissors size={17} />
              Buscar salones
            </Link>
            <Link className="btn btn-ghost btn-lg" to="/#buscar">Volver al marketplace</Link>
          </div>
        </div>

        <div className="directory-link-grid">
          <article>
            <h2>Ciudades</h2>
            <div>
              {CITIES.map((city) => <Link key={city.slug} to={`/ciudad/${city.slug}`}><MapPin size={13} /> {city.label}</Link>)}
            </div>
          </article>
          <article>
            <h2>Categorias</h2>
            <div>
              {CATEGORIES.map((category) => <Link key={category.slug} to={`/categoria/${category.slug}`}>{category.label}</Link>)}
            </div>
          </article>
          <article>
            <h2>Servicios</h2>
            <div>
              {SERVICES.slice(0, 8).map((service) => <Link key={service.slug} to={`/servicios/${service.slug}`}>{service.label}</Link>)}
            </div>
          </article>
        </div>

        <div className="section-header">
          <div>
            <h2 className="section-title">Todos los salones</h2>
            <p className="section-subtitle">{SALONS.length} fichas disponibles para reserva online</p>
          </div>
          <Link className="see-all" to="/buscar">Buscar <ArrowRight size={14} /></Link>
        </div>

        <div className="salons-grid">
          {SALONS.map((salon) => (
            <SalonCard
              key={salon.id}
              {...salon}
              nextSlot={salon.nextSlot}
              badges={salon.badges}
              onSelect={() => {
                trackEvent('salon_click', { salonSlug: salon.slug, source: 'salons_directory' });
                navigate(`/salones/${salon.slug}`);
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
