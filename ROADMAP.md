# ROADMAP — allop-web

> Estado actual: MVP funcional con marketplace estático, auth OTP, landing B2B y deploy automático a VPS.  
> Este documento recoge **todo lo que debería incorporar** la web pública de Allop y un checklist granular para llegar ahí.

---

## 1. NAVEGACIÓN — SUBMENÚS COMPLETOS

### 1.1 Nav principal (cliente, ruta `/`)

| Texto visible | Tipo actual | Lo que debería tener |
|---|---|---|
| **Buscar salón** | Link simple `/#buscar` | Dropdown con subcategorías |
| **Cómo funciona** | Link simple `/#como-funciona` | Dropdown con secciones |
| **Para salones** | Botón → `/business` | Dropdown con secciones del producto |
| **Entrar** | Botón → `/login` | Dropdown de usuario (si hay sesión) |
| **Registro** | Botón → `/register` | — (solo si no hay sesión) |

#### Submenu "Buscar salón"
```
Buscar salón
├── Por servicio
│   ├── Peluquería
│   ├── Barbería
│   ├── Estética
│   ├── Uñas
│   ├── Masajes
│   └── Maquillaje
├── Por zona
│   ├── Barcelona
│   ├── Sabadell
│   ├── Terrassa
│   ├── Rubí
│   └── Cerdanyola
├── Destacados
│   ├── Mejor valorados
│   ├── Novedades
│   └── Cerca de mí
└── Ver todos →
```

#### Submenu "Cómo funciona"
```
Cómo funciona
├── Para clientes
│   ├── Busca y reserva
│   ├── Recordatorios automáticos
│   └── Valoraciones verificadas
├── Para salones
│   ├── Alta gratuita
│   ├── Gestión de agenda
│   └── Panel de control
└── Preguntas frecuentes →
```

#### Submenu "Para salones"
```
Para salones
├── Producto
│   ├── Agenda y reservas
│   ├── Caja y facturación
│   ├── Gestión de clientes
│   └── Operativa e inventario
├── Precios
│   ├── Básico — 39 €/mes
│   └── A medida — Pedir presupuesto
├── Recursos
│   ├── Cómo funciona el alta
│   ├── Testimonios
│   └── Preguntas frecuentes
└── Solicitar demo →
```

#### Submenu usuario (sesión activa — reemplaza "Entrar" + "Registro")
```
Nombre del cliente ▾
├── Mi perfil
├── Mis reservas
├── Salones favoritos
├── Puntos y fidelización
├── Notificaciones
└── Cerrar sesión
```

---

### 1.2 Nav Business (ruta `/business`)

| Texto visible | Tipo actual | Lo que debería tener |
|---|---|---|
| **Acceder al panel** | Link directo | — (correcto, queda como está) |
| (sin links intermedios) | — | Links a secciones de la página |

#### Añadir links a secciones en nav-business
```
allop business  |  Operativa  Precios  Clientes  →Solicitar demo  |  Acceder al panel
```

#### Submenu "Operativa" (hover)
```
Operativa
├── Agenda y reservas
├── Caja y cobros
├── Clientes e historial
└── Inventario y empleados
```

#### Submenu "Clientes" (hover) — testimonios
```
Clientes
├── Casos de éxito
├── Reseñas de salones
└── Ver más →
```

---

### 1.3 Footer — columnas completas

#### Footer cliente (ruta `/`)
```
Marketplace          Para salones         Empresa              Legal
──────────────       ──────────────       ──────────────       ──────────────
Buscar salón         Alta de salón        Sobre nosotros       Privacidad
Cómo funciona        Dashboard            Prensa               Términos y cond.
Categorías           App empleados        Blog                 Cookies
Salones destacados   Precios              Trabaja con nosotros RGPD
Ayuda/FAQ            Soporte B2B          Contacto             Aviso legal
```

#### Footer business (ruta `/business`)
```
Producto             Soporte              Empresa              Legal
──────────────       ──────────────       ──────────────       ──────────────
Operativa            Contacto             Sobre nosotros       Privacidad
Precios              FAQ salones          Blog                 Términos
Dashboard            Estado del sistema   Prensa               Cookies
Integraciones        Soporte prioritario  Trabaja con nosotros
```

---

## 2. PÁGINAS NUEVAS

### 2.1 Páginas de cliente

| Ruta | Descripción | Prioridad |
|---|---|---|
| `/salones/:slug` | Perfil completo de salón | Alta |
| `/categoria/:slug` | Listado filtrado por categoría | Media |
| `/ciudad/:slug` | Listado filtrado por ciudad | Media |
| `/reservar/:salonSlug` | Booking flow (selección servicio → hora → confirmación) | Alta |
| `/mi-cuenta` | Dashboard del cliente | Alta |
| `/mi-cuenta/reservas` | Historial y próximas reservas | Alta |
| `/mi-cuenta/favoritos` | Salones guardados | Media |
| `/mi-cuenta/perfil` | Editar nombre, teléfono, preferencias | Media |
| `/mi-cuenta/puntos` | Programa de fidelización | Baja |
| `/ayuda` | FAQ para clientes | Media |
| `/404` | Página de error personalizada | Alta |

