import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/ui/button';
import { DateInput } from '@/src/components/ui/date-input';
import { FixedAssetSubHeader } from '@/src/components/ui/fixed-asset-sub-header';
import { Screen } from '@/src/components/ui/screen';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Text } from '@/src/components/ui/text';
import { useAccount, useAccountHistory } from '@/src/hooks/use-account';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, radius, spacing } from '@/src/theme/tokens';
import type { AccountHistoryEntry } from '@/src/types/account';
import { formatIDR } from '@/src/utils/currency';

type Preset = { key: string; label: string };
const PRESETS: Preset[] = [
  { key: 'today', label: 'Hari Ini' },
  { key: 'thisWeek', label: 'Minggu Ini' },
  { key: 'thisMonth', label: 'Bulan Ini' },
  { key: 'thisYear', label: 'Tahun Ini' },
  { key: 'custom', label: 'Kustom' },
];

function computeDateRange(
  preset: string,
): { startDate: string; endDate: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;

  switch (preset) {
    case 'today':
      return { startDate: todayStr, endDate: todayStr };
    case 'thisWeek': {
      const dayOfWeek = now.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(now);
      monday.setDate(now.getDate() - diff);
      const my = monday.getFullYear();
      const mm = String(monday.getMonth() + 1).padStart(2, '0');
      const md = String(monday.getDate()).padStart(2, '0');
      return { startDate: `${my}-${mm}-${md}`, endDate: todayStr };
    }
    case 'thisMonth':
      return { startDate: `${y}-${m}-01`, endDate: todayStr };
    case 'thisYear':
      return { startDate: `${y}-01-01`, endDate: todayStr };
    default:
      return { startDate: '', endDate: '' };
  }
}

function formatEntryDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function AccountHistoryPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const accountId = Number(id);

  const theme = useResolvedTheme();
  const colors = palette[theme];

  const { data: account } = useAccount(accountId);

  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');

  const [draftStartDate, setDraftStartDate] = useState('');
  const [draftEndDate, setDraftEndDate] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const { data, isLoading, isError, refetch } = useAccountHistory(
    accountId,
    1,
    appliedStartDate || undefined,
    appliedEndDate || undefined,
  );

  const entries = data?.data ?? [];
  const meta = data?.meta;
  const totalCount = meta?.total ?? 0;

  const activeFilterCount =
    (appliedStartDate || appliedEndDate ? 1 : 0);

  const handleOpenFilter = () => {
    setDraftStartDate(appliedStartDate);
    setDraftEndDate(appliedEndDate);
    setIsFilterVisible(true);
  };

  const handlePresetPress = (preset: string) => {
    setSelectedPreset(preset);
    const range = computeDateRange(preset);
    setDraftStartDate(range.startDate);
    setDraftEndDate(range.endDate);
  };

  const handleSubmitFilter = () => {
    setAppliedStartDate(draftStartDate);
    setAppliedEndDate(draftEndDate);
    setIsFilterVisible(false);
  };

  const handleResetFilter = () => {
    setDraftStartDate('');
    setDraftEndDate('');
    setSelectedPreset('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setIsFilterVisible(false);
  };

  const isCustom = selectedPreset === 'custom';

  const renderItem = ({ item }: { item: AccountHistoryEntry }) => {
    const isDebit = item.entry_type === 'debit';
    const dateStr = formatEntryDate(item.created_at);

    return (
      <View style={[styles.entryCard, { borderColor: colors.border }]}>
        <View style={styles.entryHeader}>
          <Text style={styles.entryDate}>{dateStr}</Text>
          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor: isDebit
                  ? colors.success + '20'
                  : colors.danger + '20',
              },
            ]}
          >
            <Text
              style={[
                styles.typeText,
                { color: isDebit ? colors.success : colors.danger },
              ]}
            >
              {isDebit ? 'DEBIT' : 'KREDIT'}
            </Text>
          </View>
        </View>

        <Text style={styles.entryAmount}>
          {isDebit ? '' : '-'}
          {formatIDR(item.amount)}
        </Text>

        {item.transaction?.notes ? (
          <Text tone="muted" style={styles.entryNotes}>
            {item.transaction.notes}
          </Text>
        ) : null}
      </View>
    );
  };

  if (isLoading) {
    return (
      <>
        <FixedAssetSubHeader title="Riwayat Akun" />
        <Screen safeAreaEdges={['left', 'right', 'bottom']}>
          <View style={styles.skeletonList}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height={72} />
            ))}
          </View>
        </Screen>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <FixedAssetSubHeader title="Riwayat Akun" />
        <Screen safeAreaEdges={['left', 'right', 'bottom']}>
          <View style={styles.centerState}>
            <Text tone="danger">Gagal memuat riwayat</Text>
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
        title="Riwayat Akun"
        subtitle={
          account && totalCount > 0
            ? `${account.name} (${totalCount})`
            : account?.name
        }
      />
      <FlatList
        data={entries}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.centerState}>
            <Ionicons
              name="document-text-outline"
              size={48}
              color={colors.muted}
            />
            <Text tone="muted" style={styles.emptyText}>
              Belum ada transaksi
            </Text>
          </View>
        }
      />

      <Pressable
        onPress={handleOpenFilter}
        style={({ pressed }) => [
          styles.filterFab,
          {
            backgroundColor:
              activeFilterCount > 0 ? colors.warning : colors.surface,
            borderColor: colors.border,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
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

      <Modal
        animationType="fade"
        transparent
        visible={isFilterVisible}
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setIsFilterVisible(false)}
          />
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text variant="subtitle">Filter</Text>

            <Text variant="eyebrow">Tanggal</Text>
            <View style={styles.presetRow}>
              {PRESETS.map((p) => {
                const isActive = selectedPreset === p.key;
                return (
                  <Pressable
                    key={p.key}
                    onPress={() => handlePresetPress(p.key)}
                    style={({ pressed }) => [
                      styles.presetChip,
                      {
                        borderColor: isActive ? colors.primary : colors.border,
                        backgroundColor: isActive
                          ? colors.primary
                          : colors.surface,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.presetLabel,
                        { color: isActive ? colors.background : colors.text },
                      ]}
                    >
                      {p.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {isCustom && (
              <View style={styles.customRow}>
                <View style={styles.dateField}>
                  <DateInput
                    label="Tanggal Awal"
                    value={draftStartDate}
                    onChangeDate={(val) => setDraftStartDate(val)}
                  />
                </View>
                <View style={styles.dateField}>
                  <DateInput
                    label="Tanggal Akhir"
                    value={draftEndDate}
                    onChangeDate={(val) => setDraftEndDate(val)}
                  />
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <Button label="Reset" variant="secondary" onPress={handleResetFilter} />
              <Button label="Terapkan" onPress={handleSubmitFilter} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  skeletonList: {
    gap: spacing.sm,
    padding: spacing.md,
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
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.xl * 2,
  },
  entryCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryDate: {
    fontSize: 13,
    fontWeight: '600',
  },
  typeBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  entryAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
  entryNotes: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  filterFab: {
    position: 'absolute',
    bottom: spacing.lg * 2,
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
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  modalCard: {
    gap: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  presetChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  customRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dateField: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
});
