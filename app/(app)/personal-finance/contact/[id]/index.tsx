import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { Card } from '@/src/components/ui/card';
import { FixedAssetSubHeader } from '@/src/components/ui/fixed-asset-sub-header';
import { Screen } from '@/src/components/ui/screen';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Text } from '@/src/components/ui/text';
import { useContact, useDeleteContact } from '@/src/hooks/use-contact';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { useToastStore } from '@/src/state/toast-store';
import { palette, radius, spacing } from '@/src/theme/tokens';
import { toAppError } from '@/src/utils/errors';

function formatDetailDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function ContactDetailPage() {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const contactId = Number(id);

  const { data: contact, isLoading, isError, refetch, isFetching } =
    useContact(contactId);
  const { mutateAsync: deleteContact } = useDeleteContact();
  const showToast = useToastStore((state) => state.showToast);

  const [isDeletingConfirm, setIsDeletingConfirm] = useState(false);

  if (isLoading) {
    return (
      <>
        <FixedAssetSubHeader title="Detail Kontak" />
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

  if (isError || !contact) {
    return (
      <>
        <FixedAssetSubHeader title="Detail Kontak" />
        <Screen scrollable safeAreaEdges={['left', 'right', 'bottom']}>
          <View style={styles.centerState}>
            <Text tone="danger">Gagal memuat detail kontak</Text>
            <Pressable onPress={() => refetch()} style={styles.retryButton}>
              <Text tone="muted">Coba Lagi</Text>
            </Pressable>
          </View>
        </Screen>
      </>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Hapus Kontak',
      `Yakin ingin menghapus kontak "${contact.name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            if (isDeletingConfirm) return;
            setIsDeletingConfirm(true);
            try {
              await deleteContact(contactId);
              showToast('Kontak berhasil dihapus', 'success');
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
      <FixedAssetSubHeader title="Detail Kontak" />
      <Screen
        scrollable
        safeAreaEdges={['left', 'right', 'bottom']}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
      >
        <Card>
          <DetailRow
            label="Nama"
            value={contact.name}
            icon="person-outline"
            colors={colors}
          />
          {contact.phone ? (
            <DetailRow
              label="Telepon"
              value={contact.phone}
              icon="call-outline"
              colors={colors}
            />
          ) : null}
          {contact.notes ? (
            <DetailRow
              label="Catatan"
              value={contact.notes}
              icon="chatbubble-outline"
              colors={colors}
            />
          ) : null}
          <DetailRow
            label="Dibuat"
            value={formatDetailDate(contact.created_at)}
            icon="calendar-outline"
            colors={colors}
          />
        </Card>

        <View style={styles.actionRow}>
          <Pressable
            onPress={() =>
              router.push(
                `/personal-finance/contact/${contactId}/edit` as any,
              )
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
