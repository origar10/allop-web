# Cabeceras de seguridad nginx — allop.es

Añadir en el bloque `server {}` del virtual host de producción (`/etc/nginx/sites-available/allop.es`).  
Después de pegar: `nginx -t && systemctl reload nginx`

```nginx
# ── HSTS ──────────────────────────────────────────────────────────────────────
# Activa solo tras confirmar que HTTPS funciona sin errores en todos los subdominios.
# Empieza sin includeSubDomains y sin preload; añádelos en fases posteriores.
add_header Strict-Transport-Security "max-age=31536000" always;

# ── Framing ───────────────────────────────────────────────────────────────────
add_header X-Frame-Options "DENY" always;

# ── Sniffing ──────────────────────────────────────────────────────────────────
add_header X-Content-Type-Options "nosniff" always;

# ── Referrer ──────────────────────────────────────────────────────────────────
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# ── Permissions ───────────────────────────────────────────────────────────────
# Solo se usan: cámara (foto perfil), geolocalización (salones cercanos).
add_header Permissions-Policy "camera=(self), geolocation=(self), microphone=()" always;

# ── Content Security Policy ────────────────────────────────────────────────────
# Ajustar los dominios si se añaden CDNs, fuentes externas o terceros nuevos.
add_header Content-Security-Policy "
  default-src 'self';
  script-src  'self' 'unsafe-inline' https://plausible.io https://cdn.apple-mapkit.com;
  style-src   'self' 'unsafe-inline';
  img-src     'self' data: https://res.cloudinary.com https://*.apple-mapkit.com;
  font-src    'self';
  connect-src 'self' https://api.allop.es https://plausible.io https://sentry.io https://*.apple-mapkit.com;
  frame-src   'none';
  object-src  'none';
  base-uri    'self';
  form-action 'self' https://checkout.stripe.com;
  upgrade-insecure-requests;
" always;
```

## Notas

| Directiva | Razón |
|-----------|-------|
| `script-src 'unsafe-inline'` | Vite inyecta scripts inline en el bundle; eliminar cuando se configure nonce-based CSP en el server |
| `connect-src … sentry.io` | Eliminar si Sentry no se activa en este entorno |
| `img-src … cloudinary.com` | Fotos de salones se sirven desde Cloudinary; ajustar al dominio real del bucket |
| `*.apple-mapkit.com` | Necesario para MapKit JS y teselas de Apple Maps |
| `form-action … stripe.com` | Permite el redirect POST de Stripe Checkout |
| HSTS `preload` | No añadir hasta enviar a la lista de precarga de Chrome (irreversible) |

## Verificación

```bash
curl -I https://allop.es | grep -i "strict\|frame\|content-type\|referrer\|permissions\|content-security"
```

También comprobar con [securityheaders.com](https://securityheaders.com).
