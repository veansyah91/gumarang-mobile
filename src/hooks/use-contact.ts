import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';

import { contactApi } from '@/src/services/api/contact';
import type {
  ContactListParams,
  CreateContactPayload,
} from '@/src/types/contact';

const CONTACT_ROOT = ['contacts'] as const;

const CONTACT_KEYS = {
  all: CONTACT_ROOT,
  list: (params: ContactListParams) =>
    [...CONTACT_ROOT, 'list', params] as const,
  detail: (id: number) => [...CONTACT_ROOT, 'detail', id] as const,
};

export function useContacts(params: ContactListParams = {}) {
  return useInfiniteQuery({
    queryKey: CONTACT_KEYS.list(params),
    queryFn: ({ pageParam }) =>
      contactApi.getContacts({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.current_page < lastPage.meta.last_page) {
        return lastPage.meta.current_page + 1;
      }
      return undefined;
    },
  });
}

export function useContact(id: number) {
  return useQuery({
    queryKey: CONTACT_KEYS.detail(id),
    queryFn: () => contactApi.getContact(id),
    enabled: id > 0,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateContactPayload) =>
      contactApi.createContact(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACT_KEYS.all });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: CreateContactPayload;
    }) => contactApi.updateContact(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACT_KEYS.all });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => contactApi.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACT_KEYS.all });
    },
  });
}
