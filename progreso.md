# Progreso allop-web

## 2026-06-06 - Arquitectura frontend, ROADMAP 4.11

### Hecho
- Creada capa compartida `apiClient` con:
  - `API_BASE_URL` centralizado,
  - timeout por defecto,
  - `ApiError` normalizado,
  - soporte de `AbortSignal`,
  - headers de sesion/token,
  - helpers `apiGet`, `apiPost` y `apiRequest`.
- Anadido cache local de consultas repetidas con `cachedRequest` y limpieza con `clearRequestCache`.
- Definido vocabulario estandar de estados async:
  - `idle`,
  - `loading`,
  - `success`,
  - `empty`,
  - `error`.
- Centralizados formateadores compartidos:
  - moneda,
  - duracion,
  - distancia,
  - fechas,
  - telefonos.
- Refactorizadas llamadas API para pasar por la capa compartida:
  - plataforma/auth cliente,
  - marketplace de salones,
  - reservas y disponibilidad,
  - leads B2B,
  - billing/Stripe.
- Mantenidos fallbacks locales en reservas, billing, leads y marketplace para no degradar la experiencia si backend/Stripe no responden.
- Anadido `AbortController` a cargas cancelables de salones y reservas de cuenta.
- Usados estados estandar en Home y cuenta de cliente mediante `statusFromItems`.
- Creada estructura documentada de dominios en `src/domains`:
  - `marketplace`,
  - `auth`,
  - `booking`,
  - `account`,
  - `business`,
  - `legal`,
  - `shared`.
- Documentadas convenciones de ownership, nombres, rutas, API, cache, estados y formateadores en `docs/frontend-architecture.md`.
- Actualizado `ROADMAP.md`: punto 4.11 completo.

### Archivos modificados/anadidos
- `src/shared/apiClient.ts`
- `src/shared/requestCache.ts`
- `src/shared/asyncState.ts`
- `src/shared/formatters.ts`
- `src/shared/formatters.test.ts`
- `src/shared/requestCache.test.ts`
- `src/shared/asyncState.test.ts`
- `src/domains/README.md`
- `src/domains/marketplace/README.md`
- `src/domains/auth/README.md`
- `src/domains/booking/README.md`
- `src/domains/account/README.md`
- `src/domains/business/README.md`
- `src/domains/legal/README.md`
- `src/domains/shared/README.md`
- `docs/frontend-architecture.md`
- `src/lib/platformApi.ts`
- `src/lib/salonsApi.ts`
- `src/lib/businessLeads.ts`
- `src/lib/bookingApi.ts`
- `src/lib/billingApi.ts`
- `src/lib/dateFormat.ts`
- `src/pages/Home.tsx`
- `src/pages/Account.tsx`
- `src/pages/ClientAuth.tsx`
- `ROADMAP.md`
- `progreso.md`

### Validacion
- `npm.cmd run lint` OK.
- `npm.cmd run test:unit` OK: 8 archivos, 16 tests.
- `npm.cmd run build` OK.
- `npm.cmd run test:e2e` OK: 1 test Playwright Chromium.

## 2026-06-06 - UX general, ROADMAP 4.10

### Hecho
- Anadido modo oscuro con:
  - `prefers-color-scheme`,
  - persistencia en `localStorage` bajo `allop.theme`,
  - `ThemeProvider`,
  - hook `useTheme`,
  - toggle claro/oscuro en Nav normal y Business.
- Anadido sistema global de toasts:
  - `ToastProvider`,
  - hook `useToast`,
  - region accesible `aria-live`,
  - variantes `success`, `error`, `info`.
- Conectados toasts en acciones comunes:
  - reserva guardada,
  - reserva cancelada,
  - sesion cerrada,
  - perfil guardado,
  - datos exportados/eliminados,
  - resena guardada,
  - favorito guardado/eliminado,
  - enlace/ficha compartida.
- Creada pagina 404 personalizada con sugerencias:
  - buscar salones,
  - centro de ayuda,
  - Allop Business,
  - contacto.
- Sustituido wildcard de rutas por 404 real y redireccion de fichas/rutas invalidas a `/404`.
- Anadidos spinners de carga:
  - fallback de rutas,
  - botones async de reserva, auth, lead B2B y checkout,
  - carga de reservas en cuenta.
- Anadida confirmacion antes de cancelar reserva:
  - desde area cliente,
  - desde pantalla de confirmacion de reserva.
- Mantenido scroll to top/hash en cambio de ruta.
- Anadido breadcrumb real en booking flow y mantenido breadcrumb de ficha de salon.
- Actualizado `ROADMAP.md`: punto 4.10 completo y checks relacionados de 404 sincronizados.

### Archivos modificados/anadidos
- `src/lib/theme.tsx`
- `src/lib/themeContext.ts`
- `src/lib/useTheme.ts`
- `src/components/ToastProvider.tsx`
- `src/lib/toastContext.ts`
- `src/lib/useToast.ts`
- `src/pages/NotFound.tsx`
- `src/main.tsx`
- `src/App.tsx`
- `src/components/Nav.tsx`
- `src/pages/Account.tsx`
- `src/pages/BookingFlow.tsx`
- `src/pages/ClientAuth.tsx`
- `src/pages/Business.tsx`
- `src/pages/BusinessSignup.tsx`
- `src/pages/SalonProfile.tsx`
- `src/pages/LegalPage.tsx`
- `src/lib/translations.ts`
- `src/test/setup.ts`
- `src/components/Nav.test.tsx`
- `src/index.css`
- `ROADMAP.md`
- `progreso.md`

### Validacion
- `npm.cmd run lint` OK.
- `npm.cmd run test:unit` OK: 5 archivos, 10 tests.
- `npm.cmd run build` OK.
- `npm.cmd run test:e2e` OK: 1 test Playwright Chromium.

## 2026-06-06 - PWA, ROADMAP 4.9

