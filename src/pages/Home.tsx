import { ArrowRight, CalendarDays, CheckCircle, Hand, Heart, MapPin, Search, Scissors, Smile, Sparkles, Star, Wand2 } from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';
import SalonCard from '../components/SalonCard';
import { SALONS, type Salon } from '../data/salons';

const CATEGORIES = [
  { icon: <Scissors size={22} />, label: 'Peluquería' },
  { icon: <Smile size={22} />, label: 'Barbería' },
  { icon: <Sparkles size={22} />, label: 'Estética' },
  { icon: <Hand size={22} />, label: 'Uñas' },
  { icon: <Heart size={22} />, label: 'Masajes' },
  { icon: <Wand2 size={22} />, label: 'Maquillaje' },
];

const CHIPS = ['Corte de pelo', 'Mechas', 'Manicura', 'Masaje', 'Barba', 'Color'];

interface HomeProps {
  searchTerm: string;
  onSearchTermChange: (query: string) => void;
  onSearch: (query: string) => void;
  onOpenSalon: (salon: Salon) => void;
  onSalonSignup: () => void;
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

function matchesQuery(salon: Salon, query: string, city: string) {
  const haystack = normalize([salon.name, salon.category, salon.location, salon.tags.join(' ')].join(' '));
  const normalizedQuery = normalize(query);
  const normalizedCity = normalize(city);

  return (!normalizedQuery || haystack.includes(normalizedQuery)) &&
    (!normalizedCity || normalize(salon.location).includes(normalizedCity));
}

export default function Home({ searchTerm, onSearchTermChange, onSearch, onOpenSalon, onSalonSignup }: HomeProps) {
  const [cityQuery, setCityQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const filteredSalons = useMemo(() => {
    const query = category || searchTerm;
    return SALONS.filter((salon) => matchesQuery(salon, query, cityQuery));
  }, [category, cityQuery, searchTerm]);

  const topSalons = useMemo(
    () => [...SALONS].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews).slice(0, 4),
    [],
  );

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCategory(null);
    onSearch(searchTerm.trim());
  };

  const runQuickSearch = (query: string) => {
    setCategory(null);
    onSearch(query);
  };

  const selectCategory = (label: string) => {
    setCategory(label);
    onSearch(label);
  };

  const clearFilters = () => {
    setCategory(null);
    onSearchTermChange('');
    setCityQuery('');
    onSearch('');
  };

  return (
    <>
      <section className="hero" id="buscar">
        <h1>Encuentra tu salón.<br />Reserva en segundos.</h1>
        <p>Más de 500 salones y profesionales en Barcelona y alrededores.<br />Sin llamadas, sin esperas.</p>

        <form className="search-bar" onSubmit={submitSearch}>
          <div className="search-field">
            <Scissors size={18} />
            <input
              value={searchTerm}
              onChange={(event) => {
                onSearchTermChange(event.target.value);
                setCategory(null);
              }}
              placeholder="¿Qué servicio buscas?"
              aria-label="Servicio"
            />
          </div>
          <div className="search-field search-location">
            <MapPin size={18} />
            <input
              value={cityQuery}
              onChange={(event) => setCityQuery(event.target.value)}
              placeholder="Ciudad o barrio"
              aria-label="Ciudad o barrio"
            />
          </div>
          <button className="search-btn" type="submit">
            <Search size={17} />
            Buscar
          </button>
        </form>

        <div className="search-chips">
          {CHIPS.map((chip) => (
            <button key={chip} className="chip" type="button" onClick={() => runQuickSearch(chip)}>
              {chip}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="container">
          <h2 className="section-title" style={{ marginBottom: 24 }}>¿Qué buscas hoy?</h2>
          <div className="categories-grid">
            {CATEGORIES.map((item) => (
              <button
                key={item.label}
                className={`category-pill ${category === item.label ? 'active' : ''}`}
                type="button"
                onClick={() => selectCategory(item.label)}
                aria-pressed={category === item.label}
              >
                <div className="category-icon">{item.icon}</div>
                <span className="category-label">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Resultados</h2>
              <p className="section-subtitle">{filteredSalons.length} salones disponibles</p>
            </div>
            <button className="see-all" type="button" onClick={clearFilters}>Limpiar filtros</button>
          </div>
          <div className="salons-grid">
            {filteredSalons.map((salon) => (
              <SalonCard key={salon.id} {...salon} onSelect={() => onOpenSalon(salon)} />
            ))}
          </div>
          {filteredSalons.length === 0 && (
            <div className="empty-results">
              <Search size={22} />
              <strong>No hay resultados con esos filtros.</strong>
              <button className="btn btn-primary" type="button" onClick={clearFilters}>Ver todos los salones</button>
            </div>
          )}
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <Star size={20} fill="#F59E0B" color="#F59E0B" /> Más valorados
            </h2>
            <button className="see-all" type="button" onClick={() => runQuickSearch('')}>Ver todos <ArrowRight size={14} /></button>
          </div>
          <div className="salons-grid">
            {topSalons.map((salon) => (
              <SalonCard key={salon.id} {...salon} onSelect={() => onOpenSalon(salon)} />
            ))}
          </div>
        </div>
      </section>

      <section className="how-section" id="como-funciona">
        <div className="container">
          <h2 className="how-title">Reservar es así de fácil</h2>
          <div className="how-steps">
            <div className="how-step">
              <div className="how-icon"><Search size={26} /></div>
              <h3>Busca y filtra</h3>
              <p>Encuentra el salón perfecto por servicio, ubicación, precio o disponibilidad.</p>
            </div>
            <div className="how-step">
              <div className="how-icon"><CalendarDays size={26} /></div>
              <h3>Elige fecha y hora</h3>
              <p>Consulta la agenda en tiempo real y reserva el hueco que mejor te va.</p>
            </div>
            <div className="how-step">
              <div className="how-icon"><Star size={26} /></div>
              <h3>Disfruta y valora</h3>
              <p>Recibe recordatorios automáticos. Después, comparte tu experiencia.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing-section" id="tarifas">
        <div className="container pricing-grid">
          {[
            ['Marketplace', 'Ficha pública, reservas y reseñas verificadas.'],
            ['Dashboard', 'Agenda, caja, clientes e inventario conectado.'],
            ['Equipo', 'Roles, empleados y operaciones para varios profesionales.'],
          ].map(([plan, description]) => (
            <article className="pricing-card" key={plan}>
              <CheckCircle size={20} />
              <h3>{plan}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-section" id="para-salones">
        <div className="container">
          <div className="cta-banner">
            <div className="cta-text">
              <h2>¿Tienes un salón?<br />Únete a Allop.</h2>
              <p>Gestiona tu agenda, cobra, fideliza clientes y aparece en el marketplace, todo desde un panel propio.</p>
            </div>
            <div className="cta-actions">
              <button className="btn btn-lg btn-outline-white" type="button" onClick={onSalonSignup}>Saber más</button>
              <button className="btn btn-lg btn-white" type="button" onClick={onSalonSignup}>Alta de salón</button>
            </div>
          </div>
        </div>
      </section>

      <section className="company-section" id="empresa">
        <div className="container company-copy">
          <p className="eyebrow">Origar SL</p>
          <h2>Allop conecta salones, clientes y equipos en una plataforma única.</h2>
          <p>La web pública, el dashboard y las apps móviles trabajan juntos para que cada reserva tenga continuidad desde el descubrimiento hasta el cierre de caja.</p>
        </div>
      </section>
    </>
  );
}
