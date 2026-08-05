import { useQuery } from '@tanstack/react-query';

import { dashboardApi } from '@/src/services/api/dashboard';
import type { DashboardData, DashboardParams } from '@/src/types/dashboard';

const DASHBOARD_KEYS = {
  all: ['dashboard'] as const,
  summary: (params?: DashboardParams) => [
    ...DASHBOARD_KEYS.all,
    'summary',
    params,
  ] as const,
};

export function useDashboard(params?: DashboardParams) {
  return useQuery<DashboardData>({
    queryKey: DASHBOARD_KEYS.summary(params),
    queryFn: () => dashboardApi.getSummary(params),
    staleTime: 5 * 60 * 1000,
  });
}
