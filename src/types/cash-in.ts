export type EntryType = 'debit' | 'credit';

export interface CashInDetailEntry {
  account_id: number;
  amount: number;
  entry_type: EntryType;
  account_name?: string;
  investment_type?: string;
  unit_quantity?: string;
  unit_price?: string;
  transaction_date?: string;
  notes?: string;
}

export interface CashInDebitEntry {
  cash_account_id: number;
  amount: number;
  entry_type: 'debit';
}

export interface CreateCashInPayload {
  total_amount: number;
  notes?: string;
  ref: string;
  details: (CashInDebitEntry | CashInDetailEntry)[];
}

export type UpdateCashInPayload = CreateCashInPayload;

export interface CashInTransaction {
  id: number;
  reference: string;
  notes: string | null;
  total_amount: number;
  cash: string;
  created_at: string;
  updated_at: string;
}

export interface CashInEntry {
  id: number;
  account_id: number;
  account_name: string;
  entry_type: EntryType;
  amount: number;
}

export interface CashInTransactionDetail {
  id: number;
  reference: string;
  notes: string | null;
  total_amount: number;
  cash: string;
  created_at: string;
  updated_at: string;
  entries: CashInEntry[];
}

export interface CashInListMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CashInListParams {
  search?: string;
  startDate?: string;
  endDate?: string;
  perPage?: number;
  page?: number;
}

export interface CashInDetailData {
  accountId: number | null;
  accountName: string;
  amount: number;
  accountSearch: string;
  investmentType: string;
  unitQty: string;
  unitPrice: string;
  transactionDate: string;
  notes: string;
}
