import { useState } from "react";
import { Bot } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AssistantIdFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  warning?: string;
}

export function AssistantIdField({
  value,
  onChange,
  disabled,
  warning,
}: AssistantIdFieldProps) {
  const [touched, setTouched] = useState(false);
  const showWarning = touched && !!warning;
  return (
    <div className="space-y-2">
      <Label htmlFor="assistant-id" className="flex items-center gap-1.5">
        <Bot className="h-3.5 w-3.5 text-muted-foreground" />
        Assistant ID
      </Label>
      <Input
        id="assistant-id"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder="e.g. asst_xxxxxxxx"
        disabled={disabled}
        autoCorrect="off"
        spellCheck={false}
        className="font-mono text-sm"
      />
      {showWarning ? (
        <p className="text-xs text-warning">{warning}</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Sent in the <code className="font-mono text-[0.7rem]">startCall</code>{" "}
          message to route the call to a specific assistant.
        </p>
      )}
    </div>
  );
}
