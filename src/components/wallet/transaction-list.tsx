"use client";

import { memo } from "react";
import { Inbox } from "lucide-react";
import { cn, formatCurrency, formatDate, shortId } from "@/lib/utils";
import { EmptyState, ErrorState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { TxIcon, txTitle } from "./transaction-meta";
import type { HistoryEntry } from "@/types/api";

const TransactionRow = memo(function TransactionRow({
  entry,
  currency,
}: {
  entry: HistoryEntry;
  currency: string;
}) {
  const credit = entry.type === "CREDIT";

  return (
    <li className="flex items-center gap-3.5 rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.025]">
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl border",
          credit
            ? "border-success/20 bg-success/10 text-success"
            : "border-white/10 bg-white/[0.04] text-muted-foreground",
        )}
      >
        <TxIcon entry={entry} className="size-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{txTitle(entry)}</p>
        <p className="truncate font-mono text-[11px] text-muted-foreground">
          {formatDate(entry.date)} · tx {shortId(entry.transactionId, 6)}
        </p>
      </div>
      <div className="text-right">
        <p
          className={cn(
            "tabular text-sm font-semibold",
            credit ? "text-success" : "text-foreground",
          )}
        >
          {credit ? "+" : "−"}
          {formatCurrency(entry.amount, currency)}
        </p>
        <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
          {credit ? "Crédito" : "Débito"}
        </p>
      </div>
    </li>
  );
});

export function TransactionList({
  entries,
  isLoading,
  error,
  onRetry,
  currency = "USD",
  limit,
}: {
  entries?: HistoryEntry[];
  isLoading: boolean;
  error?: unknown;
  onRetry?: () => void;
  currency?: string;
  limit?: number;
}) {
  if (isLoading) {
    return (
      <ul className="grid gap-1">
        {Array.from({ length: limit ?? 6 }, (_, i) => (
          <li key={i} className="flex items-center gap-3.5 px-3 py-3">
            <Skeleton className="size-10 rounded-xl" />
            <div className="grid flex-1 gap-2">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-2.5 w-28" />
            </div>
            <Skeleton className="h-4 w-20" />
          </li>
        ))}
      </ul>
    );
  }

  if (error) return <ErrorState message="Não foi possível carregar o extrato." onRetry={onRetry} />;

  if (!entries?.length) {
    return (
      <EmptyState
        icon={<Inbox />}
        title="Nenhuma movimentação ainda"
        description="Transferências e pagamentos aparecerão aqui como lançamentos do ledger."
      />
    );
  }

  return (
    <ul className="grid gap-0.5">
      {entries.slice(0, limit).map((entry) => (
        <TransactionRow key={entry.id} entry={entry} currency={currency} />
      ))}
    </ul>
  );
}
