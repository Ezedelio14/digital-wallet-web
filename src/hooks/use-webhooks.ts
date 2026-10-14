"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { WebhookDelivery, WebhookEndpoint } from "@/types/api";

const webhookKeys = { deliveries: ["webhooks", "deliveries"] as const };

export function useWebhookDeliveries() {
  return useQuery({
    queryKey: webhookKeys.deliveries,
    queryFn: async () => (await api.get<WebhookDelivery[]>("/webhooks/deliveries")).data,
    refetchInterval: 15_000,
  });
}

export function useCreateWebhookEndpoint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (url: string) =>
      (await api.post<WebhookEndpoint>("/webhooks/endpoints", { url })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: webhookKeys.deliveries }),
  });
}
