"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Onboarding, IncomeSource, Account } from "@/types/database";
import type { Currency } from "@/types/database";

function monthlyFrom(
  amount: number,
  frequency: "weekly" | "biweekly" | "monthly" | "annual"
): number {
  switch (frequency) {
    case "weekly":
      return amount * 4.33;
    case "biweekly":
      return amount * 2.17;
    case "monthly":
      return amount;
    case "annual":
      return amount / 12;
    default:
      return amount;
  }
}

export function SummaryCards({
  onboarding,
  incomeSources,
  accounts,
  currency,
}: {
  onboarding: Onboarding | null;
  incomeSources: IncomeSource[];
  accounts: Account[];
  currency: Currency;
}) {
  const totalIncomeMonthly =
    incomeSources.length > 0
      ? incomeSources.reduce(
          (sum, s) => sum + monthlyFrom(s.amount, s.frequency),
          0
        )
      : onboarding?.average_paycheck && onboarding?.pay_frequency
        ? monthlyFrom(onboarding.average_paycheck, onboarding.pay_frequency)
        : 0;

  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance ?? 0), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Monthly income
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-foreground">
            {formatCurrency(totalIncomeMonthly, currency)}
          </p>
        </CardContent>
      </Card>
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-foreground">
            {formatCurrency(totalBalance, currency)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
