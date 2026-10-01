/**
 * Destino seguro tras iniciar sesión (`?next=`): solo rutas internas de allop.es. Antes estaba
 * copiado en cuatro páginas (login, completar perfil, callbacks de Apple y Google).
 */
export function getSafeNext(value: string | null) {
  if (!value || !value.startsWith('/')) return '/mi-cuenta';
  // Una barra invertida deja que el navegador lea la ruta como //host, así que
  // /\evil.com acaba resolviendo a https://evil.com pese a empezar por '/'.
  if (value.includes('\\')) return '/mi-cuenta';
  if (value.startsWith('//')) return '/mi-cuenta';
  // Red final: tabuladores y saltos de línea embebidos los quita el navegador al
  // parsear, así que solo resolviendo contra nuestro origen se ve el destino real.
  try {
    const { origin } = window.location;
    if (new URL(value, origin).origin !== origin) return '/mi-cuenta';
  } catch {
    return '/mi-cuenta';
  }
  return value;
}
