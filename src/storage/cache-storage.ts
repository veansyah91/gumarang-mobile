import { getJsonStorage, setJsonStorage } from './local-storage';

type CacheEnvelope<T> = {
  data: T;
  updatedAt: number;
};

export async function getCachedData<T>(key: string) {
  return getJsonStorage<CacheEnvelope<T> | null>(key, null);
}

export async function setCachedData<T>(key: string, data: T) {
  await setJsonStorage<CacheEnvelope<T>>(key, {
    data,
    updatedAt: Date.now(),
  });
}
