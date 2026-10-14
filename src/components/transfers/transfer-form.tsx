"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, DollarSign, Fingerprint, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useTransfer } from "@/hooks/use-transfers";
import { useBalance } from "@/hooks/use-wallet";
import { transferSchema, type TransferInput } from "@/lib/validators";
import { cn, formatCurrency, generateIdempotencyKey, getErrorMessage, shortId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { CopyButton } from "@/components/shared/copy-button";
import type { TransferResult } from "@/types/api";

const QUICK_AMOUNTS = [10, 50, 100, 250];

export function TransferForm({ onDone }: { onDone?: () => void }) {
  const { data: balance } = useBalance();
  const transfer = useTransfer();
  // One key per transfer intent: retries and double-submits reuse it, so the API dedupes them.
  const [idempotencyKey, setIdempotencyKey] = useState(generateIdempotencyKey);
  const [result, setResult] = useState<TransferResult | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<TransferInput>({ resolver: zodResolver(transferSchema) });

  const amount = useWatch({ control, name: "amount" });
  const insufficient = balance != null && Number(amount) > balance.balance;

  function onSubmit(values: TransferInput) {
    transfer.mutate(
      { ...values, idempotencyKey },
      {
        onSuccess: (data) => {
          setResult(data);
          toast.success("Transferência concluída", {
            description: `${formatCurrency(data.amount, balance?.currency)} enviados com sucesso.`,
          });
        },
        onError: (error) => toast.error(getErrorMessage(error, "Falha na transferência.")),
      },
    );
  }

  function startOver() {
    setResult(null);
    reset();
    setIdempotencyKey(generateIdempotencyKey());
  }

  if (result) {
    return (
      <div className="grid animate-fade-up gap-5 text-center">
        <div className="relative mx-auto mt-2">
          <div className="absolute inset-0 rounded-full bg-success/40 blur-2xl" />
          <div className="relative grid size-16 place-items-center rounded-full border border-success/30 bg-success/15">
            <CircleCheck className="size-8 text-success" />
          </div>
        </div>
        <div>
          <p className="tabular text-3xl font-semibold tracking-tight">
            {formatCurrency(result.amount, balance?.currency)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Transferência liquidada no ledger</p>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-left">
          <div>
            <p className="text-[11px] text-muted-foreground">Transaction ID</p>
            <p className="font-mono text-xs">{shortId(result.transactionId, 12)}</p>
          </div>
          <CopyButton value={result.transactionId} />
        </div>
        <div className="flex gap-2">
          {onDone && (
            <Button variant="outline" className="flex-1" onClick={onDone}>
              Fechar
            </Button>
          )}
          <Button className="flex-1" onClick={startOver}>
            Nova transferência
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
      <Field
        label="Carteira de destino"
        htmlFor="receiverWalletId"
        error={errors.receiverWalletId?.message}
      >
        <Input
          id="receiverWalletId"
          placeholder="00000000-0000-0000-0000-000000000000"
          className="font-mono text-xs"
          icon={<Wallet />}
          autoComplete="off"
          spellCheck={false}
          aria-invalid={!!errors.receiverWalletId}
          {...register("receiverWalletId")}
        />
      </Field>

      <Field
        label="Valor"
        htmlFor="amount"
        error={errors.amount?.message ?? (insufficient ? "Saldo insuficiente" : undefined)}
        hint={
          balance && (
            <>
              Disponível:{" "}
              <span className="tabular text-foreground">
                {formatCurrency(balance.balance, balance.currency)}
              </span>
            </>
          )
        }
      >
        <Input
          id="amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="0,00"
          icon={<DollarSign />}
          suffix={balance?.currency ?? "USD"}
          className="tabular text-base"
          aria-invalid={!!errors.amount || insufficient}
          {...register("amount", {
            setValueAs: (v) => (v === "" ? undefined : Number(v)),
          })}
        />
        <div className="flex flex-wrap gap-1.5">
          {QUICK_AMOUNTS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue("amount", value, { shouldValidate: true })}
              className={cn(
                "tabular rounded-full border px-3 py-1 text-xs transition-colors",
                Number(amount) === value
                  ? "border-primary/40 bg-primary/15 text-primary"
                  : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground",
              )}
            >
              ${value}
            </button>
          ))}
        </div>
      </Field>

      <div className="flex items-center gap-2.5 rounded-lg border border-dashed border-white/10 px-3 py-2.5">
        <Fingerprint className="size-4 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-muted-foreground">Idempotency-Key</p>
          <p className="truncate font-mono text-[11px]">{idempotencyKey}</p>
        </div>
      </div>

      <Button type="submit" size="lg" loading={transfer.isPending} disabled={insufficient}>
        Confirmar transferência
      </Button>
    </form>
  );
}
