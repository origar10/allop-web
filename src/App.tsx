import { CalendarDays, ExternalLink, Phone, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './index.css';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Home from './pages/Home';
import Business from './pages/Business';
import ClientAuth from './pages/ClientAuth';
import type { Salon } from './data/salons';

const DASHBOARD_URL = 'https://dashboard.allop.es';
const BUSINESS_URL = '/business';
const SUPPORT_EMAIL = 'soporte@allop.es';

function goTo(url: string) {
  window.location.href = url;
}

function HashScroller() {
  const location = useLocation();

  useEffect(() => {
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

export default function App() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    navigate('/');
    window.setTimeout(() => {
      document.getElementById('buscar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
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
    goTo(`https://allop.es/salones/${salon.slug}`);
  };

  return (
    <div>
      <HashScroller />
      <Nav
        onSearch={handleSearch}
        onLogin={openClientLogin}
        onRegister={openClientRegister}
        onBusiness={openBusiness}
        dashboardUrl={DASHBOARD_URL}
      />
      <main>
        <Routes>
          <Route
            path="/"
            element={(
              <Home
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                onSearch={handleSearch}
                onOpenSalon={setSelectedSalon}
                onSalonSignup={openBusiness}
              />
            )}
          />
          <Route path="/login" element={<ClientAuth key="login" mode="login" />} />
          <Route path="/register" element={<ClientAuth key="register" mode="register" />} />
          <Route path="/business" element={<Business supportEmail={SUPPORT_EMAIL} dashboardUrl={DASHBOARD_URL} />} />
          <Route path="/bussiness" element={<Navigate to="/business" replace />} />
          <Route path="/buissiness" element={<Navigate to="/business" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer dashboardUrl={DASHBOARD_URL} signupUrl={BUSINESS_URL} supportEmail={SUPPORT_EMAIL} />

      {selectedSalon && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelectedSalon(null)}>
          <section
            className="salon-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="salon-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="modal-close" type="button" aria-label="Cerrar ficha" onClick={() => setSelectedSalon(null)}>
              <X size={18} />
            </button>
            <div className={`salon-modal-media ${selectedSalon.imageClass}`} />
            <div className="salon-modal-body">
              <p className="eyebrow">{selectedSalon.category} · {selectedSalon.location}</p>
              <h2 id="salon-modal-title">{selectedSalon.name}</h2>
              <p>{selectedSalon.description}</p>
              <div className="modal-facts">
                <span><CalendarDays size={16} /> Próximo hueco: {selectedSalon.nextSlot}</span>
                <span>Desde {selectedSalon.desde} €</span>
                <span>{selectedSalon.rating.toFixed(1)} · {selectedSalon.reviews} reseñas</span>
              </div>
              <div className="modal-actions">
                <button className="btn btn-primary" type="button" onClick={() => openSalonProfile(selectedSalon)}>
                  <CalendarDays size={16} />
                  Reservar
                </button>
                <a className="btn btn-ghost" href={`tel:${selectedSalon.phone}`}>
                  <Phone size={16} />
                  Llamar
                </a>
                <button className="btn btn-ghost" type="button" onClick={() => openSalonProfile(selectedSalon)}>
                  <ExternalLink size={16} />
                  Ver perfil
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
