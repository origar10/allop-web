# Modelo de datos mínimo — allop-web

> Entidades del dominio de negocio de Allop.  
> Los tipos TypeScript canónicos viven en `src/shared/dataModels.ts`.  
> Para las formas HTTP de cada endpoint ver `docs/api-contracts.md`.

---

## Mapa de entidades y relaciones

```
┌─────────────────────────────────────────────────────────────────────┐
│                          NEGOCIO B2B                                │
│                                                                     │
│  BusinessLead ──────┐                                               │
│                     ▼                                               │
│  Plan ◄──── Subscription ◄──── BillingProfile                      │
│                     │                                               │
│                     ▼                                               │
│                  Invoice                                            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         CATÁLOGO (SALÓN)                            │
│                                                                     │
│  Salon ◄───── SalonMedia                                            │
│    │                                                                │
│    ├──────► Service                                                 │
│    │                                                                │
│    └──────► Professional ◄────── Service (asignados)               │
│                 │                                                   │
│                 └──────────────► AvailabilitySlot                  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       TRANSACCIONES                                 │
│                                                                     │
│  Client ──────────────────────────────────────────────┐            │
│    │                                                  │            │
│    ├──────► Favorite ──────────────────► Salon        │            │
│    │                                                  │            │
│    └──────► Booking ◄──── Salon                       │            │
│                 │    ◄──── Service                    │            │
│                 │    ◄──── Professional               │            │
│                 │                                     │            │
│                 └──────► Review ────────────────────►─┘            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 1. Salon

Unidad de negocio que ofrece servicios. Todo gira alrededor de esta entidad.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | Identificador único |
| `slug` | `string` | URL-friendly, inmutable tras publicación |
| `nombreComercial` | `string` | Nombre visible al público |
| `descripcionCorta` | `string` | Texto para tarjeta de resultado (≤ 160 car.) |
| `descripcionLarga` | `string?` | Texto rico para ficha de salón |
| `categoriasPrincipal` | `SalonCategory` | `peluqueria \| barberia \| estetica \| unas \| masajes \| maquillaje` |
| `categoriasSecundarias` | `SalonCategory[]?` | Categorías adicionales |
| `tags` | `string[]?` | Servicios/etiquetas para búsqueda |
| `direccion` | `string` | Dirección postal completa |
| `ciudad` | `string` | Ciudad o barrio |
| `codigoPostal` | `string?` | CP |
| `provincia` | `string?` | Provincia |
| `pais` | `string?` | Código ISO (default `ES`) |
| `lat` | `number` | Latitud WGS-84 |
| `lng` | `number` | Longitud WGS-84 |
| `telefono` | `string` | E.164 (`+34...`) |
| `email` | `string?` | Email público del salón |
| `web` | `string?` | URL propia |
| `instagram` | `string?` | URL perfil |
| `facebook` | `string?` | URL perfil |
| `rating` | `number` | Media calculada de `Review.rating` (0–5) |
| `totalResenas` | `number` | Total de reseñas visibles |
| `precioDesde` | `number` | EUR, mínimo entre servicios activos |
| `moneda` | `string?` | Default `EUR` |
| `horarios` | `HorarioSemana?` | Horario por día o null si cerrado |
| `verificado` | `boolean` | Revisado por el equipo de Allop |
| `destacado` | `boolean` | Aparece en secciones "destacados" |
| `status` | `SalonStatus` | `draft \| review \| active \| suspended \| deleted` |
| `fechaAlta` | `string` | ISO 8601 |
| `seoTitle` | `string?` | `<title>` para la ficha |
| `seoDescription` | `string?` | `<meta description>` para la ficha |
| `canonicalUrl` | `string?` | URL canónica absoluta |

### HorarioSemana

```
{ lunes: "09:00–20:00", martes: "09:00–20:00", sabado: "09:00–14:00", domingo: null }
```
`null` indica día cerrado. `undefined` indica sin información.

---

## 2. SalonMedia

Archivos multimedia asociados a un salón (portada + galería).

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | |
| `salonId` | `string` | FK → Salon |
| `url` | `string` | URL pública del recurso |
| `alt` | `string?` | Texto alternativo accesible |
| `esPortada` | `boolean` | Solo puede haber una portada activa |
| `esGaleria` | `boolean` | Pertenece a la galería de la ficha |
| `orden` | `number` | Posición en la galería (0 = primero) |
| `estado` | `MediaEstado` | `pendiente \| aprobado \| rechazado` |
| `uploadedAt` | `string` | ISO 8601 |

---

## 3. Service

Servicio que ofrece el salón y que se puede reservar.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | |
| `salonId` | `string` | FK → Salon |
| `nombre` | `string` | Nombre visible ("Corte de pelo") |
| `descripcion` | `string?` | Descripción breve |
| `duracion` | `number` | Minutos |
| `precio` | `number` | EUR |
| `categoriaServicio` | `string?` | Agrupación interna |
| `tags` | `string[]?` | Para filtros y SEO |
| `activo` | `boolean` | Solo activos son reservables |
| `orden` | `number?` | Posición en la lista |

---

## 4. Professional

Empleado o autónomo que presta servicios en el salón.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | |
| `salonId` | `string` | FK → Salon |
| `nombre` | `string` | |
| `apellidos` | `string?` | |
| `foto` | `string?` | URL del avatar |
| `serviciosAsignados` | `string[]` | IDs de Service que puede realizar |
| `horario` | `ProfessionalScheduleDay[]?` | Horario por día |
| `activo` | `boolean` | |
| `fechaAlta` | `string` | ISO 8601 |

### ProfessionalScheduleDay

```json
{ "dia": "lunes", "horaInicio": "09:00", "horaFin": "18:00", "activo": true }
```

---

## 5. AvailabilitySlot

Franja de tiempo disponible para una reserva. Generada por el motor de agenda del backend.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | |
| `salonId` | `string` | FK → Salon |
| `serviceId` | `string` | FK → Service |
| `professionalId` | `string?` | FK → Professional (null = cualquiera) |
| `fecha` | `string` | YYYY-MM-DD |
| `horaInicio` | `string` | HH:MM |
| `horaFin` | `string` | HH:MM |
| `capacidad` | `number` | Plazas totales del slot |
| `reservado` | `number` | Reservas activas en ese slot |
| `disponible` | `boolean` | `reservado < capacidad` |

---

## 6. Booking

Reserva de un servicio por parte de un cliente (autenticado o invitado).

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | |
| `locator` | `string` | Referencia visible: `"ALP-XXXXXX"` |
| `salonId` | `string` | FK → Salon |
| `salonSlug` | `string` | Denormalizado para display |
| `clientId` | `string?` | FK → Client (null si invitado) |
| `serviceId` | `string` | FK → Service |
| `professionalId` | `string?` | FK → Professional (null = cualquiera) |
| `fechaHoraInicio` | `string` | ISO 8601 |
| `fechaHoraFin` | `string?` | ISO 8601 |
| `estado` | `BookingEstado` | `pendiente \| confirmada \| completada \| cancelada \| no_show` |
| `origen` | `BookingOrigen` | `web \| app \| dashboard \| telefono \| walk_in` |
| `clientName` | `string` | Snapshot del nombre en el momento de la reserva |
| `clientPhone` | `string` | |
| `clientEmail` | `string?` | |
| `precio` | `number` | EUR, snapshot del precio al reservar |
| `moneda` | `string?` | Default `EUR` |
| `notas` | `string?` | Notas del cliente para el salón |
| `politicaCancelacion` | `CancellationPolicy?` | Reglas de cancelación aplicadas |
| `idempotencyKey` | `string?` | UUID para prevenir duplicados |
| `creadaEn` | `string` | ISO 8601 |
| `actualizadaEn` | `string?` | |
| `canceladaEn` | `string?` | |
| `motivoCancelacion` | `string?` | |
| `canCancel` | `boolean?` | Calculado: dentro del plazo y estado permite |
| `canReview` | `boolean?` | Calculado: estado = completada y sin reseña |

### CancellationPolicy

```json
{ "plazoGratuitoHoras": 24, "penalizacion": 0, "descripcion": "Cancelación gratuita hasta 24 h antes." }
```

### Máquina de estados de Booking

```
pendiente ──► confirmada ──► completada
    │               │
    └───────────────┴──────► cancelada
                             no_show ◄── completada (raramente)
