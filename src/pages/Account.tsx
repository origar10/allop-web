import {
  Bell,
  CalendarDays,
  CheckCircle,
  Headphones,
  Heart,
  Inbox,
  LogOut,
  Mail,
  MessageSquare,
  Phone,
  ShieldCheck,
  Star,
  Trash2,
  UserRound,
} from 'lucide-react';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SALONS } from '../data/salons';
import {
  bookingFromApi,
  cancelStoredBooking,
  deleteAccountData,
  exportAccountData,
  fallbackBookings,
  loadCommsHistory,
  loadFavoriteSlugs,
  loadNotificationPreferences,
  loadProfileDraft,
  loadReviews,
  loadStoredBookings,
  saveFavoriteSlugs,
  saveNotificationPreferences,
  saveProfileDraft,
  saveReview,
  type AccountBooking,
  type AccountProfileDraft,
  type CommsHistoryEntry,
  type NotificationPreferences,
} from '../lib/accountStore';
import { getEventLabel } from '../lib/notificationTemplates';
import { clearClientSession, loadClientSession } from '../lib/clientSession';
import { getClientBookings } from '../lib/platformApi';
import { useToast } from '../lib/useToast';
import { statusFromItems, type AsyncStatus } from '../shared/asyncState';
import { formatDateTime } from '../shared/formatters';

type AccountView = 'dashboard' | 'reservas' | 'favoritos' | 'perfil' | 'puntos' | 'comunicaciones';

const ACCOUNT_NAV: { view: AccountView; label: string }[] = [
  { view: 'dashboard', label: 'Resumen' },
  { view: 'reservas', label: 'Reservas' },
  { view: 'favoritos', label: 'Favoritos' },
  { view: 'perfil', label: 'Perfil' },
  { view: 'puntos', label: 'Puntos' },
  { view: 'comunicaciones', label: 'Comunicaciones' },
];

function getView(pathname: string): AccountView {
  if (pathname.includes('/reservas')) return 'reservas';
  if (pathname.includes('/favoritos')) return 'favoritos';
  if (pathname.includes('/perfil')) return 'perfil';
  if (pathname.includes('/puntos')) return 'puntos';
  if (pathname.includes('/comunicaciones')) return 'comunicaciones';
  return 'dashboard';
}

function viewPath(view: AccountView) {
  if (view === 'dashboard') return '/mi-cuenta';
  return `/mi-cuenta/${view}`;
}

