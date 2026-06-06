# Allop Web

Frontend publico de Allop: marketplace de salones, flujo de reserva, cuenta de cliente, web B2B, alta self-service, paginas legales y soporte operativo.

El despliegue de produccion se actualiza por GitHub Actions al hacer push. No hace falta arrancar un servidor interno para publicar cambios.

## Stack

- React 19
- TypeScript
- Vite
- React Router
- Vitest + Testing Library
- Playwright
- lucide-react

## Instalacion local

Requisitos:

- Node.js compatible con Vite 8
- npm

```bash
npm install
cp .env.example .env
npm run dev
```

Servidor local por defecto:

```text
http://localhost:5173
```

## Scripts

| Comando | Uso |
| --- | --- |
| `npm run dev` | Arranca Vite en local |
| `npm run build` | Genera sitemaps, compila TypeScript y construye `dist/` |
| `npm run lint` | Ejecuta ESLint |
| `npm run test:unit` | Ejecuta tests unitarios con Vitest |
| `npm run test:watch` | Ejecuta Vitest en modo watch |
| `npm run test:e2e` | Ejecuta Playwright |
| `npm run preview` | Sirve el build local de Vite |
| `npm run predeploy:health` | Comprueba health de API antes de deploy |

## Variables de entorno

Las variables publicas de frontend deben empezar por `VITE_`.

| Variable | Obligatoria | Descripcion |
| --- | --- | --- |
| `VITE_API_URL` | Si | Base URL de la API publica |
| `VITE_API_VERSION` | No | Version de contrato documentada para API, por defecto `v1` |
| `VITE_HEALTH_CHECK_URL` | No | URL explicita para `npm run predeploy:health` |
| `VITE_STATUS_URL` | No | Enlace externo a status page si existe |
| `VITE_PLAUSIBLE_DOMAIN` | No | Dominio Plausible para analitica consentida |
| `VITE_MONITORING_ENDPOINT` | No | Endpoint para envio de errores frontend |
| `VITE_SENTRY_DSN` | No | DSN publico si se usa Sentry |
| `VITE_GOOGLE_AUTH_URL` | No | Entry point OAuth de Google para login cliente |

Ver `.env.example` para valores de referencia.

## Arquitectura de rutas

| Ruta | Modulo |
| --- | --- |
| `/` | Marketplace, busqueda, filtros y leads |
| `/buscar?q=&ciudad=` | Busqueda compartible por URL |
| `/salones` | Directorio indexable de salones |
| `/salones/:slug` | Ficha publica de salon |
| `/reservar/:salonSlug` | Flujo de reserva |
| `/login`, `/register` | Auth cliente |
| `/mi-cuenta`, `/mi-cuenta/:section` | Cuenta, reservas, favoritos, perfil, comunicaciones |
| `/ciudad/:slug` | Landing SEO por ciudad |
| `/servicios/:slug` | Landing SEO por servicio |
| `/categoria/:slug` | Landing SEO por categoria |
| `/:serviceSlug/:citySlug` | Landing SEO servicio + ciudad |
| `/business` | Funnel B2B |
| `/business/alta` | Alta self-service |
| `/business/alta/success`, `/business/alta/cancel` | Resultado billing |
| `/confianza`, `/ayuda`, `/contacto`, `/estado`, `/guias`, `/blog`, `/prensa` | Soporte, contenido y operacion |
| `/:slug` | Paginas legales existentes |
| `*` | 404 real |

## Modulos principales

- `src/pages`: paginas y composicion de rutas.
- `src/components`: componentes reutilizables compartidos por paginas.
- `src/lib`: stores locales, analytics, SEO, taxonomia, APIs de dominio existentes y helpers historicos.
- `src/shared`: cliente API, cache, estados async, contratos, modelos y formateadores transversales.
- `src/domains`: ownership objetivo por dominio para nuevas entregas.
- `src/data`: datos semilla y mocks con fallback local.
- `docs`: arquitectura, contratos API, runbooks, releases, backups, monitoring y guias de contenido.

La arquitectura objetivo esta documentada en `docs/frontend-architecture.md`.

## API y datos

- Todas las llamadas HTTP de negocio deben pasar por `src/shared/apiClient.ts`.
- Las consultas repetidas de solo lectura pueden usar `src/shared/requestCache.ts`.
- Los errores de API usan `ApiError`, con `status`, `code`, `details` y `traceId` si el backend lo envia.
- Los estados async usan el vocabulario `idle`, `loading`, `success`, `empty`, `error`.
- Los formateadores de moneda, duracion, distancia, fechas y telefonos viven en `src/shared/formatters.ts`.

## Contenido y taxonomia

- Para anadir una pagina legal o contenido editorial, seguir `docs/content-authoring.md`.
- Para anadir una categoria, servicio, ciudad o landing local, editar `src/lib/taxonomy.ts`.
- Para anadir o ajustar salones semilla, editar `src/data/salons.ts`.
- No cambiar slugs publicados sin revisar SEO, sitemap, enlaces internos y redirects.

## Deploy

El deploy se gestiona por GitHub Actions. Antes de subir cambios conviene ejecutar:

```bash
npm run lint
npm run test:unit
npm run build
npm run test:e2e
```

El workflow de deploy usa variables por entorno documentadas en `docs/cicd-entornos.md`.

## Documentacion relacionada

- `ROADMAP.md`: roadmap, estado por fase y decisiones abiertas.
- `progreso.md`: historial de cambios ejecutados por bloques.
- `docs/frontend-architecture.md`: convenciones de frontend.
- `docs/api-contracts.md`: contratos esperados de API/backend.
- `docs/data-models.md`: modelos de datos minimos.
- `docs/runbook.md`: incidencias operativas.
- `docs/release-checklist.md`: checklist de lanzamiento.
- `docs/backups.md`: backups y restauracion.
- `docs/monitoring.md`: analitica y monitorizacion.
- `docs/stripe-self-service.md`: Stripe B2B.
