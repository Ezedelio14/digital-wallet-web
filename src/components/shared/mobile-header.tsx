"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { NavLinks } from "./nav-links";
import { UserNav } from "./user-nav";
import { Skeleton } from "@/components/ui/skeleton";

export function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.06] bg-background/70 px-4 backdrop-blur-xl lg:hidden">
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Trigger className="-ml-1 rounded-lg p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground">
          <Menu className="size-5" />
          <span className="sr-only">Abrir menu</span>
        </DialogPrimitive.Trigger>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm data-[state=open]:animate-fade-in" />
          <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-background p-4 shadow-2xl outline-none data-[state=open]:animate-slide-in">
            <DialogPrimitive.Title className="sr-only">Navegação</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Links para as seções da carteira
            </DialogPrimitive.Description>
            <div className="mb-6 flex items-center justify-between px-2 pt-1">
              <Logo href="/overview" />
              <DialogPrimitive.Close className="rounded-md p-1.5 text-muted-foreground hover:bg-white/5">
                <X className="size-4" />
                <span className="sr-only">Fechar</span>
              </DialogPrimitive.Close>
            </div>
            <div className="px-3">
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <Logo href="/overview" />

      <UserNav compact fallback={<Skeleton className="size-8 rounded-full" />} />
    </header>
  );
}
