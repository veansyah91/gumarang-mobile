import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fixedAssetApi } from '@/src/services/api/fixed-asset';
import type {
  CreateFixedAssetPayload,
  FixedAssetListMeta,
  FixedAssetNode,
  UpdateFixedAssetPayload,
} from '@/src/types/fixed-asset';

const FIXED_ASSET_KEYS = {
  all: ['fixed-assets'] as const,
  list: () => [...FIXED_ASSET_KEYS.all, 'list'] as const,
  detail: (id: number) => [...FIXED_ASSET_KEYS.all, 'detail', id] as const,
};

export function useFixedAssets() {
  return useQuery<{ accounts: FixedAssetNode[]; meta: FixedAssetListMeta }>({
    queryKey: FIXED_ASSET_KEYS.list(),
    queryFn: () => fixedAssetApi.getList(),
  });
}

export function useFixedAsset(id: number) {
  return useQuery<FixedAssetNode>({
    queryKey: FIXED_ASSET_KEYS.detail(id),
    queryFn: () => fixedAssetApi.getDetail(id),
    enabled: id > 0,
  });
}

export function useCreateFixedAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFixedAssetPayload) =>
      fixedAssetApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FIXED_ASSET_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateFixedAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateFixedAssetPayload;
    }) => fixedAssetApi.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: FIXED_ASSET_KEYS.list() });
      queryClient.invalidateQueries({
        queryKey: FIXED_ASSET_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteFixedAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => fixedAssetApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FIXED_ASSET_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
