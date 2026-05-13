import { useQuery, type QueryKey } from '@tanstack/react-query';

import { getCachedData, setCachedData } from '@/src/storage/cache-storage';

type Options<TData> = {
  queryKey: QueryKey;
  storageKey: string;
  staleTime: number;
  enabled?: boolean;
  queryFn: () => Promise<TData>;
};

export function useCachedResource<TData>({ queryKey, storageKey, staleTime, enabled = true, queryFn }: Options<TData>) {
  const query = useQuery({
    queryKey,
    enabled,
    retry: 1,
    queryFn: async () => {
      const cached = await getCachedData<TData>(storageKey);
      const isFresh = cached ? Date.now() - cached.updatedAt < staleTime : false;

      if (cached && isFresh) {
        return {
          data: cached.data,
          isFromCache: true,
        };
      }

      try {
        const data = await queryFn();
        await setCachedData(storageKey, data);

        return {
          data,
          isFromCache: false,
        };
      } catch (error) {
        if (cached) {
          if (__DEV__) {
            console.warn(`Falling back to cached data for ${storageKey}.`, error);
          }

          return {
            data: cached.data,
            isFromCache: true,
          };
        }

        throw error;
      }
    },
  });

  return {
    ...query,
    data: query.data?.data,
    isFromCache: query.data?.isFromCache ?? false,
  };
}
