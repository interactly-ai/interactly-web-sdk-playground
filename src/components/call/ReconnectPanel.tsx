import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CallStatus, ReconnectState } from "@/lib/interactly-types";

interface ReconnectPanelProps {
  reconnect: ReconnectState;
  status: CallStatus;
  onReconnect: () => void;
}

export function ReconnectPanel({
  reconnect,
  status,
  onReconnect,
}: ReconnectPanelProps) {
  const canReconnect = status !== "idle";

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
      <div className="min-w-0 space-y-0.5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
          Reconnection
          {reconnect.isReconnecting ? (
            <Badge variant="warning" className="gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              attempt {reconnect.attempt}/{reconnect.maxAttempts}
            </Badge>
          ) : reconnect.failed ? (
            <Badge variant="destructive">failed</Badge>
          ) : null}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {reconnect.failed
            ? "Reconnection failed after max attempts."
            : reconnect.lastError
              ? `Last error: ${reconnect.lastError}`
              : "Manual reconnect (auto-reconnect is inert in the SDK)."}
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onReconnect}
        disabled={!canReconnect || reconnect.isReconnecting}
        className="shrink-0"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Reconnect
      </Button>
    </div>
  );
}
