import React from 'react';
import * as Icons from 'lucide-react';

// ── Icon ──────────────────────────────────────────────────────────────────────
interface IconProps { name: string; size?: number; color?: string; className?: string; style?: React.CSSProperties; }
export function Icon({ name, size = 18, color, className, style }: IconProps) {
  const pascal = name.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LIcon = (Icons as any)[pascal] as React.FC<{ size?: number; color?: string; strokeWidth?: number; className?: string; style?: React.CSSProperties }> | undefined;
  if (!LIcon) return null;
  return <LIcon size={size} color={color} strokeWidth={1.9} className={className} style={style} />;
}

// ── Button ────────────────────────────────────────────────────────────────────
interface BtnProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'success';
  size?: 'sm' | 'lg';
  icon?: string;
  iconRight?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
  className?: string;
  title?: string;
}
export function Button({ variant = 'primary', size, icon, iconRight, children, onClick, disabled, type = 'button', style, className, title }: BtnProps) {
  const cls = ['btn', `btn-${variant}`, size ? `btn-${size}` : '', className || ''].filter(Boolean).join(' ');
  const iSize = size === 'sm' ? 15 : 17;
  return (
    <button className={cls} onClick={onClick} disabled={disabled} type={type} style={style} title={title}>
      {icon && <Icon name={icon} size={iSize} />}
      {children}
      {iconRight && <Icon name={iconRight} size={iSize} />}
    </button>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
const ESTADO_CLASS: Record<string, string> = {
  PENDIENTE:  'badge-pendiente',
  CONFIRMADA: 'badge-confirmada',
  COMPLETADA: 'badge-completada',
  CANCELADA:  'badge-cancelada',
};
const VARIANT_CLASS: Record<string, string> = {
  green:  'badge-confirmada',
  red:    'badge-cancelada',
  yellow: 'badge-pendiente',
  gray:   'badge-soft',
  accent: 'badge-confirmada',
};
interface BadgeProps { estado?: string; soft?: boolean; children?: React.ReactNode; variant?: string; }
export function Badge({ estado, soft, children, variant }: BadgeProps) {
  let cls = 'badge badge-soft';
  if (variant) cls = `badge ${VARIANT_CLASS[variant] || 'badge-soft'}`;
  else if (soft) cls = 'badge badge-soft';
  else if (estado) cls = `badge ${ESTADO_CLASS[estado] || 'badge-soft'}`;
  return <span className={cls}>{children ?? estado}</span>;
}

// ── Avatar ────────────────────────────────────────────────────────────────────
const AV = ['#524EA3','#4F46E5','#16A34A','#D97706','#2563EB','#9A97D2','#0EA5E9'];
const SIZE_MAP: Record<string, number> = { sm: 24, md: 34, lg: 48 };
interface AvatarProps { name: string; size?: number | 'sm' | 'md' | 'lg'; color?: string; style?: React.CSSProperties; }
export function Avatar({ name, size = 36, color, style }: AvatarProps) {
  const px = typeof size === 'string' ? SIZE_MAP[size] || 36 : size;
  const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  let h = 0; for (const c of (name || '')) h = (h * 31 + c.charCodeAt(0)) % AV.length;
  const bg = color || AV[h];
  return (
    <div className="avatar" style={{ width: px, height: px, background: bg, fontSize: px * 0.38, ...style }}>
      {initials}
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="field"><label>{label}</label>{children}</div>;
}

// ── Switch ────────────────────────────────────────────────────────────────────
interface SwitchProps {
  on?: boolean;
  onClick?: () => void;
  checked?: boolean;
  onChange?: () => void;
}
export function Switch({ on, onClick, checked, onChange }: SwitchProps) {
  const isOn = checked !== undefined ? checked : (on ?? false);
  const handler = onChange || onClick || (() => {});
  return (
    <button className={'switch' + (isOn ? ' on' : '')} onClick={handler} type="button" aria-pressed={isOn}>
      <i />
    </button>
  );
}
