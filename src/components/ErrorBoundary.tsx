import { Component, type ErrorInfo, type ReactNode } from 'react';
import { captureError } from '../lib/monitoring';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    captureError(error, 'boundary', info.componentStack || undefined);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-boundary">
          <section>
            <p className="eyebrow">Error de aplicacion</p>
            <h1>Algo no ha cargado bien.</h1>
            <p>Hemos registrado el error para revisarlo. Puedes volver al marketplace o contactar con soporte si afecta a una reserva.</p>
            <a className="btn btn-primary" href="/">Volver al inicio</a>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
