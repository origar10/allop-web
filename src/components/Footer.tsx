interface FooterProps {
  dashboardUrl: string;
  signupUrl: string;
  supportEmail: string;
}

export default function Footer({ dashboardUrl, signupUrl, supportEmail }: FooterProps) {
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
            <a href="#buscar">Buscar salón</a>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#tarifas">Tarifas</a>
            <a href={`mailto:${supportEmail}?subject=Ayuda%20Allop`}>Ayuda</a>
          </div>
          <div className="footer-col">
            <h4>Para salones</h4>
            <a href={signupUrl}>Registra tu salón</a>
            <a href={dashboardUrl}>Dashboard</a>
            <a href={`${dashboardUrl}/empleados`}>App empleados</a>
            <a href="#tarifas">Precios</a>
          </div>
          <div className="footer-col">
            <h4>Empresa</h4>
            <a href="#empresa">Sobre nosotros</a>
            <a href={`mailto:${supportEmail}?subject=Prensa%20Allop`}>Prensa</a>
            <a href={`mailto:${supportEmail}?subject=Trabajar%20con%20Allop`}>Trabaja con nosotros</a>
            <a href={`mailto:${supportEmail}?subject=Contacto%20Allop`}>Contacto</a>
          </div>
        </div>
        <div className="footer-bottom">
          © 2026 Origar SL · <a href={`mailto:${supportEmail}?subject=Privacidad%20Allop`} style={{ color: 'inherit' }}>Privacidad</a> · <a href={`mailto:${supportEmail}?subject=Terminos%20Allop`} style={{ color: 'inherit' }}>Términos</a> · <a href={`mailto:${supportEmail}?subject=Cookies%20Allop`} style={{ color: 'inherit' }}>Cookies</a>
        </div>
      </div>
    </footer>
  );
}
