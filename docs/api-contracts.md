# API Contracts — allop-web ↔ api.allop.es

> Fuente de verdad de los contratos HTTP entre el frontend y la API.  
> Los tipos TypeScript canónicos viven en `src/shared/apiContracts.ts`.  
> Este documento es la referencia legible para backend, frontend y QA.

---

## Convenciones generales

| Concepto | Valor |
|---|---|
| Base URL | `https://api.allop.es/api` (configurable via `VITE_API_URL`) |
| Versión actual | `/v1/` |
| Content-Type | `application/json` |
| Auth cliente | `Authorization: Bearer <token>` |
| Auth salón (B2B) | `Authorization: Bearer <token>` (scope diferente) |
| Idempotencia | Header `Idempotency-Key: <uuid>` en mutaciones críticas |
| Paginación | Query params `page` (1-based) y `perPage` (default 20) |
| Errores | `{ message, error?, code?, details? }` |
| Fechas | ISO 8601 (`YYYY-MM-DD`, `HH:MM`, o datetime completo) |

### Estrategia de versionado

- Todas las rutas nuevas usan prefijo `/v1/`.
- Las rutas legacy (`/salones/:slug/auth/...`) se mantienen hasta migración completada.
- Cambios breaking → nueva versión (`/v2/`) con deprecación explícita en cabecera `Deprecation`.
- El frontend lee el prefijo de versión de `VITE_API_VERSION` (default `v1`).

### Códigos de error comunes

| HTTP | `code` | Significado |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Parámetros inválidos |
| 401 | `UNAUTHORIZED` | Token ausente o inválido |
| 403 | `FORBIDDEN` | Token válido pero sin permiso |
| 404 | `NOT_FOUND` | Recurso no existe |
| 409 | `CONFLICT` | Recurso ya existe / reserva duplicada |
| 422 | `UNPROCESSABLE` | Lógica de negocio fallida (slot no disponible, etc.) |
| 429 | `RATE_LIMITED` | Límite de peticiones superado |
| 500 | `INTERNAL_ERROR` | Error interno (loggear con traceId) |

---

## 1. Auth cliente

### `POST /v1/auth/cliente/otp/request`

Solicita un código OTP por SMS.

**Body**
```json
{ "telefono": "+34612345678", "purpose": "LOGIN" }
```
`purpose`: `"LOGIN"` | `"REGISTER"`

**Response 200**
```json
{
  "challengeId": 1234,
  "expiresInSeconds": 300,
  "channel": "sms",
  "debugCode": "123456"   // solo en staging/dev
}
```

**Errores**
- `429` — demasiados intentos de OTP para ese teléfono (rate limit: 3 por hora)

---

### `POST /v1/auth/cliente/otp/verify`

Verifica el código recibido y devuelve un `verificationToken` de un solo uso.

**Body**
```json
{
  "challengeId": 1234,
  "telefono": "+34612345678",
  "code": "123456",
  "purpose": "LOGIN"
}
```

**Response 200**
```json
{ "verificationToken": "vtk_...", "expiresInSeconds": 120 }
```

---

### `POST /v1/auth/cliente/register`

Crea la cuenta de cliente usando el `verificationToken`.

**Body**
```json
{
  "nombre": "María",
  "apellidos": "García",
  "email": "maria@example.com",
  "telefono": "+34612345678",
  "verificationToken": "vtk_...",
  "consentimientoRGPD": true
}
```

**Response 201**
```json
{
  "token": "eyJ...",
  "expiresAt": "2026-12-31T23:59:59Z",
  "cliente": { "id": 42, "nombre": "María", ... }
}
```

---

### `POST /v1/auth/cliente/login`

Inicia sesión con el `verificationToken`.

**Body**
```json
{ "telefono": "+34612345678", "verificationToken": "vtk_..." }
```

**Response 200** — igual que `/register`

---

### `GET /v1/clientes/me`

Devuelve el perfil del cliente autenticado.

**Auth**: `Bearer <token>` obligatorio

