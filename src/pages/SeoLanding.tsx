import { ArrowRight, BookOpen, MapPin, Search, Star } from 'lucide-react';
import { useEffect } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import SalonCard from '../components/SalonCard';
import { SALONS } from '../data/salons';
import { CITIES, EDITORIAL_FAQS, EDITORIAL_GUIDES, SERVICE_CITY_ROUTES, SERVICES, findCity, findService, matchesService, normalizeSearch } from '../lib/taxonomy';
import { setSeo } from '../lib/seo';
import { trackEvent } from '../lib/analytics';

type SeoLandingType = 'city' | 'service' | 'serviceCity';

export default function SeoLanding({ type }: { type: SeoLandingType }) {
  const navigate = useNavigate();
  const { slug = '', serviceSlug = '', citySlug = '' } = useParams();
  const city = type === 'service' ? undefined : findCity(type === 'city' ? slug : citySlug);
  const service = type === 'city' ? undefined : findService(type === 'service' ? slug : serviceSlug);
  const isInvalidLanding = (type === 'city' && !city) || (type === 'service' && !service) || (type === 'serviceCity' && (!city || !service));

  const filteredSalons = SALONS.filter((salon) => {
    const matchesCity = city ? normalizeSearch(salon.location).includes(normalizeSearch(city.label)) : true;
    const serviceText = [salon.category, ...salon.tags].join(' ');
    const matchesServiceQuery = service ? matchesService(serviceText, service) : true;

    return matchesCity && matchesServiceQuery;
  });

  const fallbackSalons = city
    ? SALONS.filter((salon) => normalizeSearch(salon.location).includes(normalizeSearch(city.label)))
    : service
      ? SALONS.filter((salon) => matchesService([salon.category, ...salon.tags].join(' '), service))
      : SALONS;
  const visibleSalons = (filteredSalons.length ? filteredSalons : fallbackSalons.length ? fallbackSalons : SALONS).slice(0, 4);
  const title = type === 'city'
    ? `Salones en ${city?.label}`
    : type === 'service'
      ? `${service?.label} en Allop`
      : `${service?.label} en ${city?.label}`;
  const subtitle = type === 'city'
    ? `${city?.description} Compara precio, disponibilidad y opiniones antes de reservar.`
    : type === 'service'
      ? `${service?.description} Encuentra salones verificados con disponibilidad online.`
      : `Reserva ${service?.label.toLowerCase()} en ${city?.label} con salones verificados, politica clara y soporte si algo falla.`;
  const canonicalPath = type === 'city'
    ? `/ciudad/${city?.slug}`
    : type === 'service'
      ? `/servicios/${service?.slug}`
      : `/${service?.slug}/${city?.slug}`;

  useEffect(() => {
    setSeo({
      title: `${title} | Allop`,
      description: subtitle,
      canonicalPath,
    });
  }, [canonicalPath, subtitle, title]);

  if (isInvalidLanding) return <Navigate to="/" replace />;

  const relatedServiceCityRoutes = SERVICE_CITY_ROUTES
    .filter((route) => route.serviceSlug !== service?.slug || route.citySlug !== city?.slug)
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 5);

  const clientGuides = EDITORIAL_GUIDES.filter((guide) => guide.audience === 'clientes').slice(0, 3);

  return (
    <section className="seo-landing">
      <div className="container">
        <div className="seo-landing-hero">
          <p className="eyebrow">{type === 'serviceCity' ? 'Guia local' : type === 'city' ? 'Ciudad popular' : 'Servicio popular'}</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
          <div className="seo-landing-actions">
            <Link className="btn btn-primary btn-lg" to="/#buscar">
              <Search size={17} />
              Buscar ahora
            </Link>
            <Link className="btn btn-ghost btn-lg" to="/guias">
              <BookOpen size={17} />
              Ver guias
            </Link>
          </div>
        </div>

        <div className="section-header">
          <h2 className="section-title">
            <Star size={20} fill="#F59E0B" color="#F59E0B" /> Salones destacados
          </h2>
          <Link className="see-all" to="/#buscar">Ver marketplace <ArrowRight size={14} /></Link>
        </div>
        <div className="salons-grid">
          {visibleSalons.map((salon) => (
            <SalonCard
              key={salon.id}
              {...salon}
              nextSlot={salon.nextSlot}
              badges={salon.badges}
              onSelect={() => {
                trackEvent('salon_click', { salonSlug: salon.slug, source: 'seo_landing' });
                navigate(`/salones/${salon.slug}`);
              }}
            />
          ))}
        </div>

        <div className="seo-landing-grid">
          <article>
            <h2>Servicios relacionados</h2>
            <div className="profile-tags">
              {SERVICES.filter((item) => item.slug !== service?.slug).slice(0, 7).map((item) => (
                <Link key={item.slug} to={`/servicios/${item.slug}`}>{item.label}</Link>
              ))}
            </div>
          </article>
          <article>
            <h2>Ciudades populares</h2>
            <div className="profile-tags">
              {CITIES.map((item) => (
                <Link key={item.slug} to={`/ciudad/${item.slug}`}><MapPin size={13} /> {item.label}</Link>
              ))}
            </div>
          </article>
          <article>
            <h2>Rutas locales prioritarias</h2>
            <div className="profile-tags">
              {relatedServiceCityRoutes.map((route) => {
                const routeService = findService(route.serviceSlug);
                const routeCity = findCity(route.citySlug);
                if (!routeService || !routeCity) return null;
                return <Link key={`${route.serviceSlug}-${route.citySlug}`} to={`/${routeService.slug}/${routeCity.slug}`}>{routeService.label} en {routeCity.label}</Link>;
              })}
            </div>
          </article>
        </div>

        <div className="seo-faq-grid">
          <article>
            <p className="eyebrow">FAQ indexable</p>
            <h2>Preguntas frecuentes sobre precio, duracion y reservas</h2>
            {EDITORIAL_FAQS.map((faq) => (
              <div className="seo-faq-item" key={faq.intent}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </article>
          <article>
            <p className="eyebrow">Guias para clientes</p>
            <h2>Antes y despues de reservar</h2>
            {clientGuides.map((guide) => (
              <Link className="guide-row" key={guide.slug} to={`/guias/clientes/${guide.slug}`}>
                <strong>{guide.title}</strong>
                <span>{guide.summary}</span>
              </Link>
            ))}
          </article>
        </div>
      </div>
    </section>
  );
}
