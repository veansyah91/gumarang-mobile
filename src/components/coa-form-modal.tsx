import { useEffect, useRef, useState } from 'react';
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
import { RadioGroup } from '@/src/components/ui/radio-group';
import { SearchableSelect } from '@/src/components/ui/searchable-select';
import { SelectInput, type SelectOption } from '@/src/components/ui/select-input';
import { Text } from '@/src/components/ui/text';
import { useAccount, useSelectableAccounts } from '@/src/hooks/use-account';
import { useDebouncedValue } from '@/src/hooks/use-debounced-value';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, spacing } from '@/src/theme/tokens';
import type { AccountType, CreateAccountPayload } from '@/src/types/account';
import { formatNumber } from '@/src/utils/currency';

const TYPE_OPTIONS: SelectOption[] = [
  { label: 'Asset', value: 'asset' },
  { label: 'Liability', value: 'liability' },
  { label: 'Equity', value: 'equity' },
  { label: 'Income', value: 'income' },
  { label: 'Expense', value: 'expense' },
];

const ASSET_TYPE_OPTIONS = [
  { label: 'Aset Lancar', value: 'current' as const },
  { label: 'Aset Tetap', value: 'fixed' as const },
  { label: 'Investasi', value: 'investment' as const },
];

const INVESTMENT_TYPE_OPTIONS = [
  { label: 'Emas', value: 'gold' as const },
  { label: 'Reksadana', value: 'mutual_fund' as const },
  { label: 'Saham', value: 'stock' as const },
  { label: 'Kripto', value: 'crypto' as const },
  { label: 'Obligasi', value: 'bond' as const },
  { label: 'Lainnya', value: 'other' as const },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateAccountPayload) => void | Promise<void>;
  initialData?: {
    id: number;
    name: string;
    type: AccountType;
    parent_id: number | null;
    icon: string;
    color: string;
    opening_balance: number;
    asset_type?: 'fixed' | 'investment' | 'current';
    acquisition_date?: string;
    investment_type?:
      | 'gold'
      | 'mutual_fund'
      | 'stock'
      | 'crypto'
      | 'bond'
      | 'other';
    unit_quantity?: string;
    last_market_price?: string;
  } | null;
  isSubmitting?: boolean;
  hasChildren?: boolean;
  defaultAccountType?: AccountType;
  defaultAssetType?: 'fixed' | 'investment' | 'current';
};

