import { RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InteractlyLogo } from "@/components/branding/InteractlyLogo";
import { TokenField } from "./TokenField";
import { ServerField } from "./ServerField";
import { AssistantIdField } from "./AssistantIdField";
import { MicStatus } from "./MicStatus";
import type { CallConfig } from "@/lib/interactly-types";
import type { ConfigValidation } from "@/lib/validation";

interface ConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: CallConfig;
  validation: ConfigValidation;
  /** True while a call is active — fields become read-only. */
  disabled: boolean;
  rememberToken: boolean;
  onUpdate: (patch: Partial<CallConfig>) => void;
  onRememberToken: (value: boolean) => void;
  onReset: () => void;
}

export function ConnectionDialog({
  open,
  onOpenChange,
  config,
  validation,
  disabled,
  rememberToken,
  onUpdate,
  onRememberToken,
  onReset,
}: ConnectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient">
              <InteractlyLogo showWordmark={false} height={22} />
            </span>
            <DialogTitle>Connect to Interactly</DialogTitle>
          </div>
          <DialogDescription>
            Add your credentials to place a live voice call. Everything stays in
            your browser — nothing is sent to a backend except the server you set.
          </DialogDescription>
        </DialogHeader>

        {disabled ? (
          <p className="rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            Connection is locked while a call is active. Stop the call to edit.
          </p>
        ) : null}

        <div className="space-y-4">
          <TokenField
            value={config.apiToken}
            onChange={(v) => onUpdate({ apiToken: v })}
            rememberToken={rememberToken}
            onRememberChange={onRememberToken}
            disabled={disabled}
            error={validation.errors.apiToken}
          />
          <ServerField
            value={config.server}
            onChange={(v) => onUpdate({ server: v })}
            disabled={disabled}
            error={validation.errors.server}
            warning={validation.warnings.server}
          />
          <AssistantIdField
            value={config.assistantId}
            onChange={(v) => onUpdate({ assistantId: v })}
            disabled={disabled}
            warning={validation.warnings.assistantId}
          />
          <MicStatus disabled={disabled} />
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={onReset}
            disabled={disabled}
            className="text-muted-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            {validation.hasErrors ? "Save & close" : "Done"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
