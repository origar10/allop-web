import {
  ArrowRight,
  CalendarDays,
  CheckCircle,
  Hand,
  Heart,
  LifeBuoy,
  LocateFixed,
  Map as MapIcon,
  MapPin,
  Search,
  Scissors,
  SlidersHorizontal,
  Smile,
  Sparkles,
  Star,
  Wand2,
} from 'lucide-react';
import { type CSSProperties, type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SalonCard from '../components/SalonCard';
import { PROMO_BANNER, RECENT_REVIEWS, SALONS, type Salon } from '../data/salons';
import { saveMarketplaceLead, type MarketplaceLead } from '../lib/marketplaceLeads';
import { listMarketplaceSalons } from '../lib/salonsApi';
import { setSeo } from '../lib/seo';

const CATEGORIES = [
  { icon: <Scissors size={22} />, label: 'Peluquería' },
  { icon: <Smile size={22} />, label: 'Barbería' },
  { icon: <Sparkles size={22} />, label: 'Estética' },
  { icon: <Hand size={22} />, label: 'Uñas' },
  { icon: <Heart size={22} />, label: 'Masajes' },
  { icon: <Wand2 size={22} />, label: 'Maquillaje' },
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

const POPULAR_CITIES = ['Barcelona', 'Rubí', 'Sabadell', 'Terrassa'];
const POPULAR_SERVICES = [
  { label: 'Corte de pelo', slug: 'corte' },
  { label: 'Peluquería', slug: 'peluqueria' },
  { label: 'Barbería', slug: 'barberia' },
  { label: 'Manicura', slug: 'manicura' },
  { label: 'Masajes', slug: 'masajes' },
  { label: 'Maquillaje', slug: 'maquillaje' },
];
const CITY_LINKS = [
  { label: 'Barcelona', slug: 'barcelona' },
  { label: 'Rubí', slug: 'rubi' },
  { label: 'Sabadell', slug: 'sabadell' },
  { label: 'Terrassa', slug: 'terrassa' },
];
const INITIAL_VISIBLE_COUNT = 6;

type AvailabilityFilter = 'all' | 'today' | 'tomorrow' | 'week';
type SortMode = 'recommended' | 'rating' | 'price' | 'distance' | 'availability';
type ViewMode = 'grid' | 'map';

interface UserLocation {
  lat: number;
  lng: number;
}

interface HomeProps {
  searchTerm: string;
  onSearchTermChange: (query: string) => void;
  onSearch: (query: string) => void;
  onOpenSalon: (salon: Salon) => void;
  onSalonSignup: () => void;
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
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
    distance: `${getDistanceKm(userLocation, salon).toFixed(1)} km`,
  };
}

function getAvailabilityGroup(salon: Salon): AvailabilityFilter {
  const slot = normalize(salon.nextSlot);

  if (slot.includes('hoy')) return 'today';
  if (slot.includes('manana')) return 'tomorrow';
  return 'week';
}

function getAvailabilityRank(salon: Salon) {
  const group = getAvailabilityGroup(salon);

  if (group === 'today') return 0;
  if (group === 'tomorrow') return 1;
  return 2;
}

function matchesQuery(salon: Salon, query: string, city: string) {
  const haystack = normalize([salon.name, salon.category, salon.location, salon.tags.join(' ')].join(' '));
  const normalizedQuery = normalize(query);
  const normalizedCity = normalize(city);

  return (!normalizedQuery || haystack.includes(normalizedQuery)) &&
    (!normalizedCity || normalize(salon.location).includes(normalizedCity));
}

function sortSalons(salons: Salon[], sortBy: SortMode, userLocation: UserLocation | null = null) {
  return [...salons].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating || b.reviews - a.reviews;
    if (sortBy === 'price') return a.desde - b.desde || b.rating - a.rating;
    if (sortBy === 'distance') return getDistanceValue(a, userLocation) - getDistanceValue(b, userLocation);
    if (sortBy === 'availability') return getAvailabilityRank(a) - getAvailabilityRank(b) || b.rating - a.rating;

    return Number(b.featured) - Number(a.featured) || b.rating - a.rating || b.reviews - a.reviews;
  });
}