**Response 200**
```json
{
  "id": 42,
  "nombre": "María",
  "apellidos": "García",
  "email": "maria@example.com",
  "telefono": "+34612345678",
  "puntosFidelizacion": 120,
  "sesionesFidelizacion": 8,
  "cortesGratisDisponibles": 1,
  "tierFidelizacion": "plata",
  "consentimientoRGPD": true,
  "fechaRegistro": "2026-01-15T10:00:00Z"
}
```

> **Nota**: este endpoint es global (no depende de `salonSlug`). La sesión unificada evita que el cliente tenga que elegir salón al autenticarse.

---

## 2. Salones — marketplace

### `GET /v1/salones`

Búsqueda paginada con filtros.

**Query params**

| Param | Tipo | Descripción |
|---|---|---|
| `q` | string | Texto libre (nombre, categoría, tags) |
| `ciudad` | string | Ciudad o barrio |
| `categoria` | string | `peluqueria` \| `barberia` \| `estetica` \| `unas` \| `masajes` \| `maquillaje` |
| `precioMax` | number | Precio máximo desde (EUR) |
| `ratingMin` | number | Rating mínimo (1–5) |
| `lat` | number | Latitud para distancia |
| `lng` | number | Longitud para distancia |
| `disponibilidad` | string | `hoy` \| `manana` \| `semana` |
| `orden` | string | `recomendados` \| `rating` \| `precio` \| `distancia` \| `disponibilidad` |
| `page` | number | Página (default 1) |
| `perPage` | number | Resultados por página (default 20, max 50) |

**Response 200**
```json
{
  "items": [
    {
      "id": "1",
      "slug": "feromi",
      "nombre": "Feromi",
      "categoria": "Peluquería",
      "ciudad": "Rubí",
      "direccion": "Carrer de l'Anoia, 12",
      "lat": 41.4922,
      "lng": 2.0333,
      "distancia": 1.2,
      "rating": 4.8,
      "reviews": 132,
      "precioDesde": 18,
      "telefono": "+34937865432",
      "descripcion": "...",
      "imageUrl": "https://...",
      "nextSlot": "Hoy 16:00",
      "badges": ["verificado", "abre_ahora"],
      "tags": ["Corte", "Color", "Mechas"],
      "verified": true,
      "featured": false
    }
  ],
  "total": 48,
  "page": 1,
  "perPage": 20,
  "hasMore": true
}
```

---

### `GET /v1/salones/:slug`

Detalle completo de un salón para su ficha pública.

**Response 200**
```json
{
  "id": "1",
  "slug": "feromi",
  "nombre": "Feromi",
  "categoria": "Peluquería",
  "ciudad": "Rubí",
  "direccion": "Carrer de l'Anoia, 12",
  "lat": 41.4922,
  "lng": 2.0333,
  "rating": 4.8,
  "reviews": 132,
  "precioDesde": 18,
  "telefono": "+34937865432",
  "descripcion": "Breve descripción.",
  "descripcionLarga": "...",
  "verified": true,
  "featured": false,
  "tags": ["Corte", "Color"],
  "badges": ["verificado"],
  "horarios": {
    "lunes": "09:00–20:00",
    "martes": "09:00–20:00",
    "sabado": "09:00–14:00",
    "domingo": null
  },
  "servicios": [
    { "id": "svc1", "nombre": "Corte de pelo", "duracion": 45, "precio": 18, "activo": true }
  ],
  "profesionales": [
    { "id": "pro1", "nombre": "Ana García", "foto": "https://...", "activo": true }
  ],
  "fotos": [
    { "id": "f1", "url": "https://...", "alt": "Interior Feromi", "esPortada": true, "orden": 0 }
  ],
  "resenas": [ ... ],
  "resenaTotal": 132,
  "distribucionEstrellas": { "5": 98, "4": 24, "3": 8, "2": 2, "1": 0 },
  "seoTitle": "Feromi — Peluquería en Rubí | Allop",
  "seoDescription": "...",
  "canonicalUrl": "https://allop.es/salones/feromi",
  "redesSociales": { "instagram": "https://instagram.com/feromi" }
}
```

