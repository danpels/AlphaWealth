import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TaxCalculator } from "@/components/tools/TaxCalculator";

export default async function TaxPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("currency, region")
    .eq("id", user.id)
    .single();

  return (
    <div className="p-4 md:p-6 safe-top">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-foreground mb-6">Tax calculator</h1>
        <TaxCalculator
          defaultCurrency={(profile?.currency as "USD" | "CAD") ?? "USD"}
          defaultRegion={profile?.region ?? ""}
        />
      </div>
    </div>
  );
}
