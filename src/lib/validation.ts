import type { CallConfig } from "./interactly-types";

export interface ConfigValidation {
  errors: {
    server?: string;
    apiToken?: string;
  };
  warnings: {
    server?: string;
    assistantId?: string;
  };
  hasErrors: boolean;
}

function isLocalHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname.endsWith(".localhost")
  );
}

/**
 * Validate a CallConfig the way the SDK will actually use it:
 *  - `server` must be a parseable http(s) URL (the SDK does
 *    `server.replace('http','ws')`, so a non-http URL produces a broken socket
 *    and the constructor throws on an empty value).
 *  - `apiToken` is required to fetch the call session.
 *  - `assistantId` is optional but the call won't route meaningfully without it.
 */
export function validateConfig(config: CallConfig): ConfigValidation {
  const errors: ConfigValidation["errors"] = {};
  const warnings: ConfigValidation["warnings"] = {};

  const server = config.server.trim();
  if (!server) {
    errors.server = "Server URL is required.";
  } else {
    let url: URL | null = null;
    try {
      url = new URL(server);
    } catch {
      url = null;
    }
    if (!url || !/^https?:$/.test(url.protocol)) {
      errors.server = "Enter a valid URL starting with http:// or https://";
    } else if (url.protocol === "http:" && !isLocalHost(url.hostname)) {
      warnings.server =
        "Insecure http:// — production endpoints should use https://";
    }
  }

  if (!config.apiToken.trim()) {
    errors.apiToken = "API token is required to authenticate the session.";
  }

  if (!config.assistantId.trim()) {
    warnings.assistantId =
      "No assistant ID — the call may not connect to an assistant.";
  }

  return {
    errors,
    warnings,
    hasErrors: Object.keys(errors).length > 0,
  };
}
