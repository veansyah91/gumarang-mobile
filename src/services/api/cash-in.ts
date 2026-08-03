import type {
  CashInListMeta,
  CashInListParams,
  CashInTransaction,
  CashInTransactionDetail,
  CreateCashInPayload,
} from '@/src/types/cash-in';
import { apiClient } from './client';

export const cashInApi = {
  getNewRef: async (): Promise<{ ref: string }> => {
    const response = await apiClient.get<{
      success: boolean;
      data: { ref: string };
    }>('/v1/member/cash-in/new-ref');
    return response.data.data;
  },

  createCashIn: async (payload: CreateCashInPayload) => {
    const response = await apiClient.post('/v1/member/cash-in', payload);
    return response.data;
  },

  getCashIns: async (params: CashInListParams) => {
    const queryParams: Record<string, string> = {};
    if (params.search) queryParams.search = params.search;
    if (params.startDate) queryParams.startDate = params.startDate;
    if (params.endDate) queryParams.endDate = params.endDate;
    if (params.perPage) queryParams.perPage = String(params.perPage);
    if (params.page) queryParams.page = String(params.page);

    const response = await apiClient.get<{
      data: CashInTransaction[];
      meta: CashInListMeta;
    }>('/v1/member/cash-in', { params: queryParams });
    return response.data;
  },

  getCashIn: async (id: number) => {
    const response = await apiClient.get<{
      data: { transaction: CashInTransactionDetail };
    }>(`/v1/member/cash-in/${id}`);
    return response.data.data.transaction;
  },

  updateCashIn: async (id: number, payload: CreateCashInPayload) => {
    const response = await apiClient.put(
      `/v1/member/cash-in/${id}`,
      payload,
    );
    return response.data;
  },

  deleteCashIn: async (id: number) => {
    const response = await apiClient.delete(`/v1/member/cash-in/${id}`);
    return response.data;
  },
};
