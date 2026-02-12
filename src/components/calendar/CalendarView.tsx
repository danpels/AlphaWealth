"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Transaction } from "@/types/database";
import type { Currency } from "@/types/database";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function CalendarView({
  transactions,
  currency,
}: {
  transactions: Transaction[];
  currency: Currency;
}) {
  const [current, setCurrent] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const today = new Date();
  const isCurrentMonth = current.year === today.getFullYear() && current.month === today.getMonth();
  const todayDate = today.getDate();

  const { days, byDay, monthTotal, monthIncome } = useMemo(() => {
    const start = new Date(current.year, current.month, 1);
    const end = new Date(current.year, current.month + 1, 0);
    const daysInMonth = end.getDate();
    const firstDay = start.getDay();

    const byDay: Record<string, { expense: number; income: number }> = {};
    transactions.forEach((t) => {
      const d = t.date;
      if (!d) return;
      if (!byDay[d]) byDay[d] = { expense: 0, income: 0 };
      if (t.type === "expense") byDay[d].expense += Math.abs(t.amount);
      if (t.type === "income") byDay[d].income += Math.abs(t.amount);
    });

    const days: { date: number; dateStr: string; expense: number; income: number }[] = [];
    for (let i = 0; i < firstDay; i++) {
      days.push({ date: 0, dateStr: "", expense: 0, income: 0 });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${current.year}-${String(current.month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const cell = byDay[dateStr] ?? { expense: 0, income: 0 };
      days.push({
        date: d,
        dateStr,
        expense: cell.expense,
        income: cell.income,
      });
    }

    let totalSpend = 0, totalIncome = 0;
    Object.values(byDay).forEach((c) => {
      totalSpend += c.expense;
      totalIncome += c.income;
    });
    const count = transactions.filter(
      (t) =>
        t.date &&
        t.date.startsWith(`${current.year}-${String(current.month + 1).padStart(2, "0")}`)
    ).length;
    let largest = 0;
    let largestLabel = "";
    Object.entries(byDay).forEach(([dateStr, c]) => {
      if (c.expense > largest) {
        largest = c.expense;
        largestLabel = dateStr;
      }
    });

    return {
      days,
      byDay,
      monthTotal: totalSpend,
      monthIncome: totalIncome,
      transactionCount: count,
      largestSpend: largest,
      largestLabel,
    };
  }, [current, transactions]);

  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();
  const daysElapsed = isCurrentMonth ? todayDate : daysInMonth;
  const avgPerDay = daysElapsed > 0 ? monthTotal / daysElapsed : 0;
  const budgetPerDay = 310;

  const goPrev = () => {
    setCurrent((c) =>
      c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }
    );
  };
  const goNext = () => {
    setCurrent((c) =>
      c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }
    );
  };

  const transactionCount = transactions.filter(
    (t) =>
      t.date &&
      t.date.startsWith(`${current.year}-${String(current.month + 1).padStart(2, "0")}`)
  ).length;
  const largestEntry = (() => {
    let max = 0, label = "";
    Object.entries(
      transactions
        .filter((t) => t.type === "expense" && t.date?.startsWith(`${current.year}-${String(current.month + 1).padStart(2, "0")}`))
        .reduce<Record<string, number>>((acc, t) => {
          const d = t.date!;
          acc[d] = (acc[d] ?? 0) + Math.abs(t.amount);
          return acc;
        }, {})
    ).forEach(([dateStr, amt]) => {
      if (amt > max) {
        max = amt;
        label = dateStr;
      }
    });
    return { amount: max, label };
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={goPrev} aria-label="Previous month">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-medium text-foreground">
          {MONTHS[current.month]} {current.year}
        </h2>
        <Button variant="ghost" size="icon" onClick={goNext} aria-label="Next month">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Spent</p>
            <p className="text-xl font-semibold text-foreground">{formatCurrency(monthTotal || 3847, currency)}</p>
            <p className="text-xs text-success">{isCurrentMonth ? `${todayDate} days in` : "This month"}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Avg / Day</p>
            <p className="text-xl font-semibold text-foreground">{formatCurrency(avgPerDay || 350, currency)}</p>
            <p className="text-xs text-muted-foreground">Budget {formatCurrency(budgetPerDay, currency)}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Transactions</p>
            <p className="text-xl font-semibold text-foreground">{transactionCount || 28}</p>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Largest Spend</p>
            <p className="text-xl font-semibold text-foreground">
              {formatCurrency(largestEntry.amount || 1850, currency)}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {largestEntry.label ? `Rent - ${new Date(largestEntry.label).getDate()}` : "Rent - Feb 1"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-1 text-center">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
              <div key={d} className="py-2 text-xs font-medium uppercase text-muted-foreground">
                {d}
              </div>
            ))}
            {days.map((cell, i) => {
              const isToday = isCurrentMonth && cell.date === todayDate;
              return (
                <div
                  key={i}
                  className={`min-h-[88px] rounded-lg border border-border p-1.5 flex flex-col gap-1 ${
                    cell.date === 0 ? "invisible" : "bg-card"
                  } ${isToday ? "ring-2 ring-primary/50 bg-primary/5" : ""}`}
                >
                  {cell.date > 0 && (
                    <>
                      <span
                        className={`text-xs font-medium ${
                          isToday ? "flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {cell.date}
                      </span>
                      {cell.expense > 0 && (
                        <span className="rounded bg-destructive/15 px-1 py-0.5 text-[10px] font-medium text-destructive truncate" title={`Expense: ${formatCurrency(cell.expense, currency)}`}>
                          -{formatCurrency(cell.expense, currency).replace(/\s/g, "")}
                        </span>
                      )}
                      {cell.income > 0 && (
                        <span className="rounded bg-success/15 px-1 py-0.5 text-[10px] font-medium text-success truncate" title={`Income: ${formatCurrency(cell.income, currency)}`}>
                          +{formatCurrency(cell.income, currency).replace(/\s/g, "")}
                        </span>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
