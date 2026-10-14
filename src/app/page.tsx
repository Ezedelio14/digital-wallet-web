import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  Fingerprint,
  KeyRound,
  Receipt,
  Scale,
  Webhook,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { VirtualCard } from "@/components/cards/virtual-card";

const features = [
  {
    icon: Scale,
    title: "Ledger de partidas dobradas",
    text: "Cada transação gera lançamentos de DÉBITO e CRÉDITO pareados, com reconciliação auditável do saldo.",
  },
  {
    icon: Fingerprint,
    title: "Idempotência",
    text: "Requisições financeiras exigem Idempotency-Key. Reenvios retornam a resposta original, sem cobrança duplicada.",
  },
  {
    icon: CreditCard,
    title: "Cartões virtuais",
    text: "Emita cartões de débito com limite diário e congele, descongele ou cancele na hora.",
  },
  {
    icon: Receipt,
    title: "Cobranças P2P",
    text: "Crie cobranças por e-mail e liquide-as de forma atômica e idempotente.",
  },
  {
    icon: Webhook,
    title: "Webhooks com HMAC",
    text: "Eventos TRANSFER_COMPLETED e INVOICE_PAID assinados com HMAC-SHA256 e log de entregas.",
  },
  {
    icon: KeyRound,
    title: "Sessões seguras",
    text: "Access token JWT de 15 min e refresh token de 7 dias, com renovação transparente.",
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[40rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,oklch(0.5_0.22_285/0.45),transparent)] blur-2xl" />
        <div className="absolute top-[30rem] -right-40 size-[30rem] rounded-full bg-[radial-gradient(closest-side,oklch(0.6_0.14_200/0.3),transparent)] blur-2xl" />
        <div className="absolute inset-x-0 top-0 h-[48rem] bg-grid" />
      </div>

      <header className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <Logo />
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">Criar conta</Link>
          </Button>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-16 px-6 pt-12 pb-24 lg:grid-cols-2 lg:pt-20">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <span className="size-1.5 rounded-full bg-success shadow-[0_0_8px_var(--success)]" />
              Fintech-grade · ACID · Double-entry
            </span>
            <h1 className="mt-6 text-4xl leading-[1.05] font-semibold tracking-tight sm:text-6xl">
              <span className="text-gradient">A carteira digital</span>
              <br />
              que nunca perde um centavo.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              Transferências atômicas, cartões virtuais, cobranças e webhooks assinados, tudo
              sobre um ledger de partidas dobradas auditável.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/register">
                  Abrir minha carteira <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Já tenho conta</Link>
              </Button>
            </div>
          </div>

          <div className="relative mx-auto h-80 w-full max-w-md animate-fade-in sm:h-96">
            <div className="absolute inset-10 rounded-full bg-primary/30 blur-3xl" />
            <VirtualCard
              last4="7734"
              holder="Lucas Ferreira"
              expiryMonth={11}
              expiryYear={2030}
              theme={2}
              className="absolute top-16 right-0 w-[78%] rotate-[8deg] opacity-80"
            />
            <VirtualCard
              last4="0917"
              holder="Ana Martins"
              expiryMonth={3}
              expiryYear={2029}
              dailyLimit={2500}
              className="absolute top-4 left-0 w-[82%] animate-float"
            />
            <div className="glass absolute right-2 bottom-2 rounded-2xl px-4 py-3 shadow-2xl sm:right-6 sm:bottom-6">
              <p className="text-[11px] text-muted-foreground">Transferência recebida</p>
              <p className="tabular text-lg font-semibold text-success">+$1,250.00</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-28">
          <div className="grid gap-px overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="group bg-background/95 p-7 transition-colors hover:bg-card/80"
              >
                <span className="grid size-10 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 font-semibold tracking-tight">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-muted-foreground">
        Nebula Wallet · Next.js, TanStack Query & Tailwind · Integrado à Digital Wallet API
      </footer>
    </div>
  );
}
