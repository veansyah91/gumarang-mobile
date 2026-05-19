import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    Modal,
    Pressable,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import { Subnav } from '@/src/components/subnav';
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { DateInput } from '@/src/components/ui/date-input';
import { Screen } from '@/src/components/ui/screen';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { memberApi } from '@/src/services/api/member';
import { palette, spacing } from '@/src/theme/tokens';
import type { GoldConvertionItem } from '@/src/types/member';
import { formatDateID, isDateAfter, isValidDateInput } from '@/src/utils/date';
import { toAppError } from '@/src/utils/errors';

type FilterDraft = {
  startDate: string;
  endDate: string;
};

function GoldConvertionListSkeleton() {
  return (
    <View style={styles.section}>
      <Card>
        <Skeleton height={18} />
        <Skeleton height={28} />
        <Skeleton height={18} />
      </Card>
      <Card>
        <Skeleton height={48} />
      </Card>
      <View style={styles.listSection}>
        <Skeleton height={90} />
        <Skeleton height={90} />
        <Skeleton height={90} />
      </View>
    </View>
  );
}

function GoldConvertionListErrorState({
  message,
  onRetry,
  isRetrying,
}: {
  message: string;
  onRetry: () => void | Promise<void>;
  isRetrying: boolean;
}) {
  return (
    <Card>
      <Text variant="subtitle">Riwayat tukar emas belum bisa dimuat</Text>
      <Text tone="muted">{message}</Text>
      <View style={styles.retryButton}>
        <Button
          label={isRetrying ? 'Memuat...' : 'Coba lagi'}
          onPress={onRetry}
          disabled={isRetrying}
          variant="secondary"
        />
      </View>
    </Card>
  );
}

function GoldConvertionCard({
  item,
  onPress,
}: {
  item: GoldConvertionItem;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Card>
        <View style={styles.cardHeader}>
          <Text variant="subtitle">{item.no_ref}</Text>
          <Text tone="muted">{formatDateID(item.date)}</Text>
        </View>
        <Text tone="muted">
          Berat: {item.weight} {item.unit}
        </Text>
      </Card>
    </TouchableOpacity>
  );
}

function GoldConvertionFilterModal({
  visible,
  draft,
  onChangeDraft,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  draft: FilterDraft;
  onChangeDraft: (draft: FilterDraft) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  const isStartValid =
    draft.startDate === '' || isValidDateInput(draft.startDate);
  const isEndValid = draft.endDate === '' || isValidDateInput(draft.endDate);
  const submitDisabled =
    !draft.startDate ||
    !draft.endDate ||
    !isStartValid ||
    !isEndValid ||
    isDateAfter(draft.startDate, draft.endDate);

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
          <Text variant="subtitle">Filter Tanggal</Text>
          <DateInput
            label="Tanggal Awal"
            placeholder="2026-05-01"
            value={draft.startDate}
            onChangeDate={(value) =>
              onChangeDraft({ ...draft, startDate: value.trim() })
            }
          />
          <DateInput
            label="Tanggal Akhir"
            placeholder="2026-05-31"
            value={draft.endDate}
            onChangeDate={(value) =>
              onChangeDraft({ ...draft, endDate: value.trim() })
            }
          />

          <View style={styles.modalActions}>
            <Button label="Batal" onPress={onClose} variant="secondary" />
            <Button
              label="Terapkan"
              onPress={onSubmit}
              disabled={submitDisabled}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function MemberGoldConvertionList() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filterDraft, setFilterDraft] = useState<FilterDraft>({
    startDate: '',
    endDate: '',
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const query = useQuery({
    queryKey: [
      'member-gold-convertion-list',
      page,
      searchQuery,
      startDate,
      endDate,
    ],
    queryFn: () =>
      memberApi.getGoldConvertions({
        page,
        query: searchQuery || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const data = query.data;
  const errorMessage = query.error ? toAppError(query.error).userMessage : null;
  const items = data?.data ?? [];
  const pagination = data?.meta;

  const paginationInfo = useMemo(
    () => ({
      currentPage: pagination?.current_page ?? 1,
      lastPage: pagination?.last_page ?? 1,
      from: pagination?.from,
      to: pagination?.to,
      total: pagination?.total,
    }),
    [pagination],
  );

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setPage(1);
  };

  const handleOpenFilter = () => {
    setFilterDraft({ startDate, endDate });
    setIsFilterVisible(true);
  };

  const handleSubmitFilter = () => {
    setStartDate(filterDraft.startDate);
    setEndDate(filterDraft.endDate);
    setPage(1);
    setIsFilterVisible(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await query.refetch();
    setIsRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Subnav
        searchValue={searchInput}
        searchPlaceholder="Cari invoice"
        onSearchChange={setSearchInput}
        onSearchClear={handleClearSearch}
        onFilterPress={handleOpenFilter}
        currentPage={paginationInfo.currentPage}
        lastPage={paginationInfo.lastPage}
        from={paginationInfo.from}
        to={paginationInfo.to}
        total={paginationInfo.total}
        onPrev={() => setPage((current) => Math.max(1, current - 1))}
        onNext={() =>
          setPage((current) => Math.min(paginationInfo.lastPage, current + 1))
        }
      />

      <Screen
        scrollable
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        safeAreaEdges={['bottom']}
        contentContainerStyle={[styles.content, { paddingTop: spacing.md }]}
      >
        {query.isLoading && !data ? (
          <GoldConvertionListSkeleton />
        ) : errorMessage && !data ? (
          <GoldConvertionListErrorState
            message={errorMessage}
            onRetry={async () => {
              await query.refetch();
            }}
            isRetrying={isRefreshing}
          />
        ) : data ? (
          <View style={styles.section}>
            <View style={styles.listSection}>
              {items.length > 0 ? (
                items.map((item) => (
                  <GoldConvertionCard
                    key={item.id}
                    item={item}
                    onPress={() =>
                      router.push({
                        pathname: '/(app)/gold-convertion-member/[id]',
                        params: { id: String(item.id) },
                      })
                    }
                  />
                ))
              ) : (
                <Card>
                  <Text tone="muted">Belum ada riwayat tukar emas.</Text>
                </Card>
              )}
            </View>
          </View>
        ) : (
          <Card>
            <Text tone="muted">Data tidak tersedia.</Text>
          </Card>
        )}
      </Screen>

      <GoldConvertionFilterModal
        visible={isFilterVisible}
        draft={filterDraft}
        onChangeDraft={setFilterDraft}
        onClose={() => setIsFilterVisible(false)}
        onSubmit={handleSubmitFilter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.lg,
  },
  section: {
    gap: spacing.md,
  },
  listSection: {
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  retryButton: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  modalCard: {
    gap: spacing.md,
    borderRadius: 24,
    padding: spacing.lg,
  },
  modalActions: {
    gap: spacing.sm,
  },
});
