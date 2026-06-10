import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Salon } from '../data/salons';
import SalonCard from './SalonCard';

const mockSalon: Salon = {
  id: 'test-1',
  slug: 'test-salon',
  name: 'Test Salón',
  category: 'Peluquería',
  location: 'Barcelona',
  distance: '0.5 km',
  rating: 4.8,
  reviews: 42,
  desde: 20,
  tags: ['corte', 'color'],
  verified: true,
  featured: false,
  phone: '+34600000000',
  address: 'Calle Test 1',
  lat: 41.38,
  lng: 2.17,
  description: 'Salón de prueba',
  imageClass: 'salon-img-feromi',
  nextSlot: 'Mañana 10:00',
  promotions: [],
};

describe('SalonCard', () => {
  it('renders salon content, image alt text and notifies selection', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(<SalonCard {...mockSalon} onSelect={onSelect} />);

    expect(screen.getByRole('button', { name: `Abrir ficha de ${mockSalon.name}` })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: `Imagen de ${mockSalon.name}` })).toBeInTheDocument();
    expect(screen.getByText(mockSalon.name)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`Desde ${mockSalon.desde}`))).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: `Abrir ficha de ${mockSalon.name}` }));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
