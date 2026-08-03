import type {
  BuyUnitPayload,
  CreateInvestmentPayload,
  EditPurchasePayload,
  EditPurchaseResponse,
  EditSalePayload,
  EditSaleResponse,
  InvestmentAccountNode,
  InvestmentAssetDetail,
  InvestmentListMeta,
  RevaluePayload,
  SellUnitPayload,
  UpdateInvestmentPayload,
  DeleteTransactionResponse,
} from '@/src/types/investment';

import { apiClient } from './client';

export const investmentApi = {
  async getList(): Promise<{
    accounts: InvestmentAccountNode[];
    meta: InvestmentListMeta;
  }> {
    const res = await apiClient.get<{
      success: boolean;
      data: { accounts: InvestmentAccountNode[] };
      meta: InvestmentListMeta;
    }>('/v1/member/investment-assets');
    return { accounts: res.data.data.accounts, meta: res.data.meta };
  },

  async getDetail(id: number): Promise<InvestmentAssetDetail> {
    const res = await apiClient.get<{
      success: boolean;
      data: InvestmentAssetDetail;
    }>(`/v1/member/investment-assets/${id}`);
    return res.data.data;
  },

  async create(payload: CreateInvestmentPayload) {
    const res = await apiClient.post('/v1/member/investment-assets', payload);
    return res.data.data;
  },

  async buy(id: number, payload: BuyUnitPayload) {
    const res = await apiClient.post(
      `/v1/member/investment-assets/${id}/buy`,
      payload,
    );
    return res.data.data;
  },

  async sell(id: number, payload: SellUnitPayload) {
    const res = await apiClient.post(
      `/v1/member/investment-assets/${id}/sell`,
      payload,
    );
    return res.data.data;
  },

  async revalue(id: number, payload: RevaluePayload) {
    const res = await apiClient.post(
      `/v1/member/investment-assets/${id}/revalue`,
      payload,
    );
    return res.data.data;
  },

  async update(id: number, payload: UpdateInvestmentPayload) {
    const res = await apiClient.put(
      `/v1/member/investment-assets/${id}`,
      payload,
    );
    return res.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/v1/member/investment-assets/${id}`);
  },

  async editPurchase(
    assetId: number,
    transactionId: number,
    payload: EditPurchasePayload,
  ): Promise<EditPurchaseResponse> {
    const res = await apiClient.put(
      `/v1/member/investment-assets/${assetId}/buy/${transactionId}`,
      payload,
    );
    return res.data.data;
  },

  async deletePurchase(
    assetId: number,
    transactionId: number,
  ): Promise<DeleteTransactionResponse> {
    const res = await apiClient.delete(
      `/v1/member/investment-assets/${assetId}/buy/${transactionId}`,
    );
    return res.data.data;
  },

  async editSale(
    assetId: number,
    transactionId: number,
    payload: EditSalePayload,
  ): Promise<EditSaleResponse> {
    const res = await apiClient.put(
      `/v1/member/investment-assets/${assetId}/sell/${transactionId}`,
      payload,
    );
    return res.data.data;
  },

  async deleteSale(
    assetId: number,
    transactionId: number,
  ): Promise<DeleteTransactionResponse> {
    const res = await apiClient.delete(
      `/v1/member/investment-assets/${assetId}/sell/${transactionId}`,
    );
    return res.data.data;
  },
};
