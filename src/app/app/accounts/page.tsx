import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AccountsList } from "@/components/accounts/AccountsList";
import { AddAccountButton } from "@/components/accounts/AddAccountButton";

export default async function AccountsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: accounts } = await supabase
    .from("accounts")
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
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Accounts</h1>
        <AddAccountButton />
      </div>
      <AccountsList accounts={accounts ?? []} currency={(profile?.currency as "USD" | "CAD") ?? "USD"} />
    </div>
  );
}
