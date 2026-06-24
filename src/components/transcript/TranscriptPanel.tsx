import { useEffect, useMemo, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { Download, Eraser, MessagesSquare } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/common/CopyButton";
import { EmptyState } from "@/components/common/EmptyState";
import { MessageBubble } from "./MessageBubble";
import { downloadText, formatClock } from "@/lib/format";
import type { TimelineMessage } from "@/lib/interactly-types";

interface TranscriptPanelProps {
  messages: TimelineMessage[];
  onClear: () => void;
}

export function TranscriptPanel({ messages, onClear }: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);

  const asText = useMemo(
    () =>
      messages
        .map((m) => `[${formatClock(m.at)}] ${m.speaker}: ${m.text}`)
        .join("\n"),
    [messages],
  );

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    stick.current = distance < 80;
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border/60">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessagesSquare className="h-4 w-4 text-primary" />
          Transcript
          {messages.length > 0 ? (
            <Badge variant="muted">{messages.length}</Badge>
          ) : null}
        </CardTitle>
        <div className="flex items-center gap-1">
          <CopyButton
            value={asText}
            toastMessage="Transcript copied"
            disabled={messages.length === 0}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={messages.length === 0}
            onClick={() =>
              downloadText("interactly-transcript.txt", asText)
            }
            aria-label="Download transcript"
            title="Download .txt"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={messages.length === 0}
            onClick={onClear}
            aria-label="Clear transcript"
            title="Clear"
          >
            <Eraser className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent
        ref={scrollRef}
        onScroll={onScroll}
        className="flex-1 space-y-3 overflow-y-auto p-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <EmptyState
              icon={MessagesSquare}
              title="No messages yet"
              description="Assistant replies and your speech transcript will appear here once the call connects."
            />
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}
