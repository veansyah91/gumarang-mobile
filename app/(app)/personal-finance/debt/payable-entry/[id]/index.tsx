import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';

import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { FixedAssetSubHeader } from '@/src/components/ui/fixed-asset-sub-header';
import { Screen } from '@/src/components/ui/screen';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Text } from '@/src/components/ui/text';
import { useDebt, useDebtEntry, useDeleteDebtEntry } from '@/src/hooks/use-debt';
import { useContact } from '@/src/hooks/use-contact';
import { pfRoutes } from '@/src/navigation/personal-finance-routes';
import { useToastStore } from '@/src/state/toast-store';
import { spacing } from '@/src/theme/tokens';
import { formatIDR } from '@/src/utils/currency';
import { toAppError } from '@/src/utils/errors';

function formatDate(iso: string | null) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function DebtPayableEntryDetailPage() {
  const router = useRouter();
  const { id, debtId: debtIdParam } = useLocalSearchParams<{
    id: string;
    debtId?: string;
  }>();
  const entryId = Number(id);
  const debtId = Number(debtIdParam);
  const showToast = useToastStore((s) => s.showToast);

  const {
    data: entry,
    isLoading,
    isError,
    refetch,
  } = useDebtEntry(debtId, entryId);
  const { mutateAsync: deleteEntry, isPending: isDeleting } =
    useDeleteDebtEntry();
  const { data: debt } = useDebt(debtId);
  const { data: contact } = useContact(debt?.contact_id ?? 0);

  const handleShareWA = () => {
    if (!contact?.phone || !debt || !entry) return;
    const phone = contact.phone.replace(/^0/, '62');
    const message =
      `[Pembayaran Utang]\nUtang: ${debt.name}\nNo Ref: ${entry.no_ref}\nTanggal: ${formatDate(entry.date)}\nJumlah: ${formatIDR(entry.amount)}\n\nDidukung oleh https://tokomasgumarang.com`;
    Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Hapus Entry',
      'Apakah Anda yakin ingin menghapus entry ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEntry({ debtId, entryId });
              showToast('Entry berhasil dihapus', 'success');
              router.back();
            } catch (err) {
              const appErr = toAppError(err);
              showToast(appErr.userMessage, 'danger');
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <>
        <FixedAssetSubHeader title="Detail Entry Utang" />
        <Screen scrollable safeAreaEdges={['left', 'right', 'bottom']}>
          <View style={styles.loadingContainer}>
            <Skeleton height={200} />
          </View>
        </Screen>
      </>
    );
  }

  if (isError || !entry) {
    return (
      <>
        <FixedAssetSubHeader title="Detail Entry Utang" />
        <Screen scrollable safeAreaEdges={['left', 'right', 'bottom']}>
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
      <FixedAssetSubHeader title="Detail Entry Utang" />
      <Screen scrollable safeAreaEdges={['left', 'right', 'bottom']}>
        <View style={styles.container}>
          <Card>
            <View style={styles.headerRow}>
              <Text style={styles.ref}>{entry.no_ref}</Text>
              <Badge
                label={entry.type === 'credit' ? 'Kredit' : 'Debit'}
                variant={entry.type === 'credit' ? 'success' : 'warning'}
              />
            </View>

            <View style={styles.amountSection}>
              <View style={styles.amountItem}>
                <Text tone="muted" style={styles.amountLabel}>
                  Jumlah
                </Text>
                <Text style={styles.amountValue}>
                  {formatIDR(entry.amount)}
                </Text>
              </View>
              <View style={styles.amountItem}>
                <Text tone="muted" style={styles.amountLabel}>
                  Tanggal
                </Text>
                <Text style={styles.amountValue}>
                  {formatDate(entry.date)}
                </Text>
              </View>
            </View>

            {entry.notes && (
              <Text tone="muted" style={styles.notes}>
                {entry.notes}
              </Text>
            )}
          </Card>

          <View style={styles.actionButtons}>
            <Button
              variant="secondary"
              label="Edit"
              onPress={() =>
                router.push(pfRoutes.payableEntryEdit(entryId, debtId))
              }
            />
            <Button
              variant="danger"
              label="Hapus"
              onPress={handleDelete}
              disabled={isDeleting}
            />
          </View>
          {contact?.phone && (
            <Button
              variant="secondary"
              label="Bagikan via WA"
              onPress={handleShareWA}
            />
          )}
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    padding: spacing.md,
    gap: spacing.md,
  },
  container: {
    padding: spacing.md,
    gap: spacing.md,
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ref: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  amountSection: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.md,
  },
  amountItem: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  notes: {
    fontSize: 13,
    marginTop: spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
