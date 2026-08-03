import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';

import { cashOutApi } from '@/src/services/api/cash-out';
import type {
  CashOutListParams,
  CreateCashOutPayload,
} from '@/src/types/cash-out';

const CASH_OUT_ROOT = ['cash-out'] as const;

const CASH_OUT_KEYS = {
  all: CASH_OUT_ROOT,
  list: (params: CashOutListParams) =>
    [...CASH_OUT_ROOT, 'list', params] as const,
  detail: (id: number) => [...CASH_OUT_ROOT, 'detail', id] as const,
  newRef: [...CASH_OUT_ROOT, 'new-ref'] as const,
};

export function useCashOutNewRef() {
  return useQuery({
    queryKey: CASH_OUT_KEYS.newRef,
    queryFn: () => cashOutApi.getNewRef(),
    staleTime: 0,
    retry: 1,
  });
}

export function useCashOuts(params: CashOutListParams = {}) {
  return useInfiniteQuery({
    queryKey: CASH_OUT_KEYS.list(params),
    queryFn: ({ pageParam }) =>
      cashOutApi.getCashOuts({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.current_page < lastPage.meta.last_page) {
        return lastPage.meta.current_page + 1;
      }
      return undefined;
    },
  });
}

export function useCashOut(id: number) {
  return useQuery({
    queryKey: CASH_OUT_KEYS.detail(id),
    queryFn: () => cashOutApi.getCashOut(id),
    enabled: id > 0,
  });
}

export function useCreateCashOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCashOutPayload) =>
      cashOutApi.createCashOut(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CASH_OUT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useUpdateCashOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: CreateCashOutPayload;
    }) => cashOutApi.updateCashOut(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CASH_OUT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useDeleteCashOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => cashOutApi.deleteCashOut(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CASH_OUT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}
