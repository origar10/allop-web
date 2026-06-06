# Checklist de lanzamiento — Allop

> Verificaciones antes de hacer merge a `main` y desplegar a producción.

---

## Pre-merge (cada PR)

### Código
- [ ] `npm run build` sin errores
- [ ] `npx tsc --noEmit` sin errores de tipos
- [ ] Tests existentes pasan: `npm test`
- [ ] No hay secrets, API keys ni datos reales en el diff
- [ ] No hay `console.log`, `debugger` ni código muerto de debug
- [ ] Encoding correcto en textos en español (sin mojibake en el navegador)

### Funcionalidad
- [ ] La feature funciona en desktop y mobile
- [ ] Estados de error y vacío tienen fallback visual
- [ ] Si toca el flujo de reserva: probado el golden path completo
- [ ] Si toca auth: probado login y redirect post-login
- [ ] Si toca Stripe: probado con tarjeta de test `4242 4242 4242 4242`

### Seguridad
- [ ] Inputs validados en cliente y enviados al backend
- [ ] No se expone `STRIPE_SECRET_KEY` ni secretos en el frontend
- [ ] Si hay nuevo formulario público: tiene honeypot anti-spam
- [ ] Si hay nuevo endpoint API: está autenticado o tiene rate limiting

---

## Pre-deploy a producción

### Build y entorno
- [ ] `npm run build` en rama `main` sin warnings críticos
- [ ] `.env.example` actualizado si se añadió nueva variable
- [ ] Variables de entorno requeridas confirmadas en el VPS
- [ ] `VITE_API_URL` apunta a `https://api.allop.es/api` (no a localhost)

### Base de datos
- [ ] Si hay migración nueva: probada en staging primero
- [ ] Migración es reversible o hay backup previo al deploy
- [ ] No hay cambios destructivos de esquema sin plan de rollback

### Stripe (si aplica)
- [ ] Price IDs de producción (`pk_live_`) en variables del VPS
- [ ] Webhook secret de producción configurado
- [ ] Probado el flujo de checkout completo en staging con modo test

### SEO y contenido
- [ ] Si hay nueva ruta: añadida al sitemap
- [ ] Si se renombró una ruta: redirect 301 configurado
- [ ] Meta title y description correctos en producción

---

## Post-deploy

### Verificación inmediata (primeros 5 min)
- [ ] `curl https://allop.es` devuelve 200
- [ ] `curl https://api.allop.es/api/health` devuelve 200
- [ ] Home carga correctamente en navegador
- [ ] Búsqueda de salones funciona
- [ ] Login OTP funciona (si no está en modo test)

### Verificación extendida (primeros 30 min)
- [ ] Flujo de reserva completo funciona end-to-end
- [ ] Panel de salones accesible con credenciales de test
- [ ] Stripe webhook recibe eventos (dashboard.stripe.com → Webhooks)
- [ ] Sin errores nuevos en logs del VPS: `pm2 logs allop-backend --lines 100`
- [ ] Sin errores en localStorage de monitoring en el navegador

### Comunicación
- [ ] Anotar en `ROADMAP.md` los ítems completados con fecha
- [ ] Actualizar `progreso.md` con el resumen del cambio
- [ ] Si hay cambio visible para clientes: comunicar en canal interno

---

## Rollback rápido

Si algo falla tras deploy:

```bash
# Ver commits recientes
ssh allop-vps "cd /srv/allop-web && git log --oneline -5"

# Volver al commit anterior
ssh allop-vps "cd /srv/allop-web && git checkout <hash-anterior> && npm run build"
ssh allop-vps "pm2 restart allop-backend"
```

---

## Lanzamiento público (primera vez o nueva feature importante)

- [ ] Revisar todos los puntos anteriores
- [ ] Páginas legales actualizadas y revisadas por gestoría/legal
- [ ] Banner de cookies probado y conforme a RGPD
- [ ] Analytics configurado y disparando eventos correctamente
- [ ] Sentry/monitorización activo y enviando alertas
- [ ] Backup de BD hecho justo antes del lanzamiento
- [ ] Equipo disponible las 2h posteriores al lanzamiento para respuesta rápida

---

*Última revisión: 2026-06-06*
