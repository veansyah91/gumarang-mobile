import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';

import { debtApi } from '@/src/services/api/debt';
import type {
  CreateDebtEntryPayload,
  CreateDebtPayload,
  DebtEntryAllListParams,
  DebtEntryListParams,
  DebtListParams,
  DebtSearchParams,
  UpdateDebtEntryPayload,
  UpdateDebtPayload,
} from '@/src/types/debt';

const DEBT_ROOT = ['debt'] as const;

const DEBT_KEYS = {
  all: DEBT_ROOT,
  list: (params: DebtListParams) =>
    [...DEBT_ROOT, 'list', params] as const,
  search: (params: DebtSearchParams) =>
    [...DEBT_ROOT, 'search', params] as const,
  detail: (id: number) => [...DEBT_ROOT, 'detail', id] as const,
  entries: (debtId: number, params: DebtEntryListParams) =>
    [...DEBT_ROOT, 'entries', debtId, params] as const,
  allEntries: (params: DebtEntryAllListParams) =>
    [...DEBT_ROOT, 'allEntries', params] as const,
  entryDetail: (debtId: number, entryId: number) =>
    [...DEBT_ROOT, 'entry', debtId, entryId] as const,
};

export function useDebts(params: DebtListParams = {}) {
  return useInfiniteQuery({
    queryKey: DEBT_KEYS.list(params),
    queryFn: ({ pageParam }) =>
      debtApi.getDebts({ ...params, page: pageParam }),
    initialPageParam: 1 as number,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.current_page < lastPage.meta.last_page) {
        return lastPage.meta.current_page + 1;
      }
      return undefined;
    },
  });
}

export function useSearchDebts(params: DebtSearchParams = {}) {
  return useQuery({
    queryKey: DEBT_KEYS.search(params),
    queryFn: () => debtApi.searchDebts(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDebt(id: number) {
  return useQuery({
    queryKey: DEBT_KEYS.detail(id),
    queryFn: () => debtApi.getDebt(id),
    enabled: id > 0,
  });
}

export function useCreateDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDebtPayload) =>
      debtApi.createDebt(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEBT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateDebtPayload;
    }) => debtApi.updateDebt(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEBT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => debtApi.deleteDebt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEBT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDebtEntries(debtId: number, params: DebtEntryListParams = {}) {
  return useInfiniteQuery({
    queryKey: DEBT_KEYS.entries(debtId, params),
    queryFn: ({ pageParam }) =>
      debtApi.getDebtEntries(debtId, { ...params, page: pageParam }),
    initialPageParam: 1 as number,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.current_page < lastPage.meta.last_page) {
        return lastPage.meta.current_page + 1;
      }
      return undefined;
    },
    enabled: debtId > 0,
  });
}

export function useAllDebtEntries(
  params: DebtEntryAllListParams = {},
) {
  return useInfiniteQuery({
    queryKey: DEBT_KEYS.allEntries(params),
    queryFn: ({ pageParam }) =>
      debtApi.getAllDebtEntries({ ...params, page: pageParam }),
    initialPageParam: 1 as number,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.current_page < lastPage.meta.last_page) {
        return lastPage.meta.current_page + 1;
      }
      return undefined;
    },
  });
}

export function useDebtEntry(debtId: number, entryId: number) {
  return useQuery({
    queryKey: DEBT_KEYS.entryDetail(debtId, entryId),
    queryFn: () => debtApi.getDebtEntry(debtId, entryId),
    enabled: debtId > 0 && entryId > 0,
  });
}

export function useCreateDebtEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDebtEntryPayload) =>
      debtApi.createDebtEntry(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEBT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateDebtEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      debtId,
      entryId,
      payload,
    }: {
      debtId: number;
      entryId: number;
      payload: UpdateDebtEntryPayload;
    }) => debtApi.updateDebtEntry(debtId, entryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEBT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteDebtEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ debtId, entryId }: { debtId: number; entryId: number }) =>
      debtApi.deleteDebtEntry(debtId, entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEBT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
