import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}

export function Input({ className, icon, suffix, ...props }: InputProps) {
  return (
    <div className="group relative flex items-center">
      {icon && (
        <span className="pointer-events-none absolute left-3 text-muted-foreground transition-colors group-focus-within:text-primary [&_svg]:size-4">
          {icon}
        </span>
      )}
      <input
        data-slot="input"
        className={cn(
          "h-11 w-full min-w-0 rounded-lg border border-input bg-white/[0.03] px-3.5 text-sm transition-[color,box-shadow,border-color] outline-none placeholder:text-muted-foreground/60",
          "focus-visible:border-primary/60 focus-visible:ring-[3px] focus-visible:ring-ring/40",
          "aria-invalid:border-destructive/60 aria-invalid:ring-destructive/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          icon && "pl-10",
          suffix && "pr-12",
          className,
        )}
        {...props}
      />
      {suffix && <span className="absolute right-3 text-xs text-muted-foreground">{suffix}</span>}
    </div>
  );
}
