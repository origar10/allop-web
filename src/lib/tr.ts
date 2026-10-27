// Traducción de la web pública. La clave es el propio texto en español (igual que tr() del
// dashboard y del panel de los salones): en España no cambia nada y un texto sin traducir sale en
// español en lugar de en blanco. Fuera de España la web ofrece el idioma del país y el inglés.
// Las claves antiguas de translations.ts (t('nav.x')) pasan por aquí con su texto en español.
import { region } from './region';
import nb from '../i18n/nb';
import en from '../i18n/en';

export type Idioma = 'es' | 'nb' | 'en';

const DICCIONARIOS: Record<Exclude<Idioma, 'es'>, Record<string, string>> = { nb, en };
const CLAVE_IDIOMA = 'allop.lang';
const LOCALES: Record<Idioma, string> = { es: 'es-ES', nb: 'nb-NO', en: 'en-GB' };

/** Idiomas que se ofrecen en esta instalación (el primero es el del país). */
export function idiomasDisponibles(): Idioma[] {
  return region().code === 'no' ? ['nb', 'en'] : ['es'];
}

export function idioma(): Idioma {
  const disponibles = idiomasDisponibles();
  try {
    const guardado = localStorage.getItem(CLAVE_IDIOMA) as Idioma | null;
    if (guardado && disponibles.includes(guardado)) return guardado;
  } catch { /* sin almacenamiento: el del país */ }
  return disponibles[0];
}

/** Cambia el idioma y recarga: los textos de módulo se resuelven al cargar. */
export function setIdioma(nuevo: Idioma): void {
  try { localStorage.setItem(CLAVE_IDIOMA, nuevo); } catch { /* ignorar */ }
  window.location.reload();
}

/** Locale para fechas y números del idioma activo. */
export function getLocale(): string {
  return LOCALES[idioma()];
}

/** Traduce un texto (clave = español). `{nombre}` se sustituye por vars.nombre. */
export function tr(texto: string, vars?: Record<string, string | number>): string {
  const lang = idioma();
  let out = lang === 'es' ? texto : (DICCIONARIOS[lang][texto] ?? texto);
  if (vars) for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(String(v));
  return out;
}

/** Importe en la moneda del país (EUR, NOK…) con el formato del idioma activo. */
/** «1. september 2027» / «1 de septiembre de 2027» de la promoción gratis, o null si no hay. */
export function fechaGratis(): string | null {
  const f = region().gratis_hasta;
  if (!f) return null;
  return new Date(`${f}T12:00:00Z`).toLocaleDateString(getLocale(), { day: 'numeric', month: 'long', year: 'numeric' });
}

export function fmtMoney(n: number, decimales = 2): string {
  return new Intl.NumberFormat(getLocale(), {
    style: 'currency', currency: region().currency,
    minimumFractionDigits: decimales, maximumFractionDigits: decimales,
  }).format(Number(n) || 0);
}

/** Símbolo de la moneda del país (€, kr…), para etiquetas como «Importe (€)». */
export function currencySymbol(): string {
  const parte = new Intl.NumberFormat(getLocale(), { style: 'currency', currency: region().currency })
    .formatToParts(0).find((p) => p.type === 'currency');
  return parte?.value ?? region().currency;
}
