import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import CookieBanner from './CookieBanner';
import { I18nProvider } from '../lib/i18n';

function renderBanner() {
  return render(
    <MemoryRouter>
      <I18nProvider>
        <CookieBanner />
      </I18nProvider>
    </MemoryRouter>,
  );
}

describe('CookieBanner', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('stores rejected consent and hides the banner', async () => {
    const user = userEvent.setup();
    renderBanner();

    await user.click(screen.getByRole('button', { name: /rechazar/i }));

    expect(localStorage.getItem('allop.analytics.consent')).toBe('rejected');
    expect(screen.queryByLabelText(/preferencias de cookies/i)).not.toBeInTheDocument();
  });

  it('does not render once consent already exists', () => {
    localStorage.setItem('allop.analytics.consent', 'accepted');
    renderBanner();

    expect(screen.queryByLabelText(/preferencias de cookies/i)).not.toBeInTheDocument();
  });
});
