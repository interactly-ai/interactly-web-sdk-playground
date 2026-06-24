import { Mic, MicOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMediaDevices, type MicPermission } from "@/hooks/useMediaDevices";

const PERMISSION_META: Record<
  MicPermission,
  { label: string; variant: "success" | "warning" | "destructive" | "muted" }
> = {
  granted: { label: "Granted", variant: "success" },
  prompt: { label: "Will prompt", variant: "warning" },
  denied: { label: "Blocked", variant: "destructive" },
  unknown: { label: "Unknown", variant: "muted" },
};

/**
 * Informational microphone panel. The SDK always captures the system-default
 * device (`getUserMedia({ audio: true })`), so this is intentionally a status
 * readout — not a selector — surfacing permission state and detected inputs to
 * help diagnose mic problems before a call.
 */
export function MicStatus({ disabled }: { disabled?: boolean }) {
  const { devices, permission, refresh } = useMediaDevices();
  const meta = PERMISSION_META[permission];
  const named = devices.filter((d) => d.deviceId && d.label);

  return (
    <div className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          {permission === "denied" ? (
            <MicOff className="h-3.5 w-3.5 text-destructive" />
          ) : (
            <Mic className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          Microphone
        </span>
        <div className="flex items-center gap-1.5">
          <Badge variant={meta.variant}>{meta.label}</Badge>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => void refresh()}
            disabled={disabled}
            aria-label="Refresh devices"
            title="Refresh devices"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {named.length > 0 ? (
        <ul className="space-y-1">
          {named.map((d) => (
            <li
              key={d.deviceId}
              className="truncate text-xs text-muted-foreground"
              title={d.label}
            >
              • {d.label}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">
          {permission === "granted"
            ? "No input devices detected."
            : "Device names appear after you grant mic access."}
        </p>
      )}

      <p className="text-[0.7rem] leading-relaxed text-muted-foreground/80">
        The SDK captures your system-default microphone. Change it in your OS or
        browser input settings.
      </p>
    </div>
  );
}
