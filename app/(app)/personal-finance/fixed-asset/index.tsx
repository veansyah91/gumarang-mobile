import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { FixedAssetDeleteConfirm } from '@/src/components/fixed-asset-delete-confirm';
import { FixedAssetFormModal } from '@/src/components/fixed-asset-form-modal';
import { FixedAssetSubHeader } from '@/src/components/ui/fixed-asset-sub-header';
import { FixedAssetTreeItem } from '@/src/components/fixed-asset-tree-item';
import { Screen } from '@/src/components/ui/screen';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Text } from '@/src/components/ui/text';
import {
  useCreateFixedAsset,
  useDeleteFixedAsset,
  useFixedAssets,
} from '@/src/hooks/use-fixed-asset';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { useToastStore } from '@/src/state/toast-store';
import { palette, spacing } from '@/src/theme/tokens';
import type { CreateFixedAssetPayload } from '@/src/types/fixed-asset';

import { toAppError } from '@/src/utils/errors';

export default function FixedAssetListPage() {
  const router = useRouter();
  const theme = useResolvedTheme();
  const colors = palette[theme];

  const { data, isLoading, isError, refetch } = useFixedAssets();
  const createAsset = useCreateFixedAsset();
  const deleteAsset = useDeleteFixedAsset();

  const showToast = useToastStore((state) => state.showToast);

  const [formVisible, setFormVisible] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const allAssets = data?.accounts ?? [];
  const deleteItem = allAssets.find((a) => a.id === deleteId) ?? null;

  const handleCreate = async (payload: CreateFixedAssetPayload) => {
    try {
      await createAsset.mutateAsync(payload);
      setFormVisible(false);
    } catch (err) {
      const appErr = toAppError(err);
      showToast(appErr.userMessage, 'danger');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAsset.mutateAsync(deleteId);
      setDeleteId(null);
    } catch (err) {
      const appErr = toAppError(err);
      showToast(appErr.userMessage, 'danger');
    }
  };

  const handlePress = (id: number) => {
    router.push(`/personal-finance/fixed-asset/${id}` as any);
  };

  const handleLongPress = (id: number) => {
    setDeleteId(id);
  };

  const handleCloseForm = () => {
    setFormVisible(false);
  };

  const handleCloseDelete = () => {
    setDeleteId(null);
  };

  return (
    <>
      <FixedAssetSubHeader title="Aset Tetap" />
      <Screen
        scrollable
        safeAreaEdges={['left', 'right', 'bottom']}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        <View style={styles.container}>
          {isLoading ? (
            <View style={styles.skeletonList}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={72} />
              ))}
            </View>
          ) : isError ? (
            <View style={styles.centerState}>
              <Text tone="danger">Gagal memuat aset tetap</Text>
              <Pressable onPress={() => refetch()} style={styles.retryButton}>
                <Text tone="muted">Coba Lagi</Text>
              </Pressable>
            </View>
          ) : allAssets.length === 0 ? (
            <View style={styles.centerState}>
              <Ionicons name="diamond-outline" size={48} color={colors.muted} />
              <Text tone="muted" style={styles.emptyText}>
                Belum ada aset tetap
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {allAssets.map((item) => (
                <FixedAssetTreeItem
                  key={item.id}
                  item={item}
                  onPress={handlePress}
                  onLongPress={handleLongPress}
                />
              ))}
            </View>
          )}
        </View>
      </Screen>

      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
        ]}
        onPress={() => {
          setFormVisible(true);
        }}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>

      <FixedAssetFormModal
        visible={formVisible}
        onClose={handleCloseForm}
        onSubmit={handleCreate}
        isSubmitting={createAsset.isPending}
      />

      <FixedAssetDeleteConfirm
        visible={deleteId !== null}
        assetName={deleteItem?.name ?? ''}
        onClose={handleCloseDelete}
        onConfirm={handleDelete}
        isDeleting={deleteAsset.isPending}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {},
  skeletonList: {
    gap: spacing.sm,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.xl * 2,
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    gap: spacing.sm,
  },
  emptyText: {
    marginTop: spacing.sm,
  },
  retryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg * 2,
    right: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
