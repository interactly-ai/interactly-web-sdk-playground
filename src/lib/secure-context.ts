/**
 * Microphone capture (getUserMedia) requires a "secure context": HTTPS, or
 * localhost / 127.0.0.1 during development. These helpers detect that up front
 * so the UI can block the call and explain why, instead of failing mysteriously
 * deep inside the SDK.
 */

export interface SecureContextInfo {
  isSecure: boolean;
  hasMediaDevices: boolean;
  /** True only when both conditions for a live mic call are met. */
  canUseMic: boolean;
  reason?: string;
}

export function getSecureContextInfo(): SecureContextInfo {
  if (typeof window === "undefined") {
    return {
      isSecure: false,
      hasMediaDevices: false,
      canUseMic: false,
      reason: "Not running in a browser.",
    };
  }

  const isSecure = window.isSecureContext === true;
  const hasMediaDevices =
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function";

  let reason: string | undefined;
  if (!isSecure) {
    reason =
      "This page isn't a secure context. Microphone access needs HTTPS (or localhost during development).";
  } else if (!hasMediaDevices) {
    reason =
      "This browser doesn't expose getUserMedia, so microphone capture isn't available.";
  }

  return {
    isSecure,
    hasMediaDevices,
    canUseMic: isSecure && hasMediaDevices,
    reason,
  };
}
