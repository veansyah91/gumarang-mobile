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
