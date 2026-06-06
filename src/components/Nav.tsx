import { ChevronDown, LogOut, Moon, Search, Sun, UserRound } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clearClientSession, loadClientSession } from '../lib/clientSession';
import { useI18n } from '../lib/useI18n';
import type { Locale } from '../lib/translations';
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

function LanguageSelect() {
  const { locale, setLocale, t } = useI18n();

  return (
    <select
      className="language-select"
      value={locale}
      onChange={(event) => setLocale(event.target.value as Locale)}
      aria-label={t('language.aria')}
    >
      <option value="es">{t('language.es')}</option>
      <option value="ca">{t('language.ca')}</option>
    </select>
  );
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
  const isBusiness = isBusinessPath(location.pathname);
  const [query, setQuery] = useState('');
  const [session, setSession] = useState(() => loadClientSession());
  const { t } = useI18n();
  const { notify } = useToast();

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(query.trim());
  };

  const logout = () => {
    clearClientSession(session?.salonSlug);
    clearClientSession();
    setSession(null);
    notify('Sesión cerrada.', 'success');
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
            <LanguageSelect />
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
    </nav>
  );
}