```

---

## 7. Client

Usuario final que realiza reservas a través del marketplace.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string \| number` | |
| `nombre` | `string` | |
| `apellidos` | `string?` | |
| `email` | `string?` | Opcional (auth por SMS) |
| `telefono` | `string` | E.164, campo principal de identidad |
| `puntosFidelizacion` | `number?` | Acumulados en todos los salones |
| `sesionesFidelizacion` | `number?` | Visitas completadas |
| `cortesGratisDisponibles` | `number?` | Premio de fidelización canjeables |
| `tier` | `TierFidelizacion?` | `bronce \| plata \| oro \| vip` |
| `consentimientoRGPD` | `boolean` | Obligatorio en registro |
| `aceptaMarketing` | `boolean?` | Opcional |
| `idiomaPreferido` | `'es' \| 'ca' \| 'en'?` | |
| `notificaciones` | `ClientNotificationPreferences?` | `{ sms, email, whatsapp }` |
| `fechaRegistro` | `string` | ISO 8601 |
| `ultimoAcceso` | `string?` | ISO 8601 |

---

## 8. Review

Valoración verificada: solo se puede crear a partir de una Booking en estado `completada`.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | |
| `bookingId` | `string` | FK → Booking (única por booking) |
| `salonId` | `string` | FK → Salon |
| `clientId` | `string` | FK → Client |
| `clientNombre` | `string` | Snapshot del nombre |
| `rating` | `1 \| 2 \| 3 \| 4 \| 5` | Puntuación entera |
| `comentario` | `string?` | Texto libre |
| `servicioNombre` | `string?` | Snapshot del servicio |
| `estado` | `ReviewEstado` | `pendiente \| visible \| rechazado \| reportado` |
| `motivoRechazo` | `string?` | Solo si `estado = rechazado` |
| `respuestaSalon` | `string?` | Respuesta pública del salón |
| `respuestaEn` | `string?` | ISO 8601 |
| `creadaEn` | `string` | ISO 8601 |
| `publicadaEn` | `string?` | ISO 8601 |