---

## 3. Disponibilidad

### `GET /v1/salones/:slug/disponibilidad`

**Query params**

| Param | Tipo | Descripción |
|---|---|---|
| `serviceId` | string | ID del servicio |
| `professionalId` | string | ID del profesional (`any` o ausente = cualquiera) |
| `desde` | string | YYYY-MM-DD (default: hoy) |
| `hasta` | string | YYYY-MM-DD (default: +14 días) |

**Response 200**
```json
[
  {
    "id": "2026-06-10",
    "label": "Mar 10 jun",
    "times": ["10:00", "10:30", "11:00", "15:30"]
  },
  {
    "id": "2026-06-11",
    "label": "Mié 11 jun",
    "times": ["09:00", "12:00"]
  }
]
```

---

## 4. Reservas

### `POST /v1/reservas`

Crea una reserva. Requiere header `Idempotency-Key` para garantizar exactamente una reserva por intento.

**Headers**: `Idempotency-Key: <uuid-v4>`  
**Auth**: `Bearer <token>` opcional (guest si ausente)

**Body**
```json
{
  "salonSlug": "feromi",
  "serviceId": "svc1",
  "professionalId": null,
  "date": "2026-06-10",
  "time": "10:00",
  "clientName": "María García",
  "phone": "+34612345678",
  "email": "maria@example.com",
  "notes": "Prefiero tinte natural"
}
```

**Response 201**
```json
{
  "id": "rsv_abc123",
  "locator": "ALP-ABC123",
  "status": "pending",
  "message": "Reserva recibida. El salón confirmará la disponibilidad en breve.",
  "notification": "SMS enviado a +34612345678",
  "cancelUrl": "https://allop.es/reservas/rsv_abc123/cancelar"
}
```

**Errores**
- `409` — reserva duplicada (mismo `Idempotency-Key`)
- `422` — slot ya no disponible

---

### `GET /v1/clientes/me/reservas`

Lista todas las reservas del cliente en todos los salones.

**Auth**: `Bearer <token>` obligatorio  
**Query params**: `estado` (filtro opcional), `page`, `perPage`

**Response 200**
```json
{
  "items": [
    {
      "id": "rsv_abc123",
      "locator": "ALP-ABC123",
      "estado": "confirmada",
      "fechaHoraInicio": "2026-06-10T10:00:00",
      "fechaHoraFin": "2026-06-10T10:45:00",
      "salon": { "slug": "feromi", "nombre": "Feromi", "ciudad": "Rubí" },
      "servicio": { "id": "svc1", "nombre": "Corte de pelo", "precio": 18 },
      "profesional": { "id": "pro1", "nombre": "Ana García" },
      "canCancel": true,
      "canReview": false
    }
  ],
  "total": 5,
  "page": 1,
  "perPage": 20,
  "hasMore": false
}
```

---

### `POST /v1/reservas/:id/cancelar`

Cancela una reserva. Las reglas de negocio (plazo mínimo, penalización) las aplica el backend.

**Auth**: Bearer cliente o invitado con `cancelToken`

**Body**
```json
{ "motivo": "No puedo asistir" }
```

**Response 200**
```json
{ "id": "rsv_abc123", "estado": "cancelada", "message": "Reserva cancelada correctamente." }
```

**Errores**
- `422` — fuera del plazo de cancelación gratuita

---

### `POST /v1/reservas/:id/resenas`

Crea una reseña asociada a una reserva completada. Solo se permite una por reserva.

**Auth**: `Bearer <token>` obligatorio

**Body**
```json
{ "rating": 5, "comentario": "Muy profesionales y puntuales." }
```

**Response 201**
```json
{ "id": "rev_xyz789", "estado": "pendiente", "message": "Reseña recibida. Se publicará tras moderación." }
```

