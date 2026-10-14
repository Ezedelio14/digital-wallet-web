import { ArrowDownLeft, ArrowUpRight, CreditCard, Landmark, Receipt } from "lucide-react";
import type { HistoryEntry, TxType } from "@/types/api";

export const txLabels: Record<TxType, string> = {
  DEPOSIT: "Depósito",
  TRANSFER: "Transferência",
  WITHDRAWAL: "Saque",
  INVOICE_PAYMENT: "Pagamento de cobrança",
  CARD_PURCHASE: "Compra no cartão",
};

export function TxIcon({ entry, className }: { entry: HistoryEntry; className?: string }) {
  switch (entry.transactionType) {
    case "INVOICE_PAYMENT":
      return <Receipt className={className} />;
    case "CARD_PURCHASE":
      return <CreditCard className={className} />;
    case "DEPOSIT":
    case "WITHDRAWAL":
      return <Landmark className={className} />;
    default:
      return entry.type === "CREDIT" ? (
        <ArrowDownLeft className={className} />
      ) : (
        <ArrowUpRight className={className} />
      );
  }
}

export function txTitle(entry: HistoryEntry) {
  if (entry.transactionType === "TRANSFER") {
    return entry.type === "CREDIT" ? "Transferência recebida" : "Transferência enviada";
  }
  if (entry.transactionType === "INVOICE_PAYMENT") {
    return entry.type === "CREDIT" ? "Cobrança recebida" : "Cobrança paga";
  }
  return txLabels[entry.transactionType];
}

/** Rebuilds the balance over time by walking the (newest-first) ledger backwards. */
export function balanceSeries(history: HistoryEntry[], currentBalance: number) {
  let running = currentBalance;
  const points = history.map((entry) => {
    const point = { date: entry.date, value: running };
    running -= entry.type === "CREDIT" ? entry.amount : -entry.amount;
    return point;
  });
  points.push({ date: history.at(-1)?.date ?? new Date().toISOString(), value: running });
  return points.reverse();
}

export function totals(history: HistoryEntry[]) {
  return history.reduce(
    (acc, entry) => {
      if (entry.type === "CREDIT") acc.inflow += entry.amount;
      else acc.outflow += entry.amount;
      return acc;
    },
    { inflow: 0, outflow: 0 },
  );
}
