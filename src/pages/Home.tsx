import {
  ArrowRight,
  CalendarDays,
  CheckCircle,
  Hand,
  Heart,
  LifeBuoy,
  LocateFixed,
  MapPin,
  Search,
  Scissors,
  Smile,
  Sparkles,
  Star,
  Wand2,
} from 'lucide-react';
import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SalonCard from '../components/SalonCard';
import { RECENT_REVIEWS, SALONS, type Salon } from '../data/salons';
import { saveMarketplaceLead, type MarketplaceLead } from '../lib/marketplaceLeads';
import { listMarketplaceSalons } from '../lib/salonsApi';
import { setSeo } from '../lib/seo';
import { CATEGORIES as TAXONOMY_CATEGORIES } from '../lib/taxonomy';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { normalize } from '../lib/searchUtils';
import { formatDistanceKm } from '../shared/formatters';

import { tr } from '../lib/tr';
const CATEGORIES = [
  { icon: <Scissors size={22} />, label: tr('Peluquería') },
  { icon: <Smile size={22} />, label: tr('Barbería') },
  { icon: <Sparkles size={22} />, label: tr('Estética') },
  { icon: <Hand size={22} />, label: tr('Uñas') },
  { icon: <Heart size={22} />, label: tr('Masajes') },
  { icon: <Wand2 size={22} />, label: tr('Maquillaje') },
];

const CHIPS = [
  'Corte de pelo',
  'Mechas',
  'Manicura',
  'Masaje',
  'Barba',
  'Color',
  'Balayage',
  'Depilación',
  'Facial',
  'Keratina',
];

const POPULAR_SERVICES = [
  { label: tr('Corte de pelo'), slug: 'corte' },
  { label: tr('Peluquería'), slug: 'peluqueria' },
  { label: tr('Barbería'), slug: 'barberia' },
  { label: tr('Manicura'), slug: 'manicura' },
  { label: tr('Masajes'), slug: 'masajes' },
  { label: tr('Maquillaje'), slug: 'maquillaje' },
];
const CITY_LINKS = [
  { label: tr('Barcelona'), slug: 'barcelona' },
  { label: tr('Rubí'), slug: 'rubi' },
  { label: tr('Sabadell'), slug: 'sabadell' },
  { label: tr('Terrassa'), slug: 'terrassa' },
];
type SortMode = 'recommended' | 'rating' | 'distance';

interface UserLocation {
  lat: number;
  lng: number;
}

interface HomeProps {
  searchTerm: string;
  onSearchTermChange: (query: string) => void;
  onSearch: (query: string, city?: string) => void;
  onOpenSalon: (salon: Salon) => void;
  onSalonSignup: () => void;
}

