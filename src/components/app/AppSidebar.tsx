"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  DollarSign,
  Calendar,
  TrendingUp,
  Target,
  FileText,
  MapPin,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LiveRate } from "./LiveRate";
import { Button } from "@/components/ui/button";

const OVERVIEW = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/income", label: "Income & Budget", icon: DollarSign },
  { href: "/app/calendar", label: "Calendar Spending", icon: Calendar },
];
const WEALTH = [
  { href: "/app/invest", label: "Investments", icon: TrendingUp },
  { href: "/app/projections", label: "Project Success", icon: Target },
  { href: "/app/goals", label: "Goals & Savings", icon: Target },
  { href: "/app/tax", label: "Tax Planner", icon: FileText },
];
const EXPLORE = [
  { href: "/app/cost-of-living", label: "Cost of Living", icon: MapPin },
  { href: "/app/settings", label: "Profile & Settings", icon: Settings },
];

function NavGroup({
  title,
  items,
  pathname,
}: {
  title: string;
  items: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
  pathname: string;
}) {
  return (
    <div className="space-y-1">
      <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider nav-muted">
        {title}
      </p>
      {items.map(({ href, label, icon: Icon }) => {
        const active =
          pathname === href || (href !== "/app" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active ? "nav-active" : "text-[hsl(var(--sidebar-foreground))]/80 hover:bg-white/5 hover:text-[hsl(var(--sidebar-foreground))]"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </div>
  );
}

export function AppSidebar({
  userName,
  userEmail,
}: {
  userName: string | null;
  userEmail: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const initial = userName?.charAt(0)?.toUpperCase() || userEmail?.charAt(0)?.toUpperCase() || "?";

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <aside className="sidebar-dark flex h-full w-56 flex-shrink-0 flex-col border-r border-white/10">
      <div className="flex h-14 items-center gap-2 border-b border-white/10 px-4">
        <span className="font-semibold tracking-tight text-[hsl(var(--sidebar-foreground))]">
          AlphaWealth
        </span>
        <span className="rounded bg-[hsl(var(--sidebar-primary))]/20 px-1.5 py-0.5 text-[10px] font-medium text-[hsl(var(--sidebar-primary))]">
          BETA
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--sidebar-primary))]/20 text-sm font-medium text-[hsl(var(--sidebar-primary))]">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[hsl(var(--sidebar-foreground))]">
              {userName || "User"}
            </p>
            <p className="text-xs nav-muted">+ Wealth Plan</p>
          </div>
        </div>
        <NavGroup title="Overview" items={OVERVIEW} pathname={pathname} />
        <NavGroup title="Wealth" items={WEALTH} pathname={pathname} />
        <NavGroup title="Explore" items={EXPLORE} pathname={pathname} />
      </div>
      <div className="border-t border-white/10 p-3">
        <LiveRate />
      </div>
      <div className="border-t border-white/10 p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-[hsl(var(--sidebar-muted))] hover:text-[hsl(var(--sidebar-foreground))] hover:bg-white/5"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
