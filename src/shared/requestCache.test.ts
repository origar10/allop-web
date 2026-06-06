import { afterEach, describe, expect, it } from 'vitest';
import { cachedRequest, clearRequestCache } from './requestCache';

describe('cachedRequest', () => {
  afterEach(() => clearRequestCache());

  it('deduplicates repeated requests while the entry is fresh', async () => {
    let calls = 0;
    const loader = () => {
      calls += 1;
      return Promise.resolve({ ok: true });
    };

    await expect(cachedRequest('same-key', loader)).resolves.toEqual({ ok: true });
    await expect(cachedRequest('same-key', loader)).resolves.toEqual({ ok: true });

    expect(calls).toBe(1);
  });

  it('does not keep failed entries cached', async () => {
    let calls = 0;
    const loader = () => {
      calls += 1;
      return calls === 1 ? Promise.reject(new Error('fail')) : Promise.resolve('ok');
    };

    await expect(cachedRequest('retry-key', loader)).rejects.toThrow('fail');
    await expect(cachedRequest('retry-key', loader)).resolves.toBe('ok');

    expect(calls).toBe(2);
  });
});
