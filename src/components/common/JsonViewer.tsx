import { Fragment, useMemo } from "react";
import { safeStringify } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CopyButton } from "./CopyButton";

interface JsonViewerProps {
  value: unknown;
  className?: string;
  /** Show a copy button in the top-right corner. */
  copyable?: boolean;
  maxHeightClass?: string;
}

const TOKEN_RE =
  /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g;

interface Token {
  text: string;
  className: string;
}

function tokenize(json: string): Token[] {
  const tokens: Token[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(json)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        text: json.slice(lastIndex, match.index),
        className: "text-muted-foreground",
      });
    }
    const raw = match[0];
    let className = "text-warning"; // numbers
    if (raw.startsWith('"')) {
      className = raw.trimEnd().endsWith(":")
        ? "text-primary" // object key
        : "text-success"; // string value
    } else if (raw === "true" || raw === "false" || raw === "null") {
      className = "text-log-audio";
    }
    tokens.push({ text: raw, className });
    lastIndex = match.index + raw.length;
  }
  if (lastIndex < json.length) {
    tokens.push({
      text: json.slice(lastIndex),
      className: "text-muted-foreground",
    });
  }
  return tokens;
}

export function JsonViewer({
  value,
  className,
  copyable = true,
  maxHeightClass = "max-h-80",
}: JsonViewerProps) {
  const json = useMemo(() => safeStringify(value), [value]);
  const tokens = useMemo(() => tokenize(json), [json]);

  return (
    <div className={cn("relative", className)}>
      {copyable ? (
        <div className="absolute right-2 top-2 z-10">
          <CopyButton value={json} variant="ghost" />
        </div>
      ) : null}
      <div className={cn("overflow-auto rounded-lg bg-muted/50", maxHeightClass)}>
        <pre className="w-max min-w-full p-3 pr-10 font-mono text-xs leading-relaxed text-foreground">
          <code>
            {tokens.map((t, i) => (
              <Fragment key={i}>
                <span className={t.className}>{t.text}</span>
              </Fragment>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
