import type { Metadata } from "next";
import { Protected } from "@/components/shared/auth-guard";
import { OverviewView } from "@/components/wallet/overview-view";

export const metadata: Metadata = { title: "Visão geral" };

export default function OverviewPage() {
  return (
    <Protected>
      <OverviewView />
    </Protected>
  );
}