### 2.2 Páginas B2B

| Ruta | Descripción | Prioridad |
|---|---|---|
| `/business/demo` | Tour interactivo del producto | Media |
| `/business/clientes` | Casos de éxito y testimonios | Media |
| `/business/faq` | FAQ para salones | Media |
| `/business/integraciones` | Conectores con TPV, WhatsApp, etc. | Baja |

### 2.3 Páginas legales

| Ruta | Descripción | Prioridad |
|---|---|---|
| `/privacidad` | Política de privacidad | **Obligatoria** |
| `/terminos` | Términos y condiciones | **Obligatoria** |
| `/cookies` | Política de cookies | **Obligatoria** |
| `/aviso-legal` | Aviso legal (Origar SL) | **Obligatoria** |
| `/rgpd` | Información RGPD | **Obligatoria** |

### 2.4 Páginas SEO/contenido

| Ruta | Descripción | Prioridad |
|---|---|---|
| `/sobre-nosotros` | Equipo y misión | Baja |
| `/blog` | Artículos del sector | Baja |
| `/blog/:slug` | Post individual | Baja |
| `/sitemap.xml` | Sitemap generado | Alta |

### 2.5 Páginas concretas que faltan para una web completa

| Ruta | Descripción | Prioridad |
|---|---|---|
| `/buscar` | Página dedicada de búsqueda con filtros persistentes y URL compartible | Alta |
| `/salones` | Directorio general de salones indexable | Alta |
| `/servicios/:slug` | Landing SEO por servicio: corte, manicura, barbería, masaje, etc. | Media |
| `/ofertas` | Promociones activas y descuentos por salón | Media |
| `/resenas` | Agregado de reseñas verificadas y salones mejor valorados | Baja |
| `/contacto` | Contacto general con motivos segmentados | Alta |
| `/confianza` | Página de seguridad, reservas verificadas, privacidad y garantías | Media |
| `/estado` | Estado del servicio o enlace a status page externo | Media |
| `/business/precios` | Página B2B de precios más profunda que la sección landing | Alta |
| `/business/contacto` | Formulario B2B de demo/alta con campos de cualificación | Alta |
| `/business/seguridad` | Seguridad, RGPD, permisos, backups y operación para salones | Media |
| `/business/migrar` | Migrar desde agenda en papel, Excel, Google Calendar u otro software | Media |
| `/business/recursos` | Guías para salones: reservas online, no-shows, fidelización | Baja |
| `/business/partners` | Página para integraciones, colaboradores y afiliados | Baja |

---

## 3. FUNCIONALIDADES POR SECCIÓN

### 3.1 Marketplace (Home)

- [x] Filtros avanzados: precio máximo (slider), valoración mínima, distancia, disponibilidad hoy/mañana/esta semana
- [x] Vista de mapa (Google Maps / Mapbox) con pins de salones — implementado con pins por coordenadas sin clave externa; pendiente solo si se decide proveedor visual Google/Mapbox
- [x] Paginación o infinite scroll (actualmente solo 6 salones)
- [x] Búsqueda con autocompletado (debounce + sugerencias de salones y servicios)
- [x] Chips de búsqueda rápida ampliados (más servicios, más zonas)
- [x] Badges de estado: "Abre ahora", "Últimas plazas", "Nuevo"
- [x] Ordenación manual: por valoración, por precio, por distancia, por disponibilidad
- [x] Sección "Cerca de ti" (geolocalización del navegador)
- [x] Sección de reseñas recientes en home
- [x] Banner promocional configurable (descuentos, novedades)
- [x] Skeleton loaders mientras carga el grid
- [x] Datos reales desde API (reemplazar mock `salons.ts`) — carga desde API pública con fallback local si falla

### 3.2 Perfil de salón (`/salones/:slug`)

- [x] Galería de fotos (carrusel)
- [x] Header con imagen de portada, nombre, rating, dirección y botón reservar
- [x] Lista de servicios con nombre, duración y precio
- [x] Selector de fecha y hora con disponibilidad real
- [x] Lista de profesionales del salón
- [x] Sección de reseñas verificadas con paginación
- [x] Mapa incrustado con ubicación
- [x] Horarios de apertura
- [x] Información de contacto (teléfono, web, redes)
- [x] Tags y categorías
- [x] Badge de verificado / destacado
- [x] Botón "Guardar favorito" (requiere sesión)
- [x] Compartir ficha (URL canónica, botones share)
- [x] SEO: meta title, description, Open Graph por salón

### 3.3 Booking flow (`/reservar/:salonSlug`)

- [x] Paso 1: Selección de servicio (lista con precio y duración)
- [x] Paso 2: Selección de profesional (opcional, "cualquiera disponible")
- [x] Paso 3: Calendario de disponibilidad real (de API)
- [x] Paso 4: Selección de hora
- [x] Paso 5: Resumen y confirmación
- [x] Paso 6: Confirmación con número de reserva
- [x] Requiere sesión iniciada (redirect a login si no) — compatible con reserva como invitado
- [x] Posibilidad de reservar como invitado (solo teléfono)
- [x] Email/SMS de confirmación tras reservar
- [x] Cancelación desde confirmación

