"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, ArrowLeftRight } from "lucide-react";
import type { Currency } from "@/types/database";

const API_URL = "https://api.exchangerate-api.com/v4/latest/USD";

export function ConverterWidget({ defaultCurrency }: { defaultCurrency: Currency }) {
  const [fromCurrency, setFromCurrency] = useState<Currency>("USD");
  const [toCurrency, setToCurrency] = useState<Currency>(defaultCurrency === "USD" ? "CAD" : "USD");
  const [amount, setAmount] = useState("1000");
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRate = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      const usdToCad = data.rates?.CAD ?? 1.35;
      const usdToUsd = 1;
      if (fromCurrency === "USD" && toCurrency === "CAD") setRate(usdToCad);
      else if (fromCurrency === "CAD" && toCurrency === "USD") setRate(1 / usdToCad);
      else setRate(1);
    } catch {
      setRate(fromCurrency === "USD" && toCurrency === "CAD" ? 1.35 : fromCurrency === "CAD" && toCurrency === "USD" ? 1 / 1.35 : 1);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRate();
  }, [fromCurrency, toCurrency]);

  const num = parseFloat(amount) || 0;
  const converted = rate != null ? num * rate : 0;

  const swap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Live rate {fromCurrency} → {toCurrency}
          </span>
          <button
            type="button"
            onClick={fetchRate}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground disabled:opacity-50"
            aria-label="Refresh rate"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{fromCurrency}</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-background"
              />
              <select
                className="flex h-10 w-20 rounded-md border border-input bg-background px-2 text-sm"
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value as Currency)}
              >
                <option value="USD">USD</option>
                <option value="CAD">CAD</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{toCurrency}</Label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={rate != null ? converted.toFixed(2) : "—"}
                className="bg-muted/50"
              />
              <select
                className="flex h-10 w-20 rounded-md border border-input bg-background px-2 text-sm"
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value as Currency)}
              >
                <option value="USD">USD</option>
                <option value="CAD">CAD</option>
              </select>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={swap}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftRight className="h-3 w-3" /> Swap currencies
        </button>
        {rate != null && fromCurrency !== toCurrency && (
          <p className="text-xs text-muted-foreground">
            1 {fromCurrency} = {fromCurrency === "USD" ? rate.toFixed(4) : (1 / rate).toFixed(4)} {toCurrency}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
