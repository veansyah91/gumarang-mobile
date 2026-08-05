import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { budgetApi } from '@/src/services/api/budget';
import type {
  Budget,
  BudgetListParams,
  BudgetSummary,
  CreateBudgetPayload,
  UpdateBudgetPayload,
} from '@/src/types/budget';

const BUDGET_KEYS = {
  all: ['budgets'] as const,
  list: (params?: BudgetListParams) => [...BUDGET_KEYS.all, 'list', params] as const,
  detail: (id: number) => [...BUDGET_KEYS.all, 'detail', id] as const,
  summary: () => [...BUDGET_KEYS.all, 'summary'] as const,
};

export function useBudgets(params?: BudgetListParams) {
  return useQuery<{ data: Budget[] }>({
    queryKey: BUDGET_KEYS.list(params),
    queryFn: () => budgetApi.getList(params),
  });
}

export function useBudget(id: number) {
  return useQuery<Budget>({
    queryKey: BUDGET_KEYS.detail(id),
    queryFn: () => budgetApi.getDetail(id),
    enabled: id > 0,
  });
}

export function useBudgetSummary() {
  return useQuery<BudgetSummary>({
    queryKey: BUDGET_KEYS.summary(),
    queryFn: () => budgetApi.getSummary(),
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBudgetPayload) => budgetApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.summary() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateBudgetPayload }) =>
      budgetApi.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.summary() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => budgetApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.summary() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
