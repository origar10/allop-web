import { ChevronDown, LogOut, Menu, Moon, Search, Sun, UserRound, X } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clearClientSession, useClientSession } from '../lib/clientSession';
import { useI18n } from '../lib/useI18n';
import { useTheme } from '../lib/useTheme';
import { useToast } from '../lib/useToast';

interface NavProps {
  onSearch: (query: string) => void;
  onLogin: () => void;
  onRegister: () => void;
  onBusiness: () => void;
  dashboardUrl: string;
}

function isBusinessPath(pathname: string) {
  return pathname === '/bussiness' || pathname === '/buissiness' || pathname === '/business';
}

function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { t } = useI18n();
  const isDark = resolvedTheme === 'dark';

  return (
    <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={t('theme.toggle')} title={isDark ? t('theme.light') : t('theme.dark')}>
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

export default function Nav({ onSearch, onLogin, onRegister, onBusiness, dashboardUrl }: NavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isBusiness = isBusinessPath(location.pathname);
  const [query, setQuery] = useState('');
  const session = useClientSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    const timer = window.setTimeout(() => setMenuOpen(false), 0);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);
  const { notify } = useToast();

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(query.trim());
  };

  const logout = () => {
    clearClientSession(session?.salonSlug);
    clearClientSession();
    notify('Sesión cerrada.', 'success');
    if (location.pathname.startsWith('/mi-cuenta')) {
      navigate('/');
    }
  };

  if (isBusiness) {
    return (
      <nav className="nav nav-business">
        <div className="nav-inner">
          <Link to="/business" className="nav-logo nav-logo-business">
            <img src="/allop-icon.svg" alt="allop business" width="28" height="28" decoding="async" />
            <span>allop business</span>
          </Link>
          <div className="nav-actions">
            <ThemeToggle />
            <a className="btn btn-primary" href={dashboardUrl}>{t('nav.business.dashboard')}</a>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          <img src="/allop-icon.svg" alt="allop" width="28" height="28" decoding="async" />
          allop
        </Link>
        <div className="nav-links">
          <a href="/#buscar">{t('nav.marketplace.searchSalon')}</a>
          <a href="/#como-funciona">{t('nav.marketplace.howItWorks')}</a>
          <button type="button" onClick={onBusiness}>{t('nav.marketplace.forSalons')}</button>
        </div>
        <form className="nav-search" onSubmit={submitSearch}>
          <span className="nav-search-icon"><Search size={14} /></span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('nav.search.placeholder')}
            aria-label={t('nav.search.aria')}
          />
        </form>
        <LanguageSelect />
        <ThemeToggle />
        <button
          className="nav-hamburger"
          type="button"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(v => !v)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        {session ? (
          <div className="nav-user">
            <button className="btn btn-ghost" type="button">
              <UserRound size={15} />
              {session.cliente.nombre}
              <ChevronDown size={14} />
            </button>
            <div className="nav-user-menu">
              <Link to="/mi-cuenta">{t('nav.user.profile')}</Link>
              <Link to="/mi-cuenta/reservas">{t('nav.user.bookings')}</Link>
              <Link to="/mi-cuenta/favoritos">{t('nav.user.favorites')}</Link>
              <Link to="/mi-cuenta/puntos">{t('nav.user.points')}</Link>
              <Link to="/mi-cuenta/perfil">{t('nav.user.notifications')}</Link>
              <button type="button" onClick={logout}><LogOut size={14} /> {t('nav.user.logout')}</button>
            </div>
          </div>
        ) : (
          <div className="nav-actions">
            <button className="btn btn-ghost" type="button" onClick={onLogin}>{t('nav.auth.login')}</button>
            <button className="btn btn-primary" type="button" onClick={onRegister}>{t('nav.auth.register')}</button>
          </div>
        )}
      </div>
      {menuOpen && (
        <nav className="nav-mobile-drawer" aria-label="Menú principal">
          <a href="/#buscar" onClick={() => setMenuOpen(false)}>{t('nav.marketplace.searchSalon')}</a>
          <a href="/#como-funciona" onClick={() => setMenuOpen(false)}>{t('nav.marketplace.howItWorks')}</a>
          <button type="button" onClick={() => { setMenuOpen(false); onBusiness(); }}>
            {t('nav.marketplace.forSalons')}
          </button>
        </nav>
      )}
    </nav>
  );
}
