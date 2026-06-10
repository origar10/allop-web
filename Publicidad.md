# Sistema de Marketing y Visibilidad — Allop

> Documento de diseño. Estado: propuesta, pendiente de validación.
> Última actualización: 2026-06-10.

---

## Contexto y referentes

Los marketplaces de reservas de belleza más importantes operan con modelos de **comisión por reserva completada**, no por clic ni por impresión:

| Plataforma | Comisión nuevos clientes | Repetición | Boost/Publicidad |
|---|---|---|---|
| Treatwell | 35 % | 0 % | Subscription mensual (~€29–100) |
| Fresha | 20 % + 2,29 % + €0,20 (pago) | 0 % | Herramientas de marketing incluidas |
| Booksy Boost | 30 % (mín. $10, máx. $100) | 0 % | Solo se activa si el salón lo quiere |

El modelo **pay-per-booking** es el estándar del sector porque alinea incentivos: el salón solo paga si hay conversión real.

---

## Modelo propuesto para Allop

### Principio base

- Listarse en Allop es **gratuito** (el salón paga por el software, no por el marketplace).
- La visibilidad premium es **opcional** y se activa salón a salón.
- Allop cobra únicamente sobre **reservas completadas** que vengan del boost — nunca por clics ni impresiones.

---

## Niveles de visibilidad

### 1. Estándar (gratis)
- Aparece en resultados ordenados por relevancia (distancia + rating + actividad reciente).
- Badge sin distinción visual.

### 2. Destacado ⭐
- El salón aparece con un badge "Destacado" y ocupa las primeras posiciones del bloque de salones de su zona/categoría.
- Máximo **3 salones destacados** por pantalla (para que tenga valor real).
- **Coste: comisión del 15 % sobre cada reserva nueva** que llegue desde allop mientras el boost está activo.
  - Solo nuevos clientes (primera reserva con ese salón).
  - Clientes que ya reservaron con el salón vía allop: comisión 0 %.
- El salón activa/desactiva el boost desde el dashboard. Efecto inmediato.

### 3. Primer resultado 🏆
- El salón aparece como resultado número 1 fijo dentro de su ciudad/categoría principal.
- Solo **1 salón** puede ocupar el primer puesto por combinación ciudad+categoría.
- **Coste: comisión del 20 % sobre reservas nuevas** mientras está activo.
- Si dos salones quieren el mismo slot, se adjudica al que lleve más tiempo activo o, en caso de empate, se entra en lista de espera (no subasta — evita guerra de precios).

---

## Mecánica de comisión

```
Reserva completada
  → ¿Es cliente nuevo para este salón?  
      Sí → aplica % de comisión sobre importe total del servicio
      No → comisión 0 %

Reserva cancelada o no presentada → comisión 0 %
```

- "Cliente nuevo" = nunca ha tenido una reserva completada con ese salón en allop.
- La comisión se descuenta automáticamente en la liquidación mensual del salón.
- El salón ve en su dashboard: reservas boost, comisiones generadas, coste total del mes.

---

## UI — pestaña en el dashboard

Nueva pestaña **"Visibilidad"** en el dashboard del salón:

```
┌─────────────────────────────────────────────────────────────┐
│  Visibilidad en allop                                        │
│                                                              │
│  Tu posición actual: Estándar                               │
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────────────┐ │
│  │  ⭐ Destacado         │  │  🏆 Primer resultado         │ │
│  │                      │  │                              │ │
│  │  Aparece entre los   │  │  Posición nº1 en tu          │ │
│  │  3 primeros de tu    │  │  ciudad y categoría          │ │
│  │  zona               │  │                              │ │
│  │                      │  │  Disponibilidad:             │ │
│  │  Comisión: 15 %      │  │  ✅ Libre / ⏳ Lista espera  │ │
│  │  solo nuevos clientes│  │                              │ │
│  │                      │  │  Comisión: 20 %              │ │
│  │  [Activar boost]     │  │  solo nuevos clientes        │ │
│  └──────────────────────┘  │                              │ │
│                             │  [Unirme a lista de espera] │ │
│                             └──────────────────────────────┘ │
│                                                              │
│  Rendimiento este mes                                        │
│  Reservas boost: 8   Nuevos clientes: 6   Comisión: 43,20 € │
└─────────────────────────────────────────────────────────────┘
```

---

## UI — allop.es (marketplace)

- **Badge "Destacado"**: chip pequeño sobre la card del salón, mismo estilo visual que los badges existentes (`Abre ahora`, etc.), pero en tono dorado/ámbar.
- **Primer resultado**: card del salón con borde sutil en acento + label "Nº1 en tu zona".
- **Transparencia**: un pequeño "¿Qué es esto?" enlaza a una página explicativa para usuarios.
- No se usa la palabra "Publicidad" ni "Patrocinado" — se dice "Destacado" y "Primer resultado" para mantener confianza.

---

## Anti-fraude y protecciones

- Comisión solo sobre reservas con estado `completada` (el cliente asistió).
- Las reservas del propio empleado o del propietario no cuentan.
- El sistema detecta reservas repetidas del mismo cliente (mismo teléfono/email) y no las cobra como nuevas.
- El salón puede pausar el boost en cualquier momento — sin penalización.

---

## Monetización estimada (hipótesis)

Supuesto conservador: 10 salones activos con boost, media 15 reservas nuevas/mes, ticket medio 35 €.

| Nivel | Salones | Reservas nuevas/mes | Comisión | Ingreso/mes |
|---|---|---|---|---|
| Destacado (15 %) | 8 | 120 | 15 % × 35 € | 504 € |
| Primer resultado (20 %) | 2 | 30 | 20 % × 35 € | 210 € |
| **Total** | | | | **~714 €/mes** |

A 50 salones activos: ~3.500 €/mes solo de boost.

---

## Fases de implementación

### Fase A — Backend (allop-platform)
- [ ] Modelo `BoostSalon`: `salonId`, `nivel` (destacado | primer_resultado), `activo`, `fechaInicio`
- [ ] Endpoint `PUT /salones/:slug/boost` (activar/desactivar)
- [ ] Lógica en `GET /salones` para ordenar según boost activo
- [ ] Registro de comisiones: cuando una reserva pasa a `completada`, calcular y registrar comisión si el cliente es nuevo

### Fase B — Dashboard
- [ ] Pestaña "Visibilidad" en el dashboard del salón
- [ ] Widget de rendimiento (reservas boost, comisión acumulada del mes)
- [ ] Activar/desactivar con un toggle

### Fase C — allop.es
- [ ] Badge "Destacado" en `SalonCard`
- [ ] Ordenación de resultados respeta boost
- [ ] Página de transparencia para usuarios finales

### Fase D — Liquidación
- [ ] Informe mensual de comisiones por salón
- [ ] Integración con Stripe para cobro automático de comisiones al salón

---

## Pendiente de decidir

- ¿Límite de salones "Destacados" por zona/categoría? (propuesta: 3 por combinación ciudad+categoría)
- ¿Qué ocurre si no hay primer resultado disponible en una búsqueda? → el primer resultado orgánico sube automáticamente.
- ¿Se cobra IVA sobre la comisión? → sí, la comisión es un servicio B2B (21 % IVA).
- ¿Mínimo de permanencia? → propuesta: no, el salón puede pausar en cualquier momento.