### Hecho
- Creado `public/manifest.webmanifest` con:
  - nombre y nombre corto,
  - descripcion,
  - `start_url`, `scope` y `display: standalone`,
  - `theme_color` y `background_color`,
  - iconos reutilizando `allop-icon.svg` y `favicon.svg`,
  - shortcuts a busqueda y Allop Business.
- Anadidos metadatos PWA en `index.html`:
  - `manifest`,
  - `theme-color`,
  - soporte `mobile-web-app-capable`,
  - soporte Apple web app.
- Creado `public/offline.html` como fallback offline basico.
- Creado `public/sw.js` con:
  - cache de app shell,
  - limpieza de caches antiguos,
  - fallback offline para navegacion,
  - cache runtime de assets same-origin.
- Creado `src/lib/pwa.ts` para registrar el service worker solo en produccion.
- Conectado registro PWA en `src/main.tsx`.
- Confirmado que `manifest.webmanifest`, `offline.html` y `sw.js` salen en `dist/`.
- Actualizado `ROADMAP.md`: punto 4.9 completo.

### Archivos modificados/anadidos
- `public/manifest.webmanifest`
- `public/offline.html`
- `public/sw.js`
- `src/lib/pwa.ts`
- `src/main.tsx`
- `index.html`
- `ROADMAP.md`
- `progreso.md`

### Validacion
- Manifest JSON OK.
- `npm.cmd run lint` OK.
- `npm.cmd run test:unit` OK: 5 archivos, 10 tests.
- `npm.cmd run build` OK.
- `npm.cmd run test:e2e` OK: 1 test Playwright Chromium.
- Nota: la comprobacion final de instalabilidad conviene hacerla con Lighthouse/PWA en el VPS tras deploy, porque el service worker solo se registra en build de produccion.

## 2026-06-06 - CI/CD y entornos, ROADMAP 4.8

### Hecho
- Creado `.env.example` con variables publicas necesarias:
  - `VITE_API_URL`,
  - `VITE_HEALTH_CHECK_URL`,
  - `VITE_PLAUSIBLE_DOMAIN`,
  - `VITE_MONITORING_ENDPOINT`,
  - `VITE_SENTRY_DSN`,
  - `VITE_GOOGLE_AUTH_URL`.
- Anadido script `predeploy:health` en `package.json`.
- Creado `scripts/predeploy-health-check.mjs`:
  - usa `VITE_HEALTH_CHECK_URL` si existe,
  - si no, comprueba `${VITE_API_URL}/health`,
  - falla el deploy si la API no devuelve HTTP 2xx.
- Rehecho workflow `.github/workflows/deploy.yml`:
  - `pull_request` ejecuta calidad sin deploy,
  - `push` en `main`/`master` despliega produccion,
  - `push` en `staging` despliega entorno staging,
  - `workflow_dispatch` permite ejecucion manual,
  - calidad ejecuta `npm ci`, `lint`, `test:unit` y `build`,
  - deploy ejecuta build y health check antes de copiar `dist/` al VPS.
- Separados valores de entorno para produccion y staging mediante GitHub Actions `vars`/`secrets`.
- Anadidas rutas de deploy separadas:
  - produccion: `/opt/allop/platform/web`,
  - staging: `/opt/allop/platform/web-staging`.
- Documentado el proceso en `docs/cicd-entornos.md`, incluyendo ramas, variables, secrets, health check y uso local.
- Actualizado `ROADMAP.md`: punto 4.8 completo.

### Archivos modificados/anadidos
- `.env.example`
- `.github/workflows/deploy.yml`
- `scripts/predeploy-health-check.mjs`
- `docs/cicd-entornos.md`
- `package.json`
- `package-lock.json`
- `ROADMAP.md`
- `progreso.md`

### Validacion
- `npm.cmd run predeploy:health` OK usando `VITE_HEALTH_CHECK_URL=https://example.com`.
- `npm.cmd run lint` OK.
- `npm.cmd run test:unit` OK: 5 archivos, 10 tests.
- `npm.cmd run build` OK.
- `npm.cmd run test:e2e` OK: 1 test Playwright Chromium.
- Nota: en GitHub Actions hay que configurar las variables/secrets documentadas antes de depender del deploy de staging/produccion.

## 2026-06-06 - Internacionalizacion, ROADMAP 4.7

### Hecho
- Creado sistema i18n ligero sin dependencias externas:
  - `src/lib/translations.ts` con diccionarios `es` y `ca`,
  - `src/lib/i18n.tsx` con `I18nProvider`,
  - `src/lib/i18nContext.ts`,
  - `src/lib/useI18n.ts`.
- Separadas cadenas comunes de UI en fichero de traducciones:
  - carga y skip link,
  - Nav,
  - selector de idioma,
  - Footer cliente y business,
  - banner de cookies.
- Anadido soporte catalan (`ca`) como segunda lengua para esas cadenas transversales.
- Anadida persistencia de idioma en `localStorage` bajo `allop.locale`.
- Anadida deteccion inicial por navegador: si `navigator.language` empieza por `ca`, se usa catalan; si no, espanol.
- Anadida actualizacion de `document.documentElement.lang` al cambiar idioma.
- Anadido selector de idioma en Nav normal y Nav business.
- Ajustados estilos del selector para desktop/mobile sin romper la composicion actual.
- Actualizados tests del banner de cookies con `I18nProvider`.
- Anadido test de `Nav` que cambia a catalan y valida:
  - strings traducidas,
  - persistencia en `localStorage`,
  - atributo `lang="ca"` en HTML.
- Actualizado `ROADMAP.md`: punto 4.7 completo.

### Archivos modificados/anadidos
- `src/lib/translations.ts`
- `src/lib/i18n.tsx`
- `src/lib/i18nContext.ts`
- `src/lib/useI18n.ts`
- `src/main.tsx`
- `src/App.tsx`
- `src/components/Nav.tsx`
- `src/components/Footer.tsx`
- `src/components/CookieBanner.tsx`
- `src/components/CookieBanner.test.tsx`
- `src/components/Nav.test.tsx`
- `src/index.css`
- `ROADMAP.md`
- `progreso.md`

