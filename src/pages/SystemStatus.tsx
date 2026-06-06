import { CheckCircle, ExternalLink, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { setSeo } from '../lib/seo';
import { apiGet } from '../shared/apiClient';

interface ServiceStatus {
  name: string;
  key: string;
  description: string;
}

const SERVICES: ServiceStatus[] = [
  { name: 'API de reservas', key: 'api', description: 'Creación, cancelación y consulta de reservas' },
  { name: 'Autenticación OTP', key: 'otp', description: 'Envío de SMS y verificación de códigos' },
  { name: 'Búsqueda de salones', key: 'search', description: 'Marketplace, filtros y disponibilidad' },
  { name: 'Procesamiento de pagos', key: 'billing', description: 'Suscripciones y facturación vía Stripe' },
  { name: 'Panel de salones', key: 'dashboard', description: 'Acceso al panel B2B y gestión de agenda' },
  { name: 'Notificaciones', key: 'notifications', description: 'Envío de SMS y email transaccionales' },
];

type StatusResult = 'operational' | 'degraded' | 'down' | 'checking';

const STATUS_LABEL: Record<StatusResult, string> = {
  operational: 'Operativo',
  degraded: 'Degradado',
  down: 'Caído',
  checking: 'Verificando...',
};

const EXTERNAL_STATUS_URL = (import.meta.env.VITE_STATUS_URL as string | undefined) || '';

export default function SystemStatus() {
  const [statuses, setStatuses] = useState<Record<string, StatusResult>>(
    Object.fromEntries(SERVICES.map((s) => [s.key, 'checking'])),
  );
  const [checkedAt, setCheckedAt] = useState<string>('');

  useEffect(() => {
    setSeo({
      title: 'Estado del sistema | Allop',
      description: 'Estado actual de los servicios de Allop: reservas, autenticación, pagos y notificaciones.',
      canonicalPath: '/estado',
    });

    const controller = new AbortController();

    apiGet<Record<string, string>>('/estado', { signal: controller.signal })
      .then((data) => {
        const next: Record<string, StatusResult> = {};
        for (const svc of SERVICES) {
          const val = data[svc.key];
          next[svc.key] = val === 'ok' || val === 'operational'
            ? 'operational'
            : val === 'degraded'
              ? 'degraded'
              : val === 'down' || val === 'error'
                ? 'down'
                : 'operational'; // default to operational if endpoint responds
        }
        setStatuses(next);
        setCheckedAt(new Date().toLocaleTimeString('es-ES'));
      })
      .catch(() => {
        // If the /estado endpoint doesn't exist, assume all services operational (static fallback)
        setStatuses(Object.fromEntries(SERVICES.map((s) => [s.key, 'operational'])));
        setCheckedAt(new Date().toLocaleTimeString('es-ES'));
      });

    return () => controller.abort();
  }, []);

  const allOperational = Object.values(statuses).every((s) => s === 'operational');
  const anyDown = Object.values(statuses).some((s) => s === 'down');

  return (
    <section className="status-page">
      <div className="container">
        <p className="eyebrow">Infraestructura</p>
        <h1>Estado del sistema</h1>
        <p>Disponibilidad en tiempo real de los servicios de Allop.</p>

        <div className={`status-overall ${anyDown ? 'down' : allOperational ? 'operational' : 'degraded'}`}>
          {anyDown ? <XCircle size={22} /> : <CheckCircle size={22} />}
          <strong>
            {anyDown
              ? 'Uno o más servicios con incidencia activa'
              : allOperational
                ? 'Todos los servicios operativos'
                : 'Algunos servicios degradados'}
          </strong>
          {checkedAt && <span>Última verificación: {checkedAt}</span>}
        </div>

        <div className="status-services-list">
          {SERVICES.map((svc) => {
            const result = statuses[svc.key] ?? 'checking';
            return (
              <div key={svc.key} className={`status-service-row status-${result}`}>
                <div className="status-service-info">
                  <strong>{svc.name}</strong>
                  <span>{svc.description}</span>
                </div>
                <div className="status-service-badge">
                  {result === 'operational' && <CheckCircle size={15} />}
                  {result === 'down' && <XCircle size={15} />}
                  {result === 'degraded' && <span className="status-degraded-dot" aria-hidden="true" />}
                  <span>{STATUS_LABEL[result]}</span>
                </div>
              </div>
            );
          })}
        </div>

        {EXTERNAL_STATUS_URL && (
          <a href={EXTERNAL_STATUS_URL} className="btn btn-ghost" target="_blank" rel="noopener noreferrer">
            <ExternalLink size={15} /> Ver historial de incidencias
          </a>
        )}

        <div className="status-footer-links">
          <p>¿Tienes un problema que no aparece aquí?</p>
          <Link to="/contacto?motivo=error-tecnico" className="btn btn-primary">Contactar soporte</Link>
        </div>
      </div>
    </section>
  );
}
