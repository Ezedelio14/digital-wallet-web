"use client";

import { useState } from "react";
import { Ban, CreditCard, Snowflake, Sun } from "lucide-react";
import { toast } from "sonner";
import { useCards, useUpdateCardStatus } from "@/hooks/use-cards";
import { useSession } from "@/hooks/use-auth";
import { formatDate, getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EmptyState, ErrorState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { VirtualCard } from "./virtual-card";
import { IssueCardDialog } from "./issue-card-dialog";
import type { Card, CardStatus } from "@/types/api";

const statusBadge: Record<CardStatus, { label: string; variant: "success" | "warning" | "muted" }> = {
  ACTIVE: { label: "Ativo", variant: "success" },
  BLOCKED: { label: "Congelado", variant: "warning" },
  CANCELLED: { label: "Cancelado", variant: "muted" },
};

function CardItem({ card, index, holder }: { card: Card; index: number; holder: string }) {
  const updateStatus = useUpdateCardStatus();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const badge = statusBadge[card.status];

  function setStatus(status: CardStatus) {
    updateStatus.mutate(
      { id: card.id, status },
      {
        onSuccess: () =>
          toast.success(
            status === "ACTIVE"
              ? "Cartão descongelado"
              : status === "BLOCKED"
                ? "Cartão congelado"
                : "Cartão cancelado",
          ),
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  return (
    <div
      className="group animate-fade-up rounded-2xl border border-white/[0.07] bg-card/50 p-4 transition-colors hover:border-white/[0.12]"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <VirtualCard
        last4={card.cardNumberLast4}
        holder={holder}
        expiryMonth={card.expiryMonth}
        expiryYear={card.expiryYear}
        status={card.status}
        dailyLimit={card.dailyLimit != null ? Number(card.dailyLimit) : null}
        theme={index}
        className="group-hover:-translate-y-1"
      />

      <div className="mt-4 flex items-center justify-between px-1">
        <div>
          <p className="text-sm font-medium">Final {card.cardNumberLast4}</p>
          <p className="text-xs text-muted-foreground">Emitido em {formatDate(card.createdAt)}</p>
        </div>
        <Badge variant={badge.variant} dot>
          {badge.label}
        </Badge>
      </div>

      {card.status !== "CANCELLED" && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {card.status === "ACTIVE" ? (
            <Button variant="outline" size="sm" onClick={() => setStatus("BLOCKED")}>
              <Snowflake /> Congelar
            </Button>
          ) : (
            <Button variant="success" size="sm" onClick={() => setStatus("ACTIVE")}>
              <Sun /> Descongelar
            </Button>
          )}
          <Button variant="destructive" size="sm" onClick={() => setConfirmCancel(true)}>
            <Ban /> Cancelar
          </Button>
        </div>
      )}

      <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <DialogContent
          title="Cancelar cartão?"
          description={`O cartão final ${card.cardNumberLast4} será cancelado permanentemente. Esta ação não pode ser desfeita.`}
          icon={<Ban />}
        >
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setConfirmCancel(false)}>
              Manter cartão
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => {
                setStatus("CANCELLED");
                setConfirmCancel(false);
              }}
            >
              Cancelar cartão
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function CardsView() {
  const { data: cards, isLoading, error, refetch } = useCards();
  const user = useSession();
  const holder = user?.name ?? user?.email.split("@")[0] ?? "Titular";

  const active = cards?.filter((c) => c.status === "ACTIVE").length ?? 0;

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Cartões virtuais"
        description={
          cards
            ? `${cards.length} ${cards.length === 1 ? "cartão" : "cartões"} · ${active} ${active === 1 ? "ativo" : "ativos"}`
            : "Emita, congele e cancele cartões instantaneamente."
        }
        actions={<IssueCardDialog />}
      />

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="rounded-2xl border border-white/[0.07] p-4">
              <Skeleton className="aspect-[1.586] w-full rounded-2xl" />
              <Skeleton className="mt-4 h-4 w-24" />
              <Skeleton className="mt-2 h-3 w-36" />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : !cards?.length ? (
        <div className="rounded-2xl border border-dashed border-white/10">
          <EmptyState
            icon={<CreditCard />}
            title="Você ainda não tem cartões"
            description="Emita um cartão virtual de débito vinculado ao saldo da sua carteira em segundos."
            action={<IssueCardDialog />}
          />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((card, index) => (
            <CardItem key={card.id} card={card} index={index} holder={holder} />
          ))}
        </div>
      )}
    </div>
  );
}
