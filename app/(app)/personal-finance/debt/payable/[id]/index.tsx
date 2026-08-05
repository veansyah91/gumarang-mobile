import { useRouter, useLocalSearchParams } from 'expo-router';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';

import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { FixedAssetSubHeader } from '@/src/components/ui/fixed-asset-sub-header';
import { Screen } from '@/src/components/ui/screen';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Text } from '@/src/components/ui/text';
import { useDebt, useDeleteDebt } from '@/src/hooks/use-debt';
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

export default function DebtPayableDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const debtId = Number(id);
  const showToast = useToastStore((s) => s.showToast);

  const { data: debt, isLoading, isError, refetch } = useDebt(debtId);
  const { mutateAsync: deleteDebt, isPending: isDeleting } = useDeleteDebt();
  const { data: contact } = useContact(debt?.contact_id ?? 0);

  const handleShareWA = () => {
    if (!contact?.phone || !debt) return;
    const phone = contact.phone.replace(/^0/, '62');
    const message =
      `[Pemberitahuan Utang]\nNama: ${debt.name}\nJumlah: ${formatIDR(debt.amount)}\nSisa: ${formatIDR(debt.balance)}\nJatuh Tempo: ${formatDate(debt.due_date)}\n\nDidukung oleh https://tokomasgumarang.com`;
    Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Hapus Utang',
      'Apakah Anda yakin ingin menghapus utang ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDebt(debtId);
              showToast('Utang berhasil dihapus', 'success');
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
        <FixedAssetSubHeader title="Detail Utang" />
        <Screen scrollable safeAreaEdges={['left', 'right', 'bottom']}>
          <View style={styles.loadingContainer}>
            <Skeleton height={200} />
            <Skeleton height={100} />
          </View>
        </Screen>
      </>
    );
  }

  if (isError || !debt) {
    return (
      <>
        <FixedAssetSubHeader title="Detail Utang" />
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

  const nonInitialEntries = debt.entries.filter((e) => !e.is_initial);

  return (
    <>
      <FixedAssetSubHeader title="Detail Utang" />
      <Screen scrollable safeAreaEdges={['left', 'right', 'bottom']}>
        <View style={styles.container}>
          <Card>
            <View style={styles.headerRow}>
              <Text style={styles.debtName}>{debt.name}</Text>
              <Badge
                label={getStatusLabel(debt.status)}
                variant={getStatusVariant(debt.status)}
              />
            </View>
            <Text tone="muted" style={styles.contact}>
              {debt.contact_name}
            </Text>

            <View style={styles.amountSection}>
              <View style={styles.amountItem}>
                <Text tone="muted" style={styles.amountLabel}>
                  Nominal
                </Text>
                <Text style={styles.amountValue}>
                  {formatIDR(debt.amount)}
                </Text>
              </View>
              <View style={styles.amountItem}>
                <Text tone="muted" style={styles.amountLabel}>
                  Sisa Bayar
                </Text>
                <Text style={styles.amountValue}>
                  {formatIDR(debt.balance)}
                </Text>
              </View>
            </View>

            {debt.due_date && (
              <Text tone="muted" style={styles.dueDate}>
                Jatuh tempo: {formatDate(debt.due_date)}
              </Text>
            )}

            {debt.notes && (
              <Text tone="muted" style={styles.notes}>
                {debt.notes}
              </Text>
            )}

            <View style={styles.accountRow}>
              <Text tone="muted" style={styles.accountLabel}>
                Akun:
              </Text>
              <Text style={styles.accountName}>{debt.account_name}</Text>
            </View>
          </Card>

          {nonInitialEntries.length > 0 && (
            <Card>
              <Text variant="subtitle" style={styles.entriesTitle}>
                Riwayat Pembayaran
              </Text>
              {nonInitialEntries.map((entry) => (
                <View key={entry.id} style={styles.entryItem}>
                  <View style={styles.entryInfo}>
                    <Text style={styles.entryRef}>{entry.no_ref}</Text>
                    <Text tone="muted" style={styles.entryDate}>
                      {formatDate(entry.date)}
                    </Text>
                  </View>
                  <View style={styles.entryAmount}>
                    <Text style={styles.entryType}>
                      {entry.type === 'credit' ? '-' : '+'}
                    </Text>
                    <Text style={styles.entryAmountValue}>
                      {formatIDR(entry.amount)}
                    </Text>
                  </View>
                  {entry.notes && (
                    <Text tone="muted" style={styles.entryNotes}>
                      {entry.notes}
                    </Text>
                  )}
                </View>
              ))}
            </Card>
          )}

          {debt.status === 'pending' && (
            <View style={styles.actionButtons}>
              <Button
                variant="secondary"
                label="Edit"
                onPress={() =>
                  router.push(pfRoutes.payableEdit(debtId))
                }
              />
              <Button
                variant="danger"
                label="Hapus"
                onPress={handleDelete}
                disabled={isDeleting}
              />
            </View>
          )}
          <View style={styles.payActionContainer}>
            <Button
              label="Bayar"
              onPress={() =>
                router.push(
                  pfRoutes.payableEntryCreateWithDebt(debtId, debt.balance),
                )
              }
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
  debtName: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  contact: {
    fontSize: 14,
    marginTop: spacing.xs,
  },
  amountSection: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.md,
  },
  amountItem: {},
  amountLabel: {
    fontSize: 12,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  dueDate: {
    fontSize: 13,
    marginTop: spacing.sm,
  },
  notes: {
    fontSize: 13,
    marginTop: spacing.sm,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  accountLabel: {
    fontSize: 12,
  },
  accountName: {
    fontSize: 12,
    fontWeight: '600',
  },
  entriesTitle: {
    marginBottom: spacing.sm,
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  entryInfo: {
    flex: 1,
  },
  entryRef: {
    fontSize: 13,
    fontWeight: '600',
  },
  entryDate: {
    fontSize: 11,
  },
  entryAmount: {
    alignItems: 'flex-end',
  },
  entryType: {
    fontSize: 10,
  },
  entryAmountValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  entryNotes: {
    fontSize: 11,
    width: '100%',
    marginTop: spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  payActionContainer: {
    marginTop: spacing.sm,
  },
});
