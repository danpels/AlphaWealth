import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/app/Nav";
import { AppHeader } from "@/components/app/AppHeader";

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
    .select("onboarding_completed_at")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_completed_at) redirect("/onboarding");

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="hidden md:flex md:w-56 md:flex-shrink-0 md:border-r md:border-border md:bg-card/50">
        <Nav />
      </aside>
      <div className="flex-1 flex flex-col pb-20 md:pb-0 md:min-h-screen">
        <AppHeader />
        <main className="flex-1">
          {children}
        </main>
      </div>
      <aside className="md:hidden">
        <Nav />
      </aside>
    </div>
  );
}
