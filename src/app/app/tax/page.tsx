import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TaxPlannerView } from "@/components/tax/TaxPlannerView";

export default async function TaxPlannerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("currency, region, full_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Planning</p>
          <h1 className="text-2xl font-semibold text-foreground md:text-3xl">Tax Planner</h1>
        </div>
        <TaxPlannerView
          defaultCurrency={(profile?.currency as "USD" | "CAD") ?? "USD"}
          defaultRegion={profile?.region ?? "ON"}
          userName={profile?.full_name ?? "User"}
        />
      </div>
    </div>
  );
}
