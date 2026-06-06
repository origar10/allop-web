# Progreso allop-web

## 2026-06-06 - Correccion de busqueda en home

### Hecho
- Corregido el submit de busqueda del marketplace:
  - al pulsar "Buscar" ahora baja a la seccion de resultados,
  - si se lanza desde la barra superior tambien espera a que la home este renderizada,
  - el termino se normaliza con `trim()` y se aplica inmediatamente al filtro visible.
- Anclada la seccion de resultados con `id="marketplace-results"`.

### Archivos modificados
- `src/App.tsx`
- `src/pages/Home.tsx`
- `tests/e2e/marketplace-search.spec.ts`
- `progreso.md`

## 2026-06-06 - Apple Maps MapKit JS embebido

### Hecho
- Preparado backend `allop-platform` para generar tokens temporales MapKit JS:
  - nuevo endpoint `GET /api/mapkit/token`,
  - firma ES256 con `APPLE_MAPKIT_TEAM_ID`, `APPLE_MAPKIT_KEY_ID`, `APPLE_MAPKIT_MAPS_ID` y `.p8` por ruta o secret multilinea,
  - verificado localmente que genera un JWT valido usando la `.p8` de `origar` sin copiarla al repo.
- Integrado frontend `allop-web`:
  - nuevo `AppleMap` que carga MapKit JS desde Apple,
  - mapa embebido en la vista mapa de resultados,
  - mapa embebido en la ficha de salon,
  - fallback visual propio con pins si falla token/script,
  - enlaces "Abrir en Apple Maps" mantenidos como respaldo.
- Actualizada documentacion:
  - contrato `GET /v1/mapkit/token`,
  - CSP para permitir `cdn.apple-mapkit.com` y `*.apple-mapkit.com`,
  - `ROADMAP.md` marca MapKit JS como integrado.
- Protegido `allop-platform/backend/.gitignore` con `*.p8`.

### Datos Apple configurados
- Key ID: `A7H4DZK8HT`
- Team ID: `Y354LVE6F8`
- Maps ID: `maps.com.allop`

### Archivos modificados
- `allop-platform/backend/src/services/MapKitService.ts`
- `allop-platform/backend/src/controllers/MapKitController.ts`
- `allop-platform/backend/src/routes/mapkit.routes.ts`
- `allop-platform/backend/src/routes/index.ts`
- `allop-platform/backend/.env.example`
- `allop-platform/backend/.gitignore`
- `allop-web/src/components/AppleMap.tsx`
- `allop-web/src/lib/mapkitApi.ts`
- `allop-web/src/pages/Home.tsx`
- `allop-web/src/pages/SalonProfile.tsx`
- `allop-web/src/index.css`
- `allop-web/src/shared/apiContracts.ts`
- `allop-web/docs/api-contracts.md`
- `allop-web/docs/nginx-security-headers.md`
- `allop-web/ROADMAP.md`
- `allop-web/progreso.md`

### Pendiente de deploy
- Copiar la `.p8` al VPS, por ejemplo `/opt/allop/secrets/AuthKey_A7H4DZK8HT.p8`, con permisos restrictivos.
- Configurar en el backend del VPS:
  - `APPLE_MAPKIT_TEAM_ID=Y354LVE6F8`,
  - `APPLE_MAPKIT_KEY_ID=A7H4DZK8HT`,
  - `APPLE_MAPKIT_MAPS_ID=maps.com.allop`,
  - `APPLE_MAPKIT_ORIGIN=https://allop.es`,
  - `APPLE_MAPKIT_PRIVATE_KEY_PATH=/opt/allop/secrets/AuthKey_A7H4DZK8HT.p8`.

## 2026-06-06 - Correccion precio plan Basico

### Hecho
- Corregido Basico para que tenga precio cerrado:
  - mensual: 39 EUR/mes,
  - anual: 350 EUR/año.
- Ajustados limites de Basico:
  - hasta 7 empleados,
  - sin limite de reservas,
  - el usuario gestor puede crear cuentas para sus empleados.
- A medida queda como el unico tier con "Pedir presupuesto".
- El alta Basico vuelve a usar Stripe Checkout self-service, manteniendo fallback local si el backend aun no responde.
- Actualizados textos de la landing, pantalla de alta, pantalla de exito, `ROADMAP.md` y guia de self-service.

### Archivos modificados
- `src/lib/billingApi.ts`
- `src/pages/Business.tsx`
- `src/pages/BusinessSignup.tsx`
- `src/pages/BusinessBillingResult.tsx`
- `ROADMAP.md`
- `docs/stripe-self-service.md`
- `progreso.md`

## 2026-06-06 - Correccion deploy GitHub Actions health check

