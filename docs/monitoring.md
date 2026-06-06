# Analitica y monitorizacion

## Analitica privacy-first

- Proveedor elegido por defecto: Plausible.
- Variable publica: `VITE_PLAUSIBLE_DOMAIN`.
- Si no esta configurada, los eventos quedan en `localStorage` como fallback operativo.
- Eventos implementados:
  - `page_view`
  - `search`
  - `salon_click`
  - `booking_started`
  - `booking_completed`
  - `registration_completed`
  - `business_lead_submitted`
  - `plan_viewed`
  - `checkout_started`
  - `checkout_completed`
  - `checkout_abandoned`
  - `portal_opened`
  - `billing_webhook_synced`

## Captura de errores

- Variables opcionales:
  - `VITE_MONITORING_ENDPOINT`
  - `VITE_SENTRY_DSN`
- La app registra:
  - errores capturados por Error Boundary,
  - errores globales `window.error`,
  - promesas rechazadas sin manejar.
- Sin endpoint configurado, los ultimos errores quedan en `localStorage` bajo `allop.monitoring.errors`.

## Uptime VPS

- Monitor recomendado: UptimeRobot, Better Stack o Healthchecks.
- Checks minimos:
  - `https://allop.es/`
  - `https://allop.es/sitemap.xml`
  - `https://api.allop.es/health` cuando exista endpoint backend.
- Frecuencia recomendada: cada 1-5 minutos.
- Alertas:
  - email del equipo,
  - canal interno si existe,
  - incidencia si falla mas de 2 comprobaciones seguidas.

## Checklist post-deploy

- Confirmar que Plausible recibe pageviews.
- Probar evento `search` desde Home.
- Probar evento `booking_completed` con reserva fallback o backend.
- Forzar error controlado en staging para comprobar captura.
- Confirmar checks de uptime activos en VPS.
