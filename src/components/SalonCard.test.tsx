import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SALONS } from '../data/salons';
import SalonCard from './SalonCard';

describe('SalonCard', () => {
  it('renders salon content, image alt text and notifies selection', async () => {
    const salon = SALONS[0];
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(<SalonCard {...salon} onSelect={onSelect} />);

    expect(screen.getByRole('button', { name: `Abrir ficha de ${salon.name}` })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: `Imagen de ${salon.name}` })).toBeInTheDocument();
    expect(screen.getByText(salon.name)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`Desde ${salon.desde}`))).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: `Abrir ficha de ${salon.name}` }));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
