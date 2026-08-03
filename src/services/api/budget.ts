import type {
  Budget,
  BudgetListParams,
  BudgetSummary,
  CreateBudgetPayload,
  UpdateBudgetPayload,
} from '@/src/types/budget';

import { apiClient } from './client';

export const budgetApi = {
  async getList(
    params?: BudgetListParams,
  ): Promise<{ data: Budget[]; meta?: { current_page: number; last_page: number; per_page: number; total: number } }> {
    const res = await apiClient.get<{
      success: boolean;
      data: Budget[];
      meta?: { current_page: number; last_page: number; per_page: number; total: number };
    }>('/v1/member/budgets', { params });
    return { data: res.data.data, meta: res.data.meta };
  },

  async getDetail(id: number): Promise<Budget> {
    const res = await apiClient.get<{
      success: boolean;
      data: Budget;
    }>(`/v1/member/budgets/${id}`);
    return res.data.data;
  },

  async getSummary(): Promise<BudgetSummary> {
    const res = await apiClient.get<{
      success: boolean;
      data: BudgetSummary;
    }>('/v1/member/budgets/summary');
    return res.data.data;
  },

  async create(payload: CreateBudgetPayload) {
    const res = await apiClient.post('/v1/member/budgets', payload);
    return res.data.data;
  },

  async update(id: number, payload: UpdateBudgetPayload) {
    const res = await apiClient.put(`/v1/member/budgets/${id}`, payload);
    return res.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/v1/member/budgets/${id}`);
  },
};
