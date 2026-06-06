export type AsyncStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export interface AsyncState<T> {
  status: AsyncStatus;
  data: T;
  error: string;
}

export function idleState<T>(data: T): AsyncState<T> {
  return { status: 'idle', data, error: '' };
}

export function loadingState<T>(data: T): AsyncState<T> {
  return { status: 'loading', data, error: '' };
}

export function successState<T>(data: T): AsyncState<T> {
  return { status: 'success', data, error: '' };
}

export function emptyState<T>(data: T): AsyncState<T> {
  return { status: 'empty', data, error: '' };
}

export function errorState<T>(data: T, error: string): AsyncState<T> {
  return { status: 'error', data, error };
}

export function statusFromItems(items: unknown[], loading: boolean, error?: string | null): AsyncStatus {
  if (loading) return 'loading';
  if (error) return 'error';
  return items.length ? 'success' : 'empty';
}
