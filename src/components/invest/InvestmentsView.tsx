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
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Currency } from "@/types/database";

const RISK_PROFILES = [
  { id: "conservative", label: "Conservative", return: 4, volatility: 8 },
  { id: "moderate", label: "Moderate", return: 7, volatility: 12 },
  { id: "aggressive", label: "Aggressive", return: 9, volatility: 18 },
];

const HOLDINGS = [
  { asset: "VTI (Vanguard Total Market)", type: "ETF", shares: 413, price: 238.24, value: 98392, divYield: 1.42, return: 24.3 },
  { asset: "XEQT (iShares Core Equity)", type: "ETF", shares: 1840, price: 30, value: 55200, divYield: 1.85, return: 18.7 },
];

export function InvestmentsView({
  goal,
  currentValue,
  currency,
}: {
  goal: number;
  currentValue: number;
  currency: Currency;
}) {
  const [risk, setRisk] = useState<"conservative" | "moderate" | "aggressive">("conservative");
  const monthlyContrib = 2500;
  const years = 20;
  const inflationAdj = 2.4;

  const profile = RISK_PROFILES.find((r) => r.id === risk) ?? RISK_PROFILES[1];
  const projectedValue = useMemo(() => {
    let val = currentValue;
    const rate = profile.return / 100;
    for (let y = 0; y < years; y++) {
      val = val * (1 + rate) + monthlyContrib * 12;
    }
    return Math.round(val);
  }, [currentValue, profile, years, monthlyContrib]);

  const annualDividends = useMemo(() => {
    return HOLDINGS.reduce((s, h) => s + (h.value * h.divYield) / 100, 0);
  }, []);

  const growthData = useMemo(() => {
    const data = [];
    let val = currentValue;
    const rate = profile.return / 100;
    const startYear = new Date().getFullYear();
    for (let y = 0; y <= years; y++) {
      data.push({
        year: startYear + y,
        value: Math.round(val),
        label: String(startYear + y).slice(2),
      });
      val = val * (1 + rate) + monthlyContrib * 12;
    }
    return data;
  }, [currentValue, profile, years, monthlyContrib]);

  return (
    <div className="space-y-6">
      <Card className="border-border bg-foreground text-background">
        <CardContent className="p-6">
          <p className="text-sm text-background/80">Projected portfolio value in {years} years</p>
          <p className="mt-1 text-3xl font-semibold">{formatCurrency(projectedValue, currency)}</p>
          <p className="mt-2 text-xs text-background/70">
            Assuming {profile.return}% avg. annual return · {formatCurrency(monthlyContrib, currency)}/mo contributions · {inflationAdj}% inflation adjusted
          </p>
          <div className="mt-4 grid grid-cols-3 gap-4 border-t border-background/20 pt-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-background/70">Current Value</p>
              <p className="text-lg font-semibold">{formatCurrency(currentValue, currency)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-background/70">Annual Dividends</p>
              <p className="text-lg font-semibold">{formatCurrency(annualDividends, currency)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-background/70">Risk Profile</p>
              <p className="text-lg font-semibold capitalize">{risk}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Portfolio Growth Projection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            {RISK_PROFILES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRisk(r.id as "conservative" | "moderate" | "aggressive")}
                className={`rounded px-3 py-1.5 text-xs font-medium uppercase transition-colors ${
                  risk === r.id
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
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
                  formatter={(value: number) => [formatCurrency(value, currency), "Value"]}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.year ?? ""}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={false}
                  fill="hsl(var(--chart-2))"
                  fillOpacity={0.2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-medium">Current Holdings</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 pr-4">Asset</th>
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4">Shares</th>
                <th className="pb-3 pr-4">Price</th>
                <th className="pb-3 pr-4">Value</th>
                <th className="pb-3 pr-4">Div. Yield</th>
                <th className="pb-3">Return</th>
              </tr>
            </thead>
            <tbody>
              {HOLDINGS.map((h, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="py-3 pr-4 font-medium text-foreground">{h.asset}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{h.type}</td>
                  <td className="py-3 pr-4">{h.shares.toLocaleString()}</td>
                  <td className="py-3 pr-4">{formatCurrency(h.price, currency)}</td>
                  <td className="py-3 pr-4 font-medium">{formatCurrency(h.value, currency)}</td>
                  <td className="py-3 pr-4">{h.divYield}%</td>
                  <td className="py-3 text-success">+{h.return}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