### Hecho
- Reproducido el fallo del job `deploy`: `npm run predeploy:health` fallaba con HTTP 404 en `https://api.allop.es/api/health`.
- Verificado que el endpoint operativo responde en `https://api.allop.es/health`.
- Ajustado `scripts/predeploy-health-check.mjs`:
  - si `VITE_API_URL` termina en `/api` o `/api/v1`, comprueba `/health` en el origen,
  - si una variable explicita viene con `/api/health` o `/api/v1/health`, la normaliza a `/health`.
- Actualizados defaults del workflow de GitHub Actions a:
  - produccion: `https://api.allop.es/health`,
  - staging: `https://staging-api.allop.es/health`.
- Actualizados `.env.example` y documentacion relacionada para evitar volver a copiar la URL antigua.

### Archivos modificados
- `.github/workflows/deploy.yml`
- `.env.example`
- `scripts/predeploy-health-check.mjs`
- `docs/cicd-entornos.md`
- `docs/backups.md`
- `docs/monitoring.md`
- `docs/release-checklist.md`
- `docs/runbook.md`
- `progreso.md`

### Validacion
- `npm.cmd run predeploy:health` OK con fallback automatico a `https://api.allop.es/health`.
- `VITE_HEALTH_CHECK_URL=https://api.allop.es/api/health npm.cmd run predeploy:health` OK, normalizado a `/health`.
- Revisado el run GitHub Actions `27063251832`: fallaba porque la variable ya correcta `https://api.allop.es/health` se transformaba por error en `https://api.allop.es/health/health`.
- Corregido `predeploy-health-check.mjs` para respetar URLs explicitas que ya terminan en `/health`.
- Validado tambien `VITE_HEALTH_CHECK_URL=https://api.allop.es/health npm.cmd run predeploy:health` OK.

## 2026-06-06 - Cambio de tiers B2B: Basico y A medida

### Hecho
- Sustituida la estructura de planes B2B por dos tiers:
  - `basic` / Basico,
  - `custom` / A medida.
- Basico se dejo inicialmente como presupuesto, corregido despues a 39 EUR/mes.
- Basico queda como alta self-service:
  - sin revision manual,
  - crea snapshot local de suscripcion activa,
  - redirige a la pantalla de exito con `selfService=1`.
- A medida abre solicitud de contrato por email a `soporte@origar.es`.
- Se mantiene compatibilidad con URLs antiguas:
  - `starter` se normaliza a `basic`,
  - `pro` y `scale` se normalizan a `custom`.
- Actualizados los tipos compartidos `BillingPlanId` a `basic | custom`.
- Actualizado el bloque de precios del `ROADMAP.md`.

### Archivos modificados
- `src/lib/billingApi.ts`
- `src/pages/Business.tsx`
- `src/pages/BusinessSignup.tsx`
- `src/pages/BusinessBillingResult.tsx`
- `src/shared/apiContracts.ts`
- `src/shared/dataModels.ts`
- `ROADMAP.md`
- `progreso.md`

## 2026-06-06 - Aplicacion de decisiones abiertas

### Hecho
- Procesadas las respuestas escritas en `ROADMAP.md`.
- Marcadas como decididas:
  - auth cliente global Allop, separada de salones Tier 2,
  - Apple Maps como proveedor geografico,
  - proveedor/proceso de mensajes igual al usado en Tier 2 con Raspberry Pi,
  - revision legal aplazada sin bloquear esta fase.
- Simplificada la pregunta de leads B2B:
  - ahora pregunta quien recibe los contactos de salones interesados y como se gestionan al principio.
- Ajustada sesion cliente:
  - `loadClientSession(slug)` acepta fallback a sesion global,
  - `getClientMe` intenta `/clientes/me` y cae al endpoint antiguo por salon si hace falta,
  - `getClientBookings` intenta `/clientes/me/reservas` y cae al endpoint antiguo por salon si hace falta.
- Integrado Apple Maps en marketplace:
  - cada salon en vista mapa tiene enlace externo "Abrir en Apple Maps",
  - se mantiene el mapa propio visual como fallback sin token,
  - preparada la nota de MapKit JS para cuando se necesite mapa embebido con token.
- Completados dos P0 pendientes:
  - creada pagina `/buscar` con URL compartible por query `q` y `ciudad`,
  - creado directorio indexable `/salones`,
  - añadido `/salones` al sitemap de salones,
  - añadido enlace al directorio en footer.

### Archivos modificados
- `ROADMAP.md`
- `progreso.md`
- `src/lib/platformApi.ts`
- `src/lib/clientSession.ts`
- `src/pages/Home.tsx`
- `src/pages/SearchResults.tsx`
- `src/pages/SalonsDirectory.tsx`
- `src/components/Footer.tsx`
- `src/index.css`
- `scripts/generate-sitemaps.mjs`
- `README.md`

