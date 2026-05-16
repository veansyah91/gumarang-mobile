import type { HomeData } from '@/src/types/home';

import { apiClient } from './client';

type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

export const homeApi = {
  async getHomeData(): Promise<HomeData> {
    const response = await apiClient.get<ApiResponse<HomeData>>('/api/v1/home');
    const data = response.data.data;
    if (!data) throw new Error('Invalid home response');
    return data;
  },
};
