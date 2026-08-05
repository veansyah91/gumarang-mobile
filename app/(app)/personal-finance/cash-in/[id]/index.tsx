import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { Card } from '@/src/components/ui/card';
import { FixedAssetSubHeader } from '@/src/components/ui/fixed-asset-sub-header';
import { Screen } from '@/src/components/ui/screen';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Text } from '@/src/components/ui/text';
import { useCashIn, useDeleteCashIn } from '@/src/hooks/use-cash-in';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { pfRoutes } from '@/src/navigation/personal-finance-routes';
import { useToastStore } from '@/src/state/toast-store';
import { palette, radius, spacing } from '@/src/theme/tokens';
import { formatIDR } from '@/src/utils/currency';
import { toAppError } from '@/src/utils/errors';

function formatDetailDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function CashInDetailPage() {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const transactionId = Number(id);

  const { data: transaction, isLoading, isError, refetch, isFetching } =
    useCashIn(transactionId);
  const { mutateAsync: deleteCashIn } =
    useDeleteCashIn();
  const showToast = useToastStore((state) => state.showToast);

  const [isDeletingConfirm, setIsDeletingConfirm] = useState(false);

  if (isLoading) {
    return (
      <>
        <FixedAssetSubHeader title="Detail Kas Masuk" />
        <Screen scrollable safeAreaEdges={['left', 'right', 'bottom']}>
          <View style={styles.skeletonList}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height={48} />
            ))}
          </View>
        </Screen>
      </>
    );
  }

  if (isError || !transaction) {
    return (
      <>
        <FixedAssetSubHeader title="Detail Kas Masuk" />
        <Screen scrollable safeAreaEdges={['left', 'right', 'bottom']}>
          <View style={styles.centerState}>
            <Text tone="danger">Gagal memuat detail transaksi</Text>
            <Pressable onPress={() => refetch()} style={styles.retryButton}>
              <Text tone="muted">Coba Lagi</Text>
            </Pressable>
          </View>
        </Screen>
      </>
    );
  }

  const debitEntry = transaction.entries.find(
    (e) => e.entry_type === 'debit',
  );
  const creditEntries = transaction.entries.filter(
    (e) => e.entry_type === 'credit',
  );

  const handleDelete = () => {
    Alert.alert(
      'Hapus Transaksi',
      `Yakin ingin menghapus transaksi ${transaction.reference}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            if (isDeletingConfirm) return;
            setIsDeletingConfirm(true);
            try {
              await deleteCashIn(transactionId);
              showToast('Cash In berhasil dihapus', 'success');
              router.back();
            } catch (err) {
              const appErr = toAppError(err);
              showToast(appErr.userMessage, 'danger');
            } finally {
              setIsDeletingConfirm(false);
            }
          },
        },
      ],
    );
  };

  return (
    <>
      <FixedAssetSubHeader title="Detail Kas Masuk" />
      <Screen
        scrollable
        safeAreaEdges={['left', 'right', 'bottom']}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
      >
        <Card>
          <DetailRow
            label="Tanggal"
            value={formatDetailDate(transaction.created_at)}
            icon="calendar-outline"
            colors={colors}
          />
          <DetailRow
            label="No. Ref"
            value={transaction.reference}
            icon="document-text-outline"
            colors={colors}
          />
          <DetailRow
            label="Akun Kas"
            value={debitEntry?.account_name ?? '-'}
            icon="cash-outline"
            colors={colors}
          />
          <DetailRow
            label="Jumlah"
            value={formatIDR(transaction.total_amount)}
            icon="wallet-outline"
            colors={colors}
          />
          <DetailRow
            label="Keterangan"
            value={transaction.notes || '-'}
            icon="chatbubble-outline"
            colors={colors}
          />
        </Card>

        <View style={styles.section}>
          <Text variant="subtitle" style={styles.sectionTitle}>
            Detail
          </Text>
          <View style={styles.detailListCard}>
            {(creditEntries.length > 0 ? creditEntries : []).map(
              (entry, index) => (
                <Pressable
                  key={entry.id}
                  style={({ pressed }) => [
                    styles.entryRow,
                    { opacity: pressed ? 0.85 : 1 },
                    index < creditEntries.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.entryInfo}>
                    <Text style={styles.entryNumber}>
                      {String(index + 1).padStart(2, '0')}
                    </Text>
                    <Text style={styles.entryName}>
                      {entry.account_name}
                    </Text>
                  </View>
                  <Text style={styles.entryAmount}>
                    {formatIDR(entry.amount)}
                  </Text>
                </Pressable>
              ),
            )}
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            onPress={() =>
              router.push(pfRoutes.cashInEdit(transactionId))
            }
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Ionicons name="create-outline" size={18} color="#FFFFFF" />
            <Text style={styles.actionText}>Edit</Text>
          </Pressable>
          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: colors.danger,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
            <Text style={styles.actionText}>Hapus</Text>
          </Pressable>
        </View>
      </Screen>
    </>
  );
}

function DetailRow({
  label,
  value,
  icon,
  colors,
}: {
  label: string;
  value: string;
  icon: string;
  colors: Record<string, string>;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon as any} size={16} color={colors.muted} />
      </View>
      <View style={styles.detailContent}>
        <Text tone="muted" style={styles.detailLabel}>
          {label}
        </Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonList: {
    gap: spacing.sm,
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    gap: spacing.sm,
  },
  retryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  detailIcon: {
    width: 24,
    alignItems: 'center',
    paddingTop: 2,
  },
  detailContent: {
    flex: 1,
    gap: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  detailListCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  entryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  entryNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: 'inherit',
    width: 24,
  },
  entryName: {
    fontSize: 14,
    fontWeight: '600',
  },
  entryAmount: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