### Validacion
- `npm.cmd run test:unit` OK: 5 archivos, 10 tests.
- `npm.cmd run lint` OK.
- `npm.cmd run build` OK.
- `npm.cmd run test:e2e` OK: 1 test Playwright Chromium.
- Nota: el alcance inicial traduce componentes comunes/transversales; las paginas completas quedan preparadas para migrarse progresivamente al diccionario.

## 2026-06-06 - Testing, ROADMAP 4.6

### Hecho
- Anadida infraestructura de testing unitario/componentes con Vitest, jsdom y Testing Library.
- Anadidos scripts:
  - `npm.cmd run test`,
  - `npm.cmd run test:unit`,
  - `npm.cmd run test:watch`,
  - `npm.cmd run test:e2e`.
- Configurado `vite.config.ts` para tests en jsdom con setup de `@testing-library/jest-dom`.
- Ajustado ESLint para globals de Vitest y configuraciones Node.
- Excluidos tests del `tsc -b` de produccion en `tsconfig.app.json`.
- Extraidas utilidades testeables:
  - `src/lib/searchUtils.ts` con `normalize` y `matchesQuery`,
  - `src/lib/dateFormat.ts` con `formatBookingDate`.
- Anadidos tests unitarios de utilidades:
  - normalizacion de acentos y mayusculas,
  - matching por texto/ciudad,
  - formateo de fecha de reserva.
- Anadidos tests de componentes clave:
  - `SalonCard` renderiza datos, `alt` accesible y dispara seleccion,
  - `CookieBanner` guarda consentimiento y se oculta correctamente.
- Anadida infraestructura e2e con Playwright:
  - `playwright.config.ts`,
  - test del booking flow como invitado en `/reservar/feromi`,
  - API interceptada para validar fallback local sin depender del backend.
- Instalado navegador Chromium de Playwright para poder ejecutar e2e localmente.
- Anadidos `playwright-report` y `test-results` a `.gitignore`.
- Actualizado `ROADMAP.md`: punto 4.6 completo salvo regresion visual opcional.

### Archivos modificados/anadidos
- `package.json`
- `package-lock.json`
- `vite.config.ts`
- `eslint.config.js`
- `tsconfig.app.json`
- `.gitignore`
- `playwright.config.ts`
- `src/test/setup.ts`
- `src/lib/searchUtils.ts`
- `src/lib/searchUtils.test.ts`
- `src/lib/dateFormat.ts`
- `src/lib/dateFormat.test.ts`
- `src/pages/Home.tsx`
- `src/pages/ClientAuth.tsx`
- `src/components/SalonCard.test.tsx`
- `src/components/CookieBanner.test.tsx`
- `tests/e2e/booking-flow.spec.ts`
- `ROADMAP.md`
- `progreso.md`

### Validacion
- `npm.cmd run test:unit` OK: 4 archivos, 9 tests.
- `npm.cmd run test:e2e` OK: 1 test Playwright Chromium.
- `npm.cmd run lint` OK.
- `npm.cmd run build` OK.
- Nota: regresion visual con Chromatic/Percy queda como opcional no activada.

## 2026-06-06 - Accesibilidad, ROADMAP 4.5

### Hecho
- Anadido skip link al contenido principal y objetivo `main#main-content`.
- Creado hook reutilizable `useFocusTrap` para modales:
  - mueve el foco al abrir,
  - encierra Tab/Shift+Tab dentro del dialogo,
  - permite cerrar con Escape,
  - devuelve el foco al elemento anterior al cerrar.
- Aplicado focus trap al modal de ficha de salon y al modal de leads del marketplace.
- Anadida semantica de dialogo accesible en el modal de leads: `role="dialog"`, `aria-modal`, `aria-labelledby`.
- Anadido foco visible global para enlaces, botones, inputs, selects, textareas y elementos con `tabindex`.
- Revisado orden de tabulacion de formularios y modales sin introducir `tabindex` positivo.
- Mejorado contraste de textos pequenos:
  - tokens secundarios `--fg-3` y `--fg-4`,
  - textos sobre hero, banners, CTA y footer.
- Anadidos `alt` descriptivos a imagenes reales de tarjetas de salon y avatar de cuenta.
- Anadidos `aria-live`/`role` en mensajes de error y exito de formularios:
  - booking,
  - auth cliente,
  - contacto,
  - business lead,
  - alta self-service,
  - portal billing,
  - cuenta cliente,
  - leads marketplace.
- Actualizado `ROADMAP.md`: punto 4.5 marcado completo salvo auditoria automatica pendiente de medir en VPS tras deploy.

### Archivos modificados/anadidos
- `src/hooks/useFocusTrap.ts`
- `src/App.tsx`
- `src/pages/Home.tsx`
- `src/pages/BookingFlow.tsx`
- `src/pages/Business.tsx`
- `src/pages/BusinessSignup.tsx`
- `src/pages/BusinessBillingResult.tsx`
- `src/pages/ClientAuth.tsx`
- `src/pages/Contact.tsx`
- `src/pages/Account.tsx`
- `src/components/SalonCard.tsx`
- `src/index.css`
- `ROADMAP.md`
- `progreso.md`

### Validacion
- `npm.cmd run lint` OK.
- `npm.cmd run build` OK.
- Nota: no se ha ejecutado axe-core/Lighthouse Accessibility porque se validara en el VPS tras deploy.

## 2026-06-05 - Legal y privacidad, ROADMAP 4.4

### Hecho
- Anadido banner de cookies RGPD con opt-in real:
  - aceptar carga Plausible si `VITE_PLAUSIBLE_DOMAIN` esta configurado,
  - rechazar evita cargar script externo,
  - la decision se guarda en `allop.analytics.consent`.
