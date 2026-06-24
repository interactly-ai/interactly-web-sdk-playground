import {
  DEFAULT_RECONNECT,
  DEFAULT_SERVER,
  type CallConfig,
  type ReconnectSettings,
} from "./interactly-types";

/**
 * Shareable config is stored in the URL **hash** (not the query string): the
 * hash is never sent to the server and never lands in server access logs, which
 * is the safest place for an (opt-in) token. We encode a compact JSON object as
 * base64url so a single `#cfg=` param round-trips arbitrary server URLs.
 *
 * Secret policy: `apiToken` is included ONLY when `includeToken` is true. The
 * automatic hash-sync (writeConfigToHash) never writes the token.
 */

const PARAM = "cfg";

interface EncodedConfig {
  v: 1;
  s?: string; // server (omitted when default)
  a?: string; // assistantId (omitted when empty)
  t?: string; // apiToken (only when explicitly shared)
  rc?: Partial<ReconnectSettings>; // reconnect (only when non-default)
}

function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(b64: string): string {
  const normalized = b64.replace(/-/g, "+").replace(/_/g, "/");
  const pad =
    normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  const bin = atob(normalized + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function diffReconnect(
  rc: ReconnectSettings,
): Partial<ReconnectSettings> | undefined {
  const out: Partial<ReconnectSettings> = {};
  let changed = false;
  (Object.keys(DEFAULT_RECONNECT) as Array<keyof ReconnectSettings>).forEach(
    (k) => {
      if (rc[k] !== DEFAULT_RECONNECT[k]) {
        // @ts-expect-error index assignment across union is safe here
        out[k] = rc[k];
        changed = true;
      }
    },
  );
  return changed ? out : undefined;
}

export function encodeConfig(config: CallConfig, includeToken: boolean): string {
  const payload: EncodedConfig = { v: 1 };
  if (config.server && config.server !== DEFAULT_SERVER) payload.s = config.server;
  if (config.assistantId) payload.a = config.assistantId;
  const rc = diffReconnect(config.reconnect);
  if (rc) payload.rc = rc;
  if (includeToken && config.apiToken) payload.t = config.apiToken;
  return toBase64Url(JSON.stringify(payload));
}

export interface DecodedConfig {
  config: Partial<CallConfig>;
  hadToken: boolean;
}

export function decodeConfig(raw: string): DecodedConfig | null {
  try {
    const json = fromBase64Url(raw);
    const data = JSON.parse(json) as Partial<EncodedConfig>;
    if (!data || typeof data !== "object") return null;

    const config: Partial<CallConfig> = {};
    if (typeof data.s === "string") config.server = data.s;
    if (typeof data.a === "string") config.assistantId = data.a;
    if (typeof data.t === "string") config.apiToken = data.t;

    if (data.rc && typeof data.rc === "object") {
      const rc: ReconnectSettings = { ...DEFAULT_RECONNECT };
      const src = data.rc as Partial<ReconnectSettings>;
      if (typeof src.enabled === "boolean") rc.enabled = src.enabled;
      if (Number.isFinite(src.maxAttempts)) rc.maxAttempts = Number(src.maxAttempts);
      if (Number.isFinite(src.initialDelay))
        rc.initialDelay = Number(src.initialDelay);
      if (Number.isFinite(src.maxDelay)) rc.maxDelay = Number(src.maxDelay);
      if (Number.isFinite(src.factor)) rc.factor = Number(src.factor);
      config.reconnect = rc;
    }

    return { config, hadToken: typeof data.t === "string" && data.t.length > 0 };
  } catch {
    return null;
  }
}

/** Read & decode the config currently encoded in the location hash. */
export function parseLocationConfig(): DecodedConfig | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const raw = params.get(PARAM);
  if (!raw) return null;
  return decodeConfig(raw);
}

/** Build a full shareable URL for the given config. */
export function buildShareUrl(config: CallConfig, includeToken: boolean): string {
  const encoded = encodeConfig(config, includeToken);
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#${PARAM}=${encoded}`;
}

/**
 * Sync non-secret config into the hash without adding a history entry. The
 * token is deliberately never written here — only explicit sharing can embed it.
 */
export function writeConfigToHash(config: CallConfig): void {
  if (typeof window === "undefined") return;
  const encoded = encodeConfig(config, /* includeToken */ false);
  const newHash = `#${PARAM}=${encoded}`;
  if (window.location.hash !== newHash) {
    window.history.replaceState(null, "", newHash);
  }
}

/** Strip any token from the URL by re-writing the hash without it. */
export function removeTokenFromUrl(config: CallConfig): void {
  writeConfigToHash(config);
}
