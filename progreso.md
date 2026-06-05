# Progreso allop-web

## 2026-06-05 - Marketplace Home, ROADMAP 3.1

### Hecho
- Ampliada la Home del marketplace con filtros avanzados sobre los datos actuales:
  - precio maximo con slider,
  - valoracion minima,
  - distancia maxima,
  - disponibilidad por hoy/manana/esta semana,
  - ordenacion por recomendados, rating, precio, distancia y disponibilidad.
- Anadida busqueda con sugerencias/autocompletado local usando nombres de salones, categorias, tags y chips.
- Ampliados los chips rapidos de busqueda con mas servicios.
- Anadidos badges de estado en cards: "Abre ahora", "Ultimas plazas" y "Nuevo".
- Anadido proximo hueco visible en cada card.
- Anadido bloque de accesos por ciudad y accion "Usar ubicacion" que prioriza orden por distancia con los datos mock disponibles.
- Anadida vista alternativa "Mapa" con pins interactivos basada en los salones actuales. Es una vista provisional sin Google Maps/Mapbox.
- Anadida paginacion progresiva con boton "Cargar mas salones".
- Anadidos skeleton loaders durante cambios de filtros/busqueda.
- Anadida seccion "Cerca de ti" ordenada por distancia.
- Mejorado el estado vacio de resultados con acciones claras.
- Ajustados estilos responsive para filtros, resultados, mapa, badges y skeletons.

### Archivos modificados
- `src/pages/Home.tsx`
- `src/components/SalonCard.tsx`
- `src/data/salons.ts`
- `src/index.css`

### Validacion
- `npm.cmd run lint` OK.
- `npm.cmd run build` OK.

## 2026-06-05 - Booking flow, ROADMAP 3.3

### Hecho
- Creada la ruta real `/reservar/:salonSlug`.
- Anadido flujo de reserva en 6 pasos:
  - seleccion de servicio con precio y duracion,
  - seleccion de profesional, incluyendo "Cualquiera disponible",
  - calendario de disponibilidad desde API con fallback local,
  - seleccion de hora,
  - resumen y confirmacion,
  - pantalla final con localizador de reserva.
- Anadida reserva con sesion si existe; si no, reserva como invitado con nombre y telefono.
- Anadida entrada opcional de email y notas para el salon.
- Anadida capa `createBooking` con `Idempotency-Key`; si el backend no responde, devuelve confirmacion local pendiente.
- Anadida capa `listAvailability` para disponibilidad por salon/servicio/profesional con fallback.
- Anadida confirmacion de SMS/email como estado de respuesta/fallback.
- Anadida cancelacion desde pantalla de confirmacion.
- Extraido helper compartido `salonDetails` para servicios, profesionales, fechas y horarios.
- Actualizado `ROADMAP.md`: punto 3.3 completo y checks relacionados de Fase 2/P0 sincronizados.

### Archivos modificados/anadidos
- `src/pages/BookingFlow.tsx`
- `src/lib/bookingApi.ts`
- `src/lib/salonDetails.ts`
- `src/pages/SalonProfile.tsx`
- `src/App.tsx`
- `src/index.css`
- `ROADMAP.md`
- `progreso.md`

### Validacion
- `npm.cmd run lint` OK.
- `npm.cmd run build` OK.

## 2026-06-05 - Perfil de salon, ROADMAP 3.2

### Hecho
- Creada la ruta interna `/salones/:slug`.
- Sustituida la navegacion externa a `https://allop.es/salones/...` por navegacion interna con React Router.
- Anadida pagina de ficha de salon con:
  - galeria/carrusel de fotos,
  - header con portada, nombre, rating, direccion, badges y CTA de reserva,
  - lista de servicios con duracion y precio,
  - selector de fecha/hora y redireccion temporal de `/reservar/:salonSlug` al bloque `#reservar`,
  - profesionales,
  - resenas verificadas con paginacion incremental,
  - mapa con pin por coordenadas,
  - horarios,
  - telefono, URL canonica y enlace social,
  - tags/categorias,
  - favorito basico condicionado a sesion,
  - compartir ficha con Web Share API o copia de URL,
  - SEO por salon: title, description, Open Graph y canonical.
- Actualizado `ROADMAP.md`: punto 3.2 completo y checks relacionados de Fase 1/P0/arquitectura sincronizados.

### Archivos modificados/anadidos
- `src/pages/SalonProfile.tsx`
- `src/App.tsx`
- `src/index.css`
- `ROADMAP.md`
- `progreso.md`

### Validacion
- `npm.cmd run lint` OK.
- `npm.cmd run build` OK.
- Nota: `npm run ...` directo en PowerShell queda bloqueado por la politica local de ejecucion de scripts; se uso `npm.cmd`.
- `ROADMAP.md` actualizado con checks completados y notas de avance parcial del punto 3.1.

### Pendiente del punto 3.1
- Sin pendientes funcionales directos del punto 3.1.
- Decision futura: si se exige proveedor visual externo, conectar Google Maps o Mapbox con clave/configuracion. La vista actual usa pins calculados por coordenadas y no necesita API key.
- Decision futura: si backend pagina resultados, mover la paginacion progresiva local a paginacion API.

## 2026-06-05 - Cierre completo ROADMAP 3.1

### Hecho
- Anadida capa `listMarketplaceSalons` para cargar salones desde API publica y usar `SALONS` solo como fallback si la API falla.
- Anadido `AbortController` en la carga inicial de salones.
- Anadido debounce real de 250 ms para busqueda/autocompletado.
- Anadidas coordenadas `lat/lng` a los salones y recalculo de distancia cuando el usuario acepta geolocalizacion.
- Mejorada la vista mapa: los pins se posicionan desde coordenadas del salon, no desde posiciones fijas.
- Anadida seccion de resenas recientes en Home.
- Anadido banner promocional configurable desde datos.
- Anadidos estados `loading`, `empty` y aviso de fallback API en el marketplace.
- `ROADMAP.md` actualizado: punto 3.1 completo y resumen de Fase 1/P1 sincronizado.

### Archivos modificados/anadidos en esta tanda
- `src/lib/salonsApi.ts`
- `src/pages/Home.tsx`
- `src/data/salons.ts`
- `src/index.css`
- `ROADMAP.md`
- `progreso.md`

### Validacion
- `npm.cmd run lint` OK.
- `npm.cmd run build` OK.
