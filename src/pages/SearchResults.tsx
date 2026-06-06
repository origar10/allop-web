import { type CSSProperties, type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, LocateFixed, Map as MapIcon, MapPin, Search, SlidersHorizontal } from 'lucide-react';
import AppleMap from '../components/AppleMap';
import SalonCard from '../components/SalonCard';
import { SALONS, type Salon } from '../data/salons';
import { trackEvent } from '../lib/analytics';
import { listMarketplaceSalons } from '../lib/salonsApi';
import { matchesQuery, normalize } from '../lib/searchUtils';
import { setSeo } from '../lib/seo';
import { statusFromItems } from '../shared/asyncState';
import { formatDistanceKm } from '../shared/formatters';

const POPULAR_CITIES = ['Barcelona', 'Rubi', 'Sabadell', 'Terrassa'];
const INITIAL_VISIBLE_COUNT = 6;

type AvailabilityFilter = 'all' | 'today' | 'tomorrow' | 'week';
type SortMode = 'recommended' | 'rating' | 'price' | 'distance' | 'availability';
type ViewMode = 'grid' | 'map';

interface UserLocation {
  lat: number;
  lng: number;
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

function getAppleMapsUrl(salon: Salon) {
  const query = encodeURIComponent(`${salon.name}, ${salon.address || salon.location}`);
  return `https://maps.apple.com/?q=${query}&ll=${salon.lat},${salon.lng}`;
}

function buildSearchPath(query: string, city: string) {
  const params = new URLSearchParams();
  if (query.trim()) params.set('q', query.trim());
  if (city.trim()) params.set('ciudad', city.trim());
  return `/buscar${params.toString() ? `?${params.toString()}` : ''}`;
}

export default function SearchResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const city = searchParams.get('ciudad') || '';
  const [draftQuery, setDraftQuery] = useState(query);
  const [draftCity, setDraftCity] = useState(city);
  const [salons, setSalons] = useState<Salon[]>(SALONS);
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
      description: 'Busqueda compartible de salones en Allop con filtros por servicio, ciudad, disponibilidad y mapa.',
      canonicalPath: '/buscar',
    });
  }, [city, query]);

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
    const startTimer = window.setTimeout(() => {
      setVisibleCount(INITIAL_VISIBLE_COUNT);
      setIsFiltering(true);
    }, 0);

    const endTimer = window.setTimeout(() => setIsFiltering(false), 180);

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(endTimer);
    };
  }, [availability, city, maxDistance, maxPrice, minRating, query, sortBy, viewMode]);

  const filteredSalons = useMemo(() => {
    const maxDistanceValue = maxDistance === 'all' ? Number.POSITIVE_INFINITY : Number(maxDistance);

    const nextSalons = salons.filter((salon) => {
      const hasQuery = matchesQuery(salon, query, city);
      const hasPrice = salon.desde <= maxPrice;
      const hasRating = salon.rating >= minRating;
      const hasDistance = getDistanceValue(salon, userLocation) <= maxDistanceValue;
      const hasAvailability = availability === 'all' || getAvailabilityGroup(salon) === availability;

      return hasQuery && hasPrice && hasRating && hasDistance && hasAvailability;
    });

    return sortSalons(nextSalons, sortBy, userLocation).map((salon) => withDisplayDistance(salon, userLocation));
  }, [availability, city, maxDistance, maxPrice, minRating, query, salons, sortBy, userLocation]);

  const visibleSalons = filteredSalons.slice(0, visibleCount);
  const resultsStatus = statusFromItems(filteredSalons, isLoadingSalons || isFiltering, loadError);
  const resultText = isLoadingSalons
    ? 'Cargando salones...'
    : filteredSalons.length === 1 ? '1 salon disponible' : `${filteredSalons.length} salones disponibles`;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    trackEvent('search', { query: draftQuery.trim() || 'empty', city: draftCity.trim() || null, source: 'search_page' });
    navigate(buildSearchPath(draftQuery, draftCity));
  };

  const openSalon = (salon: Salon) => {
    trackEvent('salon_click', { salonSlug: salon.slug, source: 'search_page' });
    navigate(`/salones/${salon.slug}`);
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
    setDraftQuery('');
    setDraftCity('');
    setMaxPrice(80);
    setMinRating(0);
    setMaxDistance('all');
    setAvailability('all');
    setSortBy('recommended');
    setViewMode('grid');
    navigate('/buscar');
  };

  return (
    <section className="directory-page">
      <div className="container">
        <div className="directory-hero">
          <p className="eyebrow">Busqueda</p>
          <h1>Resultados de busqueda</h1>
          <p>Busca por servicio, salon, categoria, barrio o ciudad y cambia entre lista y mapa.</p>
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

        <div className="filters-panel">
          <div className="filters-title">
            <SlidersHorizontal size={18} />
            <strong>Filtros</strong>
          </div>
          <label>
            Precio maximo
            <span>{maxPrice} EUR</span>
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
            Valoracion minima
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
              <option value="all">Cualquier dia</option>
              <option value="today">Hoy</option>
              <option value="tomorrow">Manana</option>
              <option value="week">Esta semana</option>
            </select>
          </label>
          <label>
            Ordenar
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortMode)}>
              <option value="recommended">Recomendados</option>
              <option value="rating">Mejor valorados</option>
              <option value="price">Precio mas bajo</option>
              <option value="distance">Mas cerca</option>
              <option value="availability">Antes disponible</option>
            </select>
          </label>
        </div>

        {loadError && (
          <div className="market-alert" role="status">
            Mostrando datos locales mientras la API publica no responde: {loadError}
          </div>
        )}

        <div className="city-shortcuts">
          {POPULAR_CITIES.map((item) => (
            <button key={item} type="button" className={city === item ? 'active' : ''} onClick={() => navigate(buildSearchPath(query, item))}>
              {item}
            </button>
          ))}
          <button type="button" onClick={useNearby}>
            <LocateFixed size={14} />
            {geoEnabled ? 'Cerca de ti' : 'Usar ubicacion'}
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
            <Link className="see-all" to="/salones">Directorio <ArrowRight size={14} /></Link>
          </div>
        </div>

        {isLoadingSalons || isFiltering ? (
          <div className="salons-grid" data-state={resultsStatus}>
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
          <div className="salons-grid" data-state={resultsStatus}>
            {visibleSalons.map((salon) => (
              <SalonCard
                key={salon.id}
                {...salon}
                nextSlot={salon.nextSlot}
                badges={salon.badges}
                onSelect={() => openSalon(salon)}
              />
            ))}
          </div>
        ) : (
          <div className="market-map-layout">
            <AppleMap
              salons={visibleSalons}
              ariaLabel="Mapa de salones"
              onOpenSalon={openSalon}
              getFallbackPinStyle={getMapPinStyle}
            />
            <div className="market-map-list">
              {visibleSalons.map((salon) => (
                <article key={salon.id}>
                  <button type="button" onClick={() => openSalon(salon)}>
                    <strong>{salon.name}</strong>
                    <span>{salon.location} - {salon.distance} - {salon.nextSlot}</span>
                  </button>
                  <a href={getAppleMapsUrl(salon)} target="_blank" rel="noreferrer">
                    <MapPin size={13} />
                    Abrir en Apple Maps
                  </a>
                </article>
              ))}
            </div>
          </div>
        )}

        {!isLoadingSalons && !isFiltering && filteredSalons.length === 0 && (
          <div className="empty-results">
            <MapPin size={22} />
            <strong>No hay salones con esos criterios.</strong>
            <p>Prueba una busqueda mas amplia, cambia la ciudad o limpia filtros.</p>
            <button className="btn btn-primary" type="button" onClick={clearFilters}>Ver todos los salones</button>
          </div>
        )}

        {!isLoadingSalons && !isFiltering && visibleCount < filteredSalons.length && (
          <div className="load-more">
            <button className="btn btn-ghost" type="button" onClick={() => setVisibleCount((count) => count + INITIAL_VISIBLE_COUNT)}>
              Cargar mas salones
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
