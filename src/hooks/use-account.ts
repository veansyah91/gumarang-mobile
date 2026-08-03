import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { accountApi } from '@/src/services/api/account';
import type {
  AccountHistoryEntry,
  AccountHistoryMeta,
  AccountTreeNode,
  CreateAccountPayload,
  SelectableAccount,
  UpdateAccountPayload,
} from '@/src/types/account';

const ACCOUNT_KEYS = {
  all: ['accounts'] as const,
  tree: () => [...ACCOUNT_KEYS.all, 'tree'] as const,
  selectable: () => [...ACCOUNT_KEYS.all, 'selectable'] as const,
  detail: (id: number) => [...ACCOUNT_KEYS.all, 'detail', id] as const,
  history: (id: number) => [...ACCOUNT_KEYS.all, 'history', id] as const,
};

export function useAccounts(type?: string, isActive?: boolean, search?: string) {
  return useQuery<AccountTreeNode[]>({
    queryKey: [...ACCOUNT_KEYS.tree(), type, isActive, search],
    queryFn: () => accountApi.getAccounts(type, isActive, search),
  });
}

export function useAccountHistory(
  id: number,
  page: number,
  startDate?: string,
  endDate?: string,
) {
  return useQuery<{ data: AccountHistoryEntry[]; meta: AccountHistoryMeta }>({
    queryKey: [...ACCOUNT_KEYS.history(id), page, startDate, endDate],
    queryFn: () =>
      accountApi.getAccountHistory(id, { page, perPage: 15, startDate, endDate }),
    enabled: id > 0,
  });
}

export function useSelectableAccounts(type?: string, name?: string, assetCategory?: string, hasParent?: boolean, isCash?: boolean) {
  return useQuery<SelectableAccount[]>({
    queryKey: [...ACCOUNT_KEYS.selectable(), type, name, assetCategory, hasParent, isCash],
    queryFn: () => accountApi.getSelectableAccounts(type, name, assetCategory, hasParent, isCash),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

export function useAccount(id: number) {
  return useQuery({
    queryKey: ACCOUNT_KEYS.detail(id),
    queryFn: () => accountApi.getAccount(id),
    enabled: id > 0,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAccountPayload) =>
      accountApi.createAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_KEYS.tree() });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateAccountPayload }) =>
      accountApi.updateAccount(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_KEYS.tree() });
      queryClient.invalidateQueries({
        queryKey: ACCOUNT_KEYS.detail(variables.id),
      });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => accountApi.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_KEYS.tree() });
    },
  });
}
