import type {
  CashOutListMeta,
  CashOutListParams,
  CashOutTransaction,
  CashOutTransactionDetail,
  CreateCashOutPayload,
} from '@/src/types/cash-out';
import { apiClient } from './client';

export const cashOutApi = {
  getNewRef: async (): Promise<{ ref: string }> => {
    const response = await apiClient.get<{
      success: boolean;
      data: { ref: string };
    }>('/v1/member/cash-out/new-ref');
    return response.data.data;
  },

  createCashOut: async (payload: CreateCashOutPayload) => {
    const response = await apiClient.post('/v1/member/cash-out', payload);
    return response.data;
  },

  getCashOuts: async (params: CashOutListParams) => {
    const queryParams: Record<string, string> = {};
    if (params.search) queryParams.search = params.search;
    if (params.startDate) queryParams.startDate = params.startDate;
    if (params.endDate) queryParams.endDate = params.endDate;
    if (params.perPage) queryParams.perPage = String(params.perPage);
    if (params.page) queryParams.page = String(params.page);

    const response = await apiClient.get<{
      data: CashOutTransaction[];
      meta: CashOutListMeta;
    }>('/v1/member/cash-out', { params: queryParams });
    return response.data;
  },

  getCashOut: async (id: number) => {
    const response = await apiClient.get<{
      data: { transaction: CashOutTransactionDetail };
    }>(`/v1/member/cash-out/${id}`);
    return response.data.data.transaction;
  },

  updateCashOut: async (id: number, payload: CreateCashOutPayload) => {
    const response = await apiClient.put(
      `/v1/member/cash-out/${id}`,
      payload,
    );
    return response.data;
  },

  deleteCashOut: async (id: number) => {
    const response = await apiClient.delete(`/v1/member/cash-out/${id}`);
    return response.data;
  },
};
