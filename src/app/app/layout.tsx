import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/app/AppSidebar";
import { MobileNav } from "@/components/app/MobileNav";
import { AppContentHeader } from "@/components/app/AppContentHeader";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed_at, full_name")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_completed_at) redirect("/onboarding");

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:block">
        <AppSidebar
          userName={profile?.full_name ?? null}
          userEmail={user.email ?? null}
        />
      </aside>
      <div className="flex flex-1 flex-col pb-20 md:pb-0">
        <AppContentHeader />
        <main className="flex-1 bg-background">{children}</main>
        <MobileNav />
      </div>
    </div>
  );
}
