import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { DateInput } from '@/src/components/ui/date-input';
import { Input } from '@/src/components/ui/input';
import { AccountSearchSelect } from '@/src/components/ui/account-search-select';
import { Text } from '@/src/components/ui/text';
import { useAccount } from '@/src/hooks/use-account';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, spacing } from '@/src/theme/tokens';
import {
  formatCurrencyInput,
  parseCurrencyInput,
} from '@/src/utils/currency-input';

export type DetailEntry = {
  accountId: number | null;
  amount: string;
  investmentType: string;
  unitQty: string;
  unitPrice: string;
  transactionDate: string;
  notes: string;
};

export const INVESTMENT_TYPES = [
  { label: 'Emas', value: 'gold' },
  { label: 'Reksadana', value: 'mutual_fund' },
  { label: 'Saham', value: 'stock' },
  { label: 'Crypto', value: 'crypto' },
  { label: 'Obligasi', value: 'bond' },
  { label: 'Lainnya', value: 'other' },
];

export function getTodayDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createEmptyDetail(): DetailEntry {
  return {
    accountId: null,
    amount: '',
    investmentType: '',
    unitQty: '',
    unitPrice: '',
    transactionDate: getTodayDate(),
    notes: '',
  };
}

export function CashOutDetailRow({
  detail,
  index,
  onUpdate,
  onRemove,
}: {
  detail: DetailEntry;
  index: number;
  onUpdate: (index: number, updates: Partial<DetailEntry>) => void;
  onRemove: (index: number) => void;
}) {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  const { data: accountDetail } = useAccount(
    detail.accountId ? Number(detail.accountId) : 0,
  );

  const isInvestment = !!accountDetail?.investment_type;

  return (
    <Card>
      <View style={formStyles.detailHeader}>
        <Text tone="muted">#{index + 1}</Text>
        <Pressable
          onPress={() => onRemove(index)}
          hitSlop={8}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
            padding: spacing.xs,
          })}
        >
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
        </Pressable>
      </View>

      <AccountSearchSelect
        label="Akun"
        value={detail.accountId ?? ''}
        onChange={(value) =>
          onUpdate(index, { accountId: value ? Number(value) : null })
        }
        emptyOptionLabel="Pilih Akun"
        type="expense"
        hasParent
        isCash={false}
        defaultAccountType="expense"
      />

      <Input
        label="Jumlah"
        value={detail.amount ? formatCurrencyInput(detail.amount) : ''}
        onChangeText={(text) =>
          onUpdate(index, { amount: parseCurrencyInput(text) })
        }
        placeholder="Rp 0"
        keyboardType="number-pad"
        style={{ textAlign: 'right' }}
      />

      {isInvestment && (
        <>
          <Text style={formStyles.investmentLabel}>Tipe Investasi</Text>
          <View style={formStyles.typeRow}>
            {INVESTMENT_TYPES.map((t) => (
              <Button
                key={t.value}
                variant={
                  detail.investmentType === t.value ? 'primary' : 'secondary'
                }
                label={t.label}
                onPress={() => onUpdate(index, { investmentType: t.value })}
              />
            ))}
          </View>
          <Input
            label="Jumlah Unit"
            value={detail.unitQty}
            onChangeText={(text) => onUpdate(index, { unitQty: text })}
            placeholder="0"
            keyboardType="decimal-pad"
          />
          <Input
            label="Harga per Unit"
            value={detail.unitPrice}
            onChangeText={(text) =>
              onUpdate(index, { unitPrice: text.replace(/\D/g, '') })
            }
            placeholder="0"
            keyboardType="number-pad"
            style={{ textAlign: 'right' }}
          />
          <DateInput
            label="Tanggal Transaksi"
            value={detail.transactionDate}
            onChangeDate={(val) =>
              onUpdate(index, { transactionDate: val || getTodayDate() })
            }
          />
          <Input
            label="Catatan (opsional)"
            value={detail.notes}
            onChangeText={(text) => onUpdate(index, { notes: text })}
            placeholder="Catatan pembelian"
            multiline
          />
        </>
      )}
    </Card>
  );
}

export const formStyles = StyleSheet.create({
  formContainer: {
    gap: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  submitContainer: {
    paddingTop: spacing.md,
  },
  investmentLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});
