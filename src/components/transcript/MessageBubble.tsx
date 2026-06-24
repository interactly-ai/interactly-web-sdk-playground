import { motion } from "framer-motion";
import { User } from "lucide-react";
import { InteractlyLogo } from "@/components/branding/InteractlyLogo";
import { formatClock } from "@/lib/format";
import type { TimelineMessage } from "@/lib/interactly-types";
import { cn } from "@/lib/utils";

export function MessageBubble({ message }: { message: TimelineMessage }) {
  const isAssistant = message.speaker === "Assistant";

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "flex items-end gap-2",
        isAssistant ? "justify-start" : "flex-row-reverse justify-start",
      )}
    >
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          isAssistant
            ? "bg-brand-gradient"
            : "border border-border bg-muted text-muted-foreground",
        )}
      >
        {isAssistant ? (
          <InteractlyLogo showWordmark={false} height={18} title="Assistant" />
        ) : (
          <User className="h-3.5 w-3.5" />
        )}
      </div>

      <div
        className={cn(
          "flex max-w-[78%] flex-col gap-1",
          isAssistant ? "items-start" : "items-end",
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm",
            isAssistant
              ? "rounded-bl-sm bg-muted text-foreground"
              : "rounded-br-sm bg-primary text-primary-foreground",
          )}
        >
          {message.text || (
            <span className="italic opacity-60">(empty message)</span>
          )}
        </div>
        <span className="px-1 text-[0.7rem] tabular-nums text-muted-foreground">
          {isAssistant ? "Assistant" : "User"} · {formatClock(message.at)}
        </span>
      </div>
    </motion.div>
  );
}
