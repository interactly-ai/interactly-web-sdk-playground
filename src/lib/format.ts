/** Format an elapsed duration (ms) as m:ss or h:mm:ss. */
export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
}

/** Format an epoch timestamp as a wall-clock time (HH:MM:SS). */
export function formatClock(at: number): string {
  const d = new Date(at);
  if (Number.isNaN(d.getTime())) return "--:--:--";
  return d.toLocaleTimeString([], {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** Format an epoch timestamp with millisecond precision for the event log. */
export function formatClockMs(at: number): string {
  const d = new Date(at);
  if (Number.isNaN(d.getTime())) return "--:--:--.---";
  const base = d.toLocaleTimeString([], {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return `${base}.${d.getMilliseconds().toString().padStart(3, "0")}`;
}

/**
 * Normalize the SDK's `message.timestamp` (which may be a Date, an ISO string,
 * or a number) into epoch ms. Falls back to `now` when unparseable.
 */
export function toEpochMs(
  value: Date | string | number | undefined,
  now: number,
): number {
  if (value == null) return now;
  if (typeof value === "number") return Number.isFinite(value) ? value : now;
  const d = value instanceof Date ? value : new Date(value);
  const t = d.getTime();
  return Number.isNaN(t) ? now : t;
}

/** Safe, pretty JSON stringify that tolerates circular refs and Errors. */
export function safeStringify(value: unknown, space = 2): string {
  const seen = new WeakSet();
  try {
    return JSON.stringify(
      value,
      (_key, val) => {
        if (val instanceof Error) {
          return { name: val.name, message: val.message, stack: val.stack };
        }
        if (typeof val === "object" && val !== null) {
          if (seen.has(val)) return "[Circular]";
          seen.add(val);
        }
        if (typeof val === "bigint") return val.toString();
        if (typeof val === "function") return `[Function ${val.name || "anonymous"}]`;
        return val;
      },
      space,
    );
  } catch {
    return String(value);
  }
}

/** Truncate a long string in the middle, keeping head and tail. */
export function truncateMiddle(str: string, max = 48): string {
  if (str.length <= max) return str;
  const head = Math.ceil((max - 1) / 2);
  const tail = Math.floor((max - 1) / 2);
  return `${str.slice(0, head)}…${str.slice(str.length - tail)}`;
}

/** Trigger a client-side download of text content. */
export function downloadText(
  filename: string,
  content: string,
  type = "text/plain",
): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke on the next tick so the download has time to start.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Monotonic-ish unique id generator (avoids Math.random for SSR friendliness). */
let __idCounter = 0;
export function nextId(prefix = "id"): string {
  __idCounter = (__idCounter + 1) % Number.MAX_SAFE_INTEGER;
  return `${prefix}-${__idCounter}-${performance.now().toString(36).replace(".", "")}`;
}