### Validacion
- `npm.cmd run lint` OK.
- `npm.cmd run build` OK.
- `npm.cmd run test:unit` OK: 8 archivos, 16 tests.
- `npm.cmd run test:e2e` OK: 1 test Playwright Chromium.

## 2026-06-06 - Clarificacion de decisiones abiertas

### Hecho
- Reorganizada la seccion 7 de `ROADMAP.md`:
  - separadas decisiones ya tomadas por implementacion actual,
  - explicadas las decisiones que siguen pendientes,
  - anadidas opciones concretas e impacto de cada una para facilitar respuesta.
- Decisiones ya cerradas en roadmap:
  - reserva como invitado,
  - cobro inicial B2B con Stripe y reservas sin prepago,
  - Plausible privacy-first,
  - catalan incluido,
  - blog/contenido estatico inicial.
- Decisiones pendientes explicadas:
  - auth global vs auth vinculada a salon,
  - mapa propio vs Google Maps/Mapbox,
  - destino de leads B2B,
  - proveedor SMS/WhatsApp/email,
  - revision legal antes de publicar.

### Archivos modificados
- `ROADMAP.md`
- `progreso.md`

## 2026-06-06 - Fases de entrega recomendadas

### Hecho
- Avanzadas las fases del roadmap en orden:
  - Fase 0 completa: revisado y corregido mojibake visible en `src`; la comprobacion de patrones corruptos no devuelve coincidencias.
  - Fase 1 completa: añadidas landings de categoria con `/categoria/:slug`, enlaces desde Home y sitemap de categorias.
  - Fase 2 completa: añadido evento `booking_abandoned` para medir abandono junto a inicio, pasos y reserva completada.
  - Fase 3 completa: sincronizado el roadmap con exportacion/eliminacion de cuenta ya presentes en `Account.tsx`.
  - Fase 5 avanzada: blog/guias y paginas SEO locales marcadas como hechas; quedan visual regression, Lighthouse continuo y experimentos A/B.
- Añadida taxonomia de categorias:
  - `cabello`,
  - `belleza`,
  - `bienestar`.
- Extendida `SeoLanding` para soportar:
  - ciudad,
  - servicio,
  - servicio + ciudad,
  - categoria.
- Actualizado `scripts/generate-sitemaps.mjs` para generar `sitemap-categorias.xml`.
- Sincronizado el bloque P0/P1/P2 antiguo del roadmap con tareas ya completadas para evitar contradicciones internas.

### Archivos modificados/anadidos
- `src/lib/taxonomy.ts`
- `src/pages/SeoLanding.tsx`
- `src/App.tsx`
- `src/pages/Home.tsx`
- `src/lib/analytics.ts`
- `src/pages/BookingFlow.tsx`
- `scripts/generate-sitemaps.mjs`
- `README.md`
- `ROADMAP.md`
- `progreso.md`

### Validacion
- `npm.cmd run lint` OK.
- `npm.cmd run build` OK.
- `npm.cmd run test:unit` OK: 8 archivos, 16 tests.
- `npm.cmd run test:e2e` OK: 1 test Playwright Chromium.

## 2026-06-06 - Documentacion del proyecto, ROADMAP 4.20

### Hecho
- Revisado el avance existente: ROADMAP muestra 4.12 a 4.19 completados y `progreso.md` contiene entradas recientes de 4.15 a 4.19.
- Reescrito `README.md` para Allop:
  - descripcion del producto,
  - stack,
  - instalacion local,
  - scripts,
  - variables de entorno,
  - rutas principales,
  - modulos del frontend,
  - API/datos,
  - contenido/taxonomia,
  - deploy por GitHub Actions,
  - documentacion relacionada.
- Ampliado `.env.example` con:
  - `VITE_API_VERSION`,
  - `VITE_STATUS_URL`,
  - manteniendo `VITE_API_URL`, health check, Plausible, monitoring, Sentry y Google OAuth.
- Creada `docs/content-authoring.md` con instrucciones para:
  - anadir paginas legales,
  - anadir servicios/categorias,
  - anadir ciudades,
  - anadir salones semilla,
  - cuidar slugs y SEO,
  - validar cambios de contenido.
- Actualizado `ROADMAP.md`:
  - punto 4.20 completo,
  - tabla de fases con fecha, owner, estado y nota,
  - sincronizados checks de fase para README, `.env.example`, SEO base, API client, i18n y PWA.
- Corregidos fallos de lint detectados durante la revision:
  - cierre de menu movil diferido en `Nav.tsx`,
  - recarga de comunicaciones diferida en `Account.tsx`,
  - retirada de import sin uso en `BookingFlow.tsx`,
  - retirada de variable sin uso en `SalonProfile.tsx`.

