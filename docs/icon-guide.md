# Guía de iconografía — allop-web

Librería: [`lucide-react`](https://lucide.dev). Tamaño base: `size={16}` o `size={14}` en texto inline; `size={20}` para acciones standalone; `size={24}` para ilustraciones vacías.

## Navegación y acciones de usuario

| Icono | Uso |
|-------|-----|
| `Search` | Barra de búsqueda, botones de buscar |
| `Menu` | Hamburger — abrir menú móvil |
| `X` | Cerrar menú móvil, cerrar modal, limpiar filtros |
| `ChevronDown` | Menú desplegable de usuario, acordeones |
| `ArrowRight` | CTAs, enlaces de progresión (siguiente paso) |
| `ExternalLink` | Enlace que abre pestaña nueva |

## Autenticación y sesión

| Icono | Uso |
|-------|-----|
| `UserRound` | Avatar de usuario en nav, perfil |
| `LogIn` | Acción de iniciar sesión |
| `LogOut` | Acción de cerrar sesión |
| `UserPlus` | Registro de nuevo cliente |
| `ShieldCheck` | Verificación, seguridad, confianza |
| `RotateCcw` | Reenviar código OTP, reintentar |

## Salones y servicios

| Icono | Uso |
|-------|-----|
| `Star` | Puntuación / valoración (fill en amarillo cuando activa) |
| `BadgeCheck` | Salón verificado |
| `Image` | Placeholder de foto de salón |
| `MapPin` | Ubicación geográfica |
| `Scissors` | Servicios de peluquería (categoría) |
| `Store` | Salón / negocio genérico |

## Reservas y calendario

| Icono | Uso |
|-------|-----|
| `CalendarDays` | Fecha de reserva, cita |
| `Clock` | Hora, duración de servicio |
| `CheckCircle` | Confirmación, estado completado |
| `AlertTriangle` | Advertencia, estado con problema |
| `Phone` | Teléfono de contacto |

## Negocio (B2B)

| Icono | Uso |
|-------|-----|
| `CreditCard` | Pago, facturación |
| `Receipt` | Factura, historial de pagos |
| `Lock` | Seguridad de datos, cifrado |
| `Sparkles` | Características premium, destacado |
| `MessageCircle` | Comunicación, reseñas, chat |
| `FileText` | Documento, contrato, términos |

## Contenido y ayuda

| Icono | Uso |
|-------|-----|
| `BookOpen` | Guías, tutoriales |
| `HelpCircle` | Preguntas frecuentes, ayuda |
| `Heart` | Favoritos, confianza emocional |
| `Download` | Descarga de activos (prensa) |
| `Mail` | Email de contacto |
| `Newspaper` | Prensa, notas de prensa |

## Tema

| Icono | Uso |
|-------|-----|
| `Moon` | Activar modo oscuro |
| `Sun` | Activar modo claro |

## Normas de uso

- No mezclar estilos de distintas librerías. Solo `lucide-react`.
- No usar `fill` salvo en estrellas de valoración activas (`Star`, fill: `#FBBF24`).
- El color hereda de `currentColor` por defecto — ajustar con clases CSS, no con prop `color`.
- Acompañar siempre con texto visible o `aria-label` cuando el icono es el único elemento de una acción interactiva.
- En botones con icono + texto, el icono va a la izquierda del texto.
