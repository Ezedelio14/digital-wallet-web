"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { walletKeys } from "./use-wallet";
import type { TransferPayload, TransferResult } from "@/types/api";

export function useTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      idempotencyKey,
      ...payload
    }: TransferPayload & { idempotencyKey: string }) =>
      (await api.post<TransferResult>("/transfers", payload, { idempotencyKey })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: walletKeys.all }),
  });
}