### Archivos modificados/anadidos
- `README.md`
- `.env.example`
- `docs/content-authoring.md`
- `ROADMAP.md`
- `progreso.md`
- `src/components/Nav.tsx`
- `src/pages/Account.tsx`
- `src/pages/BookingFlow.tsx`
- `src/pages/SalonProfile.tsx`

### Validacion
- `npm.cmd run lint` OK.
- `npm.cmd run build` OK.

## 2026-06-06 - Operación y soporte, ROADMAP 4.19

### Hecho
- **Página `/estado`** (`SystemStatus.tsx`): muestra el estado de 6 servicios (API de reservas, OTP, búsqueda, pagos, panel, notificaciones). Hace un `GET /api/estado` y mapea la respuesta; si el endpoint no existe, muestra todos como "Operativo" (fallback). Link a URL externa (`VITE_STATUS_URL`) si está configurada. Ruta añadida en `App.tsx`.
- **`traceId` en errores críticos**: `captureError` en `monitoring.ts` ahora genera y devuelve un `traceId` (formato `TRC-{base36}-{rand}`). `ApiError` en `apiClient.ts` tiene campo `traceId` leído del header `X-Trace-Id` / `X-Request-Id` de la respuesta. `ErrorBoundary` muestra el traceId cuando captura un error, con link directo a `/contacto?motivo=error-tecnico&traza=...`. `BookingFlow` captura `ApiError` en `submitBooking`: si la API devuelve 4xx/5xx, muestra el mensaje de error + referencia + link "Contactar soporte". `bookingApi.ts` re-lanza `ApiError` con status (4xx/5xx) en lugar de caer al fallback local.
- **Localizador de reserva visible para soporte**: el localizador en la lista de reservas de `Account.tsx` ahora muestra el código en `<code>`, botón "Copiar" (con feedback "Copiado"), y link "Soporte" que lleva a `/contacto?motivo=soporte-reserva&localizador=ALP-XXXXX`.
- **Contact.tsx ampliado**: lee `?localizador=` y `?traza=` de la URL y pre-rellena el formulario. Nuevos motivos en el select: soporte-reserva, error-reserva, error-tecnico, reportar-reseña.
- **`docs/runbook.md`**: procedimientos para 5 incidencias (API caída, OTP caído, deploy fallido, VPS sin espacio, webhook Stripe falla). Comandos de diagnóstico y recuperación, tabla de severidad.
- **`docs/backups.md`**: política de backup de PostgreSQL (cron diario, remoto con rclone), procedimiento de restauración paso a paso, backup de variables de entorno con GPG, tabla RTO/RPO.
- **`docs/release-checklist.md`**: checklist de 3 fases — pre-merge (código, funcionalidad, seguridad), pre-deploy (build, BD, Stripe, SEO), post-deploy (verificación 5 min y 30 min). Sección de rollback rápido y checklist especial para lanzamientos públicos.

### Archivos modificados/añadidos
- `src/pages/SystemStatus.tsx` (nuevo)
- `src/lib/monitoring.ts` (generateTraceId, captureError devuelve traceId)
- `src/shared/apiClient.ts` (ApiError.traceId, leer X-Trace-Id/X-Request-Id del header)
- `src/lib/bookingApi.ts` (re-lanzar ApiError con status en lugar de siempre caer a fallback)
- `src/components/ErrorBoundary.tsx` (muestra traceId + link soporte)
- `src/pages/BookingFlow.tsx` (captura ApiError, muestra traceId con link soporte)
- `src/pages/Account.tsx` (localizador con código, botón copiar, link soporte)
- `src/pages/Contact.tsx` (pre-fill localizador/traza, nuevos motivos)
- `src/App.tsx` (ruta /estado)
- `src/index.css` (status-page, error-trace-id, booking-locator-row, btn-link-inline)
- `docs/runbook.md` (nuevo)
- `docs/backups.md` (nuevo)
- `docs/release-checklist.md` (nuevo)
- `ROADMAP.md` (4.19 completo)

---

## 2026-06-06 - Notificaciones y comunicación, ROADMAP 4.18

