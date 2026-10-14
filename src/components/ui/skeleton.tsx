import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-md bg-[linear-gradient(90deg,oklch(1_0_0/0.04)_0%,oklch(1_0_0/0.09)_50%,oklch(1_0_0/0.04)_100%)] bg-[length:200%_100%]",
        className,
      )}
      {...props}
    />
  );
}
