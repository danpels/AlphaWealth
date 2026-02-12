import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardView } from "@/components/dashboard/DashboardView";

function toMonthly(amount: number, freq: string): number {
  switch (freq) {
    case "weekly": return amount * 4.33;
    case "biweekly": return amount * 2.17;
    case "monthly": return amount;
    case "annual": return amount / 12;
    default: return amount;
  }
}

export default async function AppDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: onboarding } = await supabase
    .from("onboarding")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: incomeSources } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", user.id);

  const { data: accounts } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.id);

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(50);

  const { data: recurringExpenses } = await supabase
    .from("recurring_expenses")
    .select("*")
    .eq("user_id", user.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("currency, full_name")
    .eq("id", user.id)
    .single();

  // Get account snapshots for YTD change calculation
  const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10);
  const { data: snapshots } = await supabase
    .from("account_snapshots")
    .select("balance, snapshot_date")
    .eq("user_id", user.id)
    .gte("snapshot_date", startOfYear)
    .order("snapshot_date", { ascending: true });

  // Calculate monthly spend from current month transactions + recurring expenses
  const now = new Date();
  const currentMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  
  const currentMonthExpenses = (transactions ?? [])
    .filter(t => t.type === "expense" && t.date >= currentMonthStart)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const recurringMonthly = (recurringExpenses ?? [])
    .reduce((sum, e) => sum + toMonthly(e.amount, e.frequency), 0);

  // Use transaction data if available, otherwise estimate from recurring
  const monthlySpend = currentMonthExpenses > 0 ? currentMonthExpenses : recurringMonthly;

  // Calculate YTD change from snapshots or estimate
  const currentBalance = (accounts ?? []).reduce((sum, a) => sum + (a.balance ?? 0), 0);
  const startOfYearBalance = snapshots && snapshots.length > 0 
    ? snapshots[0].balance 
    : currentBalance * 0.95; // Estimate 5% growth if no snapshots
  const ytdChange = currentBalance - startOfYearBalance;

  const currency = (profile?.currency as "USD" | "CAD") ?? "USD";
  const userName = profile?.full_name ?? "User";

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {getGreeting()}
          </p>
          <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
            {userName}&apos;s Dashboard
          </h1>
        </div>
        <DashboardView
          onboarding={onboarding}
          incomeSources={incomeSources ?? []}
          accounts={accounts ?? []}
          transactions={transactions ?? []}
          recurringExpenses={recurringExpenses ?? []}
          currency={currency}
          monthlySpend={monthlySpend}
          ytdChange={ytdChange}
        />
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
