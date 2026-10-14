"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { Balance, HistoryEntry, Reconciliation } from "@/types/api";

export const walletKeys = {
  all: ["wallet"] as const,
  balance: () => [...walletKeys.all, "balance"] as const,
  history: () => [...walletKeys.all, "history"] as const,
};

export function useBalance() {
  return useQuery({
    queryKey: walletKeys.balance(),
    queryFn: async () => (await api.get<Balance>("/wallet/balance")).data,
  });
}

export function useHistory() {
  return useQuery({
    queryKey: walletKeys.history(),
    queryFn: async () =>
      (await api.get<{ history: HistoryEntry[] }>("/wallet/history")).data.history,
  });
}

export function useReconcile() {
  return useMutation({
    mutationFn: async () => (await api.get<Reconciliation>("/wallet/reconcile")).data,
  });
}
