export type Currency = "USD" | "CAD";
export type PayFrequency = "weekly" | "biweekly" | "monthly" | "annual";
export type IncomeSourceType = "primary" | "spouse" | "side" | "other";
export type AccountType = "checking" | "savings" | "investment" | "retirement" | "futures" | "other";
export type TransactionType = "income" | "expense" | "transfer";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  currency: Currency;
  region: string | null;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Onboarding {
  id: string;
  user_id: string;
  average_paycheck: number | null;
  hourly_rate: number | null;
  pay_frequency: PayFrequency | null;
  emergency_fund: number | null;
  travel_budget_goal: number | null;
  credit_card_debt: number | null;
  investment_retirement_goal: number | null;
  travel_goal: number | null;
  house_savings_goal: number | null;
  created_at: string;
  updated_at: string;
}

export interface IncomeSource {
  id: string;
  user_id: string;
  name: string;
  type: IncomeSourceType;
  amount: number;
  frequency: PayFrequency;
  growth_rate_percent: number;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface RecurringExpense {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  frequency: PayFrequency;
  next_due: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string | null;
  amount: number;
  type: TransactionType;
  category: string | null;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string;
}
