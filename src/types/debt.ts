export interface DebtItem {
  id: number;
  user_id: number;
  contact_id: number;
  contact_name: string;
  type: 'payable' | 'receivable';
  normal_balance: 'credit' | 'debit';
  name: string;
  amount: number;
  balance: number;
  due_date: string | null;
  status: 'pending' | 'partial' | 'paid';
  notes: string | null;
  account_id: number;
  account_name: string;
  entries: DebtEntry[];
  created_at: string;
  updated_at: string;
}

export interface DebtListMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface DebtListParams {
  query?: string;
  type?: 'payable' | 'receivable';
  contact_id?: number;
  status?: 'pending' | 'partial' | 'paid';
  startDate?: string;
  endDate?: string;
  perPage?: number;
  page?: number;
}

export interface DebtSearchParams {
  query?: string;
  type?: 'payable' | 'receivable';
  perPage?: number;
  page?: number;
}

export interface DebtSearchItem extends DebtItem {
  contact?: {
    id: number;
    user_id: number;
    name: string;
    phone: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
  } | null;
}

export interface CreateDebtPayload {
  contact_id: number;
  type: 'payable' | 'receivable';
  name: string;
  amount: number;
  due_date?: string;
  notes?: string;
  account_id: number;
  cash_account_id: number;
}

export interface UpdateDebtPayload {
  contact_id?: number;
  name?: string;
  amount?: number;
  due_date?: string;
  notes?: string;
  account_id?: number;
  cash_account_id?: number;
}

export interface DebtEntry {
  id: number;
  debt_id: number;
  no_ref: string;
  date: string;
  amount: number;
  type: 'debit' | 'credit';
  notes: string | null;
  account_id: number;
  is_initial: boolean;
  created_at: string;
  updated_at: string;
}

export interface DebtEntryListMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface DebtEntryListParams {
  search?: string;
  startDate?: string;
  endDate?: string;
  perPage?: number;
  page?: number;
}

export interface CreateDebtEntryPayload {
  contact_id: number;
  type: 'payable' | 'receivable';
  entry_type: 'debit' | 'credit';
  date: string;
  amount: number;
  account_id?: number;
  notes?: string;
}

export interface UpdateDebtEntryPayload {
  date?: string;
  amount?: number;
  entry_type?: 'debit' | 'credit';
  notes?: string;
}
