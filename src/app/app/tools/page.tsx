import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calculator, MapPin } from "lucide-react";
import { ConverterWidget } from "@/components/tools/ConverterWidget";
import { RecurringExpensesList } from "@/components/tools/RecurringExpensesList";
import { IncomeSourcesList } from "@/components/tools/IncomeSourcesList";

export default async function ToolsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: recurring } = await supabase
    .from("recurring_expenses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: incomeSources } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: profile } = await supabase
    .from("profiles")
    .select("currency")
    .eq("id", user.id)
    .single();

  return (
    <div className="p-4 md:p-6 safe-top">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl font-semibold text-foreground">Tools</h1>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">Currency converter</h2>
          <ConverterWidget defaultCurrency={(profile?.currency as "USD" | "CAD") ?? "USD"} />
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">Household income sources</h2>
          <IncomeSourcesList
            sources={incomeSources ?? []}
            currency={(profile?.currency as "USD" | "CAD") ?? "USD"}
          />
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">Recurring expenses</h2>
          <RecurringExpensesList
            expenses={recurring ?? []}
            currency={(profile?.currency as "USD" | "CAD") ?? "USD"}
          />
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">More tools</h2>
          <div className="grid gap-3">
            <Link href="/app/tools/tax">
              <Card className="border-border bg-card hover:bg-card/80 transition-colors">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Calculator className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Tax calculator</p>
                    <p className="text-xs text-muted-foreground">
                      US states & Canadian provinces
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
            <a
              href="https://www.numbeo.com/cost-of-living/region_rankings_current.jsp?region=021"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card className="border-border bg-card hover:bg-card/80 transition-colors">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Cost of living (North America)</p>
                    <p className="text-xs text-muted-foreground">
                      Compare cities — opens Numbeo
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
