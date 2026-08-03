export type AccountType = 'asset' | 'liability' | 'equity' | 'income' | 'expense';

export interface AccountTreeNode {
  id: number;
  name: string;
  type: AccountType;
  icon: string;
  color: string;
  current_balance: number;
  is_parent: boolean;
  children: AccountTreeNode[];
}

export interface SelectableAccount {
  id: number;
  name: string;
  group_label: string | null;
  icon: string;
  current_balance: number;
}

export interface Account {
  id: number;
  name: string;
  type: AccountType;
  normal_balance: 'debit' | 'credit';
  icon: string;
  color: string;
  opening_balance: number;
  current_balance: number;
  is_default: boolean;
  is_active: boolean;
  parent_id: number | null;
  asset_category?: string;
  acquisition_date?: string | null;
  investment_type?: string | null;
  unit_quantity?: string | null;
  last_market_price?: string | null;
  children: { id: number; name: string; current_balance: number }[];
  created_at: string;
  updated_at: string;
}

export interface AccountHistoryEntry {
  id: number;
  transaction_id: number;
  account_id: number;
  entry_type: 'debit' | 'credit';
  amount: number;
  created_at: string;
  updated_at: string;
  transaction: {
    id: number;
    user_id: number;
    reference: string;
    notes: string;
    total_amount: number;
    cash: 'in' | 'out';
    created_at: string;
    updated_at: string;
  };
}

export interface AccountHistoryMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CreateAccountPayload {
  name: string;
  type: AccountType;
  parent_id?: number | null;
  icon?: string;
  color?: string;
  opening_balance?: number;
  asset_type?: 'fixed' | 'investment' | 'current';
  asset_category?: string;
  acquisition_date?: string;
  investment_type?: 'gold' | 'mutual_fund' | 'stock' | 'crypto' | 'bond' | 'other';
  unit_quantity?: string;
  last_market_price?: string;
}

export type UpdateAccountPayload = Partial<CreateAccountPayload>;
