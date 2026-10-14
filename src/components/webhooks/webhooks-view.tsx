"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  ChevronRight,
  CircleCheck,
  CircleX,
  Globe,
  Inbox,
  KeyRound,
  Lock,
  TriangleAlert,
  Webhook,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useCreateWebhookEndpoint, useWebhookDeliveries } from "@/hooks/use-webhooks";
import { webhookSchema, type WebhookInput } from "@/lib/validators";
import { cn, formatDate, formatRelative, getErrorMessage, shortId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { CopyButton } from "@/components/shared/copy-button";
import type { WebhookDelivery, WebhookEndpoint } from "@/types/api";

const SUPPORTED_EVENTS = ["TRANSFER_COMPLETED", "INVOICE_PAID"] as const;

const VERIFY_SNIPPET = `import crypto from "node:crypto";

function verifySignature(rawBody, signature, secret) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature ?? "", "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Express: use express.raw({ type: "application/json" })
app.post("/webhooks", (req, res) => {
  const signature = req.header("X-Wallet-Signature");
  if (!verifySignature(req.body, signature, process.env.WALLET_WEBHOOK_SECRET)) {
    return res.status(401).end();
  }
  const { event, payload } = JSON.parse(req.body.toString());
  // ...
  res.sendStatus(200);
});`;

/** Very small token highlighter for the snippet (strings, comments, keywords). */
function highlight(code: string) {
  const pattern =
    /(\/\/.*$)|("(?:[^"\\]|\\.)*")|\b(import|from|function|const|return|if|let)\b|\b(crypto|Buffer|JSON|process)\b/gm;
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = pattern.exec(code))) {
    if (match.index > last) nodes.push(code.slice(last, match.index));
    const [text, comment, str, keyword] = match;
    const className = comment
      ? "text-muted-foreground/60 italic"
      : str
        ? "text-success"
        : keyword
          ? "text-primary"
          : "text-warning";
    nodes.push(
      <span key={key++} className={className}>
        {text}
      </span>,
    );
    last = match.index + text.length;
  }
  if (last < code.length) nodes.push(code.slice(last));
  return nodes;
}

const statusMeta: Record<
  WebhookDelivery["status"],
  { label: string; variant: "success" | "destructive"; icon: React.ReactNode; tone: string }
> = {
  SUCCESS: {
    label: "Entregue",
    variant: "success",
    icon: <CircleCheck />,
    tone: "border-success/20 bg-success/10 text-success",
  },
  FAILED: {
    label: "Falhou",
    variant: "destructive",
    icon: <CircleX />,
    tone: "border-destructive/20 bg-destructive/10 text-destructive",
  },
};

function responseTone(code: number | null) {
  if (code == null) return "border-white/10 bg-white/[0.04] text-muted-foreground";
  if (code >= 200 && code < 300) return "border-success/25 bg-success/10 text-success";
  if (code >= 400 && code < 500) return "border-warning/25 bg-warning/10 text-warning";
  return "border-destructive/25 bg-destructive/10 text-destructive";
}

/* -------------------------------------------------------------------------- */
/*                               Register form                                */
/* -------------------------------------------------------------------------- */

