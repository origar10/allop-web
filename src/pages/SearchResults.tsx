import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, MapPin, Search } from 'lucide-react';
import SalonCard from '../components/SalonCard';
import { SALONS } from '../data/salons';
import { matchesQuery } from '../lib/searchUtils';
import { setSeo } from '../lib/seo';
import { trackEvent } from '../lib/analytics';

export default function SearchResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const city = searchParams.get('ciudad') || '';
  const [draftQuery, setDraftQuery] = useState(query);
  const [draftCity, setDraftCity] = useState(city);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDraftQuery(query);
      setDraftCity(city);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [city, query]);

  useEffect(() => {
    setSeo({
      title: query || city ? `Buscar ${query || 'salones'} ${city ? `en ${city}` : ''} | Allop` : 'Buscar salones | Allop',
      description: 'Busqueda compartible de salones en Allop con filtros por servicio, ciudad y disponibilidad.',
      canonicalPath: '/buscar',
    });
  }, [city, query]);

  const results = useMemo(
    () => SALONS.filter((salon) => matchesQuery(salon, query, city)),
    [city, query],
  );

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (draftQuery.trim()) params.set('q', draftQuery.trim());
    if (draftCity.trim()) params.set('ciudad', draftCity.trim());
    trackEvent('search', { query: draftQuery.trim() || 'empty', city: draftCity.trim() || null, source: 'search_page' });
    navigate(`/buscar${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <section className="directory-page">
      <div className="container">
        <div className="directory-hero">
          <p className="eyebrow">Busqueda compartible</p>
          <h1>Buscar salones</h1>
          <p>Guarda o comparte esta URL para volver a una busqueda por servicio, categoria, barrio o ciudad.</p>
          <form className="directory-search" onSubmit={submit}>
            <label>
              Servicio o salon
              <input value={draftQuery} onChange={(event) => setDraftQuery(event.target.value)} placeholder="Peluqueria, manicura, barberia..." />
            </label>
            <label>
              Ciudad o barrio
              <input value={draftCity} onChange={(event) => setDraftCity(event.target.value)} placeholder="Barcelona, Rubi, Terrassa..." />
            </label>
            <button className="btn btn-primary" type="submit">
              <Search size={16} />
              Buscar
            </button>
          </form>
        </div>

        <div className="section-header">
          <div>
            <h2 className="section-title">Resultados</h2>
            <p className="section-subtitle">{results.length === 1 ? '1 salon encontrado' : `${results.length} salones encontrados`}</p>
          </div>
          <Link className="see-all" to="/salones">Ver directorio <ArrowRight size={14} /></Link>
        </div>

        {results.length ? (
          <div className="salons-grid">
            {results.map((salon) => (
              <SalonCard
                key={salon.id}
                {...salon}
                nextSlot={salon.nextSlot}
                badges={salon.badges}
                onSelect={() => {
                  trackEvent('salon_click', { salonSlug: salon.slug, source: 'search_page' });
                  navigate(`/salones/${salon.slug}`);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="empty-results">
            <MapPin size={22} />
            <strong>No hay salones con esos criterios.</strong>
            <p>Prueba una busqueda mas amplia o revisa el directorio completo.</p>
            <Link className="btn btn-primary" to="/salones">Ver todos los salones</Link>
          </div>
        )}
      </div>
    </section>
  );
}
