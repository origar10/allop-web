import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDistanceKm, formatDuration, formatPhone, normalizePhone } from './formatters';

describe('shared formatters', () => {
  it('formats common business values for Spanish users', () => {
    expect(formatCurrency(39)).toMatch(/39/);
    expect(formatDuration(95)).toBe('1 h 35 min');
    expect(formatDistanceKm(0.45)).toBe('450 m');
    expect(formatDistanceKm(3.2)).toBe('3,2 km');
  });

  it('normalizes and formats phone numbers', () => {
    expect(normalizePhone('+34 600 111 222')).toBe('+34600111222');
    expect(formatPhone('+34 600 111 222')).toBe('+34 600 111 222');
    expect(formatPhone('600111222')).toBe('600 111 222');
  });
});
