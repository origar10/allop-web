import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../lib/useI18n';

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
  const { t } = useI18n();

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
              <p className="footer-desc">{t('footer.business.description')}</p>
              <p className="footer-copy">{t('footer.copy')}</p>
            </div>
            <div className="footer-col">
              <h4>{t('footer.product')}</h4>
              <Link to="/business#operativa">{t('footer.operational')}</Link>
              <Link to="/business#precios">{t('footer.prices')}</Link>
              <a href={dashboardUrl}>{t('footer.dashboard')}</a>
            </div>
            <div className="footer-col">
              <h4>{t('footer.support')}</h4>
              <Link to="/business#business-contact">{t('footer.requestInfo')}</Link>
              <Link to="/ayuda">{t('footer.salonFaq')}</Link>
              <Link to="/contacto">{t('footer.supportLink')}</Link>
              <Link to="/">{t('footer.marketplaceAllop')}</Link>
            </div>
            <div className="footer-col">
              <h4>{t('footer.legal')}</h4>
              <Link to="/privacidad">{t('common.privacy')}</Link>
              <Link to="/terminos">{t('common.terms')}</Link>
              <Link to="/cookies">{t('common.cookies')}</Link>
              <Link to="/dpa">DPA</Link>
            </div>
          </div>
          <div className="footer-bottom">
            © 2026 Origar SL · <Link to="/privacidad" style={{ color: 'inherit' }}>{t('common.privacy')}</Link> · <Link to="/terminos" style={{ color: 'inherit' }}>{t('common.terms')}</Link>
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
            <p className="footer-desc">{t('footer.client.description')}</p>
            <Link to={signupUrl} className="btn btn-primary footer-cta">{t('footer.salonCta')}</Link>
            <p className="footer-copy">{t('footer.copy')}</p>
          </div>
          <div className="footer-col">
            <h4>{t('footer.marketplace')}</h4>
            <a href="/#buscar">{t('footer.findSalon')}</a>
            <Link to="/salones">Directorio de salones</Link>
            <a href="/#como-funciona">{t('footer.howItWorks')}</a>
            <Link to="/confianza">{t('footer.trust')}</Link>
            <Link to={`${signupUrl}#precios`}>{t('footer.rates')}</Link>
            <Link to="/ayuda">{t('footer.help')}</Link>
          </div>
          <div className="footer-col">
            <h4>{t('footer.forSalons')}</h4>
            <Link to={signupUrl}>{t('footer.salonSignup')}</Link>
            <a href={dashboardUrl}>{t('footer.dashboard')}</a>
            <Link to={`${signupUrl}#operativa`}>{t('footer.employeeApp')}</Link>
            <Link to={`${signupUrl}#precios`}>{t('footer.prices')}</Link>
          </div>
          <div className="footer-col">
            <h4>{t('footer.company')}</h4>
            <Link to={`${signupUrl}#empresa`}>{t('footer.about')}</Link>
            <Link to="/prensa">{t('footer.press')}</Link>
            <Link to="/blog">{t('footer.blog')}</Link>
            <a href={`mailto:${supportEmail}?subject=Trabajar%20con%20Allop`}>{t('footer.jobs')}</a>
            <Link to="/contacto">{t('footer.contact')}</Link>
          </div>
          <div className="footer-col">
            <h4>{t('footer.legal')}</h4>
            <Link to="/privacidad">{t('common.privacy')}</Link>
            <Link to="/terminos">{t('footer.termsShort')}</Link>
            <Link to="/cookies">{t('common.cookies')}</Link>
            <Link to="/rgpd">RGPD</Link>
            <Link to="/aviso-legal">{t('footer.legalNotice')}</Link>
            <Link to="/dpa">{t('footer.salonDpa')}</Link>
          </div>
        </div>
        <div className="footer-bottom">
          © 2026 Origar SL · <Link to="/privacidad" style={{ color: 'inherit' }}>{t('common.privacy')}</Link> · <Link to="/terminos" style={{ color: 'inherit' }}>{t('common.terms')}</Link> · <Link to="/cookies" style={{ color: 'inherit' }}>{t('common.cookies')}</Link>
        </div>
      </div>
    </footer>
  );
}
