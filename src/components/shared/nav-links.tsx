"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight, CreditCard, LayoutDashboard, Receipt, Webhook } from "lucide-react";
import { cn } from "@/lib/utils";

export const navItems = [
  { href: "/overview", label: "Visão geral", icon: LayoutDashboard },
  { href: "/transfers", label: "Transferências", icon: ArrowLeftRight },
  { href: "/cards", label: "Cartões", icon: CreditCard },
  { href: "/invoices", label: "Cobranças", icon: Receipt },
  { href: "/webhooks", label: "Webhooks", icon: Webhook },
] as const;

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="grid gap-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-white/[0.06] text-foreground"
                : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground",
            )}
          >
            {active && (
              <span className="absolute top-1/2 -left-3 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_12px_oklch(0.7_0.18_285)]" />
            )}
            <Icon
              className={cn(
                "size-[18px] transition-colors",
                active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
              )}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
