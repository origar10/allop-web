import { Search } from 'lucide-react';

export default function Nav() {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <a href="/" className="nav-logo">
          <img src="/allop-icon.svg" alt="allop" />
          allop
        </a>
        <div className="nav-links">
          <a href="#">Buscar salón</a>
          <a href="#">Cómo funciona</a>
          <a href="#">Para salones</a>
        </div>
        <div className="nav-search">
          <span className="nav-search-icon"><Search size={14} /></span>
          <input placeholder="Buscar servicio o salón..." />
        </div>
        <div className="nav-actions">
          <button className="btn btn-ghost">Inicia sesión</button>
          <button className="btn btn-primary">Registro</button>
        </div>
      </div>
    </nav>
  );
}
