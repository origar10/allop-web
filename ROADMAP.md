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
│   ├── Starter — 39 €/mes
│   ├── Pro — 79 €/mes
│   └── Scale — A medida
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

- [ ] Dashboard con próximas reservas destacadas
- [ ] Historial completo de reservas con estado (confirmada, cancelada, completada)
- [ ] Acción de cancelar reserva pendiente
- [ ] Acción de añadir reseña tras visita completada
- [ ] Lista de salones favoritos con acceso rápido
- [ ] Perfil editable: nombre, apellidos, email, foto
- [ ] Historial de puntos de fidelización
- [ ] Preferencias de notificación (SMS, email)
- [ ] Sección de seguridad: sesiones activas, cerrar sesión en todos los dispositivos

### 3.5 Auth (`/login`, `/register`)

- [ ] Eliminar selector de salón del flujo (la sesión no debería ser por salón sino global)
- [ ] Añadir campo email opcional en registro
- [ ] Texto de ayuda sobre el código SMS
- [ ] Link a términos en el checkbox de aceptación (ahora es texto plano)
- [ ] Resend code con countdown (60 s)
- [ ] Mejorar mensajes de error (más específicos)
- [ ] Añadir login social (Google) — opcional pero muy demandado
- [ ] Redirect automático al origen tras login (query param `?next=/reservar/...`)

### 3.6 Business landing (`/business`)

- [ ] Demo interactiva o video del panel (30 s)
- [ ] Sección de testimonios de salones reales con foto y nombre
- [ ] Métricas de confianza: "N salones", "M reservas gestionadas", "X% satisfacción"
- [ ] Comparativa de planes en tabla (actualmente solo cards)
- [ ] FAQ desplegable (accordion) para salones
- [ ] Formulario de contacto real (en lugar de mailto)
- [ ] Integración con CRM / formulario de alta real
- [ ] Sección de integraciones soportadas (TPV, WhatsApp, Stripe)
- [ ] Chat de soporte en vivo o widget (Crisp, Intercom)
- [ ] Sección "¿Por qué Allop vs agenda de papel?"

### 3.7 Home y contenido comercial que falta

- [ ] Bloque de confianza above-the-fold: reservas verificadas, cancelación clara, soporte, privacidad
- [ ] Módulo "Servicios populares" con links SEO a `/servicios/:slug`
- [ ] Módulo "Ciudades populares" con links SEO a `/ciudad/:slug`
- [ ] Módulo "Salones nuevos en Allop" para dar vida al marketplace
- [ ] Módulo "Ofertas cerca de ti" si hay promociones activas
- [ ] Bloque de explicación para usuarios indecisos: qué pasa tras reservar, cómo se confirma, cómo cancelar
- [ ] Bloque de reseñas reales de clientes con enlace a la ficha del salón
- [ ] CTA "¿No encuentras tu salón?" para sugerir un negocio
- [ ] CTA "Reclama tu ficha" para propietarios de salones ya listados
- [ ] Estado vacío comercial cuando no hay resultados: sugerir ampliar zona, quitar filtros o dejar teléfono/email
- [ ] Captura de lead cuando una búsqueda no devuelve resultados en una ciudad
- [ ] Landing local por ciudad con texto, categorías, salones top, FAQ y enlaces internos

### 3.8 Elementos concretos de confianza y soporte

- [ ] Políticas visibles de cancelación, retrasos y no-show antes de reservar
- [ ] Indicador de "reserva pendiente/confirmada" para no prometer disponibilidad falsa
- [ ] Centro de ayuda con preguntas para clientes y salones separadas
- [ ] Formulario de soporte con número de reserva opcional
- [ ] Página de contacto con email, formulario y tiempos estimados de respuesta
- [ ] Mensaje claro si Allop es intermediario, software del salón o ambas cosas
- [ ] Explicar cómo se verifican reseñas y salones
- [ ] Información de privacidad entendible para teléfono, SMS, email y geolocalización
- [ ] Sistema para reportar datos incorrectos en una ficha de salón
- [ ] Sistema para que un salón reclame o actualice su ficha
- [ ] Enlaces legales accesibles desde checkout/reserva, auth y footer

### 3.9 Precios y venta B2B más completa

