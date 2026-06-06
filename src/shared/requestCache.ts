interface CacheEntry<T> {
  expiresAt: number;
  promise: Promise<T>;
}

const cache = new Map<string, CacheEntry<unknown>>();
const DEFAULT_TTL_MS = 60000;

export function cachedRequest<T>(key: string, loader: () => Promise<T>, ttlMs = DEFAULT_TTL_MS): Promise<T> {
  const now = Date.now();
  const current = cache.get(key);

  if (current && current.expiresAt > now) {
    return current.promise as Promise<T>;
  }

  const promise = loader().catch((error) => {
    cache.delete(key);
    throw error;
  });

  cache.set(key, {
    expiresAt: now + ttlMs,
    promise,
  });

  return promise;
}

export function clearRequestCache(key?: string) {
  if (key) {
    cache.delete(key);
    return;
  }

  cache.clear();
}
