import { CalendarDays, ExternalLink, Phone, X } from 'lucide-react';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './index.css';
import Nav from './components/Nav';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import { SALONS, type Salon } from './data/salons';
import { setSeo } from './lib/seo';
import { CITIES, SERVICES } from './lib/taxonomy';
import { trackEvent, trackPageView } from './lib/analytics';
import { useFocusTrap } from './hooks/useFocusTrap';
import { useI18n } from './lib/useI18n';
import { formatPrice } from './lib/salonDetails';
import { region } from './lib/region';

import { tr } from './lib/tr';
const Home = lazy(() => import('./pages/Home'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const SalonsDirectory = lazy(() => import('./pages/SalonsDirectory'));
const Business = lazy(() => import('./pages/Business'));
const ClientAuth = lazy(() => import('./pages/ClientAuth'));
const SalonProfile = lazy(() => import('./pages/SalonProfile'));
const BookingFlow = lazy(() => import('./pages/BookingFlow'));
const Account = lazy(() => import('./pages/Account'));
const SeoLanding = lazy(() => import('./pages/SeoLanding'));
const Trust = lazy(() => import('./pages/Trust'));
const Help = lazy(() => import('./pages/Help'));
const Contact = lazy(() => import('./pages/Contact'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const Guides = lazy(() => import('./pages/Guides'));
const Press = lazy(() => import('./pages/Press'));
const BusinessSignup = lazy(() => import('./pages/BusinessSignup'));
const AltaPrueba = lazy(() => import('./pages/AltaPrueba'));
const LandingNorge = lazy(() => import('./pages/LandingNorge'));
const BusinessVerify = lazy(() => import('./pages/BusinessVerify'));
const BusinessBillingResult = lazy(() => import('./pages/BusinessBillingResult'));
const AppleCallback = lazy(() => import('./pages/AppleCallback'));
const GoogleCallback = lazy(() => import('./pages/GoogleCallback'));
const CompleteProfile = lazy(() => import('./pages/CompleteProfile'));
const SystemStatus = lazy(() => import('./pages/SystemStatus'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Panel del país (dashboard.allop.es, dashboard.allop.no…): la región ya está cargada al importar App.
const DASHBOARD_URL = `https://dashboard.${region().dominio}`;
const BUSINESS_URL = '/business';
const SUPPORT_EMAIL = 'soporte@allop.es';

/** Alta con prueba sin tarjeta (Noruega). ?pagar=1 (enlaces antiguos) manda a pagar desde el panel. */
function AltaPruebaRoute() {
  const params = new URLSearchParams(useLocation().search);
  return <AltaPrueba pagar={params.get('pagar') === '1'} />;
}

function HashScroller() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);

    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    window.setTimeout(() => {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }, [location.pathname, location.hash]);

  return null;
}

function RouteSeo() {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;
    const pathParts = pathname.split('/').filter(Boolean);
    const isServiceCityLanding = pathParts.length === 2 &&
      SERVICES.some((service) => service.slug === pathParts[0]) &&
      CITIES.some((city) => city.slug === pathParts[1]);
    const skipHandledByPage = pathname === '/' ||
      pathname === '/buscar' ||
      pathname === '/salones' ||
      pathname.startsWith('/salones/') ||
      pathname.startsWith('/ciudad/') ||
      pathname.startsWith('/servicios/') ||
      pathname.startsWith('/categoria/') ||
      pathname.startsWith('/guias') ||
      pathname === '/blog' ||
      pathname === '/prensa' ||
      pathname.startsWith('/business/alta') ||
      isServiceCityLanding;

    if (skipHandledByPage) return;

    const bookingSlug = pathname.startsWith('/reservar/') ? pathname.split('/')[2] : '';
    const bookingSalon = SALONS.find((salon) => salon.slug === bookingSlug);
    const legalTitles: Record<string, string> = {
      '/privacidad': 'Política de privacidad',
      '/terminos': 'Términos y condiciones',
      '/cookies': 'Política de cookies',
      '/aviso-legal': 'Aviso legal',
      '/rgpd': 'Información RGPD',
      '/dpa': 'DPA para salones',
      '/eliminar-cuenta': 'Eliminar tu cuenta y tus datos',
    };
    const routeSeo: Record<string, { title: string; description: string }> = {
      '/login': {
        title: tr('Entrar en Allop'),
        description: 'Accede a Allop para gestionar tus reservas, favoritos y perfil de cliente.',
      },
      '/register': {
        title: tr('Crear cuenta en Allop'),
        description: 'Crea una cuenta de cliente en Allop para reservar salones y guardar tu historial.',
      },
      '/mi-cuenta': {
        title: tr('Mi cuenta Allop'),
        description: 'Consulta reservas, favoritos, perfil, puntos y preferencias de notificación en Allop.',
      },
      '/business': {
        title: tr('Allop Business para salones'),
        description: 'Software y marketplace para que salones gestionen agenda, caja, clientes, equipo y reservas online.',
      },
      '/confianza': {
        title: tr('Confianza y reservas verificadas | Allop'),
        description: 'Como Allop verifica reservas, salones, reseñas y privacidad antes de reservar.',
      },
      '/ayuda': {
        title: tr('Centro de ayuda | Allop'),
        description: 'Preguntas frecuentes para clientes y salones sobre reservas, soporte, fichas y uso de Allop.',
      },
      '/contacto': {
        title: tr('Contacto | Allop'),
        description: 'Contacta con Allop para soporte de reservas, salones, privacidad, prensa o empleo.',
      },
    };

    const content = bookingSalon
      ? {
        title: `${tr('Reservar en {salon}', { salon: bookingSalon.name })} | Allop`,
        description: `Reserva ${bookingSalon.category.toLowerCase()} en ${bookingSalon.location} con ${bookingSalon.name}.`,
      }
      : routeSeo[pathname] || (legalTitles[pathname] ? {
        title: `${legalTitles[pathname]} | Allop`,
        description: `${legalTitles[pathname]} de Allop y Origar SL.`,
      } : {
        title: tr('Allop'),
        description: 'Marketplace de salones con reserva online, soporte y gestión para negocios.',
      });

    setSeo({
      title: content.title,
      description: content.description,
      canonicalPath: pathname,
    });
  }, [location.pathname]);

  return null;
}

function RouteFallback() {
  const { t } = useI18n();

  return (
    <div className="route-fallback" role="status" aria-live="polite">
      {t('common.loading')}
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const salonModalRef = useRef<HTMLElement>(null);
  const { t } = useI18n();

  const closeSalonPreview = useCallback(() => setSelectedSalon(null), []);
  useFocusTrap(salonModalRef, Boolean(selectedSalon), closeSalonPreview);

  const handleSearch = (query: string, city = '') => {
    const nextQuery = query.trim();
    const nextCity = city.trim();
    const params = new URLSearchParams();

    if (nextQuery) params.set('q', nextQuery);
    if (nextCity) params.set('ciudad', nextCity);

    setSearchTerm(nextQuery);
    trackEvent('search', { query: nextQuery || 'empty', city: nextCity || null, source: 'nav_or_home' });
    navigate(`/buscar${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const openBusiness = () => {
    navigate(BUSINESS_URL);
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  };

  const openClientLogin = () => {
    navigate('/login');
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  };

  const openClientRegister = () => {
    navigate('/register');
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  };

  const openSalonProfile = (salon: Salon) => {
    setSelectedSalon(null);
    trackEvent('salon_click', { salonSlug: salon.slug, source: 'modal' });
    navigate(`/salones/${salon.slug}`);
  };

  const openSalonPreview = (salon: Salon) => {
    trackEvent('salon_click', { salonSlug: salon.slug, source: 'marketplace' });
    setSelectedSalon(salon);
  };

  return (
    <div>
      <HashScroller />
      <RouteSeo />
      <a className="skip-link" href="#main-content">{t('skip.main')}</a>
      <Nav
        onSearch={handleSearch}
        onLogin={openClientLogin}
        onRegister={openClientRegister}
        onBusiness={openBusiness}
        dashboardUrl={DASHBOARD_URL}
      />
      <main id="main-content" tabIndex={-1}>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route
              path="/"
              element={region().prueba_gratis_dias ? <LandingNorge /> : (
                <Home
                  searchTerm={searchTerm}
                  onSearchTermChange={setSearchTerm}
                  onSearch={handleSearch}
                  onOpenSalon={openSalonPreview}
                  onSalonSignup={openBusiness}
                />
              )}
            />
            <Route path="/buscar" element={<SearchResults />} />
            <Route path="/salones" element={<SalonsDirectory />} />
            <Route path="/login" element={<ClientAuth key="login" mode="login" />} />
            <Route path="/register" element={<ClientAuth key="register" mode="register" />} />
            <Route path="/auth/apple/resultado" element={<AppleCallback />} />
            <Route path="/auth/google/resultado" element={<GoogleCallback />} />
            <Route path="/completar-perfil" element={<CompleteProfile />} />
            <Route path="/salones/:slug" element={<SalonProfile />} />
            <Route path="/reservar/:salonSlug" element={<BookingFlow />} />
            <Route path="/mi-cuenta" element={<Account />} />
            <Route path="/mi-cuenta/:section" element={<Account />} />
            <Route path="/ciudad/:slug" element={<SeoLanding type="city" />} />
            <Route path="/servicios/:slug" element={<SeoLanding type="service" />} />
            <Route path="/categoria/:slug" element={<SeoLanding type="category" />} />
            <Route path="/:serviceSlug/:citySlug" element={<SeoLanding type="serviceCity" />} />
            <Route path="/confianza" element={<Trust />} />
            <Route path="/ayuda" element={<Help />} />
            <Route path="/contacto" element={<Contact supportEmail={SUPPORT_EMAIL} />} />
            <Route path="/guias" element={<Guides />} />
            <Route path="/blog" element={<Guides />} />
            <Route path="/guias/:audience/:slug" element={<Guides />} />
            <Route path="/prensa" element={<Press supportEmail={SUPPORT_EMAIL} />} />
            <Route path="/business" element={region().prueba_gratis_dias ? <LandingNorge /> : <Business supportEmail={SUPPORT_EMAIL} dashboardUrl={DASHBOARD_URL} />} />
            <Route path="/business/alta" element={region().prueba_gratis_dias ? <AltaPruebaRoute /> : <BusinessSignup />} />
            <Route path="/business/verificar" element={<BusinessVerify dashboardUrl={DASHBOARD_URL} />} />
            <Route path="/business/alta/success" element={<BusinessBillingResult mode="success" />} />
            <Route path="/business/alta/cancel" element={<BusinessBillingResult mode="cancel" />} />
            <Route path="/estado" element={<SystemStatus />} />
            <Route path="/bussiness" element={<Navigate to="/business" replace />} />
            <Route path="/buissiness" element={<Navigate to="/business" replace />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="/:slug" element={<LegalPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer dashboardUrl={DASHBOARD_URL} signupUrl={BUSINESS_URL} supportEmail={SUPPORT_EMAIL} />
      <CookieBanner />

      {selectedSalon && (
        <div className="modal-backdrop" role="presentation" onClick={closeSalonPreview}>
          <section
            ref={salonModalRef}
            className="salon-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="salon-modal-title"
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
          >
            <button className="modal-close" type="button" aria-label={tr('Cerrar ficha')} onClick={closeSalonPreview}>
              <X size={18} />
            </button>
            <div className={`salon-modal-media ${selectedSalon.photos?.[0] ? '' : selectedSalon.imageClass}`}>
              {selectedSalon.photos?.[0] && <img src={selectedSalon.photos[0]} alt="" />}
            </div>
            <div className="salon-modal-body">
              <p className="eyebrow">{[selectedSalon.category, selectedSalon.location].filter(Boolean).join(' · ')}</p>
              <h2 id="salon-modal-title">{selectedSalon.name}</h2>
              <p>{selectedSalon.description}</p>
              <div className="modal-facts">
                {selectedSalon.desde > 0 && <span>{tr('Desde')}{' '}{formatPrice(selectedSalon.desde)}</span>}
                <span>{selectedSalon.reviews > 0 ? `★ ${selectedSalon.rating.toFixed(1)} · ${tr('{n} reseñas', { n: selectedSalon.reviews })}` : tr('Nuevo en Allop')}</span>
              </div>
              <div className="modal-actions">
                <button className="btn btn-primary" type="button" onClick={() => openSalonProfile(selectedSalon)}>
                  <CalendarDays size={16} />
                  {tr('Reservar')}
                </button>
                {selectedSalon.phone && (
                  <a className="btn btn-ghost" href={`tel:${selectedSalon.phone.replace(/\s/g, '')}`}>
                    <Phone size={16} />
                    {tr('Llamar')}
                  </a>
                )}
                <button className="btn btn-ghost" type="button" onClick={() => openSalonProfile(selectedSalon)}>
                  <ExternalLink size={16} />
                  {tr('Ver perfil')}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
