import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Button } from '@/src/components/ui/button';
import { ColorPicker } from '@/src/components/ui/color-picker';
import { DateInput } from '@/src/components/ui/date-input';
import { IconPicker } from '@/src/components/ui/icon-picker';
import { Input } from '@/src/components/ui/input';
import { AccountSearchSelect } from '@/src/components/ui/account-search-select';
import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, spacing } from '@/src/theme/tokens';
import type { CreateFixedAssetPayload } from '@/src/types/fixed-asset';
import { formatNumber } from '@/src/utils/currency';

function getTodayDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateFixedAssetPayload) => void | Promise<void>;
  initialData?: {
    asset_name: string;
    opening_balance: number;
    acquisition_date: string | null;
    icon: string;
    color: string;
    parent_id: number | null;
    current_balance?: number;
  } | null;
  isSubmitting?: boolean;
  hasChildren?: boolean;
};

export function FixedAssetFormModal({
  visible,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
  hasChildren = false,
}: Props) {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  const isEdit = !!initialData;

  const [assetName, setAssetName] = useState('');
  const [parentId, setParentId] = useState<string | number>('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [currentBalanceValue, setCurrentBalanceValue] = useState('');
  const [acquisitionDate, setAcquisitionDate] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('');

  useEffect(() => {
    if (initialData) {
      setAssetName(initialData.asset_name);
      setParentId(initialData.parent_id ?? '');
      setOpeningBalance(String(initialData.opening_balance));
      setCurrentBalanceValue(
        initialData.current_balance != null
          ? String(initialData.current_balance)
          : '',
      );
      setAcquisitionDate(initialData.acquisition_date ?? '');
      setIcon(initialData.icon);
      setColor(initialData.color);
    } else {
      setAssetName('');
      setParentId('');
      setOpeningBalance('');
      setAcquisitionDate(getTodayDate());
      setIcon('');
      setColor('');
    }
  }, [initialData, visible]);

  useEffect(() => {
    if (!parentId && !isEdit) {
      setOpeningBalance('');
    }
  }, [parentId, isEdit]);

  const displayBalance = openingBalance ? formatNumber(openingBalance) : '';

  const handleSubmit = () => {
    if (!assetName.trim()) return;

    const payload: CreateFixedAssetPayload = {
      asset_name: assetName.trim(),
      parent_id: parentId ? Number(parentId) : null,
      opening_balance: isEdit
        ? openingBalance
          ? Number(openingBalance)
          : undefined
        : parentId
          ? openingBalance
            ? Number(openingBalance)
            : undefined
          : undefined,
      current_balance: isEdit
        ? currentBalanceValue
          ? Number(currentBalanceValue)
          : undefined
        : undefined,
      acquisition_date:
        parentId && acquisitionDate ? acquisitionDate : undefined,
      icon: icon.trim() || undefined,
      color: color.trim() || undefined,
    };

    void onSubmit(payload);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { borderColor: colors.border }]}>
          <Text variant="subtitle">
            {isEdit ? 'Edit Aset Tetap' : 'Tambah Aset Tetap'}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <Input
            label="Nama Aset"
            value={assetName}
            onChangeText={setAssetName}
            placeholder="Contoh: Kulkas 2 Pintu"
          />

          {!hasChildren && (
            <AccountSearchSelect
              label="Akun Induk"
              value={parentId}
              onChange={setParentId}
              emptyOptionLabel="Tidak ada (Akun Utama)"
              type="asset"
              assetCategory="fixed"
              defaultAccountType="asset"
              defaultAssetType="fixed"
            />
          )}

          {parentId !== '' && !isEdit && (
            <Input
              label="Nilai Perolehan"
              value={displayBalance}
              onChangeText={(text) =>
                setOpeningBalance(text.replace(/\D/g, ''))
              }
              placeholder="0"
              keyboardType="number-pad"
              className="text-right"
            />
          )}

          {parentId !== '' && isEdit && (
            <>
              <Input
                label="Nilai Perolehan"
                value={openingBalance ? formatNumber(openingBalance) : ''}
                onChangeText={(text) =>
                  setOpeningBalance(text.replace(/\D/g, ''))
                }
                placeholder="0"
                keyboardType="number-pad"
                className="text-right"
              />
              <Input
                label="Nilai Saat Ini"
                value={
                  currentBalanceValue
                    ? formatNumber(currentBalanceValue)
                    : ''
                }
                onChangeText={(text) =>
                  setCurrentBalanceValue(text.replace(/\D/g, ''))
                }
                placeholder="0"
                keyboardType="number-pad"
                className="text-right"
              />
            </>
          )}

          {parentId !== '' && (
            <DateInput
              label="Tanggal Akuisisi"
              value={acquisitionDate}
              onChangeDate={setAcquisitionDate}
            />
          )}

          <Text style={styles.label}>Ikon (opsional)</Text>
          <IconPicker value={icon} onChange={setIcon} />

          <Text style={[styles.label, { marginTop: spacing.xs }]}>
            Warna (opsional)
          </Text>
          <ColorPicker value={color} onChange={setColor} />
        </ScrollView>

        <View style={[styles.footer, { borderColor: colors.border }]}>
          <Button variant="secondary" label="Batal" onPress={onClose} />
          <Button
            label={isEdit ? 'Ubah' : 'Simpan'}
            onPress={handleSubmit}
            disabled={!assetName.trim() || isSubmitting}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    paddingTop: spacing.xl * 2,
    borderBottomWidth: 1,
  },
  form: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl * 2,
    borderTopWidth: 1,
  },
});