**Errores**
- `403` — la reserva no pertenece al cliente
- `422` — la reserva no está en estado `completada`
- `409` — ya existe reseña para esta reserva

---

## 5. Favoritos

### `GET /v1/clientes/me/favoritos`

**Auth**: `Bearer <token>` obligatorio

**Response 200** — array de `MarketplaceSalonItem`

---

### `POST /v1/clientes/me/favoritos`

**Auth**: `Bearer <token>` obligatorio

**Body**: `{ "salonSlug": "feromi" }`

**Response 201**: `{ "salonSlug": "feromi", "createdAt": "2026-06-06T12:00:00Z" }`

---

### `DELETE /v1/clientes/me/favoritos/:salonSlug`

**Auth**: `Bearer <token>` obligatorio  
**Response**: `204 No Content`

---

## 6. Leads B2B

### `POST /v1/leads/b2b`

Recoge un lead del formulario de `/business`.

**Body**
```json
{
  "salonName": "Barbería Marcel",
  "contactName": "Marcel Puig",
  "phone": "+34937001234",
  "email": "marcel@example.com",
  "city": "Terrassa",
  "teamSize": "1-7",
  "message": "Quiero presupuesto para el plan A medida.",
  "source": "business_landing"
}
```

**Response 201**
```json
{ "id": "lead_456", "message": "Hemos recibido tu solicitud. Te contactaremos en 24 h." }
```

---

## 7. Billing / alta B2B

### `POST /v1/billing/checkout-sessions`

Inicia el alta B2B self-service para el plan Basico. Las solicitudes A medida se gestionan por contrato enviando email a `soporte@origar.es`.

**Body**
```json
{
  "planId": "basic",
  "interval": "monthly",
  "profile": {
    "salonName": "Barbería Marcel",
    "contactName": "Marcel Puig",
    "email": "facturacion@example.com",
    "phone": "+34937001234",
    "fiscalName": "Marcel Puig SL",
    "taxId": "B12345678",
    "address": "Carrer Major, 5",
    "city": "Terrassa",
    "country": "ES",
    "coupon": "ALLOP20"
  },
  "successUrl": "https://allop.es/business/alta/success?plan=basic&interval=monthly",
  "cancelUrl": "https://allop.es/business/alta/cancel?plan=basic&interval=monthly"
}
```

**Response 200**
```json
{
  "url": "https://checkout.stripe.com/pay/cs_...",
  "subscription": { ... }
}
```

> El frontend redirige al usuario a `url`. Stripe gestiona el pago y redirige a `successUrl`/`cancelUrl`.

---

### `POST /v1/billing/customer-portal`

Abre el Customer Portal de Stripe (cambio de plan, tarjeta, facturas, cancelación).

**Auth**: `Bearer <token de salón>` obligatorio

**Response 200**
```json
{ "url": "https://billing.stripe.com/session/..." }
```

---

### `GET /v1/billing/subscription`

Estado actual de la suscripción del salón autenticado.

**Auth**: `Bearer <token de salón>` obligatorio

**Response 200**
```json
{
  "planId": "basic",
  "interval": "monthly",
  "status": "active",
  "stripeCustomerId": "cus_xxx",
  "stripeSubscriptionId": "sub_yyy",
  "currentPeriodEnd": "2026-07-06T00:00:00Z",
  "trialEndsAt": null,
  "gracePeriodEndsAt": null,
  "activationState": "active",
  "portalUrl": null,
  "invoiceUrl": "https://invoice.stripe.com/...",
  "salonName": "Barbería Marcel"
}
```

---

### `POST /v1/billing/webhook`

Recibe eventos de Stripe. **Solo para uso interno backend.**

**Headers requeridos**: `Stripe-Signature` (verificar con `STRIPE_WEBHOOK_SECRET`)  
**Body**: payload raw de Stripe (`application/json`)  
**Response**: siempre `200 OK` (para evitar reintentos de Stripe)

**Eventos esperados**