- Modificada la capa `analytics` para no cargar Plausible hasta tener consentimiento aceptado.
- Ampliadas paginas legales con contenido estructurado y fecha de actualizacion:
  - `/privacidad`,
  - `/terminos`,
  - `/cookies`,
  - `/aviso-legal`,
  - `/rgpd`.
- Anadida pagina `/dpa` para salones con roles responsable/encargado, objeto, medidas, subencargados y fin de servicio.
- Anadidos enlaces a DPA en footer y sitemap generado.
- Mantenido checkbox de terminos en registro con enlaces reales a `/terminos` y `/privacidad`.
- Anadido en `/mi-cuenta/perfil` bloque de privacidad y derechos RGPD:
  - exportar datos locales en JSON,
  - eliminar datos locales de cuenta,
  - cierre de sesion tras supresion local,
  - enlace a informacion RGPD para solicitudes backend.
- Actualizado `ROADMAP.md`: punto 4.4 completo y prioridades P0 de cookies/legales sincronizadas.

### Archivos modificados/anadidos
- `src/components/CookieBanner.tsx`
- `src/lib/analytics.ts`
- `src/main.tsx`
- `src/App.tsx`
- `src/pages/LegalPage.tsx`
- `src/pages/Account.tsx`
- `src/lib/accountStore.ts`
- `src/components/Footer.tsx`
- `src/index.css`
- `scripts/generate-sitemaps.mjs`
- `public/sitemap-legales.xml`
- `ROADMAP.md`
- `progreso.md`

### Validacion
- `npm.cmd run lint` OK.
- `npm.cmd run build` OK.
- Nota: los textos legales son operativos y mucho mas completos que placeholder, pero antes de produccion real conviene revision de abogado/gestoria.

## 2026-06-05 - Analitica y monitorizacion, ROADMAP 4.3

### Hecho
- Creada capa `analytics` privacy-first preparada para Plausible con `VITE_PLAUSIBLE_DOMAIN`.
- Anadido fallback local de eventos en `localStorage` bajo `allop.analytics.events` si Plausible no esta configurado.
- Anadido tracking de pageviews en cambios de ruta.
- Anadidos eventos de conversion:
  - `search`,
  - `salon_click`,
  - `booking_started`,
  - `booking_completed`,
  - `registration_completed`,
  - `business_lead_submitted`.
- Conectados eventos de billing existentes a la capa de analitica:
  - `plan_viewed`,
  - `checkout_started`,
  - `checkout_completed`,
  - `checkout_abandoned`,
  - `portal_opened`,
  - `billing_webhook_synced`.
- Creada capa `monitoring` con captura de:
  - errores globales,
  - promesas rechazadas,
  - errores manuales,
  - errores capturados por Error Boundary.
- Anadido `ErrorBoundary` global con fallback visible.
- Preparadas variables opcionales:
  - `VITE_MONITORING_ENDPOINT`,
  - `VITE_SENTRY_DSN`.
- Documentado uptime del VPS en `docs/monitoring.md`, con checks recomendados para `allop.es`, `sitemap.xml` y API health.
- Actualizado `ROADMAP.md`: punto 4.3 completo y checks relacionados de analytics, errores y error boundary sincronizados.

### Archivos modificados/anadidos
- `src/lib/analytics.ts`
- `src/lib/monitoring.ts`
- `src/components/ErrorBoundary.tsx`
- `src/main.tsx`
- `src/App.tsx`
- `src/pages/SeoLanding.tsx`
- `src/pages/BookingFlow.tsx`
- `src/pages/ClientAuth.tsx`
- `src/pages/Business.tsx`
- `src/lib/billingApi.ts`
- `src/index.css`
- `docs/monitoring.md`
- `ROADMAP.md`
- `progreso.md`

### Validacion
- `npm.cmd run lint` OK.
- `npm.cmd run build` OK.
- Nota: para produccion hay que configurar `VITE_PLAUSIBLE_DOMAIN` y, si se desea envio externo de errores, `VITE_MONITORING_ENDPOINT` o `VITE_SENTRY_DSN`.

## 2026-06-05 - Rendimiento frontend, ROADMAP 4.2

### Hecho
- Convertidas rutas principales a `React.lazy` con `Suspense` en `App`.
- Anadido fallback accesible de carga de ruta.
- Convertidas imagenes de tarjetas de salon a `<img>` reales con:
  - `loading="lazy"`,
  - `decoding="async"`,
  - `srcSet`,
  - `sizes`,
  - WebP desde Unsplash.
- Evitada doble descarga en tarjetas anulando background-image cuando `SalonCard` renderiza `<img>`.
- Anadido `srcSet`, `sizes`, `loading`, `decoding`, `width` y `height` a testimonios B2B.
- Anadidos `decoding`, `width` y `height` en logos SVG de nav/footer/media kit.
- Anadido lazy/decoding al avatar editable de cuenta.
- Convertidas imagenes remotas restantes de CSS a WebP (`fm=webp`).
- Eliminado `@import` de Inter en CSS.
- Anadido preload/preconnect de Inter en `index.html`.
- Revisado code splitting en build:
  - chunk principal `index` queda en 214.62 kB / 67.70 kB gzip,
  - rutas quedan separadas: Home, Business, Account, BookingFlow, SalonProfile, ClientAuth, etc.
- Actualizado `ROADMAP.md`: tareas implementadas de 4.2 y lazy loading P1 sincronizadas.

### Archivos modificados
- `src/App.tsx`
- `src/components/SalonCard.tsx`
- `src/components/Nav.tsx`
- `src/components/Footer.tsx`
- `src/pages/Business.tsx`
- `src/pages/Account.tsx`
- `src/pages/Press.tsx`
- `src/index.css`
- `index.html`
- `ROADMAP.md`
- `progreso.md`

