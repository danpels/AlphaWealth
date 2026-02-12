export type Currency = "USD" | "CAD";
export type PayFrequency = "weekly" | "biweekly" | "monthly" | "annual";
export type IncomeSourceType = "primary" | "spouse" | "side" | "other";
export type AccountType = "checking" | "savings" | "investment" | "retirement" | "futures" | "other";
export type TransactionType = "income" | "expense" | "transfer";
export type AssetType = "ETF" | "Stock" | "Bond" | "Crypto" | "REIT" | "Other";
export type FilingStatus = "single" | "married_joint" | "married_separate" | "head_of_household";
export type RiskProfile = "conservative" | "moderate" | "aggressive";

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

export interface UserGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_saved: number;
  target_date: string | null;
  monthly_contribution: number;
  icon: string;
  color: string;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetLimit {
  id: string;
  user_id: string;
  category: string;
  monthly_limit: number;
  created_at: string;
  updated_at: string;
}

export interface InvestmentHolding {
  id: string;
  user_id: string;
  account_id: string | null;
  ticker: string;
  name: string | null;
  shares: number;
  cost_basis: number;
  asset_type: AssetType;
  dividend_yield_percent: number;
  created_at: string;
  updated_at: string;
}

export interface AccountSnapshot {
  id: string;
  user_id: string;
  account_id: string;
  balance: number;
  snapshot_date: string;
  created_at: string;
}

export interface TaxSettings {
  id: string;
  user_id: string;
  filing_status: FilingStatus;
  rrsp_contribution: number;
  tfsa_contribution: number;
  fhsa_contribution: number;
  retirement_401k_contribution: number;
  ira_contribution: number;
  hsa_contribution: number;
  standard_deduction_override: number | null;
  created_at: string;
  updated_at: string;
}

export interface InvestmentSettings {
  id: string;
  user_id: string;
  monthly_contribution: number;
  risk_profile: RiskProfile;
  projection_years: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectionSettings {
  id: string;
  user_id: string;
  current_age: number | null;
  target_age: number | null;
  target_net_worth: number | null;
  monthly_savings: number | null;
  assumed_real_return_percent: number | null;
  created_at: string;
  updated_at: string;
}
