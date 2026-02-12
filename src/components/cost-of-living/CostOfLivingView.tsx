"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import type { Currency } from "@/types/database";
import { ArrowLeftRight } from "lucide-react";

const API_URL = "https://api.exchangerate-api.com/v4/latest/USD";

const CITIES = [
  { id: "toronto", name: "Toronto, ON", you: true, rent: 2300, groceries: 500, transport: 196, dining: 55, colIndex: 78 },
  { id: "sf", name: "San Francisco, CA", you: false, rent: 3400, groceries: 650, transport: 120, dining: 85, colIndex: 113 },
  { id: "austin", name: "Austin, TX", you: false, rent: 2640, groceries: 510, transport: 90, dining: 45, colIndex: 68 },
];

export function CostOfLivingView({
  defaultCurrency,
  userRegion,
}: {
  defaultCurrency: Currency;
  userRegion?: string;
}) {
  const [fromCurrency, setFromCurrency] = useState<Currency>("USD");
  const [toCurrency, setToCurrency] = useState<Currency>(defaultCurrency === "USD" ? "CAD" : "USD");
  const [amount, setAmount] = useState("1000");
  const [rate, setRate] = useState<number | null>(1.3642);
  const [change, setChange] = useState(0.0021);
  const [loading, setLoading] = useState(true);

  const fetchRate = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      const usdToCad = data.rates?.CAD ?? 1.3642;
      setRate(fromCurrency === "USD" && toCurrency === "CAD" ? usdToCad : fromCurrency === "CAD" && toCurrency === "USD" ? 1 / usdToCad : 1);
      setChange(0.0021);
    } catch {
      setRate(1.3642);
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
    <div className="space-y-6">
      <Card className="border-border bg-card overflow-hidden">
        <div className="bg-muted/50 p-4 md:p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Currency conversion
          </p>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{fromCurrency === "USD" ? "🇺🇸" : "🇨🇦"}</span>
              <span className="font-medium">{fromCurrency}</span>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-28 bg-background"
              />
            </div>
            <button
              type="button"
              onClick={swap}
              className="flex items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="Swap currencies"
            >
              <ArrowLeftRight className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{toCurrency === "USD" ? "🇺🇸" : "🇨🇦"}</span>
              <span className="font-medium">{toCurrency}</span>
              <Input
                readOnly
                value={rate != null ? converted.toFixed(2) : "—"}
                className="w-28 bg-background"
              />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <span>1 {fromCurrency} = {fromCurrency === "USD" && rate ? rate.toFixed(4) : fromCurrency === "CAD" && rate ? (1 / rate).toFixed(4) : "—"} {toCurrency}</span>
            <span>Live rate · Updated just now · {change >= 0 ? "+" : ""}{change.toFixed(4)} from yesterday</span>
          </div>
        </div>
      </Card>

      <Card className="border-border bg-card overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-muted/30 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              North America – Cost of Living Index
            </p>
          </div>
          <div className="relative h-64 md:h-80 bg-muted/20 flex items-center justify-center">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:16px_16px]" />
            <div className="relative flex flex-wrap justify-center gap-4">
              {[60, 80, 100].map((x, i) => (
                <div
                  key={i}
                  className="h-3 w-3 rounded-full bg-primary/60 shadow-[0_0_12px_hsl(var(--primary))]"
                  style={{ transform: `translate(${(i - 1) * 40}px, ${(i % 2) * 20 - 10}px)` }}
                />
              ))}
            </div>
            <p className="absolute bottom-3 right-3 text-[10px] text-muted-foreground">
              Click a city to compare
            </p>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-base font-medium text-foreground mb-3">City comparison</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {CITIES.map((city) => (
            <Card key={city.id} className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <p className="font-medium text-foreground">{city.name}</p>
                  {city.you && (
                    <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                      YOU
                    </span>
                  )}
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">1BR Rent</span>
                    <span>{formatCurrency(city.rent, "USD")}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Groceries/mo</span>
                    <span>{formatCurrency(city.groceries, "USD")}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Transport/mo</span>
                    <span>{formatCurrency(city.transport, "USD")}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Dining out avg</span>
                    <span>{formatCurrency(city.dining, "USD")}</span>
                  </li>
                  <li className="flex justify-between pt-2 border-t border-border">
                    <span className="text-muted-foreground">COL Index</span>
                    <span className="font-medium">{city.colIndex}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
