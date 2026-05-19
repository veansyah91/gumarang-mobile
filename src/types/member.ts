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
  startDate?: string;
  endDate?: string;
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

export interface SaleTransactionMemberListFilters {
  page?: number;
  query?: string;
  startDate?: string;
  endDate?: string;
}

export interface SaleTransactionMemberInvoice {
  id: number;
  no_ref: string;
  user_id: number;
  value: number | string;
  date: string;
}

export interface SaleTransactionMemberPaginationLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

export interface SaleTransactionMemberPagination {
  current_page: number;
  data: SaleTransactionMemberInvoice[];
  first_page_url: string | null;
  from: number | null;
  last_page: number;
  last_page_url: string | null;
  links: SaleTransactionMemberPaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface SaleTransactionMemberListData {
  invoices: SaleTransactionMemberPagination;
  total: number | string;
}

export interface SaleTransactionMemberProduct {
  id: number;
  name: string;
  code: string;
  unit: string;
  weight: number | string;
  qty: number | string;
  amount: number | string;
  price: number | string;
}

export interface SaleTransactionMemberInvoiceDetail {
  id: number;
  no_ref: string;
  date: string;
  value: number | string;
  products: SaleTransactionMemberProduct[];
}

export interface SaleTransactionMemberDetailData {
  invoice: SaleTransactionMemberInvoiceDetail;
}

export interface SavingMemberListFilters {
  query?: string;
}

export interface SavingMemberProductCategory {
  id: number;
  name: string;
}

export interface SavingMember {
  id: number;
  no_ref: string;
  unit: string;
  weight: string;
  value: number | string;
  value_per_unit: number | string;
  is_active: number;
  product_category: SavingMemberProductCategory;
}

export interface SavingMemberListData {
  data: SavingMember[];
}

export interface SavingDetailMemberListFilters {
  page?: number;
  query?: string;
  startDate?: string;
  endDate?: string;
  user_saving_id?: number | string;
}

export interface SavingDetailMember {
  id: number;
  date: string;
  type: string;
  amount: number | string;
  value: number | string;
}

export interface SavingDetailMemberPaginationLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

export interface SavingDetailMemberPagination {
  current_page: number;
  data: SavingDetailMember[];
  first_page_url: string | null;
  from: number | null;
  last_page: number;
  last_page_url: string | null;
  links: SavingDetailMemberPaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface SavingDetailMemberListData {
  details: SavingDetailMemberPagination;
  total: number | string;
}

export interface SavingDetailListFilters {
  page?: number;
  query?: string;
  startDate?: string;
  endDate?: string;
  type?: 'debit' | 'credit' | '';
  userSaving?: number | string;
}

export interface SavingDetailItem {
  id: number;
  no_ref: string;
  date: string;
  type: 'debit' | 'credit';
  amount: string;
  balance: string;
  description: string;
  qty: number;
  created_at: string;
  user_saving: {
    id: number;
    no_ref: string;
    weight: string;
    value: number | string;
    value_per_unit: number | string;
    product_category: SavingMemberProductCategory;
  };
}

export interface SavingDetailListPaginationLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

export interface SavingDetailListMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  links: SavingDetailListPaginationLink[];
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface SavingDetailListResponse {
  data: SavingDetailItem[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: SavingDetailListMeta;
}

export interface GoldConvertionListFilters {
  page?: number;
  query?: string;
  startDate?: string;
  endDate?: string;
}

export interface GoldConvertionItem {
  id: number;
  no_ref: string;
  user_id: number;
  user_name: string;
  date: string;
  weight: string;
  unit: string;
  draft: boolean;
}

export interface GoldConvertionProduct {
  id: number;
  gold_convert_id: number;
  product_id: number;
  product_name: string;
  weight: string;
  unit: string;
  qty: number;
  status: 'start' | 'end';
}

export interface GoldConvertionDetail extends GoldConvertionItem {
  products: GoldConvertionProduct[];
}

export interface GoldConvertionListResponse {
  data: GoldConvertionItem[];
  meta: {
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    per_page: number;
  };
}
