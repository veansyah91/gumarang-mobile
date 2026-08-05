import type {
  CreateDebtEntryPayload,
  CreateDebtPayload,
  DebtEntry,
  DebtEntryAll,
  DebtEntryAllListParams,
  DebtEntryListMeta,
  DebtEntryListParams,
  DebtSearchItem,
  DebtSearchParams,
  UpdateDebtEntryPayload,
  UpdateDebtPayload,
} from '@/src/types/debt';
import { apiClient } from './client';

export const debtApi = {
  getDebts: async (params: Record<string, string | number | undefined>) => {
    const queryParams: Record<string, string> = {};
    if (params.query) queryParams.query = String(params.query);
    if (params.type) queryParams.type = String(params.type);
    if (params.contact_id) queryParams.contact_id = String(params.contact_id);
    if (params.status) queryParams.status = String(params.status);
    if (params.perPage) queryParams.perPage = String(params.perPage);
    if (params.page) queryParams.page = String(params.page);

    const response = await apiClient.get<{
      data: import('@/src/types/debt').DebtItem[];
      meta: import('@/src/types/debt').DebtListMeta;
    }>('/v1/member/personal-finance/debts', { params: queryParams });
    return response.data;
  },

  searchDebts: async (params: DebtSearchParams = {}) => {
    const queryParams: Record<string, string> = {};
    if (params.query) queryParams.query = params.query;
    if (params.type) queryParams.type = params.type;
    if (params.perPage) queryParams.perPage = String(params.perPage);
    if (params.page) queryParams.page = String(params.page);

    const response = await apiClient.get<{
      data: DebtSearchItem[];
      meta: DebtEntryListMeta;
    }>('/v1/member/personal-finance/debts/search', {
      params: queryParams,
    });
    return response.data;
  },

  getDebt: async (id: number) => {
    const response = await apiClient.get<{
      data: import('@/src/types/debt').DebtItem;
    }>(`/v1/member/personal-finance/debts/${id}`);
    return response.data.data;
  },

  createDebt: async (payload: CreateDebtPayload) => {
    const response = await apiClient.post(
      '/v1/member/personal-finance/debts',
      payload,
    );
    return response.data;
  },

  updateDebt: async (id: number, payload: UpdateDebtPayload) => {
    const response = await apiClient.put(
      `/v1/member/personal-finance/debts/${id}`,
      payload,
    );
    return response.data;
  },

  deleteDebt: async (id: number) => {
    const response = await apiClient.delete(
      `/v1/member/personal-finance/debts/${id}`,
    );
    return response.data;
  },

  getDebtEntries: async (debtId: number, params: DebtEntryListParams = {}) => {
    const queryParams: Record<string, string> = {};
    if (params.search) queryParams.search = params.search;
    if (params.startDate) queryParams.startDate = params.startDate;
    if (params.endDate) queryParams.endDate = params.endDate;
    if (params.perPage) queryParams.perPage = String(params.perPage);
    if (params.page) queryParams.page = String(params.page);

    const response = await apiClient.get<{
      data: DebtEntry[];
      meta: DebtEntryListMeta;
    }>(`/v1/member/personal-finance/debts/${debtId}/entries`, {
      params: queryParams,
    });
    return response.data;
  },

  getAllDebtEntries: async (
    params: DebtEntryAllListParams = {},
  ) => {
    const queryParams: Record<string, string> = {};
    if (params.type) queryParams.type = params.type;
    if (params.debt_id) queryParams.debt_id = String(params.debt_id);
    if (params.entry_type) queryParams.entry_type = params.entry_type;
    if (params.search) queryParams.search = params.search;
    if (params.startDate) queryParams.startDate = params.startDate;
    if (params.endDate) queryParams.endDate = params.endDate;
    if (params.perPage) queryParams.perPage = String(params.perPage);
    if (params.page) queryParams.page = String(params.page);

    const response = await apiClient.get<{
      data: DebtEntryAll[];
      meta: DebtEntryListMeta;
    }>('/v1/member/personal-finance/debt-entries', {
      params: queryParams,
    });
    return response.data;
  },

  getDebtEntry: async (debtId: number, entryId: number) => {
    const response = await apiClient.get<{
      data: DebtEntry;
    }>(`/v1/member/personal-finance/debts/${debtId}/entries/${entryId}`);
    return response.data.data;
  },

  createDebtEntry: async (payload: CreateDebtEntryPayload) => {
    const response = await apiClient.post(
      '/v1/member/personal-finance/debt-entries',
      payload,
    );
    return response.data;
  },

  updateDebtEntry: async (
    debtId: number,
    entryId: number,
    payload: UpdateDebtEntryPayload,
  ) => {
    const response = await apiClient.put(
      `/v1/member/personal-finance/debts/${debtId}/entries/${entryId}`,
      payload,
    );
    return response.data;
  },

  deleteDebtEntry: async (debtId: number, entryId: number) => {
    const response = await apiClient.delete(
      `/v1/member/personal-finance/debts/${debtId}/entries/${entryId}`,
    );
    return response.data;
  },
};
