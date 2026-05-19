import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Subnav } from '@/src/components/subnav';
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { DateInput } from '@/src/components/ui/date-input';
import { Screen } from '@/src/components/ui/screen';
import { SelectInput } from '@/src/components/ui/select-input';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { memberApi } from '@/src/services/api/member';
import { palette, radius, spacing } from '@/src/theme/tokens';
import type { SavingDetailItem, SavingMember } from '@/src/types/member';
import { formatDateID, isDateAfter, isValidDateInput } from '@/src/utils/date';
import { toAppError } from '@/src/utils/errors';

type FilterDraft = {
  startDate: string;
  endDate: string;
  type: 'debit' | 'credit' | '';
  userSavingId: number | string | '';
};

function SavingDetailListSkeleton() {
  return (
    <View style={styles.section}>
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

function SavingDetailListErrorState({
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
      <Text variant="subtitle">Mutasi tabungan belum bisa dimuat</Text>
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

function SavingDetailCard({ item }: { item: SavingDetailItem }) {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const isDebit = item.type === 'debit';
  const badgeColor = isDebit ? '#EF4444' : '#10B981';

  const dateTime = new Date(item.created_at);
  const formattedDate = formatDateID(item.created_at);
  const formattedTime = dateTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <View
      style={[
        styles.detailCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text tone="muted" style={styles.cardDate}>
            {formattedDate}, {formattedTime}
          </Text>
          <Text style={styles.cardAmount}>{item.amount} gram</Text>
        </View>
        <Text tone="muted">{item.no_ref}</Text>
      </View>
      <View style={[styles.typeBadge, { backgroundColor: badgeColor }]}>
        <Text style={styles.typeBadgeText}>{item.type.toUpperCase()}</Text>
      </View>
    </View>
  );
}

function SavingDetailFilterModal({
  visible,
  draft,
  onChangeDraft,
  onClose,
  onSubmit,
  savingsList,
  isLoadingSavings,
}: {
  visible: boolean;
  draft: FilterDraft;
  onChangeDraft: (draft: FilterDraft) => void;
  onClose: () => void;
  onSubmit: () => void;
  savingsList: SavingMember[];
  isLoadingSavings: boolean;
}) {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const [errors, setErrors] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});

  useEffect(() => {
    if (visible) {
      setErrors({});
    }
  }, [visible]);

  const handleValidateAndSubmit = () => {
    const startEmpty = !draft.startDate;
    const endEmpty = !draft.endDate;
    const newErrors: { startDate?: string; endDate?: string } = {};

    if (startEmpty && endEmpty) {
      setErrors({});
      onSubmit();
      return;
    }

    if (!startEmpty && endEmpty) {
      newErrors.endDate = 'tanggal akhir tidak boleh kosong';
      setErrors(newErrors);
      return;
    }

    if (startEmpty && !endEmpty) {
      newErrors.startDate = 'tanggal awal tidak boleh kosong';
      setErrors(newErrors);
      return;
    }

    if (
      !startEmpty &&
      !endEmpty &&
      (!isValidDateInput(draft.startDate) || !isValidDateInput(draft.endDate))
    ) {
      if (!isValidDateInput(draft.startDate))
        newErrors.startDate = 'format tanggal tidak valid';
      if (!isValidDateInput(draft.endDate))
        newErrors.endDate = 'format tanggal tidak valid';
      setErrors(newErrors);
      return;
    }

    if (isDateAfter(draft.startDate, draft.endDate)) {
      const dateStart = new Date(`${draft.startDate}T00:00:00`).getTime();
      const dateEnd = new Date(`${draft.endDate}T00:00:00`).getTime();
      const maxDate = dateStart > dateEnd ? draft.startDate : draft.endDate;

      onChangeDraft({
        ...draft,
        startDate: maxDate,
        endDate: maxDate,
      });
      setErrors({});
      return;
    }

    setErrors({});
    onSubmit();
  };

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
          <Text variant="subtitle">Filter</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.modalScroll}
          >
            <View style={styles.modalScrollContent}>
              <View>
                <DateInput
                  label="Tanggal Awal"
                  placeholder="2026-05-01"
                  value={draft.startDate}
                  onChangeDate={(value) =>
                    onChangeDraft({ ...draft, startDate: value.trim() })
                  }
                  error={!!errors.startDate}
                />
                {!!errors.startDate && (
                  <Text tone="danger" style={styles.errorText}>
                    {errors.startDate}
                  </Text>
                )}
              </View>

              <View>
                <DateInput
                  label="Tanggal Akhir"
                  placeholder="2026-05-31"
                  value={draft.endDate}
                  onChangeDate={(value) =>
                    onChangeDraft({ ...draft, endDate: value.trim() })
                  }
                  error={!!errors.endDate}
                />
                {!!errors.endDate && (
                  <Text tone="danger" style={styles.errorText}>
                    {errors.endDate}
                  </Text>
                )}
              </View>

              <SelectInput
                label="Tipe Transaksi"
                value={draft.type}
                options={[
                  { label: 'Semua', value: '' },
                  { label: 'Debit', value: 'debit' },
                  { label: 'Kredit', value: 'credit' },
                ]}
                onChange={(val) =>
                  onChangeDraft({
                    ...draft,
                    type: val as 'debit' | 'credit' | '',
                  })
                }
              />

              {isLoadingSavings ? (
                <Text tone="muted" style={styles.loadingText}>
                  Memuat...
                </Text>
              ) : (
                <SelectInput
                  label="Akun Simpanan"
                  value={draft.userSavingId}
                  options={[
                    { label: 'Semua', value: '' },
                    ...savingsList.map((s) => ({
                      label: `${s.no_ref} - ${s.product_category.name}`,
                      value: s.id,
                    })),
                  ]}
                  onChange={(val) =>
                    onChangeDraft({ ...draft, userSavingId: val })
                  }
                />
              )}
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <Button label="Batal" onPress={onClose} variant="secondary" />
            <Button label="Terapkan" onPress={handleValidateAndSubmit} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function MemberSavingDetailList() {
  const { user_saving_id } = useLocalSearchParams<{
    user_saving_id?: string;
  }>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filterDraft, setFilterDraft] = useState<FilterDraft>({
    startDate: '',
    endDate: '',
    type: '',
    userSavingId: user_saving_id || '',
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState<'debit' | 'credit' | ''>('');
  const [userSavingId, setUserSavingId] = useState<number | string | ''>(
    user_saving_id || '',
  );

  const savingsQuery = useQuery({
    queryKey: ['member-savings'],
    queryFn: () => memberApi.getSavingMembers(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const query = useQuery({
    queryKey: [
      'member-saving-detail-list',
      userSavingId,
      page,
      searchQuery,
      startDate,
      endDate,
      type,
    ],
    queryFn: () =>
      memberApi.getSavingDetails({
        page,
        query: searchQuery || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        type: type || undefined,
        userSaving: userSavingId || undefined,
      }),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const data = query.data;
  const errorMessage = query.error ? toAppError(query.error).userMessage : null;
  const details = data?.data ?? [];
  const meta = data?.meta;

  const paginationInfo = useMemo(
    () => ({
      currentPage: meta?.current_page ?? 1,
      lastPage: meta?.last_page ?? 1,
      from: meta?.from,
      to: meta?.to,
      total: meta?.total,
    }),
    [meta],
  );

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setPage(1);
  };

  const handleOpenFilter = () => {
    setFilterDraft({
      startDate,
      endDate,
      type,
      userSavingId,
    });
    setIsFilterVisible(true);
  };

  const handleSubmitFilter = () => {
    setStartDate(filterDraft.startDate);
    setEndDate(filterDraft.endDate);
    setType(filterDraft.type);
    setUserSavingId(filterDraft.userSavingId);
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
        searchPlaceholder="Cari mutasi tabungan"
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
        contentContainerStyle={styles.content}
      >
        {query.isLoading && !data ? (
          <SavingDetailListSkeleton />
        ) : errorMessage && !data ? (
          <SavingDetailListErrorState
            message={errorMessage}
            onRetry={async () => {
              await query.refetch();
            }}
            isRetrying={isRefreshing}
          />
        ) : data ? (
          <View style={styles.section}>
            <View style={styles.listSection}>
              {details.length > 0 ? (
                details.map((item) => (
                  <SavingDetailCard key={item.id} item={item} />
                ))
              ) : (
                <Card>
                  <Text tone="muted">Belum ada mutasi tabungan emas.</Text>
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

      <SavingDetailFilterModal
        visible={isFilterVisible}
        draft={filterDraft}
        onChangeDraft={setFilterDraft}
        onClose={() => setIsFilterVisible(false)}
        onSubmit={handleSubmitFilter}
        savingsList={savingsQuery.data ?? []}
        isLoadingSavings={savingsQuery.isLoading}
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
  detailCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardBody: {
    gap: spacing.xs,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: {
    flex: 1,
  },
  cardAmount: {
    fontWeight: '600',
  },
  typeBadge: {
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  typeBadgeText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
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
    maxHeight: '80%',
  },
  modalScroll: {
    flexGrow: 0,
  },
  modalScrollContent: {
    gap: spacing.md,
  },
  modalActions: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  loadingText: {
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  errorText: {
    fontSize: 12,
    marginTop: 2,
  },
});
