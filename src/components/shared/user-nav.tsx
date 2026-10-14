"use client";

import { ChevronsUpDown, Copy, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useLogout, useSession } from "@/hooks/use-auth";
import { cn, initials } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Avatar({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary/80 to-[oklch(0.7_0.14_200)] text-[11px] font-semibold text-white ring-2 ring-white/10",
        className,
      )}
    >
      {initials(label)}
    </span>
  );
}

export function UserNav({
  compact = false,
  fallback = null,
}: {
  compact?: boolean;
  fallback?: React.ReactNode;
}) {
  const user = useSession();
  const logout = useLogout();

  if (!user) return fallback;
  const displayName = user.name ?? user.email.split("@")[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex w-full items-center gap-3 rounded-xl p-2 text-left outline-none transition-colors hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-ring",
          compact && "w-auto p-1",
        )}
      >
        <Avatar label={user.name ?? user.email} />
        {!compact && (
          <>
            <span className="grid min-w-0 flex-1 leading-tight">
              <span className="truncate text-sm font-medium capitalize">{displayName}</span>
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            </span>
            <ChevronsUpDown className="size-4 text-muted-foreground" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={compact ? "end" : "start"} side={compact ? "bottom" : "top"}>
        <DropdownMenuLabel>
          <p className="text-sm font-medium capitalize">{displayName}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            navigator.clipboard.writeText(user.id);
            toast.success("ID de usuário copiado");
          }}
        >
          <Copy /> Copiar ID de usuário
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={logout}
          className="text-destructive data-[highlighted]:bg-destructive/10 [&_svg]:text-destructive"
        >
          <LogOut /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
