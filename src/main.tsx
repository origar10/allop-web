import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import ToastProvider from './components/ToastProvider.tsx'
import { I18nProvider } from './lib/i18n.tsx'
import { initMonitoring } from './lib/monitoring.ts'
import { registerServiceWorker } from './lib/pwa.ts'
import { ThemeProvider } from './lib/theme.tsx'

initMonitoring()
registerServiceWorker()

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