### Validacion
- `npm.cmd run lint` OK.
- `npm.cmd run build` OK.
- Nota: no se ha ejecutado Lighthouse porque no se esta levantando servidor interno. Queda pendiente medir score >90 en el VPS tras deploy.

## 2026-06-05 - SEO tecnico transversal, ROADMAP 4.1

### Hecho
- Ampliado `setSeo` para cubrir:
  - title,
  - meta description,
  - Open Graph title/description/type/url/image,
  - Twitter Card title/description/url/image,
  - canonical.
- Anadido soporte de JSON-LD con `setStructuredData` y limpieza con `clearStructuredData`.
- Anadido SEO por ruta en `App` para paginas sin SEO propio:
  - login,
  - registro,
  - mi cuenta,
  - business,
  - reserva,
  - confianza,
  - ayuda,
  - contacto,
  - legales.
- Actualizada ficha de salon para usar SEO unificado y generar Schema.org:
  - `LocalBusiness`,
  - `Product` para servicios/ofertas,
  - `Review`,
  - `AggregateRating`,
  - `BreadcrumbList`.
- Anadida miga visible en ficha de salon: Marketplace > servicio > ciudad.
- Anadida base SEO en `index.html` para el HTML inicial antes de hidratar React.
- Creado `scripts/generate-sitemaps.mjs` y conectado al script `npm run build`.
- El build ahora regenera:
  - `public/sitemap.xml`,
  - `public/sitemap-salones.xml`,
  - `public/sitemap-servicios.xml`,
  - `public/sitemap-ciudades.xml`,
  - `public/sitemap-blog.xml`,
  - `public/sitemap-legales.xml`,
  - `public/robots.txt`.
- Actualizado `ROADMAP.md`: punto 4.1 completo y SEO basico P0 sincronizado.

### Archivos modificados/anadidos
- `src/lib/seo.ts`
- `src/App.tsx`
- `src/pages/SalonProfile.tsx`
- `src/index.css`
- `index.html`
- `scripts/generate-sitemaps.mjs`
- `package.json`
- `public/sitemap.xml`
- `public/sitemap-salones.xml`
- `public/sitemap-servicios.xml`
- `public/sitemap-ciudades.xml`
- `public/sitemap-blog.xml`
- `public/sitemap-legales.xml`
- `public/robots.txt`
- `ROADMAP.md`
- `progreso.md`

### Validacion
- `npm.cmd run lint` OK.
- `npm.cmd run build` OK. El build ejecuta `node scripts/generate-sitemaps.mjs` antes de compilar.

## 2026-06-05 - Pagos self-service con Stripe, ROADMAP 3.11

### Hecho
- Definido el alcance del self-service inicial: solo salones B2B; pagos de clientes por reserva quedan como decision futura.
- Creado flujo `/business/alta` para elegir plan y empezar sin intervencion comercial.
- Anadida seleccion mensual/anual, trial por plan, limites, precio base, IVA 21% y total final.
- Anadidos datos fiscales: razon social, NIF/CIF, direccion fiscal, ciudad, email de facturacion y cupon opcional.
- Creada capa `billingApi` con contratos para:
  - `POST /billing/checkout-sessions`,
  - `POST /billing/customer-portal`,
  - `GET /billing/subscription`.
- Preparada redireccion a Stripe Checkout para alta de suscripcion B2B, con fallback local si el backend aun no responde.
- Preparado Customer Portal para cambiar plan, tarjeta, facturas y cancelacion, con fallback local.
- Creadas pantallas:
  - `/business/alta/success`,
  - `/business/alta/cancel`.