### Hecho
- **`NotificationPreferences` expandido**: añadidos `whatsapp`, `confirmaciones`, `recordatorios`, `cancelaciones`, `novedades`, `ofertas`. Compatibilidad retroactiva con valores guardados en localStorage (merge con defaults).
- **`CommsHistoryEntry`** + funciones de store: `loadCommsHistory`, `addCommsHistoryEntry` (máx. 50 entradas, keyed con timestamp+random). Exportación e eliminación de datos incluye el historial.
- **`notificationTemplates.ts`** (nuevo): helpers `getActiveChannels`, `describeChannels`, `getConfirmationChannels`, `getReminderChannels`, `getCancellationChannels`, `confirmationChannelSummary`, `reminderChannelSummary`. Plantillas de texto para SMS y Email por evento (`confirmacion`, `recordatorio_24h`, `recordatorio_2h`, `cancelacion`) en español — documentan lo que el backend enviaría.
- **BookingFlow paso 5**: bloque visual "notification preview" con chips de canal activo (SMS/email/WhatsApp) y texto "Recibirás confirmación por..." calculado dinámicamente desde las preferencias. Link "Cambiar preferencias" → `/mi-cuenta/perfil`.
- **BookingFlow paso 6 confirmación**: muestra recordatorio "Recibirás recordatorios por... 24h y 2h antes" si `recordatorios` activo. Muestra "Notificación de cancelación enviada por..." si se cancela con `cancelaciones` activo.
- **Historial de comunicaciones**: tras completar reserva, se añade entrada `confirmacion` al historial por cada canal activo. Tras cancelar, entrada `cancelacion`. Sidebar del BookingFlow usa `confirmationChannelSummary` dinámicamente.
- **Preferencias granulares en Account (`/mi-cuenta/perfil`)**: sección expandida con 3 grupos — Canales (SMS, email, WhatsApp), Transaccionales (confirmaciones, recordatorios, cancelaciones), Novedades y ofertas (novedades, ofertas). Separación clara transaccional vs comercial.
- **Tab `Comunicaciones` en `/mi-cuenta`**: nueva vista `comunicaciones` con historial de todos los mensajes enviados, agrupado por evento y canal con chips de color (azul SMS, violeta email, verde WhatsApp). Nota de uso para soporte con localizador.

### Archivos modificados/añadidos
- `src/lib/accountStore.ts` (NotificationPreferences expandida, CommsHistoryEntry, COMMS_KEY, loadCommsHistory, addCommsHistoryEntry, exportAccountData+deleteAccountData actualizados)
- `src/lib/notificationTemplates.ts` (nuevo)
- `src/pages/BookingFlow.tsx` (notification preview en paso 5, reminder/cancel info en paso 6, addCommsHistoryEntry en confirm y cancel, sidebar dinámico)
- `src/pages/Account.tsx` (tab comunicaciones, historial, prefs granulares 3 grupos)
- `src/index.css` (booking-notif-preview, booking-notif-chip, prefs-group*, comms-history-*, comms-channel-chip*)
- `ROADMAP.md` (4.18 completo)

---

## 2026-06-06 - Reseñas, reputación y confianza, ROADMAP 4.17

### Hecho
- **Distribución de estrellas con filtro**: en la sección de reseñas de `SalonProfile.tsx` se muestra una visualización de barras con el reparto estimado de 5★ a 1★ calculado algorítmicamente desde `rating` y `reviews`. Cada barra es un botón que filtra las reseñas visibles por esa puntuación (`filterRating` state); se puede quitar con "Quitar filtro".
- **Respuesta pública del salón**: si una reseña tiene `ownerReply`, se muestra debajo con borde izquierdo de acento, icono `MessageSquare` y fecha. Modelo de datos añadido en `RecentReview.ownerReply`. El backend ya tenía el campo `respuesta_salon` y el endpoint `PATCH /api/salon/reviews/:id/respuesta`.
- **Reporte de reseñas**: cada reseña tiene un enlace "Reportar" (icono `Flag`) que lleva a `/contacto?motivo=reportar-resena&resena={id}`. El backend ya tenía moderación por estado (PUBLICADA/OCULTA).
- **Badges de confianza**: franja de trust badges en el hero del perfil: "Reserva segura", "Reseñas verificadas", "Cancelación flexible" y "Salón verificado" (si `verified`). Estilo neutro con variante accent para verificado.
- **Promociones con fechas en sidebar**: si el salón tiene promociones, aparece una sección en el sidebar con cada promo mostrando título, descripción, badge "Activa"/"Próximamente", porcentaje de descuento si aplica, rango de fechas formateado y condiciones. `isActivePromotion` compara contra la fecha de hoy. Helpers `formatPromotionDate` y `computeRatingDistribution` añadidos como funciones puras.
- **Política de cancelación**: si `salon.cancelPolicy` existe, aparece como sección en el sidebar (antes del pago) con el texto completo. Visible antes de confirmar reserva.
- **Información de pago/cobro**: sección fija en sidebar con: "El pago se gestiona de forma segura a través de Allop", "Se acepta tarjeta, débito y Google/Apple Pay", "Solo se carga el importe una vez completada la reserva".
- **Solo reseñas tras reserva completada**: ya estaba implementado vía `canReview` en `Account.tsx`; marcado como hecho.

