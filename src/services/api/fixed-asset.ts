import type {
  FixedAssetNode,
  FixedAssetListMeta,
  CreateFixedAssetPayload,
  UpdateFixedAssetPayload,
} from '@/src/types/fixed-asset';

import { apiClient } from './client';

export const fixedAssetApi = {
  async getList(): Promise<{
    accounts: FixedAssetNode[];
    meta: FixedAssetListMeta;
  }> {
    const res = await apiClient.get<{
      success: boolean;
      data: { accounts: FixedAssetNode[] };
      meta: FixedAssetListMeta;
    }>('/v1/member/fixed-assets');
    return { accounts: res.data.data.accounts, meta: res.data.meta };
  },

  async getDetail(id: number): Promise<FixedAssetNode> {
    const res = await apiClient.get<{
      success: boolean;
      data: FixedAssetNode;
    }>(`/v1/member/fixed-assets/${id}`);
    return res.data.data;
  },

  async create(payload: CreateFixedAssetPayload) {
    const res = await apiClient.post('/v1/member/fixed-assets', payload);
    return res.data.data;
  },

  async update(id: number, payload: UpdateFixedAssetPayload) {
    const res = await apiClient.put(`/v1/member/fixed-assets/${id}`, payload);
    return res.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/v1/member/fixed-assets/${id}`);
  },
};
