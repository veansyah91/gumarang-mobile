import type {
  Contact,
  ContactListMeta,
  ContactListParams,
  CreateContactPayload,
} from '@/src/types/contact';
import { apiClient } from './client';

export const contactApi = {
  getContacts: async (params: ContactListParams) => {
    const queryParams: Record<string, string> = {};
    if (params.search) queryParams.search = params.search;
    if (params.perPage) queryParams.perPage = String(params.perPage);
    if (params.page) queryParams.page = String(params.page);

    const response = await apiClient.get<{
      data: Contact[];
      meta: ContactListMeta;
    }>('/v1/member/contacts', { params: queryParams });
    return response.data;
  },

  getContact: async (id: number) => {
    const response = await apiClient.get<{
      data: Contact;
    }>(`/v1/member/contacts/${id}`);
    return response.data.data;
  },

  createContact: async (payload: CreateContactPayload) => {
    const response = await apiClient.post('/v1/member/contacts', payload);
    return response.data;
  },

  updateContact: async (id: number, payload: CreateContactPayload) => {
    const response = await apiClient.put(
      `/v1/member/contacts/${id}`,
      payload,
    );
    return response.data;
  },

  deleteContact: async (id: number) => {
    const response = await apiClient.delete(`/v1/member/contacts/${id}`);
    return response.data;
  },
};
