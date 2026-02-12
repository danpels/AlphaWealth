import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ETFProjections } from "@/components/invest/ETFProjections";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function InvestPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: onboarding } = await supabase
    .from("onboarding")
    .select("investment_retirement_goal")
    .eq("user_id", user.id)
    .single();

  const { data: profile } = await supabase
    .from("profiles")
    .select("currency")
    .eq("id", user.id)
    .single();

  return (
    <div className="p-4 md:p-6 safe-top">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold text-foreground">Invest & projections</h1>
        <ETFProjections
          goal={onboarding?.investment_retirement_goal ?? 0}
          currency={(profile?.currency as "USD" | "CAD") ?? "USD"}
        />
      </div>
    </div>
  );
}
