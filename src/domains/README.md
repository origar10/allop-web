# Dominios frontend

`src/domains` fija la estructura objetivo por ownership de producto. La migracion desde `src/pages`, `src/components` y `src/lib` debe ser gradual: no se mueve codigo estable solo por reorganizar, pero el codigo nuevo debe entrar en el dominio correspondiente.

## Mapa

- `marketplace`: busqueda, filtros, fichas, ciudades, servicios, leads de usuarios y SEO publico.
- `auth`: OTP, login, registro, OAuth y sesion de cliente.
- `booking`: disponibilidad, reserva, confirmacion, cancelacion y politicas de cita.
- `account`: cuenta de cliente, favoritos, historial, perfil, puntos, privacidad y resenas.
- `business`: web B2B, alta self-service, Stripe, leads, onboarding y operaciones de salon.
- `legal`: cookies, privacidad, terminos, RGPD y textos legales.
- `shared`: utilidades sin ownership: API client, cache, estados, formatters, hooks genericos y providers.

## Estructura por dominio

```text
<domain>/
  pages/
  components/
  hooks/
  api/
  model/
```

Cada dominio puede tener un `README.md` propio si incorpora reglas particulares. `shared` no debe importar ningun dominio.