- Asociado estado local/API con `stripeCustomerId`, `stripeSubscriptionId`, estado de suscripcion, periodo, trial y activacion del salon.
- Anadida funcion de sincronizacion `applyWebhookSnapshot` y documentados webhooks esperados: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`.
- Anadida logica para bloquear/desbloquear modulos B2B segun plan y estado de pago.
- Anadidos avisos de pago fallido, tarjeta caducada, trial terminando y suscripcion cancelada.
- Definido grace period de 7 dias por impago antes de limitar modulos no esenciales.
- Registrados eventos locales de billing: plan visto, checkout iniciado, checkout completado, checkout abandonado y portal abierto.
- Documentado que Allop no guarda datos de tarjeta y que todo dato sensible queda en Stripe/backend.
- Creada guia `docs/stripe-self-service.md` con modo test/live, variables, contratos, webhooks, reconciliacion y checklist de produccion.
- Anadidos CTAs desde `/business` hacia el alta self-service.
- Actualizado `ROADMAP.md`: punto 3.11 completo y checks P1 de Stripe Checkout/Customer Portal sincronizados.

### Archivos modificados/anadidos
- `src/lib/billingApi.ts`
- `src/pages/BusinessSignup.tsx`
- `src/pages/BusinessBillingResult.tsx`
- `src/pages/Business.tsx`
- `src/App.tsx`
- `src/index.css`
- `docs/stripe-self-service.md`
- `ROADMAP.md`
- `progreso.md`

### Validacion
- `npm.cmd run lint` OK.
- `npm.cmd run build` OK.
- Nota: la integracion real de Stripe requiere que el backend implemente los endpoints y webhooks documentados; el frontend ya no guarda tarjeta ni secretos.

## 2026-06-05 - Contenido editorial/SEO especifico, ROADMAP 3.10

### Hecho
- Creada taxonomia estable en `src/lib/taxonomy.ts` para servicios, ciudades, rutas servicio+ciudad, FAQs y guias editoriales.
- Anadidas paginas SEO por intencion local con ruta `/:serviceSlug/:citySlug`, incluyendo `/peluqueria/rubi`, `/barberia/terrassa`, `/estetica/sabadell`, `/manicura/barcelona` y `/masajes/barcelona`.
- Ampliada `SeoLanding` para soportar ciudad, servicio y servicio+ciudad con salones filtrados, rutas internas, FAQs indexables y enlaces cruzados.
- Anadido hub editorial `/guias` y alias `/blog`.
- Anadidas guias evergreen para clientes y salones en `/guias/:audience/:slug`.
- Anadida pagina `/prensa` con logo, descripcion corta, contacto y recursos de marca.
- Anadido helper SEO `setSeo` para title, description, Open Graph, Twitter Card y canonical.
- Anadida canonicalizacion de Home para evitar duplicados por filtros/query.
- Anadidos sitemaps separados en `public/` para salones, servicios, ciudades, blog/guias y legales.
- Anadido `public/sitemap.xml` como indice y `public/robots.txt`.
- Actualizado footer para enlazar a `/prensa` y `/blog`.
- Actualizado `ROADMAP.md`: punto 3.10 completo y checks relacionados de SEO, intencion local y sitemap sincronizados.

### Archivos modificados/anadidos
- `src/lib/taxonomy.ts`
- `src/lib/seo.ts`
- `src/pages/SeoLanding.tsx`
- `src/pages/Guides.tsx`
- `src/pages/Press.tsx`
- `src/pages/Home.tsx`
- `src/components/Footer.tsx`
- `src/App.tsx`
- `src/index.css`
- `public/sitemap.xml`
- `public/sitemap-salones.xml`
- `public/sitemap-servicios.xml`
- `public/sitemap-ciudades.xml`
- `public/sitemap-blog.xml`
- `public/sitemap-legales.xml`
- `public/robots.txt`
- `ROADMAP.md`
- `progreso.md`

### Validacion
- `npm.cmd run lint` OK.
- `npm.cmd run build` OK.
- Nota: los sitemaps quedan estaticos en `public/`; cuando haya CMS/backend de contenido conviene generarlos desde datos reales en build.

## 2026-06-05 - Marketplace Home, ROADMAP 3.1

### Hecho
- Ampliada la Home del marketplace con filtros avanzados sobre los datos actuales:
  - precio maximo con slider,
  - valoracion minima,
  - distancia maxima,
  - disponibilidad por hoy/manana/esta semana,
  - ordenacion por recomendados, rating, precio, distancia y disponibilidad.
- Anadida busqueda con sugerencias/autocompletado local usando nombres de salones, categorias, tags y chips.
- Ampliados los chips rapidos de busqueda con mas servicios.
- Anadidos badges de estado en cards: "Abre ahora", "Ultimas plazas" y "Nuevo".
- Anadido proximo hueco visible en cada card.
- Anadido bloque de accesos por ciudad y accion "Usar ubicacion" que prioriza orden por distancia con los datos mock disponibles.
- Anadida vista alternativa "Mapa" con pins interactivos basada en los salones actuales. Es una vista provisional sin Google Maps/Mapbox.
- Anadida paginacion progresiva con boton "Cargar mas salones".
- Anadidos skeleton loaders durante cambios de filtros/busqueda.
- Anadida seccion "Cerca de ti" ordenada por distancia.
- Mejorado el estado vacio de resultados con acciones claras.
- Ajustados estilos responsive para filtros, resultados, mapa, badges y skeletons.

### Archivos modificados
- `src/pages/Home.tsx`
- `src/components/SalonCard.tsx`
- `src/data/salons.ts`
- `src/index.css`

### Validacion
- `npm.cmd run lint` OK.
- `npm.cmd run build` OK.

## 2026-06-05 - Precios y venta B2B, ROADMAP 3.9

### Hecho
- Anadida tabla de limites por plan: usuarios, empleados, sedes, reservas, recordatorios y soporte.
- Anadida seccion "Que incluye" con modulos concretos del producto: agenda, caja, clientes y operativa.
- Anadida calculadora de ahorro/no-shows con reservas mensuales, porcentaje de no-show y horas de gestion.
- Ampliada comparativa contra agenda de papel, WhatsApp manual, Google Calendar y Allop.
- Ampliada FAQ comercial con pagos, formacion y cancelacion.
- Ampliado proceso de onboarding visible: demo, configuracion, migracion, formacion y salida a produccion.
- Anadidos casos de uso por tipo de negocio: peluqueria, barberia, estetica, unas y spa.
- Mantenido CTA secundario "Ver demo del panel" junto a "Solicitar demo".
- Anadido lead magnet: checklist de digitalizacion y guia anti no-show para salones.
- Enriquecidos testimonios con ciudad, tamano/contexto del salon, problema y resultado.
- Actualizado `ROADMAP.md`: punto 3.9 completo y calculadora B2B en prioridades sincronizada.

### Archivos modificados
- `src/pages/Business.tsx`
- `src/index.css`
- `ROADMAP.md`
- `progreso.md`

### Validacion
- `npm.cmd run lint` OK.
- `npm.cmd run build` OK.

## 2026-06-05 - Confianza y soporte, ROADMAP 3.8

### Hecho
- Creada pagina `/confianza` con explicacion de:
  - Allop como marketplace y software para salones,
  - reservas pendientes/confirmadas,
  - verificacion de salones,
  - verificacion de resenas,
  - privacidad para telefono, SMS, email y geolocalizacion.
- Creada pagina `/ayuda` con preguntas separadas para clientes y salones.
- Creada pagina `/contacto` con formulario segmentado por motivo:
  - cliente,
  - salon,
  - reportar datos incorrectos,
  - reclamar ficha,
  - privacidad,
  - prensa,
  - empleo.
- Anadido numero de reserva opcional en soporte.
- Anadido almacenamiento local de solicitudes de soporte en `supportStore`.
- Anadidas politicas visibles de cancelacion, retrasos y no-show antes de confirmar reserva.
- Anadido indicador claro de reserva pendiente hasta confirmacion del salon.
- Anadidos enlaces legales en checkout/reserva, auth y footer.
- Creadas rutas legales placeholder: `/privacidad`, `/terminos`, `/cookies`, `/aviso-legal`, `/rgpd`.
- Anadidos enlaces desde ficha para reportar datos incorrectos y reclamar/actualizar ficha.
- Actualizado footer para usar links reales a ayuda, contacto, confianza y legales.
- Actualizado `ROADMAP.md`: punto 3.8 completo y checks relacionados de contacto/confianza sincronizados.

### Archivos modificados/anadidos
- `src/pages/Trust.tsx`
- `src/pages/Help.tsx`
- `src/pages/Contact.tsx`
- `src/pages/LegalPage.tsx`
- `src/lib/supportStore.ts`
- `src/pages/BookingFlow.tsx`
- `src/pages/SalonProfile.tsx`
- `src/components/Footer.tsx`
- `src/App.tsx`
- `src/index.css`
- `ROADMAP.md`
- `progreso.md`

### Validacion
- `npm.cmd run lint` OK.
- `npm.cmd run build` OK.

## 2026-06-05 - Home y contenido comercial, ROADMAP 3.7

### Hecho
- Anadido bloque de confianza above-the-fold: reservas verificadas, cancelacion clara, soporte y privacidad.
- Anadidos modulos de servicios populares con links a `/servicios/:slug`.
- Anadidos modulos de ciudades populares con links a `/ciudad/:slug`.
- Creadas rutas SEO ligeras:
  - `/servicios/:slug`,
  - `/ciudad/:slug`.
- Anadida landing local por ciudad con texto, salones destacados, categorias relacionadas, FAQ y enlaces internos.
- Anadido modulo "Salones nuevos en Allop".
- Anadido modulo "Ofertas cerca de ti" basado en promociones/ultimas plazas.
- Anadido bloque explicativo para usuarios indecisos: que pasa tras reservar, confirmacion y cancelacion/ayuda.
- Ajustado bloque de resenas para enlazar a la ficha del salon.
- Anadidos CTAs "No encuentras tu salon" y "Reclama tu ficha".
- Mejorado estado vacio comercial con sugerencias y captura de lead.
- Anadida captura local de leads marketplace para:
  - `no_results`,
  - `suggest_salon`,
  - `claim_listing`.
- Actualizado `ROADMAP.md`: punto 3.7 completo y checks relacionados de SEO local/captura de intencion sincronizados.

### Archivos modificados/anadidos
- `src/pages/Home.tsx`
- `src/pages/SeoLanding.tsx`
- `src/lib/marketplaceLeads.ts`
- `src/App.tsx`
- `src/index.css`
- `ROADMAP.md`
- `progreso.md`

### Validacion
- `npm.cmd run lint` OK.
- `npm.cmd run build` OK.

## 2026-06-05 - Business landing, ROADMAP 3.6

### Hecho
- Convertida `/business` en funnel B2B completo con CTA a demo y formulario.
- Anadida demo visual/interactiva del panel.
- Anadidas metricas de confianza: salones, reservas y satisfaccion.
- Anadida seccion de testimonios con foto, nombre, salon y ciudad.
- Anadida tabla comparativa de planes ademas de cards.
- Anadido FAQ accordion para salones.
- Sustituido el CTA principal `mailto` por formulario real.
- Anadida capa `submitBusinessLead` para enviar leads a `/leads/b2b` y guardar fallback local si CRM/backend no responde.
- Anadida seccion de integraciones: TPV/caja, WhatsApp/SMS, Stripe y soporte.
- Anadido bloque de soporte/widget preparado para Crisp/Intercom/canal elegido.
- Anadida comparativa "Allop vs agenda de papel".
- Actualizado `ROADMAP.md`: punto 3.6 completo y checks B2B relacionados sincronizados.

### Archivos modificados/anadidos
- `src/pages/Business.tsx`
- `src/lib/businessLeads.ts`
- `src/index.css`
- `ROADMAP.md`
- `progreso.md`

### Validacion
- `npm.cmd run lint` OK.
- `npm.cmd run build` OK.

## 2026-06-05 - Auth, ROADMAP 3.5

### Hecho
- Eliminado el selector visible de salon del flujo de login/registro; la UI trata la sesion como global.
- Mantenido `salonSlug` interno solo por compatibilidad con endpoints actuales de auth.
- Anadido email opcional en registro.
- Anadido texto de ayuda sobre el codigo SMS.
- Enlazados terminos y privacidad en el checkbox de registro.
- Anadido reenvio de codigo con countdown de 60 segundos.
- Mejorados mensajes de error para codigo caducado/incorrecto, telefono y conexion.
- Ocultado `debugCode` de OTP fuera de `import.meta.env.DEV`; ya no se autocompleta ni se muestra en produccion.
- Anadido redirect post-login con `?next=/ruta`.
- Anadido boton de Google preparado con `VITE_GOOGLE_AUTH_URL`; sin la variable muestra mensaje de configuracion pendiente.
- Actualizado `ROADMAP.md`: punto 3.5 completo y checks relacionados P0/P1/P2 sincronizados.

### Archivos modificados
- `src/pages/ClientAuth.tsx`
- `src/lib/platformApi.ts`
- `src/index.css`
- `ROADMAP.md`
- `progreso.md`

### Validacion
- `npm.cmd run lint` OK.
- `npm.cmd run build` OK.

## 2026-06-05 - Área de cliente, ROADMAP 3.4

### Hecho
- Creada el área `/mi-cuenta` y subrutas:
  - `/mi-cuenta/reservas`,
  - `/mi-cuenta/favoritos`,
  - `/mi-cuenta/perfil`,
  - `/mi-cuenta/puntos`.
- Anadido dashboard con proximas reservas, favoritos y puntos.
- Anadido historial completo de reservas con estados `confirmada`, `pendiente`, `cancelada` y `completada`.
- Anadida cancelacion de reservas pendientes/confirmadas desde el area cliente.
- Anadida creacion de resena tras visita completada.
- Anadida lista de favoritos con acceso rapido a ficha y accion de quitar favorito.
- Anadido perfil editable: nombre, apellidos, email, telefono y foto por URL.
- Anadidas preferencias de notificacion SMS/email.
- Anadida seccion de seguridad con sesion activa, salon de origen y cierre de sesion.
- Persistidos favoritos, reservas locales, perfil, preferencias y resenas en `localStorage`.
- Conectado el booking flow para que las reservas creadas aparezcan en cuenta.
- Anadido submenu de usuario en `Nav` cuando hay sesion activa.
- Actualizado `ROADMAP.md`: punto 3.4 completo y checks relacionados de Fase 2/Fase 3/P0/P1 sincronizados.

### Archivos modificados/anadidos
- `src/pages/Account.tsx`
- `src/lib/accountStore.ts`
- `src/pages/BookingFlow.tsx`
- `src/pages/SalonProfile.tsx`
- `src/components/Nav.tsx`
- `src/App.tsx`
- `src/index.css`
- `ROADMAP.md`
- `progreso.md`

### Validacion
- `npm.cmd run lint` OK.
- `npm.cmd run build` OK.

## 2026-06-05 - Booking flow, ROADMAP 3.3

### Hecho
- Creada la ruta real `/reservar/:salonSlug`.
- Anadido flujo de reserva en 6 pasos:
  - seleccion de servicio con precio y duracion,
  - seleccion de profesional, incluyendo "Cualquiera disponible",
  - calendario de disponibilidad desde API con fallback local,
  - seleccion de hora,
  - resumen y confirmacion,
  - pantalla final con localizador de reserva.
- Anadida reserva con sesion si existe; si no, reserva como invitado con nombre y telefono.
- Anadida entrada opcional de email y notas para el salon.
- Anadida capa `createBooking` con `Idempotency-Key`; si el backend no responde, devuelve confirmacion local pendiente.
- Anadida capa `listAvailability` para disponibilidad por salon/servicio/profesional con fallback.
- Anadida confirmacion de SMS/email como estado de respuesta/fallback.
- Anadida cancelacion desde pantalla de confirmacion.
- Extraido helper compartido `salonDetails` para servicios, profesionales, fechas y horarios.
- Actualizado `ROADMAP.md`: punto 3.3 completo y checks relacionados de Fase 2/P0 sincronizados.

### Archivos modificados/anadidos
- `src/pages/BookingFlow.tsx`
- `src/lib/bookingApi.ts`
- `src/lib/salonDetails.ts`
- `src/pages/SalonProfile.tsx`
- `src/App.tsx`
- `src/index.css`
- `ROADMAP.md`
- `progreso.md`

### Validacion
- `npm.cmd run lint` OK.
- `npm.cmd run build` OK.

## 2026-06-05 - Perfil de salon, ROADMAP 3.2

### Hecho
- Creada la ruta interna `/salones/:slug`.
- Sustituida la navegacion externa a `https://allop.es/salones/...` por navegacion interna con React Router.
- Anadida pagina de ficha de salon con:
  - galeria/carrusel de fotos,
  - header con portada, nombre, rating, direccion, badges y CTA de reserva,
  - lista de servicios con duracion y precio,
  - selector de fecha/hora y redireccion temporal de `/reservar/:salonSlug` al bloque `#reservar`,
  - profesionales,
  - resenas verificadas con paginacion incremental,
  - mapa con pin por coordenadas,
  - horarios,
  - telefono, URL canonica y enlace social,
  - tags/categorias,
  - favorito basico condicionado a sesion,
  - compartir ficha con Web Share API o copia de URL,
  - SEO por salon: title, description, Open Graph y canonical.
