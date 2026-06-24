import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface TokenFieldProps {
  value: string;
  onChange: (value: string) => void;
  rememberToken: boolean;
  onRememberChange: (value: boolean) => void;
  disabled?: boolean;
  error?: string;
}

export function TokenField({
  value,
  onChange,
  rememberToken,
  onRememberChange,
  disabled,
  error,
}: TokenFieldProps) {
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState(false);
  const showError = touched && !!error;

  return (
    <div className="space-y-2">
      <Label htmlFor="api-token" className="flex items-center gap-1.5">
        <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
        API Token
        <span className="text-destructive">*</span>
      </Label>
      <div className="relative">
        <Input
          id="api-token"
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="Your Interactly API token / public key"
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={showError}
          className="pr-10 font-mono"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          disabled={disabled}
          aria-label={show ? "Hide token" : "Show token"}
          className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {showError ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Sent as{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.7rem]">
            Authorization: Bearer …
          </code>{" "}
          to fetch the call session.
        </p>
      )}
      <label
        className={cn(
          "flex items-center justify-between gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2",
          disabled && "opacity-60",
        )}
      >
        <span className="text-xs text-muted-foreground">
          Remember token on this device
        </span>
        <Switch
          checked={rememberToken}
          onCheckedChange={onRememberChange}
          disabled={disabled}
          aria-label="Remember token on this device"
        />
      </label>
    </div>
  );
}
