"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, DollarSign, Plus } from "lucide-react";
import { toast } from "sonner";
import { useCreateCard } from "@/hooks/use-cards";
import { cardSchema, type CardInput } from "@/lib/validators";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function IssueCardDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const createCard = useCreateCard();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CardInput>({ resolver: zodResolver(cardSchema) });

  function onSubmit({ dailyLimit }: CardInput) {
    createCard.mutate(dailyLimit, {
      onSuccess: (card) => {
        toast.success("Cartão emitido", { description: `Final ${card.cardNumberLast4}` });
        reset();
        setOpen(false);
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus /> Emitir cartão
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        title="Emitir cartão virtual"
        description="Um novo cartão de débito vinculado ao saldo da sua carteira."
        icon={<CreditCard />}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
          <Field
            label="Limite diário"
            htmlFor="dailyLimit"
            hint="Opcional"
            error={errors.dailyLimit?.message}
          >
            <Input
              id="dailyLimit"
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="Sem limite"
              icon={<DollarSign />}
              suffix="USD"
              className="tabular"
              aria-invalid={!!errors.dailyLimit}
              {...register("dailyLimit", {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              })}
            />
          </Field>
          <Button type="submit" size="lg" loading={createCard.isPending}>
            Emitir cartão
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
