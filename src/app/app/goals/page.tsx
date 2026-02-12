import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GoalsView } from "@/components/goals/GoalsView";

export default async function GoalsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: onboarding } = await supabase.from("onboarding").select("*").eq("user_id", user.id).single();
  const { data: profile } = await supabase.from("profiles").select("currency").eq("id", user.id).single();
  const currency = (profile?.currency as "USD" | "CAD") ?? "USD";

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Planning</p>
          <h1 className="text-2xl font-semibold text-foreground md:text-3xl">Goals & Savings</h1>
        </div>
        <GoalsView onboarding={onboarding} currency={currency} />
      </div>
    </div>
  );
}