export default function Account() {
  const navigate = useNavigate();
  const location = useLocation();
  const [session] = useState(() => loadClientSession());
  const view = getView(location.pathname);
  const [bookings, setBookings] = useState<AccountBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(Boolean(session));
  const [bookingError, setBookingError] = useState('');
  const [favoriteSlugs, setFavoriteSlugs] = useState(() => loadFavoriteSlugs());
  const [profile, setProfile] = useState<AccountProfileDraft | null>(() => session ? loadProfileDraft(session.cliente) : null);
  const [prefs, setPrefs] = useState<NotificationPreferences>(() => loadNotificationPreferences());
  const [profileMessage, setProfileMessage] = useState('');
  const [privacyMessage, setPrivacyMessage] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [reviewBookingId, setReviewBookingId] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [commsHistory, setCommsHistory] = useState<CommsHistoryEntry[]>(() => loadCommsHistory());
  const reviews = loadReviews();
  const { notify } = useToast();

  // Reload comms history whenever the user navigates to the communicaciones tab
  useEffect(() => {
    if (view !== 'comunicaciones') return undefined;

    const timer = window.setTimeout(() => setCommsHistory(loadCommsHistory()), 0);
    return () => window.clearTimeout(timer);
  }, [view]);

  useEffect(() => {
    if (!session) return;

    let mounted = true;
    const controller = new AbortController();
    const stored = loadStoredBookings();

    getClientBookings(session.salonSlug, session.token, controller.signal)
      .then((items) => {
        if (!mounted) return;
        const apiBookings = items.map((item) => bookingFromApi(item, session.salonSlug, session.salonName));
        const next = [...stored, ...apiBookings];
        setBookings(next.length ? next : fallbackBookings());
      })
      .catch((error) => {
        if (!mounted || controller.signal.aborted) return;
        setBookingError(error instanceof Error ? error.message : 'No se pudo cargar el historial remoto.');
        setBookings(stored.length ? stored : fallbackBookings());
      })
      .finally(() => {
        if (mounted) setLoadingBookings(false);
      });

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [session]);

  const favoriteSalons = useMemo(() => {
    const favorites = SALONS.filter((salon) => favoriteSlugs.includes(salon.slug));
    return favorites.length ? favorites : SALONS.filter((salon) => salon.featured).slice(0, 3);
  }, [favoriteSlugs]);

  const upcomingBookings = bookings.filter((booking) => booking.status === 'confirmada' || booking.status === 'pendiente');
  const completedBookings = bookings.filter((booking) => booking.status === 'completada');
  const points = session?.cliente.puntosFidelizacion ?? Math.max(120, completedBookings.length * 75);
  const bookingStatus = statusFromItems(bookings, loadingBookings, bookingError);

  if (!session || !profile) {
    return (
      <section className="account-page">
        <div className="container account-empty">
          <UserRound size={34} />
          <h1>Accede a tu cuenta</h1>
          <p>Necesitas iniciar sesión para ver reservas, favoritos, puntos y preferencias.</p>
          <Link className="btn btn-primary btn-lg" to={`/login?next=${encodeURIComponent(location.pathname)}`}>Entrar</Link>
        </div>
      </section>
    );
  }

  const cancelBooking = (id: string) => {
    const next = cancelStoredBooking(id);
    setBookings(next.length ? next : bookings.map((booking) => (
      booking.id === id ? { ...booking, status: 'cancelada' as const } : booking
    )));
    notify('Reserva cancelada.', 'success');
  };

  const submitProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveProfileDraft(profile);
    setProfileMessage('Perfil guardado.');
    notify('Perfil guardado.', 'success');
    window.setTimeout(() => setProfileMessage(''), 1800);
  };

  const updatePrefs = (next: NotificationPreferences) => {
    setPrefs(next);
    saveNotificationPreferences(next);
  };

  const submitReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reviewBookingId || reviewText.trim().length < 4) return;

    saveReview({
      bookingId: reviewBookingId,
      rating: reviewRating,
      text: reviewText.trim(),
      createdAt: new Date().toISOString(),
    });
    setReviewBookingId('');
    setReviewText('');
    setReviewRating(5);
    notify('Reseña guardada.', 'success');
  };

  const logoutEverywhere = () => {
    clearClientSession(session.salonSlug);
    clearClientSession();
    notify('Sesión cerrada.', 'success');
    navigate('/login');
  };

  const exportData = () => {
    const data = exportAccountData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `allop-datos-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setPrivacyMessage('Datos exportados en JSON.');
    notify('Datos exportados.', 'success');
  };

  const deleteData = () => {
    setDeleteConfirm(false);
    deleteAccountData();
    clearClientSession(session.salonSlug);
    clearClientSession();
    notify('Datos locales eliminados.', 'success');
    navigate('/login');
  };

  return (
    <section className="account-page">
      <div className="container account-layout">
        <aside className="account-sidebar">
          <div className="account-user">
            <div className="account-avatar">
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={`Foto de perfil de ${profile.nombre} ${profile.apellidos}`.trim()}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <UserRound size={24} />
              )}
            </div>
            <strong>{profile.nombre} {profile.apellidos}</strong>
            <span>{profile.telefono}</span>
          </div>
          <nav className="account-nav" aria-label="Área de cliente">
            {ACCOUNT_NAV.map((item) => (
              <Link key={item.view} className={view === item.view ? 'active' : ''} to={viewPath(item.view)}>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="account-main">
          <div className="account-heading">
            <p className="eyebrow">Allop clientes</p>
            <h1>Mi cuenta</h1>
            <p>Gestiona reservas, favoritos, perfil y notificaciones desde un único sitio.</p>
          </div>

          {view === 'dashboard' && (
            <>
              <div className="account-metrics">
                <article><CalendarDays size={20} /><strong>{upcomingBookings.length}</strong><span>Próximas reservas</span></article>
                <article><Heart size={20} /><strong>{favoriteSalons.length}</strong><span>Favoritos</span></article>
                <article><Star size={20} /><strong>{points}</strong><span>Puntos</span></article>
              </div>
              <section className="account-card">
                <div className="section-header">
                  <h2 className="section-title">Próximas reservas</h2>
                  <Link className="see-all" to="/mi-cuenta/reservas">Ver historial</Link>
                </div>
                <BookingList bookings={upcomingBookings.slice(0, 3)} loading={loadingBookings} onCancel={cancelBooking} />
              </section>
              <section className="account-card">
                <div className="section-header">
                  <h2 className="section-title">Favoritos</h2>
                  <Link className="see-all" to="/mi-cuenta/favoritos">Ver todos</Link>
                </div>
                <FavoriteGrid slugs={favoriteSlugs} onChange={setFavoriteSlugs} />
              </section>
            </>
          )}

          {view === 'reservas' && (
            <section className="account-card">
              <div className="section-header">
                <div>
                  <h2 className="section-title">Reservas</h2>
                  <p className="section-subtitle">Historial completo con estado y acciones disponibles</p>
                </div>
              </div>
              {bookingError && <p className="market-alert" role="status" aria-live="polite">Mostrando reservas locales: {bookingError}</p>}
              <BookingList bookings={bookings} loading={loadingBookings} status={bookingStatus} onCancel={cancelBooking} />
              <form className="review-form" onSubmit={submitReview}>
                <h3><MessageSquare size={18} /> Añadir reseña</h3>
                <select value={reviewBookingId} onChange={(event) => setReviewBookingId(event.target.value)}>
                  <option value="">Selecciona una visita completada</option>
                  {bookings.filter((booking) => booking.canReview && !reviews.some((review) => review.bookingId === booking.id)).map((booking) => (
                    <option key={booking.id} value={booking.id}>{booking.salonName} · {booking.serviceName}</option>
                  ))}
                </select>
                <select value={reviewRating} onChange={(event) => setReviewRating(Number(event.target.value))}>
                  <option value={5}>5 estrellas</option>
                  <option value={4}>4 estrellas</option>
                  <option value={3}>3 estrellas</option>
                </select>
                <textarea value={reviewText} onChange={(event) => setReviewText(event.target.value)} rows={3} placeholder="Cuenta brevemente cómo fue la visita" />
                <button className="btn btn-primary" type="submit">Guardar reseña</button>
              </form>
            </section>
          )}

          {view === 'favoritos' && (
            <section className="account-card">
              <div className="section-header">
                <div>
                  <h2 className="section-title">Salones favoritos</h2>
                  <p className="section-subtitle">Acceso rápido a los salones que has guardado</p>
                </div>
              </div>
              <FavoriteGrid slugs={favoriteSlugs} onChange={setFavoriteSlugs} />
            </section>
          )}

          {view === 'perfil' && (
            <>
              <form className="account-card account-form" onSubmit={submitProfile}>
                <h2 className="section-title">Perfil editable</h2>
                <div className="auth-two-cols">
                  <label>Nombre<input value={profile.nombre} onChange={(event) => setProfile({ ...profile, nombre: event.target.value })} /></label>
                  <label>Apellidos<input value={profile.apellidos} onChange={(event) => setProfile({ ...profile, apellidos: event.target.value })} /></label>
                </div>
                <div className="auth-two-cols">
                  <label>Email<input value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} type="email" /></label>
                  <label>Teléfono<input value={profile.telefono} onChange={(event) => setProfile({ ...profile, telefono: event.target.value })} type="tel" /></label>
                </div>
                <label>Foto de perfil<input value={profile.photoUrl} onChange={(event) => setProfile({ ...profile, photoUrl: event.target.value })} placeholder="URL de imagen" /></label>
                {profileMessage && <p className="auth-message ok" role="status" aria-live="polite">{profileMessage}</p>}
                <button className="btn btn-primary btn-lg" type="submit">Guardar perfil</button>
              </form>

              <section className="account-card">
                <h2 className="section-title"><Bell size={20} /> Preferencias de notificación</h2>
                <p className="section-subtitle">Elige cómo y cuándo quieres recibir mensajes de Allop. Los mensajes transaccionales solo se envían si tienes al menos un canal activo.</p>

                <div className="prefs-group">
                  <h3 className="prefs-group-title">Canales</h3>
                  <div className="toggle-list">
                    <label>
                      <input type="checkbox" checked={prefs.sms} onChange={(e) => updatePrefs({ ...prefs, sms: e.target.checked })} />
                      <Phone size={14} /> SMS
                    </label>
                    <label>
                      <input type="checkbox" checked={prefs.email} onChange={(e) => updatePrefs({ ...prefs, email: e.target.checked })} />
                      <Mail size={14} /> Email
                    </label>
                    <label>
                      <input type="checkbox" checked={prefs.whatsapp} onChange={(e) => updatePrefs({ ...prefs, whatsapp: e.target.checked })} />
                      <MessageSquare size={14} /> WhatsApp
                    </label>
                  </div>
                </div>

                <div className="prefs-group">
                  <h3 className="prefs-group-title">Notificaciones transaccionales</h3>
                  <p className="prefs-group-desc">Mensajes relacionados con tus reservas. No tienen finalidad comercial.</p>
                  <div className="toggle-list">
                    <label>
                      <input type="checkbox" checked={prefs.confirmaciones} onChange={(e) => updatePrefs({ ...prefs, confirmaciones: e.target.checked })} />
                      Confirmación de reserva
                    </label>
                    <label>
                      <input type="checkbox" checked={prefs.recordatorios} onChange={(e) => updatePrefs({ ...prefs, recordatorios: e.target.checked })} />
                      Recordatorio 24h y 2h antes
                    </label>
                    <label>
                      <input type="checkbox" checked={prefs.cancelaciones} onChange={(e) => updatePrefs({ ...prefs, cancelaciones: e.target.checked })} />
                      Aviso de cancelación o reprogramación
                    </label>
                  </div>
                </div>

                <div className="prefs-group">
                  <h3 className="prefs-group-title">Novedades y ofertas</h3>
                  <p className="prefs-group-desc">Mensajes opcionales sobre salones, promociones y novedades de Allop.</p>
                  <div className="toggle-list">
                    <label>
                      <input type="checkbox" checked={prefs.novedades} onChange={(e) => updatePrefs({ ...prefs, novedades: e.target.checked })} />
                      Novedades de salones guardados
                    </label>
                    <label>
                      <input type="checkbox" checked={prefs.ofertas} onChange={(e) => updatePrefs({ ...prefs, ofertas: e.target.checked })} />
                      Ofertas y promociones activas
                    </label>
                  </div>
                </div>
              </section>

              <section className="account-card">
                <h2 className="section-title"><ShieldCheck size={20} /> Seguridad</h2>
                <div className="security-list">
                  <span>Sesión activa desde {formatDateTime(session.createdAt)}</span>
                  <span>Salón de origen: {session.salonName}</span>
                </div>
                <button className="btn btn-ghost btn-lg" type="button" onClick={logoutEverywhere}>
                  <LogOut size={16} />
                  Cerrar sesión en todos los dispositivos
                </button>
              </section>

              <section className="account-card">
                <h2 className="section-title"><Trash2 size={20} /> Privacidad y derechos RGPD</h2>
                <p className="section-subtitle">Puedes exportar tus datos locales o eliminar la información guardada en este navegador. Para supresión completa en el servidor, contacta con soporte.</p>
                {privacyMessage && <p className="auth-message ok" role="status" aria-live="polite">{privacyMessage}</p>}
                <div className="privacy-actions">
                  <button className="btn btn-ghost btn-lg" type="button" onClick={exportData}>Exportar mis datos</button>
                  {deleteConfirm ? (
                    <div className="confirm-row">
                      <span>¿Eliminar todos los datos locales guardados?</span>
                      <button className="btn btn-sm danger" type="button" onClick={deleteData}>Sí, eliminar</button>
                      <button className="btn btn-sm btn-ghost" type="button" onClick={() => setDeleteConfirm(false)}>Cancelar</button>
                    </div>
                  ) : (
                    <button className="btn btn-ghost btn-lg danger" type="button" onClick={() => setDeleteConfirm(true)}>
                      <Trash2 size={16} />
                      Eliminar mi cuenta
                    </button>
                  )}
                </div>
                <Link className="see-all" to="/rgpd">Ver información RGPD</Link>
              </section>
            </>
          )}

          {view === 'puntos' && (
            <section className="account-card">
              <h2 className="section-title">Puntos y fidelización</h2>
              <div className="points-hero">
                <strong>{points}</strong>
                <span>{session.cliente.tierFidelizacion || 'Nivel cliente Allop'}</span>
              </div>
              <div className="points-list">
                <article><CheckCircle size={18} /> +75 puntos por visita completada</article>
                <article><Star size={18} /> {session.cliente.cortesGratisDisponibles || 0} recompensas disponibles</article>
                <article><CalendarDays size={18} /> {session.cliente.sesionesFidelizacion || completedBookings.length} visitas registradas</article>
              </div>
            </section>
          )}

          {view === 'comunicaciones' && (
            <section className="account-card">
              <h2 className="section-title"><Inbox size={20} /> Historial de comunicaciones</h2>
              <p className="section-subtitle">Registro de mensajes transaccionales enviados relacionados con tus reservas. Solo útil para soporte.</p>
              {commsHistory.length === 0 ? (
                <div className="account-loading">
                  No hay comunicaciones registradas. Aparecerán aquí tras tu próxima reserva o cancelación.
                </div>
              ) : (
                <div className="comms-history-list">
                  {commsHistory.map((entry) => (
                    <article key={entry.id} className="comms-history-entry">
                      <div className="comms-history-entry-top">
                        <span className={`comms-channel-chip comms-channel-${entry.channel}`}>
                          {entry.channel === 'sms' && <Phone size={11} />}
                          {entry.channel === 'email' && <Mail size={11} />}
                          {entry.channel === 'whatsapp' && <MessageSquare size={11} />}
                          {entry.channel.toUpperCase()}
                        </span>
                        <strong>{getEventLabel(entry.event)}</strong>
                        <time className="comms-history-time" dateTime={entry.sentAt}>
                          {new Date(entry.sentAt).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </time>
                      </div>
                      <p>{entry.salonName} · {entry.serviceName}</p>
                      <small>{entry.bookingDate} {entry.bookingTime}{entry.locator ? ` · ${entry.locator}` : ''}</small>
                    </article>
                  ))}
                </div>
              )}
              <p className="comms-history-note">
                Este historial se almacena localmente en tu dispositivo. Para incidencias con una comunicación, incluye el localizador de reserva al contactar con soporte.
              </p>
            </section>
          )}
        </main>
      </div>
    </section>
  );
}

function BookingList({ bookings, loading, onCancel }: {
  bookings: AccountBooking[];
  loading: boolean;
  status?: AsyncStatus;
  onCancel: (id: string) => void;
}) {
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);
  const [copiedLocator, setCopiedLocator] = useState('');

  const copyLocator = (locator: string) => {
    navigator.clipboard?.writeText(locator).catch(() => undefined);
    setCopiedLocator(locator);
    window.setTimeout(() => setCopiedLocator(''), 1800);
  };

  if (loading) {
    return (
      <div className="account-loading account-loading-skeleton" role="status" aria-live="polite">
        <span className="inline-spinner" aria-hidden="true" />
        Cargando reservas...
      </div>
    );
  }

  if (!bookings.length) {
    return <div className="account-loading">Aún no hay reservas en esta sección.</div>;
  }

  return (
    <div className="account-bookings" data-state={status || statusFromItems(bookings, loading)}>
      {bookings.map((booking) => (
        <article key={booking.id}>
          <div>
            <strong>{booking.serviceName}</strong>
            <span>{booking.salonName} · {formatDateTime(booking.startsAt)}</span>
            <div className="booking-locator-row">
              <code className="booking-locator-code">{booking.locator}</code>
              <button
                type="button"
                className="booking-locator-copy"
                onClick={() => copyLocator(booking.locator)}
                aria-label={`Copiar localizador ${booking.locator}`}
              >
                {copiedLocator === booking.locator ? 'Copiado' : 'Copiar'}
              </button>
              <a
                href={`/contacto?motivo=soporte-reserva&localizador=${booking.locator}`}
                className="booking-locator-support"
                aria-label={`Soporte para reserva ${booking.locator}`}
              >
                <Headphones size={12} /> Soporte
              </a>
            </div>
          </div>
          <div className="booking-row-actions">
            <span className={`status-pill ${booking.status}`}>{booking.status}</span>
            {(booking.status === 'pendiente' || booking.status === 'confirmada') && (
              pendingCancelId === booking.id ? (
                <div className="confirm-row">
                  <span>¿Cancelar?</span>
                  <button type="button" className="btn btn-sm danger" onClick={() => { onCancel(booking.id); setPendingCancelId(null); }}>Sí</button>
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => setPendingCancelId(null)}>No</button>
                </div>
              ) : (
                <button type="button" onClick={() => setPendingCancelId(booking.id)}>
                  <Trash2 size={14} />
                  Cancelar
                </button>
              )
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function FavoriteGrid({ slugs, onChange }: { slugs: string[]; onChange: (slugs: string[]) => void }) {
  const salons = SALONS.filter((salon) => slugs.includes(salon.slug));
  const visibleSalons = salons.length ? salons : SALONS.filter((salon) => salon.featured).slice(0, 3);

  const removeFavorite = (slug: string) => {
    const next = slugs.filter((item) => item !== slug);
    saveFavoriteSlugs(next);
    onChange(next);
  };

  return (
    <div className="account-favorites">
      {visibleSalons.map((salon) => (
        <article key={salon.slug}>
          <div className={`account-favorite-media ${salon.imageClass}`} />
          <div>
            <h3>{salon.name}</h3>
            <p>{salon.location} · {salon.rating.toFixed(1)} · desde {salon.desde} €</p>
            <div>
              <Link className="btn btn-primary" to={`/salones/${salon.slug}`}>Ver ficha</Link>
              {slugs.includes(salon.slug) && <button className="btn btn-ghost" type="button" onClick={() => removeFavorite(salon.slug)}>Quitar</button>}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
