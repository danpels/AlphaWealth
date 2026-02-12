"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Onboarding, IncomeSource, Account, Transaction, RecurringExpense } from "@/types/database";
import type { Currency } from "@/types/database";
import Link from "next/link";
import {
  ShoppingCart,
  Briefcase,
  Home,
  TrendingUp,
  Coffee,
  DollarSign,
} from "lucide-react";

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

const MONTH_LABELS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

function getCategoryIcon(category: string | null) {
  switch (category?.toLowerCase()) {
    case "groceries":
      return ShoppingCart;
    case "employment":
    case "income":
      return Briefcase;
    case "housing":
      return Home;
    case "investment":
      return TrendingUp;
    case "dining":
      return Coffee;
    default:
      return DollarSign;
  }
}

export function DashboardView({
  onboarding,
  incomeSources,
  accounts,
  transactions,
  recurringExpenses,
  currency,
  monthlySpend: propMonthlySpend,
  ytdChange: propYtdChange,
}: {
  onboarding: Onboarding | null;
  incomeSources: IncomeSource[];
  accounts: Account[];
  transactions: Transaction[];
  recurringExpenses: RecurringExpense[];
  currency: Currency;
  monthlySpend: number;
  ytdChange: number;
}) {
  const [netWorthRange, setNetWorthRange] = useState<"3M" | "6M" | "1Y" | "3Y" | "5Y">("1Y");

  const totalBalance = useMemo(
    () => accounts.reduce((sum, a) => sum + (a.balance ?? 0), 0),
    [accounts]
  );
  const monthlyIncome =
    incomeSources.length > 0
      ? incomeSources.reduce(
          (sum, s) => sum + monthlyFrom(s.amount, s.frequency),
          0
        )
      : onboarding?.average_paycheck && onboarding?.pay_frequency
        ? monthlyFrom(onboarding.average_paycheck, onboarding.pay_frequency)
        : 0;
  
  // Use calculated values from props, with sensible defaults
  const monthlySpend = propMonthlySpend > 0 ? propMonthlySpend : 
    recurringExpenses.reduce((sum, e) => sum + monthlyFrom(e.amount, e.frequency), 0);
  
  const afterTaxIncome = Math.round(monthlyIncome * 0.765);
  const savingsRate =
    monthlyIncome > 0 ? Math.round((1 - monthlySpend / afterTaxIncome) * 100) : 0;
  
  // Use YTD change from props (calculated from account snapshots)
  const netWorthYtdChange = propYtdChange;
  const netWorthYtdPercent = totalBalance > 0 ? (netWorthYtdChange / totalBalance) * 100 : 0;

  const netWorthData = useMemo(() => {
    const months = netWorthRange === "3M" ? 3 : netWorthRange === "6M" ? 6 : 12;
    const data = [];
    const startBalance = Math.max(0, totalBalance - netWorthYtdChange);
    for (let i = 0; i <= months; i++) {
      const t = i / months;
      const value = Math.round(startBalance + netWorthYtdChange * t + (i * 200));
      data.push({
        label: MONTH_LABELS[(12 - months + i) % 12],
        value,
        fullMonth: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][(12 - months + i) % 12],
      });
    }
    return data;
  }, [totalBalance, netWorthRange, netWorthYtdChange]);

  const assetAllocation = useMemo(() => {
    const byType: Record<string, number> = {};
    accounts.forEach((a) => {
      const type = a.type === "investment" ? "US Equities (VTI)" : a.type === "retirement" ? "RRSP/401k" : a.type === "savings" || a.type === "checking" ? "Cash & HYSA" : "Other";
      byType[type] = (byType[type] ?? 0) + (a.balance ?? 0);
    });
    if (Object.keys(byType).length === 0) {
      return [
        { name: "US Equities (VTI)", value: 34, fill: "hsl(var(--chart-1))" },
        { name: "Global ETF (XEQT)", value: 19, fill: "hsl(var(--chart-2))" },
        { name: "RRSP/401k", value: 31, fill: "hsl(var(--chart-3))" },
        { name: "Cash & HYSA", value: 15, fill: "hsl(var(--chart-4))" },
        { name: "Real Estate", value: 1, fill: "hsl(var(--chart-5))" },
      ];
    }
    const total = Object.values(byType).reduce((a, b) => a + b, 0) || 1;
    const colors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];
    return Object.entries(byType).map(([name, val], i) => ({
      name,
      value: Math.round((val / total) * 100),
      fill: colors[i % colors.length],
    }));
  }, [accounts]);

  const recentTransactions = transactions.slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Card className="border-border bg-card">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Net Worth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-foreground md:text-2xl">
              {formatCurrency(totalBalance, currency)}
            </p>
            <p className={`text-xs ${netWorthYtdChange >= 0 ? 'text-success' : 'text-destructive'}`}>
              {netWorthYtdChange >= 0 ? '↑' : '↓'} {Math.abs(netWorthYtdPercent).toFixed(1)}% YTD
            </p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Monthly Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-foreground md:text-2xl">
              {formatCurrency(monthlyIncome, currency)}
            </p>
            <p className="text-xs text-muted-foreground">
              After-tax ~{formatCurrency(afterTaxIncome, currency)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Monthly Spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-foreground md:text-2xl">
              {formatCurrency(monthlySpend, currency)}
            </p>
            <p className="text-xs text-muted-foreground">
              {recurringExpenses.length > 0 ? `${recurringExpenses.length} recurring` : 'From transactions'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Savings Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-foreground md:text-2xl">
              {savingsRate > 0 ? savingsRate : 0}%
            </p>
            <p className={`text-xs ${savingsRate >= 20 ? 'text-success' : 'text-muted-foreground'}`}>
              {savingsRate >= 20 ? '✓ Healthy' : 'Target: 20%+'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-medium">
              {formatCurrency(totalBalance, currency)}{" "}
              <span className={netWorthYtdChange >= 0 ? 'text-success' : 'text-destructive'}>
                {netWorthYtdChange >= 0 ? '↑' : '↓'} {formatCurrency(Math.abs(netWorthYtdChange), currency)} this year
              </span>
            </CardTitle>
          </div>
          <div className="flex gap-1">
            {(["3M", "6M", "1Y", "3Y", "5Y"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setNetWorthRange(r)}
                className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                  netWorthRange === r
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={netWorthData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis
                  tickFormatter={(v) => formatCurrency(v, currency).replace(/\s/g, "")}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  width={56}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                  formatter={(value: number) => [formatCurrency(value, currency), "Net worth"]}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.fullMonth ?? ""}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={false}
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Asset Allocation</CardTitle>
            <Link href="/app/accounts" className="text-xs font-medium text-primary hover:underline">
              Manage →
            </Link>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetAllocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {assetAllocation.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend layout="vertical" align="right" verticalAlign="middle" />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, ""]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Recent Transactions</CardTitle>
            <Link href="/app/calendar" className="text-xs font-medium text-primary hover:underline">
              View all →
            </Link>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="space-y-3">
                {[
                  { name: "Whole Foods Market", category: "Groceries", amount: -87, date: "Today" },
                  { name: "Salary Deposit", category: "Employment", amount: 5700, date: "Feb 10" },
                  { name: "Rent", category: "Housing", amount: -1850, date: "Feb 1" },
                  { name: "Dividend VTI", category: "Investment Income", amount: 42, date: "Jan 30" },
                  { name: "Cafe", category: "Dining", amount: -24, date: "Jan 29" },
                ].map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b border-border py-2 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-muted p-1.5">
                        {(() => {
                          const Icon = getCategoryIcon(t.category);
                          return <Icon className="h-4 w-4 text-muted-foreground" />;
                        })()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.category}</p>
                      </div>
                    </div>
                    <p
                      className={`text-sm font-medium ${
                        t.amount >= 0 ? "text-success" : "text-foreground"
                      }`}
                    >
                      {t.amount >= 0 ? "+" : ""}
                      {formatCurrency(t.amount, currency)}
                    </p>
                    <p className="text-xs text-muted-foreground w-12 text-right">{t.date}</p>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="space-y-2">
                {recentTransactions.map((t) => {
                  const Icon = getCategoryIcon(t.category);
                  return (
                    <li
                      key={t.id}
                      className="flex items-center justify-between border-b border-border py-2 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-muted p-1.5">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {t.description || t.category || "Transaction"}
                          </p>
                          <p className="text-xs text-muted-foreground">{t.category ?? "—"}</p>
                        </div>
                      </div>
                      <p
                        className={`text-sm font-medium ${
                          t.type === "income" ? "text-success" : "text-foreground"
                        }`}
                      >
                        {t.type === "income" ? "+" : "-"}
                        {formatCurrency(Math.abs(t.amount), currency)}
                      </p>
                      <p className="text-xs text-muted-foreground w-14 text-right">
                        {new Date(t.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
