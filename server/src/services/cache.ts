type CacheEntry = {
  value: any;
  expiresAt: number;
};

const store = new Map<string, CacheEntry>();

export const cacheGet = <T>(key: string): T | null => {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value as T;
};

export const cacheSet = (key: string, value: any, ttlMs: number) => {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
};

export const cacheClear = (prefix?: string) => {
  if (!prefix) {
    store.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
};
