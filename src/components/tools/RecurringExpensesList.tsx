"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
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
import type { RecurringExpense } from "@/types/database";
import type { Currency } from "@/types/database";
import type { PayFrequency } from "@/types/database";

const FREQUENCIES: { value: PayFrequency; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "monthly", label: "Monthly" },
  { value: "annual", label: "Annual" },
];

export function RecurringExpensesList({
  expenses,
  currency,
}: {
  expenses: RecurringExpense[];
  currency: Currency;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<PayFrequency>("monthly");
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("recurring_expenses").insert({
      user_id: user.id,
      name: name || "Recurring",
      amount: Number(amount) || 0,
      frequency,
    });
    setLoading(false);
    setOpen(false);
    setName("");
    setAmount("");
    router.refresh();
  };

  const monthlyTotal = expenses.reduce((sum, e) => {
    const m = e.frequency === "weekly" ? 4.33 : e.frequency === "biweekly" ? 2.17 : e.frequency === "monthly" ? 1 : 1 / 12;
    return sum + e.amount * m;
  }, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          ~{formatCurrency(monthlyTotal, currency)}/mo total
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
              <DialogTitle>Add recurring expense</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rent"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
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
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Adding…" : "Add"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {expenses.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recurring expenses yet.</p>
      ) : (
        <ul className="space-y-2">
          {expenses.map((e) => (
            <li key={e.id}>
              <Card className="border-border bg-card">
                <CardContent className="flex items-center justify-between p-3">
                  <div>
                    <p className="font-medium text-foreground">{e.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{e.frequency}</p>
                  </div>
                  <p className="font-medium text-foreground">
                    {formatCurrency(e.amount, currency)}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
