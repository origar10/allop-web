import { ArrowRight, HelpCircle, Search, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { setSeo } from '../lib/seo';

import { tr } from '../lib/tr';
export default function NotFound() {
  useEffect(() => {
    setSeo({
      title: tr('Página no encontrada | Allop'),
      description: 'No hemos encontrado esta página de Allop. Vuelve al marketplace, revisa la ayuda o contacta con soporte.',
      canonicalPath: '/404',
    });
  }, []);

  return (
    <section className="not-found-page">
      <div className="container not-found-content">
        <p className="eyebrow">404</p>
        <h1>{tr('No encontramos esta página.')}</h1>
        <p>{tr('Puede que el enlace haya cambiado o que la ficha ya no exista. Desde aquí puedes volver a buscar, revisar ayuda o contactar con Allop.')}</p>
        <div className="not-found-actions">
          <Link className="btn btn-primary btn-lg" to="/">
            <Search size={16} />
            {tr('Buscar salones')}
          </Link>
          <Link className="btn btn-ghost btn-lg" to="/ayuda">
            <HelpCircle size={16} />
            {tr('Centro de ayuda')}
          </Link>
          <Link className="btn btn-ghost btn-lg" to="/business">
            <Store size={16} />
            {tr('Soy un salón')}
          </Link>
        </div>
        <Link className="see-all" to="/contacto">
          {tr('Contactar con soporte')}
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
