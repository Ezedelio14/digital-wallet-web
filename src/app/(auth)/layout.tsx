import { Fingerprint, Scale, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { GuestOnly } from "@/components/shared/auth-guard";
import { VirtualCard } from "@/components/cards/virtual-card";

const highlights = [
  { icon: Scale, text: "Ledger de partidas dobradas com reconciliação" },
  { icon: Fingerprint, text: "Idempotency-Key contra cobranças duplicadas" },
  { icon: ShieldCheck, text: "Webhooks assinados com HMAC-SHA256" },
];

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <GuestOnly />

      <div className="relative flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          {children}
        </div>
        <p className="text-center text-xs text-muted-foreground lg:text-left">
          Nebula Wallet · Projeto de portfólio
        </p>
      </div>

      <aside className="relative hidden overflow-hidden border-l border-white/[0.06] lg:flex lg:flex-col lg:justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_70%_20%,oklch(0.42_0.2_285/0.55),transparent_70%),radial-gradient(60%_50%_at_20%_90%,oklch(0.55_0.14_200/0.35),transparent_70%)]" />
        <div className="absolute inset-0 bg-grid" />

        <div className="relative mx-auto w-full max-w-md px-10">
          <div className="relative h-72">
            <VirtualCard
              last4="4821"
              holder="Ana Martins"
              expiryMonth={8}
              expiryYear={2030}
              theme={1}
              className="absolute top-10 left-14 w-80 rotate-6 opacity-70"
            />
            <VirtualCard
              last4="0917"
              holder="Ana Martins"
              expiryMonth={3}
              expiryYear={2029}
              dailyLimit={2500}
              className="absolute top-0 left-0 w-80 animate-float"
            />
          </div>

          <h2 className="mt-14 text-3xl font-semibold tracking-tight">
            <span className="text-gradient">Dinheiro com integridade</span>
            <br />
            de nível bancário.
          </h2>
          <ul className="mt-8 grid gap-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="grid size-8 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-primary">
                  <Icon className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
