import type { DashboardData, DashboardParams } from '@/src/types/dashboard';

import { apiClient } from './client';

export const dashboardApi = {
  getSummary: async (params?: DashboardParams): Promise<DashboardData> => {
    try {
      const response = await apiClient.get<{ data: DashboardData }>(
        '/v1/member/personal-finance/dashboard',
        { params: params && Object.keys(params).length ? params : undefined },
      );
      return response.data.data;
    } catch (err) {
      console.error('[Dashboard API] getSummary error:', err);
      throw err;
    }
  },
};
