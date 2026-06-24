import { type RefObject } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { Mic } from "lucide-react";

interface MicMeterProps {
  levelRef: RefObject<number>;
  active: boolean;
}

export function MicMeter({ levelRef, active }: MicMeterProps) {
  const reduceMotion = useReducedMotion();
  const level = useMotionValue(0);

  useAnimationFrame(() => {
    level.set(active ? (levelRef.current ?? 0) : 0);
  });

  const width = useTransform(level, (v) =>
    `${Math.min(100, Math.round((reduceMotion ? 0.0 : v) * 100))}%`,
  );

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Mic className="h-3 w-3" />
          Mic input
        </span>
        <span>{active ? "live" : "—"}</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="meter"
        aria-label="Microphone input level"
      >
        <motion.div
          style={{ width }}
          className="h-full rounded-full bg-gradient-to-r from-brand-from to-brand-to"
        />
      </div>
    </div>
  );
}