function getDistanceKm(from: UserLocation, salon: Salon) {
  const earthRadiusKm = 6371;
  const latDistance = (salon.lat - from.lat) * Math.PI / 180;
  const lngDistance = (salon.lng - from.lng) * Math.PI / 180;
  const fromLat = from.lat * Math.PI / 180;
  const salonLat = salon.lat * Math.PI / 180;
  const haversine = Math.sin(latDistance / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(salonLat) * Math.sin(lngDistance / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function getDistanceValue(salon: Salon, userLocation: UserLocation | null = null) {
  if (userLocation) return getDistanceKm(userLocation, salon);
  return Number.parseFloat(salon.distance.replace(',', '.')) || Number.POSITIVE_INFINITY;
}

function withDisplayDistance(salon: Salon, userLocation: UserLocation | null) {
  if (!userLocation) return salon;

  return {
    ...salon,
    distance: formatDistanceKm(getDistanceKm(userLocation, salon)),
  };
}

function sortSalons(salons: Salon[], sortBy: SortMode, userLocation: UserLocation | null = null) {
  return [...salons].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating || b.reviews - a.reviews;
    if (sortBy === 'distance') return getDistanceValue(a, userLocation) - getDistanceValue(b, userLocation);

    return Number(b.featured) - Number(a.featured) || b.rating - a.rating || b.reviews - a.reviews;
  });
}

export default function Home({ searchTerm, onSearchTermChange, onSearch, onOpenSalon, onSalonSignup }: HomeProps) {
  const [salons, setSalons] = useState<Salon[]>(SALONS);
  const [cityQuery, setCityQuery] = useState('');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [leadType, setLeadType] = useState<MarketplaceLead['type'] | null>(null);
  const [lead, setLead] = useState({ name: '', phone: '', email: '', city: '', message: '' });
  const [leadMessage, setLeadMessage] = useState('');
  const leadModalRef = useRef<HTMLFormElement>(null);

  const closeLeadModal = useCallback(() => setLeadType(null), []);
  useFocusTrap(leadModalRef, Boolean(leadType), closeLeadModal);

  useEffect(() => {
    setSeo({
      title: tr('Allop | Encuentra salón y reserva en segundos'),
      description: 'Marketplace de salones con reservas verificadas, disponibilidad online, reseñas y soporte para clientes y negocios.',
      canonicalPath: '/',
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    listMarketplaceSalons(controller.signal)
      .then((items) => setSalons(items))
      .catch(() => {
        if (controller.signal.aborted) return;
        setSalons(SALONS);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearchTerm(searchTerm), 250);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  const searchSuggestions = useMemo(() => {
    const query = normalize(debouncedSearchTerm.trim());
    if (query.length < 2) return [];

    const sources = [
      ...salons.map((salon) => salon.name),
      ...salons.map((salon) => salon.category),
      ...salons.flatMap((salon) => salon.tags),
      ...CHIPS,
    ];

    return [...new Set(sources)]
      .filter((item) => normalize(item).includes(query))
      .slice(0, 6);
  }, [debouncedSearchTerm, salons]);


  const nearbySalons = useMemo(
    () => sortSalons(salons, 'distance', userLocation).slice(0, 3).map((salon) => withDisplayDistance(salon, userLocation)),
    [salons, userLocation],
  );

  const topSalons = useMemo(
    () => sortSalons(salons, 'rating').slice(0, 4),
    [salons],
  );

  const newSalons = useMemo(
    () => salons.filter((salon) => salon.badges?.includes('Nuevo')).slice(0, 4),
    [salons],
  );

const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = searchTerm.trim();

    setDebouncedSearchTerm(nextQuery);
    onSearchTermChange(nextQuery);
    onSearch(nextQuery, cityQuery.trim());
  };

  const runQuickSearch = (query: string) => {
    onSearch(query);
  };

  const selectCategory = (label: string) => {
    onSearch(label);
  };

  const useNearby = () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => undefined,
      { maximumAge: 60000, timeout: 4000 },
    );
  };


  const submitLead = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!leadType || !lead.name.trim() || !lead.phone.trim()) {
      setLeadMessage('Indica nombre y teléfono para poder contactarte.');
      return;
    }

    saveMarketplaceLead({
      type: leadType,
      ...lead,
      query: debouncedSearchTerm || undefined,
      createdAt: new Date().toISOString(),
    });
    setLead({ name: '', phone: '', email: '', city: '', message: '' });
    setLeadMessage('Recibido. Lo revisaremos y te avisaremos si podemos ayudarte.');
  };

  return (
    <>
      <section className="hero" id="buscar">
        <h1>{tr('Encuentra tu salón.')}<br />{tr('Reserva en segundos.')}</h1>
        <p>{tr('Más de 500 salones y profesionales en Barcelona y alrededores.')}<br />{tr('Sin llamadas, sin esperas.')}</p>

        <form className="search-bar" onSubmit={submitSearch}>
          <div className="search-field">
            <Scissors size={18} />
            <input
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
              placeholder={tr('¿Qué servicio buscas?')}
              aria-label={tr('Servicio')}
              autoComplete="off"
            />
            {!!searchSuggestions.length && (
              <div className="search-suggestions">
                {searchSuggestions.map((suggestion) => (
                  <button key={suggestion} type="button" onClick={() => runQuickSearch(suggestion)}>
                    <Search size={14} />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="search-field search-location">
            <MapPin size={18} />
            <input
              value={cityQuery}
              onChange={(event) => setCityQuery(event.target.value)}
              placeholder={tr('Ciudad o barrio')}
              aria-label={tr('Ciudad o barrio')}
            />
          </div>
          <button className="search-btn" type="submit">
            <Search size={17} />
            {tr('Buscar')}
          </button>
        </form>

        <div className="search-chips">
          {CHIPS.map((chip) => (
            <button key={chip} className="chip" type="button" onClick={() => runQuickSearch(chip)}>
              {chip}
            </button>
          ))}
        </div>
        <div className="trust-strip" aria-label={tr('Confianza Allop')}>
          <span><ShieldIcon />{' '}{tr('Reservas verificadas')}</span>
          <span><CalendarDays size={15} />{' '}{tr('Cancelación clara')}</span>
          <span><LifeBuoy size={15} />{' '}{tr('Soporte si algo falla')}</span>
          <span><Heart size={15} />{' '}{tr('Privacidad cuidada')}</span>
        </div>
      </section>

      <section className="commercial-links">
        <div className="container commercial-link-grid">
          <article>
            <h2>{tr('Servicios populares')}</h2>
            <div>
              {POPULAR_SERVICES.map((service) => <Link key={service.slug} to={`/servicios/${service.slug}`}>{service.label}</Link>)}
            </div>
          </article>
          <article>
            <h2>{tr('Ciudades populares')}</h2>
            <div>
              {CITY_LINKS.map((city) => <Link key={city.slug} to={`/ciudad/${city.slug}`}>{city.label}</Link>)}
            </div>
          </article>
          <article>
            <h2>{tr('Categorías')}</h2>
            <div>
              {TAXONOMY_CATEGORIES.map((item) => <Link key={item.slug} to={`/categoria/${item.slug}`}>{item.label}</Link>)}
            </div>
          </article>
        </div>
      </section>

      <section>
        <div className="container">
          <h2 className="section-title" style={{ marginBottom: 24 }}>{tr('¿Qué buscas hoy?')}</h2>
          <div className="categories-grid">
            {CATEGORIES.map((item) => (
              <button
                key={item.label}
                className="category-pill"
                type="button"
                onClick={() => selectCategory(item.label)}
              >
                <div className="category-icon">{item.icon}</div>
                <span className="category-label">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {!!newSalons.length && (
        <section style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">{tr('Salones nuevos en Allop')}</h2>
                <p className="section-subtitle">{tr('Fichas recientes para dar vida al marketplace')}</p>
              </div>
            </div>
            <div className="salons-grid compact">
              {newSalons.map((salon) => (
                <SalonCard key={salon.id} {...salon} badges={salon.badges} onSelect={() => onOpenSalon(salon)} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="nearby-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <LocateFixed size={20} />{' '}{tr('Cerca de ti')}
              </h2>
              <p className="section-subtitle">{tr('Ordenados por distancia con los datos disponibles')}</p>
            </div>
            <button className="see-all" type="button" onClick={useNearby}>{tr('Ver cercanos')}{' '}<ArrowRight size={14} /></button>
          </div>
          <div className="salons-grid compact">
            {nearbySalons.map((salon) => (
              <SalonCard key={salon.id} {...salon} badges={salon.badges} onSelect={() => onOpenSalon(salon)} />
            ))}
          </div>
        </div>
      </section>

      <section className="reviews-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <Star size={20} fill="#F59E0B" color="#F59E0B" />{' '}{tr('Reseñas recientes')}
              </h2>
              <p className="section-subtitle">{tr('Opiniones verificadas de clientes tras su reserva')}</p>
            </div>
          </div>
          <div className="reviews-grid">
            {RECENT_REVIEWS.map((review) => (
              <article className="review-card" key={review.id}>
                <div className="review-card-top">
                  <strong>{review.author}</strong>
                  <span><Star size={13} fill="#F59E0B" color="#F59E0B" /> {review.rating.toFixed(1)}</span>
                </div>
                <p>{review.text}</p>
                <div className="review-card-foot">
                  <Link to={`/salones/${review.salonSlug}`}>{review.salonName}</Link>
                  <span>{review.service} · {review.date}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <Star size={20} fill="#F59E0B" color="#F59E0B" />{' '}{tr('Más valorados')}
            </h2>
            <button className="see-all" type="button" onClick={() => runQuickSearch('')}>{tr('Ver todos')}{' '}<ArrowRight size={14} /></button>
          </div>
          <div className="salons-grid">
            {topSalons.map((salon) => (
              <SalonCard key={salon.id} {...salon} badges={salon.badges} onSelect={() => onOpenSalon(salon)} />
            ))}
          </div>
        </div>
      </section>

      <section className="how-section" id="como-funciona">
        <div className="container">
          <h2 className="how-title">{tr('Reservar es así de fácil')}</h2>
          <div className="how-steps">
            <div className="how-step">
              <div className="how-icon"><Search size={26} /></div>
              <h3>{tr('Busca y filtra')}</h3>
              <p>{tr('Encuentra el salón perfecto por servicio, ubicación, precio o disponibilidad.')}</p>
            </div>
            <div className="how-step">
              <div className="how-icon"><CalendarDays size={26} /></div>
              <h3>{tr('Elige fecha y hora')}</h3>
              <p>{tr('Consulta la agenda en tiempo real y reserva el hueco que mejor te va.')}</p>
            </div>
            <div className="how-step">
              <div className="how-icon"><Star size={26} /></div>
              <h3>{tr('Disfruta y valora')}</h3>
              <p>{tr('Recibe recordatorios automáticos. Después, comparte tu experiencia.')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="after-booking-section">
        <div className="container after-booking-grid">
          <article>
            <CalendarDays size={22} />
            <h3>{tr('Tras reservar')}</h3>
            <p>{tr('Recibes el resumen de la cita y el salón ve la solicitud en su agenda.')}</p>
          </article>
          <article>
            <CheckCircle size={22} />
            <h3>{tr('Confirmación')}</h3>
            <p>{tr('La reserva queda pendiente o confirmada según disponibilidad y reglas del salón.')}</p>
          </article>
          <article>
            <LifeBuoy size={22} />
            <h3>{tr('Cancelar o pedir ayuda')}</h3>
            <p>{tr('Desde tu cuenta puedes cancelar y contactar si algo no encaja.')}</p>
          </article>
        </div>
      </section>

      <section className="pricing-section" id="tarifas">
        <div className="container pricing-grid">
          {[
            ['Marketplace', 'Ficha pública, reservas y reseñas verificadas.'],
            ['Dashboard', 'Agenda, caja, clientes e inventario conectado.'],
            ['Equipo', 'Roles, empleados y operaciones para varios profesionales.'],
          ].map(([plan, description]) => (
            <article className="pricing-card" key={plan}>
              <CheckCircle size={20} />
              <h3>{plan}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-section" id="para-salones">
        <div className="container">
          <div className="cta-banner cta-split">
            <div className="cta-text">
              <h2>{tr('¿Tienes un salón?')}<br />{tr('Únete a Allop.')}</h2>
              <p>{tr('Gestiona tu agenda, cobra, fideliza clientes y aparece en el marketplace, todo desde un panel propio.')}</p>
            </div>
            <div className="cta-actions">
              <button className="btn btn-lg btn-outline-white" type="button" onClick={onSalonSignup}>{tr('Saber más')}</button>
              <button className="btn btn-lg btn-white" type="button" onClick={onSalonSignup}>{tr('Alta de salón')}</button>
            </div>
          </div>
          <div className="marketplace-ctas">
            <article>
              <h3>{tr('¿No encuentras tu salón?')}</h3>
              <p>{tr('Sugiere un negocio y te avisaremos si conseguimos incorporarlo.')}</p>
              <button className="btn btn-ghost" type="button" onClick={() => setLeadType('suggest_salon')}>{tr('Sugerir salón')}</button>
            </article>
            <article>
              <h3>{tr('¿Es tu ficha?')}</h3>
              <p>{tr('Si eres propietario, reclama la ficha para actualizar servicios, horarios y equipo.')}</p>
              <button className="btn btn-ghost" type="button" onClick={() => setLeadType('claim_listing')}>{tr('Reclamar ficha')}</button>
            </article>
          </div>
        </div>
      </section>

      {leadType && (
        <div className="modal-backdrop" role="presentation" onClick={closeLeadModal}>
          <form
            ref={leadModalRef}
            className="market-lead-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="market-lead-title"
            tabIndex={-1}
            onSubmit={submitLead}
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="market-lead-title">{leadType === 'claim_listing' ? tr('Reclamar ficha') : leadType === 'suggest_salon' ? tr('Sugerir salón') : tr('Avisadme')}</h2>
            <p>{tr('Déjanos tus datos y el equipo de Allop revisará la solicitud.')}</p>
            <label>{tr('Nombre')}<input value={lead.name} onChange={(event) => setLead({ ...lead, name: event.target.value })} /></label>
            <label>{tr('Teléfono')}<input value={lead.phone} onChange={(event) => setLead({ ...lead, phone: event.target.value })} type="tel" /></label>
            <label>{tr('Email')}<input value={lead.email} onChange={(event) => setLead({ ...lead, email: event.target.value })} type="email" /></label>
            <label>{tr('Ciudad')}<input value={lead.city || cityQuery} onChange={(event) => setLead({ ...lead, city: event.target.value })} /></label>
            <label>{tr('Mensaje')}<textarea value={lead.message} onChange={(event) => setLead({ ...lead, message: event.target.value })} rows={3} /></label>
            {leadMessage && (
              <p
                className={`auth-message ${leadMessage.startsWith('Indica') ? 'err' : 'ok'}`}
                role={leadMessage.startsWith('Indica') ? 'alert' : 'status'}
                aria-live={leadMessage.startsWith('Indica') ? 'assertive' : 'polite'}
              >
                {leadMessage}
              </p>
            )}
            <div className="booking-nav">
              <button className="btn btn-ghost" type="button" onClick={closeLeadModal}>{tr('Cerrar')}</button>
              <button className="btn btn-primary" type="submit">{tr('Enviar')}</button>
            </div>
          </form>
        </div>
      )}

      <section className="company-section" id="empresa">
        <div className="container company-copy">
          <p className="eyebrow">{tr('Origar SL')}</p>
          <h2>{tr('Allop conecta salones, clientes y equipos en una plataforma única.')}</h2>
          <p>{tr('La web pública, el dashboard y las apps móviles trabajan juntos para que cada reserva tenga continuidad desde el descubrimiento hasta el cierre de caja.')}</p>
        </div>
      </section>
    </>
  );
}

function ShieldIcon() {
  return <CheckCircle size={15} />;
}
