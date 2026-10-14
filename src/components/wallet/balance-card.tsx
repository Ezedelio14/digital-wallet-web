"use client";

import { useState } from "react";
import { Eye, EyeOff, Send } from "lucide-react";
import { useBalance } from "@/hooks/use-wallet";
import { formatCurrency, shortId } from "@/lib/utils";
import { CopyButton } from "@/components/shared/copy-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TransferDialog } from "@/components/transfers/transfer-dialog";
import { ReconcileButton } from "./reconcile-button";

export function BalanceCard() {
  const { data, isLoading } = useBalance();
  const [hidden, setHidden] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 p-6 sm:p-7">
      {/* Layered aurora background */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,oklch(0.45_0.2_285)_0%,oklch(0.22_0.08_280)_45%,oklch(0.16_0.03_270)_100%)]" />
      <div className="absolute -top-24 -right-16 size-72 rounded-full bg-[oklch(0.7_0.15_200)] opacity-25 blur-3xl" />
      <div className="absolute inset-0 bg-grid opacity-60" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-white/70">
            Saldo disponível
            <button
              onClick={() => setHidden((v) => !v)}
              className="rounded-md p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-label={hidden ? "Mostrar saldo" : "Ocultar saldo"}
            >
              {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-white/90">
            {data?.currency ?? "USD"}
          </span>
        </div>

        <div className="mt-3 h-12 sm:h-14">
          {isLoading ? (
            <Skeleton className="h-full w-56 bg-white/10" />
          ) : (
            <p className="tabular animate-fade-in text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {hidden ? "••••••" : formatCurrency(data?.balance ?? 0, data?.currency)}
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center gap-1 text-xs text-white/60">
          <span>Wallet ID</span>
          <span className="font-mono text-white/80">
            {data ? shortId(data.walletId, 8) : "—"}
          </span>
          {data && (
            <CopyButton
              value={data.walletId}
              label="Copiar Wallet ID"
              className="text-white/60 hover:bg-white/10 hover:text-white"
            />
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <TransferDialog
            trigger={
              <Button className="bg-white from-white to-white text-[oklch(0.25_0.08_285)] shadow-lg shadow-black/20 hover:brightness-95">
                <Send /> Transferir
              </Button>
            }
          />
          <ReconcileButton
            currency={data?.currency}
            variant="outline"
            className="border-white/20 bg-white/10 text-white hover:bg-white/15"
          />
        </div>
      </div>
    </div>
  );
}
