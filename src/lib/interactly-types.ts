import type { Speaker } from "@interactly-ai/web";

/** The playground's high-level call state machine. */
export type CallStatus =
  | "idle"
  | "requesting-mic"
  | "connecting"
  | "live"
  | "ending"
  | "ended"
  | "error";

export const ACTIVE_STATUSES: CallStatus[] = [
  "requesting-mic",
  "connecting",
  "live",
];

/** A normalized transcript line for rendering. */
export interface TimelineMessage {
  id: string;
  speaker: Speaker;
  text: string;
  /** Epoch ms. */
  at: number;
}

/** Severity used to color-code the event inspector. */
export type LogLevel =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "audio"
  | "reconnect";

/** One entry in the live event inspector. */
export interface EventLogEntry {
  id: string;
  /** SDK event name (e.g. "call-start", "message"). */
  name: string;
  level: LogLevel;
  /** Epoch ms. */
  at: number;
  /** Raw event payload, rendered as collapsible JSON. */
  payload: unknown;
  /** Optional one-line human summary shown inline. */
  summary?: string;
}

export interface ReconnectSettings {
  enabled: boolean;
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  factor: number;
}

/** Everything needed to construct an Interactly instance + start a call. */
export interface CallConfig {
  apiToken: string;
  server: string;
  assistantId: string;
  reconnect: ReconnectSettings;
}

export interface ReconnectState {
  isReconnecting: boolean;
  attempt: number;
  maxAttempts: number;
  lastError?: string;
  failed: boolean;
}

/** A friendly, actionable error surfaced to the user. */
export interface FriendlyError {
  title: string;
  message: string;
  hint?: string;
  /** The raw error/name, for the inspector. */
  raw?: unknown;
}

export const DEFAULT_SERVER = "https://api.interactly.ai";

export const DEFAULT_RECONNECT: ReconnectSettings = {
  enabled: true,
  maxAttempts: 10,
  initialDelay: 1000,
  maxDelay: 30000,
  factor: 2,
};

export const DEFAULT_CONFIG: CallConfig = {
  apiToken: "",
  server: DEFAULT_SERVER,
  assistantId: "",
  reconnect: { ...DEFAULT_RECONNECT },
};
