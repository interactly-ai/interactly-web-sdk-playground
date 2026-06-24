import { useEffect, useState } from "react";

/**
 * Live elapsed time (ms) for a call. Ticks while `active`, freezes at
 * `endedAt - startedAt` once the call is over.
 */
export function useCallTimer(
  startedAt: number | null,
  endedAt: number | null,
  active: boolean,
): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active || startedAt == null) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [active, startedAt]);

  if (startedAt == null) return 0;
  const end = endedAt ?? (active ? now : startedAt);
  return Math.max(0, end - startedAt);
}
