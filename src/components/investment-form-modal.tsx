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
import { useAccount } from '@/src/hooks/use-account';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { useToastStore } from '@/src/state/toast-store';
import { palette, spacing } from '@/src/theme/tokens';
import type {
  CreateInvestmentPayload,
  InvestmentType,
  UpdateInvestmentPayload,
} from '@/src/types/investment';
import { toAppError } from '@/src/utils/errors';
import { formatNumber } from '@/src/utils/currency';

function getTodayDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const INVESTMENT_TYPES: { label: string; value: InvestmentType }[] = [
  { label: 'Emas', value: 'gold' },
  { label: 'Reksadana', value: 'mutual_fund' },
  { label: 'Saham', value: 'stock' },
  { label: 'Crypto', value: 'crypto' },
  { label: 'Obligasi', value: 'bond' },
  { label: 'Lainnya', value: 'other' },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (
    payload: CreateInvestmentPayload | UpdateInvestmentPayload,
  ) => void | Promise<void>;
  initialData?: {
    name: string;
    investment_type?: InvestmentType;
    icon: string;
    color: string;
  } | null;
  isSubmitting?: boolean;
  isEdit?: boolean;
  parentId?: number | null;
};

export function InvestmentFormModal({
  visible,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
  isEdit = false,
  parentId: parentIdProp,
}: Props) {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  const [assetName, setAssetName] = useState('');
  const [investmentType, setInvestmentType] = useState<string | number>('');
  const [unitQty, setUnitQty] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [sourceAccountId, setSourceAccountId] = useState<string | number>('');
  const [transactionDate, setTransactionDate] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('');
  const [notes, setNotes] = useState('');
  const [parentId, setParentId] = useState<string | number>('');

  const showToast = useToastStore((state) => state.showToast);

  const parentIdNumber = parentId ? Number(parentId) : 0;
  const { data: parentDetail } = useAccount(parentIdNumber);

  useEffect(() => {
    if (initialData) {
      setAssetName(initialData.name ?? '');
      setInvestmentType(initialData.investment_type ?? '');
      setIcon(initialData.icon ?? '');
      setColor(initialData.color ?? '');
    } else if (visible) {
      setAssetName('');
      setInvestmentType('');
      setUnitQty('');
      setUnitPrice('');
      setSourceAccountId('');
      setTransactionDate(getTodayDate());
      setIcon('');
      setColor('');
      setNotes('');
      setParentId(parentIdProp ?? '');
    }
  }, [initialData, visible, parentIdProp]);

  useEffect(() => {
    if (!parentId && !isEdit) {
      setInvestmentType('');
      setIcon('');
      setColor('');
    }
  }, [parentId, isEdit]);

  useEffect(() => {
    if (parentDetail?.investment_type) {
      setInvestmentType(parentDetail.investment_type);
    }
    if (parentDetail?.icon) {
      setIcon(parentDetail.icon);
    }
    if (parentDetail?.color) {
      const c = parentDetail.color?.trim() ?? '';
      setColor(c.startsWith('#') ? c : `#${c}`);
    }
  }, [parentDetail]);

  const handleSubmit = async () => {
    if (!assetName.trim()) {
      showToast('Lengkapi: Nama Aset', 'danger');
      return;
    }

    try {
      if (isEdit) {
        const payload: UpdateInvestmentPayload = {
          name: assetName.trim(),
          icon: icon.trim() || null,
          color: color.trim() || null,
        };
        await onSubmit(payload);
      } else {
        const missingFields: string[] = [];
        if (!investmentType) missingFields.push('Tipe Investasi');
        if (!unitQty) missingFields.push('Jumlah Unit');
        if (!unitPrice) missingFields.push('Harga per Unit');
        if (!transactionDate) missingFields.push('Tanggal Transaksi');

        if (missingFields.length > 0) {
          showToast(`Lengkapi: ${missingFields.join(', ')}`, 'danger');
          return;
        }

        const payload: CreateInvestmentPayload = {
          name: assetName.trim(),
          investment_type: investmentType as InvestmentType,
          unit_quantity: parseFloat(unitQty),
          unit_price: parseInt(unitPrice, 10),
          source_account_id: sourceAccountId ? Number(sourceAccountId) : null,
          transaction_date: transactionDate,
          icon: icon.trim() || undefined,
          color: color.trim() || undefined,
          notes: notes.trim() || undefined,
          parent_id: parentId ? Number(parentId) : null,
        };
        await onSubmit(payload);
      }
    } catch (err) {
      const appErr = toAppError(err);
      showToast(appErr.userMessage, 'danger');
    }
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
            {isEdit ? 'Edit Aset Investasi' : 'Tambah Aset Investasi'}
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
            placeholder="Contoh: Emas Antam"
          />

          {!isEdit && (
            <>
              <AccountSearchSelect
                label="Akun Induk (opsional)"
                value={parentId}
                onChange={setParentId}
                emptyOptionLabel="Tidak ada (Akun Utama)"
                type="asset"
                assetCategory="investment"
                defaultAccountType="asset"
                defaultAssetType="investment"
              />

              <Text style={styles.label}>Tipe Investasi</Text>
              <View style={styles.typeRow}>
                {INVESTMENT_TYPES.map((t) => (
                  <Button
                    key={t.value}
                    variant={
                      investmentType === t.value ? 'primary' : 'secondary'
                    }
                    label={t.label}
                    onPress={() => setInvestmentType(t.value)}
                    disabled={!!parentId}
                  />
                ))}
              </View>
            </>
          )}

          {!isEdit && (
            <>
              <Input
                label="Jumlah Unit"
                value={unitQty}
                onChangeText={setUnitQty}
                placeholder="0"
                keyboardType="decimal-pad"
              />

              <Input
                label="Harga per Unit"
                value={unitPrice ? formatNumber(unitPrice) : ''}
                onChangeText={(text) => setUnitPrice(text.replace(/\D/g, ''))}
                placeholder="0"
                keyboardType="number-pad"
                className="text-right"
              />

              <AccountSearchSelect
                label="Akun Sumber Dana"
                value={sourceAccountId}
                onChange={setSourceAccountId}
                emptyOptionLabel="Tidak ada (Opsional)"
                type="asset"
                assetCategory="current"
                hasParent
                defaultAccountType="asset"
                defaultAssetType="current"
              />

              <DateInput
                label="Tanggal Transaksi"
                value={transactionDate}
                onChangeDate={setTransactionDate}
              />

              <Input
                label="Catatan (opsional)"
                value={notes}
                onChangeText={setNotes}
                placeholder="Catatan pembelian"
                multiline
              />
            </>
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
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
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
