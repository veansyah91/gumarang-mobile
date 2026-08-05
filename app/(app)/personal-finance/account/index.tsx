import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import {
  CoaFilterModal,
  type CoaFilterDraft,
  createEmptyCoaFilterDraft,
} from '@/src/components/coa-filter-modal';
import { CoaDeleteConfirm } from '@/src/components/coa-delete-confirm';
import { CoaFormModal } from '@/src/components/coa-form-modal';
import { CoaTreeItem } from '@/src/components/coa-tree-item';
import { FixedAssetSubHeader } from '@/src/components/ui/fixed-asset-sub-header';
import { Screen } from '@/src/components/ui/screen';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Text } from '@/src/components/ui/text';
import {
  useAccounts,
  useCreateAccount,
  useDeleteAccount,
} from '@/src/hooks/use-account';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { pfRoutes } from '@/src/navigation/personal-finance-routes';
import { useToastStore } from '@/src/state/toast-store';
import { palette, spacing } from '@/src/theme/tokens';
import type { AccountTreeNode, AccountType, CreateAccountPayload } from '@/src/types/account';
import { toAppError } from '@/src/utils/errors';

function findAccountInTree(
  id: number,
  list: AccountTreeNode[],
): AccountTreeNode | null {
  for (const item of list) {
    if (item.id === id) return item;
    const found = (item.children ?? []).find((c) => c.id === id);
    if (found) return found;
  }
  return null;
}

function countActiveFilters(search: string, type: AccountType | ''): number {
  return (search ? 1 : 0) + (type ? 1 : 0);
}

export default function AccountListPage() {
  const router = useRouter();
  const theme = useResolvedTheme();
  const colors = palette[theme];

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<AccountType | ''>('');
  const [isActiveFilter, setIsActiveFilter] = useState(true);
  const [filterDraft, setFilterDraft] = useState<CoaFilterDraft>(
    createEmptyCoaFilterDraft,
  );
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const { data: accounts, isLoading, isError, refetch } = useAccounts(
    typeFilter || undefined,
    isActiveFilter,
    search || undefined,
  );
  const createAccount = useCreateAccount();
  const deleteAccount = useDeleteAccount();

  const showToast = useToastStore((state) => state.showToast);

  const [formVisible, setFormVisible] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const deleteItem = deleteId
    ? findAccountInTree(deleteId, accounts ?? [])
    : null;

  const activeFilterCount = countActiveFilters(search, typeFilter);

  const handleOpenFilter = () => {
    setFilterDraft({
      search,
      type: typeFilter,
      isActive: isActiveFilter,
    });
    setIsFilterVisible(true);
  };

  const handleSubmitFilter = () => {
    setSearch(filterDraft.search);
    setTypeFilter(filterDraft.type);
    setIsActiveFilter(filterDraft.isActive);
    setIsFilterVisible(false);
  };

  const handleResetFilter = () => {
    const empty = createEmptyCoaFilterDraft();
    setFilterDraft(empty);
    setSearch('');
    setTypeFilter('');
    setIsActiveFilter(true);
    setIsFilterVisible(false);
  };

  const handleCreate = async (payload: CreateAccountPayload) => {
    try {
      await createAccount.mutateAsync(payload);
      setFormVisible(false);
    } catch (err) {
      const appErr = toAppError(err);
      showToast(appErr.userMessage, 'danger');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAccount.mutateAsync(deleteId);
      setDeleteId(null);
    } catch (err) {
      const appErr = toAppError(err);
      showToast(appErr.userMessage, 'danger');
    }
  };

  const handlePress = (id: number) => {
    router.push(pfRoutes.accountDetail(id));
  };

  const handleLongPress = (id: number) => {
    setDeleteId(id);
  };

  return (
    <>
      <FixedAssetSubHeader title="Daftar Akun" />
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
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} height={72} />
              ))}
            </View>
          ) : isError ? (
            <View style={styles.centerState}>
              <Text tone="danger">Gagal memuat akun</Text>
              <Pressable onPress={() => refetch()} style={styles.retryButton}>
                <Text tone="muted">Coba Lagi</Text>
              </Pressable>
            </View>
          ) : !accounts || accounts.length === 0 ? (
            <View style={styles.centerState}>
              <Ionicons
                name="folder-open-outline"
                size={48}
                color={colors.muted}
              />
              <Text tone="muted" style={styles.emptyText}>
                Belum ada akun
              </Text>
            </View>
          ) : (
            <View style={styles.treeList}>
              {accounts.map((account) => (
                <CoaTreeItem
                  key={account.id}
                  account={account}
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
          styles.filterFab,
          {
            backgroundColor:
              activeFilterCount > 0 ? colors.warning : colors.surface,
            borderColor: colors.border,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
        onPress={handleOpenFilter}
      >
        <Ionicons
          name="filter-outline"
          size={22}
          color={activeFilterCount > 0 ? '#FFFFFF' : colors.text}
        />
        {activeFilterCount > 0 && (
          <View style={[styles.filterBadge, { backgroundColor: colors.danger }]}>
            <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
          </View>
        )}
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
        ]}
        onPress={() => setFormVisible(true)}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>

      <CoaFilterModal
        visible={isFilterVisible}
        draft={filterDraft}
        onChangeDraft={setFilterDraft}
        onClose={() => setIsFilterVisible(false)}
        onSubmit={handleSubmitFilter}
        onReset={handleResetFilter}
      />

      <CoaFormModal
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSubmit={handleCreate}
        isSubmitting={createAccount.isPending}
      />

      <CoaDeleteConfirm
        visible={deleteId !== null}
        accountName={deleteItem?.name ?? ''}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isDeleting={deleteAccount.isPending}
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
  treeList: {
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
  filterFab: {
    position: 'absolute',
    bottom: spacing.lg * 2 + 66,
    right: spacing.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderWidth: 1,
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
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
