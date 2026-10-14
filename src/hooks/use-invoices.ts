"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { walletKeys } from "./use-wallet";
import type { CreateInvoicePayload, Invoice, PayInvoiceResult } from "@/types/api";

const invoiceKeys = { all: ["invoices"] as const };

export function useInvoices() {
  return useQuery({
    queryKey: invoiceKeys.all,
    queryFn: async () => (await api.get<{ invoices: Invoice[] }>("/invoices")).data.invoices,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateInvoicePayload) =>
      (await api.post<Invoice>("/invoices", payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: invoiceKeys.all }),
  });
}

export function usePayInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, idempotencyKey }: { id: string; idempotencyKey: string }) =>
      (await api.post<PayInvoiceResult>(`/invoices/${id}/pay`, null, { idempotencyKey })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}
