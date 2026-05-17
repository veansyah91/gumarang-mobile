import type { PriceListsDashboardTrend, PricePoint } from './home';

export interface Pagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export interface SaleInvoicesData {
  data: unknown[];
  pagination: Pagination;
}

export interface PurchaseInvoicesData {
  data: unknown[];
  pagination: Pagination;
}

export interface PurchaseTransactionMemberListFilters {
  page?: number;
  query?: string;
  start_date?: string;
  end_date?: string;
}

export interface PurchaseTransactionMemberInvoice {
  id: number;
  no_ref: string;
  user_id: number;
  value: number | string;
  date: string;
  draft: number;
}

export interface PurchaseTransactionMemberPaginationLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

export interface PurchaseTransactionMemberPagination {
  current_page: number;
  data: PurchaseTransactionMemberInvoice[];
  first_page_url: string | null;
  from: number | null;
  last_page: number;
  last_page_url: string | null;
  links: PurchaseTransactionMemberPaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface PurchaseTransactionMemberListData {
  invoices: PurchaseTransactionMemberPagination;
  total: number | string;
}

export interface PurchaseTransactionMemberProduct {
  id: number;
  name: string;
  code: string;
  unit: string;
  weight: number | string;
  qty: number | string;
  amount: number | string;
  price: number | string;
}

export interface PurchaseTransactionMemberInvoiceDetail {
  id: number;
  no_ref: string;
  date: string;
  value: number | string;
  draft: number;
  products: PurchaseTransactionMemberProduct[];
}

export interface PurchaseTransactionMemberDetailData {
  invoice: PurchaseTransactionMemberInvoiceDetail;
}

export interface ProductWeightData {
  total_weight: number;
  currency: string;
}

export interface SavingWeightData {
  total_weight: number;
  savings?: unknown;
  total_value_idr?: number;
  current_price_per_gram?: number;
}

export interface DepositsData {
  data: unknown[];
  pagination: Pagination;
}

export interface WithdrawsData {
  data: unknown[];
  pagination: Pagination;
}

export interface ProfitData {
  total_profit: number;
  total_profit_weight: number;
  currency: string;
}

export interface DashboardSummary {
  sale_invoice: number;
  purchase_invoice: number;
  user_product_weight: number;
  user_saving_weight: number;
  depositos: { unit: string; total_amount: number | string }[];
  withdraws: { unit: string; total_amount: number | string }[];
  user_profit: number;
  price_list_trend: PriceListsDashboardTrend;
}

export type UnitKey = 'gram' | 'miligram';

export interface GoldListMember {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface GoldListProduct {
  id: number;
  name: string;
  code: string;
  unit: string;
  weight: number | string;
  price: number | string;
  qty: number | string;
  amount: number | string;
}

export interface GoldListPriceList {
  gram: PricePoint;
  miligram: PricePoint;
}

export interface GoldListData {
  member: GoldListMember;
  products: GoldListProduct[];
  price_list: GoldListPriceList;
}
