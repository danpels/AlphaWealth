import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CalendarView } from "@/components/calendar/CalendarView";

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(500);

  const { data: profile } = await supabase
    .from("profiles")
    .select("currency")
    .eq("id", user.id)
    .single();

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tracking</p>
          <h1 className="text-2xl font-semibold text-foreground md:text-3xl">Calendar Spending</h1>
        </div>
        <CalendarView
          transactions={transactions ?? []}
          currency={(profile?.currency as "USD" | "CAD") ?? "USD"}
        />
      </div>
    </div>
  );
}
