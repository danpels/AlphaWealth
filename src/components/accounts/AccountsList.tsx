"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Account } from "@/types/database";
import type { Currency } from "@/types/database";
import { Wallet, PiggyBank, TrendingUp, Landmark, CircleDollarSign } from "lucide-react";

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  checking: Wallet,
  savings: PiggyBank,
  investment: TrendingUp,
  retirement: Landmark,
  futures: CircleDollarSign,
  other: Wallet,
};

export function AccountsList({
  accounts,
  currency,
}: {
  accounts: Account[];
  currency: Currency;
}) {
  if (accounts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">No accounts yet.</p>
        <p className="text-xs mt-1">Add an account to track balances.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {accounts.map((account) => {
        const Icon = typeIcons[account.type] ?? Wallet;
        return (
          <li key={account.id}>
            <Card className="border-border bg-card">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{account.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{account.type}</p>
                  </div>
                </div>
                <p className="font-semibold text-foreground">
                  {formatCurrency(account.balance ?? 0, currency)}
                </p>
              </CardContent>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
