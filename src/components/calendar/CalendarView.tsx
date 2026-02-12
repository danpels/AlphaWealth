"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const { days, totalsByDay } = useMemo(() => {
    const start = new Date(current.year, current.month, 1);
    const end = new Date(current.year, current.month + 1, 0);
    const daysInMonth = end.getDate();
    const firstDay = start.getDay();

    const totalsByDay: Record<string, number> = {};
    transactions.forEach((t) => {
      if (t.type !== "expense") return;
      const d = t.date;
      if (d) totalsByDay[d] = (totalsByDay[d] ?? 0) + Math.abs(t.amount);
    });

    const days: { date: number; dateStr: string; amount: number }[] = [];
    // empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push({ date: 0, dateStr: "", amount: 0 });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${current.year}-${String(current.month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        date: d,
        dateStr,
        amount: totalsByDay[dateStr] ?? 0,
      });
    }
    return { days, totalsByDay };
  }, [current, transactions]);

  const monthTotal = useMemo(() => {
    return Object.entries(totalsByDay).reduce((sum, [, v]) => sum + v, 0);
  }, [totalsByDay]);

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={goPrev}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-medium">
          {MONTHS[current.month]} {current.year}
        </h2>
        <Button variant="ghost" size="icon" onClick={goNext}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Monthly spending
          </CardTitle>
          <p className="text-2xl font-semibold text-foreground">
            {formatCurrency(monthTotal, currency)}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-xs text-muted-foreground py-1">
                {d}
              </div>
            ))}
            {days.map((cell, i) => (
              <div
                key={i}
                className={`min-h-12 rounded-md flex flex-col items-center justify-center p-1 ${
                  cell.date === 0
                    ? "invisible"
                    : cell.amount > 0
                      ? "bg-primary/20 text-foreground"
                      : "bg-muted/50 text-muted-foreground"
                }`}
              >
                {cell.date > 0 && (
                  <>
                    <span className="text-sm font-medium">{cell.date}</span>
                    {cell.amount > 0 && (
                      <span className="text-xs truncate w-full">
                        {formatCurrency(cell.amount, currency).replace(/\s/g, "")}
                      </span>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