### Invariante crítica
> Una review solo puede crearse si `Booking.estado === 'completada'` y no existe otra review para ese `bookingId`.

---

## 9. Favorite

Salón guardado por un cliente autenticado.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string?` | |
| `clientId` | `string` | FK → Client |
| `salonId` | `string` | FK → Salon |
| `salonSlug` | `string` | Denormalizado para lookups rápidos |
| `creadoEn` | `string` | ISO 8601 |

---

## 10. BusinessLead

Solicitud de información de un salón interesado en Allop.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string?` | Asignado por el backend |
| `salonName` | `string` | Nombre del salón |
| `contactName` | `string` | Persona de contacto |
| `phone` | `string` | |
| `email` | `string` | |
| `city` | `string` | |
| `teamSize` | `string` | `"1"`, `"2-3"`, `"4-10"`, `"11+"` |
| `message` | `string?` | Mensaje libre |
| `source` | `string` | Origen del formulario: `"business_landing"`, `"marketplace_cta"`, etc. |
| `estadoCRM` | `LeadEstadoCRM` | `nuevo \| contactado \| demo_agendada \| propuesta_enviada \| ganado \| perdido` |
| `asignadoA` | `string?` | Email del comercial de Allop |
| `notas` | `string?` | Notas internas |
| `createdAt` | `string` | ISO 8601 |
| `updatedAt` | `string?` | ISO 8601 |

---

## 11. Plan

Plan de suscripción disponible para salones.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `BillingPlanId` | `basic \| custom` |
| `nombre` | `string` | |
| `descripcion` | `string` | |
| `precioMensual` | `number \| null` | EUR; null = precio a medida |
| `precioAnual` | `number \| null` | EUR; suele ser ~10 meses |
| `trialDias` | `number` | 0 si no hay trial |
| `limites` | `PlanLimits` | Capacidades por dimensión |
| `features` | `string[]` | Lista de características incluidas |
| `stripePriceIdMonthly` | `string?` | ID del Price de Stripe |
| `stripePriceIdAnnual` | `string?` | ID del Price de Stripe |
| `activo` | `boolean` | Si aparece en la tabla de precios |
| `destacado` | `boolean` | Marcado como "Recomendado" |

### PlanLimits

```json
{
  "empleados": "Hasta 7",
  "seats": "Gestor + cuentas de empleados",
  "reservasMes": "Sin limite",
  "recordatorios": "Basicos",
  "sedes": "1",
  "soporte": "Estandar"
}
```

---

## 12. Subscription

