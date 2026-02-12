"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { IncomeSource } from "@/types/database";
import type { Currency } from "@/types/database";
import type { PayFrequency } from "@/types/database";
import type { IncomeSourceType } from "@/types/database";

const FREQUENCIES: { value: PayFrequency; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "monthly", label: "Monthly" },
  { value: "annual", label: "Annual" },
];

const SOURCE_TYPES: { value: IncomeSourceType; label: string }[] = [
  { value: "primary", label: "Primary" },
  { value: "spouse", label: "Spouse" },
  { value: "side", label: "Side income" },
  { value: "other", label: "Other" },
];

function monthlyFrom(amount: number, freq: PayFrequency): number {
  switch (freq) {
    case "weekly": return amount * 4.33;
    case "biweekly": return amount * 2.17;
    case "monthly": return amount;
    case "annual": return amount / 12;
    default: return amount;
  }
}

export function IncomeSourcesList({
  sources,
  currency,
}: {
  sources: IncomeSource[];
  currency: Currency;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<PayFrequency>("monthly");
  const [type, setType] = useState<IncomeSourceType>("primary");
  const [growth, setGrowth] = useState("0");
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("income_sources").insert({
      user_id: user.id,
      name: name || "Income",
      type,
      amount: Number(amount) || 0,
      frequency,
      growth_rate_percent: Number(growth) || 0,
    });
    setLoading(false);
    setOpen(false);
    setName("");
    setAmount("");
    setGrowth("0");
    router.refresh();
  };

  const totalMonthly = sources.reduce(
    (sum, s) => sum + monthlyFrom(s.amount, s.frequency),
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          ~{formatCurrency(totalMonthly, currency)}/mo total
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Add income source</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Salary, Spouse job"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={type}
                  onChange={(e) => setType(e.target.value as IncomeSourceType)}
                >
                  {SOURCE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Amount per period</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as PayFrequency)}
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Expected annual growth % (optional)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={growth}
                  onChange={(e) => setGrowth(e.target.value)}
                  placeholder="0"
                  className="bg-background"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Adding…" : "Add"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {sources.length === 0 ? (
        <p className="text-sm text-muted-foreground">No income sources yet. Dashboard uses onboarding data until you add some.</p>
      ) : (
        <ul className="space-y-2">
          {sources.map((s) => (
            <li key={s.id}>
              <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                <div>
                  <p className="font-medium text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {s.type} · {s.frequency}
                    {s.growth_rate_percent ? ` · ${s.growth_rate_percent}% growth` : ""}
                  </p>
                </div>
                <p className="font-medium text-foreground">
                  {formatCurrency(s.amount, currency)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