function getMapPinStyle(salon: Salon, salons: Salon[]): CSSProperties {
  const lats = salons.map((item) => item.lat);
  const lngs = salons.map((item) => item.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latRange = Math.max(maxLat - minLat, 0.01);
  const lngRange = Math.max(maxLng - minLng, 0.01);

  return {
    left: `${12 + ((salon.lng - minLng) / lngRange) * 76}%`,
    top: `${88 - ((salon.lat - minLat) / latRange) * 76}%`,
  };
}

export default function Home({ searchTerm, onSearchTermChange, onSearch, onOpenSalon, onSalonSignup }: HomeProps) {
  const [salons, setSalons] = useState<Salon[]>(SALONS);
  const [cityQuery, setCityQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState(80);
  const [minRating, setMinRating] = useState(0);
  const [maxDistance, setMaxDistance] = useState('all');
  const [availability, setAvailability] = useState<AvailabilityFilter>('all');
  const [sortBy, setSortBy] = useState<SortMode>('recommended');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isLoadingSalons, setIsLoadingSalons] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [geoEnabled, setGeoEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [leadType, setLeadType] = useState<MarketplaceLead['type'] | null>(null);
  const [lead, setLead] = useState({ name: '', phone: '', email: '', city: '', message: '' });
  const [leadMessage, setLeadMessage] = useState('');

  useEffect(() => {
    setSeo({
      title: 'Allop | Encuentra salon y reserva en segundos',
      description: 'Marketplace de salones con reservas verificadas, disponibilidad online, resenas y soporte para clientes y negocios.',
      canonicalPath: '/',
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    listMarketplaceSalons(controller.signal)
      .then((items) => {
        setSalons(items);
        setLoadError(null);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setSalons(SALONS);
        setLoadError(error instanceof Error ? error.message : 'No se pudieron cargar los salones.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingSalons(false);
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

  const filteredSalons = useMemo(() => {
    const query = category || debouncedSearchTerm;
    const maxDistanceValue = maxDistance === 'all' ? Number.POSITIVE_INFINITY : Number(maxDistance);

    const nextSalons = salons.filter((salon) => {
      const hasQuery = matchesQuery(salon, query, cityQuery);
      const hasPrice = salon.desde <= maxPrice;
      const hasRating = salon.rating >= minRating;
      const hasDistance = getDistanceValue(salon, userLocation) <= maxDistanceValue;
      const hasAvailability = availability === 'all' || getAvailabilityGroup(salon) === availability;

      return hasQuery && hasPrice && hasRating && hasDistance && hasAvailability;
    });

    return sortSalons(nextSalons, sortBy, userLocation).map((salon) => withDisplayDistance(salon, userLocation));
  }, [availability, category, cityQuery, debouncedSearchTerm, maxDistance, maxPrice, minRating, salons, sortBy, userLocation]);

  const visibleSalons = filteredSalons.slice(0, visibleCount);

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

  const offerSalons = useMemo(
    () => salons.filter((salon) => salon.badges?.includes('Últimas plazas')).slice(0, 4),
    [salons],
  );

  useEffect(() => {
    const startTimer = window.setTimeout(() => {
      setVisibleCount(INITIAL_VISIBLE_COUNT);
      setIsFiltering(true);
    }, 0);

    const endTimer = window.setTimeout(() => setIsFiltering(false), 180);

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(endTimer);
    };
  }, [availability, category, cityQuery, debouncedSearchTerm, maxDistance, maxPrice, minRating, sortBy, viewMode]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCategory(null);
    onSearch(searchTerm.trim());
  };

  const runQuickSearch = (query: string) => {
    setCategory(null);
    onSearch(query);
  };

  const selectCategory = (label: string) => {
    setCategory(label);
    onSearch(label);
  };

  const useNearby = () => {
    if (!navigator.geolocation) {
      setGeoEnabled(true);
      setSortBy('distance');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGeoEnabled(true);
        setSortBy('distance');
      },
      () => {
        setGeoEnabled(true);
        setSortBy('distance');
      },
      { maximumAge: 60000, timeout: 4000 },
    );
  };

  const clearFilters = () => {
    setCategory(null);
    onSearchTermChange('');
    setCityQuery('');
    setMaxPrice(80);
    setMinRating(0);
    setMaxDistance('all');
    setAvailability('all');
    setSortBy('recommended');
    setViewMode('grid');
    onSearch('');
  };

  const resultText = isLoadingSalons
    ? 'Cargando salones...'
    : filteredSalons.length === 1 ? '1 salón disponible' : `${filteredSalons.length} salones disponibles`;

  const submitLead = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!leadType || !lead.name.trim() || !lead.phone.trim()) {
      setLeadMessage('Indica nombre y teléfono para poder contactarte.');
      return;
    }

    saveMarketplaceLead({
      type: leadType,
      ...lead,
      query: debouncedSearchTerm || category || undefined,
      createdAt: new Date().toISOString(),
    });
    setLead({ name: '', phone: '', email: '', city: '', message: '' });
    setLeadMessage('Recibido. Lo revisaremos y te avisaremos si podemos ayudarte.');
  };

  return (
    <>
      <section className="hero" id="buscar">
        <h1>Encuentra tu salón.<br />Reserva en segundos.</h1>
        <p>Más de 500 salones y profesionales en Barcelona y alrededores.<br />Sin llamadas, sin esperas.</p>

        <form className="search-bar" onSubmit={submitSearch}>
          <div className="search-field">
            <Scissors size={18} />
            <input
              value={searchTerm}
              onChange={(event) => {
                onSearchTermChange(event.target.value);
                setCategory(null);
              }}
              placeholder="¿Qué servicio buscas?"
              aria-label="Servicio"
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
              placeholder="Ciudad o barrio"
              aria-label="Ciudad o barrio"
            />
          </div>
          <button className="search-btn" type="submit">
            <Search size={17} />
            Buscar
          </button>
        </form>

        <div className="search-chips">
          {CHIPS.map((chip) => (
            <button key={chip} className="chip" type="button" onClick={() => runQuickSearch(chip)}>
              {chip}
            </button>
          ))}
        </div>
        <div className="trust-strip" aria-label="Confianza Allop">
          <span><ShieldIcon /> Reservas verificadas</span>
          <span><CalendarDays size={15} /> Cancelación clara</span>
          <span><LifeBuoy size={15} /> Soporte si algo falla</span>
          <span><Heart size={15} /> Privacidad cuidada</span>
        </div>
      </section>

      <section className="commercial-links">
        <div className="container commercial-link-grid">
          <article>
            <h2>Servicios populares</h2>
            <div>
              {POPULAR_SERVICES.map((service) => <Link key={service.slug} to={`/servicios/${service.slug}`}>{service.label}</Link>)}
            </div>
          </article>
          <article>
            <h2>Ciudades populares</h2>
            <div>
              {CITY_LINKS.map((city) => <Link key={city.slug} to={`/ciudad/${city.slug}`}>{city.label}</Link>)}
            </div>
          </article>
        </div>
      </section>

      <section>
        <div className="container">
          <h2 className="section-title" style={{ marginBottom: 24 }}>¿Qué buscas hoy?</h2>
          <div className="categories-grid">
            {CATEGORIES.map((item) => (
              <button
                key={item.label}
                className={`category-pill ${category === item.label ? 'active' : ''}`}
                type="button"
                onClick={() => selectCategory(item.label)}
                aria-pressed={category === item.label}
              >
                <div className="category-icon">{item.icon}</div>
                <span className="category-label">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {PROMO_BANNER.enabled && (
        <section className="promo-section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="promo-banner">
              <div>
                <p className="eyebrow">{PROMO_BANNER.eyebrow}</p>
                <h2>{PROMO_BANNER.title}</h2>
                <p>{PROMO_BANNER.text}</p>
              </div>
              <button className="btn btn-white" type="button" onClick={() => runQuickSearch(PROMO_BANNER.query)}>
                {PROMO_BANNER.cta}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="marketplace-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="filters-panel">
            <div className="filters-title">
              <SlidersHorizontal size={18} />
              <strong>Filtros</strong>
            </div>
            <label>
              Precio máximo
              <span>{maxPrice} €</span>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={maxPrice}
                onChange={(event) => setMaxPrice(Number(event.target.value))}
              />
            </label>
            <label>
              Valoración mínima
              <select value={minRating} onChange={(event) => setMinRating(Number(event.target.value))}>
                <option value={0}>Todas</option>
                <option value={4}>4.0+</option>
                <option value={4.5}>4.5+</option>
                <option value={4.8}>4.8+</option>
              </select>
            </label>
            <label>
              Distancia
              <select value={maxDistance} onChange={(event) => setMaxDistance(event.target.value)}>
                <option value="all">Cualquier distancia</option>
                <option value="3">Hasta 3 km</option>
                <option value="8">Hasta 8 km</option>
                <option value="15">Hasta 15 km</option>
              </select>
            </label>
            <label>
              Disponibilidad
              <select value={availability} onChange={(event) => setAvailability(event.target.value as AvailabilityFilter)}>
                <option value="all">Cualquier día</option>
                <option value="today">Hoy</option>
                <option value="tomorrow">Mañana</option>
                <option value="week">Esta semana</option>
              </select>
            </label>
            <label>
              Ordenar
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortMode)}>
                <option value="recommended">Recomendados</option>
                <option value="rating">Mejor valorados</option>
                <option value="price">Precio más bajo</option>
                <option value="distance">Más cerca</option>
                <option value="availability">Antes disponible</option>
              </select>
            </label>
          </div>

          {loadError && (
            <div className="market-alert" role="status">
              Mostrando datos locales mientras la API pública no responde: {loadError}
            </div>
          )}

          <div className="city-shortcuts">
            {POPULAR_CITIES.map((city) => (
              <button key={city} type="button" className={cityQuery === city ? 'active' : ''} onClick={() => setCityQuery(city)}>
                {city}
              </button>
            ))}
            <button type="button" onClick={useNearby}>
              <LocateFixed size={14} />
              {geoEnabled ? 'Cerca de ti' : 'Usar ubicación'}
            </button>
          </div>

          <div className="section-header">
            <div>
              <h2 className="section-title">Resultados</h2>
              <p className="section-subtitle">{resultText}</p>
            </div>
            <div className="results-actions">
              <div className="view-toggle" aria-label="Cambiar vista">
                <button type="button" className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}>
                  <Search size={14} />
                  Lista
                </button>
                <button type="button" className={viewMode === 'map' ? 'active' : ''} onClick={() => setViewMode('map')}>
                  <MapIcon size={14} />
                  Mapa
                </button>
              </div>
              <button className="see-all" type="button" onClick={clearFilters}>Limpiar filtros</button>
            </div>
          </div>

          {isLoadingSalons || isFiltering ? (
            <div className="salons-grid">
              {Array.from({ length: Math.min(visibleCount, 4) }).map((_, index) => (
                <div className="salon-skeleton" key={index}>
                  <span />
                  <div>
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
              ))}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="salons-grid">
              {visibleSalons.map((salon) => (
                <SalonCard
                  key={salon.id}
                  {...salon}
                  nextSlot={salon.nextSlot}
                  badges={salon.badges}
                  onSelect={() => onOpenSalon(salon)}
                />
              ))}
            </div>
          ) : (
            <div className="market-map-layout">
              <div className="market-map" aria-label="Mapa de salones">
                {visibleSalons.map((salon) => (
                  <button
                    key={salon.id}
                    className="market-map-pin"
                    style={getMapPinStyle(salon, visibleSalons)}
                    type="button"
                    onClick={() => onOpenSalon(salon)}
                    aria-label={`Abrir ficha de ${salon.name}`}
                  >
                    <MapPin size={16} />
                    <span>{salon.desde} €</span>
                  </button>
                ))}
              </div>
              <div className="market-map-list">
                {visibleSalons.map((salon) => (
                  <button key={salon.id} type="button" onClick={() => onOpenSalon(salon)}>
                    <strong>{salon.name}</strong>
                    <span>{salon.location} · {salon.distance} · {salon.nextSlot}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isLoadingSalons && !isFiltering && filteredSalons.length === 0 && (
            <div className="empty-results">
              <Search size={22} />
              <strong>No hay resultados con esos filtros.</strong>
              <p>Prueba otra ciudad, sube el precio máximo, elimina disponibilidad o deja tu contacto para avisarte.</p>
              <div className="empty-actions">
                <button className="btn btn-primary" type="button" onClick={clearFilters}>Ver todos los salones</button>
                <button className="btn btn-ghost" type="button" onClick={() => setLeadType('no_results')}>Avisadme</button>
              </div>
            </div>
          )}

          {!isLoadingSalons && !isFiltering && visibleCount < filteredSalons.length && (
            <div className="load-more">
              <button className="btn btn-ghost" type="button" onClick={() => setVisibleCount((count) => count + INITIAL_VISIBLE_COUNT)}>
                Cargar más salones
              </button>
            </div>
          )}
        </div>
      </section>

      {!!offerSalons.length && (
        <section className="offers-section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">Ofertas cerca de ti</h2>
                <p className="section-subtitle">Promociones y últimas plazas disponibles</p>
              </div>
            </div>
            <div className="salons-grid compact">
              {offerSalons.map((salon) => (
                <SalonCard key={salon.id} {...salon} nextSlot={salon.nextSlot} badges={salon.badges} onSelect={() => onOpenSalon(salon)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {!!newSalons.length && (
        <section style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">Salones nuevos en Allop</h2>
                <p className="section-subtitle">Fichas recientes para dar vida al marketplace</p>
              </div>
            </div>
            <div className="salons-grid compact">
              {newSalons.map((salon) => (
                <SalonCard key={salon.id} {...salon} nextSlot={salon.nextSlot} badges={salon.badges} onSelect={() => onOpenSalon(salon)} />
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
                <LocateFixed size={20} /> Cerca de ti
              </h2>
              <p className="section-subtitle">Ordenados por distancia con los datos disponibles</p>
            </div>
            <button className="see-all" type="button" onClick={useNearby}>Ver cercanos <ArrowRight size={14} /></button>
          </div>
          <div className="salons-grid compact">
            {nearbySalons.map((salon) => (
              <SalonCard key={salon.id} {...salon} nextSlot={salon.nextSlot} badges={salon.badges} onSelect={() => onOpenSalon(salon)} />
            ))}
          </div>
        </div>
      </section>

      <section className="reviews-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <Star size={20} fill="#F59E0B" color="#F59E0B" /> Reseñas recientes
              </h2>
              <p className="section-subtitle">Opiniones verificadas de clientes tras su reserva</p>
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
              <Star size={20} fill="#F59E0B" color="#F59E0B" /> Más valorados
            </h2>
            <button className="see-all" type="button" onClick={() => runQuickSearch('')}>Ver todos <ArrowRight size={14} /></button>
          </div>
          <div className="salons-grid">
            {topSalons.map((salon) => (
              <SalonCard key={salon.id} {...salon} nextSlot={salon.nextSlot} badges={salon.badges} onSelect={() => onOpenSalon(salon)} />
            ))}
          </div>
        </div>
      </section>

      <section className="how-section" id="como-funciona">
        <div className="container">
          <h2 className="how-title">Reservar es así de fácil</h2>
          <div className="how-steps">
            <div className="how-step">
              <div className="how-icon"><Search size={26} /></div>
              <h3>Busca y filtra</h3>
              <p>Encuentra el salón perfecto por servicio, ubicación, precio o disponibilidad.</p>
            </div>
            <div className="how-step">
              <div className="how-icon"><CalendarDays size={26} /></div>
              <h3>Elige fecha y hora</h3>
              <p>Consulta la agenda en tiempo real y reserva el hueco que mejor te va.</p>
            </div>
            <div className="how-step">
              <div className="how-icon"><Star size={26} /></div>
              <h3>Disfruta y valora</h3>
              <p>Recibe recordatorios automáticos. Después, comparte tu experiencia.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="after-booking-section">
        <div className="container after-booking-grid">
          <article>
            <CalendarDays size={22} />
            <h3>Tras reservar</h3>
            <p>Recibes el resumen de la cita y el salón ve la solicitud en su agenda.</p>
          </article>
          <article>
            <CheckCircle size={22} />
            <h3>Confirmación</h3>
            <p>La reserva queda pendiente o confirmada según disponibilidad y reglas del salón.</p>
          </article>
          <article>
            <LifeBuoy size={22} />
            <h3>Cancelar o pedir ayuda</h3>
            <p>Desde tu cuenta puedes cancelar y contactar si algo no encaja.</p>
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
              <h2>¿Tienes un salón?<br />Únete a Allop.</h2>
              <p>Gestiona tu agenda, cobra, fideliza clientes y aparece en el marketplace, todo desde un panel propio.</p>
            </div>
            <div className="cta-actions">
              <button className="btn btn-lg btn-outline-white" type="button" onClick={onSalonSignup}>Saber más</button>
              <button className="btn btn-lg btn-white" type="button" onClick={onSalonSignup}>Alta de salón</button>
            </div>
          </div>
          <div className="marketplace-ctas">
            <article>
              <h3>¿No encuentras tu salón?</h3>
              <p>Sugiere un negocio y te avisaremos si conseguimos incorporarlo.</p>
              <button className="btn btn-ghost" type="button" onClick={() => setLeadType('suggest_salon')}>Sugerir salón</button>
            </article>
            <article>
              <h3>¿Es tu ficha?</h3>
              <p>Si eres propietario, reclama la ficha para actualizar servicios, horarios y equipo.</p>
              <button className="btn btn-ghost" type="button" onClick={() => setLeadType('claim_listing')}>Reclamar ficha</button>
            </article>
          </div>
        </div>
      </section>

      {leadType && (
        <div className="modal-backdrop" role="presentation" onClick={() => setLeadType(null)}>
          <form className="market-lead-modal" onSubmit={submitLead} onClick={(event) => event.stopPropagation()}>
            <h2>{leadType === 'claim_listing' ? 'Reclamar ficha' : leadType === 'suggest_salon' ? 'Sugerir salón' : 'Avisadme'}</h2>
            <p>Déjanos tus datos y el equipo de Allop revisará la solicitud.</p>
            <label>Nombre<input value={lead.name} onChange={(event) => setLead({ ...lead, name: event.target.value })} /></label>
            <label>Teléfono<input value={lead.phone} onChange={(event) => setLead({ ...lead, phone: event.target.value })} type="tel" /></label>
            <label>Email<input value={lead.email} onChange={(event) => setLead({ ...lead, email: event.target.value })} type="email" /></label>
            <label>Ciudad<input value={lead.city || cityQuery} onChange={(event) => setLead({ ...lead, city: event.target.value })} /></label>
            <label>Mensaje<textarea value={lead.message} onChange={(event) => setLead({ ...lead, message: event.target.value })} rows={3} /></label>
            {leadMessage && <p className={`auth-message ${leadMessage.startsWith('Indica') ? 'err' : 'ok'}`}>{leadMessage}</p>}
            <div className="booking-nav">
              <button className="btn btn-ghost" type="button" onClick={() => setLeadType(null)}>Cerrar</button>
              <button className="btn btn-primary" type="submit">Enviar</button>
            </div>
          </form>
        </div>
      )}

      <section className="company-section" id="empresa">
        <div className="container company-copy">
          <p className="eyebrow">Origar SL</p>
          <h2>Allop conecta salones, clientes y equipos en una plataforma única.</h2>
          <p>La web pública, el dashboard y las apps móviles trabajan juntos para que cada reserva tenga continuidad desde el descubrimiento hasta el cierre de caja.</p>
        </div>
      </section>
    </>
  );
}

function ShieldIcon() {
  return <CheckCircle size={15} />;
}
