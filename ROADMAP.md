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

---

## 3. FUNCIONALIDADES POR SECCIÓN

### 3.1 Marketplace (Home)

- [ ] Filtros avanzados: precio máximo (slider), valoración mínima, distancia, disponibilidad hoy/mañana/esta semana
- [ ] Vista de mapa (Google Maps / Mapbox) con pins de salones
- [ ] Paginación o infinite scroll (actualmente solo 6 salones)
- [ ] Búsqueda con autocompletado (debounce + sugerencias de salones y servicios)
- [ ] Chips de búsqueda rápida ampliados (más servicios, más zonas)
- [ ] Badges de estado: "Abre ahora", "Últimas plazas", "Nuevo"
- [ ] Ordenación manual: por valoración, por precio, por distancia, por disponibilidad
- [ ] Sección "Cerca de ti" (geolocalización del navegador)
- [ ] Sección de reseñas recientes en home
- [ ] Banner promocional configurable (descuentos, novedades)
- [ ] Skeleton loaders mientras carga el grid
- [ ] Datos reales desde API (reemplazar mock `salons.ts`)

### 3.2 Perfil de salón (`/salones/:slug`)

- [ ] Galería de fotos (carrusel)
- [ ] Header con imagen de portada, nombre, rating, dirección y botón reservar
- [ ] Lista de servicios con nombre, duración y precio
- [ ] Selector de fecha y hora con disponibilidad real
- [ ] Lista de profesionales del salón
- [ ] Sección de reseñas verificadas con paginación
- [ ] Mapa incrustado con ubicación
- [ ] Horarios de apertura
- [ ] Información de contacto (teléfono, web, redes)
- [ ] Tags y categorías
- [ ] Badge de verificado / destacado
- [ ] Botón "Guardar favorito" (requiere sesión)
- [ ] Compartir ficha (URL canónica, botones share)
- [ ] SEO: meta title, description, Open Graph por salón

### 3.3 Booking flow (`/reservar/:salonSlug`)

- [ ] Paso 1: Selección de servicio (lista con precio y duración)
- [ ] Paso 2: Selección de profesional (opcional, "cualquiera disponible")
- [ ] Paso 3: Calendario de disponibilidad real (de API)
- [ ] Paso 4: Selección de hora
- [ ] Paso 5: Resumen y confirmación
- [ ] Paso 6: Confirmación con número de reserva
- [ ] Requiere sesión iniciada (redirect a login si no)
- [ ] Posibilidad de reservar como invitado (solo teléfono)
- [ ] Email/SMS de confirmación tras reservar
- [ ] Cancelación desde confirmación

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

---

## 5. RESUMEN DE PRIORIDADES

### P0 — Obligatorio antes de lanzamiento real
- [ ] Páginas legales reales (privacidad, términos, cookies)
- [ ] Banner de cookies RGPD
- [ ] Link a términos en checkbox de registro
- [ ] Perfil de salón (`/salones/:slug`)
- [ ] Booking flow básico
- [ ] Área de cliente (`/mi-cuenta`)
- [ ] Submenús en navegación
- [ ] Datos reales (reemplazar `salons.ts` mock)
- [ ] SEO básico (title, description, OG por ruta)
- [ ] 404 personalizado
- [ ] Error boundary

### P1 — Importante para crecimiento
- [ ] Filtros avanzados en marketplace
- [ ] Búsqueda con autocompletado
- [ ] Vista de mapa
- [ ] Formulario de alta real en `/business`
- [ ] Sección de testimonios en `/business`
- [ ] Analytics (GA4 / Plausible)
- [ ] Resend code con countdown en auth
- [ ] Redirect post-login
- [ ] Lazy loading de imágenes
- [ ] Sitemap.xml

### P2 — Mejora de producto
- [ ] Demo interactiva del panel en `/business`
- [ ] Programa de fidelización visible
- [ ] Login social (Google)
- [ ] Modo oscuro
- [ ] i18n catalán
- [ ] PWA
- [ ] Tests e2e
- [ ] Blog

---

*Última actualización: 2026-06-04*
