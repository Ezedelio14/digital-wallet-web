"use client";

import { useState } from "react";
import { CircleCheck, Scale, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { useReconcile } from "@/hooks/use-wallet";
import { cn, formatCurrency, getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function ReconcileButton({
  currency = "USD",
  variant = "outline",
  className,
}: {
  currency?: string;
  variant?: "outline" | "ghost" | "secondary";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const reconcile = useReconcile();
  const result = reconcile.data;

  function run() {
    reconcile.mutate(undefined, {
      onSuccess: () => setOpen(true),
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  return (
    <>
      <Button variant={variant} onClick={run} loading={reconcile.isPending} className={className}>
        {!reconcile.isPending && <Scale />}
        Reconciliar
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          title="Reconciliação do ledger"
          description="Compara o saldo em cache com a soma exata de todos os lançamentos históricos."
          icon={<Scale />}
        >
          {result && (
            <div className="grid gap-4">
              <div
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-4",
                  result.isBalanced
                    ? "border-success/25 bg-success/[0.07]"
                    : "border-destructive/25 bg-destructive/[0.07]",
                )}
              >
                {result.isBalanced ? (
                  <CircleCheck className="size-6 shrink-0 text-success" />
                ) : (
                  <TriangleAlert className="size-6 shrink-0 text-destructive" />
                )}
                <div>
                  <p className="text-sm font-semibold">
                    {result.isBalanced ? "Ledger íntegro" : "Divergência detectada"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {result.isBalanced
                      ? "Débitos e créditos batem com o saldo da carteira."
                      : "O saldo em cache não corresponde aos lançamentos."}
                  </p>
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-3">
                {[
                  ["Saldo em cache", result.cachedBalance],
                  ["Soma do ledger", result.reconciledLedgerBalance],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="tabular mt-1 text-lg font-semibold">
                      {formatCurrency(value, currency)}
                    </dd>
                  </div>
                ))}
              </dl>

              {!result.isBalanced && (
                <p className="tabular text-center text-xs text-destructive">
                  Diferença:{" "}
                  {formatCurrency(result.cachedBalance - result.reconciledLedgerBalance, currency)}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
