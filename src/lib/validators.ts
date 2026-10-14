import { z } from "zod";

const amount = z
  .number({ error: "Informe um valor" })
  .positive("O valor deve ser maior que zero")
  .max(1_000_000, "Valor acima do limite permitido")
  .multipleOf(0.01, "Use no máximo 2 casas decimais");

export const loginSchema = z.object({
  email: z.email("E-mail inválido"),
  password: z.string().min(1, "Informe sua senha"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Informe seu nome"),
    email: z.email("E-mail inválido"),
    password: z.string().min(6, "Mínimo de 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const transferSchema = z.object({
  receiverWalletId: z.uuid("ID de carteira inválido (UUID)"),
  amount,
});
export type TransferInput = z.infer<typeof transferSchema>;

export const cardSchema = z.object({
  dailyLimit: amount.optional(),
});
export type CardInput = z.infer<typeof cardSchema>;

export const invoiceSchema = z.object({
  amount,
  description: z.string().trim().max(140, "Máximo de 140 caracteres").optional(),
  payerEmail: z.union([z.email("E-mail inválido"), z.literal("")]).optional(),
});
export type InvoiceInput = z.infer<typeof invoiceSchema>;

export const webhookSchema = z.object({
  url: z.url("URL inválida").refine((v) => /^https?:\/\//.test(v), "Use http(s)://"),
});
export type WebhookInput = z.infer<typeof webhookSchema>;
