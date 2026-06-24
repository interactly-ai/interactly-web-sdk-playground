import type { LogLevel } from "@/lib/interactly-types";

export const LOG_LEVELS: LogLevel[] = [
  "info",
  "success",
  "warning",
  "error",
  "audio",
  "reconnect",
];

export const LEVEL_DOT: Record<LogLevel, string> = {
  info: "bg-log-info",
  success: "bg-log-success",
  warning: "bg-log-warning",
  error: "bg-log-error",
  audio: "bg-log-audio",
  reconnect: "bg-log-reconnect",
};

export const LEVEL_TEXT: Record<LogLevel, string> = {
  info: "text-log-info",
  success: "text-log-success",
  warning: "text-log-warning",
  error: "text-log-error",
  audio: "text-log-audio",
  reconnect: "text-log-reconnect",
};

export const LEVEL_LABEL: Record<LogLevel, string> = {
  info: "Info",
  success: "Success",
  warning: "Warning",
  error: "Error",
  audio: "Audio",
  reconnect: "Reconnect",
};
