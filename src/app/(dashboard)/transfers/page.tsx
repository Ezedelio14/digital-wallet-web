import type { Metadata } from "next";
import { Protected } from "@/components/shared/auth-guard";
import { TransfersView } from "@/components/transfers/transfers-view";

export const metadata: Metadata = { title: "Transferências" };

export default function TransfersPage() {
  return (
    <Protected>
      <TransfersView />
    </Protected>
  );
}