| Evento | Acción backend |
|---|---|
| `checkout.session.completed` | Activar suscripción |
| `customer.subscription.updated` | Sincronizar plan y estado |
| `customer.subscription.deleted` | Marcar como cancelada |
| `invoice.paid` | Confirmar pago, emitir factura |
| `invoice.payment_failed` | Marcar `past_due`, iniciar grace period |

> Los handlers deben ser **idempotentes**: el mismo evento puede llegar varias veces.

---

## 8. MapKit / Apple Maps

### `GET /v1/mapkit/token`

Devuelve un JWT temporal firmado en backend para inicializar MapKit JS. La clave `.p8` nunca debe exponerse en el frontend.

**Response 200**
```json
{ "token": "eyJhbGciOiJFUzI1NiIsImtpZCI6IkE3SDREWks4SFQifQ..." }
```

**Variables backend necesarias**

- `APPLE_MAPKIT_TEAM_ID`
- `APPLE_MAPKIT_KEY_ID`
- `APPLE_MAPKIT_MAPS_ID`
- `APPLE_MAPKIT_PRIVATE_KEY_PATH` o `APPLE_MAPKIT_PRIVATE_KEY`
- `APPLE_MAPKIT_ORIGIN`

---

## 9. Versionado y compatibilidad

### Política de versiones

```
/api/v1/salones          ← versión actual
/api/v2/salones          ← futura versión breaking
/api/salones             ← legacy (sin /v1), mantener durante migración
```

- Los cambios **aditivos** (añadir campo opcional) no requieren nueva versión.
- Los cambios **breaking** (renombrar campo, cambiar tipo, eliminar campo) → nueva versión con al menos 90 días de soporte paralelo.
- El header `Deprecation` avisa de endpoints obsoletos: `Deprecation: Sat, 01 Jan 2027 00:00:00 GMT`.
- El frontend lee `VITE_API_VERSION` (default `v1`) para construir rutas versionadas.

### Rutas legacy actuales (sin `/v1`)

Estas rutas existen en la API actual y el frontend las consume con fallback:

| Ruta legacy | Equivalente v1 |
|---|---|
| `GET /salones` | `GET /v1/salones` |
| `POST /salones/:slug/auth/cliente/otp/request` | `POST /v1/auth/cliente/otp/request` |
| `POST /salones/:slug/auth/cliente/otp/verify` | `POST /v1/auth/cliente/otp/verify` |
| `POST /salones/:slug/auth/cliente/register` | `POST /v1/auth/cliente/register` |
| `POST /salones/:slug/auth/cliente/login` | `POST /v1/auth/cliente/login` |
| `GET /salones/:slug/auth/cliente/me` | `GET /v1/clientes/me` |
| `GET /salones/:slug/clientes/me/reservas` | `GET /v1/clientes/me/reservas` |
| `POST /reservas` | `POST /v1/reservas` |
| `GET /salones/:slug/disponibilidad` | `GET /v1/salones/:slug/disponibilidad` |
| `POST /leads/b2b` | `POST /v1/leads/b2b` |
| `POST /billing/checkout-sessions` | `POST /v1/billing/checkout-sessions` |
| `POST /billing/customer-portal` | `POST /v1/billing/customer-portal` |
| `GET /billing/subscription` | `GET /v1/billing/subscription` |

---

## 10. Seguridad

- **OTP rate limit**: máx. 3 solicitudes por teléfono/hora. Respuesta `429` con `Retry-After`.
- **Token JWT**: incluye `exp`, `sub` (clienteId o salonId), `scope` (`cliente` | `salon`).
- **Webhook Stripe**: verificar firma `HMAC-SHA256` antes de procesar. Rechazar si inválida con `400`.
- **Webhook idempotencia**: usar `event.id` de Stripe como clave de deduplicación.
- **CORS**: permitir `https://allop.es` y `https://www.allop.es`. En staging, permitir origin de staging.
- **Cabeceras de respuesta**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`.
- **`debugCode`** en OTP: solo incluir si el entorno no es producción.

---

*Última actualización: 2026-06-06 — ROADMAP 4.12*
