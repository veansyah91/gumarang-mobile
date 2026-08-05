import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { investmentApi } from '@/src/services/api/investment';
import type {
  BuyUnitPayload,
  CreateInvestmentPayload,
  EditPurchasePayload,
  EditSalePayload,
  InvestmentAccountNode,
  InvestmentAssetDetail,
  InvestmentListMeta,
  RevaluePayload,
  SellUnitPayload,
  UpdateInvestmentPayload,
} from '@/src/types/investment';

const INVESTMENT_KEYS = {
  all: ['investments'] as const,
  list: () => [...INVESTMENT_KEYS.all, 'list'] as const,
  detail: (id: number) => [...INVESTMENT_KEYS.all, 'detail', id] as const,
};

export function useInvestments() {
  return useQuery<{ accounts: InvestmentAccountNode[]; meta: InvestmentListMeta }>({
    queryKey: INVESTMENT_KEYS.list(),
    queryFn: () => investmentApi.getList(),
  });
}

export function useInvestment(id: number) {
  return useQuery<InvestmentAssetDetail>({
    queryKey: INVESTMENT_KEYS.detail(id),
    queryFn: () => investmentApi.getDetail(id),
    enabled: id > 0,
  });
}

export function useCreateInvestment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateInvestmentPayload) =>
      investmentApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVESTMENT_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useBuyUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: BuyUnitPayload;
    }) => investmentApi.buy(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INVESTMENT_KEYS.list() });
      queryClient.invalidateQueries({
        queryKey: INVESTMENT_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useSellUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: SellUnitPayload;
    }) => investmentApi.sell(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INVESTMENT_KEYS.list() });
      queryClient.invalidateQueries({
        queryKey: INVESTMENT_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useRevalueInvestment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: RevaluePayload;
    }) => investmentApi.revalue(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INVESTMENT_KEYS.list() });
      queryClient.invalidateQueries({
        queryKey: INVESTMENT_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateInvestment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateInvestmentPayload;
    }) => investmentApi.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INVESTMENT_KEYS.list() });
      queryClient.invalidateQueries({
        queryKey: INVESTMENT_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteInvestment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => investmentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVESTMENT_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useEditPurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      transactionId,
      payload,
    }: {
      id: number;
      transactionId: number;
      payload: EditPurchasePayload;
    }) => investmentApi.editPurchase(id, transactionId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INVESTMENT_KEYS.list() });
      queryClient.invalidateQueries({
        queryKey: INVESTMENT_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeletePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      transactionId,
    }: {
      id: number;
      transactionId: number;
    }) => investmentApi.deletePurchase(id, transactionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INVESTMENT_KEYS.list() });
      queryClient.invalidateQueries({
        queryKey: INVESTMENT_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useEditSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      transactionId,
      payload,
    }: {
      id: number;
      transactionId: number;
      payload: EditSalePayload;
    }) => investmentApi.editSale(id, transactionId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INVESTMENT_KEYS.list() });
      queryClient.invalidateQueries({
        queryKey: INVESTMENT_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      transactionId,
    }: {
      id: number;
      transactionId: number;
    }) => investmentApi.deleteSale(id, transactionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INVESTMENT_KEYS.list() });
      queryClient.invalidateQueries({
        queryKey: INVESTMENT_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
