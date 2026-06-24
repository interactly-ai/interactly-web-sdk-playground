import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { LogLevel } from "@/lib/interactly-types";
import { cn } from "@/lib/utils";
import { LEVEL_DOT, LEVEL_LABEL, LOG_LEVELS } from "./levelStyles";

interface EventFilterBarProps {
  search: string;
  onSearch: (value: string) => void;
  active: Set<LogLevel>;
  onToggle: (level: LogLevel) => void;
}

export function EventFilterBar({
  search,
  onSearch,
  active,
  onToggle,
}: EventFilterBarProps) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Filter events…"
          className="h-9 pl-8 pr-8 text-sm"
        />
        {search ? (
          <button
            type="button"
            onClick={() => onSearch("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {LOG_LEVELS.map((level) => {
          const on = active.has(level);
          return (
            <button
              key={level}
              type="button"
              onClick={() => onToggle(level)}
              aria-pressed={on}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs transition-colors",
                on
                  ? "border-border bg-muted text-foreground"
                  : "border-transparent text-muted-foreground/60 hover:text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  LEVEL_DOT[level],
                  !on && "opacity-40",
                )}
              />
              {LEVEL_LABEL[level]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
