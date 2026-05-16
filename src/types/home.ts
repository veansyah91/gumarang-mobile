export interface PricePoint {
  saleValue: number;
  purchaseValue: number;
}

export interface PricePeriod {
  date: string | null;
  price: PricePoint;
}

export interface TransactionDashboardTrend {
  current: PricePeriod;
  previous: PricePeriod | null;
  difference: number | null;
  trend: 'up' | 'down' | 'equal' | null;
}

export interface PriceListsDashboardTrend {
  miligram: TransactionDashboardTrend;
  gram: TransactionDashboardTrend;
}

export interface HomeData {
  priceListTrend: PriceListsDashboardTrend;
}
