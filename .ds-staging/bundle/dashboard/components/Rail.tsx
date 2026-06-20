import { Icon } from './primitives';

type NavItem = { key: string; icon: string; label: string } | { sep: true };

const NAV: NavItem[] = [
  { key: 'hoy',         icon: 'sun',           label: 'Hoy' },
  { key: 'agenda',      icon: 'calendar-days', label: 'Agenda' },
  { key: 'caja',        icon: 'credit-card',   label: 'Caja' },
  { key: 'clientes',    icon: 'users',         label: 'Clientes' },
  { sep: true },
  { key: 'ventas',      icon: 'trending-up',   label: 'Ventas' },
  { key: 'inventario',  icon: 'package',       label: 'Inventario' },
  { key: 'servicios',   icon: 'scissors',      label: 'Servicios' },
  { key: 'equipo',      icon: 'user-cog',      label: 'Equipo' },
  { sep: true },
  { key: 'ficha',       icon: 'globe',         label: 'Ficha' },
  { key: 'resenas',     icon: 'star',          label: 'Reseñas' },
  { key: 'suscripcion', icon: 'receipt',       label: 'Suscripción' },
];

interface RailProps {
  active: string;
  onNavigate: (key: string) => void;
  theme: string;
  onToggleTheme: () => void;
  onLogout: () => void;
  chatUnread?: number;
}

export function Rail({ active, onNavigate, theme, onToggleTheme, onLogout, chatUnread = 0 }: RailProps) {
  return (
    <aside className="rail">
      <div className="rail-logo">
        <img src="/allop-icon.svg" alt="Allop" />
      </div>

      <div className="rail-nav">
        {NAV.map((item, i) => {
          if ('sep' in item) {
            return <div key={`sep-${i}`} className="rail-sep" />;
          }
          return (
            <button
              key={item.key}
              className={'rail-btn' + (active === item.key ? ' active' : '')}
              onClick={() => onNavigate(item.key)}
              title={item.label}
              style={{ position: 'relative' }}
            >
              <Icon name={item.icon} size={21} />
              {item.key === 'clientes' && chatUnread > 0 && (
                <span style={{
                  position: 'absolute', top: 6, right: 6, minWidth: 16, height: 16,
                  borderRadius: 8, background: '#EF4444', color: '#fff',
                  fontSize: 10, fontWeight: 700, display: 'grid', placeItems: 'center',
                  padding: '0 4px', lineHeight: 1,
                }}>
                  {chatUnread > 99 ? '99+' : chatUnread}
                </span>
              )}
              <span className="rail-tip">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="rail-spacer" />

      <div className="rail-nav">
        <button
          className={'rail-btn' + (active === 'ajustes' ? ' active' : '')}
          onClick={() => onNavigate('ajustes')}
          title="Ajustes"
        >
          <Icon name="settings" size={21} />
          <span className="rail-tip">Ajustes</span>
        </button>
        <button className="rail-btn" onClick={onToggleTheme} title="Cambiar tema">
          <Icon name={theme === 'dark' ? 'sun-medium' : 'moon'} size={21} />
          <span className="rail-tip">{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
        </button>
        <button className="rail-btn" onClick={onLogout} title="Cerrar sesión">
          <Icon name="log-out" size={21} />
          <span className="rail-tip">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
