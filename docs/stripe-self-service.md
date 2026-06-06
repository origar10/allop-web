# Alta self-service B2B

## Decision de alcance

- El self-service inicial es el plan Basico para salones B2B.
- El plan A medida se solicita por contrato escribiendo a `soporte@origar.es`.
- Los pagos de clientes por reserva quedan fuera del lanzamiento: prepago, senal, no-show fee o pago completo se decidiran despues.
- Basico cuesta 39 EUR/mes y permite crear la cuenta sin revision manual.
- Allop no debe guardar datos de tarjeta: Stripe Checkout y Stripe Customer Portal gestionan tarjeta, metodo de pago, facturas y cambios de suscripcion.

## Variables y modo test/live

- Backend test:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_PRICE_BASIC_MONTHLY`
  - `STRIPE_PRICE_BASIC_ANNUAL`
- Frontend:
  - `VITE_API_URL`
- Separar valores test/live por entorno. No mezclar price ids ni webhook secrets.
- El frontend no debe conocer `STRIPE_SECRET_KEY`.

## Contratos API esperados

- `POST /billing/checkout-sessions`
  - Crea Stripe Checkout Session para el alta self-service Basico.
  - Recibe `planId`, `interval`, `profile`, `successUrl`, `cancelUrl`.
  - Devuelve `{ url, subscription? }`.
- Contratos A medida:
  - El frontend abre `mailto:soporte@origar.es` con los datos del formulario.
  - `starter` se normaliza a `basic`; `pro` y `scale` se normalizan a `custom`.
- `POST /billing/customer-portal`
  - Crea Stripe Customer Portal Session.
  - Devuelve `{ url }`.
- `GET /billing/subscription`
  - Devuelve estado actual de suscripcion y activacion del salon.
- `POST /billing/webhooks/stripe`
  - Verifica firma de Stripe.
  - Procesa eventos de forma idempotente.

## Webhooks obligatorios

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

## Reglas operativas

- Estado `trialing` o `active`: acceso segun plan.
- Estado `past_due`: mostrar aviso y mantener grace period de 7 dias.
- Grace period vencido: limitar modulos no esenciales.
- Estado `canceled`: mantener acceso hasta fin de periodo si aplica y limitar al finalizar.
- Reconciliacion semanal:
  - revisar suscripciones `past_due`,
  - comparar facturas de Stripe con estado interno,
  - validar altas completadas sin configuracion,
  - revisar eventos webhook fallidos o duplicados.

## Checklist antes de produccion

- Webhook con firma verificada.
- Procesadores idempotentes por `event.id`.
- Price ids live configurados.
- Customer Portal configurado en Stripe.
- Emails de factura y pago fallido revisados.
- IVA y datos fiscales validados.
- Logs de eventos de billing activos.
