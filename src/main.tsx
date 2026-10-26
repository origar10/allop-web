import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import ToastProvider from './components/ToastProvider.tsx'
import { I18nProvider } from './lib/i18n.tsx'
import { initMonitoring } from './lib/monitoring.ts'
import { registerServiceWorker } from './lib/pwa.ts'
import { ThemeProvider } from './lib/theme.tsx'
import { cargarRegion } from './lib/region.ts'
import { getLocale } from './lib/tr.ts'
import { API_BASE_URL } from './shared/apiClient.ts'

initMonitoring()
registerServiceWorker()

// País de la instalación ANTES de importar App: los textos que se resuelven al cargar un módulo
// (menús, listas…) tienen que salir ya en su idioma.
cargarRegion(API_BASE_URL)
  .then(() => {
    document.documentElement.lang = getLocale().slice(0, 2)
    return import('./App.tsx')
  })
  .then(({ default: App }) => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <ErrorBoundary>
          <ThemeProvider>
            <I18nProvider>
              <ToastProvider>
                <BrowserRouter>
                  <App />
                </BrowserRouter>
              </ToastProvider>
            </I18nProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </StrictMode>,
    )
  })