export function CoaFormModal({
  visible,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
  hasChildren = false,
  defaultAccountType,
  defaultAssetType,
}: Props) {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const scrollViewRef = useRef<ScrollView>(null);

  const isEdit = !!initialData;

  const [name, setName] = useState('');
  const [type, setType] = useState<string | number>('asset');
  const [parentId, setParentId] = useState<string | number>('');
  const [parentSearch, setParentSearch] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [assetType, setAssetType] = useState<
    'fixed' | 'investment' | 'current'
  >('current');
  const [acquisitionDate, setAcquisitionDate] = useState('');
  const [investmentType, setInvestmentType] = useState<
    'gold' | 'mutual_fund' | 'stock' | 'crypto' | 'bond' | 'other'
  >('gold');
  const [unitQuantity, setUnitQuantity] = useState('');
  const [lastMarketPrice, setLastMarketPrice] = useState('');

  const debouncedSearch = useDebouncedValue(parentSearch, 400);
  const { data: selectableAccounts, isFetching } = useSelectableAccounts(
    type as string,
    debouncedSearch,
  );

  const parentIdNum = parentId ? Number(parentId) : 0;
  const { data: parentAccount } = useAccount(parentIdNum);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setType(initialData.type);
      setParentId(initialData.parent_id ?? '');
      setParentSearch('');
      setIcon(initialData.icon);
      setColor(initialData.color);
      setOpeningBalance(String(initialData.opening_balance));
      setAssetType(initialData.asset_type ?? 'current');
      setAcquisitionDate(initialData.acquisition_date ?? '');
      setInvestmentType(initialData.investment_type ?? 'gold');
      setUnitQuantity(initialData.unit_quantity ?? '');
      setLastMarketPrice(initialData.last_market_price ?? '');
    } else {
      setName('');
      setType(defaultAccountType ?? 'asset');
      setParentId('');
      setParentSearch('');
      setIcon('');
      setColor('');
      setOpeningBalance('');
      setAssetType(defaultAssetType ?? 'current');
      setAcquisitionDate('');
      setInvestmentType('gold');
      setUnitQuantity('');
      setLastMarketPrice('');
    }
  }, [initialData, visible, defaultAccountType, defaultAssetType]);

  useEffect(() => {
    if (!parentId) {
      setOpeningBalance('');
    }
  }, [parentId]);

  useEffect(() => {
    if (parentId) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [parentId]);

  useEffect(() => {
    setParentSearch('');
    setParentId('');
  }, [type]);

  useEffect(() => {
    if (!parentAccount || isEdit) return;
    if (parentAccount.icon) setIcon(parentAccount.icon);
    if (parentAccount.color) setColor(parentAccount.color);
  }, [parentAccount, isEdit]);

  const parentOptions: SelectOption[] = [
    { label: 'Tidak ada (Akun Utama)', value: '' },
    ...(selectableAccounts?.map((a) => ({ label: a.name, value: a.id })) ?? []),
  ];

  const displayBalance = openingBalance ? formatNumber(openingBalance) : '';
  const displayMarketPrice = lastMarketPrice ? formatNumber(lastMarketPrice) : '';

  const handleSubmit = () => {
    if (!name.trim()) return;

    const payload: CreateAccountPayload = {
      name: name.trim(),
      type: type as AccountType,
      parent_id: parentId ? Number(parentId) : null,
      icon: icon.trim() || undefined,
      color: color.trim() || undefined,
      opening_balance: parentId
        ? openingBalance
          ? Number(openingBalance)
          : undefined
        : 0,
      asset_type:
        type === 'asset' ? assetType : undefined,
      asset_category:
        type === 'asset' ? assetType : undefined,
      acquisition_date:
        type === 'asset' && parentId && assetType === 'fixed' && acquisitionDate
          ? acquisitionDate
          : undefined,
      investment_type:
        type === 'asset' && assetType === 'investment'
          ? investmentType
          : undefined,
      unit_quantity:
        type === 'asset' && parentId && assetType === 'investment' && unitQuantity
          ? unitQuantity
          : undefined,
      last_market_price:
        type === 'asset' && parentId && assetType === 'investment' && lastMarketPrice
          ? lastMarketPrice
          : undefined,
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
          <Text variant="subtitle">{isEdit ? 'Edit Akun' : 'Tambah Akun'}</Text>
        </View>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <Input
            label="Nama Akun"
            value={name}
            onChangeText={setName}
            placeholder="Contoh: Bank BCA"
          />

          <SelectInput
            label="Tipe Akun"
            value={type}
            options={TYPE_OPTIONS}
            onChange={setType}
          />

          {!hasChildren && (
            <SearchableSelect
              label="Akun Induk"
              value={parentId}
              options={parentOptions}
              onChange={setParentId}
              searchText={parentSearch}
              onSearchChange={setParentSearch}
              loading={isFetching}
            />
          )}

          {parentId !== '' && ['asset', 'liability', 'equity'].includes(type as string) && (
            <Input
              label="Saldo Awal"
              value={displayBalance}
              onChangeText={(text) =>
                setOpeningBalance(text.replace(/\D/g, ''))
              }
              placeholder="0"
              keyboardType="number-pad"
              className="text-right"
            />
          )}

          {type === 'asset' && (
            <RadioGroup
              label="Tipe Asset"
              options={ASSET_TYPE_OPTIONS}
              value={assetType}
              onChange={setAssetType}
            />
          )}

          {type === 'asset' && parentId !== '' && assetType === 'fixed' && (
            <DateInput
              label="Tanggal Akuisisi"
              value={acquisitionDate}
              onChangeDate={setAcquisitionDate}
            />
          )}

          {type === 'asset' && assetType === 'investment' && (
            <RadioGroup
              label="Tipe Investasi"
              options={INVESTMENT_TYPE_OPTIONS}
              value={investmentType}
              onChange={setInvestmentType}
            />
          )}

          {type === 'asset' && parentId !== '' && assetType === 'investment' && (
            <>
              <Input
                label="Jumlah Unit"
                value={unitQuantity}
                onChangeText={setUnitQuantity}
                placeholder="0.000000"
                keyboardType="decimal-pad"
              />

              <Input
                label="Harga Pasar Terakhir"
                value={displayMarketPrice}
                onChangeText={(text) =>
                  setLastMarketPrice(text.replace(/\D/g, ''))
                }
                placeholder="0"
                keyboardType="number-pad"
                className="text-right"
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
            disabled={!name.trim() || isSubmitting}
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
