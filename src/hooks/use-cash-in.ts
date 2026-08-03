import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';

import { cashInApi } from '@/src/services/api/cash-in';
import type {
  CashInListParams,
  CreateCashInPayload,
} from '@/src/types/cash-in';

const CASH_IN_ROOT = ['cash-in'] as const;

const CASH_IN_KEYS = {
  all: CASH_IN_ROOT,
  list: (params: CashInListParams) =>
    [...CASH_IN_ROOT, 'list', params] as const,
  detail: (id: number) => [...CASH_IN_ROOT, 'detail', id] as const,
  newRef: [...CASH_IN_ROOT, 'new-ref'] as const,
};

export function useCashInNewRef() {
  return useQuery({
    queryKey: CASH_IN_KEYS.newRef,
    queryFn: () => cashInApi.getNewRef(),
    staleTime: 0,
    retry: 1,
  });
}

export function useCashIns(params: CashInListParams = {}) {
  return useInfiniteQuery({
    queryKey: CASH_IN_KEYS.list(params),
    queryFn: ({ pageParam }) =>
      cashInApi.getCashIns({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.current_page < lastPage.meta.last_page) {
        return lastPage.meta.current_page + 1;
      }
      return undefined;
    },
  });
}

export function useCashIn(id: number) {
  return useQuery({
    queryKey: CASH_IN_KEYS.detail(id),
    queryFn: () => cashInApi.getCashIn(id),
    enabled: id > 0,
  });
}

export function useCreateCashIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCashInPayload) =>
      cashInApi.createCashIn(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CASH_IN_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useUpdateCashIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: CreateCashInPayload;
    }) => cashInApi.updateCashIn(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CASH_IN_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useDeleteCashIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => cashInApi.deleteCashIn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CASH_IN_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}
