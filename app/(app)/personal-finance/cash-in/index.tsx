import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';

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
import { useCashIns } from '@/src/hooks/use-cash-in';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { pfRoutes } from '@/src/navigation/personal-finance-routes';
import { cashInApi } from '@/src/services/api/cash-in';
import { exportTransactionsToPdf } from '@/src/services/pdf-export';
import { useToastStore } from '@/src/state/toast-store';
import { palette, spacing } from '@/src/theme/tokens';
import type { CashInTransaction } from '@/src/types/cash-in';
import { formatIDR } from '@/src/utils/currency';
import { toAppError } from '@/src/utils/errors';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function renderTransactionItem(
  item: CashInTransaction,
  colors: Record<string, string>,
  router: ReturnType<typeof useRouter>,
) {
  return (
    <Pressable
      key={item.id}
      onPress={() => router.push(pfRoutes.cashInDetail(item.id))}
      style={({ pressed }) => ({
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Card>
        <View style={styles.itemHeader}>
          <Text style={styles.itemRef}>{item.reference}</Text>
          <Text tone="muted" style={styles.itemDate}>
            {formatDate(item.created_at)}
          </Text>
        </View>
        <Text style={styles.itemAmount}>
          {formatIDR(item.total_amount)}
        </Text>
        {item.notes ? (
          <Text tone="muted" style={styles.itemNotes}>
            {item.notes}
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

export default function CashInListPage() {
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
  const [isExportVisible, setIsExportVisible] = useState(false);
  const [exportDraft, setExportDraft] = useState<FilterDraft>(
    createEmptyFilterDraft(),
  );
  const [isExporting, setIsExporting] = useState(false);
  const showToast = useToastStore((state) => state.showToast);

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useCashIns({ search: searchText || undefined, startDate: startDate || undefined, endDate: endDate || undefined, perPage: 15 });

  const allTransactions = data?.pages.flatMap((p) => p.data) ?? [];
  const total = data?.pages[0]?.meta?.total ?? 0;

  const activeFilterCount = countActiveFilters({
    search: searchText,
    startDate,
    endDate,
    selectedPreset: '',
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

  const handleOpenExport = () => {
    setExportDraft(createEmptyFilterDraft());
    setIsExportVisible(true);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const start = exportDraft.startDate || undefined;
      const end = exportDraft.endDate || undefined;

      let all: CashInTransaction[] = [];
      let page = 1;
      let lastPage = 1;
      do {
        const result = await cashInApi.getCashIns({
          search: exportDraft.search || undefined,
          startDate: start,
          endDate: end,
          perPage: 100,
          page,
        });
        all = all.concat(result.data);
        lastPage = result.meta.last_page;
        page += 1;
      } while (page <= lastPage);

      const rows = all.map((item) => ({
        date: item.created_at,
        description: item.notes || item.reference,
        debit: item.total_amount,
        credit: 0,
      }));

      setIsExportVisible(false);
      await exportTransactionsToPdf({
        title: 'Riwayat Transaksi',
        startDate: start,
        endDate: end,
        rows,
      });
    } catch (err) {
      showToast(toAppError(err).userMessage, 'danger');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <PersonalFinanceListScreen
        title="Kas Masuk"
        subtitle={String(total)}
        data={allTransactions}
        isLoading={isLoading}
        isError={isError}
        refetch={refetch}
        isFetching={isFetching}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        renderItem={(item) => renderTransactionItem(item, colors, router)}
        keyExtractor={(item) => String(item.id)}
        emptyIcon="wallet-outline"
        emptyTitle="Belum ada transaksi kas masuk"
        errorTitle="Gagal memuat transaksi"
        skeletonHeight={80}
        filterFab={
          <FilterFab
            onPress={handleOpenFilter}
            active={activeFilterCount > 0}
            badgeCount={activeFilterCount}
          />
        }
        extraFab={
          <Pressable
            style={({ pressed }) => [
              styles.exportFab,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            onPress={handleOpenExport}
          >
            <Ionicons name="download-outline" size={22} color={colors.text} />
          </Pressable>
        }
        mainFab={
          <ListFab onPress={() => router.push(pfRoutes.cashInCreate())} />
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

      <CashFilterModal
        visible={isExportVisible}
        draft={exportDraft}
        onChangeDraft={setExportDraft}
        onClose={() => setIsExportVisible(false)}
        onSubmit={handleExport}
        onReset={() => setExportDraft(createEmptyFilterDraft())}
        title="Export PDF"
        submitLabel="Export"
      />

      <Modal visible={isExporting} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Membuat PDF...</Text>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemRef: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  itemDate: {
    fontSize: 12,
  },
  itemAmount: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  itemNotes: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
  exportFab: {
    position: 'absolute',
    bottom: spacing.lg * 2 + 122,
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
  loadingOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