### 3.4 Área de cliente (`/mi-cuenta`)

- [x] Dashboard con próximas reservas destacadas
- [x] Historial completo de reservas con estado (confirmada, cancelada, completada)
- [x] Acción de cancelar reserva pendiente
- [x] Acción de añadir reseña tras visita completada
- [x] Lista de salones favoritos con acceso rápido
- [x] Perfil editable: nombre, apellidos, email, foto
- [x] Historial de puntos de fidelización
- [x] Preferencias de notificación (SMS, email)
- [x] Sección de seguridad: sesiones activas, cerrar sesión en todos los dispositivos

### 3.5 Auth (`/login`, `/register`)

- [x] Eliminar selector de salón del flujo (la sesión no debería ser por salón sino global)
- [x] Añadir campo email opcional en registro
- [x] Texto de ayuda sobre el código SMS
- [x] Link a términos en el checkbox de aceptación (ahora es texto plano)
- [x] Resend code con countdown (60 s)
- [x] Mejorar mensajes de error (más específicos)
- [x] Añadir login social (Google) — preparado con `VITE_GOOGLE_AUTH_URL`
- [x] Redirect automático al origen tras login (query param `?next=/reservar/...`)

### 3.6 Business landing (`/business`)

- [x] Demo interactiva o video del panel (30 s)
- [x] Sección de testimonios de salones reales con foto y nombre
- [x] Métricas de confianza: "N salones", "M reservas gestionadas", "X% satisfacción"
- [x] Comparativa de planes en tabla (actualmente solo cards)
- [x] FAQ desplegable (accordion) para salones
- [x] Formulario de contacto real (en lugar de mailto)
- [x] Integración con CRM / formulario de alta real
- [x] Sección de integraciones soportadas (TPV, WhatsApp, Stripe)
- [x] Chat de soporte en vivo o widget (Crisp, Intercom)
- [x] Sección "¿Por qué Allop vs agenda de papel?"

### 3.7 Home y contenido comercial que falta

- [x] Bloque de confianza above-the-fold: reservas verificadas, cancelación clara, soporte, privacidad
- [x] Módulo "Servicios populares" con links SEO a `/servicios/:slug`
- [x] Módulo "Ciudades populares" con links SEO a `/ciudad/:slug`
- [x] Módulo "Salones nuevos en Allop" para dar vida al marketplace
- [x] Módulo "Ofertas cerca de ti" si hay promociones activas
- [x] Bloque de explicación para usuarios indecisos: qué pasa tras reservar, cómo se confirma, cómo cancelar
- [x] Bloque de reseñas reales de clientes con enlace a la ficha del salón
- [x] CTA "¿No encuentras tu salón?" para sugerir un negocio
- [x] CTA "Reclama tu ficha" para propietarios de salones ya listados
- [x] Estado vacío comercial cuando no hay resultados: sugerir ampliar zona, quitar filtros o dejar teléfono/email
- [x] Captura de lead cuando una búsqueda no devuelve resultados en una ciudad
- [x] Landing local por ciudad con texto, categorías, salones top, FAQ y enlaces internos

### 3.8 Elementos concretos de confianza y soporte

- [x] Políticas visibles de cancelación, retrasos y no-show antes de reservar
- [x] Indicador de "reserva pendiente/confirmada" para no prometer disponibilidad falsa
- [x] Centro de ayuda con preguntas para clientes y salones separadas
- [x] Formulario de soporte con número de reserva opcional
- [x] Página de contacto con email, formulario y tiempos estimados de respuesta
- [x] Mensaje claro si Allop es intermediario, software del salón o ambas cosas
- [x] Explicar cómo se verifican reseñas y salones
- [x] Información de privacidad entendible para teléfono, SMS, email y geolocalización
- [x] Sistema para reportar datos incorrectos en una ficha de salón
- [x] Sistema para que un salón reclame o actualice su ficha
- [x] Enlaces legales accesibles desde checkout/reserva, auth y footer

### 3.9 Precios y venta B2B más completa

- [x] Tabla de planes con límites claros: usuarios, empleados, sedes, reservas, recordatorios, soporte
- [x] Página o sección "Qué incluye" con módulos del producto explicados sin marketing vacío
- [x] Calculadora simple de ahorro: no-shows evitados, tiempo de gestión, reservas mensuales
- [x] Comparativa contra alternativas: agenda papel, WhatsApp manual, Google Calendar, otros softwares
- [x] FAQ comercial: permanencia, alta, migración, soporte, pagos, formación, cancelación
- [x] Proceso de onboarding visible: demo, configuración, migración, formación, salida a producción
- [x] Casos de uso por tipo de negocio: peluquería, barbería, estética, uñas, spa
- [x] CTA secundario "Ver demo del panel" además de "Solicitar demo"
- [x] Lead magnet útil: checklist de digitalización o guía anti no-show para salones
- [x] Testimonios con contexto: ciudad, tamaño del salón, problema resuelto, resultado

