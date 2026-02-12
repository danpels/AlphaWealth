import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileSettingsView } from "@/components/settings/ProfileSettingsView";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, currency, region")
    .eq("id", user.id)
    .single();

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Explore</p>
          <h1 className="text-2xl font-semibold text-foreground md:text-3xl">Profile & Settings</h1>
        </div>
        <ProfileSettingsView
          profile={{
            full_name: profile?.full_name ?? null,
            email: user.email ?? null,
            currency: (profile?.currency as "USD" | "CAD") ?? "USD",
            region: profile?.region ?? null,
          }}
        />
      </div>
    </div>
  );
}
