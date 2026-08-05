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
  createEmptyDebtFilterDraft,
  DebtFilterModal,
  type DebtFilterDraft,
} from '@/src/components/debt-filter-modal';
import { useAllDebtEntries } from '@/src/hooks/use-debt';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { pfRoutes } from '@/src/navigation/personal-finance-routes';
import { palette, spacing } from '@/src/theme/tokens';
import type { DebtEntryAll } from '@/src/types/debt';
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

function renderEntryItem(
  item: DebtEntryAll,
  colors: Record<string, string>,
  router: ReturnType<typeof useRouter>,
) {
  return (
    <Pressable
      key={item.id}
      onPress={() =>
        router.push(pfRoutes.payableEntryDetail(item.id, item.debt_id))
      }
      style={({ pressed }) => ({
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Card>
        <View style={styles.itemHeader}>
          <Text style={styles.itemRef}>{item.no_ref}</Text>
          <Badge
            label={item.type === 'credit' ? 'Kredit' : 'Debit'}
            variant={item.type === 'credit' ? 'success' : 'warning'}
          />
        </View>
        <Text tone="muted" style={styles.itemDebt}>
          {item.debt_name} • {item.contact_name}
        </Text>
        <View style={styles.itemAmountRow}>
          <Text tone="muted" style={styles.amountLabel}>
            {formatDate(item.date)}
          </Text>
          <Text style={styles.itemAmount}>{formatIDR(item.amount)}</Text>
        </View>
        {item.notes ? (
          <Text tone="muted" style={styles.itemNotes}>
            {item.notes}
          </Text>
        ) : null}
      </Card>
    </Pressable>
  );
}

function countActiveFilters(draft: DebtFilterDraft) {
  let count = 0;
  if (draft.search) count++;
  if (draft.startDate || draft.endDate) count++;
  if (draft.debtId) count++;
  return count;
}

export default function DebtPayableEntryListPage() {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const router = useRouter();

  const [searchText, setSearchText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [debtId, setDebtId] = useState<string | number>('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filterDraft, setFilterDraft] = useState<DebtFilterDraft>(
    createEmptyDebtFilterDraft(),
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
  } = useAllDebtEntries({
    type: 'payable',
    entry_type: 'debit',
    debt_id: debtId ? Number(debtId) : undefined,
    search: searchText || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    perPage: 15,
  });

  const allEntries = data?.pages.flatMap((p) => p.data) ?? [];
  const total = data?.pages[0]?.meta?.total ?? 0;

  const activeFilterCount = countActiveFilters({
    search: searchText,
    startDate,
    endDate,
    selectedPreset: endDate ? 'custom' : '',
    debtId,
    debtSearch: '',
  });

  const handleOpenFilter = () => {
    setFilterDraft({
      search: searchText,
      startDate,
      endDate,
      selectedPreset: endDate ? 'custom' : '',
      debtId,
      debtSearch: '',
    });
    setIsFilterVisible(true);
  };

  const handleSubmitFilter = () => {
    setSearchText(filterDraft.search);
    setStartDate(filterDraft.startDate);
    setEndDate(filterDraft.endDate);
    setDebtId(filterDraft.debtId);
    setIsFilterVisible(false);
  };

  const handleResetFilter = () => {
    setFilterDraft(createEmptyDebtFilterDraft());
    setSearchText('');
    setStartDate('');
    setEndDate('');
    setDebtId('');
    setIsFilterVisible(false);
  };

  return (
    <>
      <PersonalFinanceListScreen
        title="Pembayaran Utang"
        subtitle={String(total)}
        data={allEntries}
        isLoading={isLoading}
        isError={isError}
        refetch={refetch}
        isFetching={isFetching}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        renderItem={(item) => renderEntryItem(item, colors, router)}
        keyExtractor={(item) => String(item.id)}
        emptyIcon="document-text-outline"
        emptyTitle="Belum ada pembayaran utang"
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
          <ListFab
            onPress={() => router.push(pfRoutes.payableEntryCreate())}
          />
        }
      />

      <DebtFilterModal
        visible={isFilterVisible}
        draft={filterDraft}
        onChangeDraft={setFilterDraft}
        onClose={() => setIsFilterVisible(false)}
        onSubmit={handleSubmitFilter}
        onReset={handleResetFilter}
        debtType="payable"
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
  itemRef: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  itemDebt: {
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  itemAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 12,
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  itemNotes: {
    fontSize: 11,
    marginTop: spacing.xs,
  },
});
