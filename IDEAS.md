# Ideas y funcionalidades pendientes

## Promoción activa — Huecos con descuento esta semana

> **Idea de UI (hero / banner de la home)**
> Texto: _"Huecos con descuento esta semana — Encuentra salones con últimas plazas y precios especiales en servicios de corte, color y manicura."_

**Concepto:** sección o banner destacado en la home (y posiblemente en el listado de salones) que muestra huecos de última hora con descuento. Los salones podrían marcar franjas horarias con poca demanda y asociarles un precio reducido; el marketplace las surfacea como "ofertas de la semana".

**Lo que haría falta (rough):**
- Modelo de datos: `HuecoDescuento` (salón, servicio, fecha/hora, precio_original, precio_descuento, plazas_disponibles, caducidad)
- API: endpoint en platform-backend `/salones/marketplace/ofertas?lat&lng&radio`
- Dashboard: UI para que el salón cree/gestione sus huecos con descuento
- allop-web: componente `PromoSection` en la home, con tarjetas de oferta y CTA de reserva directa

**Estado:** no existe aún. Idea anotada el 2026-06-10.
