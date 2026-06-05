import { Link, useLocation } from 'react-router-dom';

interface FooterProps {
  dashboardUrl: string;
  signupUrl: string;
  supportEmail: string;
}

function isBusinessPath(pathname: string) {
  return pathname === '/bussiness' || pathname === '/buissiness' || pathname === '/business';
}

export default function Footer({ dashboardUrl, signupUrl, supportEmail }: FooterProps) {
  const location = useLocation();
  const isBusiness = isBusinessPath(location.pathname);

  if (isBusiness) {
    return (
      <footer className="footer footer-business">
        <div className="container">
          <div className="footer-grid footer-business-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <img src="/allop-icon.svg" alt="allop business" width="28" height="28" decoding="async" />
                allop business
              </div>
              <p className="footer-desc">Software y marketplace para gestionar salones, reservas, caja, clientes y equipos.</p>
              <p className="footer-copy">Â© 2026 Origar. Todos los derechos reservados.</p>
            </div>
            <div className="footer-col">
              <h4>Producto</h4>
              <Link to="/business#operativa">Operativa</Link>
              <Link to="/business#precios">Precios</Link>
              <a href={dashboardUrl}>Dashboard</a>
            </div>
            <div className="footer-col">
              <h4>Soporte</h4>
              <Link to="/business#business-contact">Solicitar informaciÃ³n</Link>
              <Link to="/ayuda">FAQ salones</Link>
              <Link to="/contacto">Soporte</Link>
              <Link to="/">Marketplace Allop</Link>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <Link to="/privacidad">Privacidad</Link>
              <Link to="/terminos">TÃ©rminos</Link>
              <Link to="/cookies">Cookies</Link>
              <Link to="/dpa">DPA</Link>
            </div>
          </div>
          <div className="footer-bottom">
            Â© 2026 Origar SL Â· <Link to="/privacidad" style={{ color: 'inherit' }}>Privacidad</Link> Â· <Link to="/terminos" style={{ color: 'inherit' }}>TÃ©rminos</Link>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/allop-icon.svg" alt="allop" width="28" height="28" decoding="async" />
              allop
            </div>
            <p className="footer-desc">El marketplace de salones de peluquerÃ­a y estÃ©tica mÃ¡s completo de EspaÃ±a.</p>
            <p className="footer-copy">Â© 2026 Origar. Todos los derechos reservados.</p>
          </div>
          <div className="footer-col">
            <h4>Marketplace</h4>
            <a href="/#buscar">Buscar salÃ³n</a>
            <a href="/#como-funciona">CÃ³mo funciona</a>
            <Link to="/confianza">Confianza</Link>
            <Link to={`${signupUrl}#precios`}>Tarifas</Link>
            <Link to="/ayuda">Ayuda</Link>
          </div>
          <div className="footer-col">
            <h4>Para salones</h4>
            <Link to={signupUrl}>Alta de salÃ³n</Link>
            <a href={dashboardUrl}>Dashboard</a>
            <Link to={`${signupUrl}#operativa`}>App empleados</Link>
            <Link to={`${signupUrl}#precios`}>Precios</Link>
          </div>
          <div className="footer-col">
            <h4>Empresa</h4>
            <Link to={`${signupUrl}#empresa`}>Sobre nosotros</Link>
            <Link to="/prensa">Prensa</Link>
            <Link to="/blog">Blog</Link>
            <a href={`mailto:${supportEmail}?subject=Trabajar%20con%20Allop`}>Trabaja con nosotros</a>
            <Link to="/contacto">Contacto</Link>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <Link to="/privacidad">Privacidad</Link>
            <Link to="/terminos">TÃ©rminos y cond.</Link>
            <Link to="/cookies">Cookies</Link>
            <Link to="/rgpd">RGPD</Link>
            <Link to="/aviso-legal">Aviso legal</Link>
            <Link to="/dpa">DPA salones</Link>
          </div>
        </div>
        <div className="footer-bottom">
          Â© 2026 Origar SL Â· <Link to="/privacidad" style={{ color: 'inherit' }}>Privacidad</Link> Â· <Link to="/terminos" style={{ color: 'inherit' }}>TÃ©rminos</Link> Â· <Link to="/cookies" style={{ color: 'inherit' }}>Cookies</Link>
        </div>
      </div>
    </footer>
  );
}


