import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative grid size-8 place-items-center overflow-hidden rounded-[10px] bg-gradient-to-br from-[oklch(0.72_0.19_285)] via-[oklch(0.62_0.2_275)] to-[oklch(0.75_0.14_200)] shadow-[0_6px_20px_-6px_oklch(0.7_0.18_285/0.8)]",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-[60%] text-white" fill="none" aria-hidden>
        <path
          d="M4 8.5C4 7.12 5.12 6 6.5 6h11A2.5 2.5 0 0 1 20 8.5v7a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 15.5v-7Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path d="M15 12h2.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M4 10h9" stroke="currentColor" strokeWidth="1.8" opacity=".5" />
      </svg>
      <span className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent" />
    </span>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-tight">
        Nebula<span className="text-muted-foreground font-normal">Wallet</span>
      </span>
    </Link>
  );
}
