import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../lib/i18n';
import { ThemeProvider } from '../lib/theme';
import ToastProvider from './ToastProvider';
import Nav from './Nav';

function renderNav() {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <I18nProvider>
          <ToastProvider>
            <Nav
              onSearch={vi.fn()}
              onLogin={vi.fn()}
              onRegister={vi.fn()}
              onBusiness={vi.fn()}
              dashboardUrl="https://dashboard.allop.es"
            />
          </ToastProvider>
        </I18nProvider>
      </ThemeProvider>
    </MemoryRouter>,
  );
}

describe('Nav', () => {
  it('renders the search input', () => {
    renderNav();
    expect(screen.getByLabelText('Buscar servicio o salón')).toBeInTheDocument();
  });
});
