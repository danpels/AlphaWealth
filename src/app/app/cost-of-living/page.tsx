import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CostOfLivingView } from "@/components/cost-of-living/CostOfLivingView";

export default async function CostOfLivingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("currency, region").eq("id", user.id).single();
  const currency = (profile?.currency as "USD" | "CAD") ?? "USD";

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Explore</p>
          <h1 className="text-2xl font-semibold text-foreground md:text-3xl">Cost of Living</h1>
        </div>
        <CostOfLivingView defaultCurrency={currency} userRegion={profile?.region ?? undefined} />
      </div>
    </div>
  );
}
