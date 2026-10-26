import { Component, type ErrorInfo, type ReactNode } from 'react';
import { captureError } from '../lib/monitoring';

import { tr } from '../lib/tr';
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  traceId?: string;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const traceId = captureError(error, 'boundary', info.componentStack || undefined);
    this.setState({ traceId });
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-boundary">
          <section>
            <p className="eyebrow">{tr('Error de aplicación')}</p>
            <h1>{tr('Algo ha fallado al cargar.')}</h1>
            <p>{tr('Hemos registrado el error automáticamente. Vuelve al inicio o contacta con soporte si el problema afecta a una reserva activa.')}</p>
            {this.state.traceId && (
              <p className="error-trace-id">
                {tr('Referencia:')}{' '}<code>{this.state.traceId}</code>
              </p>
            )}
            <a className="btn btn-primary" href="/">{tr('Volver al inicio')}</a>
            <a className="btn btn-ghost" href={`/contacto?motivo=error-tecnico&traza=${this.state.traceId || ''}`}>
              {tr('Contactar soporte')}
            </a>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
