import { cn } from "@/lib/utils";

interface StatusDotProps {
  /** Tailwind background color class, e.g. "bg-success". */
  colorClass: string;
  pulse?: boolean;
  className?: string;
}

export function StatusDot({ colorClass, pulse, className }: StatusDotProps) {
  return (
    <span className={cn("relative flex h-2.5 w-2.5", className)}>
      {pulse ? (
        <span
          className={cn(
            "absolute inline-flex h-full w-full rounded-full opacity-75 motion-safe:animate-ping",
            colorClass,
          )}
        />
      ) : null}
      <span
        className={cn(
          "relative inline-flex h-2.5 w-2.5 rounded-full",
          colorClass,
        )}
      />
    </span>
  );
}