- [ ] Tabla de planes con límites claros: usuarios, empleados, sedes, reservas, recordatorios, soporte
- [ ] Página o sección "Qué incluye" con módulos del producto explicados sin marketing vacío
- [ ] Calculadora simple de ahorro: no-shows evitados, tiempo de gestión, reservas mensuales
- [ ] Comparativa contra alternativas: agenda papel, WhatsApp manual, Google Calendar, otros softwares
- [ ] FAQ comercial: permanencia, alta, migración, soporte, pagos, formación, cancelación
- [ ] Proceso de onboarding visible: demo, configuración, migración, formación, salida a producción
- [ ] Casos de uso por tipo de negocio: peluquería, barbería, estética, uñas, spa
- [ ] CTA secundario "Ver demo del panel" además de "Solicitar demo"
- [ ] Lead magnet útil: checklist de digitalización o guía anti no-show para salones
- [ ] Testimonios con contexto: ciudad, tamaño del salón, problema resuelto, resultado

### 3.10 Contenido editorial/SEO específico

- [ ] Taxonomía estable de servicios y categorías con slugs no cambiantes
- [ ] Páginas "servicio + ciudad" priorizadas: `/peluqueria/rubi`, `/barberia/terrassa`, etc.
- [ ] FAQs indexables por intención: precio, duración, preparación, cancelación, reservas
- [ ] Guías evergreen para clientes: cómo elegir salón, qué preguntar, cuidado post-servicio
- [ ] Guías para salones: reducir ausencias, organizar agenda, captar clientes, fidelización
- [ ] Sistema de enlaces internos entre ciudad, categoría, servicio y ficha de salón
- [ ] Sitemap separado para salones, servicios, ciudades, blog y legales
- [ ] Canonicalización de URLs con filtros para evitar contenido duplicado
- [ ] Página de prensa/media kit con logo, descripción corta, contacto y recursos de marca

### 3.11 Pagos self-service con Stripe

