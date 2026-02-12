"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import type { Currency } from "@/types/database";

// Sample ETF dividend yields (approx) for projection
const ETF_PRESETS: { id: string; name: string; dividendYield: number; growth: number }[] = [
  { id: "voo", name: "VOO (S&P 500)", dividendYield: 1.35, growth: 7 },
  { id: "vti", name: "VTI (Total US)", dividendYield: 1.28, growth: 7 },
  { id: "schd", name: "SCHD (Dividend)", dividendYield: 3.5, growth: 5 },
  { id: "vym", name: "VYM (High Div)", dividendYield: 3.1, growth: 5 },
];

export function ETFProjections({
  goal,
  currency,
}: {
  goal: number;
  currency: Currency;
}) {
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [selectedETF, setSelectedETF] = useState(ETF_PRESETS[0]);
  const [years, setYears] = useState(20);

  const projectionData = useMemo(() => {
    const data = [];
    let balance = 0;
    const rate = (selectedETF.growth + selectedETF.dividendYield) / 100;
    for (let y = 0; y <= years; y++) {
      balance = balance * (1 + rate) + monthlyContribution * 12;
      data.push({
        year: y,
        balance: Math.round(balance),
        label: `${y}y`,
      });
    }
    return data;
  }, [monthlyContribution, selectedETF, years]);

  const finalBalance = projectionData[projectionData.length - 1]?.balance ?? 0;

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-medium">ETF-style projection</CardTitle>
          <p className="text-sm text-muted-foreground">
            Projected growth with dividend reinvestment. Not financial advice.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Monthly contribution</Label>
              <Input
                type="number"
                min={0}
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value) || 0)}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Years</Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={years}
                onChange={(e) => setYears(Math.min(50, Math.max(1, Number(e.target.value) || 10)))}
                className="bg-background"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>ETF / strategy</Label>
            <div className="flex flex-wrap gap-2">
              {ETF_PRESETS.map((etf) => (
                <button
                  key={etf.id}
                  type="button"
                  onClick={() => setSelectedETF(etf)}
                  className={`px-3 py-2 rounded-md text-sm border transition-colors ${
                    selectedETF.id === etf.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {etf.name}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              ~{selectedETF.dividendYield}% div yield, ~{selectedETF.growth}% growth
            </p>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectionData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
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
                  formatter={(value: number) => [formatCurrency(value, currency), "Balance"]}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.year != null
                      ? `Year ${payload[0].payload.year}`
                      : ""
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="balance"
                  name="Projected balance"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-muted-foreground">
            Projected balance in {years} years:{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency(finalBalance, currency)}
            </span>
            {goal > 0 && (
              <span className="block mt-1">
                Goal: {formatCurrency(goal, currency)}
                {finalBalance >= goal ? " — on track" : " — gap " + formatCurrency(goal - finalBalance, currency)}
              </span>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
