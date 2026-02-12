"use client";

import { useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { US_STATES, CA_PROVINCES } from "@/config/onboarding";
import type { Currency } from "@/types/database";

const US_FEDERAL_2024 = [
  { max: 11600, rate: 10 },
  { max: 47150, rate: 12 },
  { max: 100525, rate: 22 },
  { max: 191950, rate: 24 },
  { max: 243725, rate: 32 },
  { max: 609350, rate: 35 },
  { max: Infinity, rate: 37 },
];

const CA_FEDERAL_2024 = [
  { max: 53359, rate: 15 },
  { max: 106717, rate: 20.5 },
  { max: 165430, rate: 26 },
  { max: 235675, rate: 29.32 },
  { max: Infinity, rate: 33 },
];

const REGION_TAX: Record<string, number> = {
  ON: 9.15, BC: 5.06, AB: 10, QC: 15,
  CA: 9.3, NY: 6.5, TX: 0, FL: 0, WA: 0,
};
const DEFAULT_RATE = 5;

const REGION_NAMES: Record<string, string> = {
  ON: "Ontario", BC: "British Columbia", AB: "Alberta", QC: "Quebec",
  CA: "California", NY: "New York", TX: "Texas", FL: "Florida", WA: "Washington",
};

function taxOwed(income: number, brackets: { max: number; rate: number }[]): number {
  let tax = 0, prev = 0;
  for (const b of brackets) {
    const taxable = Math.min(income, b.max) - prev;
    if (taxable <= 0) break;
    tax += (taxable * b.rate) / 100;
    prev = b.max;
    if (income <= b.max) break;
  }
  return tax;
}

const COMPARE_REGIONS = ["ON", "BC", "AB", "TX", "FL", "WA", "NY", "CA"];

export function TaxPlannerView({
  defaultCurrency,
  defaultRegion,
  userName,
}: {
  defaultCurrency: Currency;
  defaultRegion: string;
  userName: string;
}) {
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);
  const [region, setRegion] = useState(defaultRegion || "ON");
  const [income, setIncome] = useState("102000");

  const annualIncome = parseFloat(income) || 0;
  const federalBrackets = currency === "USD" ? US_FEDERAL_2024 : CA_FEDERAL_2024;
  const federalTax = useMemo(() => taxOwed(annualIncome, federalBrackets), [annualIncome, federalBrackets]);
  const regionRate = REGION_TAX[region] ?? DEFAULT_RATE;
  const regionTax = (annualIncome * regionRate) / 100;
  const cpp = currency === "CAD" ? annualIncome * 0.038 : 0;
  const ei = currency === "CAD" ? Math.min(annualIncome * 0.01, 1049) : 0;
  const totalTax = federalTax + regionTax + cpp + ei;
  const takeHome = annualIncome - totalTax;
  const effectiveRate = annualIncome > 0 ? (totalTax / annualIncome) * 100 : 0;

  const comparisonData = useMemo(() => {
    return COMPARE_REGIONS.map((r) => {
      const fr = taxOwed(annualIncome, federalBrackets);
      const rr = (annualIncome * (REGION_TAX[r] ?? DEFAULT_RATE)) / 100;
      return {
        region: REGION_NAMES[r] || r,
        tax: Math.round(fr + rr),
      };
    });
  }, [annualIncome, federalBrackets]);

  const regions = currency === "CAD" ? CA_PROVINCES : US_STATES;
  const regionLabel = currency === "CAD" ? "Province" : "State";

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-primary/10 px-4 py-3 text-sm text-foreground">
        Tax calculations based on 2025 tax brackets. {userName}&apos;s profile:{" "}
        {REGION_NAMES[region] || region}, {currency === "CAD" ? "Canada" : "USA"}{" "}
        {formatCurrency(annualIncome, currency)} gross annual income.
      </div>

      <div className="flex flex-wrap gap-2">
        {COMPARE_REGIONS.slice(0, 7).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRegion(r)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              region === r
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {REGION_NAMES[r] || r}
          </button>
        ))}
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            {REGION_NAMES[region] || region}, {currency === "CAD" ? "Canada" : "USA"} - 2025
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Annual gross income ({currency})</Label>
              <Input
                type="number"
                min={0}
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>{regionLabel}</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                {regions.map((r) => (
                  <option key={r} value={r}>{REGION_NAMES[r] || r}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Gross Annual Income</span>
              <span className="font-medium">100% · {formatCurrency(annualIncome, currency)}</span>
            </div>
            <div className="flex justify-between text-sm text-destructive">
              <span>Federal Income Tax</span>
              <span>-{formatCurrency(federalTax, currency)} ({annualIncome > 0 ? ((federalTax / annualIncome) * 100).toFixed(1) : 0}%)</span>
            </div>
            <div className="flex justify-between text-sm text-destructive">
              <span>{currency === "CAD" ? "Provincial" : "State"} Tax</span>
              <span>-{formatCurrency(regionTax, currency)} ({regionRate}%)</span>
            </div>
            {currency === "CAD" && (
              <>
                <div className="flex justify-between text-sm text-destructive">
                  <span>CPP Contributions</span>
                  <span>-{formatCurrency(cpp, currency)} (3.8%)</span>
                </div>
                <div className="flex justify-between text-sm text-destructive">
                  <span>EI Premiums</span>
                  <span>-{formatCurrency(ei, currency)} (1.0%)</span>
                </div>
              </>
            )}
            <div className="flex justify-between pt-2 border-t border-border text-base">
              <span className="text-foreground">Annual Take-Home</span>
              <span className="font-semibold text-success">{formatCurrency(takeHome, currency)}</span>
            </div>
            <p className="text-sm text-muted-foreground">Take-home monthly: {formatCurrency(takeHome / 12, currency)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Tax Comparison – Same {formatCurrency(annualIncome, currency)} Income
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} layout="vertical" margin={{ left: 60, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tickFormatter={(v) => formatCurrency(v, currency).replace(/\s/g, "")} fontSize={11} />
                <YAxis type="category" dataKey="region" width={56} fontSize={11} />
                <Tooltip formatter={(v: number) => [formatCurrency(v, currency), "Tax"]} />
                <Bar dataKey="tax" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {currency === "CAD" && (
        <div>
          <h3 className="text-base font-medium text-foreground mb-3">Tax Optimization Opportunities</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">RRSP</CardTitle>
                <p className="text-xs text-muted-foreground">Registered Retirement Savings Plan</p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-foreground">$18,400</p>
                <p className="text-xs text-muted-foreground">Contribution room available</p>
                <p className="text-xs text-success mt-1">Saves -$4,832 in taxes</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">TFSA</CardTitle>
                <p className="text-xs text-muted-foreground">Tax-Free Savings Account</p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-foreground">$7,000</p>
                <p className="text-xs text-muted-foreground">Available contribution room</p>
                <p className="text-xs text-muted-foreground mt-1">2025 annual limit</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">FHSA</CardTitle>
                <p className="text-xs text-muted-foreground">First Home Savings Account</p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-foreground">$8,000</p>
                <p className="text-xs text-muted-foreground">FHSA first-time buyer</p>
                <p className="text-xs text-muted-foreground mt-1">Annual limit · tax deductible</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
