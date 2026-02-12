import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProjectSuccessView } from "@/components/projections/ProjectSuccessView";

export default async function ProjectionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: accounts } = await supabase
    .from("accounts")
    .select("balance")
    .eq("user_id", user.id);
  const currentNetWorth = accounts?.reduce((s, a) => s + (a.balance ?? 0), 0) ?? 0;

  const { data: incomeSources } = await supabase
    .from("income_sources")
    .select("amount, frequency")
    .eq("user_id", user.id);
  const { data: recurring } = await supabase
    .from("recurring_expenses")
    .select("amount, frequency")
    .eq("user_id", user.id);

  function toMonthly(amount: number, freq: string) {
    switch (freq) {
      case "weekly": return amount * 4.33;
      case "biweekly": return amount * 2.17;
      case "monthly": return amount;
      case "annual": return amount / 12;
      default: return amount;
    }
  }
  const monthlyIncome = incomeSources?.reduce((s, i) => s + toMonthly(i.amount, i.frequency), 0) ?? 0;
  const monthlyExpenses = recurring?.reduce((s, r) => s + toMonthly(r.amount, r.frequency), 0) ?? 5840;
  const monthlySavings = Math.max(0, monthlyIncome - monthlyExpenses);

  const { data: settings } = await supabase
    .from("projection_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: profile } = await supabase
    .from("profiles")
    .select("currency")
    .eq("id", user.id)
    .single();
  const currency = (profile?.currency as "USD" | "CAD") ?? "USD";

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Wealth</p>
          <h1 className="text-2xl font-semibold text-foreground md:text-3xl">Project your success</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            See an instant projection of your net worth and cash flow based on your finances today and goals for tomorrow.
          </p>
        </div>
        <ProjectSuccessView
          initialNetWorth={currentNetWorth}
          initialMonthlySavings={monthlySavings}
          initialSettings={settings}
          currency={currency}
        />
      </div>
    </div>
  );
}
