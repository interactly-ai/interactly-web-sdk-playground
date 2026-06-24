import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { JsonViewer } from "@/components/common/JsonViewer";
import { formatClockMs } from "@/lib/format";
import type { EventLogEntry } from "@/lib/interactly-types";
import { cn } from "@/lib/utils";
import { LEVEL_DOT, LEVEL_TEXT } from "./levelStyles";

const hasPayload = (payload: unknown) =>
  payload !== undefined && payload !== null && payload !== "";

export function EventLogRow({ entry }: { entry: EventLogEntry }) {
  const [open, setOpen] = useState(false);
  const expandable = hasPayload(entry.payload);

  return (
    <div className="rounded-md border border-border/50 bg-card/40">
      <button
        type="button"
        onClick={() => expandable && setOpen((o) => !o)}
        className={cn(
          "flex w-full items-start gap-2 px-2.5 py-2 text-left",
          expandable ? "cursor-pointer hover:bg-muted/40" : "cursor-default",
        )}
        aria-expanded={expandable ? open : undefined}
      >
        <span
          className={cn(
            "mt-1.5 h-2 w-2 shrink-0 rounded-full",
            LEVEL_DOT[entry.level],
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <code
              className={cn(
                "font-mono text-xs font-semibold",
                LEVEL_TEXT[entry.level],
              )}
            >
              {entry.name}
            </code>
            <span className="ml-auto shrink-0 font-mono text-[0.7rem] tabular-nums text-muted-foreground">
              {formatClockMs(entry.at)}
            </span>
          </div>
          {entry.summary ? (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {entry.summary}
            </p>
          ) : null}
        </div>
        {expandable ? (
          <ChevronRight
            className={cn(
              "mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-90",
            )}
          />
        ) : null}
      </button>
      {open && expandable ? (
        <div className="px-2.5 pb-2.5">
          <JsonViewer value={entry.payload} maxHeightClass="max-h-56" />
        </div>
      ) : null}
    </div>
  );
}