### Archivos modificados
- `src/pages/SalonProfile.tsx` (distribución estrellas, filtro, respuesta salón, reporte, trust badges, promociones, cancelPolicy, pago; helpers `computeRatingDistribution`, `isActivePromotion`, `formatPromotionDate`)
- `src/data/salons.ts` (interfaz `Promotion`, `promotions` y `cancelPolicy` en `Salon`, `ownerReply` en `RecentReview`, datos de Feromi)
- `src/index.css` (`.trust-badges`, `.rating-distribution/*`, `.review-owner-reply`, `.review-actions`, `.review-report-link`, `.promo-card*`, `.cancel-policy-text`, `.payment-info-list`, `.profile-reviews-empty`)
- `ROADMAP.md` (4.16 y 4.17 completos)

---

## 2026-06-06 - Producto y conversión, ROADMAP 4.16

### Hecho
- **Embudo cliente trackeado**: `BookingFlow.tsx` ahora dispara `booking_step` en cada avance de paso (se registra el paso destino), `booking_cancelled` al cancelar desde la confirmación. Antes solo se registraban `booking_started` y `booking_completed`.
- **Recuperación de reserva abandonada**: el estado del flujo de reserva (step, servicio, profesional, fecha, hora) se persiste en `sessionStorage` con clave `booking_draft_{salonSlug}` a partir del paso 2. Al volver a la URL de reserva, el flujo retoma desde el último punto. La sesión se elimina al completar o cancelar.
- **Deep links por servicio**: `/reservar/{salonSlug}?service={serviceId}` pre-selecciona el servicio. Añadido botón "Reservar" por servicio en la sección de servicios de `SalonProfile.tsx` que genera el deep link correspondiente.
- **Sistema de patrocinados**: añadido campo `promoted?: boolean` a la interfaz `Salon`. El salón Feromi marcado como demo (`promoted: true`). `SalonCard.tsx` muestra etiqueta "Patrocinado" en gris neutro cuando el campo es true — estilo claramente diferenciado de los badges de estado (verde).
- **CTA contextual en footer**: botón "Soy un salón — empieza gratis" añadido en la sección de marca del footer de clientes (`Footer.tsx`). Con traducción al catalán.
- **Embudos documentados** (implícito en código): el embudo cliente (búsqueda → ficha → reservar → confirmación) y el embudo salón (landing → lead → billing) están trazados con eventos de analytics en BookingFlow y Business.

### Pendiente de 4.16
- [ ] Promociones por salón con fecha de inicio/fin y condiciones (requiere modelo de datos en backend)

### Archivos modificados/añadidos
- `src/lib/analytics.ts` (eventos `booking_step`, `booking_cancelled`)
- `src/data/salons.ts` (campo `promoted`, Feromi marcado)
- `src/components/SalonCard.tsx` (badge Patrocinado)
- `src/components/Footer.tsx` (CTA footer cliente)
- `src/lib/translations.ts` (clave `footer.salonCta` en es/ca)
- `src/pages/BookingFlow.tsx` (deep link, draft save/restore, step tracking, cancel tracking)
- `src/pages/SalonProfile.tsx` (botón Reservar por servicio con deep link)
- `src/index.css` (.salon-promoted, .salon-promoted-label, .footer-cta, .services-list-actions)
- `ROADMAP.md` (4.16 ítems marcados)

---


## 2026-06-06 - Diseño y sistema visual, ROADMAP 4.15

### Hecho
- Añadidos tokens de spacing (`--sp-1` a `--sp-16`) y z-index (`--z-popover`, `--z-dropdown`, `--z-nav`, `--z-modal`, `--z-cookie`, `--z-toast`) a `:root` en `index.css`.
- Todos los z-index hardcodeados en CSS ahora usan los tokens (nav, user-menu, search-suggestions, cookie-banner, toast-region, modal-backdrop).
- Añadidos estados de error de input: `.input-error` (borde rojo + shadow) y `.field-error` (mensaje de error en rojo).
- Añadido botón hamburger en `Nav.tsx`: visible solo en ≤980px; muestra/oculta un drawer con los enlaces de nav (`/#buscar`, `/#como-funciona`, `Para salones`). Se cierra automáticamente al cambiar de ruta.
- Animación `drawerIn` para el menú móvil (fade + translateY). En ≤720px el hamburger se empuja al extremo derecho con `margin-left: auto`.
- Creado `docs/icon-guide.md` con tabla de todos los iconos lucide-react usados en el proyecto, categorizados por contexto.
- Añadidas clases utilitarias `.card`, `.badge` / `.badge-success` / `.badge-neutral` / `.badge-accent` para nuevos componentes. Normalizado padding de `.account-metrics article` a 20px. Añadida `box-shadow` y `radius-lg` a `.business-includes-list article`.
- Añadido `.btn-sm` (height: 30px) para acciones secundarias compactas.
- Añadida clase `.confirm-row` para confirmaciones inline — elimina los `window.confirm()` nativos:
  - `BookingFlow.tsx`: "Cancelar reserva" ahora muestra botones "Sí, cancelar / No" inline.
  - `Account.tsx` > BookingList: cada "Cancelar" reserva muestra "¿Cancelar? Sí / No" inline.
  - `Account.tsx` > Privacy: "Eliminar mi cuenta" muestra "¿Eliminar todos los datos locales? Sí, eliminar / Cancelar".
