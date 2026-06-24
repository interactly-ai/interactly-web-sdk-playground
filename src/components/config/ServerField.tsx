import { Server } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_SERVER } from "@/lib/interactly-types";

interface ServerFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  warning?: string;
}

export function ServerField({
  value,
  onChange,
  disabled,
  error,
  warning,
}: ServerFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="server-url" className="flex items-center gap-1.5">
        <Server className="h-3.5 w-3.5 text-muted-foreground" />
        Server URL
        <span className="text-destructive">*</span>
      </Label>
      <Input
        id="server-url"
        type="url"
        inputMode="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={DEFAULT_SERVER}
        disabled={disabled}
        autoCorrect="off"
        spellCheck={false}
        aria-invalid={!!error}
        className="font-mono text-sm"
      />
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : warning ? (
        <p className="text-xs text-warning">{warning}</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Base URL for the session fetch and call socket. Default:{" "}
          {DEFAULT_SERVER}
        </p>
      )}
    </div>
  );
}
