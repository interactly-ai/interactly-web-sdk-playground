import type { FriendlyError } from "./interactly-types";

/**
 * Translate the raw errors the SDK / browser can throw into friendly,
 * actionable messages. Covers the full set of getUserMedia DOMException names
 * plus the SDK's one synchronous throw and generic fallbacks.
 */
export function mapError(error: unknown): FriendlyError {
  const name =
    typeof error === "object" && error !== null && "name" in error
      ? String((error as { name?: unknown }).name)
      : "";
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message?: unknown }).message)
      : typeof error === "string"
        ? error
        : "";

  switch (name) {
    case "NotAllowedError":
    case "SecurityError":
      return {
        title: "Microphone access blocked",
        message: "Permission to use the microphone was denied.",
        hint: "Allow microphone access for this site in your browser settings, then try again.",
        raw: error,
      };
    case "NotFoundError":
    case "OverconstrainedError":
      return {
        title: "No microphone found",
        message: "No usable audio input device is available.",
        hint: "Connect a microphone (or check your input settings) and try again.",
        raw: error,
      };
    case "NotReadableError":
    case "AbortError":
      return {
        title: "Microphone unavailable",
        message: "The microphone is in use by another application.",
        hint: "Close other apps that may be using the mic (Zoom, Meet, etc.) and try again.",
        raw: error,
      };
    case "TypeError":
      // getUserMedia missing / insecure context often surfaces as TypeError.
      return {
        title: "Microphone capture unavailable",
        message:
          "Your browser couldn't start audio capture. This usually means the page isn't served over HTTPS.",
        hint: "Use HTTPS or run on localhost.",
        raw: error,
      };
  }

  if (/server url is required/i.test(message)) {
    return {
      title: "Server URL is required",
      message: "The SDK needs a base server URL to connect.",
      hint: "Enter a valid Interactly server URL (e.g. https://api.interactly.ai).",
      raw: error,
    };
  }

  if (message) {
    return { title: "Something went wrong", message, raw: error };
  }

  return {
    title: "Unexpected error",
    message: "An unknown error occurred while handling the call.",
    raw: error,
  };
}

/**
 * When a WebSocket closes before the call ever reached "live" (no `call-start`),
 * the most likely cause is a bad/expired token (the SDK swallows the failed
 * session fetch and connects with `token=null`) or an unreachable server.
 */
export function diagnoseEarlyClose(closeEvent?: CloseEvent): FriendlyError {
  return {
    title: "Connection closed before the call started",
    message:
      "The call socket closed during setup. The most common causes are an invalid or expired API token, or a server URL the SDK can't reach.",
    hint: "Double-check your API token and server URL, then try again.",
    raw: closeEvent
      ? { code: closeEvent.code, reason: closeEvent.reason }
      : undefined,
  };
}
