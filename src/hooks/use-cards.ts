"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { Card, CardStatus } from "@/types/api";

const cardKeys = { all: ["cards"] as const };

export function useCards() {
  return useQuery({
    queryKey: cardKeys.all,
    queryFn: async () => (await api.get<{ cards: Card[] }>("/cards")).data.cards,
  });
}

export function useCreateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dailyLimit?: number) =>
      (await api.post<Card>("/cards", dailyLimit ? { dailyLimit } : {})).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cardKeys.all }),
  });
}

export function useUpdateCardStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: CardStatus }) =>
      (await api.patch<Card>(`/cards/${id}/status`, { status })).data,
    // Optimistic update so freeze/unfreeze feels instant.
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: cardKeys.all });
      const previous = queryClient.getQueryData<Card[]>(cardKeys.all);
      queryClient.setQueryData<Card[]>(cardKeys.all, (cards) =>
        cards?.map((card) => (card.id === id ? { ...card, status } : card)),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      queryClient.setQueryData(cardKeys.all, context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: cardKeys.all }),
  });
}
