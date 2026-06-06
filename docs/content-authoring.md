# Guia de contenido

Esta guia cubre cambios de contenido que no deberian requerir tocar logica de negocio: paginas legales, categorias, ciudades, landings SEO y salones semilla.

## Paginas legales

Las paginas legales se sirven desde `src/pages/LegalPage.tsx` y entran por la ruta dinamica `/:slug`.

Para anadir una pagina legal:

1. Anadir una entrada en `LEGAL_CONTENT` con:
   - `title`
   - `updatedAt`
   - `intro`
   - `sections`
2. Usar un slug estable, sin acentos ni espacios.
3. Anadir el enlace en el bloque `legal-links` si debe aparecer junto al resto de legales.
4. Revisar footer/nav si la pagina debe ser visible globalmente.
5. Confirmar que no colisiona con rutas existentes de `App.tsx`.
6. Revisar textos con legal/gestoria antes de publicar contenido definitivo.

Ejemplo:

```ts
responsabilidad: {
  title: 'Politica de responsabilidad',
  updatedAt: '2026-06-06',
  intro: 'Resumen de responsabilidades entre Allop, clientes y salones.',
  sections: [
    { heading: 'Objeto', text: ['Texto revisable por legal.'] },
  ],
}
```

## Servicios y categorias

Los servicios SEO viven en `src/lib/taxonomy.ts`, dentro de `SERVICES`.

Para anadir un servicio:

1. Crear un `slug` estable.
2. Definir `label`, `category`, `aliases` y `description`.
3. Incluir alias reales de busqueda para mejorar matching.
4. Si merece landing local, anadir combinaciones en `SERVICE_CITY_ROUTES`.
5. Ejecutar build para regenerar sitemap.

Ejemplo:

```ts
{
  slug: 'depilacion',
  label: 'Depilacion',
  category: 'Belleza',
  aliases: ['depilacion', 'cera', 'laser'],
  description: 'Servicios de depilacion con cita online y disponibilidad visible.',
}
```

## Ciudades

Las ciudades SEO viven en `src/lib/taxonomy.ts`, dentro de `CITIES`.

Para anadir una ciudad:

1. Crear `slug` con `normalizeSlug`.
2. Anadir `label`, `province` y `description`.
3. Revisar que haya salones reales o fallback razonable para esa ciudad.
4. Anadir rutas prioritarias en `SERVICE_CITY_ROUTES` si hay intencion local relevante.
5. Ejecutar build para regenerar sitemap.

Ejemplo:

```ts
{
  slug: 'sant-cugat',
  label: 'Sant Cugat',
  province: 'Barcelona',
  description: 'Salones en Sant Cugat con reserva online y resenas verificadas.',
}
```

## Salones semilla

Los salones semilla y fallback viven en `src/data/salons.ts`.

Para anadir un salon:

1. Crear `id` y `slug` estables.
2. Rellenar categoria, ciudad, coordenadas, telefono, direccion y descripcion.
3. Definir `tags` que coincidan con servicios y alias de `taxonomy.ts`.
4. Marcar `verified`, `featured` o `promoted` solo si corresponde.
5. Anadir `promotions` con fechas ISO si hay campana activa.
6. Anadir `cancelPolicy` si el salon necesita reglas visibles antes de reservar.
7. Revisar que `/salones/:slug` y `/reservar/:slug` funcionen.

## Slugs y SEO

- No cambiar slugs publicados sin plan de redirect.
- Evitar acentos, mayusculas y caracteres especiales en slugs.
- Mantener `SERVICES`, `CITIES` y `SERVICE_CITY_ROUTES` pequenos y priorizados.
- Si una pagina nueva debe indexarse, confirmar sitemap tras `npm run build`.
- Si una pagina no debe indexarse, documentarlo antes de crear contenido publico.

## Validacion recomendada

```bash
npm run lint
npm run test:unit
npm run build
```

Si el cambio afecta booking, ficha de salon o navegacion principal:

```bash
npm run test:e2e
```
