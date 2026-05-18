import type {
    CertificateDetail,
    CertificateDetailData,
    CertificateListData,
    CertificateListFilters,
} from '@/src/types/certificate';
import type {
    DashboardSummary,
    DepositsData,
    GoldConvertionDetail,
    GoldConvertionListFilters,
    GoldConvertionListResponse,
    GoldListData,
    Pagination,
    ProductWeightData,
    ProfitData,
    PurchaseInvoicesData,
    PurchaseTransactionMemberDetailData,
    PurchaseTransactionMemberInvoiceDetail,
    PurchaseTransactionMemberListData,
    PurchaseTransactionMemberListFilters,
    SaleInvoicesData,
    SaleTransactionMemberDetailData,
    SaleTransactionMemberInvoiceDetail,
    SaleTransactionMemberListData,
    SaleTransactionMemberListFilters,
    SavingDetailListFilters,
    SavingDetailListResponse,
    SavingDetailMemberListData,
    SavingDetailMemberListFilters,
    SavingMember,
    SavingMemberListData,
    SavingMemberListFilters,
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

type CertificateResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
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

  async getPurchaseTransactionMembers(
    params?: PurchaseTransactionMemberListFilters,
  ): Promise<PurchaseTransactionMemberListData> {
    const res = await apiClient.get<
      WrappedResponse<PurchaseTransactionMemberListData>
    >('/api/v1/member/purchase-transaction-member', { params });

    return res.data.data;
  },

  async getPurchaseTransactionMember(
    id: number | string,
  ): Promise<PurchaseTransactionMemberInvoiceDetail> {
    const res = await apiClient.get<
      WrappedResponse<PurchaseTransactionMemberDetailData>
    >(`/api/v1/member/purchase-transaction-member/${id}`);

    return res.data.data.invoice;
  },

  async getSaleTransactionMembers(
    params?: SaleTransactionMemberListFilters,
  ): Promise<SaleTransactionMemberListData> {
    const res = await apiClient.get<
      WrappedResponse<SaleTransactionMemberListData>
    >('/api/v1/member/sale-transaction-member', { params });

    return res.data.data;
  },

  async getSaleTransactionMember(
    id: number | string,
  ): Promise<SaleTransactionMemberInvoiceDetail> {
    const res = await apiClient.get<
      WrappedResponse<SaleTransactionMemberDetailData>
    >(`/api/v1/member/sale-transaction-member/${id}`);

    return res.data.data.invoice;
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

  async getCertificates(
    params?: CertificateListFilters,
  ): Promise<CertificateListData> {
    const res = await apiClient.get<CertificateResponse<CertificateListData>>(
      '/api/v1/member/certificates',
      { params },
    );

    return res.data.data;
  },

  async getCertificate(id: number | string): Promise<CertificateDetail> {
    const res = await apiClient.get<CertificateResponse<CertificateDetailData>>(
      `/api/v1/member/certificates/${id}`,
    );

    return res.data.data.certificate;
  },

  async getGoldConvertions(
    params?: GoldConvertionListFilters,
  ): Promise<GoldConvertionListResponse> {
    const res = await apiClient.get<GoldConvertionListResponse>(
      '/api/v1/member/gold-convertion',
      { params },
    );

    return res.data;
  },

  async getGoldConvertion(id: number | string): Promise<GoldConvertionDetail> {
    const res = await apiClient.get<WrappedResponse<GoldConvertionDetail>>(
      `/api/v1/member/gold-convertion/${id}`,
    );

    return res.data.data;
  },

  async getSavingMembers(
    params?: SavingMemberListFilters,
  ): Promise<SavingMember[]> {
    const res = await apiClient.get<SavingMemberListData>(
      '/api/v1/member/savings',
      { params },
    );

    return res.data.data;
  },

  async getSavingDetailMembers(
    params?: SavingDetailMemberListFilters,
  ): Promise<SavingDetailMemberListData> {
    const res = await apiClient.get<
      WrappedResponse<SavingDetailMemberListData>
    >('/api/v1/member/saving-details', { params });

    return res.data.data;
  },

  async getSavingDetails(
    params?: SavingDetailListFilters,
  ): Promise<SavingDetailListResponse> {
    const res = await apiClient.get<SavingDetailListResponse>(
      '/api/v1/member/saving-details',
      { params },
    );

    return res.data;
  },
};
