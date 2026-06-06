import { describe, expect, it } from 'vitest';
import { errorState, statusFromItems, successState } from './asyncState';

describe('asyncState', () => {
  it('maps list state to the shared async status vocabulary', () => {
    expect(statusFromItems([], true)).toBe('loading');
    expect(statusFromItems([], false, 'error')).toBe('error');
    expect(statusFromItems([], false)).toBe('empty');
    expect(statusFromItems(['item'], false)).toBe('success');
  });

  it('creates typed state objects', () => {
    expect(successState(['ok'])).toEqual({ status: 'success', data: ['ok'], error: '' });
    expect(errorState([], 'No data')).toEqual({ status: 'error', data: [], error: 'No data' });
  });
});
