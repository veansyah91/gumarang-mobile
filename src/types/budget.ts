export type BudgetPeriodType = 'monthly' | 'yearly' | 'custom';
export type BudgetAlertType = 'warning' | 'danger';

export interface BudgetAlert {
  id: number;
  budget_id: number;
  threshold_percentage: number;
  alert_type: BudgetAlertType;
  is_triggered: boolean;
  is_read: boolean;
  triggered_at: string;
  created_at: string;
}

export interface Budget {
  id: number;
  user_id: number;
  account_id: number;
  account_name: string;
  name: string;
  amount: number;
  period_type: BudgetPeriodType;
  start_date: string;
  end_date: string;
  repeat: boolean;
  is_active: boolean;
  spent: number;
  remaining: number;
  percentage_used: number;
  alerts: BudgetAlert[];
  created_at: string;
  updated_at: string;
}

export interface BudgetSummary {
  total_budget: number;
  total_spent: number;
  total_remaining: number;
  overall_percentage: number;
  alert_budgets: {
    id: number;
    name: string;
    amount: number;
    spent: number;
    remaining: number;
    percentage_used: number;
    alerts: {
      id: number;
      threshold_percentage: number;
      alert_type: BudgetAlertType;
      is_triggered: boolean;
    }[];
  }[];
}

export interface CreateBudgetPayload {
  account_id: number;
  name: string;
  amount: number;
  period_type: BudgetPeriodType;
  start_date: string;
  end_date: string;
  repeat?: boolean;
}

export interface UpdateBudgetPayload {
  account_id?: number;
  name?: string;
  amount?: number;
  period_type?: BudgetPeriodType;
  start_date?: string;
  end_date?: string;
  repeat?: boolean;
  is_active?: boolean;
}

export interface BudgetListParams {
  query?: string;
  period_type?: BudgetPeriodType;
  is_active?: boolean;
  perPage?: number;
  all?: boolean;
}
