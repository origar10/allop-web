import {
  BadgeCheck,
  CalendarDays,
  Clock,
  CreditCard,
  ExternalLink,
  Flag,
  Globe,
  Heart,
  MapPin,
  MessageSquare,
  Phone,
  Share2,
  Sparkles,
  Star,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import AppleMap from '../components/AppleMap';
import { SALONS, type Salon } from '../data/salons';
import { isFavoriteSalon, toggleFavoriteSalon } from '../lib/accountStore';
import { loadClientSession } from '../lib/clientSession';
import { getSalonBySlug } from '../lib/salonsApi';
import { formatPrice, getServices, groupByCategory } from '../lib/salonDetails';
import { clearStructuredData, setSeo, setStructuredData } from '../lib/seo';
import { useToast } from '../lib/useToast';

const REVIEWS_PAGE_SIZE = 4;
const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
const SCHEMA_DAYS: Record<string, string> = {
  lunes: 'Monday', martes: 'Tuesday', miercoles: 'Wednesday', jueves: 'Thursday',
  viernes: 'Friday', sabado: 'Saturday', domingo: 'Sunday',
};

const sinAcentos = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const capitalizar = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

type Horario = NonNullable<Salon['horarioApertura']>;

function hasLocation(salon: Salon) {
  return salon.lat !== 0 || salon.lng !== 0;
}

function getAppleMapsUrl(salon: Salon) {
  const query = encodeURIComponent(`${salon.name}, ${salon.address || salon.location}`);
  return hasLocation(salon)
    ? `https://maps.apple.com/?q=${query}&ll=${salon.lat},${salon.lng}`
    : `https://maps.apple.com/?q=${query}`;
}

function formatFranjas(entry: Horario[number]) {
  if (!entry.abierto || entry.franjas.length === 0) return null;
  return entry.franjas.map((f) => `${f.inicio}–${f.fin}`).join(' · ');
}

/** "Abierto hoy 10:00–20:00" / "Hoy cerrado", según el horario que publica el salón. */
function horarioDeHoy(horario: Horario | undefined) {
  if (!horario?.length) return null;
  const hoy = DIAS_SEMANA[new Date().getDay()];
  const entry = horario.find((d) => sinAcentos(d.dia) === hoy);
  if (!entry) return null;
  const franjas = formatFranjas(entry);
  return franjas ? `Abierto hoy ${franjas}` : 'Hoy cerrado';
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
}

function webHref(web: string) {
  return /^https?:\/\//i.test(web) ? web : `https://${web}`;
}

export default function SalonProfile() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const staticSalon = useMemo(() => SALONS.find((item) => item.slug === slug), [slug]);
  // Resultado de la carga, atado al slug: al cambiar de ficha vuelve a "cargando" sin setState en el efecto.
  const [loaded, setLoaded] = useState<{ slug: string; salon: Salon | null } | null>(null);

  useEffect(() => {
    if (staticSalon) return undefined;
    const controller = new AbortController();
    getSalonBySlug(slug, controller.signal)
      .then((s) => setLoaded({ slug, salon: s }))
      .catch(() => {
        // Un abort (cambio de ficha o StrictMode) no es "salón inexistente".
        if (!controller.signal.aborted) setLoaded({ slug, salon: null });
      });
    return () => controller.abort();
  }, [slug, staticSalon]);

  const apiLoading = !staticSalon && loaded?.slug !== slug;
  const apiSalon = loaded?.slug === slug ? loaded.salon : null;
  const salon = staticSalon ?? apiSalon;
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(() => isFavoriteSalon(slug));
  const [shareMessage, setShareMessage] = useState('');
  const { notify } = useToast();

  const services = useMemo(() => salon ? getServices(salon) : [], [salon]);
  const serviceGroups = useMemo(() => groupByCategory(services), [services]);
  const salonReviews = useMemo(() => salon?.reviewsList ?? [], [salon]);
  const filteredReviews = useMemo(
    () => filterRating ? salonReviews.filter((r) => Math.round(r.rating) === filterRating) : salonReviews,
    [salonReviews, filterRating],
  );
  const visibleReviews = filteredReviews.slice(0, reviewsPage * REVIEWS_PAGE_SIZE);
  // Recuento real por estrellas [5★..1★] de las reseñas publicadas.
  const ratingDist = useMemo(
    () => [5, 4, 3, 2, 1].map((star) => salonReviews.filter((r) => Math.round(r.rating) === star).length),
    [salonReviews],
  );
  const session = salon ? loadClientSession(salon.slug) : null;

  useEffect(() => {
    if (!salon) return;

    const salonPath = `/salones/${salon.slug}`;
    const salonServices = getServices(salon);
    const reviews = salon.reviewsList ?? [];
    const precio = salon.desde > 0 ? ` desde ${salon.desde} €` : '';

    setSeo({
      title: `${salon.name}${salon.location ? ` en ${salon.location}` : ''} | Allop`,
      description: salon.description
        ? `${salon.description.slice(0, 140)} Reserva cita${precio} en Allop.`
        : `Reserva cita en ${salon.name}${precio} en Allop.`,
      canonicalPath: salonPath,
      type: 'business.business',
    });

    const horario = (salon.horarioApertura ?? []).filter((d) => d.abierto && d.franjas.length);

    setStructuredData('salon-profile', [
      {
        '@context': 'https://schema.org',
        '@type': salon.category === 'Barbería' ? 'BarberShop' : salon.category === 'Peluquería' ? 'HairSalon' : 'BeautySalon',
        name: salon.name,
        description: salon.description || undefined,
        image: salon.photos?.[0] ?? 'https://allop.es/allop-icon.svg',
        url: `https://allop.es${salonPath}`,
        telephone: salon.phone || undefined,
        priceRange: salon.desde > 0 ? `Desde ${salon.desde} EUR` : undefined,
        address: {
          '@type': 'PostalAddress',
          streetAddress: salon.address,
          addressLocality: salon.location,
          addressCountry: 'ES',
        },
        geo: hasLocation(salon)
          ? { '@type': 'GeoCoordinates', latitude: salon.lat, longitude: salon.lng }
          : undefined,
        aggregateRating: salon.reviews > 0
          ? { '@type': 'AggregateRating', ratingValue: salon.rating, reviewCount: salon.reviews }
          : undefined,
        review: reviews.slice(0, 3).map((review) => ({
          '@type': 'Review',
          author: { '@type': 'Person', name: review.author },
          reviewRating: { '@type': 'Rating', ratingValue: review.rating, bestRating: 5 },
          reviewBody: review.text,
        })),
        makesOffer: salonServices.map((service) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: service.name },
          ...(service.price !== null ? { price: service.price, priceCurrency: 'EUR' } : {}),
          url: `https://allop.es/reservar/${salon.slug}?service=${service.id}`,
        })),
        openingHoursSpecification: horario.flatMap((d) => d.franjas.map((f) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: SCHEMA_DAYS[sinAcentos(d.dia)] ?? d.dia,
          opens: f.inicio,
          closes: f.fin,
        }))),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Marketplace', item: 'https://allop.es/' },
          { '@type': 'ListItem', position: 2, name: salon.category, item: `https://allop.es/servicios/${sinAcentos(salon.category)}` },
          { '@type': 'ListItem', position: 3, name: salon.location, item: `https://allop.es/ciudad/${sinAcentos(salon.location)}` },
          { '@type': 'ListItem', position: 4, name: salon.name, item: `https://allop.es${salonPath}` },
        ],
      },
    ]);

    return () => clearStructuredData('salon-profile');
  }, [salon]);

  if (apiLoading) return null;
  if (!salon) return <Navigate to="/404" replace />;

  const photoUrls = salon.photos ?? [];
  const canonicalUrl = `${window.location.origin}/salones/${salon.slug}`;
  const bookingPath = `/reservar/${salon.slug}`;
  const hoy = horarioDeHoy(salon.horarioApertura);
  const horario = salon.horarioApertura ?? [];
  const hoyKey = DIAS_SEMANA[new Date().getDay()];

  const toggleFavorite = () => {
    if (!session) {
      navigate(`/login?next=/salones/${salon.slug}`);
      return;
    }

    const next = toggleFavoriteSalon(salon.slug);
    setIsFavorite(next);
    notify(next ? 'Salón guardado.' : 'Salón quitado de favoritos.', 'success');
  };

  const shareSalon = async () => {
    const shareData = {
      title: `${salon.name} en Allop`,
      text: salon.description,
      url: canonicalUrl,
    };

    if (navigator.share) {
      await navigator.share(shareData).catch(() => undefined);
      return;
    }

    await navigator.clipboard?.writeText(canonicalUrl).catch(() => undefined);
    setShareMessage('Enlace copiado');
    notify('Enlace copiado.', 'success');
    window.setTimeout(() => setShareMessage(''), 1800);
  };

  return (
    <article className="salon-profile">
      <section className="salon-profile-hero">
        <div className="container salon-profile-hero-grid">
          <div className="salon-profile-copy">
            <nav className="breadcrumb-chain" aria-label="Miga de pan">
              <Link to="/">Marketplace</Link>
              <span>/</span>
              <Link to={`/servicios/${sinAcentos(salon.category)}`}>{salon.category}</Link>
              {salon.location && (
                <>
                  <span>/</span>
                  <Link to={`/ciudad/${sinAcentos(salon.location)}`}>{salon.location}</Link>
                </>
              )}
            </nav>
            {(salon.verified || salon.featured || !!salon.badges?.length) && (
              <div className="salon-profile-badges">
                {salon.verified && <span><BadgeCheck size={14} /> Verificado</span>}
                {salon.featured && <span>Destacado</span>}
                {salon.badges?.map((badge) => <span key={badge}>{badge}</span>)}
              </div>
            )}

            <p className="eyebrow">{salon.category}{salon.location ? ` · ${salon.location}` : ''}</p>
            <h1>{salon.name}</h1>
            {salon.description && <p className="salon-profile-description">{salon.description}</p>}
            <div className="salon-profile-meta">
              {salon.reviews > 0 ? (
                <a href="#resenas"><Star size={16} fill="#F59E0B" color="#F59E0B" /> {salon.rating.toFixed(1)} · {salon.reviews} {salon.reviews === 1 ? 'reseña' : 'reseñas'}</a>
              ) : (
                <span><Sparkles size={16} /> Nuevo en Allop</span>
              )}
              {salon.address && <span><MapPin size={16} /> {salon.address}</span>}
              {hoy && <span><Clock size={16} /> {hoy}</span>}
            </div>
            <div className="salon-profile-actions">
              <Link className="btn btn-primary btn-lg" to={bookingPath}>
                <CalendarDays size={17} />
                Reservar cita
              </Link>
              {salon.phone && (
                <a className="btn btn-ghost btn-lg" href={`tel:${salon.phone.replace(/\s/g, '')}`}>
                  <Phone size={17} />
                  Llamar
                </a>
              )}
              <button className="btn btn-ghost btn-lg" type="button" onClick={toggleFavorite} aria-pressed={isFavorite}>
                <Heart size={17} fill={isFavorite ? 'currentColor' : 'none'} />
                {isFavorite ? 'Guardado' : 'Guardar'}
              </button>
              <button className="btn btn-ghost btn-lg" type="button" onClick={shareSalon} aria-label="Compartir">
                <Share2 size={17} />
              </button>
            </div>
            {shareMessage && <p className="share-message">{shareMessage}</p>}
          </div>
          <div className="salon-profile-gallery" aria-label="Galería del salón">
            {photoUrls.length > 0 ? (
              <img
                className="salon-profile-main-photo"
                src={photoUrls[selectedPhoto]}
                alt={`${salon.name}, foto ${selectedPhoto + 1}`}
              />
            ) : (
              <div className="salon-profile-main-photo salon-photo-empty" aria-hidden="true">
                <span>{initials(salon.name)}</span>
              </div>
            )}
            {photoUrls.length > 1 && (
              <div className="salon-profile-thumbs">
                {photoUrls.map((url, index) => (
                  <button
                    key={url}
                    className={selectedPhoto === index ? 'active' : ''}
                    type="button"
                    onClick={() => setSelectedPhoto(index)}
                    aria-label={`Ver foto ${index + 1}`}
                  >
                    <img src={url} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="salon-profile-body">
        <div className="container salon-profile-layout">
          <div className="salon-profile-main">
            <section className="profile-block" id="servicios">
              <div className="section-header">
                <div>
                  <h2 className="section-title">Servicios</h2>
                  <p className="section-subtitle">Elige uno y reserva en tiempo real con la agenda del salón</p>
                </div>
              </div>
              {services.length === 0 ? (
                <p className="profile-reviews-empty">
                  Este salón todavía no ha publicado servicios para reservar online.
                  {salon.phone && <> Puedes pedir cita llamando al <a href={`tel:${salon.phone.replace(/\s/g, '')}`}>{salon.phone}</a>.</>}
                </p>
              ) : (
                <div className="service-groups">
                  {serviceGroups.map((group) => (
                    <div key={group.category ?? '_'} className="service-group">
                      {serviceGroups.length > 1 && <h3 className="service-group-title">{group.category ?? 'Otros servicios'}</h3>}
                      <div className="services-list">
                        {group.items.map((service) => (
                          <article key={service.id}>
                            <div>
                              <h3>{service.name}</h3>
                              <span><Clock size={14} /> {service.duration}</span>
                            </div>
                            <div className="services-list-actions">
                              {service.price !== null && <strong>{formatPrice(service.price)}</strong>}
                              <Link to={`${bookingPath}?service=${service.id}`} className="btn btn-primary btn-sm">
                                Reservar
                              </Link>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="profile-block" id="resenas">
              <div className="section-header">
                <div>
                  <h2 className="section-title">Reseñas</h2>
                  <p className="section-subtitle">Solo pueden opinar clientes que han tenido cita en el salón</p>
                </div>
              </div>

              {salonReviews.length === 0 ? (
                <p className="profile-reviews-empty">
                  Aún no hay reseñas. Si reservas desde Allop, podrás dejar la tuya después de la cita.
                </p>
              ) : (
                <>
                  <div className="rating-distribution" aria-label="Distribución de puntuaciones">
                    <div className="rating-dist-summary">
                      <span className="rating-dist-score">{salon.rating.toFixed(1)}</span>
                      <div className="rating-dist-stars" aria-label={`${salon.rating} de 5 estrellas`}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={14} fill={s <= Math.round(salon.rating) ? '#F59E0B' : 'none'} color="#F59E0B" />
                        ))}
                      </div>
                      <span className="rating-dist-total">{salon.reviews} {salon.reviews === 1 ? 'reseña' : 'reseñas'}</span>
                    </div>
                    <div className="rating-dist-bars">
                      {[5, 4, 3, 2, 1].map((star, i) => {
                        const count = ratingDist[i] ?? 0;
                        const pct = salonReviews.length > 0 ? Math.round((count / salonReviews.length) * 100) : 0;
                        return (
                          <button
                            key={star}
                            className={`rating-dist-row${filterRating === star ? ' active' : ''}`}
                            type="button"
                            disabled={count === 0}
                            onClick={() => { setFilterRating(filterRating === star ? null : star); setReviewsPage(1); }}
                            aria-pressed={filterRating === star}
                            aria-label={`Filtrar por ${star} estrellas (${count} reseñas)`}
                          >
                            <span className="rating-dist-label">{star}★</span>
                            <span className="rating-dist-bar-track">
                              <span className="rating-dist-bar-fill" style={{ width: `${pct}%` }} />
                            </span>
                            <span className="rating-dist-count">{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {filterRating && (
                    <div className="rating-filter-active">
                      <span>Mostrando reseñas de {filterRating}★</span>
                      <button className="btn-link" type="button" onClick={() => setFilterRating(null)}>
                        Quitar filtro
                      </button>
                    </div>
                  )}

                  <div className="profile-reviews">
                    {visibleReviews.map((review) => (
                      <article key={review.id}>
                        <div className="review-card-top">
                          <strong>{review.author}</strong>
                          <span className="review-stars" aria-label={`${review.rating} de 5`}>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={13} fill={s <= review.rating ? '#F59E0B' : 'none'} color="#F59E0B" />
                            ))}
                          </span>
                        </div>
                        {review.text && <p>{review.text}</p>}
                        {review.date && <small>{review.date}</small>}

                        {review.ownerReply && (
                          <div className="review-owner-reply">
                            <div className="review-owner-reply-header">
                              <MessageSquare size={13} />
                              <strong>Respuesta del salón</strong>
                            </div>
                            <p>{review.ownerReply}</p>
                          </div>
                        )}

                        <div className="review-actions">
                          <Link
                            to={`/contacto?motivo=reportar-resena&resena=${review.id}`}
                            className="review-report-link"
                            aria-label="Reportar esta reseña"
                          >
                            <Flag size={12} />
                            Reportar
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                  {visibleReviews.length < filteredReviews.length && (
                    <button className="btn btn-ghost" type="button" onClick={() => setReviewsPage((page) => page + 1)}>
                      Ver más reseñas
                    </button>
                  )}
                </>
              )}
            </section>
          </div>

          <aside className="salon-profile-side">
            <section className="profile-side-card profile-book-card">
              <h2>Reserva en 1 minuto</h2>
              <p>Ves los huecos libres reales del salón y la cita entra directamente en su agenda.</p>
              <Link className="btn btn-primary btn-lg" to={bookingPath}>
                <CalendarDays size={17} />
                Ver horas libres
              </Link>
            </section>

            {(salon.address || hasLocation(salon)) && (
              <section className="profile-side-card">
                <h2>Ubicación</h2>
                {hasLocation(salon) && (
                  <AppleMap
                    salons={[salon]}
                    className="profile-map"
                    ariaLabel={`Mapa de ${salon.name}`}
                    onOpenSalon={() => window.open(getAppleMapsUrl(salon), '_blank', 'noopener,noreferrer')}
                    getFallbackPinStyle={() => ({ left: '50%', top: '50%' })}
                  />
                )}
                {salon.address && <p>{salon.address}</p>}
                <a className="business-email-link" href={getAppleMapsUrl(salon)} target="_blank" rel="noreferrer">
                  <MapPin size={13} />
                  Cómo llegar
                </a>
              </section>
            )}

            {horario.length > 0 && (
              <section className="profile-side-card">
                <h2>Horario</h2>
                <div className="hours-list">
                  {horario.map((entry) => (
                    <div key={entry.dia} className={sinAcentos(entry.dia) === hoyKey ? 'is-today' : undefined}>
                      <span>{capitalizar(entry.dia)}</span>
                      <strong>{formatFranjas(entry) ?? 'Cerrado'}</strong>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(salon.phone || salon.web) && (
              <section className="profile-side-card">
                <h2>Contacto</h2>
                <div className="contact-list">
                  {salon.phone && <a href={`tel:${salon.phone.replace(/\s/g, '')}`}><Phone size={15} /> {salon.phone}</a>}
                  {salon.web && (
                    <a href={webHref(salon.web)} target="_blank" rel="noopener noreferrer nofollow">
                      <Globe size={15} /> {salon.web.replace(/^https?:\/\//i, '').replace(/\/$/, '')}
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </section>
            )}

            <section className="profile-side-card">
              <h2><CreditCard size={15} /> Pago</h2>
              <p>Reservar en Allop es gratis. Pagas directamente en el salón el día de tu cita.</p>
            </section>

            {(salon.category || salon.tags.length > 0) && (
              <section className="profile-side-card">
                <h2>Especialidades</h2>
                <div className="profile-tags">
                  <span>{salon.category}</span>
                  {salon.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              </section>
            )}

            <section className="profile-side-card">
              <h2>¿Algo no cuadra?</h2>
              <div className="contact-list">
                <Link to={`/contacto?motivo=reportar-datos&salon=${salon.slug}`}>Reportar datos incorrectos</Link>
                <Link to={`/contacto?motivo=reclamar-ficha&salon=${salon.slug}`}>¿Es tu salón? Gestiona la ficha</Link>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </article>
  );
}
