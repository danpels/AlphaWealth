import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { InvestmentsView } from "@/components/invest/InvestmentsView";

export default async function InvestPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: onboarding } = await supabase
    .from("onboarding")
    .select("investment_retirement_goal")
    .eq("user_id", user.id)
    .single();

  const { data: accounts } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.id)
    .in("type", ["investment", "retirement"]);

  const { data: profile } = await supabase
    .from("profiles")
    .select("currency")
    .eq("id", user.id)
    .single();

  const currency = (profile?.currency as "USD" | "CAD") ?? "USD";
  const goal = onboarding?.investment_retirement_goal ?? 0;
  const currentValue = accounts?.reduce((s, a) => s + (a.balance ?? 0), 0) ?? 241650;

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Portfolio</p>
          <h1 className="text-2xl font-semibold text-foreground md:text-3xl">Investments</h1>
        </div>
        <InvestmentsView
          goal={goal}
          currentValue={currentValue}
          currency={currency}
        />
      </div>
    </div>
  );
}
