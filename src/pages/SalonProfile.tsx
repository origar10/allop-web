import {
  BadgeCheck,
  CalendarDays,
  Clock,
  CreditCard,
  ExternalLink,
  Flag,
  Heart,
  Link as LinkIcon,
  MapPin,
  MessageSquare,
  Phone,
  Share2,
  ShieldCheck,
  Star,
  Tag,
  TrendingUp,
  UserRound,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { RECENT_REVIEWS, SALONS, type Promotion, type RecentReview, type Salon } from '../data/salons';
import { isFavoriteSalon, toggleFavoriteSalon } from '../lib/accountStore';
import { loadClientSession } from '../lib/clientSession';
import { getProfessionals, getServices, TIME_SLOTS, WEEK_DAYS } from '../lib/salonDetails';
import { clearStructuredData, setSeo, setStructuredData } from '../lib/seo';
import { useToast } from '../lib/useToast';

const REVIEWS_PAGE_SIZE = 2;

function getSalonReviews(salon: Salon): RecentReview[] {
  const ownReviews = RECENT_REVIEWS.filter((review) => review.salonSlug === salon.slug);

  if (ownReviews.length >= 3) return ownReviews;

  return [
    ...ownReviews,
    ...RECENT_REVIEWS.filter((review) => review.salonSlug !== salon.slug).slice(0, 3 - ownReviews.length),
  ];
}

function getMapPinStyle(salon: Salon) {
  const lats = SALONS.map((item) => item.lat);
  const lngs = SALONS.map((item) => item.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return {
    left: `${12 + ((salon.lng - minLng) / Math.max(maxLng - minLng, 0.01)) * 76}%`,
    top: `${88 - ((salon.lat - minLat) / Math.max(maxLat - minLat, 0.01)) * 76}%`,
  };
}

// Returns counts for [5★, 4★, 3★, 2★, 1★] approximated from aggregate rating+total
function computeRatingDistribution(rating: number, total: number): number[] {
  const r = Math.max(1, Math.min(5, rating));
  const raw = [5, 4, 3, 2, 1].map((star) => {
    const dist = Math.abs(star - r);
    return Math.max(0, 1 - dist * 0.55);
  });
  const sum = raw.reduce((a, b) => a + b, 0);
  const counts = raw.map((w) => Math.round((w / sum) * total));
  const diff = total - counts.reduce((a, b) => a + b, 0);
  counts[0] += diff;
  return counts;
}

function isActivePromotion(p: Promotion): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return p.startDate <= today && today <= p.endDate;
}

function formatPromotionDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
}

