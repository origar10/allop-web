import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
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

describe('Nav i18n', () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'es';
  });

  it('switches common navigation strings to Catalan', async () => {
    const user = userEvent.setup();
    renderNav();

    await user.selectOptions(screen.getByLabelText('Seleccionar idioma'), 'ca');

    expect(screen.getByText('Buscar saló')).toBeInTheDocument();
    expect(screen.getByText('Com funciona')).toBeInTheDocument();
    expect(localStorage.getItem('allop.locale')).toBe('ca');
    await waitFor(() => expect(document.documentElement).toHaveAttribute('lang', 'ca'));
  });
});
