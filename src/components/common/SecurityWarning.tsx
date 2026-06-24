import type { LucideIcon } from "lucide-react";
import { ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tone = "warning" | "destructive" | "info";

const toneStyles: Record<Tone, string> = {
  warning: "border-warning/40 bg-warning/10 text-warning",
  destructive: "border-destructive/40 bg-destructive/10 text-destructive",
  info: "border-primary/40 bg-primary/10 text-primary",
};

interface SecurityWarningProps {
  tone?: Tone;
  title: string;
  description?: React.ReactNode;
  icon?: LucideIcon;
  onDismiss?: () => void;
  action?: React.ReactNode;
  className?: string;
}

export function SecurityWarning({
  tone = "warning",
  title,
  description,
  icon: Icon = ShieldAlert,
  onDismiss,
  action,
  className,
}: SecurityWarningProps) {
  return (
    <div
      role="alert"
      className={cn(
        "relative flex gap-3 rounded-lg border p-3.5 text-sm",
        toneStyles[tone],
        className,
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="font-medium leading-tight">{title}</p>
        {description ? (
          <div className="text-xs leading-relaxed text-foreground/80">
            {description}
          </div>
        ) : null}
        {action ? <div className="pt-1">{action}</div> : null}
      </div>
      {onDismiss ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onDismiss}
          className="-mr-1 -mt-1 h-7 w-7 shrink-0 text-current hover:bg-foreground/10"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      ) : null}
    </div>
  );
}
