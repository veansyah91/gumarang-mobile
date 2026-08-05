import { useMemo, useState } from 'react';

import { Input } from '@/src/components/ui/input';
import { SearchableSelect } from '@/src/components/ui/searchable-select';
import {
  BaseFilterModal,
  createEmptyBaseFilterDraft,
  type BaseFilterDraft,
} from '@/src/components/ui/base-filter-modal';
import { useDebouncedValue } from '@/src/hooks/use-debounced-value';
import { useSearchDebts } from '@/src/hooks/use-debt';
import { formatIDR } from '@/src/utils/currency';

export type DebtFilterDraft = BaseFilterDraft & {
  search: string;
  debtId: string | number;
  debtSearch: string;
};

export function createEmptyDebtFilterDraft(): DebtFilterDraft {
  return {
    ...createEmptyBaseFilterDraft(),
    search: '',
    debtId: '',
    debtSearch: '',
  };
}

type Props = {
  visible: boolean;
  draft: DebtFilterDraft;
  onChangeDraft: (draft: DebtFilterDraft) => void;
  onClose: () => void;
  onSubmit: () => void;
  onReset: () => void;
  debtType: 'payable' | 'receivable';
};

export function DebtFilterModal({
  visible,
  draft,
  onChangeDraft,
  onClose,
  onSubmit,
  onReset,
  debtType,
}: Props) {
  const [debtSearch, setDebtSearch] = useState('');
  const debouncedDebtSearch = useDebouncedValue(debtSearch, 400);

  const { data: debtsData, isFetching: isDebtFetching } = useSearchDebts({
    query: debouncedDebtSearch || undefined,
    type: debtType,
    perPage: 20,
  });

  const allDebts = useMemo(() => debtsData?.data ?? [], [debtsData]);
  const debtOptions = [
    { label: 'Pilih Utang/Piutang', value: '' },
    ...allDebts.map((d) => ({
      label: `${d.name} - ${d.contact_name} (Sisa ${formatIDR(d.balance)})`,
      value: d.id,
    })),
  ];

  return (
    <BaseFilterModal
      visible={visible}
      draft={draft}
      onChangeDraft={onChangeDraft}
      onClose={onClose}
      onSubmit={onSubmit}
      onReset={onReset}
      extraFields={
        <>
          <SearchableSelect
            label="Utang/Piutang"
            value={draft.debtId}
            options={debtOptions}
            onChange={(value) =>
              onChangeDraft({ ...draft, debtId: value, debtSearch: '' })
            }
            searchText={debtSearch}
            onSearchChange={setDebtSearch}
            loading={isDebtFetching}
            placeholder="Cari utang/piutang..."
          />

          <Input
            label="Cari transaksi"
            value={draft.search}
            onChangeText={(text) => onChangeDraft({ ...draft, search: text })}
            placeholder="No. referensi atau keterangan"
          />
        </>
      }
    />
  );
}
