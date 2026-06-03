import { Search } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';

interface NavProps {
  onSearch: (query: string) => void;
  onLogin: () => void;
  onRegister: () => void;
}

export default function Nav({ onSearch, onLogin, onRegister }: NavProps) {
  const [query, setQuery] = useState('');

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(query.trim());
  };

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          <img src="/allop-icon.svg" alt="allop" />
          allop
        </Link>
        <div className="nav-links">
          <a href="/#buscar">Buscar salón</a>
          <a href="/#como-funciona">Cómo funciona</a>
          <Link to="/buissiness">Para salones</Link>
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
        <div className="nav-actions">
          <button className="btn btn-ghost" type="button" onClick={onLogin}>Inicia sesión</button>
          <button className="btn btn-primary" type="button" onClick={onRegister}>Registro</button>
        </div>
      </div>
    </nav>
  );
}
