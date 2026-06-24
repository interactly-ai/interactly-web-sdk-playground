import { useCallback, useEffect, useRef, useState } from "react";
import { Interactly } from "@interactly-ai/web";
import type {
  AssistantConfig,
  CallSummary,
  InteractlyEventMap,
  InteractlyEventName,
} from "@interactly-ai/web";
import {
  ACTIVE_STATUSES,
  type CallConfig,
  type CallStatus,
  type EventLogEntry,
  type FriendlyError,
  type LogLevel,
  type ReconnectState,
  type TimelineMessage,
} from "@/lib/interactly-types";
import { diagnoseEarlyClose, mapError } from "@/lib/error-map";
import { nextId, toEpochMs, truncateMiddle } from "@/lib/format";

const MAX_LOG_ENTRIES = 2000;

export interface UseInteractlyState {
  status: CallStatus;
  callConnected: boolean;
  userNumber: string | null;
  messages: TimelineMessage[];
  log: EventLogEntry[];
  assistantSpeaking: boolean;
  recordingUrl: string | null;
  summary: CallSummary | null;
  assistantConfig: AssistantConfig | null;
  reconnect: ReconnectState;
  error: FriendlyError | null;
  callStartedAt: number | null;
  callEndedAt: number | null;
  /** The live mic MediaStream (owned by the SDK) — used to drive the visualizer. */
  mediaStream: MediaStream | null;
}

export interface UseInteractlyActions {
  start: () => Promise<void>;
  stop: () => void;
  reconnectNow: () => Promise<void>;
  clearLog: () => void;
  clearTranscript: () => void;
  dismissError: () => void;
  reset: () => void;
}

export type UseInteractly = UseInteractlyState & UseInteractlyActions;

