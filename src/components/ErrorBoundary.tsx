import { Component, type ErrorInfo, type ReactNode } from 'react';
import { captureError } from '../lib/monitoring';

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
            <p className="eyebrow">Error de aplicación</p>
            <h1>Algo ha fallado al cargar.</h1>
            <p>Hemos registrado el error automáticamente. Vuelve al inicio o contacta con soporte si el problema afecta a una reserva activa.</p>
            {this.state.traceId && (
              <p className="error-trace-id">
                Referencia: <code>{this.state.traceId}</code>
              </p>
            )}
            <a className="btn btn-primary" href="/">Volver al inicio</a>
            <a className="btn btn-ghost" href={`/contacto?motivo=error-tecnico&traza=${this.state.traceId || ''}`}>
              Contactar soporte
            </a>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
