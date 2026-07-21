/**
 * Ambient type declarations for `@interactly-ai/web` (v1.1.0), which ships as
 * untyped CommonJS. These types are reverse-engineered from the published
 * source (index.js) and are intentionally faithful to its real runtime shape —
 * including its quirks (see notes below) so the rest of the app can rely on them.
 *
 * Source facts encoded here:
 *  - `module.exports = { Interactly }`  → use the NAMED import.
 *  - The constructor THROWS `Error('server url is required')` when `server` is empty.
 *  - `recording` & `summary` ARE emitted but their keys are MISSING from the
 *    runtime `eventHandlers` map, so `on()` for them no-ops unless the map is
 *    patched first. We expose `eventHandlers` so the app can patch it.
 *  - Automatic reconnect is dead code; only `manualReconnect()` triggers it.
 */
declare module "@interactly-ai/web" {
  export type Speaker = "Assistant" | "User";

  export interface TranscriptMessage {
    speaker: Speaker;
    text: string;
    /** SDK defaults to `new Date()`, but the server may also send a string. */
    timestamp: Date | string | number;
  }

  export interface TimestampPayload {
    timestamp: number;
  }

  /** `audioEnd` fires with one of two shapes depending on how playback ended. */
  export type AudioEndPayload =
    | { timestamp: number }
    | { playbackMilliseconds: number };

  export interface ReconnectingPayload {
    attempt: number;
    delay: number;
    maxAttempts: number;
  }
  export interface ReconnectedPayload {
    timestamp: number;
  }
  export interface ReconnectErrorPayload {
    error: unknown;
    attempt: number;
  }
  export interface ReconnectFailedPayload {
    attempts: number;
    message: string;
  }

  export type AssistantConfig = Record<string, unknown>;
  export type CallSummary = Record<string, unknown>;

  /** v1.1.1+: call-start emits the full payload with call details. */
  export interface CallStartPayload {
    direction?: string;
    assistantNumber?: string;
    userNumber?: string;
    callSid?: string;
    status?: string;
    reason?: string;
    timestamp?: number;
  }

  /** v1.1.1+: call-end emits the full payload with final call state. */
  export interface CallEndPayload {
    direction?: string;
    assistantNumber?: string;
    userNumber?: string;
    callSid?: string;
    status?: string;
    reason?: string;
    timestamp?: number;
  }

  export interface InteractlyEventMap {
    open: (event: Event) => void;
    close: (event: CloseEvent) => void;
    error: (error: unknown) => void;
    message: (message: TranscriptMessage) => void;
    /** Declared in the SDK but never emitted in v1.1.0. */
    disconnect: (data: unknown) => void;
    streamStart: (payload: TimestampPayload) => void;
    streamEnd: (payload: TimestampPayload) => void;
    audioPlay: (payload: TimestampPayload) => void;
    audioEnd: (payload: AudioEndPayload) => void;
    reconnecting: (payload: ReconnectingPayload) => void;
    reconnected: (payload: ReconnectedPayload) => void;
    reconnectError: (payload: ReconnectErrorPayload) => void;
    reconnectFailed: (payload: ReconnectFailedPayload) => void;
    "call-start": (payload: CallStartPayload) => void;
    "call-end": (payload: CallEndPayload) => void;
    "assistant-config": (config: AssistantConfig) => void;
    /** Emitted by the SDK but unregistered in the handler map (patch required). */
    recording: (s3Link: string) => void;
    /** Emitted by the SDK but unregistered in the handler map (patch required). */
    summary: (summary: CallSummary) => void;
    unknown: (data: unknown) => void;
  }

  export type InteractlyEventName = keyof InteractlyEventMap;

  export interface ReconnectOptions {
    enabled?: boolean;
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
    factor?: number;
  }

  export interface InteractlyOptions {
    apiToken: string;
    /** REQUIRED. Constructor throws `Error('server url is required')` if empty. */
    server: string;
    assistantId?: string;
    reconnect?: ReconnectOptions;
  }

  export class Interactly {
    constructor(options: InteractlyOptions);

    // --- Inspectable instance state (used by the playground) ---
    ws: WebSocket | null;
    mediaStream: MediaStream | null;
    audioContext: AudioContext | null;
    isRecording: boolean;
    currentSource: AudioBufferSourceNode | null;
    /**
     * The internal event-handler registry. Exposed so consumers can patch in
     * the missing `recording`/`summary` keys before calling `on()`.
     */
    eventHandlers: Record<string, Array<(...args: unknown[]) => void>>;
    reconnectConfig: Required<ReconnectOptions>;
    reconnectAttempts: number;
    isReconnecting: boolean;

    // --- Public API ---
    on<K extends InteractlyEventName>(
      event: K,
      callback: InteractlyEventMap[K],
    ): this;
    off<K extends InteractlyEventName>(
      event: K,
      callback: InteractlyEventMap[K],
    ): this;
    emit<K extends InteractlyEventName>(event: K, data?: unknown): void;

    start(assistantId?: string): Promise<void>;
    stop(): void;
    manualReconnect(): Promise<void>;
  }
}