- Corregido typo "Error de aplicacion" → "aplicación" en `ErrorBoundary.tsx`. Mejorado el copy del mensaje de error.
- Corregido `aria-label="Estado del salon"` → "salón" en `SalonCard.tsx`.
- Corregidos typos en textos de Account.tsx ("informacion" → "información", "supresion" → "supresión").
- Añadidos `overflow: hidden; text-overflow: ellipsis` a `.btn` (base), `.services-list strong` y `.account-nav a` (en 980px) para evitar desbordamiento en contenedores acotados.
- `.btn` ahora incluye `overflow: hidden; text-overflow: ellipsis` para que los botones con `width: 100%` en mobile no desborden.

### Archivos modificados/añadidos
- `src/index.css` (tokens, hamburger/drawer, .input-error, .field-error, .card, .badge-*, .btn-sm, .confirm-row, overflow fixes)
- `src/components/Nav.tsx` (hamburger, mobile drawer)
- `src/components/ErrorBoundary.tsx` (typo + copy)
- `src/components/SalonCard.tsx` (aria-label)
- `src/pages/Account.tsx` (inline confirms, typos)
- `src/pages/BookingFlow.tsx` (inline confirm)
- `docs/icon-guide.md` (nuevo)
- `ROADMAP.md` (4.15 completo)

---

## 2026-06-06 - Seguridad frontend, ROADMAP 4.14

### Hecho
- Creado `src/lib/validation.ts` con validadores puros y reutilizables:
  - `validateEmail`, `validatePhone` (opcional), `validateName`, `validateFreeText`, `validateTaxId`, `validateLocator`.
  - `sanitizeText`: elimina etiquetas HTML antes de renderizar contenido de terceros.
  - `firstError`: recoge el primer error de una lista de resultados para simplificar flujos de submit.
- Actualizado `src/shared/apiClient.ts`: HTTP 429 produce `ApiError` con `code: 'RATE_LIMITED'` y extrae `Retry-After`; el resto de errores no cambia.
- Añadido campo honeypot (oculto para humanos, visible para bots) a `Contact.tsx` y `BusinessSignup.tsx`; los envíos con honeypot se descartan silenciosamente.
- Sustituida validación manual básica en `Contact.tsx` y `BusinessSignup.tsx` por `firstError` + validadores de `validation.ts`.
- Añadido `npm audit --audit-level=high` al job `quality` de `.github/workflows/deploy.yml` — falla la build si hay vulnerabilidades altas o críticas.
- Creado `docs/nginx-security-headers.md` con configuración lista para pegar en nginx:
  - `Strict-Transport-Security` (HSTS 1 año, sin includeSubDomains ni preload aún).
  - `X-Frame-Options: DENY`.
  - `X-Content-Type-Options: nosniff`.
  - `Referrer-Policy: strict-origin-when-cross-origin`.
  - `Permissions-Policy`: solo cámara y geolocalización (self).
  - `Content-Security-Policy`: default-src self, script-src con Plausible, img-src con Cloudinary, connect-src con API/Sentry/Plausible, form-action con Stripe Checkout.
  - Notas explicativas por directiva y comando de verificación con curl.

### Archivos modificados/añadidos
- `src/lib/validation.ts` (nuevo)
- `src/shared/apiClient.ts` (manejo de 429)
- `src/pages/Contact.tsx` (honeypot + validadores)
- `src/pages/BusinessSignup.tsx` (honeypot + validadores)
- `.github/workflows/deploy.yml` (npm audit en CI)
- `docs/nginx-security-headers.md` (nuevo)
- `ROADMAP.md` (4.14 marcado completo)

