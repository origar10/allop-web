// País de la instalación a la que habla esta web (España, Noruega…). Sale de la API
// (/api/platform/region), así la misma build sirve para cualquier país. main.tsx lo carga ANTES
// de importar App: los textos que se resuelven al cargar un módulo ya salen en su idioma.

export interface Region {
  code: string;
  locale: string;
  currency: string;
  /** ¿Gestiona Allop cobros (caja, ventas, inventario) en este país? Noruega no. */
  cobros: boolean;
  /** Días de prueba gratis sin tarjeta del alta Tier 1 (null = se paga al darse de alta). */
  prueba_gratis_dias: number | null;
  /** Promoción de lanzamiento: gratis para todos hasta esta fecha (YYYY-MM-DD), o null. */
  gratis_hasta: string | null;
  acceso_cliente: 'telefono' | 'email';
  /** Noruega: solo empresas (alta con org.nr) y precios sin IVA (se factura con inversión del sujeto pasivo). */
  inversion_sujeto_pasivo: boolean;
  dominio: string;
}

const ESPANA: Region = {
  code: 'es', locale: 'es-ES', currency: 'EUR', cobros: true,
  prueba_gratis_dias: null, gratis_hasta: null, acceso_cliente: 'telefono', inversion_sujeto_pasivo: false, dominio: 'allop.es',
};

let actual: Region = ESPANA;

export async function cargarRegion(apiBase: string): Promise<void> {
  try {
    const res = await fetch(`${apiBase}/platform/region`);
    if (res.ok) actual = { ...ESPANA, ...(await res.json()) };
  } catch {
    // Sin respuesta se queda en España, que es el comportamiento de siempre.
  }
}

export function region(): Region {
  return actual;
}
