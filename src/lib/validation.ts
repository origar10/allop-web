const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s\-().]{6,19}$/;
const LOCATOR_RE = /^ALP-[A-Z0-9]{4,12}$/i;
const SCRIPT_RE = /<\s*script[\s>]/i;

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

export function validateEmail(value: string): ValidationResult {
  const v = value.trim();
  if (!v) return { ok: false, error: 'El email es obligatorio.' };
  if (!EMAIL_RE.test(v)) return { ok: false, error: 'El email no tiene un formato válido.' };
  return { ok: true };
}

export function validatePhone(value: string): ValidationResult {
  const v = value.trim();
  if (!v) return { ok: true }; // phone is always optional
  if (!PHONE_RE.test(v)) return { ok: false, error: 'El teléfono no tiene un formato válido (ej. +34 600 000 000).' };
  return { ok: true };
}

export function validateName(value: string, label = 'El nombre'): ValidationResult {
  const v = value.trim();
  if (!v) return { ok: false, error: `${label} es obligatorio.` };
  if (v.length < 2) return { ok: false, error: `${label} es demasiado corto.` };
  if (v.length > 120) return { ok: false, error: `${label} es demasiado largo.` };
  return { ok: true };
}

export function validateFreeText(value: string, label = 'El mensaje', maxLength = 2000): ValidationResult {
  const v = value.trim();
  if (!v) return { ok: false, error: `${label} es obligatorio.` };
  if (v.length > maxLength) return { ok: false, error: `${label} no puede superar los ${maxLength} caracteres.` };
  if (SCRIPT_RE.test(v)) return { ok: false, error: `${label} contiene contenido no permitido.` };
  return { ok: true };
}

export function validateTaxId(value: string): ValidationResult {
  const v = value.trim().toUpperCase();
  if (!v) return { ok: false, error: 'El NIF/CIF es obligatorio.' };
  if (!/^[A-Z0-9]{7,12}$/.test(v)) return { ok: false, error: 'El NIF/CIF no tiene un formato válido.' };
  return { ok: true };
}

export function validateLocator(value: string): ValidationResult {
  const v = value.trim();
  if (!v) return { ok: true }; // optional
  if (!LOCATOR_RE.test(v)) return { ok: false, error: 'El localizador debe tener el formato ALP-XXXX.' };
  return { ok: true };
}

/** Strips HTML tags and trims a string before rendering untrusted content. */
export function sanitizeText(raw: string): string {
  return raw.replace(/<[^>]*>/g, '').trim();
}

/** Collects the first validation error from a list of results. */
export function firstError(...results: ValidationResult[]): string | undefined {
  return results.find((r) => !r.ok)?.error;
}
