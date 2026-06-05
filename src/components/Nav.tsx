import { ChevronDown, LogOut, Search, UserRound } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clearClientSession, loadClientSession } from '../lib/clientSession';

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

export default function Nav({ onSearch, onLogin, onRegister, onBusiness, dashboardUrl }: NavProps) {
  const location = useLocation();
  const isBusiness = isBusinessPath(location.pathname);
  const [query, setQuery] = useState('');
  const [session, setSession] = useState(() => loadClientSession());

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(query.trim());
  };

  const logout = () => {
    clearClientSession(session?.salonSlug);
    clearClientSession();
    setSession(null);
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
            <a className="btn btn-primary" href={dashboardUrl}>Acceder al panel</a>
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
          <a href="/#buscar">Buscar salón</a>
          <a href="/#como-funciona">Cómo funciona</a>
          <button type="button" onClick={onBusiness}>Para salones</button>
        </div>
        <form className="nav-search" onSubmit={submitSearch}>
          <span className="nav-search-icon"><Search size={14} /></span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar servicio o salón..."
            aria-label="Buscar servicio o salón"
          />
        </form>
        {session ? (
          <div className="nav-user">
            <button className="btn btn-ghost" type="button">
              <UserRound size={15} />
              {session.cliente.nombre}
              <ChevronDown size={14} />
            </button>
            <div className="nav-user-menu">
              <Link to="/mi-cuenta">Mi perfil</Link>
              <Link to="/mi-cuenta/reservas">Mis reservas</Link>
              <Link to="/mi-cuenta/favoritos">Salones favoritos</Link>
              <Link to="/mi-cuenta/puntos">Puntos y fidelización</Link>
              <Link to="/mi-cuenta/perfil">Notificaciones</Link>
              <button type="button" onClick={logout}><LogOut size={14} /> Cerrar sesión</button>
            </div>
          </div>
        ) : (
          <div className="nav-actions">
            <button className="btn btn-ghost" type="button" onClick={onLogin}>Entrar</button>
            <button className="btn btn-primary" type="button" onClick={onRegister}>Registro</button>
          </div>
        )}
      </div>
    </nav>
  );
}
