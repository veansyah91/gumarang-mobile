import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { CoaFormModal } from '@/src/components/coa-form-modal';
import { SearchableSelect } from '@/src/components/ui/searchable-select';
import type { SelectOption } from '@/src/components/ui/select-input';
import {
  useCreateAccount,
  useSelectableAccounts,
} from '@/src/hooks/use-account';
import { useDebouncedValue } from '@/src/hooks/use-debounced-value';
import { useToastStore } from '@/src/state/toast-store';
import type { AccountType, CreateAccountPayload } from '@/src/types/account';
import { toAppError } from '@/src/utils/errors';

type AccountSearchSelectProps = {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  emptyOptionLabel?: string;
  type?: string;
  assetCategory?: string;
  hasParent?: boolean;
  isCash?: boolean;
  defaultAccountType?: AccountType;
  defaultAssetType?: 'fixed' | 'investment' | 'current';
};

export function AccountSearchSelect({
  label,
  value,
  onChange,
  placeholder,
  emptyOptionLabel,
  type,
  assetCategory,
  hasParent,
  isCash,
  defaultAccountType,
  defaultAssetType,
}: AccountSearchSelectProps) {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);
  const [searchText, setSearchText] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const debouncedSearch = useDebouncedValue(searchText, 400);
  const { data: accounts, isFetching } = useSelectableAccounts(
    type,
    debouncedSearch,
    assetCategory,
    hasParent,
    isCash,
  );

  const { mutateAsync: createAccount, isPending: isCreating } =
    useCreateAccount();

  const options: SelectOption[] = [
    ...(emptyOptionLabel ? [{ label: emptyOptionLabel, value: '' }] : []),
    ...(accounts?.map((a) => ({ label: a.name, value: a.id })) ?? []),
  ];

  const handleCreate = async (payload: CreateAccountPayload) => {
    try {
      const created = await createAccount(payload);
      await queryClient.invalidateQueries({
        queryKey: ['accounts', 'selectable'],
      });
      setIsCreateOpen(false);
      setSearchText(created.name);
      onChange(created.id);
    } catch (err) {
      const appErr = toAppError(err);
      showToast(appErr.userMessage, 'danger');
    }
  };

  return (
    <>
      <SearchableSelect
        label={label}
        value={value}
        options={options}
        onChange={onChange}
        searchText={searchText}
        onSearchChange={setSearchText}
        loading={isFetching}
        placeholder={placeholder}
        emptyActionLabel="Tambah akun baru"
        onEmptyAction={() => setIsCreateOpen(true)}
      />
      <CoaFormModal
        visible={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={isCreating}
        defaultAccountType={defaultAccountType}
        defaultAssetType={defaultAssetType}
      />
    </>
  );
}
