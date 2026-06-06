# CI/CD y entornos

## Ramas y despliegue

- `main` o `master`: build de produccion y despliegue a `/opt/allop/platform/web`.
- `staging`: build de staging y despliegue a `/opt/allop/platform/web-staging`.
- Pull requests contra `main`, `master` o `staging`: ejecutan calidad (`lint`, `test:unit`, `build`) sin desplegar.
- `workflow_dispatch`: permite lanzar el workflow manualmente desde GitHub Actions.

## Variables publicas por entorno

Configurar en GitHub Actions como repository/environment variables:

| Variable | Produccion | Staging | Uso |
|---|---|---|---|
| `VITE_API_URL_PRODUCTION` | `https://api.allop.es/api` | - | API publica para build de produccion |
| `VITE_API_URL_STAGING` | - | `https://staging-api.allop.es/api` | API publica para build de staging |
| `VITE_HEALTH_CHECK_URL_PRODUCTION` | `https://api.allop.es/health` | - | Health check antes de desplegar produccion |
| `VITE_HEALTH_CHECK_URL_STAGING` | - | `https://staging-api.allop.es/health` | Health check antes de desplegar staging |
| `VITE_PLAUSIBLE_DOMAIN_PRODUCTION` | `allop.es` | - | Analitica Plausible en produccion |
| `VITE_PLAUSIBLE_DOMAIN_STAGING` | - | `staging.allop.es` | Analitica de staging si se quiere separar |
| `VITE_MONITORING_ENDPOINT_PRODUCTION` | opcional | - | Endpoint frontend de errores |
| `VITE_MONITORING_ENDPOINT_STAGING` | - | opcional | Endpoint frontend de errores en staging |
| `VPS_WEB_TARGET_PRODUCTION` | `/opt/allop/platform/web` | - | Ruta de deploy en VPS |
| `VPS_WEB_TARGET_STAGING` | - | `/opt/allop/platform/web-staging` | Ruta de preview/staging en VPS |

Si una variable no esta definida, el workflow usa los valores por defecto anteriores.

## Secrets

Configurar como secrets:

- `VPS_SSH_KEY`
- `VPS_SSH_PASSPHRASE`
- `VITE_SENTRY_DSN_PRODUCTION` si se usa Sentry
- `VITE_SENTRY_DSN_STAGING` si se usa Sentry en staging

## Health check predeploy

El paso `npm run predeploy:health` ejecuta `scripts/predeploy-health-check.mjs`.

- Usa `VITE_HEALTH_CHECK_URL` si esta definida.
- Si no esta definida, comprueba `/health` en el origen de `VITE_API_URL` cuando la API publica usa `/api`; en otros casos comprueba `${VITE_API_URL}/health`.
- Falla el deploy si el endpoint no responde con HTTP 2xx antes de copiar `dist/` al VPS.

## Desarrollo local

- Copiar `.env.example` a `.env.local`.
- Ajustar `VITE_API_URL` si se quiere apuntar a staging o a una API local.
- Los secretos reales no deben guardarse en archivos `.env` del frontend.
