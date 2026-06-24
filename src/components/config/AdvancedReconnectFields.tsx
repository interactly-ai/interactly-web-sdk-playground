import { Settings2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { ReconnectSettings } from "@/lib/interactly-types";

interface AdvancedReconnectFieldsProps {
  reconnect: ReconnectSettings;
  onChange: (patch: Partial<ReconnectSettings>) => void;
  disabled?: boolean;
}

interface NumberFieldProps {
  id: string;
  label: string;
  value: number;
  min?: number;
  step?: number;
  suffix?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}

function NumberField({
  id,
  label,
  value,
  min = 0,
  step = 1,
  suffix,
  disabled,
  onChange,
}: NumberFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
        {suffix ? ` (${suffix})` : ""}
      </Label>
      <Input
        id={id}
        type="number"
        min={min}
        step={step}
        value={Number.isFinite(value) ? value : ""}
        disabled={disabled}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onChange(n);
        }}
        className="h-9"
      />
    </div>
  );
}

export function AdvancedReconnectFields({
  reconnect,
  onChange,
  disabled,
}: AdvancedReconnectFieldsProps) {
  return (
    <Accordion type="single" collapsible className="rounded-lg border border-border/60">
      <AccordionItem value="reconnect" className="border-b-0">
        <AccordionTrigger className="px-3 hover:no-underline">
          <span className="flex items-center gap-2 text-sm">
            <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
            Reconnect settings
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-3">
          <div className="space-y-4">
            <label className="flex items-center justify-between gap-2">
              <span className="text-sm text-foreground">Enabled</span>
              <Switch
                checked={reconnect.enabled}
                onCheckedChange={(v) => onChange({ enabled: v })}
                disabled={disabled}
                aria-label="Reconnect enabled"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <NumberField
                id="rc-max-attempts"
                label="Max attempts"
                value={reconnect.maxAttempts}
                min={1}
                disabled={disabled}
                onChange={(v) => onChange({ maxAttempts: v })}
              />
              <NumberField
                id="rc-factor"
                label="Backoff factor"
                value={reconnect.factor}
                min={1}
                step={0.5}
                disabled={disabled}
                onChange={(v) => onChange({ factor: v })}
              />
              <NumberField
                id="rc-initial-delay"
                label="Initial delay"
                suffix="ms"
                value={reconnect.initialDelay}
                step={100}
                disabled={disabled}
                onChange={(v) => onChange({ initialDelay: v })}
              />
              <NumberField
                id="rc-max-delay"
                label="Max delay"
                suffix="ms"
                value={reconnect.maxDelay}
                step={1000}
                disabled={disabled}
                onChange={(v) => onChange({ maxDelay: v })}
              />
            </div>

            <p className="rounded-md bg-muted/50 p-2.5 text-xs text-muted-foreground">
              Note: automatic reconnection is currently inert in the SDK
              (v1.1.0) — these values configure the backoff used by the manual{" "}
              <span className="font-medium text-foreground">Reconnect</span>{" "}
              action only.
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
