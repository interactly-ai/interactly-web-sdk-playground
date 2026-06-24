import { type RefObject } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { Loader2, Mic, Phone, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioOrbProps {
  levelRef: RefObject<number>;
  active: boolean;
  connecting: boolean;
  assistantSpeaking: boolean;
}

export function AudioOrb({
  levelRef,
  active,
  connecting,
  assistantSpeaking,
}: AudioOrbProps) {
  const reduceMotion = useReducedMotion();
  const raw = useMotionValue(0);
  const smooth = useSpring(raw, { stiffness: 140, damping: 18, mass: 0.4 });

  useAnimationFrame(() => {
    raw.set(active && !reduceMotion ? (levelRef.current ?? 0) : 0);
  });

  const coreScale = useTransform(smooth, [0, 1], [1, 1.14]);
  const ringScale = useTransform(smooth, [0, 1], [1.04, 1.55]);
  const ringOpacity = useTransform(smooth, [0, 1], [0.18, 0.5]);

  const label = !active
    ? connecting
      ? "Connecting…"
      : "Idle"
    : assistantSpeaking
      ? "Assistant speaking"
      : "Listening…";

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-2">
      <div className="relative flex h-44 w-44 items-center justify-center sm:h-48 sm:w-48">
        {/* Reactive outer ring (mic level). */}
        {active ? (
          <motion.div
            style={{ scale: ringScale, opacity: ringOpacity }}
            className="absolute inset-3 rounded-full bg-brand-gradient blur-md"
          />
        ) : null}

        {/* Assistant-speaking halo. */}
        {active && assistantSpeaking ? (
          <motion.div
            className="absolute inset-0 rounded-full bg-brand-gradient"
            animate={
              reduceMotion
                ? { opacity: 0.35 }
                : { scale: [1, 1.18, 1], opacity: [0.45, 0.15, 0.45] }
            }
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : null}

        {/* Connecting pulse. */}
        {connecting && !active ? (
          <span className="absolute inset-6 rounded-full border border-warning/40 motion-safe:animate-pulse-ring" />
        ) : null}

        {/* Idle breathing ring. */}
        {!active && !connecting ? (
          <div className="absolute inset-6 rounded-full border border-border" />
        ) : null}

        {/* Core orb. */}
        <motion.div
          style={{ scale: active ? coreScale : 1 }}
          className={cn(
            "relative flex h-24 w-24 items-center justify-center rounded-full text-white shadow-glow transition-colors duration-500 sm:h-28 sm:w-28",
            active
              ? "bg-brand-gradient"
              : "bg-gradient-to-br from-muted-foreground/30 to-muted-foreground/10 text-muted-foreground shadow-none",
          )}
        >
          {/* glossy highlight */}
          <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/30 to-transparent opacity-60" />
          {!active && !connecting ? (
            <Phone className="h-8 w-8" />
          ) : connecting ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : assistantSpeaking ? (
            <Volume2 className="h-8 w-8" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </motion.div>
      </div>

      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
