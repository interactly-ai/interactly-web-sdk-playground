import { useCallback, useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CopyButtonProps extends Omit<ButtonProps, "value" | "onClick"> {
  value: string;
  /** Optional label shown next to the icon. */
  label?: string;
  /** Toast message on success. */
  toastMessage?: string;
}

export function CopyButton({
  value,
  label,
  toastMessage = "Copied to clipboard",
  variant = "outline",
  size = label ? "sm" : "icon-sm",
  className,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(toastMessage);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't access the clipboard");
    }
  }, [value, toastMessage]);

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onCopy}
      className={cn(className)}
      aria-label={label ?? "Copy"}
      {...props}
    >
      {copied ? (
        <Check className="text-success" />
      ) : (
        <Copy />
      )}
      {label ? <span>{copied ? "Copied" : label}</span> : null}
    </Button>
  );
}
