import type { CommsChannel, CommsEvent, NotificationPreferences } from './accountStore';

const CHANNEL_LABEL: Record<CommsChannel, string> = {
  sms: 'SMS',
  email: 'email',
  whatsapp: 'WhatsApp',
};

const EVENT_LABEL: Record<CommsEvent, string> = {
  confirmacion: 'Confirmación de reserva',
  recordatorio_24h: 'Recordatorio 24h antes',
  recordatorio_2h: 'Recordatorio 2h antes',
  cancelacion: 'Cancelación',
};

export function getActiveChannels(prefs: NotificationPreferences): CommsChannel[] {
  const channels: CommsChannel[] = [];
  if (prefs.sms) channels.push('sms');
  if (prefs.email) channels.push('email');
  if (prefs.whatsapp) channels.push('whatsapp');
  return channels;
}

export function describeChannels(channels: CommsChannel[]): string {
  if (channels.length === 0) return '';
  return channels.map((c) => CHANNEL_LABEL[c]).join(' y ');
}

export function getEventLabel(event: CommsEvent): string {
  return EVENT_LABEL[event];
}

export function hasAnyChannel(prefs: NotificationPreferences): boolean {
  return prefs.sms || prefs.email || prefs.whatsapp;
}

export function getConfirmationChannels(prefs: NotificationPreferences): CommsChannel[] {
  if (!prefs.confirmaciones) return [];
  return getActiveChannels(prefs);
}

export function getReminderChannels(prefs: NotificationPreferences): CommsChannel[] {
  if (!prefs.recordatorios) return [];
  return getActiveChannels(prefs);
}

export function getCancellationChannels(prefs: NotificationPreferences): CommsChannel[] {
  if (!prefs.cancelaciones) return [];
  return getActiveChannels(prefs);
}

// Human-readable summary for confirmation screen
export function confirmationChannelSummary(prefs: NotificationPreferences): string {
  const channels = getConfirmationChannels(prefs);
  if (channels.length === 0) return 'sin notificaciones activas';
  return `por ${describeChannels(channels)}`;
}

export function reminderChannelSummary(prefs: NotificationPreferences): string {
  const channels = getReminderChannels(prefs);
  if (channels.length === 0) return '';
  return `Recibirás recordatorios por ${describeChannels(channels)} 24h y 2h antes de la cita.`;
}

// Templates — these document what the backend would send
export const SMS_TEMPLATES: Record<CommsEvent, string> = {
  confirmacion:
    'Allop: Reserva confirmada en {salonName} el {date} a las {time}. Localizador: {locator}. Cancelar: allop.es/mi-cuenta',
  recordatorio_24h:
    'Allop: Mañana tienes cita en {salonName} a las {time} ({service}). ¿No puedes? Cancela en allop.es/mi-cuenta',
  recordatorio_2h:
    'Allop: Tu cita en {salonName} es en 2h ({time}). ¡Te esperamos! Cancelar: allop.es/mi-cuenta',
  cancelacion:
    'Allop: Tu reserva en {salonName} del {date} a las {time} ha sido cancelada. Localizador: {locator}.',
};

export const EMAIL_TEMPLATES: Record<CommsEvent, { subject: string; body: string }> = {
  confirmacion: {
    subject: 'Confirmación de reserva en {salonName} — Allop',
    body: 'Tu reserva en {salonName} para {service} el {date} a las {time} está {status}. Localizador: {locator}.',
  },
  recordatorio_24h: {
    subject: 'Recordatorio: mañana tienes cita en {salonName}',
    body: 'Te recordamos tu cita en {salonName} mañana a las {time} para {service}. Puedes cancelar desde Mi cuenta.',
  },
  recordatorio_2h: {
    subject: 'Tu cita en {salonName} es en 2 horas',
    body: 'Tu cita en {salonName} para {service} comienza a las {time}. ¡Te esperamos!',
  },
  cancelacion: {
    subject: 'Reserva cancelada en {salonName} — Allop',
    body: 'Tu reserva en {salonName} del {date} a las {time} ({service}) ha sido cancelada. Localizador: {locator}.',
  },
};
