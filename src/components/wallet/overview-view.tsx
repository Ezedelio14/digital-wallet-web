"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowRight, ArrowUpRight, CreditCard, Plus } from "lucide-react";
import { useBalance, useHistory } from "@/hooks/use-wallet";
import { useCards } from "@/hooks/use-cards";
import { useSession } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BalanceCard } from "./balance-card";
import { BalanceChart } from "./balance-chart";
import { TransactionList } from "./transaction-list";
import { balanceSeries, totals } from "./transaction-meta";
import { VirtualCard } from "@/components/cards/virtual-card";
import { IssueCardDialog } from "@/components/cards/issue-card-dialog";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function StatCard({
  label,
  value,
  icon,
  tone,
  loading,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: "success" | "muted";
  loading: boolean;
}) {
  return (
    <Card className="flex-1">
      <CardContent className="flex items-center gap-4">
        <span
          className={
            tone === "success"
              ? "grid size-11 place-items-center rounded-xl border border-success/20 bg-success/10 text-success"
              : "grid size-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-muted-foreground"
          }
        >
          {icon}
        </span>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="mt-1.5 h-6 w-24" />
          ) : (
            <p className="tabular mt-0.5 text-xl font-semibold tracking-tight">{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function OverviewView() {
  const user = useSession();
  const balance = useBalance();
  const history = useHistory();
  const cards = useCards();

  const currency = balance.data?.currency ?? "USD";
  const series = useMemo(
    () => (history.data && balance.data ? balanceSeries(history.data, balance.data.balance) : []),
    [history.data, balance.data],
  );
  const flow = useMemo(() => totals(history.data ?? []), [history.data]);
  const featuredCard = cards.data?.find((c) => c.status !== "CANCELLED");
  const firstName = (user?.name ?? user?.email.split("@")[0] ?? "").split(" ")[0];

  return (
    <div className="grid gap-6">
      <div className="animate-fade-up">
        <p className="text-sm text-muted-foreground">{greeting()},</p>
        <h1 className="text-2xl font-semibold tracking-tight capitalize sm:text-[28px]">
          {firstName} <span className="inline-block">👋</span>
        </h1>
      </div>

      <div className="grid animate-fade-up gap-5 [animation-delay:60ms] lg:grid-cols-5">
        <div className="lg:col-span-3">
          <BalanceCard />
        </div>
        <div className="flex flex-col gap-5 sm:flex-row lg:col-span-2 lg:flex-col">
          <StatCard
            label="Entradas"
            value={formatCurrency(flow.inflow, currency)}
            icon={<ArrowDownLeft className="size-5" />}
            tone="success"
            loading={history.isLoading}
          />
          <StatCard
            label="Saídas"
            value={formatCurrency(flow.outflow, currency)}
            icon={<ArrowUpRight className="size-5" />}
            tone="muted"
            loading={history.isLoading}
          />
        </div>
      </div>

      <div className="grid animate-fade-up gap-5 [animation-delay:120ms] lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <div>
              <CardTitle>Evolução do saldo</CardTitle>
              <CardDescription>Reconstruída a partir dos lançamentos do ledger</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            {history.isLoading || balance.isLoading ? (
              <Skeleton className="h-[180px] w-full rounded-xl" />
            ) : (
              <BalanceChart points={series} currency={currency} />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Seu cartão</CardTitle>
              <CardDescription>Débito virtual vinculado à carteira</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/cards">
                Todos <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {cards.isLoading ? (
              <Skeleton className="aspect-[1.586] w-full rounded-2xl" />
            ) : featuredCard ? (
              <VirtualCard
                last4={featuredCard.cardNumberLast4}
                holder={user?.name ?? user?.email.split("@")[0] ?? ""}
                expiryMonth={featuredCard.expiryMonth}
                expiryYear={featuredCard.expiryYear}
                status={featuredCard.status}
                dailyLimit={featuredCard.dailyLimit != null ? Number(featuredCard.dailyLimit) : null}
              />
            ) : (
              <IssueCardDialog
                trigger={
                  <button className="group grid aspect-[1.586] w-full place-items-center rounded-2xl border border-dashed border-white/15 transition-colors hover:border-primary/50 hover:bg-primary/[0.04]">
                    <span className="grid justify-items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground">
                      <span className="grid size-10 place-items-center rounded-full bg-white/[0.05] group-hover:bg-primary/15 group-hover:text-primary">
                        <Plus className="size-5" />
                      </span>
                      Emitir primeiro cartão
                    </span>
                  </button>
                }
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="animate-fade-up [animation-delay:180ms]">
        <CardHeader>
          <div>
            <CardTitle>Atividade recente</CardTitle>
            <CardDescription>Últimos lançamentos de débito e crédito</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/transfers">
              Ver extrato <ArrowRight />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="px-2 sm:px-3">
          <TransactionList
            entries={history.data}
            isLoading={history.isLoading}
            error={history.error}
            onRetry={() => history.refetch()}
            currency={currency}
            limit={6}
          />
        </CardContent>
      </Card>

      {!featuredCard && !cards.isLoading && (
        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <CreditCard className="size-3.5" /> Cartões virtuais são emitidos instantaneamente.
        </p>
      )}
    </div>
  );
}
