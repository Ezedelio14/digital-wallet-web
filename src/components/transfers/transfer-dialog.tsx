"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { TransferForm } from "./transfer-form";

export function TransferDialog({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        title="Nova transferência"
        description="Envio P2P atômico com proteção contra cobrança duplicada."
        icon={<Send />}
      >
        {/* Remounts on each open, so every opening gets a fresh idempotency key. */}
        {open && <TransferForm onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}