Estado activo de la suscripción de un salón a un plan.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string?` | |
| `salonId` | `string` | FK → Salon |
| `salonName` | `string` | Denormalizado |
| `planId` | `BillingPlanId` | FK → Plan |
| `interval` | `BillingInterval` | `monthly \| annual` |
| `status` | `SubscriptionStatus` | `trialing \| active \| past_due \| canceled \| incomplete` |
| `activationState` | `ActivationState` | `pending_setup \| active \| limited` |
| `stripeCustomerId` | `string?` | `cus_...` |
| `stripeSubscriptionId` | `string?` | `sub_...` |
| `currentPeriodStart` | `string?` | ISO 8601 |
| `currentPeriodEnd` | `string` | ISO 8601 |
| `trialEndsAt` | `string?` | ISO 8601 |
| `canceledAt` | `string?` | ISO 8601 |
| `gracePeriodEndsAt` | `string?` | ISO 8601 (7 días tras `past_due`) |
| `portalUrl` | `string?` | URL del Customer Portal de Stripe |
| `invoiceUrl` | `string?` | URL de la última factura |

### Máquina de estados de Subscription

```
incomplete ──► trialing ──► active ──► past_due ──► canceled
                  │                        │
                  └────────────────────────┘
                         canceled
```

### Módulos bloqueados por plan y estado

| Módulo | Basico | A medida | past_due fuera grace | canceled |
|---|---|---|---|---|
| Agenda | incluido | incluido | incluido | bloqueado |
| Caja | opcional | incluido | incluido | bloqueado |
| Clientes | opcional | incluido | incluido | bloqueado |
| Multi-sede | no incluido | incluido | incluido | bloqueado |

---

## 13. Invoice

Factura generada por Stripe para una suscripción B2B.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | ID interno |
| `salonId` | `string` | FK → Salon |
| `subscriptionId` | `string?` | FK → Subscription |
| `importe` | `number` | EUR, sin IVA |
| `impuesto` | `number?` | EUR, IVA (21 %) |
| `moneda` | `string` | Default `eur` |
| `periodoDesde` | `string` | ISO 8601 |
| `periodoHasta` | `string` | ISO 8601 |
| `estado` | `InvoiceEstado` | `draft \| open \| paid \| void \| uncollectible` |
| `stripeInvoiceId` | `string` | `in_...` |
| `url` | `string?` | URL pública de la factura |
| `pdf` | `string?` | URL del PDF |
| `creadaEn` | `string` | ISO 8601 |
| `pagadaEn` | `string?` | ISO 8601 |

---

## 14. BillingProfile

Datos fiscales del salón para facturación.

| Campo | Tipo | Descripción |
|---|---|---|
| `salonId` | `string` | FK → Salon (1:1) |
| `razonSocial` | `string` | Nombre fiscal o razón social |
| `nifCif` | `string` | NIF (persona física) o CIF (empresa) |
| `direccionFiscal` | `string` | Dirección completa |
| `ciudad` | `string` | |
| `codigoPostal` | `string?` | |
| `provincia` | `string?` | |
| `pais` | `string` | ISO 3166-1 alpha-2 (`ES`) |
| `emailFacturacion` | `string` | Email de envío de facturas |
| `tipoIVA` | `number?` | Porcentaje (default 21) |
| `stripeCustomerId` | `string?` | Referencia en Stripe |

---

## Claves de localStorage (frontend)

El frontend persiste estado local en estas claves mientras no haya sincronización completa con la API:

| Clave | Contenido |
|---|---|
| `allop.client.session` | `ClientSession` activa (global) |
| `allop.client.session.<slug>` | `ClientSession` por salón (legacy) |
| `allop.account.favorites` | `string[]` — slugs de favoritos |
| `allop.account.bookings` | `AccountBooking[]` — historial local |
| `allop.account.profile` | `AccountProfileDraft` — perfil editable |
| `allop.account.notificationPrefs` | `NotificationPreferences` |
| `allop.account.reviews` | `AccountReview[]` |
| `allop.billing.subscription` | `SubscriptionSnapshot` |
| `allop.billing.events` | `BillingEvent[]` (últimos 50) |
| `allop.business.leads` | `BusinessLead[]` — fallback local |
| `allop.analytics.consent` | `"accepted" \| "rejected"` |
| `allop.analytics.events` | `AnalyticsEvent[]` — fallback local |
| `allop.theme` | `"light" \| "dark"` |
| `allop.locale` | `"es" \| "ca"` |

---

*Última actualización: 2026-06-06 — ROADMAP 4.13*