- [ ] Definir si el self-service es solo para salones B2B, para clientes finales, o ambos
- [ ] Crear flujo `/business/alta` para que un salón pueda elegir plan y empezar sin intervención comercial
- [ ] Crear selección de plan con mensual/anual, trial si aplica, límites y precio final con IVA
- [ ] Integrar Stripe Checkout para alta de suscripción B2B
- [ ] Integrar Stripe Customer Portal para cambiar plan, actualizar tarjeta, descargar facturas y cancelar
- [ ] Crear pantalla de éxito tras pago (`/business/alta/success`) con estado de activación del salón
- [ ] Crear pantalla de cancelación/error (`/business/alta/cancel`) con recuperación del proceso
- [ ] Asociar `stripeCustomerId`, `stripeSubscriptionId` y estado de suscripción al salón/cuenta
- [ ] Sincronizar estados desde webhooks: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`
- [ ] Bloquear/desbloquear acceso a módulos B2B según plan y estado de pago
- [ ] Mostrar avisos de pago fallido, tarjeta caducada, trial terminando y suscripción cancelada
- [ ] Definir grace period por impago antes de limitar el servicio
- [ ] Preparar facturación con IVA, datos fiscales del salón y dirección de facturación
- [ ] Soportar cupones/códigos promocionales si se van a usar en campañas
- [ ] Registrar eventos analíticos: plan visto, checkout iniciado, checkout completado, checkout abandonado, portal abierto, cancelación
- [ ] Evitar guardar datos de tarjeta en Allop; todo pago sensible debe quedar en Stripe
- [ ] Documentar modo test/live, claves necesarias y checklist antes de pasar a producción
- [ ] Crear proceso interno para reconciliar pagos, incidencias y suscripciones en Stripe
- [ ] Decidir si en el futuro habrá pagos de clientes por reserva: prepago, señal, no-show fee o pago completo

---

## 4. TÉCNICO Y TRANSVERSAL

### 4.1 SEO

- [ ] `<title>` y `<meta description>` dinámicos por ruta
- [ ] Open Graph (`og:title`, `og:description`, `og:image`) por página
- [ ] Twitter Card meta tags
- [ ] URLs canónicas
- [ ] `sitemap.xml` generado en build
- [ ] `robots.txt`
- [ ] Schema.org (LocalBusiness, Product, Review) en fichas de salón
- [ ] Breadcrumbs estructurados
- [ ] URLs limpias y SEO-friendly

### 4.2 Rendimiento

- [ ] Lazy loading de imágenes (`loading="lazy"`, `srcset`)
- [ ] Componentes lazy con `React.lazy` + `Suspense` por ruta
- [ ] Compresión de imágenes (WebP)
- [ ] Preload de fuente Inter
- [ ] Code splitting por ruta (ya lo hace Vite, revisar tamaño de chunks)
- [ ] Lighthouse score > 90 en todas las métricas

### 4.3 Analítica y monitorización

- [ ] Google Analytics 4 o Plausible (privacy-first)
- [ ] Eventos de conversión: búsqueda, clic en salón, inicio reserva, reserva completada, registro
- [ ] Sentry o similar para captura de errores en producción
- [ ] Uptime monitoring del VPS

### 4.4 Legal y privacidad

- [ ] Banner de cookies (RGPD) con opt-in real antes de cargar GA
- [ ] Páginas legales reales (`/privacidad`, `/terminos`, `/cookies`, `/aviso-legal`)
- [ ] Checkbox de términos en registro con link a la página real (no texto plano)
- [ ] Derecho de supresión / portabilidad: botón "Eliminar mi cuenta" en perfil
- [ ] DPA (Data Processing Agreement) para salones

### 4.5 Accesibilidad

- [ ] Skip link al contenido principal
- [ ] Focus trap en modales (actualmente sin gestión de foco)
- [ ] Focus visible en todos los elementos interactivos
- [ ] Orden de tabulación lógico en formularios
- [ ] Contraste de color AAA en textos pequeños
- [ ] `alt` descriptivos en todas las imágenes reales
- [ ] `aria-live` en mensajes de error/éxito de formularios
- [ ] Auditoría con axe-core o Lighthouse Accessibility

### 4.6 Testing

- [ ] Tests unitarios de utilidades (`normalize`, `matchesQuery`, `formatBookingDate`)
- [ ] Tests de componentes clave con Vitest + Testing Library
- [ ] Tests e2e del booking flow con Playwright
- [ ] Tests de regresión visual (Chromatic o Percy) — opcional

### 4.7 Internacionalización

- [ ] Separar strings en fichero de traducciones (i18n)
- [ ] Soporte catalán (`ca`) como segunda lengua
- [ ] Selector de idioma en Nav

### 4.8 CI/CD y entornos

- [ ] Variable de entorno `VITE_API_URL` documentada con `.env.example`
- [ ] Entorno de staging separado del de producción
- [ ] Preview deploys por PR (Vercel o Netlify si se migra, o rama `staging` en VPS)
- [ ] Health check de la API antes del deploy

### 4.9 PWA

- [ ] `manifest.webmanifest` con nombre, colores, iconos
- [ ] Service worker básico (offline fallback)
- [ ] Instalable en móvil ("Añadir a pantalla de inicio")

### 4.10 UX general

- [ ] Modo oscuro (CSS `prefers-color-scheme` + toggle)
- [ ] Toast notifications para acciones (reserva guardada, sesión cerrada, etc.)
- [ ] Página 404 personalizada con sugerencias
- [ ] Error boundary global con fallback
- [ ] Loading spinners/skeletons en todas las peticiones async
- [ ] Confirmación antes de cancelar reserva
- [ ] Scroll to top en cambio de ruta (ya implementado, mantener)
- [ ] Breadcrumb en páginas internas (`Home > Peluquería > Feromi`)

### 4.11 Arquitectura frontend

- [ ] Definir estructura estable por dominios: `marketplace`, `auth`, `booking`, `account`, `business`, `legal`, `shared`
- [ ] Separar componentes de página, componentes reutilizables, hooks y llamadas API
- [ ] Crear capa de cliente API tipada (`apiClient`) con timeout, errores normalizados y manejo de sesión
- [ ] Usar `AbortController` en búsquedas, disponibilidad y peticiones cancelables
- [ ] Añadir cache de datos para consultas repetidas (TanStack Query o patrón local equivalente)
- [ ] Definir estados estándar: `idle`, `loading`, `success`, `empty`, `error`
- [ ] Centralizar formateadores: moneda, duración, distancia, fechas, teléfonos
- [x] Evitar navegación externa para perfiles (`goTo('https://allop.es/...')`) y usar rutas internas
- [ ] Sustituir redirects comodín a `/` por una ruta 404 real
- [ ] Documentar convenciones de nombres, rutas y ownership de módulos

### 4.12 Contratos de API y backend

- [ ] Endpoint público de búsqueda de salones con filtros: texto, ciudad, categoría, precio, rating, fecha, lat/lng
- [ ] Endpoint de detalle de salón por slug con servicios, empleados, horarios, fotos, reseñas y SEO
- [ ] Endpoint de disponibilidad por servicio/profesional/rango de fechas
- [ ] Endpoint de creación de reserva idempotente con `idempotencyKey`
- [ ] Endpoint de cancelación/reprogramación con reglas de negocio claras
- [ ] Endpoint global de auth cliente, sin depender de `salonSlug`
- [ ] Endpoint `/clientes/me` global con reservas de todos los salones
- [ ] Endpoint de favoritos del cliente
- [ ] Endpoint de reseñas verificadas ligado a reserva completada
- [ ] Endpoint de leads B2B desde `/business`
- [ ] Endpoint para crear Stripe Checkout Session de alta B2B
- [ ] Endpoint para abrir Stripe Customer Portal
- [ ] Endpoint webhook de Stripe con verificación de firma
- [ ] Endpoint para consultar estado de billing/suscripción del salón
- [ ] Versionado de API (`/api/v1`) y estrategia de compatibilidad
- [ ] Esquemas OpenAPI/Swagger actualizados para frontend y backend

### 4.13 Modelo de datos mínimo

- [ ] `Salon`: slug, nombre comercial, descripción, categoría principal, categorías secundarias, dirección, ciudad, coordenadas
- [ ] `SalonMedia`: portada, galería, alt text, orden, estado de publicación
- [ ] `Service`: nombre, descripción, duración, precio, categoría, activo/inactivo
- [ ] `Professional`: nombre, foto, servicios asignados, horario, estado
- [ ] `AvailabilitySlot`: fecha, hora inicio, hora fin, servicio, profesional, capacidad
- [ ] `Booking`: cliente, salón, servicio, profesional, estado, origen, precio, notas, política de cancelación
- [ ] `Client`: nombre, apellidos, email, teléfono, preferencias, consentimiento, fecha de alta
- [ ] `Review`: rating, comentario, reserva asociada, estado de moderación
- [ ] `Favorite`: cliente, salón, fecha de creación
- [ ] `BusinessLead`: nombre, salón, teléfono, email, ciudad, mensaje, fuente, estado CRM
- [ ] `Plan`: nombre, precio, intervalo, límites, features, `stripePriceId`, activo/inactivo
- [ ] `Subscription`: salón/cuenta, plan, estado, trial, periodo actual, cancelación, IDs de Stripe
- [ ] `Invoice`: salón/cuenta, importe, moneda, estado, URL factura, periodo, ID de Stripe
- [ ] `BillingProfile`: razón social, NIF/CIF, dirección fiscal, email facturación, país, IVA

### 4.14 Seguridad

- [ ] Tokens con expiración clara y refresh/renovación si aplica
- [ ] Guardar sesión minimizando datos sensibles en `localStorage`; valorar cookies `HttpOnly` si el backend lo permite
- [ ] Rate limiting visible para OTP, login, búsqueda y formularios públicos
- [ ] Protección anti-spam en formularios B2B (honeypot, Turnstile/reCAPTCHA o rate limit)
- [ ] Validación cliente + servidor para teléfono, email, nombre, comentarios y reservas
- [ ] Sanitización de contenido generado por salones/reseñas antes de renderizar
- [ ] Cabeceras de seguridad: CSP, HSTS, X-Frame-Options/`frame-ancestors`, Referrer-Policy
- [ ] Política de permisos del navegador (`Permissions-Policy`) para geolocalización, cámara, etc.
- [ ] Auditoría de dependencias (`npm audit` o alternativa en CI)
- [ ] No exponer `debugCode` de OTP en producción
- [ ] Verificar firma de webhooks Stripe y rechazar eventos no verificados
- [ ] Hacer idempotentes los procesadores de webhook Stripe para evitar dobles activaciones/cobros reflejados
- [ ] Mantener claves secretas Stripe solo en backend; el frontend solo puede conocer publishable key si hace falta
- [ ] Separar claramente Stripe test/live en variables de entorno y panel de administración

### 4.15 Diseño y sistema visual

- [ ] Definir design tokens: color, tipografía, spacing, radio, sombras, z-index
- [ ] Crear estados comunes de botones, inputs, selects, chips, tabs, dropdowns y modales
- [ ] Unificar tarjetas de salón, cards B2B, badges y métricas
- [ ] Definir variantes responsive para nav, filtros, grid, modales y booking
- [ ] Añadir menú móvil completo con submenús accesibles
- [ ] Revisar copy micro-UX: errores, vacíos, confirmaciones, permisos y loaders
- [ ] Crear guía de iconografía basada en `lucide-react`
- [ ] Mantener una paleta equilibrada y no depender de un solo tono dominante
- [ ] Validar que no haya textos cortados en mobile, tablets y desktop ancho

### 4.16 Producto y conversión

- [ ] Definir embudo cliente: búsqueda → ficha → reservar → login/guest → confirmación
- [ ] Definir embudo salón: landing → demo/contacto → lead → onboarding → dashboard
- [ ] Añadir CTAs contextuales en home, fichas, resultados vacíos y footer
- [ ] Capturar intención de búsqueda aunque no haya resultados (`no_results_search`)
- [ ] Crear páginas por intención local: "peluquería en Rubí", "barbería en Terrassa", etc.
- [ ] Sistema de destacados/patrocinados con etiquetado transparente
- [ ] Promociones por salón con fecha de inicio/fin y condiciones
- [ ] Recuperación de reserva abandonada si el usuario se queda a mitad del flujo
- [ ] Deep links compartibles a servicio concreto dentro de una ficha de salón

### 4.17 Reseñas, reputación y confianza

- [ ] Solo permitir reseñas tras reserva completada
- [ ] Mostrar distribución de estrellas y filtros por puntuación
- [ ] Respuesta pública del salón a reseñas
- [ ] Reporte/moderación de reseñas ofensivas o fraudulentas
- [ ] Badges de confianza: verificado, responde rápido, alta recurrencia, top valorado
- [ ] Mostrar políticas de cancelación y no-show antes de confirmar reserva
- [ ] Mostrar información de pago/cobro con claridad si se añade prepago
- [ ] Página o sección de seguridad/confianza para clientes

### 4.18 Notificaciones y comunicación

- [ ] Confirmación de reserva por SMS/email/WhatsApp según consentimiento
- [ ] Recordatorio 24 h antes y 2 h antes de la cita
- [ ] Notificación de cancelación/reprogramación
- [ ] Plantillas de mensajes por evento y por idioma
- [ ] Preferencias granulares de notificación en `/mi-cuenta`
- [ ] Historial de comunicaciones relevantes para soporte
- [ ] Mensajes transaccionales separados de mensajes comerciales

### 4.19 Operación y soporte

- [ ] Página `/estado` o enlace a estado del sistema
- [ ] Flujo de contacto con motivo: cliente, salón, privacidad, prensa, empleo
- [ ] Identificador de reserva visible para soporte
- [ ] Registro de errores con `traceId` mostrado al usuario cuando falle una acción crítica
- [ ] Runbook básico de incidencias: API caída, OTP caído, deploy fallido, VPS sin espacio
- [ ] Backups y restauración documentados para datos críticos
- [ ] Checklist de lanzamiento por release

### 4.20 Documentación del proyecto

- [ ] Reescribir `README.md` para Allop, no para la plantilla React + Vite
- [ ] Añadir instalación local, scripts, variables de entorno y comandos de build/deploy
- [ ] Crear `.env.example` con `VITE_API_URL` y variables públicas necesarias
- [ ] Documentar arquitectura de rutas y módulos
- [ ] Documentar cómo añadir una nueva página legal/contenido
- [ ] Documentar cómo añadir una nueva categoría/ciudad sin tocar lógica
- [ ] Mantener `ROADMAP.md` con fecha, owners y estado por fase

---

## 5. FASES DE ENTREGA RECOMENDADAS

### Fase 0 — Higiene y base técnica

- [ ] Corregir encoding/mojibake en textos visibles del código fuente si aparece en navegador o build
- [ ] Reescribir `README.md`
- [ ] Crear `.env.example`
- [ ] Añadir 404 real y error boundary
- [ ] Añadir páginas legales placeholder revisables por legal
- [ ] Añadir banner de cookies sin cargar analítica antes del consentimiento
- [ ] Configurar SEO base por ruta
- [ ] Preparar API client tipado y estados de carga/error

### Fase 1 — Marketplace real

- [x] Reemplazar `SALONS` mock por API pública
- [x] Crear `/salones/:slug`
- [ ] Crear listados por categoría y ciudad
- [x] Implementar filtros, ordenación y paginación
- [x] Añadir mapa o, como mínimo, distancia/geolocalización progresiva
- [x] Añadir favoritos básicos si hay sesión

### Fase 2 — Reserva

- [x] Crear flujo `/reservar/:salonSlug`
- [x] Integrar servicios y disponibilidad real
- [x] Confirmar reserva con idempotencia
- [x] Añadir confirmación por SMS/email
- [ ] Añadir cancelación básica desde área cliente
- [ ] Medir eventos de inicio, abandono y reserva completada

### Fase 3 — Cuenta cliente

- [ ] Crear `/mi-cuenta`
- [ ] Mostrar reservas globales, no solo por salón
- [ ] Añadir perfil editable y preferencias
- [ ] Añadir favoritos
- [ ] Añadir reseñas post-visita
- [ ] Añadir eliminación/exportación de cuenta

### Fase 4 — Crecimiento B2B

- [ ] Convertir `/business` en funnel con formulario real
- [ ] Añadir testimonios/casos de éxito
- [ ] Añadir comparativa de planes
- [ ] Añadir FAQ y demo/tour
- [ ] Integrar leads con CRM o bandeja operacional

### Fase 5 — Escala, calidad y contenido

- [ ] i18n español/catalán
- [ ] Blog y páginas SEO locales
- [ ] PWA
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

- [ ] ¿Auth cliente será global por teléfono/email o seguirá vinculada temporalmente a salón?
- [ ] ¿Se permitirá reserva como invitado desde el lanzamiento?
- [ ] ¿Habrá prepago, señal o solo reserva sin pago?
- [ ] ¿Google Maps, Mapbox u otra solución para mapas?
- [ ] ¿Analítica privacy-first (Plausible) o GA4?
- [ ] ¿Catalán en lanzamiento o en fase posterior?
- [ ] ¿El blog será estático/MDX, CMS headless o gestionado desde backend?
- [ ] ¿Qué CRM o proceso operacional recibirá los leads B2B?
- [ ] ¿Qué proveedor se usará para SMS/WhatsApp/email transaccional?
- [ ] ¿Qué páginas legales deben revisar abogado/gestoría antes de publicar?

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
- [ ] Páginas legales reales (privacidad, términos, cookies)
- [ ] Banner de cookies RGPD
- [ ] Link a términos en checkbox de registro
- [ ] `README.md` real del proyecto y `.env.example`
- [ ] Página `/contacto` con formulario real o flujo claro de soporte
- [ ] Página `/buscar` o URLs de búsqueda compartibles
- [ ] Directorio `/salones` indexable
- [x] Perfil de salón (`/salones/:slug`)
- [x] Booking flow básico
- [ ] Área de cliente (`/mi-cuenta`)
- [ ] Submenús en navegación
- [x] Datos reales (reemplazar `salons.ts` mock)
- [ ] API client tipado y errores normalizados
- [ ] SEO básico (title, description, OG por ruta)
- [ ] 404 personalizado
- [ ] Error boundary
- [ ] No exponer códigos OTP de debug en producción
- [ ] Decidir modelo de cobro inicial: suscripción B2B, prepago cliente, señal o sin pagos en reservas

### P1 — Importante para crecimiento
- [x] Filtros avanzados en marketplace
- [x] Búsqueda con autocompletado
- [x] Vista de mapa
- [ ] Páginas por servicio y ciudad para SEO local
- [ ] Página `/confianza` y explicación clara de reseñas/reservas verificadas
- [ ] Flujo "Reclama tu ficha" para salones
- [ ] Formulario de alta real en `/business`
- [ ] Página B2B de precios completa (`/business/precios`)
- [ ] Stripe Checkout para alta self-service de salones
- [ ] Stripe Customer Portal para gestionar suscripción y facturas
- [ ] Webhooks Stripe verificados e idempotentes
- [ ] Sección de testimonios en `/business`
- [ ] Analytics (GA4 / Plausible)
- [ ] Sentry/monitorización de errores
- [ ] Resend code con countdown en auth
- [ ] Redirect post-login
- [ ] Lazy loading de imágenes
- [ ] Sitemap.xml
- [ ] Favoritos y reseñas verificadas

### P2 — Mejora de producto
- [ ] Demo interactiva del panel en `/business`
- [ ] Programa de fidelización visible
- [ ] Ofertas/promociones por salón
- [ ] Calculadora B2B de ahorro/no-shows
- [ ] Login social (Google)
- [ ] Modo oscuro
- [ ] i18n catalán
- [ ] PWA
- [ ] Tests e2e
- [ ] Blog

---

*Última actualización: 2026-06-05*
