# Arquitectura frontend

Este documento fija la estructura objetivo para nuevas entregas de Allop Web. El codigo actual puede convivir con `src/pages`, `src/components` y `src/lib`, pero cualquier desarrollo nuevo debe seguir estas convenciones para que la migracion sea gradual y segura.

## Dominios

- `marketplace`: busqueda, filtros, fichas publicas, leads de marketplace, ciudades, servicios y contenido SEO comercial.
- `auth`: login, registro, OTP, sesiones de cliente y flujos OAuth.
- `booking`: disponibilidad, creacion de reservas, confirmacion, cancelacion y politicas visibles antes de reservar.
- `account`: area de cliente, historial, favoritos, perfil, privacidad, puntos y resenas.
- `business`: web B2B, alta self-service, billing, dashboard comercial, leads y onboarding de salones.
- `legal`: paginas legales, cookies, privacidad, terminos, RGPD y consentimiento.
- `shared`: codigo transversal sin ownership de producto: cliente API, cache, estados async, formateadores, hooks genericos, providers y utilidades puras.

La carpeta `src/domains` documenta el mapa de dominios. Cuando se migre codigo, cada dominio debe organizarse asi:

```text
src/domains/<domain>/
  pages/
  components/
  hooks/
  api/
  model/
  README.md
```

## Separacion de responsabilidades

- `pages`: ensamblan rutas, SEO y layout de alto nivel. Pueden leer hooks del dominio, pero no deben contener fetch directo.
- `components`: piezas visuales reutilizables dentro del dominio. Si se usan en dos dominios, se mueven a `shared`.
- `hooks`: estado de UI, efectos cancelables y adaptadores de datos para componentes.
- `api`: llamadas HTTP tipadas del dominio. Siempre pasan por `src/shared/apiClient.ts`.
- `model`: tipos, mappers y reglas puras del dominio.
- `shared`: no importa dominios. Los dominios si pueden importar `shared`.

## API y datos

- Usar `apiGet`, `apiPost` o `apiRequest` para todas las llamadas HTTP.
- Definir tipos de request/response cerca del dominio que los consume.
- Mantener fallbacks locales solo cuando protegen una experiencia ya definida.
- Usar `AbortController` en busqueda, disponibilidad, historial y cualquier peticion cancelable.
- Usar `cachedRequest` para consultas repetidas de solo lectura con TTL corto.
- Propagar errores normalizados (`ApiError`) hacia la UI y convertirlos a mensajes humanos en la pagina o hook.

## Estados async

Los flujos async deben hablar el mismo lenguaje:

```ts
type AsyncStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';
```

Usar `statusFromItems` para listados y los helpers de `src/shared/asyncState.ts` si el estado necesita guardar `data` y `error`.

## Formateadores

Usar `src/shared/formatters.ts` para moneda, duracion, distancia, fechas y telefonos. No crear `Intl` o normalizadores de telefono por pagina salvo que sea una regla exclusiva del dominio.

## Rutas

- Rutas publicas del marketplace: `/`, `/salones/:slug`, `/servicios/:slug`, `/ciudad/:slug` y combinaciones SEO definidas.
- Rutas de booking: `/reservar/:slug`.
- Rutas de cuenta: `/login`, `/register`, `/mi-cuenta/*`.
- Rutas business: `/business/*`.
- Rutas legales: slugs de `LEGAL_PAGES`.
- Cualquier ruta desconocida debe resolver a la pagina 404 real, no a redirect comodin a `/`.

## Nombres

- Componentes React en `PascalCase`.
- Hooks en `useCamelCase`.
- Funciones API con verbo: `list`, `get`, `create`, `update`, `delete`, `request`, `verify`.
- Tipos de dominio en singular y descriptivos: `BookingRequest`, `SubscriptionSnapshot`, `SalonOption`.
- Claves de cache con prefijo de dominio: `marketplace:salons`, `booking:availability:<path>`.
