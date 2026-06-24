import { Loader2, Phone } from "lucide-react";
import { StatusDot } from "@/components/common/StatusDot";
import { useCallTimer } from "@/hooks/useCallTimer";
import { formatDuration } from "@/lib/format";
import type { CallStatus } from "@/lib/interactly-types";
import { cn } from "@/lib/utils";

interface StatusMeta {
  label: string;
  color: string;
  pulse?: boolean;
  spinner?: boolean;
}

const STATUS_META: Record<CallStatus, StatusMeta> = {
  idle: { label: "Idle", color: "bg-muted-foreground" },
  "requesting-mic": { label: "Requesting mic", color: "bg-warning", spinner: true },
  connecting: { label: "Connecting", color: "bg-warning", spinner: true },
  live: { label: "Live", color: "bg-success", pulse: true },
  ending: { label: "Ending", color: "bg-warning", spinner: true },
  ended: { label: "Ended", color: "bg-muted-foreground" },
  error: { label: "Error", color: "bg-destructive" },
};

interface CallStatusPillProps {
  status: CallStatus;
  callStartedAt: number | null;
  callEndedAt: number | null;
  userNumber?: string | null;
  className?: string;
}

export function CallStatusPill({
  status,
  callStartedAt,
  callEndedAt,
  userNumber,
  className,
}: CallStatusPillProps) {
  const meta = STATUS_META[status];
  const elapsed = useCallTimer(callStartedAt, callEndedAt, status === "live");
  const showTimer =
    callStartedAt != null && (status === "live" || status === "ended");

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur",
        className,
      )}
    >
      {meta.spinner ? (
        <Loader2 className="h-3 w-3 animate-spin text-warning" />
      ) : (
        <StatusDot colorClass={meta.color} pulse={meta.pulse} />
      )}
      <span className="text-foreground">{meta.label}</span>
      {showTimer ? (
        <span className="font-mono tabular-nums text-muted-foreground">
          {formatDuration(elapsed)}
        </span>
      ) : null}
      {userNumber ? (
        <span className="hidden items-center gap-1 border-l border-border pl-2 text-muted-foreground sm:inline-flex">
          <Phone className="h-3 w-3" />
          {userNumber}
        </span>
      ) : null}
    </div>
  );
}
