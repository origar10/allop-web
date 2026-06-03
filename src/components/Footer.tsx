export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/allop-icon.svg" alt="allop" />
              allop
            </div>
            <p className="footer-desc">El marketplace de salones de peluquería y estética más completo de España.</p>
            <p className="footer-copy">© 2026 Origar. Todos los derechos reservados.</p>
          </div>
          <div className="footer-col">
            <h4>Marketplace</h4>
            <a href="#">Buscar salón</a>
            <a href="#">Cómo funciona</a>
            <a href="#">Tarifas</a>
            <a href="#">Ayuda</a>
          </div>
          <div className="footer-col">
            <h4>Para salones</h4>
            <a href="#">Registra tu salón</a>
            <a href="#">Dashboard</a>
            <a href="#">App empleados</a>
            <a href="#">Precios</a>
          </div>
          <div className="footer-col">
            <h4>Empresa</h4>
            <a href="#">Sobre nosotros</a>
            <a href="#">Blog</a>
            <a href="#">Prensa</a>
            <a href="#">Trabaja con nosotros</a>
          </div>
        </div>
        <div className="footer-bottom">
          © 2026 Origar SL · <a href="#" style={{ color: 'inherit' }}>Privacidad</a> · <a href="#" style={{ color: 'inherit' }}>Términos</a> · <a href="#" style={{ color: 'inherit' }}>Cookies</a>
        </div>
      </div>
    </footer>
  );
}
