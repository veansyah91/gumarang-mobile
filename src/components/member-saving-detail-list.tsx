import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    Modal,
    Pressable,
    RefreshControl,
    StyleSheet,
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

  const dateTime = new Date(item.date);
  const formattedDate = formatDateID(item.date);
  const formattedTime = dateTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <Card>
      <View style={styles.cardHeader}>
        <Text tone="muted" style={styles.cardDate}>
          {formattedDate}, {formattedTime}
        </Text>
        <Text style={styles.cardAmount}>{item.amount} gram</Text>
      </View>
      <Text tone="muted">{item.no_ref}</Text>
      <View
        style={[styles.typeBadge, { backgroundColor: badgeColor }]}
      >
        <Text style={styles.typeBadgeText}>{item.type.toUpperCase()}</Text>
      </View>
    </Card>
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
          <Text variant="subtitle">Filter</Text>

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

          <View>
            <Text style={styles.label}>Tipe Transaksi</Text>
            <View style={styles.typeButtonsContainer}>
              <View style={styles.typeButton}>
                <Button
                  label="Semua"
                  onPress={() => onChangeDraft({ ...draft, type: '' })}
                  variant={draft.type === '' ? 'primary' : 'secondary'}
                />
              </View>
              <View style={styles.typeButton}>
                <Button
                  label="Debit"
                  onPress={() => onChangeDraft({ ...draft, type: 'debit' })}
                  variant={draft.type === 'debit' ? 'primary' : 'secondary'}
                />
              </View>
              <View style={styles.typeButton}>
                <Button
                  label="Kredit"
                  onPress={() => onChangeDraft({ ...draft, type: 'credit' })}
                  variant={draft.type === 'credit' ? 'primary' : 'secondary'}
                />
              </View>
            </View>
          </View>

          <View>
            <Text style={styles.label}>Akun Simpanan</Text>
            {isLoadingSavings ? (
              <Text tone="muted" style={styles.loadingText}>Memuat...</Text>
            ) : (
              <View style={styles.savingsContainer}>
                <View style={styles.savingButton}>
                  <Button
                    label="Semua"
                    onPress={() => onChangeDraft({ ...draft, userSavingId: '' })}
                    variant={draft.userSavingId === '' ? 'primary' : 'secondary'}
                  />
                </View>
                {savingsList.map((saving) => (
                  <View key={saving.id} style={styles.savingButton}>
                    <Button
                      label={`${saving.no_ref} - ${saving.product_category.name}`}
                      onPress={() => onChangeDraft({ ...draft, userSavingId: saving.id })}
                      variant={draft.userSavingId === saving.id ? 'primary' : 'secondary'}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>

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

export function MemberSavingDetailList() {
  const { user_saving_id } = useLocalSearchParams<{ user_saving_id?: string }>();
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
        start_date: startDate || undefined,
        end_date: endDate || undefined,
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
        searchPlaceholder="Cari mutasi"
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardDate: {
    flex: 1,
  },
  cardAmount: {
    fontWeight: '600',
  },
  typeBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 4,
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
  typeBadgeText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
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
  modalActions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  typeButtonsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  typeButton: {
    flex: 1,
  },
  savingsContainer: {
    gap: spacing.sm,
  },
  savingButton: {
    width: '100%',
  },
  loadingText: {
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});