export function useInteractly(config: CallConfig): UseInteractly {
  const [status, setStatus] = useState<CallStatus>("idle");
  const [userNumber, setUserNumber] = useState<string | null>(null);
  const [messages, setMessages] = useState<TimelineMessage[]>([]);
  const [log, setLog] = useState<EventLogEntry[]>([]);
  const [assistantSpeaking, setAssistantSpeaking] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [summary, setSummary] = useState<CallSummary | null>(null);
  const [assistantConfig, setAssistantConfig] =
    useState<AssistantConfig | null>(null);
  const [reconnect, setReconnect] = useState<ReconnectState>({
    isReconnecting: false,
    attempt: 0,
    maxAttempts: config.reconnect.maxAttempts,
    failed: false,
  });
  const [error, setError] = useState<FriendlyError | null>(null);
  const [callStartedAt, setCallStartedAt] = useState<number | null>(null);
  const [callEndedAt, setCallEndedAt] = useState<number | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const instanceRef = useRef<Interactly | null>(null);
  const statusRef = useRef<CallStatus>("idle");
  const userStoppedRef = useRef(false);
  const sawCallStartRef = useRef(false);
  const handlersRef = useRef<
    Array<{ event: InteractlyEventName; cb: (arg: unknown) => void }>
  >([]);
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const updateStatus = useCallback((next: CallStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const pushLog = useCallback(
    (name: string, level: LogLevel, payload: unknown, logSummary?: string) => {
      setLog((prev) => {
        const entry: EventLogEntry = {
          id: nextId("evt"),
          name,
          level,
          at: Date.now(),
          payload,
          summary: logSummary,
        };
        const next = prev.length >= MAX_LOG_ENTRIES ? prev.slice(1) : prev.slice();
        next.push(entry);
        return next;
      });
    },
    [],
  );

  const detachHandlers = useCallback(() => {
    const inst = instanceRef.current;
    if (inst) {
      for (const { event, cb } of handlersRef.current) {
        try {
          inst.off(event, cb as InteractlyEventMap[typeof event]);
        } catch {
          /* ignore */
        }
      }
    }
    handlersRef.current = [];
  }, []);

  const attachHandlers = useCallback(
    (inst: Interactly) => {
      const registered: Array<{
        event: InteractlyEventName;
        cb: (arg: unknown) => void;
      }> = [];

      function add<K extends InteractlyEventName>(
        event: K,
        cb: (arg: Parameters<InteractlyEventMap[K]>[0]) => void,
      ) {
        inst.on(event, cb as InteractlyEventMap[K]);
        registered.push({ event, cb: cb as (arg: unknown) => void });
      }

      add("open", (event) =>
        pushLog("open", "info", serializeEvent(event), "WebSocket connection open"),
      );

      add("streamStart", (p) => {
        setMediaStream(inst.mediaStream ?? null);
        pushLog("streamStart", "info", p, "Microphone streaming started");
      });

      add("call-start", (num) => {
        sawCallStartRef.current = true;
        setUserNumber(num || "");
        setCallStartedAt(Date.now());
        updateStatus("live");
        pushLog(
          "call-start",
          "success",
          num,
          num ? `Call started · ${num}` : "Call started",
        );
      });

      add("call-end", () => {
        userStoppedRef.current = true; // remote completion — tear down cleanly
        setCallEndedAt((prev) => prev ?? Date.now());
        pushLog("call-end", "info", undefined, "Call ended by assistant/server");
        if (statusRef.current === "live" || statusRef.current === "connecting") {
          updateStatus("ended");
        }
        // Release mic + socket so the browser indicator clears.
        try {
          inst.stop();
        } catch {
          /* ignore */
        }
      });

      add("message", (m) => {
        const at = toEpochMs(m?.timestamp, Date.now());
        setMessages((prev) => [
          ...prev,
          {
            id: nextId("msg"),
            speaker: m?.speaker === "Assistant" ? "Assistant" : "User",
            text: typeof m?.text === "string" ? m.text : String(m?.text ?? ""),
            at,
          },
        ]);
        pushLog(
          "message",
          "info",
          m,
          `${m?.speaker ?? "?"}: ${truncateMiddle(String(m?.text ?? ""), 60)}`,
        );
      });

      add("assistant-config", (cfg) => {
        setAssistantConfig(cfg ?? null);
        pushLog("assistant-config", "info", cfg, "Assistant configuration received");
      });

      add("audioPlay", (p) => {
        setAssistantSpeaking(true);
        pushLog("audioPlay", "audio", p, "Assistant audio playing");
      });

      add("audioEnd", (p) => {
        setAssistantSpeaking(false);
        pushLog("audioEnd", "audio", p, "Assistant audio ended");
      });

      // recording & summary only fire because start() patches the handler map.
      add("recording", (s3Link) => {
        const url = s3Link || null;
        setRecordingUrl(url);
        pushLog(
          "recording",
          "success",
          s3Link,
          url ? "Recording link available" : "Recording event (empty link)",
        );
      });

      add("summary", (s) => {
        setSummary(s ?? null);
        pushLog("summary", "success", s, "Call summary received");
      });

      add("reconnecting", (p) => {
        setReconnect({
          isReconnecting: true,
          attempt: p?.attempt ?? 0,
          maxAttempts: p?.maxAttempts ?? configRef.current.reconnect.maxAttempts,
          failed: false,
        });
        pushLog(
          "reconnecting",
          "reconnect",
          p,
          `Reconnecting (attempt ${p?.attempt}/${p?.maxAttempts})`,
        );
      });

      add("reconnected", (p) => {
        setReconnect((r) => ({ ...r, isReconnecting: false, failed: false }));
        pushLog("reconnected", "success", p, "Reconnected");
      });

      add("reconnectError", (p) => {
        const reason =
          p?.error instanceof Error ? p.error.message : String(p?.error ?? "");
        setReconnect((r) => ({
          ...r,
          isReconnecting: false,
          attempt: p?.attempt ?? r.attempt,
          lastError: reason,
        }));
        pushLog(
          "reconnectError",
          "warning",
          p,
          `Reconnect attempt ${p?.attempt} failed`,
        );
      });

      add("reconnectFailed", (p) => {
        setReconnect((r) => ({ ...r, isReconnecting: false, failed: true }));
        pushLog(
          "reconnectFailed",
          "error",
          p,
          p?.message || "Reconnection failed (max attempts reached)",
        );
      });

      add("error", (e) => {
        const fe = mapError(e);
        setError(fe);
        pushLog("error", "error", serializeError(e), fe.title);
        if (statusRef.current !== "live" && !userStoppedRef.current) {
          updateStatus("error");
        }
      });

      add("close", (event) => {
        const ce = event as unknown as CloseEvent;
        pushLog(
          "close",
          "warning",
          { code: ce?.code, reason: ce?.reason, wasClean: ce?.wasClean },
          `WebSocket closed${ce?.code != null ? ` (${ce.code})` : ""}`,
        );
        if (userStoppedRef.current) {
          if (statusRef.current !== "ended") updateStatus("ended");
          return;
        }
        if (!sawCallStartRef.current) {
          // Closed during setup → most likely a bad token or unreachable server.
          const fe = diagnoseEarlyClose(ce);
          setError(fe);
          updateStatus("error");
        } else if (statusRef.current !== "error") {
          updateStatus("ended");
          setCallEndedAt((prev) => prev ?? Date.now());
        }
      });

      add("streamEnd", (p) => {
        setMediaStream(null);
        pushLog("streamEnd", "info", p, "Microphone streaming stopped");
        if (statusRef.current === "ending" || userStoppedRef.current) {
          updateStatus("ended");
          setCallEndedAt((prev) => prev ?? Date.now());
        }
      });

      // Declared by the SDK but never emitted in v1.1.0 — registered for parity.
      add("disconnect", (d) => pushLog("disconnect", "info", d, "Disconnect event"));

      add("unknown", (d) =>
        pushLog("unknown", "warning", d, "Unknown server message"),
      );

      handlersRef.current = registered;
    },
    [pushLog, updateStatus],
  );

  const start = useCallback(async () => {
    if (ACTIVE_STATUSES.includes(statusRef.current)) return;

    // Tear down any previous instance before creating a fresh one.
    if (instanceRef.current) {
      detachHandlers();
      try {
        instanceRef.current.stop();
      } catch {
        /* ignore */
      }
      instanceRef.current = null;
    }

    const cfg = configRef.current;

    // Reset transient state so every call starts fresh — clear the previous
    // call's transcript and event log, not just the status/artifacts.
    setMessages([]);
    setLog([]);
    setError(null);
    setUserNumber(null);
    setRecordingUrl(null);
    setSummary(null);
    setAssistantConfig(null);
    setAssistantSpeaking(false);
    setCallStartedAt(null);
    setCallEndedAt(null);
    setMediaStream(null);
    setReconnect({
      isReconnecting: false,
      attempt: 0,
      maxAttempts: cfg.reconnect.maxAttempts,
      failed: false,
    });
    userStoppedRef.current = false;
    sawCallStartRef.current = false;

    // 1) Construct — throws synchronously if `server` is empty.
    let inst: Interactly;
    try {
      inst = new Interactly({
        apiToken: cfg.apiToken,
        server: cfg.server,
        assistantId: cfg.assistantId || undefined,
        reconnect: { ...cfg.reconnect },
      });
    } catch (e) {
      const fe = mapError(e);
      setError(fe);
      pushLog("error", "error", serializeError(e), fe.title);
      updateStatus("error");
      return;
    }
    instanceRef.current = inst;

    // 2) Patch the missing handler buckets so recording/summary actually fire.
    if (!Array.isArray(inst.eventHandlers.recording)) {
      inst.eventHandlers.recording = [];
    }
    if (!Array.isArray(inst.eventHandlers.summary)) {
      inst.eventHandlers.summary = [];
    }

    // 3) Wire every event into state.
    attachHandlers(inst);

    // 4) Connect + request mic + stream.
    updateStatus("connecting");
    try {
      await inst.start(cfg.assistantId || undefined);
    } catch (e) {
      // getUserMedia/connect failures also emit 'error'; catch here too so a
      // rejected promise never goes unhandled.
      if (!userStoppedRef.current && statusRef.current !== "error") {
        const fe = mapError(e);
        setError(fe);
        updateStatus("error");
      }
    }
  }, [attachHandlers, detachHandlers, pushLog, updateStatus]);

  const stop = useCallback(() => {
    const inst = instanceRef.current;
    if (!inst) return;
    if (
      !ACTIVE_STATUSES.includes(statusRef.current) &&
      statusRef.current !== "ending"
    ) {
      return; // already idle/ended/error — nothing to stop
    }
    userStoppedRef.current = true;
    updateStatus("ending");
    pushLog("streamEnd", "info", { reason: "user-stop" }, "Stopping call…");
    try {
      inst.stop();
    } catch (e) {
      pushLog("error", "error", serializeError(e), "Error while stopping");
    }
    // streamEnd handler advances us to 'ended'. Guarantee it as a fallback.
    updateStatus("ended");
    setCallEndedAt((prev) => prev ?? Date.now());
  }, [pushLog, updateStatus]);

  const reconnectNow = useCallback(async () => {
    const inst = instanceRef.current;
    if (!inst) return;
    pushLog("reconnecting", "reconnect", undefined, "Manual reconnect requested");
    try {
      await inst.manualReconnect();
    } catch (e) {
      const fe = mapError(e);
      setError(fe);
      pushLog("error", "error", serializeError(e), "Manual reconnect failed");
    }
  }, [pushLog]);

  const clearLog = useCallback(() => setLog([]), []);
  const clearTranscript = useCallback(() => setMessages([]), []);
  const dismissError = useCallback(() => setError(null), []);

  const reset = useCallback(() => {
    const inst = instanceRef.current;
    if (inst) {
      userStoppedRef.current = true;
      try {
        inst.stop();
      } catch {
        /* ignore */
      }
      detachHandlers();
      instanceRef.current = null;
    }
    setMessages([]);
    setLog([]);
    setError(null);
    setUserNumber(null);
    setRecordingUrl(null);
    setSummary(null);
    setAssistantConfig(null);
    setAssistantSpeaking(false);
    setCallStartedAt(null);
    setCallEndedAt(null);
    setMediaStream(null);
    setReconnect({
      isReconnecting: false,
      attempt: 0,
      maxAttempts: configRef.current.reconnect.maxAttempts,
      failed: false,
    });
    updateStatus("idle");
  }, [detachHandlers, updateStatus]);

  // Cleanup on unmount + best-effort teardown when the tab/page goes away.
  useEffect(() => {
    const handleUnload = () => {
      try {
        instanceRef.current?.stop();
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
      handleUnload();
      detachHandlers();
    };
  }, [detachHandlers]);

  return {
    status,
    callConnected: status === "live",
    userNumber,
    messages,
    log,
    assistantSpeaking,
    recordingUrl,
    summary,
    assistantConfig,
    reconnect,
    error,
    callStartedAt,
    callEndedAt,
    mediaStream,
    start,
    stop,
    reconnectNow,
    clearLog,
    clearTranscript,
    dismissError,
    reset,
  };
}

/** Pull the useful, serializable bits out of a DOM Event for the log. */
function serializeEvent(event: unknown): unknown {
  if (event instanceof Event) {
    return { type: event.type };
  }
  return event;
}

function serializeError(error: unknown): unknown {
  if (error instanceof Error) {
    return { name: error.name, message: error.message };
  }
  if (error instanceof Event) {
    return { type: error.type };
  }
  return error;
}
