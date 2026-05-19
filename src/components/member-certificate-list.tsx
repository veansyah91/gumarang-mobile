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
import type { CertificateListItem } from '@/src/types/certificate';
import { formatDateID, isDateAfter, isValidDateInput } from '@/src/utils/date';
import { toAppError } from '@/src/utils/errors';

type FilterDraft = {
  startDate: string;
  endDate: string;
};

function toNumber(value: number | string | null | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatWeight(value: number | string | null | undefined) {
  return `${toNumber(value).toFixed(2)} gram`;
}

function CertificateListSkeleton() {
  return (
    <View style={styles.section}>
      <View style={styles.listSection}>
        <Skeleton height={24} />
        <Skeleton height={92} />
        <Skeleton height={92} />
        <Skeleton height={92} />
      </View>
    </View>
  );
}

function CertificateListErrorState({
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
      <Text variant="subtitle">Data sertifikat belum bisa dimuat</Text>
      <Text tone="muted">{message}</Text>
      <TouchableOpacity
        onPress={onRetry}
        disabled={isRetrying}
        style={styles.retryButton}
      >
        <Text tone="success">{isRetrying ? 'Memuat...' : 'Coba lagi'}</Text>
      </TouchableOpacity>
    </Card>
  );
}

function CertificateCard({
  item,
  onPress,
}: {
  item: CertificateListItem;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Card>
        <View style={styles.cardHeader}>
          <Text variant="subtitle">{item.no_ref}</Text>
          <Text tone="muted">{formatDateID(item.created_at)}</Text>
        </View>
        <Text tone="muted">Berat: {formatWeight(item.weight)}</Text>
      </Card>
    </TouchableOpacity>
  );
}

function CertificateFilterModal({
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

export function MemberCertificateList() {
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
      'member-certificate-list',
      page,
      searchQuery,
      startDate,
      endDate,
    ],
    queryFn: () =>
      memberApi.getCertificates({
        page,
        limit: 10,
        query: searchQuery || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const data = query.data;
  const errorMessage = query.error ? toAppError(query.error).userMessage : null;
  const isListLoading = query.isLoading || query.isFetching;

  const certificates = data?.certificates.data ?? [];
  const pagination = data?.certificates;

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

  return (
    <View style={styles.container}>
      <Subnav
        searchValue={searchInput}
        searchPlaceholder="Cari sertifikat"
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
        {isListLoading && !data ? (
          <CertificateListSkeleton />
        ) : errorMessage && !data ? (
          <CertificateListErrorState
            message={errorMessage}
            onRetry={async () => {
              await query.refetch();
            }}
            isRetrying={isRefreshing}
          />
        ) : data ? (
          <View style={styles.section}>
            <View style={styles.listSection}>
              {isListLoading ? (
                <CertificateListSkeleton />
              ) : certificates.length > 0 ? (
                certificates.map((item) => (
                  <CertificateCard
                    key={item.id}
                    item={item}
                    onPress={() =>
                      router.push({
                        pathname: '/(app)/certificate/[id]',
                        params: { id: String(item.id) },
                      })
                    }
                  />
                ))
              ) : (
                <Card>
                  <Text tone="muted">Belum ada data sertifikat.</Text>
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

      <CertificateFilterModal
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
  helperText: {
    fontSize: 12,
  },
  modalActions: {
    gap: spacing.sm,
  },
});
