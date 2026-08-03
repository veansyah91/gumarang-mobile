export type EntryType = 'debit' | 'credit';

export interface CashOutDetailEntry {
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

export interface CashOutCreditEntry {
  cash_account_id: number;
  amount: number;
  entry_type: 'credit';
}

export interface CreateCashOutPayload {
  total_amount: number;
  notes?: string;
  ref: string;
  details: (CashOutCreditEntry | CashOutDetailEntry)[];
}

export type UpdateCashOutPayload = CreateCashOutPayload;

export interface CashOutTransaction {
  id: number;
  reference: string;
  notes: string | null;
  total_amount: number;
  cash: string;
  created_at: string;
  updated_at: string;
}

export interface CashOutEntry {
  id: number;
  account_id: number;
  account_name: string;
  entry_type: EntryType;
  amount: number;
}

export interface CashOutInvestment {
  account_id: number;
  account_name: string;
  unit_quantity: number;
  unit_cost_avg: number;
  unit_price: number;
  investment_transaction_id: number;
}

export interface CashOutTransactionDetail {
  id: number;
  reference: string;
  notes: string | null;
  total_amount: number;
  cash: string;
  created_at: string;
  updated_at: string;
  entries: CashOutEntry[];
  investment?: CashOutInvestment;
}

export interface CashOutListMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CashOutListParams {
  search?: string;
  startDate?: string;
  endDate?: string;
  perPage?: number;
  page?: number;
}

export interface CashOutDetailData {
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
