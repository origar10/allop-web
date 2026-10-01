// Pone las tildes que faltan en los textos visibles de allop-web (no en código).
// Uso: node scripts/tildes.cjs [--aplicar]   (sin --aplicar solo enseña lo que cambiaría)
// Recorre el AST de TypeScript: solo toca literales de texto, texto JSX y las partes fijas de
// las plantillas. Nunca: imports, claves de objeto, atributos técnicos (className, href, to…),
// rutas o URLs, claves de traducción ("cookie.accept"), comparaciones (=== 'x') ni valores de
// una palabra en minúscula (slugs como "peluqueria" o identificadores como "basico").
const ts = require('typescript');
const fs = require('fs');
const path = require('path');

const PALABRAS = {
  salon: 'salón', Salon: 'Salón', pagina: 'página', Pagina: 'Página', paginas: 'páginas',
  busqueda: 'búsqueda', Busqueda: 'Búsqueda', busquedas: 'búsquedas',
  peluqueria: 'peluquería', Peluqueria: 'Peluquería', peluquerias: 'peluquerías',
  barberia: 'barbería', Barberia: 'Barbería', politica: 'política', Politica: 'Política', politicas: 'políticas', Politicas: 'Políticas',
  terminos: 'términos', Terminos: 'Términos', guia: 'guía', Guia: 'Guía', guias: 'guías', Guias: 'Guías',
  gestion: 'gestión', Gestion: 'Gestión', resena: 'reseña', Resena: 'Reseña', resenas: 'reseñas', Resenas: 'Reseñas',
  estetica: 'estética', Estetica: 'Estética', facil: 'fácil', Facil: 'Fácil', rapido: 'rápido', rapida: 'rápida', Rapido: 'Rápido',
  telefono: 'teléfono', Telefono: 'Teléfono', telefonos: 'teléfonos', Rubi: 'Rubí',
  informacion: 'información', Informacion: 'Información', proteccion: 'protección', Proteccion: 'Protección',
  electronico: 'electrónico', aqui: 'aquí', Aqui: 'Aquí', ademas: 'además', Ademas: 'Además', tambien: 'también', Tambien: 'También',
  dias: 'días', Dias: 'Días', numero: 'número', Numero: 'Número', metodo: 'método', metodos: 'métodos', Metodo: 'Método',
  sesion: 'sesión', Sesion: 'Sesión', verificacion: 'verificación', Verificacion: 'Verificación',
  configuracion: 'configuración', Configuracion: 'Configuración', direccion: 'dirección', Direccion: 'Dirección',
  ubicacion: 'ubicación', Ubicacion: 'Ubicación', atencion: 'atención', Atencion: 'Atención',
  cancelacion: 'cancelación', Cancelacion: 'Cancelación', valoracion: 'valoración',
  codigo: 'código', Codigo: 'Código', contrasena: 'contraseña', Contrasena: 'Contraseña', contrasenas: 'contraseñas',
  Espana: 'España', espanol: 'español', ultimo: 'último', ultima: 'última', ultimos: 'últimos', ultimas: 'últimas', Ultimo: 'Último', Ultima: 'Última',
  unico: 'único', unica: 'única', pequeno: 'pequeño', pequena: 'pequeña', facturacion: 'facturación', Facturacion: 'Facturación',
  notificacion: 'notificación', suscripcion: 'suscripción', Suscripcion: 'Suscripción',
  basico: 'básico', Basico: 'Básico', publico: 'público', publica: 'pública', Publico: 'Público', Publica: 'Pública',
  tecnico: 'técnico', tecnica: 'técnica', tecnicas: 'técnicas', tecnicos: 'técnicos', analitica: 'analítica', Analitica: 'Analítica',
  categoria: 'categoría', Categoria: 'Categoría', categorias: 'categorías', Categorias: 'Categorías',
  automatico: 'automático', automatica: 'automática', automaticamente: 'automáticamente',
  despues: 'después', Despues: 'Después', segun: 'según', Segun: 'Según', valida: 'válida', valido: 'válido', invalido: 'inválido', invalida: 'inválida',
  linea: 'línea', movil: 'móvil', Movil: 'Móvil', moviles: 'móviles',
  solucion: 'solución', opcion: 'opción', Opcion: 'Opción',
  cuentanos: 'cuéntanos', Cuentanos: 'Cuéntanos', manana: 'mañana', Manana: 'Mañana', anadir: 'añadir', Anadir: 'Añadir',
  pais: 'país', titulo: 'título', Titulo: 'Título', proximo: 'próximo', proxima: 'próxima', Proximo: 'Próximo', Proxima: 'Próxima',
  comision: 'comisión', energia: 'energía',
  peluquerias: 'peluquerías', Peluquerias: 'Peluquerías', barberias: 'barberías', Barberias: 'Barberías',
  anade: 'añade', Anade: 'Añade', anaden: 'añaden', practicos: 'prácticos', practicas: 'prácticas', practico: 'práctico',
  util: 'útil', utiles: 'útiles', Util: 'Útil', Utiles: 'Útiles', area: 'área', Area: 'Área', areas: 'áreas',
  dificil: 'difícil', rapidamente: 'rápidamente', facilmente: 'fácilmente', unicamente: 'únicamente',
  tambien: 'también', agil: 'ágil', minimo: 'mínimo', minima: 'mínima', maximo: 'máximo', maxima: 'máxima',
  Minimo: 'Mínimo', Maximo: 'Máximo', ultimamente: 'últimamente', tipico: 'típico', clasico: 'clásico', clasica: 'clásica',
  medico: 'médico', historico: 'histórico', historial: 'historial', economico: 'económico', estrategia: 'estrategia',
  catalogo: 'catálogo', Catalogo: 'Catálogo', calendario: 'calendario', cliente: 'cliente', credito: 'crédito', debito: 'débito',
  exito: 'éxito', Exito: 'Éxito', metrica: 'métrica', metricas: 'métricas', politicamente: 'políticamente',
  envio: 'envío', envios: 'envíos', garantia: 'garantía', compania: 'compañía', companias: 'compañías', espanola: 'española',
};
// Reglas generales: en español toda palabra acabada en -cion/-sion lleva tilde (ción/sión).
// Una palabra pegada a "-" o "_" es un identificador (clase CSS, id), no texto: no se toca.
const SUFIJOS = [[/(?<![\p{L}\p{N}_-])(\p{L}+)cion(?![\p{L}\p{N}_-])/gu, '$1ción'], [/(?<![\p{L}\p{N}_-])(\p{L}+)sion(?![\p{L}\p{N}_-])/gu, '$1sión']];
const RE = new RegExp(`(?<![\\p{L}\\p{N}_-])(${Object.keys(PALABRAS).join('|')})(?![\\p{L}\\p{N}_-])`, 'gu');
// "Como" solo es interrogativo en frases concretas.
const FRASES = [[/(^|[.!?]\s+)Si, /g, '$1Sí, '], [/\bComo elegir\b/g, 'Cómo elegir'], [/\bComo funciona\b/g, 'Cómo funciona'], [/\bComo reservar\b/g, 'Cómo reservar'], [/¿como\b/g, '¿cómo'], [/¿Como\b/g, '¿Cómo']];

