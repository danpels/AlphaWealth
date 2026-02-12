"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Onboarding, IncomeSource } from "@/types/database";
import type { Currency } from "@/types/database";

const INFLATION_RATE = 3; // % per year
const DEFAULT_GROWTH = 2;

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

export function DashboardCharts({
  onboarding,
  incomeSources,
  currency,
}: {
  onboarding: Onboarding | null;
  incomeSources: IncomeSource[];
  currency: Currency;
}) {
  const monthlyIncome =
    incomeSources.length > 0
      ? incomeSources.reduce(
          (sum, s) => sum + monthlyFrom(s.amount, s.frequency),
          0
        )
      : onboarding?.average_paycheck && onboarding?.pay_frequency
        ? monthlyFrom(onboarding.average_paycheck, onboarding.pay_frequency)
        : 0;

  const goalData = useMemo(() => {
    const goals = [
      {
        name: "Emergency",
        value: onboarding?.emergency_fund ?? 0,
        fill: "hsl(var(--chart-1))",
      },
      {
        name: "Travel budget",
        value: onboarding?.travel_budget_goal ?? 0,
        fill: "hsl(var(--chart-2))",
      },
      {
        name: "Investment",
        value: onboarding?.investment_retirement_goal ?? 0,
        fill: "hsl(var(--chart-3))",
      },
      {
        name: "House",
        value: onboarding?.house_savings_goal ?? 0,
        fill: "hsl(var(--chart-4))",
      },
    ].filter((g) => g.value > 0);
    return goals;
  }, [onboarding]);

  const projectionYears = 10;
  const projectionData = useMemo(() => {
    const data = [];
    let savings = 0;
    let income = monthlyIncome * 12;
    const monthlySave = Math.max(0, monthlyIncome * 0.2); // assume 20% savings rate
    for (let y = 0; y <= projectionYears; y++) {
      const inflationFactor = Math.pow(1 + INFLATION_RATE / 100, y);
      const growthFactor = Math.pow(1 + DEFAULT_GROWTH / 100, y);
      income = monthlyIncome * 12 * growthFactor;
      savings += monthlySave * 12 * inflationFactor;
      data.push({
        year: y,
        savings: Math.round(savings),
        income: Math.round(income),
        label: `${y}y`,
      });
    }
    return data;
  }, [monthlyIncome]);

  return (
    <div className="space-y-6">
      {goalData.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base font-medium">Savings goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={goalData} layout="vertical" margin={{ left: 12, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => formatCurrency(v, currency).replace(/\s/g, "")}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={90}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                    formatter={(value: number) => [formatCurrency(value, currency), "Goal"]}
                    labelFormatter={(label) => label}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-medium">Savings vs income projection</CardTitle>
          <p className="text-xs text-muted-foreground">
            Assumes 20% savings rate, {INFLATION_RATE}% inflation, {DEFAULT_GROWTH}% income growth
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="label"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                />
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
                  formatter={(value: number) => [formatCurrency(value, currency), ""]}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.year != null
                      ? `Year ${payload[0].payload.year}`
                      : ""
                  }
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="savings"
                  name="Savings"
                  stroke="hsl(var(--chart-1))"
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.4}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="hsl(var(--chart-2))"
                  fill="hsl(var(--chart-2))"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
