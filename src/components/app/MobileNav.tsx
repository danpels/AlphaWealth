"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  DollarSign,
  Calendar,
  TrendingUp,
  Target,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/income", label: "Income", icon: DollarSign },
  { href: "/app/calendar", label: "Calendar", icon: Calendar },
  { href: "/app/invest", label: "Invest", icon: TrendingUp },
  { href: "/app/projections", label: "Project", icon: Target },
  { href: "/app/cost-of-living", label: "Explore", icon: MapPin },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur safe-bottom md:hidden">
      <div className="flex justify-around py-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/app" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
