export interface Contact {
  id: number;
  user_id: number;
  name: string;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactListMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ContactListParams {
  search?: string;
  perPage?: number;
  page?: number;
}

export interface CreateContactPayload {
  name: string;
  phone?: string;
  notes?: string;
}

export type UpdateContactPayload = CreateContactPayload;
