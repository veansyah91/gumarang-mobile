import type {
  Account,
  AccountHistoryEntry,
  AccountHistoryMeta,
  AccountTreeNode,
  CreateAccountPayload,
  SelectableAccount,
  UpdateAccountPayload,
} from '@/src/types/account';
import { apiClient } from './client';

export const accountApi = {
  getAccounts: async (
    type?: string,
    isActive?: boolean,
    search?: string,
  ): Promise<AccountTreeNode[]> => {
    try {
      const params: Record<string, string> = {};
      if (type) params.type = type;
      if (isActive !== undefined) params.is_active = String(isActive);
      if (search) params.search = search;
      const response = await apiClient.get('/v1/member/accounts', {
        params: Object.keys(params).length ? params : undefined,
      });
      const result = response.data.data;
      if (Array.isArray(result)) {
        return result;
      }
      if (
        result &&
        typeof result === 'object' &&
        'accounts' in result &&
        Array.isArray(result.accounts)
      ) {
        return result.accounts;
      }
      return [];
    } catch (err) {
      console.error('[Account API] getAccounts error:', err);
      throw err;
    }
  },

  getSelectableAccounts: async (
    type?: string,
    name?: string,
    assetCategory?: string,
    hasParent?: boolean,
    isCash?: boolean,
  ): Promise<SelectableAccount[]> => {
    try {
      const params: Record<string, string> = {};
      if (type) params.type = type;
      if (name) params.name = name;
      if (assetCategory) params.asset_category = assetCategory;
      if (hasParent) params.has_parent = 'true';
      if (isCash !== undefined) params.is_cash = String(isCash);
      const response = await apiClient.get<{ data: SelectableAccount[] }>(
        '/v1/member/accounts/selectable',
        { params: Object.keys(params).length ? params : undefined },
      );
      return response.data.data;
    } catch (err) {
      console.error('[Account API] getSelectableAccounts error:', err);
      throw err;
    }
  },

  getAccount: async (id: number): Promise<Account> => {
    try {
      const response = await apiClient.get<{ data: { account: Account } }>(
        `/v1/member/accounts/${id}`,
      );
      return response.data.data.account;
    } catch (err) {
      console.error('[Account API] getAccount error:', err);
      throw err;
    }
  },

  createAccount: async (payload: CreateAccountPayload): Promise<Account> => {
    try {
      const response = await apiClient.post<{ data: Account }>(
        '/v1/member/accounts',
        payload,
      );
      return response.data.data;
    } catch (err) {
      console.error('[Account API] createAccount error:', err);
      throw err;
    }
  },

  updateAccount: async (
    id: number,
    payload: UpdateAccountPayload,
  ): Promise<Account> => {
    try {
      const response = await apiClient.put<{ data: Account }>(
        `/v1/member/accounts/${id}`,
        payload,
      );
      return response.data.data;
    } catch (err) {
      console.error('[Account API] updateAccount error:', err);
      throw err;
    }
  },

  deleteAccount: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/v1/member/accounts/${id}`);
    } catch (err) {
      console.error('[Account API] deleteAccount error:', err);
      throw err;
    }
  },

  getAccountHistory: async (
    id: number,
    params?: {
      startDate?: string;
      endDate?: string;
      perPage?: number;
      all?: boolean;
      page?: number;
    },
  ): Promise<{ data: AccountHistoryEntry[]; meta: AccountHistoryMeta }> => {
    try {
      const response = await apiClient.get<{
        data: AccountHistoryEntry[];
        meta: AccountHistoryMeta;
      }>(`/v1/member/accounts/${id}/history`, {
        params: params && Object.keys(params).length ? params : undefined,
      });
      return response.data;
    } catch (err) {
      console.error('[Account API] getAccountHistory error:', err);
      throw err;
    }
  },
};
