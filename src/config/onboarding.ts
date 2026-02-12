import type { PayFrequency } from "@/types/database";

export const CURRENCIES = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "CAD", label: "Canadian Dollar (CAD)" },
] as const;

export const PAY_FREQUENCIES: { value: PayFrequency; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "monthly", label: "Monthly" },
  { value: "annual", label: "Annual" },
];

export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
];

export const CA_PROVINCES = [
  "AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT",
];

export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  field: keyof OnboardingFormState;
  inputType: "currency" | "frequency" | "region" | "currency_region";
  placeholder?: string;
}

export interface OnboardingFormState {
  currency: "USD" | "CAD";
  region: string;
  average_paycheck: number | null;
  hourly_rate: number | null;
  pay_frequency: PayFrequency | null;
  emergency_fund: number | null;
  travel_budget_goal: number | null;
  credit_card_debt: number | null;
  investment_retirement_goal: number | null;
  travel_goal: number | null;
  house_savings_goal: number | null;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: "currency",
    title: "Currency & region",
    description: "We'll use this for tax estimates and projections.",
    field: "currency",
    inputType: "currency_region",
  },
  {
    id: "paycheck",
    title: "Average paycheck",
    description: "Your typical take-home pay per pay period.",
    field: "average_paycheck",
    inputType: "currency",
    placeholder: "0",
  },
  {
    id: "pay_frequency",
    title: "Pay frequency",
    description: "How often you get paid.",
    field: "pay_frequency",
    inputType: "frequency",
  },
  {
    id: "hourly",
    title: "Hourly rate (optional)",
    description: "Useful for side income or overtime projections.",
    field: "hourly_rate",
    inputType: "currency",
    placeholder: "0",
  },
  {
    id: "emergency",
    title: "Emergency fund goal",
    description: "How much you want in savings for emergencies.",
    field: "emergency_fund",
    inputType: "currency",
    placeholder: "0",
  },
  {
    id: "travel_budget",
    title: "Travel budget goal",
    description: "Annual amount you'd like to set aside for travel.",
    field: "travel_budget_goal",
    inputType: "currency",
    placeholder: "0",
  },
  {
    id: "credit_debt",
    title: "Credit card debt",
    description: "Current balance you're paying down.",
    field: "credit_card_debt",
    inputType: "currency",
    placeholder: "0",
  },
  {
    id: "investment_goal",
    title: "Investment & retirement goal",
    description: "Target amount for investments or retirement.",
    field: "investment_retirement_goal",
    inputType: "currency",
    placeholder: "0",
  },
  {
    id: "travel_goal",
    title: "Travel savings goal",
    description: "Specific amount you're saving toward a trip.",
    field: "travel_goal",
    inputType: "currency",
    placeholder: "0",
  },
  {
    id: "house_goal",
    title: "House savings goal",
    description: "Down payment or housing savings target.",
    field: "house_savings_goal",
    inputType: "currency",
    placeholder: "0",
  },
];
