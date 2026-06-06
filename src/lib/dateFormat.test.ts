import { describe, expect, it } from 'vitest';
import { formatBookingDate } from './dateFormat';

describe('formatBookingDate', () => {
  it('returns a pending label when the date is missing', () => {
    expect(formatBookingDate()).toBe('Fecha pendiente');
  });

  it('keeps invalid values untouched', () => {
    expect(formatBookingDate('sin-fecha')).toBe('sin-fecha');
  });

  it('formats valid ISO dates for Spanish users', () => {
    expect(formatBookingDate('2026-06-06T10:30:00.000Z')).toMatch(/2026/);
    expect(formatBookingDate('2026-06-06T10:30:00.000Z')).toMatch(/10:30|12:30/);
  });
});