const ATRIBUTOS_TECNICOS = new Set(['className', 'href', 'to', 'id', 'key', 'type', 'name', 'src', 'path', 'htmlFor', 'rel', 'target', 'role', 'method', 'action', 'autoComplete', 'inputMode', 'pattern', 'data-testid', 'element', 'value']);
const LLAMADAS_TECNICAS = /^(t|require|import|querySelector|querySelectorAll|getElementById|setItem|getItem|removeItem|navigate|includes|startsWith|endsWith|get|set|has|apiGet|apiPost|apiPut|apiPatch|apiDelete|fetch|request|platform|gateway)$/;

function esTecnico(texto) {
  const t = texto.trim();
  if (!t) return true;
  if (/^(\/|https?:|mailto:|tel:|#|\.|@)/.test(t)) return true;
  if (!/\s/.test(t) && /^[a-z0-9_.:\-/]+$/.test(t)) return true;
  if (!/\s/.test(t) && /[._]/.test(t) && /^[\w.\-]+$/.test(t)) return true;
  return false;
}

function corregir(texto) {
  let r = texto.replace(RE, (m) => PALABRAS[m]);
  for (const [re, sust] of SUFIJOS) r = r.replace(re, sust);
  for (const [re, sust] of FRASES) r = r.replace(re, sust);
  return r;
}

function procesar(fichero, aplicar) {
  const src = fs.readFileSync(fichero, 'utf8');
  const sf = ts.createSourceFile(fichero, src, ts.ScriptTarget.Latest, true, fichero.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const cambios = [];
  const visitar = (n) => {
    let ini = null; let fin = null;
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
      const p = n.parent;
      const tecnico = (ts.isPropertyAssignment(p) && p.name === n) || ts.isImportDeclaration(p) || ts.isExportDeclaration(p)
        || ts.isLiteralTypeNode(p) || (ts.isElementAccessExpression(p) && p.argumentExpression === n)
        || (ts.isJsxAttribute(p) && ATRIBUTOS_TECNICOS.has(p.name.getText(sf)))
        || (ts.isCallExpression(p) && LLAMADAS_TECNICAS.test(p.expression.getText(sf).split('.').pop()))
        || ts.isCaseClause(p) || (ts.isBinaryExpression(p) && /^(===|!==|==|!=)$/.test(p.operatorToken.getText(sf)));
      if (!tecnico && !esTecnico(n.text)) { ini = n.getStart(sf) + 1; fin = n.getEnd() - 1; }
    } else if ((ts.isTemplateHead(n) || ts.isTemplateMiddle(n) || ts.isTemplateTail(n)) && /\s/.test(n.text)) {
      // Solo trozos con espacios (prosa): `salon-${id}` es un identificador, no texto.
      ini = n.getStart(sf) + 1; fin = n.getEnd() - (ts.isTemplateTail(n) ? 1 : 2);
    } else if (ts.isJsxText(n)) {
      ini = n.getStart(sf); fin = n.getEnd();
    }
    if (ini !== null) {
      const texto = src.slice(ini, fin);
      const nuevo = corregir(texto);
      if (nuevo !== texto) cambios.push({ ini, fin, antes: texto, despues: nuevo });
    }
    ts.forEachChild(n, visitar);
  };
  visitar(sf);
  if (aplicar && cambios.length) {
    let out = src;
    for (const c of [...cambios].sort((a, b) => b.ini - a.ini)) out = out.slice(0, c.ini) + c.despues + out.slice(c.fin);
    fs.writeFileSync(fichero, out);
  }
  return cambios;
}

const aplicar = process.argv.includes('--aplicar');
const raiz = path.join(__dirname, '..', 'src');
const ficheros = [];
(function recorrer(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) recorrer(p);
    else if (/\.tsx?$/.test(e.name) && !/\.test\./.test(e.name)) ficheros.push(p);
  }
})(raiz);
let total = 0;
for (const f of ficheros) {
  const c = procesar(f, aplicar);
  if (!c.length) continue;
  total += c.length;
  console.log(`\n== ${path.relative(raiz, f)} (${c.length})`);
  if (!aplicar) for (const x of c) console.log(`  - ${x.antes.trim().slice(0, 100)}\n    + ${x.despues.trim().slice(0, 100)}`);
}
console.log(`\n${total} textos ${aplicar ? 'corregidos' : 'a corregir'}`);
