import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const site = 'https://allop.es';
const publicDir = fileURLToPath(new URL('../public/', import.meta.url));

// Salones publicados de verdad, leídos de la API al compilar. Antes era una lista fija de
// nombres de ejemplo que daban 404 (y no incluía ninguno de los publicados): Google indexaba
// páginas rotas. Si la API no responde, solo se publica /salones, nunca enlaces inventados.
async function salonesPublicados() {
  const api = (process.env.VITE_API_URL || 'https://api.allop.es/api').replace(/\/$/, '');
  try {
    const res = await fetch(`${api}/salones`, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const lista = Array.isArray(data) ? data : data.salones ?? data.data ?? [];
    return lista.map((s) => s.slug).filter((slug) => typeof slug === 'string' && /^[a-z0-9-]+$/.test(slug));
  } catch (err) {
    console.warn(`Sitemap: no se pudo leer la lista de salones (${err.message}); solo se incluye /salones.`);
    return [];
  }
}
const salons = await salonesPublicados();
const services = ['peluqueria', 'barberia', 'estetica', 'unas', 'masajes', 'maquillaje', 'manicura', 'corte'];
const categories = ['cabello', 'belleza', 'bienestar'];
const cities = ['barcelona', 'rubi', 'sabadell', 'terrassa'];
const serviceCities = ['peluqueria/rubi', 'barberia/terrassa', 'estetica/sabadell', 'manicura/barcelona', 'masajes/barcelona'];
const blog = [
  'blog',
  'guias',
  'guias/clientes/como-elegir-salon',
  'guias/clientes/que-preguntar-antes-de-reservar',
  'guias/clientes/cuidado-post-servicio',
  'guias/salones/reducir-ausencias',
  'guias/salones/organizar-agenda',
  'guias/salones/captar-y-fidelizar-clientes',
];
const legal = ['privacidad', 'terminos', 'cookies', 'aviso-legal', 'rgpd', 'dpa', 'confianza', 'ayuda', 'contacto', 'prensa'];

function xml(lines) {
  return `${lines.join('\n')}\n`;
}

function urlset(paths) {
  return xml([
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...paths.map((path) => `  <url><loc>${site}/${path}</loc></url>`),
    '</urlset>',
  ]);
}

function write(name, content) {
  writeFileSync(join(publicDir, name), content, 'utf8');
}

write('sitemap.xml', xml([
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  '  <sitemap><loc>https://allop.es/sitemap-salones.xml</loc></sitemap>',
  '  <sitemap><loc>https://allop.es/sitemap-servicios.xml</loc></sitemap>',
  '  <sitemap><loc>https://allop.es/sitemap-categorias.xml</loc></sitemap>',
  '  <sitemap><loc>https://allop.es/sitemap-ciudades.xml</loc></sitemap>',
  '  <sitemap><loc>https://allop.es/sitemap-blog.xml</loc></sitemap>',
  '  <sitemap><loc>https://allop.es/sitemap-legales.xml</loc></sitemap>',
  '</sitemapindex>',
]));
write('sitemap-salones.xml', urlset(['salones', ...salons.map((slug) => `salones/${slug}`)]));
write('sitemap-servicios.xml', urlset([...services.map((slug) => `servicios/${slug}`), ...serviceCities]));
write('sitemap-categorias.xml', urlset(categories.map((slug) => `categoria/${slug}`)));
write('sitemap-ciudades.xml', urlset(cities.map((slug) => `ciudad/${slug}`)));
write('sitemap-blog.xml', urlset(blog));
write('sitemap-legales.xml', urlset(legal));
write('robots.txt', xml([
  'User-agent: *',
  'Allow: /',
  '',
  'Sitemap: https://allop.es/sitemap.xml',
]));

console.log('Sitemaps generated in public/.');
