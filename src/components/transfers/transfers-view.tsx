"use client";

import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useBalance, useHistory } from "@/hooks/use-wallet";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { TransactionList } from "@/components/wallet/transaction-list";
import { ReconcileButton } from "@/components/wallet/reconcile-button";
import { TransferForm } from "./transfer-form";

const FILTERS = [
  { value: "ALL", label: "Todas" },
  { value: "CREDIT", label: "Entradas" },
  { value: "DEBIT", label: "Saídas" },
] as const;

type Filter = (typeof FILTERS)[number]["value"];

export function TransfersView() {
  const history = useHistory();
  const { data: balance } = useBalance();
  const [filter, setFilter] = useState<Filter>("ALL");

  const entries = useMemo(
    () => (filter === "ALL" ? history.data : history.data?.filter((e) => e.type === filter)),
    [history.data, filter],
  );

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Transferências"
        description="Envie dinheiro entre carteiras com transações ACID e chave de idempotência."
        actions={<ReconcileButton currency={balance?.currency} />}
      />

      <div className="grid animate-fade-up items-start gap-6 [animation-delay:60ms] lg:grid-cols-5">
        <Card className="lg:sticky lg:top-8 lg:col-span-2">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <CardHeader>
            <div>
              <CardTitle>Nova transferência</CardTitle>
              <CardDescription>Débito e crédito pareados em uma única transação</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <TransferForm />
            <div className="mt-5 flex gap-2.5 rounded-lg bg-white/[0.02] p-3 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
              Reenvios com a mesma chave retornam a resposta original sem executar a transação
              novamente.
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex-col sm:flex-row sm:items-center">
            <div>
              <CardTitle>Extrato</CardTitle>
              <CardDescription>Últimos 50 lançamentos da sua carteira</CardDescription>
            </div>
            <div
              role="tablist"
              aria-label="Filtrar lançamentos"
              className="flex rounded-lg border border-white/[0.07] bg-white/[0.02] p-0.5"
            >
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  role="tab"
                  aria-selected={filter === f.value}
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    filter === f.value
                      ? "bg-white/[0.08] text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:px-3">
            <TransactionList
              entries={entries}
              isLoading={history.isLoading}
              error={history.error}
              onRetry={() => history.refetch()}
              currency={balance?.currency}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
