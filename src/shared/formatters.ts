const DEFAULT_LOCALE = 'es-ES';

export function formatCurrency(value: number, currency = 'EUR', locale = DEFAULT_LOCALE) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

export function formatDuration(minutes: number) {
  if (!Number.isFinite(minutes) || minutes <= 0) return '0 min';

  const rounded = Math.round(minutes);
  const hours = Math.floor(rounded / 60);
  const remainingMinutes = rounded % 60;

  if (!hours) return `${remainingMinutes} min`;
  if (!remainingMinutes) return `${hours} h`;
  return `${hours} h ${remainingMinutes} min`;
}

export function formatDistanceKm(value: number) {
  if (!Number.isFinite(value)) return '';
  if (value < 1) return `${Math.round(value * 1000)} m`;
  return `${value.toFixed(1).replace('.', ',')} km`;
}

export function formatDateTime(value?: string | number | Date, options: Intl.DateTimeFormatOptions = {}) {
  if (!value) return 'Fecha pendiente';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    dateStyle: 'medium',
    timeStyle: 'short',
    ...options,
  }).format(date);
}

export function formatBookingDate(value?: string | null) {
  return formatDateTime(value || undefined);
}

export function normalizePhone(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith('+')) {
    return `+${trimmed.slice(1).replace(/\D/g, '')}`;
  }

  return trimmed.replace(/\D/g, '');
}

export function formatPhone(value: string) {
  const normalized = normalizePhone(value);
  if (normalized.startsWith('+34') && normalized.length === 12) {
    return `+34 ${normalized.slice(3, 6)} ${normalized.slice(6, 9)} ${normalized.slice(9)}`;
  }

  if (normalized.length === 9) {
    return `${normalized.slice(0, 3)} ${normalized.slice(3, 6)} ${normalized.slice(6)}`;
  }

  return normalized || value;
}
