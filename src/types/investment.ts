export type InvestmentType =
  | 'gold'
  | 'mutual_fund'
  | 'stock'
  | 'crypto'
  | 'bond'
  | 'other';

export interface InvestmentAsset {
  id: number;
  name: string;
  investment_type: InvestmentType;
  unit_quantity: number;
  unit_cost_avg: number;
  last_market_price: number;
  current_balance: number;
  unrealized_gain_loss: number;
  icon: string;
  color: string;
}

export interface InvestmentAccountNode {
  id: number;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  normal_balance: 'debit' | 'credit';
  asset_category: string;
  icon: string;
  color: string;
  opening_balance: number;
  current_balance: number;
  is_default: boolean;
  is_active: boolean;
  parent_id: number | null;
  acquisition_date: string | null;
  children: InvestmentAccountNode[];
}

export interface InvestmentPurchase {
  transaction_id?: number;
  date: string;
  unit_quantity: number;
  unit_price: number;
  total_amount?: number;
  notes?: string;
}

export interface InvestmentSale {
  transaction_id?: number;
  date: string;
  unit_quantity: number;
  unit_price: number;
  total_amount?: number;
  notes?: string;
}

export interface InvestmentAssetDetail extends InvestmentAsset {
  parent_id: number | null;
  last_valued_at: string;
  history: {
    purchases: InvestmentPurchase[];
    sales: InvestmentSale[];
  };
  children?: InvestmentAsset[];
}

export interface InvestmentListMeta {
  total_investment_value: number;
}

export interface CreateInvestmentPayload {
  name: string;
  investment_type: InvestmentType;
  unit_quantity: number;
  unit_price: number;
  source_account_id?: number | null;
  transaction_date: string;
  icon?: string;
  color?: string;
  notes?: string;
  parent_id?: number | null;
}

export interface BuyUnitPayload {
  unit_quantity: number;
  unit_price: number;
  source_account_id: number;
  transaction_date: string;
  notes?: string;
}

export interface SellUnitPayload {
  unit_quantity: number;
  unit_price: number;
  destination_account_id: number;
  transaction_date: string;
  notes?: string;
}

export interface EditPurchasePayload {
  unit_quantity: number;
  unit_price: number;
  source_account_id?: number | null;
  transaction_date: string;
  notes?: string;
}

export interface EditSalePayload {
  unit_quantity: number;
  unit_price: number;
  destination_account_id: number;
  transaction_date: string;
  notes?: string;
}

export interface AccountSummary {
  id: number;
  unit_quantity: number;
  unit_cost_avg: number;
  current_balance: number;
}

export interface EditPurchaseResponse {
  account: AccountSummary;
  transaction_id: number;
}

export interface EditSaleResponse {
  investment_account: AccountSummary;
  sale: {
    unit_quantity_sold: number;
    unit_price: number;
    total_proceeds: number;
    realized_gain_loss: number;
  };
  transaction_id: number;
}

export interface DeleteTransactionResponse {
  account: AccountSummary;
}

export interface RevaluePayload {
  market_price: number;
  valued_at?: string;
}

export interface UpdateInvestmentPayload {
  name?: string;
  icon?: string | null;
  color?: string | null;
}
