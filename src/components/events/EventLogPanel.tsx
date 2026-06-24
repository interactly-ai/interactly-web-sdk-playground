import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownToLine, Download, ListTree, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { EventFilterBar } from "./EventFilterBar";
import { EventLogRow } from "./EventLogRow";
import { LOG_LEVELS } from "./levelStyles";
import { downloadText, safeStringify } from "@/lib/format";
import type { EventLogEntry, LogLevel } from "@/lib/interactly-types";
import { cn } from "@/lib/utils";

export function EventLogPanel({
  log,
  onClear,
}: {
  log: EventLogEntry[];
  onClear: () => void;
}) {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Set<LogLevel>>(
    () => new Set(LOG_LEVELS),
  );
  const [follow, setFollow] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const toggleLevel = (level: LogLevel) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return log.filter((e) => {
      if (!active.has(e.level)) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        (e.summary?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [log, active, search]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el && follow) el.scrollTop = el.scrollHeight;
  }, [filtered, follow]);

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="space-y-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <ListTree className="h-4 w-4 text-primary" />
            Event inspector
            <Badge variant="muted">{log.length}</Badge>
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant={follow ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => setFollow((f) => !f)}
              aria-pressed={follow}
              aria-label="Auto-scroll"
              title={follow ? "Auto-scroll on" : "Auto-scroll off"}
            >
              <ArrowDownToLine
                className={cn("h-3.5 w-3.5", follow && "text-primary")}
              />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={log.length === 0}
              onClick={() =>
                downloadText(
                  "interactly-events.json",
                  safeStringify(log),
                  "application/json",
                )
              }
              aria-label="Export events"
              title="Export JSON"
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={log.length === 0}
              onClick={onClear}
              aria-label="Clear events"
              title="Clear"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <EventFilterBar
          search={search}
          onSearch={setSearch}
          active={active}
          onToggle={toggleLevel}
        />
      </CardHeader>
      <CardContent
        ref={scrollRef}
        className="flex-1 space-y-1.5 overflow-y-auto p-3"
      >
        {log.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <EmptyState
              icon={ListTree}
              title="No events yet"
              description="Every SDK event — connection, transcript, audio, reconnect, errors — streams here live with full payloads."
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <EmptyState
              icon={ListTree}
              title="No matching events"
              description="Adjust the search or level filters above."
            />
          </div>
        ) : (
          filtered.map((entry) => <EventLogRow key={entry.id} entry={entry} />)
        )}
      </CardContent>
    </Card>
  );
}