export default function SalonProfile() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const salon = useMemo(() => SALONS.find((item) => item.slug === slug), [slug]);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState(salon?.nextSlot || TIME_SLOTS[0]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(() => isFavoriteSalon(slug));
  const [shareMessage, setShareMessage] = useState('');
  const { notify } = useToast();

  const services = useMemo(() => salon ? getServices(salon) : [], [salon]);
  const professionals = useMemo(() => salon ? getProfessionals(salon) : [], [salon]);
  const salonReviews = useMemo(() => salon ? getSalonReviews(salon) : [], [salon]);
  const filteredReviews = useMemo(
    () => filterRating ? salonReviews.filter((r) => Math.round(r.rating) === filterRating) : salonReviews,
    [salonReviews, filterRating],
  );
  const visibleReviews = filteredReviews.slice(0, reviewsPage * REVIEWS_PAGE_SIZE);
  const ratingDist = useMemo(
    () => salon ? computeRatingDistribution(salon.rating, salon.reviews) : [],
    [salon],
  );
  const session = salon ? loadClientSession(salon.slug) : null;

  useEffect(() => {
    if (!salon) return;

    const salonPath = `/salones/${salon.slug}`;
    const serviceSlug = salon.category.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
    const citySlug = salon.location.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
    const reviews = getSalonReviews(salon);
    const salonServices = getServices(salon);

    setSeo({
      title: `${salon.name} en ${salon.location} | Allop`,
      description: `${salon.description} Reserva ${salon.category.toLowerCase()} desde ${salon.desde} EUR en Allop.`,
      canonicalPath: salonPath,
      type: 'business.business',
    });

    setStructuredData('salon-profile', [
      {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: salon.name,
        description: salon.description,
        image: 'https://allop.es/allop-icon.svg',
        url: `https://allop.es${salonPath}`,
        telephone: salon.phone,
        priceRange: `Desde ${salon.desde} EUR`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: salon.address,
          addressLocality: salon.location,
          addressRegion: 'Barcelona',
          addressCountry: 'ES',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: salon.lat,
          longitude: salon.lng,
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: salon.rating,
          reviewCount: salon.reviews,
        },
        review: reviews.slice(0, 3).map((review) => ({
          '@type': 'Review',
          author: { '@type': 'Person', name: review.author },
          reviewRating: { '@type': 'Rating', ratingValue: review.rating, bestRating: 5 },
          reviewBody: review.text,
          datePublished: new Date().toISOString().slice(0, 10),
        })),
        makesOffer: salonServices.map((service) => ({
          '@type': 'Product',
          name: service.name,
          brand: { '@type': 'Brand', name: salon.name },
          category: salon.category,
          offers: {
            '@type': 'Offer',
            price: service.price,
            priceCurrency: 'EUR',
            availability: 'https://schema.org/InStock',
            url: `https://allop.es/reservar/${salon.slug}`,
          },
        })),
        openingHoursSpecification: WEEK_DAYS.slice(0, 6).map((day, index) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: day,
          opens: index === 5 ? '10:00' : '09:30',
          closes: index === 5 ? '14:00' : '20:00',
        })),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Marketplace', item: 'https://allop.es/' },
          { '@type': 'ListItem', position: 2, name: salon.category, item: `https://allop.es/servicios/${serviceSlug}` },
          { '@type': 'ListItem', position: 3, name: salon.location, item: `https://allop.es/ciudad/${citySlug}` },
          { '@type': 'ListItem', position: 4, name: salon.name, item: `https://allop.es${salonPath}` },
        ],
      },
    ]);

    return () => clearStructuredData('salon-profile');
  }, [salon]);

  if (!salon) {
    return <Navigate to="/404" replace />;
  }

  const photos = [salon.imageClass, 'salon-gallery-detail', 'salon-gallery-work'];
  const canonicalUrl = `${window.location.origin}/salones/${salon.slug}`;
  const allPromotions = salon.promotions ?? [];

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
      notify('Ficha compartida.', 'success');
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
              <Link to={`/servicios/${salon.category.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()}`}>{salon.category}</Link>
              <span>/</span>
              <Link to={`/ciudad/${salon.location.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()}`}>{salon.location}</Link>
            </nav>
            <div className="salon-profile-badges">
              {salon.verified && <span><BadgeCheck size={14} /> Verificado</span>}
              {salon.featured && <span>Destacado</span>}
              {salon.badges?.map((badge) => <span key={badge}>{badge}</span>)}
            </div>

            {/* Trust badges */}
            <div className="trust-badges" aria-label="Sellos de confianza">
              <span className="trust-badge-item">
                <ShieldCheck size={14} />
                Reserva segura
              </span>
              <span className="trust-badge-item">
                <MessageSquare size={14} />
                Reseñas verificadas
              </span>
              <span className="trust-badge-item">
                <TrendingUp size={14} />
                Cancelación flexible
              </span>
              {salon.verified && (
                <span className="trust-badge-item trust-badge-accent">
                  <BadgeCheck size={14} />
                  Salón verificado
                </span>
              )}
            </div>

            <p className="eyebrow">{salon.category} · {salon.location}</p>
            <h1>{salon.name}</h1>
            <p>{salon.description}</p>
            <div className="salon-profile-meta">
              <span><Star size={16} fill="#F59E0B" color="#F59E0B" /> {salon.rating.toFixed(1)} · {salon.reviews} reseñas</span>
              <span><MapPin size={16} /> {salon.address}</span>
              <span><CalendarDays size={16} /> Próximo hueco: {salon.nextSlot}</span>
            </div>
            <div className="salon-profile-actions">
              <a className="btn btn-primary btn-lg" href="#reservar">
                <CalendarDays size={17} />
                Reservar
              </a>
              <button className="btn btn-ghost btn-lg" type="button" onClick={toggleFavorite}>
                <Heart size={17} fill={isFavorite ? 'currentColor' : 'none'} />
                {isFavorite ? 'Guardado' : 'Guardar'}
              </button>
              <button className="btn btn-ghost btn-lg" type="button" onClick={shareSalon}>
                <Share2 size={17} />
                Compartir
              </button>
            </div>
            {shareMessage && <p className="share-message">{shareMessage}</p>}
          </div>
          <div className="salon-profile-gallery" aria-label="Galería del salón">
            <div className={`salon-profile-main-photo ${photos[selectedPhoto]}`} />
            <div className="salon-profile-thumbs">
              {photos.map((photo, index) => (
                <button
                  key={photo}
                  className={selectedPhoto === index ? 'active' : ''}
                  type="button"
                  onClick={() => setSelectedPhoto(index)}
                  aria-label={`Ver foto ${index + 1}`}
                >
                  <span className={photo} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="salon-profile-body">
        <div className="container salon-profile-layout">
          <div className="salon-profile-main">
            <section className="profile-block">
              <div className="section-header">
                <div>
                  <h2 className="section-title">Servicios</h2>
                  <p className="section-subtitle">Precio desde, duración estimada y reserva rápida</p>
                </div>
              </div>
              <div className="services-list">
                {services.map((service) => (
                  <article key={service.name}>
                    <div>
                      <h3>{service.name}</h3>
                      <span><Clock size={14} /> {service.duration}</span>
                    </div>
                    <div className="services-list-actions">
                      <strong>{service.price} €</strong>
                      <Link to={`/reservar/${salon.slug}?service=${service.id}`} className="btn btn-primary btn-sm">
                        Reservar
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="profile-block" id="reservar">
              <div className="section-header">
                <div>
                  <h2 className="section-title">Disponibilidad</h2>
                  <p className="section-subtitle">Selecciona fecha y hora para preparar la reserva</p>
                </div>
              </div>
              <div className="booking-preview">
                <div className="date-tabs" role="tablist" aria-label="Fechas disponibles">
                  {['Hoy', 'Mañana', 'Viernes'].map((date, index) => (
                    <button
                      key={date}
                      className={selectedDate === index ? 'active' : ''}
                      type="button"
                      onClick={() => setSelectedDate(index)}
                    >
                      {date}
                    </button>
                  ))}
                </div>
                <div className="time-grid">
                  {[salon.nextSlot, ...TIME_SLOTS].slice(0, 6).map((time) => (
                    <button
                      key={time}
                      className={selectedTime === time ? 'active' : ''}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                <div className="booking-summary">
                  <span>Selección: {selectedTime}</span>
                  <Link className="btn btn-primary" to={`/reservar/${salon.slug}`}>Continuar reserva</Link>
                </div>
              </div>
            </section>

            <section className="profile-block">
              <h2 className="section-title">Profesionales</h2>
              <div className="professionals-grid">
                {professionals.filter((professional) => professional.id !== 'any').map((professional) => (
                  <article key={professional.name}>
                    <div className="professional-avatar"><UserRound size={22} /></div>
                    <h3>{professional.name}</h3>
                    <strong>{professional.role}</strong>
                    <p>{professional.services}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="profile-block">
              <div className="section-header">
                <div>
                  <h2 className="section-title">Reseñas verificadas</h2>
                  <p className="section-subtitle">Opiniones vinculadas a reservas completadas</p>
                </div>
              </div>

              {/* Star distribution */}
              <div className="rating-distribution" aria-label="Distribución de puntuaciones">
                <div className="rating-dist-summary">
                  <span className="rating-dist-score">{salon.rating.toFixed(1)}</span>
                  <div className="rating-dist-stars" aria-label={`${salon.rating} de 5 estrellas`}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} fill={s <= Math.round(salon.rating) ? '#F59E0B' : 'none'} color="#F59E0B" />
                    ))}
                  </div>
                  <span className="rating-dist-total">{salon.reviews} reseñas</span>
                </div>
                <div className="rating-dist-bars">
                  {[5, 4, 3, 2, 1].map((star, i) => {
                    const count = ratingDist[i] ?? 0;
                    const pct = salon.reviews > 0 ? Math.round((count / salon.reviews) * 100) : 0;
                    return (
                      <button
                        key={star}
                        className={`rating-dist-row${filterRating === star ? ' active' : ''}`}
                        type="button"
                        onClick={() => setFilterRating(filterRating === star ? null : star)}
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
                {visibleReviews.length === 0 && (
                  <p className="profile-reviews-empty">No hay reseñas con esta puntuación.</p>
                )}
                {visibleReviews.map((review) => (
                  <article key={review.id}>
                    <div className="review-card-top">
                      <strong>{review.author}</strong>
                      <span><Star size={13} fill="#F59E0B" color="#F59E0B" /> {review.rating.toFixed(1)}</span>
                    </div>
                    <p>{review.text}</p>
                    <small>{review.service} · {review.date}</small>

                    {/* Owner reply */}
                    {review.ownerReply && (
                      <div className="review-owner-reply">
                        <div className="review-owner-reply-header">
                          <MessageSquare size={13} />
                          <strong>Respuesta del salón</strong>
                          <span>{review.ownerReply.date}</span>
                        </div>
                        <p>{review.ownerReply.text}</p>
                      </div>
                    )}

                    {/* Report link */}
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
            </section>
          </div>

          <aside className="salon-profile-side">
            <section className="profile-side-card">
              <h2>Ubicación</h2>
              <div className="profile-map" aria-label={`Mapa de ${salon.name}`}>
                <button className="market-map-pin" style={getMapPinStyle(salon)} type="button" aria-label={salon.address}>
                  <MapPin size={16} />
                  <span>{salon.desde} €</span>
                </button>
              </div>
              <p>{salon.address}</p>
            </section>

            {/* Promotions sidebar */}
            {allPromotions.length > 0 && (
              <section className="profile-side-card">
                <h2><Tag size={15} /> Promociones</h2>
                <div className="promo-cards-list">
                  {allPromotions.map((promo) => {
                    const active = isActivePromotion(promo);
                    return (
                      <div key={promo.id} className={`promo-card${active ? ' promo-card-active' : ''}`}>
                        <div className="promo-card-header">
                          <strong>{promo.title}</strong>
                          {active && <span className="badge-success">Activa</span>}
                          {!active && <span className="badge-neutral">Próximamente</span>}
                        </div>
                        <p>{promo.description}</p>
                        {promo.discountPct && (
                          <span className="promo-card-discount">{promo.discountPct}% dto.</span>
                        )}
                        <div className="promo-card-dates">
                          <CalendarDays size={12} />
                          {formatPromotionDate(promo.startDate)} – {formatPromotionDate(promo.endDate)}
                        </div>
                        {promo.conditions && (
                          <small className="promo-card-conditions">{promo.conditions}</small>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Cancellation policy */}
            {salon.cancelPolicy && (
              <section className="profile-side-card">
                <h2>Política de cancelación</h2>
                <p className="cancel-policy-text">{salon.cancelPolicy}</p>
              </section>
            )}

            {/* Payment info */}
            <section className="profile-side-card">
              <h2><CreditCard size={15} /> Pago y cobro</h2>
              <ul className="payment-info-list">
                <li>
                  <ShieldCheck size={14} />
                  El pago se gestiona de forma segura a través de Allop
                </li>
                <li>
                  <CreditCard size={14} />
                  Se acepta tarjeta de crédito, débito y Google/Apple Pay
                </li>
                <li>
                  <Tag size={14} />
                  Solo se carga el importe una vez completada la reserva
                </li>
              </ul>
            </section>

            <section className="profile-side-card">
              <h2>Horarios</h2>
              <div className="hours-list">
                {WEEK_DAYS.map((day, index) => (
                  <div key={day}>
                    <span>{day}</span>
                    <strong>{index === 6 ? 'Cerrado' : index === 5 ? '10:00 - 14:00' : '09:30 - 20:00'}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="profile-side-card">
              <h2>Contacto</h2>
              <div className="contact-list">
                <a href={`tel:${salon.phone}`}><Phone size={15} /> {salon.phone}</a>
                <a href={canonicalUrl}><LinkIcon size={15} /> URL canónica</a>
                <a href={`https://www.instagram.com/allop.es`}><ExternalLink size={15} /> Instagram</a>
              </div>
            </section>

            <section className="profile-side-card">
              <h2>Categorías</h2>
              <div className="profile-tags">
                <span>{salon.category}</span>
                {salon.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
            </section>

            <section className="profile-side-card">
              <h2>Datos de la ficha</h2>
              <div className="contact-list">
                <Link to={`/contacto?motivo=reportar-datos&salon=${salon.slug}`}>Reportar datos incorrectos</Link>
                <Link to={`/contacto?motivo=reclamar-ficha&salon=${salon.slug}`}>Reclamar o actualizar ficha</Link>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </article>
  );
}
