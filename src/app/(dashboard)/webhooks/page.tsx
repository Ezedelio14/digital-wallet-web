import type { Metadata } from "next";
import { Protected } from "@/components/shared/auth-guard";
import { WebhooksView } from "@/components/webhooks/webhooks-view";

export const metadata: Metadata = { title: "Webhooks" };

export default function WebhooksPage() {
  return (
    <Protected>
      <WebhooksView />
    </Protected>
  );
}
