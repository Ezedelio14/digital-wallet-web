"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CircleCheck,
  Clock,
  DollarSign,
  FileText,
  Fingerprint,
  Inbox,
  Mail,
  Plus,
  Receipt,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { useCreateInvoice, useInvoices, usePayInvoice } from "@/hooks/use-invoices";
import { useSession } from "@/hooks/use-auth";
import { invoiceSchema, type InvoiceInput } from "@/lib/validators";
import {
  cn,
  formatCurrency,
  formatDate,
  generateIdempotencyKey,
  getErrorMessage,
  shortId,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState, ErrorState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { CopyButton } from "@/components/shared/copy-button";
import type { Invoice, InvoiceStatus } from "@/types/api";

type Tab = "all" | "payable" | "issued";

const TABS: { value: Tab; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "payable", label: "A pagar" },
  { value: "issued", label: "Emitidas" },
];

const statusBadge: Record<
  InvoiceStatus,
  { label: string; variant: "success" | "warning" | "muted" | "destructive" }
> = {
  PENDING: { label: "Pendente", variant: "warning" },
  PAID: { label: "Paga", variant: "success" },
  CANCELLED: { label: "Cancelada", variant: "muted" },
  OVERDUE: { label: "Vencida", variant: "destructive" },
};

const emptyCopy: Record<Tab, { title: string; description: string }> = {
  all: {
    title: "Nenhuma cobrança ainda",
    description: "Crie uma cobrança e compartilhe o ID para receber pagamentos na sua carteira.",
  },
  payable: {
    title: "Nada a pagar",
    description: "Cobranças emitidas por outras pessoas para você aparecerão aqui.",
  },
  issued: {
    title: "Nenhuma cobrança emitida",
    description: "Emita uma cobrança para receber de qualquer pessoa ou de um e-mail específico.",
  },
};

function counterpart(invoice: Invoice, mine: boolean) {
  if (mine) {
    return invoice.payer?.name ?? invoice.payer?.email ?? invoice.payerEmail ?? "Qualquer pessoa";
  }
  return invoice.creator?.name ?? invoice.creator?.email ?? "Desconhecido";
}

/* ----------------------------- Create dialog ----------------------------- */

function CreateInvoiceDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const createInvoice = useCreateInvoice();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InvoiceInput>({ resolver: zodResolver(invoiceSchema) });

  function onSubmit({ amount, description, payerEmail }: InvoiceInput) {
    createInvoice.mutate(
      {
        amount,
        description: description || undefined,
        payerEmail: payerEmail || undefined,
      },
      {
        onSuccess: (invoice) => {
          toast.success("Cobrança criada", {
            description: `${formatCurrency(invoice.amount)} · ID ${shortId(invoice.id)}`,
          });
          reset();
          setOpen(false);
        },
        onError: (error) => toast.error(getErrorMessage(error, "Falha ao criar cobrança.")),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus /> Nova cobrança
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        title="Nova cobrança"
        description="Gere uma cobrança e compartilhe o ID com quem vai pagar."
        icon={<Receipt />}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
          <Field label="Valor" htmlFor="invoice-amount" error={errors.amount?.message}>
            <Input
              id="invoice-amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="0,00"
              icon={<DollarSign />}
              suffix="USD"
              className="tabular text-base"
              aria-invalid={!!errors.amount}
              autoFocus
              {...register("amount", {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              })}
            />
          </Field>
          <Field
            label="Descrição"
            htmlFor="invoice-description"
            hint="Opcional"
            error={errors.description?.message}
          >
            <Input
              id="invoice-description"
              placeholder="Ex.: Consultoria de outubro"
              maxLength={140}
              icon={<FileText />}
              aria-invalid={!!errors.description}
              {...register("description")}
            />
          </Field>
          <Field
            label="E-mail do pagador"
            htmlFor="invoice-payer"
            hint="Opcional"
            error={errors.payerEmail?.message}
          >
            <Input
              id="invoice-payer"
              type="email"
              placeholder="Qualquer pessoa pode pagar"
              autoComplete="email"
              icon={<Mail />}
              aria-invalid={!!errors.payerEmail}
              {...register("payerEmail")}
            />
          </Field>
          <Button type="submit" size="lg" loading={createInvoice.isPending}>
            Criar cobrança
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------ Pay dialog ------------------------------- */

// Mounted only while the dialog is open, so each opening gets a fresh key
// and retries within the same opening reuse it (the API dedupes them).
function PayInvoiceBody({ invoice, onDone }: { invoice: Invoice; onDone: () => void }) {
  const payInvoice = usePayInvoice();
  const [idempotencyKey] = useState(generateIdempotencyKey);
  const amount = Number(invoice.amount);

  function pay() {
    payInvoice.mutate(
      { id: invoice.id, idempotencyKey },
      {
        onSuccess: () => {
          toast.success("Cobrança paga", {
            description: `${formatCurrency(amount)} enviados para ${counterpart(invoice, false)}.`,
          });
          onDone();
        },
        onError: (error) => toast.error(getErrorMessage(error, "Falha no pagamento.")),
      },
    );
  }

  return (
    <div className="grid gap-5">
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
        <p className="text-[11px] text-muted-foreground">Valor</p>
        <p className="tabular mt-0.5 text-2xl font-semibold tracking-tight">
          {formatCurrency(amount)}
        </p>
        <dl className="mt-4 grid gap-2 text-xs">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Para</dt>
            <dd className="truncate font-medium">{counterpart(invoice, false)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Descrição</dt>
            <dd className="truncate">{invoice.description || "Cobrança sem descrição"}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Cobrança</dt>
            <dd className="font-mono">{shortId(invoice.id)}</dd>
          </div>
        </dl>
      </div>

      <div className="flex items-center gap-2.5 rounded-lg border border-dashed border-white/10 px-3 py-2.5">
        <Fingerprint className="size-4 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-muted-foreground">Idempotency-Key</p>
          <p className="truncate font-mono text-[11px]">{idempotencyKey}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onDone}
          disabled={payInvoice.isPending}
        >
          Cancelar
        </Button>
        <Button className="flex-1" onClick={pay} loading={payInvoice.isPending}>
          Pagar {formatCurrency(amount)}
        </Button>
      </div>
    </div>
  );
}

/* --------------------------------- Rows ---------------------------------- */

function InvoiceRow({
  invoice,
  mine,
  index,
  onPay,
}: {
  invoice: Invoice;
  mine: boolean;
  index: number;
  onPay: (invoice: Invoice) => void;
}) {
  const badge = statusBadge[invoice.status];
  const canPay = !mine && invoice.status === "PENDING";
  const Icon = mine ? ArrowDownLeft : ArrowUpRight;

  return (
    <li
      className="flex animate-fade-up items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.02] sm:gap-4 sm:px-5"
      style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
    >
      <div
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl border [&_svg]:size-4",
          mine
            ? "border-success/20 bg-success/10 text-success"
            : "border-primary/20 bg-primary/10 text-primary",
        )}
        aria-hidden
      >
        <Icon />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {invoice.description || "Cobrança sem descrição"}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          <span className="sr-only">{mine ? "Pagador:" : "Emitida por:"} </span>
          {mine ? "Para " : "De "}
          {counterpart(invoice, mine)}
          <span aria-hidden> · </span>
          <time dateTime={invoice.createdAt}>{formatDate(invoice.createdAt)}</time>
        </p>
        <div className="mt-1.5 flex items-center gap-1 sm:hidden">
          <Badge variant={badge.variant} dot>
            {badge.label}
          </Badge>
        </div>
      </div>

      <div className="hidden sm:block">
        <Badge variant={badge.variant} dot>
          {badge.label}
        </Badge>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-2">
        <p
          className={cn(
            "tabular text-sm font-semibold",
            invoice.status === "CANCELLED" && "text-muted-foreground line-through",
          )}
        >
          {mine ? "+" : "−"}
          {formatCurrency(Number(invoice.amount))}
        </p>
        <div className="flex items-center gap-1">
          {canPay && (
            <Button size="sm" onClick={() => onPay(invoice)}>
              <Send /> Pagar
            </Button>
          )}
          <CopyButton value={invoice.id} label="Copiar ID da cobrança" />
        </div>
      </div>
    </li>
  );
}

/* -------------------------------- Summary -------------------------------- */

function StatCard({
  label,
  value,
  hint,
  icon,
  tone,
  index,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  tone: "warning" | "primary" | "success";
  index: number;
}) {
  return (
    <Card
      className="animate-fade-up p-4 sm:p-5"
      style={{ animationDelay: `${60 + index * 60}ms` }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <span
          className={cn(
            "grid size-7 place-items-center rounded-lg [&_svg]:size-3.5",
            tone === "warning" && "bg-warning/10 text-warning",
            tone === "primary" && "bg-primary/10 text-primary",
            tone === "success" && "bg-success/10 text-success",
          )}
          aria-hidden
        >
          {icon}
        </span>
      </div>
      <p className="tabular mt-2 text-xl font-semibold tracking-tight">{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
    </Card>
  );
}

/* --------------------------------- View ---------------------------------- */

export function InvoicesView() {
  const { data: invoices, isLoading, error, refetch } = useInvoices();
  const user = useSession();
  const userId = user?.id;
  const [tab, setTab] = useState<Tab>("all");
  const [payTarget, setPayTarget] = useState<Invoice | null>(null);

  const { lists, summary } = useMemo(() => {
    const all = invoices ?? [];
    const issued: Invoice[] = [];
    const payable: Invoice[] = [];
    const summary = { receivable: 0, receivableCount: 0, payable: 0, payableCount: 0, received: 0, paid: 0 };

    for (const invoice of all) {
      const amount = Number(invoice.amount);
      if (invoice.creatorId === userId) {
        issued.push(invoice);
        if (invoice.status === "PENDING") {
          summary.receivable += amount;
          summary.receivableCount++;
        } else if (invoice.status === "PAID") summary.received += amount;
      } else {
        payable.push(invoice);
        if (invoice.status === "PENDING") {
          summary.payable += amount;
          summary.payableCount++;
        } else if (invoice.status === "PAID") summary.paid += amount;
      }
    }
    return { lists: { all, issued, payable } satisfies Record<Tab, Invoice[]>, summary };
  }, [invoices, userId]);

  const visible = lists[tab];
  const pendingCount = summary.receivableCount + summary.payableCount;

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Cobranças"
        description={
          invoices
            ? `${invoices.length} ${invoices.length === 1 ? "cobrança" : "cobranças"} · ${pendingCount} ${pendingCount === 1 ? "pendente" : "pendentes"}`
            : "Emita cobranças e pague as que foram enviadas para você."
        }
        actions={<CreateInvoiceDialog />}
      />

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="rounded-2xl border border-white/[0.07] p-4 sm:p-5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-3 h-6 w-28" />
              <Skeleton className="mt-2 h-3 w-16" />
            </div>
          ))}
        </div>
      ) : (
        !error &&
        invoices && (
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              index={0}
              label="A receber"
              value={formatCurrency(summary.receivable)}
              hint={`${summary.receivableCount} ${summary.receivableCount === 1 ? "pendente" : "pendentes"}`}
              icon={<Clock />}
              tone="warning"
            />
            <StatCard
              index={1}
              label="A pagar"
              value={formatCurrency(summary.payable)}
              hint={`${summary.payableCount} ${summary.payableCount === 1 ? "pendente" : "pendentes"}`}
              icon={<ArrowUpRight />}
              tone="primary"
            />
            <StatCard
              index={2}
              label="Recebido"
              value={formatCurrency(summary.received)}
              hint={`Pago: ${formatCurrency(summary.paid)}`}
              icon={<CircleCheck />}
              tone="success"
            />
          </div>
        )
      )}

      <Card className="animate-fade-up overflow-hidden" style={{ animationDelay: "180ms" }}>
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] p-3 sm:px-5">
          <div
            role="tablist"
            aria-label="Filtrar cobranças"
            className="inline-flex rounded-lg border border-white/[0.07] bg-white/[0.02] p-0.5"
          >
            {TABS.map((t) => {
              const selected = tab === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  role="tab"
                  id={`invoices-tab-${t.value}`}
                  aria-selected={selected}
                  aria-controls="invoices-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setTab(t.value)}
                  onKeyDown={(e) => {
                    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                    const i = TABS.findIndex((x) => x.value === tab);
                    const next = TABS[(i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length];
                    setTab(next.value);
                    document.getElementById(`invoices-tab-${next.value}`)?.focus();
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    selected
                      ? "bg-white/[0.08] text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.label}
                  {invoices && (
                    <span className="tabular text-[10px] text-muted-foreground">
                      {lists[t.value].length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div id="invoices-panel" role="tabpanel" aria-labelledby={`invoices-tab-${tab}`}>
          {isLoading ? (
            <ul className="divide-y divide-white/[0.05]" aria-busy>
              {Array.from({ length: 5 }, (_, i) => (
                <li key={i} className="flex items-center gap-3 px-4 py-3.5 sm:gap-4 sm:px-5">
                  <Skeleton className="size-10 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="mt-2 h-3 w-28" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </li>
              ))}
            </ul>
          ) : error ? (
            <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
          ) : !visible.length ? (
            <EmptyState
              icon={tab === "payable" ? <Inbox /> : <Receipt />}
              title={emptyCopy[tab].title}
              description={emptyCopy[tab].description}
              action={
                tab !== "payable" ? (
                  <CreateInvoiceDialog
                    trigger={
                      <Button variant="outline" size="sm">
                        <Plus /> Nova cobrança
                      </Button>
                    }
                  />
                ) : undefined
              }
            />
          ) : (
            <ul className="divide-y divide-white/[0.05]">
              {visible.map((invoice, index) => (
                <InvoiceRow
                  key={invoice.id}
                  invoice={invoice}
                  mine={invoice.creatorId === userId}
                  index={index}
                  onPay={setPayTarget}
                />
              ))}
            </ul>
          )}
        </div>
      </Card>

      <Dialog open={payTarget != null} onOpenChange={(open) => !open && setPayTarget(null)}>
        {payTarget && (
          <DialogContent
            title="Pagar cobrança"
            description="O valor será debitado do saldo da sua carteira."
            icon={<Receipt />}
          >
            <PayInvoiceBody
              key={payTarget.id}
              invoice={payTarget}
              onDone={() => setPayTarget(null)}
            />
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
