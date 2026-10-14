import type { Metadata } from "next";
import { Protected } from "@/components/shared/auth-guard";
import { CardsView } from "@/components/cards/cards-view";

export const metadata: Metadata = { title: "Cartões" };

export default function CardsPage() {
  return (
    <Protected>
      <CardsView />
    </Protected>
  );
}
