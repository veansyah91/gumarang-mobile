import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Badge } from '@/src/components/ui/badge';
import { Card } from '@/src/components/ui/card';
import {
  FilterFab,
  ListFab,
  PersonalFinanceListScreen,
} from '@/src/components/ui/personal-finance';
import { Text } from '@/src/components/ui/text';
import {
  CashFilterModal,
  createEmptyFilterDraft,
  type FilterDraft,
} from '@/src/components/cash-filter-modal';
import { useDebts } from '@/src/hooks/use-debt';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { pfRoutes } from '@/src/navigation/personal-finance-routes';
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
      onPress={() => router.push(pfRoutes.payableDetail(item.id))}
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

  return (
    <>
      <PersonalFinanceListScreen
        title="Daftar Utang"
        subtitle={String(total)}
        data={allDebts}
        isLoading={isLoading}
        isError={isError}
        refetch={refetch}
        isFetching={isFetching}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        renderItem={(item) => renderDebtItem(item, colors, router)}
        keyExtractor={(item) => String(item.id)}
        emptyIcon="document-text-outline"
        emptyTitle="Belum ada utang"
        errorTitle="Gagal memuat data"
        skeletonHeight={120}
        filterFab={
          <FilterFab
            onPress={handleOpenFilter}
            active={activeFilterCount > 0}
            badgeCount={activeFilterCount}
          />
        }
        mainFab={
          <ListFab onPress={() => router.push(pfRoutes.payableCreate())} />
        }
      />

      <CashFilterModal
        visible={isFilterVisible}
        draft={filterDraft}
        onChangeDraft={setFilterDraft}
        onClose={() => setIsFilterVisible(false)}
        onSubmit={handleSubmitFilter}
        onReset={handleResetFilter}
      />
    </>
  );
}

const styles = StyleSheet.create({
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
});
