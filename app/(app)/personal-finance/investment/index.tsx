import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { InvestmentDeleteConfirm } from '@/src/components/investment-delete-confirm';
import { InvestmentFormModal } from '@/src/components/investment-form-modal';
import { InvestmentTreeItem } from '@/src/components/investment-tree-item';
import { InvestmentSubHeader } from '@/src/components/ui/investment-sub-header';
import { Input } from '@/src/components/ui/input';
import { Screen } from '@/src/components/ui/screen';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Text } from '@/src/components/ui/text';
import {
  useCreateInvestment,
  useDeleteInvestment,
  useInvestments,
} from '@/src/hooks/use-investment';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { pfRoutes } from '@/src/navigation/personal-finance-routes';
import { useToastStore } from '@/src/state/toast-store';
import { filterTree } from '@/src/utils/tree';
import { palette, spacing } from '@/src/theme/tokens';
import type {
  CreateInvestmentPayload,
  InvestmentAccountNode,
  UpdateInvestmentPayload,
} from '@/src/types/investment';
import { toAppError } from '@/src/utils/errors';

function findAccountById(
  accounts: InvestmentAccountNode[],
  id: number,
): InvestmentAccountNode | null {
  for (const acc of accounts) {
    if (acc.id === id) return acc;
    if ((acc.children?.length ?? 0) > 0) {
      const found = findAccountById(acc.children, id);
      if (found) return found;
    }
  }
  return null;
}

export default function InvestmentListPage() {
  const router = useRouter();
  const theme = useResolvedTheme();
  const colors = palette[theme];

  const { data, isLoading, isError, refetch } = useInvestments();
  const createAsset = useCreateInvestment();
  const deleteAsset = useDeleteInvestment();

  const showToast = useToastStore((state) => state.showToast);

  const [formVisible, setFormVisible] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const accounts = data?.accounts ?? [];
  const filteredAccounts = filterTree(accounts, search);
  const deleteItem = deleteId ? findAccountById(accounts, deleteId) : null;

  const handleCreate = async (
    payload: CreateInvestmentPayload | UpdateInvestmentPayload,
  ) => {
    await createAsset.mutateAsync(payload as CreateInvestmentPayload);
    setFormVisible(false);
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
    router.push(pfRoutes.investmentDetail(id));
  };

  return (
    <>
      <InvestmentSubHeader title="Investasi" />
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
              <Text tone="danger">Gagal memuat portofolio</Text>
              <Pressable onPress={() => refetch()} style={styles.retryButton}>
                <Text tone="muted">Coba Lagi</Text>
              </Pressable>
            </View>
          ) : accounts.length === 0 ? (
            <View style={styles.centerState}>
              <Ionicons
                name="trending-up-outline"
                size={48}
                color={colors.muted}
              />
              <Text tone="muted" style={styles.emptyText}>
                Belum ada aset investasi
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              <Input
                value={search}
                onChangeText={setSearch}
                placeholder="Cari investasi..."
              />
              {filteredAccounts.length === 0 ? (
                <View style={styles.centerState}>
                  <Text tone="muted" style={styles.emptyText}>
                    Tidak ada investasi yang cocok
                  </Text>
                </View>
              ) : (
                filteredAccounts.map((item) => (
                  <InvestmentTreeItem
                    key={item.id}
                    item={item}
                    onPress={handlePress}
                  />
                ))
              )}
            </View>
          )}
        </View>
      </Screen>

      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
        ]}
        onPress={() => setFormVisible(true)}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>

      <InvestmentFormModal
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSubmit={handleCreate}
        isSubmitting={createAsset.isPending}
      />

      <InvestmentDeleteConfirm
        visible={deleteId !== null}
        assetName={deleteItem?.name ?? ''}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isDeleting={deleteAsset.isPending}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {},
  skeletonList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.md,
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