### Backend completado (en allop-platform)
- Creada entidad `StripeWebhookEvent` (tabla `stripe_webhook_event`): PK = `stripe_event_id` → idempotencia a nivel de BD.
- Actualizado `StripeService.ts`: añadidos `constructWebhookEvent`, `crearCheckoutSession`, `crearPortalSession`, `obtenerSuscripcion`.
- Nuevo `StripeWebhookController.ts`:
  - Lee body como `Buffer` (raw) y llama a `stripe.webhooks.constructEvent` — rechaza con 400 si la firma no coincide.
  - Consulta `StripeWebhookEvent` antes de procesar; si ya existe, responde 200 sin reprocesar.
  - Maneja `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
  - Guarda el evento en BD solo si el procesamiento completa sin error; si falla, devuelve 500 para que Stripe reintente.
- Nuevo `BillingController.ts`: `crearCheckoutSession` (público), `crearPortalSession` (auth), `obtenerSuscripcion` (auth).
- Nueva `billing.routes.ts` con rutas `/billing/checkout-sessions`, `/billing/customer-portal`, `/billing/subscription`.
- Actualizado `index.ts`: `/api/billing/webhooks/stripe` se monta con `express.raw()` antes de `express.json()`.
- Registrada `StripeWebhookEvent` en `data-source.ts`.

---

## 2026-06-06 - Modelo de datos mínimo, ROADMAP 4.13

### Hecho
- Creado `src/shared/dataModels.ts` con las 14 entidades completas del dominio:
  - `Salon` (con `SalonStatus`, `SalonCategory`, `HorarioSemana`).
  - `SalonMedia` (con `MediaEstado`).
  - `Service`.
  - `Professional` (con `DiaSemana`, `ProfessionalScheduleDay`).
  - `AvailabilitySlot`.
  - `Booking` (con `BookingEstado`, `BookingOrigen`, `CancellationPolicy`).
  - `Client` (con `TierFidelizacion`, `ClientNotificationPreferences`).
  - `Review` (con `ReviewEstado`).
  - `Favorite`.
  - `BusinessLead` (con `LeadEstadoCRM`).
  - `Plan` (con `PlanLimits`).
  - `Subscription` (con `SubscriptionStatus`, `ActivationState`).
  - `Invoice` (con `InvoiceEstado`).
  - `BillingProfile`.
- Distincion clara respecto a `apiContracts.ts`: dataModels.ts contiene entidades de dominio completas; apiContracts.ts contiene formas HTTP.
- Creado `docs/data-models.md` con:
  - Mapa ASCII de relaciones entre entidades.
  - Tabla completa de campos por entidad con tipo y descripcion.
  - Maquinas de estados de Booking y Subscription.
  - Tabla de modulos bloqueados por plan y estado de suscripcion.
  - Invariante critica de Review (solo tras reserva completada, una por reserva).
  - Tabla de claves de localStorage del frontend.
- Actualizado `ROADMAP.md`: punto 4.13 completo.

### Archivos modificados/anadidos
- `src/shared/dataModels.ts`
- `docs/data-models.md`
- `ROADMAP.md`
- `progreso.md`

### Validacion
- `npm.cmd run lint` OK.
- `npm.cmd run build` OK.
- Nota: `dataModels.ts` es una capa de tipos puros (solo interfaces/types). No introduce runtime ni dependencias.

## 2026-06-06 - Contratos de API y backend, ROADMAP 4.12

### Hecho
- Creado `src/shared/apiContracts.ts` como fuente de verdad de todos los tipos HTTP:
  - Auth cliente: OtpRequest/Response, OtpVerify/Response, ClientRegister/Login, ClientAuthResponse, ClientProfileV1.
  - Marketplace: MarketplaceSearchParams, MarketplaceSalonItem, SalonDetail, HorarioSemana, ServiceItem, ProfessionalItem, SalonPhoto, ReviewItem.
  - Disponibilidad: AvailabilityQuery, AvailabilitySlot.
  - Reservas: CreateBookingBody, BookingConfirmationV1, ClientBookingItem, BookingEstado, CancelBooking, CreateReview.
  - Favoritos: FavoritesResponse, AddFavoriteBody, FavoriteResponse.
  - Leads B2B: BusinessLeadBody, BusinessLeadResponse.
  - Billing/Stripe: BillingPlanId, BillingInterval, SubscriptionStatus, BillingProfileBody, CheckoutSessionBody/Response, CustomerPortalResponse, SubscriptionSnapshotV1, StripeWebhookEventType.
  - Comunes: ApiErrorBody, PaginatedResponse.
- Creado `docs/api-contracts.md` con documentacion completa de los 16 endpoints:
  - Auth (5 endpoints), Salones/marketplace (2), Disponibilidad (1), Reservas (4), Favoritos (3), Leads B2B (1), Billing/Stripe (4).
  - Tabla de codigos de error comunes.
  - Estrategia de versionado `/api/v1/` con politica de deprecacion (90 dias de soporte paralelo).
  - Tabla de rutas legacy vs v1 para guiar la migracion backend.
  - Seccion de seguridad: OTP rate limit, JWT scope, CORS, webhook idempotencia.
- Actualizado `ROADMAP.md`: punto 4.12 completo.

### Archivos modificados/anadidos
- `src/shared/apiContracts.ts`
- `docs/api-contracts.md`
- `ROADMAP.md`
- `progreso.md`

### Validacion
- `npm.cmd run lint` OK.
- `npm.cmd run build` OK.
- Nota: `apiContracts.ts` es una capa de tipos puros (solo interfaces/types); no introduce runtime. Los archivos lib/* que ya tienen sus propios tipos internos pueden migrar progresivamente a importar desde aqui.

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
