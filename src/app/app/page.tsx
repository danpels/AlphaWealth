import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { SummaryCards } from "@/components/dashboard/SummaryCards";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("currency")
    .eq("id", user.id)
    .single();

  const currency = (profile?.currency as "USD" | "CAD") ?? "USD";

  return (
    <div className="p-4 md:p-6 safe-top">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-foreground mb-6">Dashboard</h1>
        <SummaryCards
          onboarding={onboarding}
          incomeSources={incomeSources ?? []}
          accounts={accounts ?? []}
          currency={currency}
        />
        <DashboardCharts
          onboarding={onboarding}
          incomeSources={incomeSources ?? []}
          currency={currency}
        />
      </div>
    </div>
  );
}
