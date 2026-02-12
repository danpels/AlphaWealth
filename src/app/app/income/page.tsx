import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { IncomeBudgetView } from "@/components/income/IncomeBudgetView";

export default async function IncomeBudgetPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: onboarding } = await supabase.from("onboarding").select("*").eq("user_id", user.id).single();
  const { data: incomeSources } = await supabase.from("income_sources").select("*").eq("user_id", user.id);
  const { data: recurring } = await supabase.from("recurring_expenses").select("*").eq("user_id", user.id);
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1).toISOString().slice(0, 10));

  const { data: profile } = await supabase.from("profiles").select("currency").eq("id", user.id).single();
  const currency = (profile?.currency as "USD" | "CAD") ?? "USD";

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Finances</p>
            <h1 className="text-2xl font-semibold text-foreground md:text-3xl">Income & Budget</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
        <IncomeBudgetView
          onboarding={onboarding}
          incomeSources={incomeSources ?? []}
          recurringExpenses={recurring ?? []}
          transactions={transactions ?? []}
          currency={currency}
        />
      </div>
    </div>
  );
}
