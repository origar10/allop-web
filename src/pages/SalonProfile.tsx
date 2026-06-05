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
import { loadClientSession } from '../lib/clientSession';
import { getProfessionals, getServices, TIME_SLOTS, WEEK_DAYS } from '../lib/salonDetails';

const REVIEWS_PAGE_SIZE = 2;

function setMeta(name: string, content: string, property = false) {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let tag = document.querySelector(selector);

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(property ? 'property' : 'name', name);
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', content);
}

function setCanonical(url: string) {
  let tag = document.querySelector('link[rel="canonical"]');

  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', 'canonical');
    document.head.appendChild(tag);
  }

  tag.setAttribute('href', url);
}

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
  const [isFavorite, setIsFavorite] = useState(false);
  const [shareMessage, setShareMessage] = useState('');

  const services = useMemo(() => salon ? getServices(salon) : [], [salon]);
  const professionals = useMemo(() => salon ? getProfessionals(salon) : [], [salon]);
  const salonReviews = useMemo(() => salon ? getSalonReviews(salon) : [], [salon]);
  const visibleReviews = salonReviews.slice(0, reviewsPage * REVIEWS_PAGE_SIZE);
  const session = salon ? loadClientSession(salon.slug) : null;

  useEffect(() => {
    if (!salon) return;

    document.title = `${salon.name} en ${salon.location} | Allop`;
    setMeta('description', `${salon.description} Reserva ${salon.category.toLowerCase()} desde ${salon.desde} € en Allop.`);
    setMeta('og:title', `${salon.name} | Allop`, true);
    setMeta('og:description', salon.description, true);
    setMeta('og:image', `${window.location.origin}/allop-icon.svg`, true);
    setMeta('og:type', 'business.business', true);
    setMeta('og:url', `${window.location.origin}/salones/${salon.slug}`, true);
    setCanonical(`${window.location.origin}/salones/${salon.slug}`);
  }, [salon]);

  if (!salon) {
    return <Navigate to="/" replace />;
  }

  const photos = [salon.imageClass, 'salon-gallery-detail', 'salon-gallery-work'];
  const canonicalUrl = `${window.location.origin}/salones/${salon.slug}`;

  const toggleFavorite = () => {
    if (!session) {
      navigate(`/login?next=/salones/${salon.slug}`);
      return;
    }

    setIsFavorite((value) => !value);
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
    window.setTimeout(() => setShareMessage(''), 1800);
  };

  return (
    <article className="salon-profile">
      <section className="salon-profile-hero">
        <div className="container salon-profile-hero-grid">
          <div className="salon-profile-copy">
            <Link className="breadcrumb-link" to="/">Marketplace</Link>
            <div className="salon-profile-badges">
              {salon.verified && <span><BadgeCheck size={14} /> Verificado</span>}
              {salon.featured && <span>Destacado</span>}
              {salon.badges?.map((badge) => <span key={badge}>{badge}</span>)}
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
                    <strong>{service.price} €</strong>
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
              <div className="profile-reviews">
                {visibleReviews.map((review) => (
                  <article key={review.id}>
                    <div className="review-card-top">
                      <strong>{review.author}</strong>
                      <span><Star size={13} fill="#F59E0B" color="#F59E0B" /> {review.rating.toFixed(1)}</span>
                    </div>
                    <p>{review.text}</p>
                    <small>{review.service} · {review.date}</small>
                  </article>
                ))}
              </div>
              {visibleReviews.length < salonReviews.length && (
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
          </aside>
        </div>
      </section>
    </article>
  );
}
