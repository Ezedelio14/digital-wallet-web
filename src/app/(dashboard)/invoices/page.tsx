import type { Metadata } from "next";
import { Protected } from "@/components/shared/auth-guard";
import { InvoicesView } from "@/components/invoices/invoices-view";

export const metadata: Metadata = { title: "Cobranças" };

export default function InvoicesPage() {
  return (
    <Protected>
      <InvoicesView />
    </Protected>
  );
}
