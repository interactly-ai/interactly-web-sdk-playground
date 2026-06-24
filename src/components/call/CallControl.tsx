import { useMemo } from "react";
import { Loader2, Phone, PhoneOff, RotateCw, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SecurityWarning } from "@/components/common/SecurityWarning";
import { getSecureContextInfo } from "@/lib/secure-context";
import type { CallStatus, FriendlyError } from "@/lib/interactly-types";
import { ACTIVE_STATUSES } from "@/lib/interactly-types";
import { cn } from "@/lib/utils";

interface CallControlProps {
  status: CallStatus;
  /** Connection isn't complete enough to start (missing token/assistant/etc). */
  needsSetup: boolean;
  error: FriendlyError | null;
  onStart: () => void;
  onStop: () => void;
  onConfigure: () => void;
  onDismissError: () => void;
}

export function CallControl({
  status,
  needsSetup,
  error,
  onStart,
  onStop,
  onConfigure,
  onDismissError,
}: CallControlProps) {
  const secure = useMemo(() => getSecureContextInfo(), []);
  const isActive = ACTIVE_STATUSES.includes(status);
  const isConnecting = status === "connecting" || status === "requesting-mic";
  const isEnding = status === "ending";
  const canStart = !isActive && !needsSetup && secure.canUseMic;

  return (
    <div className="space-y-3">
      {!secure.canUseMic ? (
        <SecurityWarning
          tone="destructive"
          title="Microphone unavailable in this context"
          description={
            secure.reason ??
            "This page can't access the microphone. Use HTTPS or localhost."
          }
        />
      ) : null}

      {error ? (
        <SecurityWarning
          tone="destructive"
          title={error.title}
          description={
            <div className="space-y-1">
              <p>{error.message}</p>
              {error.hint ? (
                <p className="text-foreground/70">{error.hint}</p>
              ) : null}
            </div>
          }
          onDismiss={onDismissError}
          action={
            !isActive ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={needsSetup ? onConfigure : onStart}
                disabled={!needsSetup && !canStart}
                className="gap-1.5"
              >
                <RotateCw className="h-3.5 w-3.5" />
                Try again
              </Button>
            ) : undefined
          }
        />
      ) : null}

      {status === "live" ? (
        <Button
          type="button"
          variant="destructive"
          size="xl"
          onClick={onStop}
          className="w-full"
        >
          <PhoneOff className="h-5 w-5" />
          End call
        </Button>
      ) : isConnecting ? (
        <Button
          type="button"
          variant="outline"
          size="xl"
          onClick={onStop}
          className="w-full"
        >
          <Loader2 className="h-5 w-5 animate-spin" />
          {status === "requesting-mic" ? "Requesting mic…" : "Connecting…"}
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            (cancel)
          </span>
        </Button>
      ) : isEnding ? (
        <Button type="button" variant="outline" size="xl" disabled className="w-full">
          <Loader2 className="h-5 w-5 animate-spin" />
          Ending…
        </Button>
      ) : needsSetup ? (
        <Button
          type="button"
          variant="brand"
          size="xl"
          onClick={onConfigure}
          className="w-full"
        >
          <Settings2 className="h-5 w-5" />
          Set up connection
        </Button>
      ) : (
        <Button
          type="button"
          variant="brand"
          size="xl"
          onClick={onStart}
          disabled={!canStart}
          className={cn("w-full", !canStart && "opacity-60")}
        >
          <Phone className="h-5 w-5" />
          {status === "ended" || status === "error" ? "Start new call" : "Start call"}
        </Button>
      )}

      <p className="text-center text-xs text-muted-foreground">
        {needsSetup && !isActive
          ? "Add your API token and assistant to get started."
          : status === "live"
            ? "You're live — speak into your mic."
            : "Starting a call will request microphone access."}
      </p>
    </div>
  );
}