### 3.10 Contenido editorial/SEO específico

- [x] Taxonomía estable de servicios y categorías con slugs no cambiantes
- [x] Páginas "servicio + ciudad" priorizadas: `/peluqueria/rubi`, `/barberia/terrassa`, etc.
- [x] FAQs indexables por intención: precio, duración, preparación, cancelación, reservas
- [x] Guías evergreen para clientes: cómo elegir salón, qué preguntar, cuidado post-servicio
- [x] Guías para salones: reducir ausencias, organizar agenda, captar clientes, fidelización
- [x] Sistema de enlaces internos entre ciudad, categoría, servicio y ficha de salón
- [x] Sitemap separado para salones, servicios, ciudades, blog y legales
- [x] Canonicalización de URLs con filtros para evitar contenido duplicado
- [x] Página de prensa/media kit con logo, descripción corta, contacto y recursos de marca

### 3.11 Pagos self-service con Stripe

- [x] Definir si el self-service es solo para salones B2B, para clientes finales, o ambos
- [x] Crear flujo `/business/alta` para que un salón pueda elegir plan y empezar sin intervención comercial
- [x] Crear selección de plan con mensual/anual, trial si aplica, límites y precio final con IVA
- [x] Integrar Stripe Checkout para alta de suscripción B2B
- [x] Integrar Stripe Customer Portal para cambiar plan, actualizar tarjeta, descargar facturas y cancelar
- [x] Crear pantalla de éxito tras pago (`/business/alta/success`) con estado de activación del salón
- [x] Crear pantalla de cancelación/error (`/business/alta/cancel`) con recuperación del proceso
- [x] Asociar `stripeCustomerId`, `stripeSubscriptionId` y estado de suscripción al salón/cuenta
- [x] Sincronizar estados desde webhooks: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`
- [x] Bloquear/desbloquear acceso a módulos B2B según plan y estado de pago
- [x] Mostrar avisos de pago fallido, tarjeta caducada, trial terminando y suscripción cancelada
- [x] Definir grace period por impago antes de limitar el servicio
- [x] Preparar facturación con IVA, datos fiscales del salón y dirección de facturación
- [x] Soportar cupones/códigos promocionales si se van a usar en campañas
- [x] Registrar eventos analíticos: plan visto, checkout iniciado, checkout completado, checkout abandonado, portal abierto, cancelación
- [x] Evitar guardar datos de tarjeta en Allop; todo pago sensible debe quedar en Stripe
- [x] Documentar modo test/live, claves necesarias y checklist antes de pasar a producción
- [x] Crear proceso interno para reconciliar pagos, incidencias y suscripciones en Stripe
- [x] Decidir si en el futuro habrá pagos de clientes por reserva: prepago, señal, no-show fee o pago completo

---

## 4. TÉCNICO Y TRANSVERSAL

### 4.1 SEO

- [x] `<title>` y `<meta description>` dinámicos por ruta
- [x] Open Graph (`og:title`, `og:description`, `og:image`) por página
- [x] Twitter Card meta tags
- [x] URLs canónicas
- [x] `sitemap.xml` generado en build
- [x] `robots.txt`
- [x] Schema.org (LocalBusiness, Product, Review) en fichas de salón
- [x] Breadcrumbs estructurados
- [x] URLs limpias y SEO-friendly

### 4.2 Rendimiento

- [x] Lazy loading de imágenes (`loading="lazy"`, `srcset`)
- [x] Componentes lazy con `React.lazy` + `Suspense` por ruta
- [x] Compresión de imágenes (WebP)
- [x] Preload de fuente Inter
- [x] Code splitting por ruta (ya lo hace Vite, revisar tamaño de chunks)
- [ ] Lighthouse score > 90 en todas las métricas — pendiente medir en VPS tras deploy

### 4.3 Analítica y monitorización

- [x] Google Analytics 4 o Plausible (privacy-first)
- [x] Eventos de conversión: búsqueda, clic en salón, inicio reserva, reserva completada, registro
- [x] Sentry o similar para captura de errores en producción
- [x] Uptime monitoring del VPS

### 4.4 Legal y privacidad

- [x] Banner de cookies (RGPD) con opt-in real antes de cargar GA
- [x] Páginas legales reales (`/privacidad`, `/terminos`, `/cookies`, `/aviso-legal`)
- [x] Checkbox de términos en registro con link a la página real (no texto plano)
- [x] Derecho de supresión / portabilidad: botón "Eliminar mi cuenta" en perfil
- [x] DPA (Data Processing Agreement) para salones

### 4.5 Accesibilidad

- [x] Skip link al contenido principal
- [x] Focus trap en modales
- [x] Focus visible en todos los elementos interactivos
- [x] Orden de tabulación lógico en formularios
- [x] Contraste de color AAA en textos pequeños
- [x] `alt` descriptivos en todas las imágenes reales
- [x] `aria-live` en mensajes de error/éxito de formularios
- [ ] Auditoría con axe-core o Lighthouse Accessibility — pendiente medir en VPS tras deploy

### 4.6 Testing

- [x] Tests unitarios de utilidades (`normalize`, `matchesQuery`, `formatBookingDate`)
- [x] Tests de componentes clave con Vitest + Testing Library
- [x] Tests e2e del booking flow con Playwright
- [ ] Tests de regresión visual (Chromatic o Percy) — opcional, pendiente si se decide versionar snapshots o contratar servicio externo

### 4.7 Internacionalización

- [x] Separar strings en fichero de traducciones (i18n)
- [x] Soporte catalán (`ca`) como segunda lengua
- [x] Selector de idioma en Nav

### 4.8 CI/CD y entornos

- [x] Variable de entorno `VITE_API_URL` documentada con `.env.example`
- [x] Entorno de staging separado del de producción
- [x] Preview deploys por PR (Vercel o Netlify si se migra, o rama `staging` en VPS) — cubierto con rama `staging` desplegada a ruta separada del VPS
- [x] Health check de la API antes del deploy

### 4.9 PWA

- [x] `manifest.webmanifest` con nombre, colores, iconos
- [x] Service worker básico (offline fallback)
- [x] Instalable en móvil ("Añadir a pantalla de inicio")

### 4.10 UX general

- [x] Modo oscuro (CSS `prefers-color-scheme` + toggle)
- [x] Toast notifications para acciones (reserva guardada, sesión cerrada, etc.)
- [x] Página 404 personalizada con sugerencias
- [x] Error boundary global con fallback
- [x] Loading spinners/skeletons en todas las peticiones async
- [x] Confirmación antes de cancelar reserva
- [x] Scroll to top en cambio de ruta (ya implementado, mantener)
- [x] Breadcrumb en páginas internas (`Home > Peluquería > Feromi`)

### 4.11 Arquitectura frontend

- [x] Definir estructura estable por dominios: `marketplace`, `auth`, `booking`, `account`, `business`, `legal`, `shared`
- [x] Separar componentes de página, componentes reutilizables, hooks y llamadas API
- [x] Crear capa de cliente API tipada (`apiClient`) con timeout, errores normalizados y manejo de sesión
- [x] Usar `AbortController` en búsquedas, disponibilidad y peticiones cancelables
- [x] Añadir cache de datos para consultas repetidas (TanStack Query o patrón local equivalente)
- [x] Definir estados estándar: `idle`, `loading`, `success`, `empty`, `error`
- [x] Centralizar formateadores: moneda, duración, distancia, fechas, teléfonos
- [x] Evitar navegación externa para perfiles (`goTo('https://allop.es/...')`) y usar rutas internas
- [x] Sustituir redirects comodín a `/` por una ruta 404 real
- [x] Documentar convenciones de nombres, rutas y ownership de módulos

### 4.12 Contratos de API y backend

- [x] Endpoint público de búsqueda de salones con filtros: texto, ciudad, categoría, precio, rating, fecha, lat/lng
- [x] Endpoint de detalle de salón por slug con servicios, empleados, horarios, fotos, reseñas y SEO
- [x] Endpoint de disponibilidad por servicio/profesional/rango de fechas
- [x] Endpoint de creación de reserva idempotente con `idempotencyKey`
- [x] Endpoint de cancelación/reprogramación con reglas de negocio claras
- [x] Endpoint global de auth cliente, sin depender de `salonSlug`
- [x] Endpoint `/clientes/me` global con reservas de todos los salones
- [x] Endpoint de favoritos del cliente
- [x] Endpoint de reseñas verificadas ligado a reserva completada
- [x] Endpoint de leads B2B desde `/business`
- [x] Endpoint para crear Stripe Checkout Session de alta B2B
- [x] Endpoint para abrir Stripe Customer Portal
- [x] Endpoint webhook de Stripe con verificación de firma
- [x] Endpoint para consultar estado de billing/suscripción del salón
- [x] Versionado de API (`/api/v1`) y estrategia de compatibilidad
- [x] Esquemas OpenAPI/Swagger actualizados para frontend y backend

### 4.13 Modelo de datos mínimo

- [x] `Salon`: slug, nombre comercial, descripción, categoría principal, categorías secundarias, dirección, ciudad, coordenadas
- [x] `SalonMedia`: portada, galería, alt text, orden, estado de publicación
- [x] `Service`: nombre, descripción, duración, precio, categoría, activo/inactivo
- [x] `Professional`: nombre, foto, servicios asignados, horario, estado
- [x] `AvailabilitySlot`: fecha, hora inicio, hora fin, servicio, profesional, capacidad
- [x] `Booking`: cliente, salón, servicio, profesional, estado, origen, precio, notas, política de cancelación
- [x] `Client`: nombre, apellidos, email, teléfono, preferencias, consentimiento, fecha de alta
- [x] `Review`: rating, comentario, reserva asociada, estado de moderación
- [x] `Favorite`: cliente, salón, fecha de creación
- [x] `BusinessLead`: nombre, salón, teléfono, email, ciudad, mensaje, fuente, estado CRM
- [x] `Plan`: nombre, precio, intervalo, límites, features, `stripePriceId`, activo/inactivo
- [x] `Subscription`: salón/cuenta, plan, estado, trial, periodo actual, cancelación, IDs de Stripe
- [x] `Invoice`: salón/cuenta, importe, moneda, estado, URL factura, periodo, ID de Stripe
- [x] `BillingProfile`: razón social, NIF/CIF, dirección fiscal, email facturación, país, IVA

### 4.14 Seguridad ✅

- [x] Tokens con expiración clara y refresh/renovación si aplica
- [x] Guardar sesión minimizando datos sensibles en `localStorage`; valorar cookies `HttpOnly` si el backend lo permite
- [x] Rate limiting visible para OTP, login, búsqueda y formularios públicos (HTTP 429 → `RATE_LIMITED` en `apiClient.ts`)
- [x] Protección anti-spam en formularios B2B (honeypot en `Contact.tsx` y `BusinessSignup.tsx`)
- [x] Validación cliente + servidor para teléfono, email, nombre, comentarios y reservas (`src/lib/validation.ts`)
- [x] Sanitización de contenido generado por salones/reseñas antes de renderizar (`sanitizeText` en `validation.ts`)
- [x] Cabeceras de seguridad: CSP, HSTS, X-Frame-Options, Referrer-Policy (`docs/nginx-security-headers.md`)
- [x] Política de permisos del navegador (`Permissions-Policy`) para geolocalización, cámara, etc.
- [x] Auditoría de dependencias (`npm audit --audit-level=high` en CI, job quality)
- [x] No exponer `debugCode` de OTP en producción
- [x] Verificar firma de webhooks Stripe y rechazar eventos no verificados (`StripeWebhookController.ts`)
- [x] Hacer idempotentes los procesadores de webhook Stripe — deduplicar por `stripe_event_id` en tabla `stripe_webhook_event`
- [x] Mantener claves secretas Stripe solo en backend; el frontend solo puede conocer publishable key si hace falta
- [x] Separar claramente Stripe test/live en variables de entorno y panel de administración

### 4.15 Diseño y sistema visual

- [x] Definir design tokens: color, tipografía, spacing, radio, sombras, z-index
- [x] Crear estados comunes de botones, inputs, selects, chips, tabs, dropdowns y modales
- [x] Unificar tarjetas de salón, cards B2B, badges y métricas
- [x] Definir variantes responsive para nav, filtros, grid, modales y booking
- [x] Añadir menú móvil completo con submenús accesibles
- [x] Revisar copy micro-UX: errores, vacíos, confirmaciones, permisos y loaders
- [x] Crear guía de iconografía basada en `lucide-react`
- [x] Mantener una paleta equilibrada y no depender de un solo tono dominante
- [x] Validar que no haya textos cortados en mobile, tablets y desktop ancho

### 4.16 Producto y conversión

- [x] Definir embudo cliente: búsqueda → ficha → reservar → login/guest → confirmación
- [x] Definir embudo salón: landing → demo/contacto → lead → onboarding → dashboard
- [x] Añadir CTAs contextuales en home, fichas, resultados vacíos y footer
- [x] Capturar intención de búsqueda aunque no haya resultados (`no_results_search`)
- [x] Crear páginas por intención local: "peluquería en Rubí", "barbería en Terrassa", etc.
- [x] Sistema de destacados/patrocinados con etiquetado transparente
- [x] Promociones por salón con fecha de inicio/fin y condiciones
- [x] Recuperación de reserva abandonada si el usuario se queda a mitad del flujo
- [x] Deep links compartibles a servicio concreto dentro de una ficha de salón

### 4.17 Reseñas, reputación y confianza

- [x] Solo permitir reseñas tras reserva completada
- [x] Mostrar distribución de estrellas y filtros por puntuación
- [x] Respuesta pública del salón a reseñas
- [x] Reporte/moderación de reseñas ofensivas o fraudulentas
- [x] Badges de confianza: verificado, responde rápido, alta recurrencia, top valorado
- [x] Mostrar políticas de cancelación y no-show antes de confirmar reserva
- [x] Mostrar información de pago/cobro con claridad si se añade prepago
- [x] Página o sección de seguridad/confianza para clientes

### 4.18 Notificaciones y comunicación

- [x] Confirmación de reserva por SMS/email/WhatsApp según consentimiento
- [x] Recordatorio 24 h antes y 2 h antes de la cita
- [x] Notificación de cancelación/reprogramación
- [x] Plantillas de mensajes por evento y por idioma
- [x] Preferencias granulares de notificación en `/mi-cuenta`
- [x] Historial de comunicaciones relevantes para soporte
- [x] Mensajes transaccionales separados de mensajes comerciales

### 4.19 Operación y soporte

- [x] Página `/estado` o enlace a estado del sistema
- [x] Flujo de contacto con motivo: cliente, salón, privacidad, prensa, empleo
- [x] Identificador de reserva visible para soporte
- [x] Registro de errores con `traceId` mostrado al usuario cuando falle una acción crítica
- [x] Runbook básico de incidencias: API caída, OTP caído, deploy fallido, VPS sin espacio
- [x] Backups y restauración documentados para datos críticos
- [x] Checklist de lanzamiento por release

### 4.20 Documentación del proyecto

- [x] Reescribir `README.md` para Allop, no para la plantilla React + Vite
- [x] Añadir instalación local, scripts, variables de entorno y comandos de build/deploy
- [x] Crear `.env.example` con `VITE_API_URL` y variables públicas necesarias
- [x] Documentar arquitectura de rutas y módulos
- [x] Documentar cómo añadir una nueva página legal/contenido
- [x] Documentar cómo añadir una nueva categoría/ciudad sin tocar lógica
- [x] Mantener `ROADMAP.md` con fecha, owners y estado por fase

---

## 5. FASES DE ENTREGA RECOMENDADAS

Estado actualizado: 2026-06-06.

| Fase | Owner | Estado | Nota |
| --- | --- | --- | --- |
| Fase 0 — Higiene y base técnica | Frontend / Producto | Completa | Base tecnica, SEO, API client, 404, legales y encoding visible revisados |
| Fase 1 — Marketplace real | Frontend / Backend | Completa | Marketplace, fichas, favoritos, filtros, ciudad, servicio y categoria operativos |
| Fase 2 — Reserva | Frontend / Backend | Completa | Reserva, disponibilidad, idempotencia, comunicaciones, cancelacion y eventos clave |
| Fase 3 — Cuenta cliente | Frontend / Backend | Completa | Cuenta, reservas, perfil, favoritos, resenas, exportacion y borrado local |
| Fase 4 — Crecimiento B2B | Producto / Growth | En progreso | Funnel y billing preparados; CRM/proceso operacional debe consolidarse |
| Fase 5 — Escala, calidad y contenido | Frontend / Producto | En progreso | Varias piezas hechas; quedan mejoras continuas y visual regression |

### Fase 0 — Higiene y base técnica

- [x] Corregir encoding/mojibake en textos visibles del código fuente si aparece en navegador o build
- [x] Reescribir `README.md`
- [x] Crear `.env.example`
- [x] Añadir 404 real y error boundary
- [x] Añadir páginas legales placeholder revisables por legal
- [x] Añadir banner de cookies sin cargar analítica antes del consentimiento
- [x] Configurar SEO base por ruta
- [x] Preparar API client tipado y estados de carga/error

### Fase 1 — Marketplace real

- [x] Reemplazar `SALONS` mock por API pública
- [x] Crear `/salones/:slug`
- [x] Crear listados por categoría y ciudad
- [x] Implementar filtros, ordenación y paginación
- [x] Añadir mapa o, como mínimo, distancia/geolocalización progresiva
- [x] Añadir favoritos básicos si hay sesión

### Fase 2 — Reserva

- [x] Crear flujo `/reservar/:salonSlug`
- [x] Integrar servicios y disponibilidad real
- [x] Confirmar reserva con idempotencia
- [x] Añadir confirmación por SMS/email
- [x] Añadir cancelación básica desde área cliente
- [x] Medir eventos de inicio, abandono y reserva completada

### Fase 3 — Cuenta cliente

- [x] Crear `/mi-cuenta`
- [x] Mostrar reservas globales, no solo por salón
- [x] Añadir perfil editable y preferencias
- [x] Añadir favoritos
- [x] Añadir reseñas post-visita
- [x] Añadir eliminación/exportación de cuenta

### Fase 4 — Crecimiento B2B

- [x] Convertir `/business` en funnel con formulario real
- [x] Añadir testimonios/casos de éxito
- [x] Añadir comparativa de planes
- [x] Añadir FAQ y demo/tour
- [x] Integrar leads con CRM o bandeja operacional

### Fase 5 — Escala, calidad y contenido

- [x] i18n español/catalán
- [x] Blog y páginas SEO locales
- [x] PWA
- [ ] Tests e2e y visual regression
- [ ] Optimización Lighthouse continua
- [ ] Experimentos A/B para CTAs y booking

---

## 6. MÉTRICAS DE ÉXITO

### Cliente

- [ ] Conversión de búsqueda a clic en salón
- [ ] Conversión de ficha a inicio de reserva
- [ ] Conversión de inicio de reserva a reserva confirmada
- [ ] Tiempo medio hasta reservar
- [ ] Porcentaje de reservas canceladas
- [ ] Porcentaje de usuarios recurrentes
- [ ] Uso de favoritos

### Salones

- [ ] Leads B2B enviados desde `/business`
- [ ] Conversión lead → demo
- [ ] Conversión demo → alta
- [ ] Salones activos publicados
- [ ] Servicios configurados por salón
- [ ] Reservas recibidas por salón desde marketplace

### Técnica

- [ ] Error rate frontend
- [ ] Error rate API en endpoints críticos
- [ ] Tiempo de carga LCP/INP/CLS
- [ ] Tiempo de respuesta de búsqueda
- [ ] Disponibilidad del VPS/API
- [ ] Fallos OTP por proveedor

---

## 7. DECISIONES ABIERTAS

### Decisiones ya tomadas por implementación actual

- [x] Reserva como invitado desde el lanzamiento: sí, se permite reservar con nombre y teléfono sin sesión.
- [x] Modelo de cobro inicial: suscripción B2B para salones con Stripe; reservas de clientes sin prepago por ahora.
- [x] Analítica: Plausible privacy-first, cargado solo con consentimiento.
- [x] Catalán: incluido como segunda lengua (`ca`) desde el lanzamiento.
- [x] Blog/contenido inicial: estático en frontend mediante `/guias`, `/blog` y taxonomía local; no CMS por ahora.
- [x] Auth cliente: cuenta global Allop para clientes, separada de los salones Tier 2. El frontend intenta endpoints globales (`/clientes/me`) y conserva fallback temporal por salón mientras backend se adapta.
- [x] Mapa/proveedor geográfico: Apple Maps. MapKit JS integrado con token backend y fallback visual propio; los enlaces externos a Apple Maps se mantienen como respaldo.
- [x] Proveedor SMS/WhatsApp/email: usar el mismo proveedor/proceso que ya funciona en Tier 2 con la Raspberry Pi.
- [x] Revisión legal: no bloquea esta fase; las páginas quedan como están y se revisarán más adelante.

### Pendientes de respuesta

- [ ] **Dónde llegan los contactos de salones interesados**
  - Explicación simple: cuando un salón rellena el formulario de `/business`, alguien tiene que recibir ese aviso y hacer seguimiento.
  - Opción A: que llegue por email a una persona/equipo.
  - Opción B: que se guarde en una lista interna sencilla dentro de Allop.
  - Opción C: que se mande a una herramienta comercial externa cuando se decida una.
  - Decisión necesaria: ¿quién debe recibir esos contactos ahora mismo y cómo los vais a gestionar al principio?

---

## 8. CRITERIOS DE "LISTO" POR FEATURE

- [ ] Funciona en desktop, tablet y mobile
- [ ] Tiene estados loading, empty y error
- [ ] Tiene navegación por teclado y foco visible
- [ ] No rompe build, lint ni tests existentes
- [ ] Tiene eventos analíticos definidos si afecta al funnel
- [ ] Tiene textos finales o copy marcado explícitamente como pendiente
- [ ] Tiene SEO básico si es una ruta indexable
- [ ] Tiene control de permisos/sesión si toca datos privados
- [ ] Tiene fallback si la API falla
- [ ] Está documentado si introduce ruta, variable de entorno o contrato nuevo

---

## 9. RESUMEN DE PRIORIDADES

### P0 — Obligatorio antes de lanzamiento real
- [x] Páginas legales reales (privacidad, términos, cookies)
- [x] Banner de cookies RGPD
- [x] Link a términos en checkbox de registro
- [x] `README.md` real del proyecto y `.env.example`
- [x] Página `/contacto` con formulario real o flujo claro de soporte
- [x] Página `/buscar` o URLs de búsqueda compartibles
- [x] Directorio `/salones` indexable
- [x] Perfil de salón (`/salones/:slug`)
- [x] Booking flow básico
- [x] Área de cliente (`/mi-cuenta`)
- [x] Submenús en navegación
- [x] Datos reales (reemplazar `salons.ts` mock)
- [x] API client tipado y errores normalizados
- [x] SEO básico (title, description, OG por ruta)
- [x] 404 personalizado
- [x] Error boundary
- [x] No exponer códigos OTP de debug en producción
- [x] Decidir modelo de cobro inicial: suscripción B2B, prepago cliente, señal o sin pagos en reservas

### P1 — Importante para crecimiento
- [x] Filtros avanzados en marketplace
- [x] Búsqueda con autocompletado
- [x] Vista de mapa
- [x] Páginas por servicio y ciudad para SEO local
- [x] Página `/confianza` y explicación clara de reseñas/reservas verificadas
- [x] Flujo "Reclama tu ficha" para salones
- [x] Formulario de alta real en `/business`
- [x] Página B2B de precios completa (`/business/precios`)
- [x] Stripe Checkout para alta self-service de salones
- [x] Stripe Customer Portal para gestionar suscripción y facturas
- [x] Webhooks Stripe verificados e idempotentes
- [x] Sección de testimonios en `/business`
- [x] Analytics (GA4 / Plausible)
- [x] Sentry/monitorización de errores
- [x] Resend code con countdown en auth
- [x] Redirect post-login
- [x] Lazy loading de imágenes
- [x] Sitemap.xml
- [x] Favoritos y reseñas verificadas

### P2 — Mejora de producto
- [x] Demo interactiva del panel en `/business`
- [x] Programa de fidelización visible
- [x] Ofertas/promociones por salón
- [x] Calculadora B2B de ahorro/no-shows
- [x] Login social (Google)
- [x] Modo oscuro
- [x] i18n catalán
- [x] PWA
- [x] Tests e2e
- [x] Blog

---

*Última actualización: 2026-06-06 — fases 0 a 3 completadas y fase 5 avanzada*

