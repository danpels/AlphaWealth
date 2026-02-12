"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Onboarding } from "@/types/database";
import type { Currency } from "@/types/database";
import { Shield, Home, Plane, Sun, Car } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const GOAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  emergency: Shield,
  house: Home,
  travel: Plane,
  retirement: Sun,
  vehicle: Car,
};

interface GoalConfig {
  id: string;
  name: string;
  target: number;
  targetLabel: string;
  saved: number;
  autoSaved?: number;
  color: string;
}

export function GoalsView({
  onboarding,
  currency,
}: {
  onboarding: Onboarding | null;
  currency: Currency;
}) {
  const goals = useMemo((): GoalConfig[] => {
    const ef = onboarding?.emergency_fund ?? 24000;
    const house = onboarding?.house_savings_goal ?? 85000;
    const travel = onboarding?.travel_goal ?? 6000;
    const retirement = onboarding?.investment_retirement_goal ?? 800000;
    const vehicle = 32000;
    return [
      {
        id: "emergency",
        name: "Emergency Fund",
        target: ef,
        targetLabel: `Target: ${formatCurrency(ef, currency)} - Dec 2027`,
        saved: Math.min(ef, 24000),
        autoSaved: 0,
        color: "hsl(var(--success))",
      },
      {
        id: "house",
        name: "Home Purchase",
        target: house,
        targetLabel: `Target: ${formatCurrency(house, currency)} - Dec 2027`,
        saved: Math.round(house * 0.45),
        autoSaved: 800,
        color: "hsl(var(--chart-1))",
      },
      {
        id: "travel",
        name: "Japan Travel",
        target: travel,
        targetLabel: `Target: ${formatCurrency(travel, currency)} - Jun 2026`,
        saved: Math.round(travel * 0.6),
        autoSaved: 200,
        color: "hsl(var(--chart-2))",
      },
      {
        id: "retirement",
        name: "Retirement",
        target: retirement,
        targetLabel: `Target: ${formatCurrency(retirement, currency)} - Age 55`,
        saved: Math.round(retirement * 0.08),
        autoSaved: 1200,
        color: "hsl(var(--chart-4))",
      },
      {
        id: "vehicle",
        name: "New Vehicle",
        target: vehicle,
        targetLabel: `Target: ${formatCurrency(vehicle, currency)} - 2028`,
        saved: Math.round(vehicle * 0.15),
        autoSaved: 400,
        color: "hsl(var(--destructive))",
      },
    ];
  }, [onboarding, currency]);

  const onTrackCount = goals.filter((g) => (g.saved / g.target) * 100 >= 25).length;
  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const monthlyToGoals = goals.reduce((s, g) => s + (g.autoSaved ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-border bg-card">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Goals on Track
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {onTrackCount}/{goals.length}
            </p>
            <p className="text-xs text-success">
              {Math.round((onTrackCount / goals.length) * 100)}% success rate
            </p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Saved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{formatCurrency(totalSaved, currency)}</p>
            <p className="text-xs text-muted-foreground">Across all goals</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Monthly to Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {formatCurrency(monthlyToGoals, currency)}
            </p>
            <p className="text-xs text-success">Auto-allocated</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {goals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.saved / goal.target) * 100));
          const Icon = GOAL_ICONS[goal.id] ?? Shield;
          return (
            <Card key={goal.id} className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${goal.color}20`, color: goal.color }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{goal.name}</p>
                    <p className="text-xs text-muted-foreground">{goal.targetLabel}</p>
                    <Progress value={percent} className="mt-3 h-2" />
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="text-muted-foreground">
                        {percent}% · {formatCurrency(goal.saved, currency)} saved
                      </span>
                      <span className="text-muted-foreground">
                        {formatCurrency(Math.max(0, goal.target - goal.saved), currency)} remaining
                      </span>
                    </div>
                    {goal.autoSaved != null && goal.autoSaved > 0 && (
                      <p className="mt-1 text-xs text-success">
                        {formatCurrency(goal.autoSaved, currency)}/mo auto-saved
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
