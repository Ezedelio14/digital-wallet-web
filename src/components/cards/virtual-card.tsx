import { Ban, Nfc, Snowflake } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { CardStatus } from "@/types/api";

const THEMES = [
  "bg-[radial-gradient(130%_120%_at_0%_0%,oklch(0.62_0.22_290)_0%,oklch(0.38_0.17_275)_45%,oklch(0.2_0.06_265)_100%)]",
  "bg-[radial-gradient(130%_120%_at_100%_0%,oklch(0.72_0.14_195)_0%,oklch(0.42_0.12_230)_45%,oklch(0.18_0.05_250)_100%)]",
  "bg-[radial-gradient(130%_120%_at_0%_100%,oklch(0.7_0.17_350)_0%,oklch(0.42_0.18_310)_50%,oklch(0.2_0.06_285)_100%)]",
  "bg-[radial-gradient(130%_120%_at_100%_100%,oklch(0.72_0.15_160)_0%,oklch(0.4_0.1_190)_50%,oklch(0.18_0.04_220)_100%)]",
];

interface VirtualCardProps {
  last4: string;
  holder: string;
  expiryMonth: number;
  expiryYear: number;
  status?: CardStatus;
  dailyLimit?: number | null;
  theme?: number;
  className?: string;
}

export function VirtualCard({
  last4,
  holder,
  expiryMonth,
  expiryYear,
  status = "ACTIVE",
  dailyLimit,
  theme = 0,
  className,
}: VirtualCardProps) {
  const frozen = status === "BLOCKED";
  const cancelled = status === "CANCELLED";

  return (
    <div
      className={cn(
        "group/card @container relative aspect-[1.586] w-full overflow-hidden rounded-2xl text-white shadow-[0_20px_50px_-20px_rgb(0_0_0/0.8)] ring-1 ring-white/15 transition-[transform,filter] duration-500 select-none",
        THEMES[theme % THEMES.length],
        cancelled && "grayscale opacity-50",
        frozen && "saturate-[0.35]",
        className,
      )}
    >
      {/* Sheen + texture */}
      <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,oklch(1_0_0/0.14)_45%,transparent_60%)] bg-[length:250%_100%] bg-[position:100%_0] transition-[background-position] duration-1000 group-hover/card:bg-[position:-50%_0]" />
      <div className="absolute -right-10 -bottom-16 size-56 rounded-full border-[28px] border-white/[0.06]" />
      <div className="absolute -right-2 -bottom-24 size-56 rounded-full border-[28px] border-white/[0.04]" />

      <div className="relative flex h-full flex-col justify-between p-[6%]">
        <div className="flex items-start justify-between">
          <div className="text-[clamp(10px,3.4cqw,14px)] font-semibold tracking-tight">
            Nebula<span className="font-normal opacity-70">Wallet</span>
          </div>
          <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-medium tracking-widest uppercase backdrop-blur">
            Virtual
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* EMV chip */}
          <div className="relative h-[22%] min-h-7 w-auto aspect-[1.3] overflow-hidden rounded-md bg-gradient-to-br from-[oklch(0.9_0.08_90)] via-[oklch(0.75_0.1_80)] to-[oklch(0.6_0.08_70)] shadow-inner">
            <div className="absolute inset-x-0 top-1/3 h-px bg-black/25" />
            <div className="absolute inset-x-0 top-2/3 h-px bg-black/25" />
            <div className="absolute inset-y-0 left-1/2 w-px bg-black/25" />
          </div>
          <Nfc className="size-5 opacity-80" />
        </div>

        <div>
          <p className="font-mono text-[clamp(13px,4.6cqw,20px)] tracking-[0.18em] text-white/95 [text-shadow:0_1px_2px_rgb(0_0_0/0.3)]">
            •••• •••• •••• {last4}
          </p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[9px] tracking-widest text-white/60 uppercase">Titular</p>
              <p className="truncate text-xs font-medium tracking-wide uppercase">{holder}</p>
            </div>
            <div>
              <p className="text-[9px] tracking-widest text-white/60 uppercase">Validade</p>
              <p className="font-mono text-xs">
                {String(expiryMonth).padStart(2, "0")}/{String(expiryYear).slice(-2)}
              </p>
            </div>
            {/* Network mark */}
            <div className="flex shrink-0 -space-x-2.5">
              <span className="size-7 rounded-full bg-[oklch(0.68_0.2_25)]/90" />
              <span className="size-7 rounded-full bg-[oklch(0.82_0.16_80)]/80 mix-blend-screen" />
            </div>
          </div>
        </div>
      </div>

      {(frozen || cancelled) && (
        <div className="absolute inset-0 grid place-items-center bg-[oklch(0.7_0.08_230/0.18)] backdrop-blur-[2px]">
          <div className="flex items-center gap-2 rounded-full border border-white/25 bg-black/40 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
            {frozen ? <Snowflake className="size-3.5" /> : <Ban className="size-3.5" />}
            {frozen ? "Congelado" : "Cancelado"}
          </div>
        </div>
      )}

      {dailyLimit != null && !cancelled && (
        <span className="tabular absolute top-[6%] right-[6%] mt-7 text-[10px] text-white/70">
          Limite diário {formatCurrency(dailyLimit)}
        </span>
      )}
    </div>
  );
}
