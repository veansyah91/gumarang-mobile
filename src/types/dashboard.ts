export interface BudgetAlertItem {
  id: number;
  threshold_percentage: number;
  alert_type: 'warning' | 'danger';
  is_triggered: boolean;
  triggered_at: string | null;
}

export interface BudgetAlert {
  id: number;
  name: string;
  account_name: string;
  amount: number;
  spent: number;
  remaining: number;
  percentage_used: number;
  alerts: BudgetAlertItem[];
}

export interface TopAccount {
  account_id: number;
  account_name: string;
  total_amount: number;
}

export interface CashFlowSummary {
  total: number;
  top_accounts: TopAccount[];
}

export interface DueDebt {
  id: number;
  name: string;
  contact_name: string;
  balance: number;
  due_date: string;
  type: 'receivable' | 'payable';
}

export interface DashboardData {
  total_assets: number;
  total_debt: number;
  budget_alerts: BudgetAlert[];
  cash_in: CashFlowSummary;
  cash_out: CashFlowSummary;
  due_receivables: DueDebt[];
  due_payables: DueDebt[];
}

export interface DashboardParams {
  start_date?: string;
  end_date?: string;
}
