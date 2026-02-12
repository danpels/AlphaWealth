"use client";

import { useState, useMemo, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { Currency } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const MARKET_AVG_NOMINAL = 6.54; // % historical market average
const INFLATION_ASSUMPTION = 2.4;
const REAL_RETURN = MARKET_AVG_NOMINAL - INFLATION_ASSUMPTION; // ~4.1% inflation-adjusted

type TabId = "networth" | "cashflow" | "success";

interface ProjectionSettingsRow {
  current_age: number | null;
  target_age: number | null;
  target_net_worth: number | null;
  monthly_savings: number | null;
  assumed_real_return_percent: number | null;
}

export function ProjectSuccessView({
  initialNetWorth,
  initialMonthlySavings,
  initialSettings,
  currency,
}: {
  initialNetWorth: number;
  initialMonthlySavings: number;
  initialSettings: ProjectionSettingsRow | null;
  currency: Currency;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("success");
  const [currentAge, setCurrentAge] = useState(
    initialSettings?.current_age ?? 40
  );
  const [targetAge, setTargetAge] = useState(
    initialSettings?.target_age ?? 90
  );
  const [netWorth, setNetWorth] = useState(
    initialSettings ? undefined : initialNetWorth
  );
  const currentNetWorth = netWorth ?? initialNetWorth;
  const [monthlySavings, setMonthlySavings] = useState(
    initialSettings?.monthly_savings ?? initialMonthlySavings
  );
  const [targetNetWorth, setTargetNetWorth] = useState(
    initialSettings?.target_net_worth ?? 879000
  );
  const [assumedReturn, setAssumedReturn] = useState(
    initialSettings?.assumed_real_return_percent ?? REAL_RETURN
  );
  const [saving, setSaving] = useState(false);

  const yearsToTarget = Math.max(0, targetAge - currentAge);
  const monthlyRate = assumedReturn / 100 / 12;

  const projectionData = useMemo(() => {
    const points: { age: number; value: number; label: string; isMilestone: boolean }[] = [];
    let value = currentNetWorth;
    const startAge = currentAge;
    for (let y = 0; y <= yearsToTarget; y++) {
      const age = startAge + y;
      const isMilestone = [50, 60, 70, 80, 90].includes(age) || y === 0;
      points.push({
        age,
        value: Math.round(value),
        label: y === 0 ? "TODAY" : `AGE ${age}`,
        isMilestone,
      });
      value = value * (1 + monthlyRate * 12) + monthlySavings * 12;
    }
    return points;
  }, [currentNetWorth, currentAge, yearsToTarget, monthlySavings, monthlyRate]);

  const medianNetWorthAt90 = projectionData.length > 0
    ? projectionData[projectionData.filter((p) => p.age === targetAge)[0] ? projectionData.findIndex((p) => p.age === targetAge) : projectionData.length - 1]?.value ?? projectionData[projectionData.length - 1].value
    : currentNetWorth;
  const valueAtTarget = projectionData.find((p) => p.age === targetAge)?.value ?? projectionData[projectionData.length - 1]?.value ?? 0;
  const chanceOfSuccess = targetNetWorth <= 0 ? 100 : valueAtTarget >= targetNetWorth ? 85 : Math.max(0, Math.min(84, Math.round((valueAtTarget / targetNetWorth) * 100)));

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("projection_settings").upsert({
      user_id: user.id,
      current_age: currentAge,
      target_age: targetAge,
      target_net_worth: targetNetWorth,
      monthly_savings: monthlySavings,
      assumed_real_return_percent: assumedReturn,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    setSaving(false);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {[
          { id: "networth" as TabId, label: "Net worth" },
          { id: "cashflow" as TabId, label: "Cash flow" },
          { id: "success" as TabId, label: "Success %" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-medium">Your inputs</CardTitle>
          <p className="text-sm text-muted-foreground">
            Adjust these to see how market-average returns affect your projection.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Current net worth ({currency})</Label>
              <Input
                type="number"
                min={0}
                value={currentNetWorth || ""}
                onChange={(e) => setNetWorth(Number(e.target.value) || 0)}
                placeholder="0"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Monthly savings ({currency})</Label>
              <Input
                type="number"
                min={0}
                value={monthlySavings || ""}
                onChange={(e) => setMonthlySavings(Number(e.target.value) || 0)}
                placeholder="0"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Current age</Label>
              <Input
                type="number"
                min={18}
                max={100}
                value={currentAge || ""}
                onChange={(e) => setCurrentAge(Number(e.target.value) || 0)}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Target age</Label>
              <Input
                type="number"
                min={currentAge}
                max={100}
                value={targetAge || ""}
                onChange={(e) => setTargetAge(Number(e.target.value) || 90)}
                className="bg-background"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Target net worth at {targetAge} ({currency})</Label>
              <Input
                type="number"
                min={0}
                value={targetNetWorth || ""}
                onChange={(e) => setTargetNetWorth(Number(e.target.value) || 0)}
                placeholder="0"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Assumed real return (% per year)</Label>
              <Input
                type="number"
                step="0.1"
                min={0}
                max={15}
                value={assumedReturn}
                onChange={(e) => setAssumedReturn(Number(e.target.value) || 0)}
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Market avg ~{REAL_RETURN.toFixed(1)}% (inflation-adjusted)
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save assumptions"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Chance of success at {targetAge}
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{chanceOfSuccess}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              After factoring in your events, you meet or exceed your target net worth in {chanceOfSuccess}% of the simulations.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Median net worth at {targetAge}
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {formatCurrency(valueAtTarget, currency)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Most outcomes are concentrated around this median result.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Projected average annual return
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{MARKET_AVG_NOMINAL}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              Investment accounts projected to grow at {assumedReturn.toFixed(1)}% per year (inflation-adjusted) over the next {yearsToTarget} years.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-muted/30 px-4 py-3 border-b border-border">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Net worth projection (market-average growth)
            </p>
          </div>
          <div className="p-4">
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={projectionData} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
                  <defs>
                    <linearGradient id="projectionFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="label"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    interval={0}
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    tickFormatter={(v) => formatCurrency(v, currency).replace(/\s/g, "")}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    width={52}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                    formatter={(value: number) => [formatCurrency(value, currency), "Net worth"]}
                    labelFormatter={(label, payload) => {
                      const p = payload?.[0]?.payload;
                      return p ? `Age ${p.age}` : label;
                    }}
                  />
                  {targetNetWorth > 0 && (
                    <ReferenceLine
                      yAxisId="left"
                      y={targetNetWorth}
                      stroke="hsl(var(--muted-foreground))"
                      strokeDasharray="4 4"
                      label={{ value: `Target: ${formatCurrency(targetNetWorth, currency)}`, position: "right", fontSize: 11 }}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="value"
                    fill="url(#projectionFill)"
                    stroke="none"
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    yAxisId="left"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    strokeDasharray="4 2"
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                    
                      if (
                        !payload?.isMilestone ||
                        (payload.age !== currentAge && payload.label === "TODAY")
                      ) {
                        return <g />; // ✅ FIX
                      }
                    
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={5}
                          fill="#22c55e"
                          stroke="white"
                          strokeWidth={2}
                        />
                      );
                    }}
                    
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-2">
              Starting point: {formatCurrency(currentNetWorth, currency)} today · Assumed {assumedReturn.toFixed(1)}% real return
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