function SecretPanel({ endpoint }: { endpoint: WebhookEndpoint }) {
  return (
    <div
      role="status"
      className="animate-fade-up rounded-xl border border-warning/25 bg-warning/[0.06] p-4"
    >
      <div className="flex items-start gap-3">
        <div className="grid size-8 shrink-0 place-items-center rounded-lg border border-warning/25 bg-warning/10 text-warning [&_svg]:size-4">
          <TriangleAlert />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-warning">Endpoint registrado</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            Guarde este segredo — ele não será exibido novamente.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            <KeyRound className="size-3" /> Segredo de assinatura
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-warning/20 bg-black/30 py-1.5 pr-1.5 pl-3">
            <code className="min-w-0 flex-1 font-mono text-xs break-all text-foreground select-all">
              {endpoint.secret}
            </code>
            <CopyButton value={endpoint.secret} label="Copiar segredo" className="shrink-0" />
          </div>
        </div>

        <dl className="grid gap-2 text-xs">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">URL</dt>
            <dd className="min-w-0 truncate font-mono" title={endpoint.url}>
              {endpoint.url}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">ID</dt>
            <dd className="flex items-center gap-1 font-mono">
              <span title={endpoint.id}>{shortId(endpoint.id)}</span>
              <CopyButton value={endpoint.id} label="Copiar ID do endpoint" className="size-6" />
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Criado em</dt>
            <dd>{formatDate(endpoint.createdAt)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function RegisterEndpointCard() {
  const createEndpoint = useCreateWebhookEndpoint();
  const [created, setCreated] = useState<WebhookEndpoint | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WebhookInput>({ resolver: zodResolver(webhookSchema) });

  function onSubmit({ url }: WebhookInput) {
    createEndpoint.mutate(url, {
      onSuccess: (endpoint) => {
        toast.success("Endpoint registrado", { description: endpoint.url });
        setCreated(endpoint);
        reset();
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  return (
    <Card className="animate-fade-up" style={{ animationDelay: "60ms" }}>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary [&_svg]:size-4">
            <Webhook />
          </div>
          <div>
            <CardTitle>Registrar endpoint</CardTitle>
            <CardDescription>
              Receba eventos da sua carteira via HTTP POST assinado.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
          <Field label="URL do endpoint" htmlFor="webhook-url" error={errors.url?.message}>
            <Input
              id="webhook-url"
              type="url"
              inputMode="url"
              autoComplete="url"
              spellCheck={false}
              placeholder="https://api.suaempresa.com/webhooks"
              icon={<Globe />}
              className="font-mono text-[13px]"
              aria-invalid={!!errors.url}
              {...register("url")}
            />
          </Field>
          <Button type="submit" loading={createEndpoint.isPending}>
            <Zap /> Registrar endpoint
          </Button>
        </form>

        {created && <SecretPanel key={created.id} endpoint={created} />}
      </CardContent>
    </Card>
  );
}

function VerifyCard() {
  return (
    <Card className="animate-fade-up" style={{ animationDelay: "120ms" }}>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-muted-foreground [&_svg]:size-4">
            <Lock />
          </div>
          <div>
            <CardTitle>Verificando assinaturas</CardTitle>
            <CardDescription>
              Cada requisição inclui o header{" "}
              <code className="font-mono text-foreground/80">X-Wallet-Signature</code> — um
              HMAC-SHA256 do corpo bruto com o seu segredo.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-black/40">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-1.5">
            <span className="font-mono text-[11px] text-muted-foreground">verify.js · Node.js</span>
            <CopyButton value={VERIFY_SNIPPET} label="Copiar código" />
          </div>
          <pre className="max-h-80 overflow-auto p-4 font-mono text-xs leading-relaxed text-foreground/90">
            <code>{highlight(VERIFY_SNIPPET)}</code>
          </pre>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            Eventos suportados
          </p>
          <ul className="flex flex-wrap gap-2">
            {SUPPORTED_EVENTS.map((event) => (
              <li key={event}>
                <Badge variant="default" className="font-mono">
                  <Zap /> {event}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Deliveries log                               */
/* -------------------------------------------------------------------------- */

function DeliveryRow({ delivery, index }: { delivery: WebhookDelivery; index: number }) {
  const [open, setOpen] = useState(false);
  const meta = statusMeta[delivery.status];
  const panelId = `delivery-${delivery.id}`;

  return (
    <li
      className="animate-fade-up border-b border-white/[0.05] last:border-b-0"
      style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors outline-none hover:bg-white/[0.03] focus-visible:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:px-6"
      >
        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-lg border [&_svg]:size-4",
            meta.tone,
          )}
          aria-hidden
        >
          {meta.icon}
        </span>

        <span className="grid min-w-0 flex-1 gap-0.5">
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate font-mono text-[13px] font-medium">
              {delivery.payload?.event ?? "—"}
            </span>
            <Badge variant={meta.variant} className="hidden sm:inline-flex">
              {meta.label}
            </Badge>
            <span className="sr-only sm:hidden">{meta.label}</span>
          </span>
          <span
            className="truncate text-xs text-muted-foreground"
            title={delivery.webhookEndpoint?.url}
          >
            {delivery.webhookEndpoint?.url}
          </span>
        </span>

        <span className="flex shrink-0 flex-col items-end gap-1">
          <span
            className={cn(
              "rounded-md border px-1.5 py-0.5 font-mono text-[11px] tabular-nums",
              responseTone(delivery.responseCode),
            )}
            title="Código de resposta HTTP"
          >
            {delivery.responseCode ?? "—"}
          </span>
          <time
            dateTime={delivery.createdAt}
            title={formatDate(delivery.createdAt)}
            className="text-[11px] whitespace-nowrap text-muted-foreground"
          >
            {formatRelative(delivery.createdAt)}
          </time>
        </span>

        <ChevronRight
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-90",
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div id={panelId} className="animate-fade-in px-4 pb-4 sm:px-6">
          <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-black/40">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-1.5">
              <span className="font-mono text-[11px] text-muted-foreground">
                payload.json · {shortId(delivery.id)}
              </span>
              <CopyButton
                value={JSON.stringify(delivery.payload, null, 2)}
                label="Copiar payload"
              />
            </div>
            <pre className="max-h-72 overflow-auto p-4 font-mono text-xs leading-relaxed text-foreground/90">
              {JSON.stringify(delivery.payload, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </li>
  );
}

function DeliveriesSkeleton() {
  return (
    <ul aria-hidden>
      {Array.from({ length: 6 }, (_, i) => (
        <li
          key={i}
          className="flex items-center gap-3 border-b border-white/[0.05] px-4 py-3 last:border-b-0 sm:px-6"
        >
          <Skeleton className="size-8 rounded-lg" />
          <div className="grid flex-1 gap-1.5">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-56 max-w-full" />
          </div>
          <div className="grid justify-items-end gap-1.5">
            <Skeleton className="h-4 w-9" />
            <Skeleton className="h-3 w-14" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function DeliveriesCard() {
  const { data: deliveries, isLoading, error, refetch, isFetching } = useWebhookDeliveries();
  const success = deliveries?.filter((d) => d.status === "SUCCESS").length ?? 0;
  const failed = deliveries?.filter((d) => d.status === "FAILED").length ?? 0;

  return (
    <Card className="animate-fade-up overflow-hidden" style={{ animationDelay: "90ms" }}>
      <CardHeader className="flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary [&_svg]:size-4">
            <Activity />
          </div>
          <div>
            <CardTitle>Entregas recentes</CardTitle>
            <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="relative flex size-2" aria-hidden>
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-success" />
              </span>
              Ao vivo · atualiza a cada 15s
              {isFetching && !isLoading && <span className="sr-only">Atualizando…</span>}
            </p>
          </div>
        </div>
        {deliveries && deliveries.length > 0 && (
          <div className="flex items-center gap-2" aria-label="Resumo das entregas">
            <Badge variant="success">
              <CircleCheck /> {success} {success === 1 ? "entregue" : "entregues"}
            </Badge>
            <Badge variant={failed ? "destructive" : "muted"}>
              <CircleX /> {failed} {failed === 1 ? "falha" : "falhas"}
            </Badge>
          </div>
        )}
      </CardHeader>

      <div className="mt-5 border-t border-white/[0.06]" aria-live="polite" aria-busy={isLoading}>
        {isLoading ? (
          <DeliveriesSkeleton />
        ) : error ? (
          <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
        ) : !deliveries?.length ? (
          <EmptyState
            icon={<Inbox />}
            title="Nenhuma entrega ainda"
            description="Os eventos são disparados automaticamente quando uma transferência é concluída ou uma cobrança é paga. Registre um endpoint para começar a recebê-los."
          />
        ) : (
          <ul>
            {deliveries.map((delivery, index) => (
              <DeliveryRow key={delivery.id} delivery={delivery} index={index} />
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */

export function WebhooksView() {
  return (
    <div className="grid gap-8">
      <PageHeader
        title="Webhooks"
        description="Receba notificações em tempo real sobre transferências e cobranças pagas."
      />

      <div className="grid items-start gap-6 lg:grid-cols-5">
        <div className="grid gap-6 lg:col-span-2">
          <RegisterEndpointCard />
          <VerifyCard />
        </div>
        <div className="lg:col-span-3">
          <DeliveriesCard />
        </div>
      </div>
    </div>
  );
}
