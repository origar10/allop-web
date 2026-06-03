import { CalendarDays, MapPin, Search, Scissors, Star, Sparkles, Hand, Heart, Wand2, Smile } from 'lucide-react';
import SalonCard from '../components/SalonCard';

const CATEGORIES = [
  { icon: <Scissors size={22} />, label: 'Peluquería' },
  { icon: <Smile size={22} />, label: 'Barbería' },
  { icon: <Sparkles size={22} />, label: 'Estética' },
  { icon: <Hand size={22} />, label: 'Uñas' },
  { icon: <Heart size={22} />, label: 'Masajes' },
  { icon: <Wand2 size={22} />, label: 'Maquillaje' },
];

const CHIPS = ['Corte de pelo', 'Mechas', 'Manicura', 'Masaje', 'Barba', 'Color'];

const CERCA = [
  { name: 'Feromi',         location: 'Rubí',      distance: '0.4 km', rating: 4.8, reviews: 132, desde: 18, tags: ['Corte','Color','Mechas'] },
  { name: 'Lumière Studio', location: 'Barcelona', distance: '6.1 km', rating: 4.9, reviews: 408, desde: 45, tags: ['Balayage','Color','Keratina'] },
  { name: 'Barbería Marcel', location: 'Terrassa', distance: '8.3 km', rating: 4.7, reviews: 96,  desde: 12, tags: ['Corte','Barba','Navaja'] },
  { name: 'Nuvo Beauty',    location: 'Sabadell',  distance: '9.0 km', rating: 4.6, reviews: 211, desde: 22, tags: ['Facial','Manicura','Depilación'] },
];

const TOP = [
  { name: 'Lumière Studio', location: 'Barcelona', distance: '6.1 km', rating: 4.9, reviews: 408, desde: 45, tags: ['Balayage','Color','Keratina'] },
  { name: 'Aura Spa',       location: 'Barcelona', distance: '8.1 km', rating: 4.9, reviews: 312, desde: 40, tags: ['Masaje','Spa','Ritual'] },
  { name: 'Feromi',         location: 'Rubí',      distance: '0.4 km', rating: 4.8, reviews: 132, desde: 18, tags: ['Corte','Color','Mechas'] },
  { name: 'Glow Studio',    location: 'Barcelona', distance: '9.5 km', rating: 4.8, reviews: 143, desde: 35, tags: ['Maquillaje','Imagen','Eventos'] },
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <h1>Encuentra tu salón.<br />Reserva en segundos.</h1>
        <p>Más de 500 salones y profesionales en Barcelona y alrededores.<br />Sin llamadas, sin esperas.</p>

        <div className="search-bar">
          <div className="search-field">
            <Scissors size={18} />
            <input placeholder="¿Qué servicio buscas?" />
          </div>
          <div className="search-field search-location">
            <MapPin size={18} />
            <input placeholder="Ciudad o barrio" />
          </div>
          <button className="search-btn">
            <Search size={17} />
            Buscar
          </button>
        </div>

        <div className="search-chips">
          {CHIPS.map(c => <button key={c} className="chip">{c}</button>)}
        </div>
      </section>

      {/* CATEGORIES */}
      <section>
        <div className="container">
          <h2 className="section-title" style={{ marginBottom: 24 }}>¿Qué buscas hoy?</h2>
          <div className="categories-grid">
            {CATEGORIES.map(c => (
              <button key={c.label} className="category-pill">
                <div className="category-icon">{c.icon}</div>
                <span className="category-label">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CERCA DE TI */}
      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Cerca de ti</h2>
            <a href="#" className="see-all">Ver todos →</a>
          </div>
          <div className="salons-grid">
            {CERCA.map(s => <SalonCard key={s.name} {...s} />)}
          </div>
        </div>
      </section>

      {/* MÁS VALORADOS */}
      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <Star size={20} fill="#F59E0B" color="#F59E0B" /> Más valorados
            </h2>
            <a href="#" className="see-all">Ver todos →</a>
          </div>
          <div className="salons-grid">
            {TOP.map(s => <SalonCard key={s.name + s.location} {...s} />)}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section">
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

      {/* CTA PARA SALONES */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-banner">
            <div className="cta-text">
              <h2>¿Tienes un salón?<br />Únete a Allop.</h2>
              <p>Gestiona tu agenda, cobra, fideliza clientes y aparece en el marketplace — todo desde un panel propio.</p>
            </div>
            <div className="cta-actions">
              <button className="btn btn-lg btn-outline-white">Saber más</button>
              <button className="btn btn-lg btn-white">Registra tu salón</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
