"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { US_STATES, CA_PROVINCES } from "@/config/onboarding";
import type { Currency } from "@/types/database";

// Simplified marginal rate brackets (federal only, approximate). In production use official tables.
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

// Placeholder state/provincial rate (flat % of taxable for demo)
const STATE_RATE: Record<string, number> = {
  CA: 9.3, NY: 6.5, TX: 0, FL: 0, WA: 0, ON: 9.15, BC: 5.06, AB: 10, QC: 15,
};
const DEFAULT_STATE_RATE = 5;

function taxOwed(income: number, brackets: { max: number; rate: number }[]): number {
  let tax = 0;
  let prev = 0;
  for (const b of brackets) {
    const taxableInBracket = Math.min(income, b.max) - prev;
    if (taxableInBracket <= 0) break;
    tax += (taxableInBracket * b.rate) / 100;
    prev = b.max;
    if (income <= b.max) break;
  }
  return tax;
}

export function TaxCalculator({
  defaultCurrency,
  defaultRegion,
}: {
  defaultCurrency: Currency;
  defaultRegion: string;
}) {
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);
  const [region, setRegion] = useState(defaultRegion);
  const [income, setIncome] = useState("75000");

  const annualIncome = parseFloat(income) || 0;
  const federalBrackets = currency === "USD" ? US_FEDERAL_2024 : CA_FEDERAL_2024;
  const federalTax = useMemo(
    () => taxOwed(annualIncome, federalBrackets),
    [annualIncome, federalBrackets]
  );
  const stateRate = region ? (STATE_RATE[region] ?? DEFAULT_STATE_RATE) : 0;
  const stateTax = (annualIncome * stateRate) / 100;
  const totalTax = federalTax + stateTax;
  const effectiveRate = annualIncome > 0 ? (totalTax / annualIncome) * 100 : 0;
  const takeHome = annualIncome - totalTax;

  const regions = currency === "CAD" ? CA_PROVINCES : US_STATES;

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-base font-medium">Estimate taxes</CardTitle>
        <p className="text-sm text-muted-foreground">
          Federal + state/province. Approximate; not a substitute for professional advice.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Currency</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
            >
              <option value="USD">USD</option>
              <option value="CAD">CAD</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>{currency === "CAD" ? "Province" : "State"}</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="">Select…</option>
              {regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
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
        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Federal tax</span>
            <span className="font-medium">{formatCurrency(federalTax, currency)}</span>
          </div>
          {stateRate > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {currency === "CAD" ? "Provincial" : "State"} tax
              </span>
              <span className="font-medium">{formatCurrency(stateTax, currency)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm pt-2 border-t border-border">
            <span className="text-muted-foreground">Total tax</span>
            <span className="font-medium">{formatCurrency(totalTax, currency)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Effective rate</span>
            <span className="font-medium">{effectiveRate.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-base pt-2 border-t border-border">
            <span className="text-foreground">Take-home</span>
            <span className="font-semibold text-foreground">
              {formatCurrency(takeHome, currency)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
