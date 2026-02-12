"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, Calendar, TrendingUp, MapPin, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/accounts", label: "Accounts", icon: Wallet },
  { href: "/app/calendar", label: "Calendar", icon: Calendar },
  { href: "/app/invest", label: "Invest", icon: TrendingUp },
  { href: "/app/tools", label: "Tools", icon: Menu },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur safe-bottom md:relative md:bottom-auto md:border-t-0 md:bg-transparent md:backdrop-blur-none">
      <div className="flex items-center justify-around h-14 md:flex-col md:gap-1 md:h-auto md:py-4 md:justify-start">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/app" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-lg text-muted-foreground transition-colors min-w-[64px] md:min-w-0 md:w-full md:flex-row md:justify-start md:gap-3 md:px-3",
                active && "text-primary bg-primary/10"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="text-xs md:text-sm">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
