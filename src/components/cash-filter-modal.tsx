import { Input } from '@/src/components/ui/input';
import {
  BaseFilterModal,
  computeDateRange,
  createEmptyBaseFilterDraft,
  PRESETS,
  type BaseFilterDraft,
} from '@/src/components/ui/base-filter-modal';

export type FilterDraft = BaseFilterDraft & {
  search: string;
};

export function createEmptyFilterDraft(): FilterDraft {
  return {
    ...createEmptyBaseFilterDraft(),
    search: '',
  };
}

export { computeDateRange, PRESETS };

type Props = {
  visible: boolean;
  draft: FilterDraft;
  onChangeDraft: (draft: FilterDraft) => void;
  onClose: () => void;
  onSubmit: () => void;
  onReset: () => void;
  title?: string;
  submitLabel?: string;
};

export function CashFilterModal({
  visible,
  draft,
  onChangeDraft,
  onClose,
  onSubmit,
  onReset,
  title,
  submitLabel,
}: Props) {
  return (
    <BaseFilterModal
      visible={visible}
      draft={draft}
      onChangeDraft={onChangeDraft}
      onClose={onClose}
      onSubmit={onSubmit}
      onReset={onReset}
      title={title}
      submitLabel={submitLabel}
      extraFields={
        <Input
          label="Cari transaksi"
          value={draft.search}
          onChangeText={(text) => onChangeDraft({ ...draft, search: text })}
          placeholder="No. referensi atau keterangan"
        />
      }
    />
  );
}