- Actualizado `ROADMAP.md`: punto 3.2 completo y checks relacionados de Fase 1/P0/arquitectura sincronizados.

### Archivos modificados/anadidos
- `src/pages/SalonProfile.tsx`
- `src/App.tsx`
- `src/index.css`
- `ROADMAP.md`
- `progreso.md`

### Validacion
- `npm.cmd run lint` OK.
- `npm.cmd run build` OK.
- Nota: `npm run ...` directo en PowerShell queda bloqueado por la politica local de ejecucion de scripts; se uso `npm.cmd`.
- `ROADMAP.md` actualizado con checks completados y notas de avance parcial del punto 3.1.

### Pendiente del punto 3.1
- Sin pendientes funcionales directos del punto 3.1.
- Decision futura: si se exige proveedor visual externo, conectar Google Maps o Mapbox con clave/configuracion. La vista actual usa pins calculados por coordenadas y no necesita API key.
- Decision futura: si backend pagina resultados, mover la paginacion progresiva local a paginacion API.

## 2026-06-05 - Cierre completo ROADMAP 3.1

### Hecho
- Anadida capa `listMarketplaceSalons` para cargar salones desde API publica y usar `SALONS` solo como fallback si la API falla.
- Anadido `AbortController` en la carga inicial de salones.
- Anadido debounce real de 250 ms para busqueda/autocompletado.
- Anadidas coordenadas `lat/lng` a los salones y recalculo de distancia cuando el usuario acepta geolocalizacion.
- Mejorada la vista mapa: los pins se posicionan desde coordenadas del salon, no desde posiciones fijas.
- Anadida seccion de resenas recientes en Home.
- Anadido banner promocional configurable desde datos.
- Anadidos estados `loading`, `empty` y aviso de fallback API en el marketplace.
- `ROADMAP.md` actualizado: punto 3.1 completo y resumen de Fase 1/P1 sincronizado.

### Archivos modificados/anadidos en esta tanda
- `src/lib/salonsApi.ts`
- `src/pages/Home.tsx`
- `src/data/salons.ts`
- `src/index.css`
- `ROADMAP.md`
- `progreso.md`

### Validacion
- `npm.cmd run lint` OK.
- `npm.cmd run build` OK.
