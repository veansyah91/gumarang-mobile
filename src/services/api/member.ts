import type {
    DashboardSummary,
    DepositsData,
    GoldListData,
    Pagination,
    ProductWeightData,
    ProfitData,
    PurchaseInvoicesData,
    SaleInvoicesData,
    SavingWeightData,
    WithdrawsData,
} from '@/src/types/member';

import { apiClient } from './client';

type WrappedResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

type PaginatedResponse<T> = {
  success: boolean;
  message?: string;
  data: T[];
  pagination: Pagination;
};

export const memberApi = {
  async getDashboardSummary(params?: {
    month?: string;
    year?: string;
  }): Promise<DashboardSummary> {
    const res = await apiClient.get<WrappedResponse<DashboardSummary>>(
      '/api/v1/member/summary',
      { params },
    );
    return res.data.data;
  },

  async getSaleInvoices(): Promise<SaleInvoicesData> {
    const res = await apiClient.get<PaginatedResponse<unknown>>(
      '/api/v1/member/sale-invoices',
      { params: { limit: 1 } },
    );
    return { data: res.data.data, pagination: res.data.pagination };
  },

  async getPurchaseInvoices(): Promise<PurchaseInvoicesData> {
    const res = await apiClient.get<PaginatedResponse<unknown>>(
      '/api/v1/member/purchase-invoices',
      { params: { limit: 1 } },
    );
    return { data: res.data.data, pagination: res.data.pagination };
  },

  async getProductWeight(): Promise<ProductWeightData> {
    const res = await apiClient.get<WrappedResponse<ProductWeightData>>(
      '/api/v1/member/product-weight',
    );
    return res.data.data;
  },

  async getSavingWeight(): Promise<SavingWeightData> {
    const res = await apiClient.get<WrappedResponse<SavingWeightData>>(
      '/api/v1/member/saving-weight',
    );
    return res.data.data;
  },

  async getDeposits(): Promise<DepositsData> {
    const res = await apiClient.get<PaginatedResponse<unknown>>(
      '/api/v1/member/deposits',
      { params: { limit: 1 } },
    );
    return { data: res.data.data, pagination: res.data.pagination };
  },

  async getWithdraws(): Promise<WithdrawsData> {
    const res = await apiClient.get<PaginatedResponse<unknown>>(
      '/api/v1/member/withdraws',
      { params: { limit: 1 } },
    );
    return { data: res.data.data, pagination: res.data.pagination };
  },

  async getProfit(): Promise<ProfitData> {
    const res = await apiClient.get<WrappedResponse<ProfitData>>(
      '/api/v1/member/profit',
    );
    return res.data.data;
  },

  async getGoldList(): Promise<GoldListData> {
    const res = await apiClient.get<WrappedResponse<GoldListData>>(
      '/api/v1/member/lists',
    );
    return res.data.data;
  },
};
