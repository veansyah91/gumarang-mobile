import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { Badge } from '@/src/components/ui/badge';
import { Card } from '@/src/components/ui/card';
import { FixedAssetSubHeader } from '@/src/components/ui/fixed-asset-sub-header';
import { Screen } from '@/src/components/ui/screen';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Text } from '@/src/components/ui/text';
import {
  CashFilterModal,
  createEmptyFilterDraft,
  type FilterDraft,
} from '@/src/components/cash-filter-modal';
import { useDebts } from '@/src/hooks/use-debt';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, spacing } from '@/src/theme/tokens';
import type { DebtItem } from '@/src/types/debt';
import { formatIDR } from '@/src/utils/currency';

function formatDate(iso: string | null) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getStatusVariant(status: string): 'warning' | 'default' | 'success' {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'partial':
      return 'default';
    case 'paid':
      return 'success';
    default:
      return 'default';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'partial':
      return 'Partial';
    case 'paid':
      return 'Lunas';
    default:
      return status;
  }
}

function renderDebtItem(
  item: DebtItem,
  colors: Record<string, string>,
  router: ReturnType<typeof useRouter>,
) {
  return (
    <Pressable
      key={item.id}
      onPress={() =>
        router.push(`/personal-finance/debt/payable/${item.id}` as any)
      }
      style={({ pressed }) => ({
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Card>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Badge
            label={getStatusLabel(item.status)}
            variant={getStatusVariant(item.status)}
          />
        </View>
        <Text tone="muted" style={styles.itemContact}>
          {item.contact_name}
        </Text>
        <View style={styles.itemAmountRow}>
          <View>
            <Text tone="muted" style={styles.amountLabel}>
              Nominal
            </Text>
            <Text style={styles.itemAmount}>{formatIDR(item.amount)}</Text>
          </View>
          <View>
            <Text tone="muted" style={styles.amountLabel}>
              Sisa
            </Text>
            <Text style={styles.itemBalance}>{formatIDR(item.balance)}</Text>
          </View>
        </View>
        {item.due_date ? (
          <Text tone="muted" style={styles.itemDue}>
            Jatuh tempo: {formatDate(item.due_date)}
          </Text>
        ) : null}
      </Card>
    </Pressable>
  );
}

function countActiveFilters(draft: FilterDraft) {
  let count = 0;
  if (draft.search) count++;
  if (draft.startDate || draft.endDate) count++;
  return count;
}

export default function DebtPayableListPage() {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const router = useRouter();

  const [searchText, setSearchText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filterDraft, setFilterDraft] = useState<FilterDraft>(
    createEmptyFilterDraft(),
  );

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useDebts({
    query: searchText || undefined,
    type: 'payable',
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    perPage: 15,
  });

  const allDebts = data?.pages.flatMap((p) => p.data) ?? [];
  const total = data?.pages[0]?.meta?.total ?? 0;

  const activeFilterCount = countActiveFilters({
    search: searchText,
    startDate,
    endDate,
    selectedPreset: endDate ? 'custom' : '',
  });

  const handleOpenFilter = () => {
    setFilterDraft({
      search: searchText,
      startDate,
      endDate,
      selectedPreset: endDate ? 'custom' : '',
    });
    setIsFilterVisible(true);
  };

  const handleSubmitFilter = () => {
    setSearchText(filterDraft.search);
    setStartDate(filterDraft.startDate);
    setEndDate(filterDraft.endDate);
    setIsFilterVisible(false);
  };

  const handleResetFilter = () => {
    setFilterDraft(createEmptyFilterDraft());
    setSearchText('');
    setStartDate('');
    setEndDate('');
    setIsFilterVisible(false);
  };

  if (isLoading) {
    return (
      <>
        <FixedAssetSubHeader title="Daftar Utang" />
        <Screen
          scrollable
          safeAreaEdges={['left', 'right', 'bottom']}
        >
          <View style={styles.skeletonList}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height={120} />
            ))}
          </View>
        </Screen>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <FixedAssetSubHeader title="Daftar Utang" />
        <Screen
          scrollable
          safeAreaEdges={['left', 'right', 'bottom']}
        >
          <View style={styles.centerState}>
            <Text tone="danger">Gagal memuat data</Text>
            <Pressable onPress={() => refetch()} style={styles.retryButton}>
              <Text tone="muted">Coba Lagi</Text>
            </Pressable>
          </View>
        </Screen>
      </>
    );
  }

  return (
    <>
      <FixedAssetSubHeader
        title="Daftar Utang"
        subtitle={String(total)}
      />
      <Screen safeAreaEdges={['left', 'right', 'bottom']}>
        <FlatList
          data={allDebts}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) =>
            renderDebtItem(item, colors, router)
          }
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} />
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.centerState}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color={colors.muted}
              />
              <Text tone="muted" style={styles.emptyText}>
                Belum ada utang
              </Text>
            </View>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : null
          }
        />
      </Screen>

      <CashFilterModal
        visible={isFilterVisible}
        draft={filterDraft}
        onChangeDraft={setFilterDraft}
        onClose={() => setIsFilterVisible(false)}
        onSubmit={handleSubmitFilter}
        onReset={handleResetFilter}
      />

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
          color={activeFilterCount > 0 ? colors.background : colors.text}
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
        onPress={() =>
          router.push('/personal-finance/debt/payable/create' as any)
        }
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  skeletonList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.xl * 2,
    flexGrow: 1,
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    gap: spacing.sm,
    flex: 1,
  },
  emptyText: {
    marginTop: spacing.sm,
  },
  retryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  itemContact: {
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  itemAmountRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  amountLabel: {
    fontSize: 10,
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  itemBalance: {
    fontSize: 16,
    fontWeight: '700',
  },
  itemDue: {
    fontSize: 11,
    marginTop: spacing.xs,
  },
  footerLoader: {
    paddingVertical: spacing.md,
    alignItems: 'center',
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
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
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
