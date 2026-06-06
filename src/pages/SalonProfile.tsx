import {
  BadgeCheck,
  CalendarDays,
  Clock,
  ExternalLink,
  Heart,
  Link as LinkIcon,
  MapPin,
  Phone,
  Share2,
  Star,
  UserRound,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { RECENT_REVIEWS, SALONS, type RecentReview, type Salon } from '../data/salons';
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

export default function SalonProfile() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const salon = useMemo(() => SALONS.find((item) => item.slug === slug), [slug]);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState(salon?.nextSlot || TIME_SLOTS[0]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [isFavorite, setIsFavorite] = useState(() => isFavoriteSalon(slug));
  const [shareMessage, setShareMessage] = useState('');
  const { notify } = useToast();

  const services = useMemo(() => salon ? getServices(salon) : [], [salon]);
  const professionals = useMemo(() => salon ? getProfessionals(salon) : [], [salon]);
  const salonReviews = useMemo(() => salon ? getSalonReviews(salon) : [], [salon]);
  const visibleReviews = salonReviews.slice(0, reviewsPage * REVIEWS_PAGE_SIZE);
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
            <p className="eyebrow">{salon.category} Â· {salon.location}</p>
            <h1>{salon.name}</h1>
            <p>{salon.description}</p>
            <div className="salon-profile-meta">
              <span><Star size={16} fill="#F59E0B" color="#F59E0B" /> {salon.rating.toFixed(1)} Â· {salon.reviews} reseÃ±as</span>
              <span><MapPin size={16} /> {salon.address}</span>
              <span><CalendarDays size={16} /> PrÃ³ximo hueco: {salon.nextSlot}</span>
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
          <div className="salon-profile-gallery" aria-label="GalerÃ­a del salÃ³n">
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
                  <p className="section-subtitle">Precio desde, duraciÃ³n estimada y reserva rÃ¡pida</p>
                </div>
              </div>
              <div className="services-list">
                {services.map((service) => (
                  <article key={service.name}>
                    <div>
                      <h3>{service.name}</h3>
                      <span><Clock size={14} /> {service.duration}</span>
                    </div>
                    <strong>{service.price} â‚¬</strong>
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
                  {['Hoy', 'MaÃ±ana', 'Viernes'].map((date, index) => (
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
                  <span>SelecciÃ³n: {selectedTime}</span>
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
                  <h2 className="section-title">ReseÃ±as verificadas</h2>
                  <p className="section-subtitle">Opiniones vinculadas a reservas completadas</p>
                </div>
              </div>
              <div className="profile-reviews">
                {visibleReviews.map((review) => (
                  <article key={review.id}>
                    <div className="review-card-top">
                      <strong>{review.author}</strong>
                      <span><Star size={13} fill="#F59E0B" color="#F59E0B" /> {review.rating.toFixed(1)}</span>
                    </div>
                    <p>{review.text}</p>
                    <small>{review.service} Â· {review.date}</small>
                  </article>
                ))}
              </div>
              {visibleReviews.length < salonReviews.length && (
                <button className="btn btn-ghost" type="button" onClick={() => setReviewsPage((page) => page + 1)}>
                  Ver mÃ¡s reseÃ±as
                </button>
              )}
            </section>
          </div>

          <aside className="salon-profile-side">
            <section className="profile-side-card">
              <h2>UbicaciÃ³n</h2>
              <div className="profile-map" aria-label={`Mapa de ${salon.name}`}>
                <button className="market-map-pin" style={getMapPinStyle(salon)} type="button" aria-label={salon.address}>
                  <MapPin size={16} />
                  <span>{salon.desde} â‚¬</span>
                </button>
              </div>
              <p>{salon.address}</p>
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
                <a href={canonicalUrl}><LinkIcon size={15} /> URL canÃ³nica</a>
                <a href={`https://www.instagram.com/allop.es`}><ExternalLink size={15} /> Instagram</a>
              </div>
            </section>

            <section className="profile-side-card">
              <h2>CategorÃ­as</h2>
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



