# Runbook de incidencias — Allop

> Procedimientos de respuesta ante incidencias en producción. Actualizar tras cada incidente.

---

## 1. API caída (`/api/…` devuelve 5xx o no responde)

**Síntomas**: reservas no se crean, búsqueda no devuelve resultados, OTP falla.

**Diagnóstico**
```bash
# Comprobar estado del proceso en VPS
ssh allop-vps "pm2 status"

# Ver últimos logs del backend
ssh allop-vps "pm2 logs allop-backend --lines 100"

# Ping directo al endpoint
curl -I https://api.allop.es/api/health
```

**Pasos de recuperación**
1. Si el proceso está caído: `pm2 restart allop-backend`
2. Si los logs muestran `ECONNREFUSED` a BD: verificar PostgreSQL con `systemctl status postgresql`
3. Si PostgreSQL caído: `systemctl start postgresql` → reiniciar backend
4. Si disco lleno (ENOSPC): liberar espacio en `/var/log` o rotar PM2 logs (`pm2 flush`)
5. Si error en código (TypeError, etc.): revisar commits recientes con `git log --oneline -10`, hacer rollback si es necesario

**Comunicación**: actualizar `/estado` y avisar en canal interno con el traceId de la primera petición fallida visible en logs.

---

## 2. OTP caído (SMS no llegan)

**Síntomas**: clientes no reciben código SMS, `POST /api/auth/otp` devuelve error, `POST /api/auth/verificar-otp` siempre falla.

**Diagnóstico**
```bash
# Ver logs del controlador de OTP
ssh allop-vps "pm2 logs allop-backend --lines 200 | grep -i otp"

# Comprobar variables del proveedor SMS
ssh allop-vps "pm2 env allop-backend | grep -i sms"
```

**Causas frecuentes**
- Credenciales del proveedor SMS caducadas o agotadas (Twilio, Vonage, etc.)
- Límite de tasa del proveedor superado
- Número de teléfono bloqueado por el proveedor
- Variable `SMS_PROVIDER_KEY` no cargada tras redeploy

**Pasos de recuperación**
1. Acceder al panel del proveedor SMS y verificar saldo/créditos y estado del servicio
2. Si las credenciales son correctas y el proveedor está operativo: reiniciar el backend
3. Si el proveedor está caído: activar proveedor de respaldo si está configurado
4. Comunicar a soporte que el login puede requerir contacto manual hasta que se resuelva

---

## 3. Deploy fallido (CI/CD no completa)

**Síntomas**: push a `main` no actualiza la web en producción, health check de CI falla.

**Diagnóstico**
```bash
# Ver estado del último deploy
ssh allop-vps "cat /var/log/allop-deploy.log | tail -50"

# Verificar que la web sirve
curl -I https://allop.es
```

**Pasos de recuperación**
1. Revisar el log de CI/CD en el servidor (o en GitHub Actions si se usa)
2. Si falla el build de frontend: `cd /srv/allop-web && npm run build` manualmente para ver el error
3. Si falla el backend: comprobar errores de TypeScript o migración de BD
4. Rollback seguro:
   ```bash
   ssh allop-vps "cd /srv/allop-web && git log --oneline -5"
   ssh allop-vps "cd /srv/allop-web && git checkout <commit-anterior>"
   ssh allop-vps "pm2 restart allop-backend"
   ```
5. Nunca hacer rollback de migraciones de BD en producción sin revisar dependencias

---

## 4. VPS sin espacio en disco

**Síntomas**: deploys fallan con ENOSPC, PM2 no puede escribir logs, PostgreSQL no puede hacer commits.

**Diagnóstico**
```bash
df -h
du -sh /var/log/* | sort -rh | head -10
pm2 logs --lines 0  # cuántos MB ocupan los logs de PM2
```

**Pasos de recuperación**
1. Rotar logs de PM2: `pm2 flush`
2. Limpiar logs del sistema: `journalctl --vacuum-size=200M`
3. Limpiar node_modules de builds anteriores: `find /srv -name node_modules -maxdepth 3 -type d`
4. Si hay dumps o backups antiguos en `/tmp`: eliminarlos
5. Si el problema es estructural (disco < 20 GB libres), ampliar el volumen en el proveedor VPS

---

## 5. Webhook de Stripe falla (pagos no se procesan)

**Síntomas**: suscripciones no se activan tras pago, panel del salón sigue bloqueado después de pago exitoso.

**Diagnóstico**
```bash
# Ver eventos fallidos en el panel de Stripe
# https://dashboard.stripe.com/webhooks → endpoint → Events

# Ver logs del controlador de webhook
ssh allop-vps "pm2 logs allop-backend --lines 200 | grep -i webhook"
```

**Pasos de recuperación**
1. En el panel de Stripe, reenviar el evento fallido con "Resend"
2. Si la firma no pasa: verificar que `STRIPE_WEBHOOK_SECRET` en el VPS corresponde al endpoint activo
3. Si hay error en el handler: revisar `StripeWebhookController.ts`, corregir y redesplegar
4. Los webhooks son idempotentes (tabla `stripe_webhook_event`): reenviar es seguro

---

## Escalado de incidencias

| Severidad | Criterio | Acción |
|---|---|---|
| P0 | API caída > 5 min | Notificar a todos; prioridad máxima |
| P1 | OTP caído > 10 min | Soporte activo; avisar a usuarios afectados |
| P2 | Feature degradada | Solucionar en el sprint actual |
| P3 | Error intermitente | Monitorizar y resolver en próximos días |

---

*Última revisión: 2026-06-06*
