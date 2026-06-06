# Backups y restauración — Allop

> Política de copias de seguridad para datos críticos de producción.

---

## Datos críticos

| Dato | Ubicación | Criticidad |
|---|---|---|
| Base de datos PostgreSQL | VPS `/var/lib/postgresql` | **Alta** — reservas, clientes, salones, pagos |
| Variables de entorno | VPS `~/.env` / PM2 env | **Alta** — secretos y claves de terceros |
| Código fuente | GitHub `main` | Media — reproducible desde el repo |
| Logs de aplicación | VPS `/var/log/allop` | Baja — para diagnóstico post-mortem |

---

## Política de backups de PostgreSQL

### Backup automático diario

Añadir al crontab del VPS (`crontab -e`):

```bash
# Backup diario a las 03:00
0 3 * * * pg_dump -U postgres allop_prod | gzip > /backups/allop_$(date +\%Y\%m\%d).sql.gz

# Eliminar backups de más de 30 días
0 4 * * * find /backups -name "allop_*.sql.gz" -mtime +30 -delete
```

### Backup remoto (S3 / Backblaze B2)

```bash
# Requiere rclone configurado con el bucket
0 3 * * * pg_dump -U postgres allop_prod | gzip | rclone rcat b2:allop-backups/allop_$(date +\%Y\%m\%d).sql.gz
```

### Verificación semanal

```bash
# Comprobar que los backups existen y no están vacíos
ls -lh /backups/allop_*.sql.gz | tail -7
```

---

## Restauración desde backup

### 1. Parar la aplicación

```bash
pm2 stop allop-backend
```

### 2. Restaurar la base de datos

```bash
# Crear BD de restauración (no machacar la producción directamente)
createdb -U postgres allop_restore

# Restaurar
gunzip -c /backups/allop_20260101.sql.gz | psql -U postgres allop_restore

# Verificar integridad
psql -U postgres allop_restore -c "SELECT COUNT(*) FROM reservas;"
psql -U postgres allop_restore -c "SELECT COUNT(*) FROM clientes;"

# Si todo OK, renombrar
psql -U postgres -c "ALTER DATABASE allop_prod RENAME TO allop_prod_old;"
psql -U postgres -c "ALTER DATABASE allop_restore RENAME TO allop_prod;"
```

### 3. Reiniciar la aplicación

```bash
pm2 start allop-backend
# Verificar que la API responde
curl https://api.allop.es/health
```

### 4. Eliminar la BD antigua

```bash
# Solo tras confirmar que todo funciona
dropdb -U postgres allop_prod_old
```

---

## Variables de entorno

Las variables de entorno **no están en el repositorio**. Se gestionan manualmente en el VPS.

### Ubicación

```
/srv/allop-platform/.env
```

### Variables críticas que deben estar presentes

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
SMS_PROVIDER_KEY=...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...
```

### Backup de variables

```bash
# Guardar copia cifrada en lugar seguro (no en el repo)
gpg --symmetric --cipher-algo AES256 /srv/allop-platform/.env
# Guardar el .env.gpg en un gestor de contraseñas o almacenamiento fuera del VPS
```

---

## Tiempo de recuperación objetivo (RTO/RPO)

| Escenario | RPO (pérdida máxima de datos) | RTO (tiempo hasta recuperación) |
|---|---|---|
| Fallo de aplicación | 0 (sin pérdida de datos) | < 5 min |
| Corrupción de BD | < 24h (último backup diario) | < 2h |
| Pérdida del VPS | < 24h | < 4h (rebuild desde backup) |

---

*Última revisión: 2026-06-06*
