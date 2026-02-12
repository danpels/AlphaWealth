"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Onboarding, IncomeSource, RecurringExpense, Transaction } from "@/types/database";
import type { Currency } from "@/types/database";
import { IncomeSourcesList } from "@/components/tools/IncomeSourcesList";
import { RecurringExpensesList } from "@/components/tools/RecurringExpensesList";
import { Button } from "@/components/ui/button";
import type { PayFrequency } from "@/types/database";

function monthlyFrom(amount: number, freq: PayFrequency): number {
  switch (freq) {
    case "weekly": return amount * 4.33;
    case "biweekly": return amount * 2.17;
    case "monthly": return amount;
    case "annual": return amount / 12;
    default: return amount;
  }
}

const BUDGET_CATEGORIES = [
  { name: "Housing", amount: 1850, color: "hsl(var(--chart-1))" },
  { name: "Transport", amount: 580, color: "hsl(var(--chart-2))" },
  { name: "Food", amount: 940, color: "hsl(var(--chart-3))" },
  { name: "Subscriptions", amount: 210, color: "hsl(var(--chart-4))" },
  { name: "Travel savings", amount: 400, color: "hsl(var(--chart-5))" },
  { name: "Other", amount: 1860, color: "hsl(var(--muted-foreground))" },
];

export function IncomeBudgetView({
  onboarding,
  incomeSources,
  recurringExpenses,
  transactions,
  currency,
}: {
  onboarding: Onboarding | null;
  incomeSources: IncomeSource[];
  recurringExpenses: RecurringExpense[];
  transactions: Transaction[];
  currency: Currency;
}) {
  const [householdView, setHouseholdView] = useState(true);

  const grossMonthly =
    incomeSources.length > 0
      ? incomeSources.reduce((sum, s) => sum + monthlyFrom(s.amount, s.frequency), 0)
      : onboarding?.average_paycheck && onboarding?.pay_frequency
        ? monthlyFrom(onboarding.average_paycheck, onboarding.pay_frequency)
        : 11400;
  const effectiveTaxPercent = 23.5;
  const afterTax = Math.round(grossMonthly * (1 - effectiveTaxPercent / 100));
  const monthlySpend = 5840;
  const surplus = afterTax - monthlySpend;
  const savingsRate = grossMonthly > 0 ? Math.round((surplus / grossMonthly) * 100) : 0;

  const budgetTotal = BUDGET_CATEGORIES.reduce((s, c) => s + c.amount, 0);
  const budgetUsedPercent = 67;

  const spendingByMonth = useMemo(() => {
    const months = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
    const byMonth: Record<string, number> = {};
    months.forEach((m) => (byMonth[m] = 0));
    transactions.filter((t) => t.type === "expense").forEach((t) => {
      const m = new Date(t.date).toLocaleString("en-US", { month: "short" });
      byMonth[m] = (byMonth[m] ?? 0) + Math.abs(t.amount);
    });
    return months.map((m) => ({
      month: m,
      amount: byMonth[m] || (m === "Feb" ? monthlySpend : 5200 + Math.random() * 800),
    }));
  }, [transactions, monthlySpend]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-border bg-card">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Gross Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-success">{formatCurrency(grossMonthly, currency)}</p>
            <p className="text-xs text-muted-foreground">All sources combined</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              After-Tax Take-Home
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{formatCurrency(afterTax, currency)}</p>
            <p className="text-xs text-destructive">-{effectiveTaxPercent}% effective tax</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Monthly Surplus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-success">{formatCurrency(surplus, currency)}</p>
            <p className="text-xs text-success">Savings rate {savingsRate}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Income Sources</CardTitle>
            <Button
              variant={householdView ? "default" : "outline"}
              size="sm"
              onClick={() => setHouseholdView(true)}
              className="rounded-full"
            >
              Household
            </Button>
          </CardHeader>
          <CardContent>
            <IncomeSourcesList sources={incomeSources} currency={currency} />
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base font-medium">Monthly Budget Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative h-32 w-32 shrink-0">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="3"
                    strokeDasharray={`${budgetUsedPercent}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-semibold text-foreground">{budgetUsedPercent}%</span>
                </div>
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                {BUDGET_CATEGORIES.map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{c.name}</span>
                    <span className="font-medium">{formatCurrency(c.amount, currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Monthly Spending Trend – Last 12 Months
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendingByMonth} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis
                  tickFormatter={(v) => formatCurrency(v, currency).replace(/\s/g, "")}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  width={48}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                  formatter={(value: number) => [formatCurrency(value, currency), "Spend"]}
                />
                <Bar
                  dataKey="amount"
                  fill="hsl(var(--chart-1))"
                  radius={[4, 4, 0, 0]}
                  name="Spending"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-medium">Recurring Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <RecurringExpensesList expenses={recurringExpenses} currency={currency} />
        </CardContent>
      </Card>
    </div>
  );
}
