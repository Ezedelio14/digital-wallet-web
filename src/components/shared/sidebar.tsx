import { ShieldCheck } from "lucide-react";
import { Logo } from "./logo";
import { NavLinks } from "./nav-links";
import { UserNav } from "./user-nav";
import { Skeleton } from "@/components/ui/skeleton";

export function UserNavFallback() {
  return (
    <div className="flex items-center gap-3 p-2">
      <Skeleton className="size-8 rounded-full" />
      <div className="grid flex-1 gap-1.5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-2.5 w-32" />
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/[0.06] bg-background/80 backdrop-blur-xl lg:flex">
      <div className="flex h-16 items-center px-6">
        <Logo href="/overview" />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[11px] font-medium tracking-wider text-muted-foreground/70 uppercase">
          Menu
        </p>
        <NavLinks />
      </div>

      <div className="mx-3 mb-3 rounded-xl border border-white/[0.06] bg-gradient-to-br from-primary/10 to-transparent p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <ShieldCheck className="size-4 text-success" />
          Ledger de partidas dobradas
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Toda operação gera lançamentos de débito e crédito auditáveis.
        </p>
      </div>

      <div className="border-t border-white/[0.06] p-3">
        <UserNav fallback={<UserNavFallback />} />
      </div>
    </aside>
  );
}
