import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_CONFIG,
  DEFAULT_RECONNECT,
  type CallConfig,
  type ReconnectSettings,
} from "@/lib/interactly-types";
import { parseLocationConfig, removeTokenFromUrl, writeConfigToHash } from "@/lib/url-state";

const STORAGE_KEY = "interactly-config";
const TOKEN_KEY = "interactly-token";

function mergeConfig(base: CallConfig, patch: Partial<CallConfig>): CallConfig {
  return {
    ...base,
    ...patch,
    reconnect: { ...base.reconnect, ...(patch.reconnect ?? {}) },
  };
}

function stripToken(config: CallConfig): Omit<CallConfig, "apiToken"> & {
  apiToken: "";
} {
  return { ...config, apiToken: "" };
}

interface Hydration {
  config: CallConfig;
  tokenInUrl: boolean;
  remember: boolean;
}

function hydrate(): Hydration {
  let config: CallConfig = {
    ...DEFAULT_CONFIG,
    reconnect: { ...DEFAULT_RECONNECT },
  };
  let remember = false;

  // 1) Non-secret config from localStorage.
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<CallConfig>;
      config = mergeConfig(config, { ...parsed, apiToken: config.apiToken });
    }
  } catch {
    /* ignore */
  }

  // 2) Token from localStorage (only if the user opted to remember it).
  try {
    const tok = window.localStorage.getItem(TOKEN_KEY);
    if (tok) {
      config.apiToken = tok;
      remember = true;
    }
  } catch {
    /* ignore */
  }

  // 3) URL hash takes precedence over everything.
  let tokenInUrl = false;
  const decoded = parseLocationConfig();
  if (decoded) {
    config = mergeConfig(config, decoded.config);
    tokenInUrl = decoded.hadToken;
  }

  return { config, tokenInUrl, remember };
}

export interface UseUrlState {
  config: CallConfig;
  updateConfig: (patch: Partial<CallConfig>) => void;
  updateReconnect: (patch: Partial<ReconnectSettings>) => void;
  resetConfig: () => void;
  tokenInUrl: boolean;
  dismissTokenInUrl: () => void;
  removeToken: () => void;
  rememberToken: boolean;
  setRememberToken: (value: boolean) => void;
}

export function useUrlState(): UseUrlState {
  const initial = useRef<Hydration>();
  if (!initial.current) initial.current = hydrate();

  const [config, setConfig] = useState<CallConfig>(initial.current.config);
  const [tokenInUrl, setTokenInUrl] = useState(initial.current.tokenInUrl);
  const [rememberToken, setRememberTokenState] = useState(
    initial.current.remember,
  );

  const updateConfig = useCallback((patch: Partial<CallConfig>) => {
    setConfig((prev) => mergeConfig(prev, patch));
  }, []);

  const updateReconnect = useCallback((patch: Partial<ReconnectSettings>) => {
    setConfig((prev) => ({
      ...prev,
      reconnect: { ...prev.reconnect, ...patch },
    }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig({ ...DEFAULT_CONFIG, reconnect: { ...DEFAULT_RECONNECT } });
  }, []);

  // Persist non-secret config.
  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(stripToken(config)),
      );
    } catch {
      /* ignore */
    }
  }, [config]);

  // Persist token only when explicitly remembered.
  useEffect(() => {
    try {
      if (rememberToken && config.apiToken) {
        window.localStorage.setItem(TOKEN_KEY, config.apiToken);
      } else {
        window.localStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      /* ignore */
    }
  }, [rememberToken, config.apiToken]);

  // Debounced, token-free hash sync so links reproduce non-secret setup.
  useEffect(() => {
    const id = window.setTimeout(() => writeConfigToHash(config), 400);
    return () => window.clearTimeout(id);
  }, [config]);

  const dismissTokenInUrl = useCallback(() => setTokenInUrl(false), []);

  const removeToken = useCallback(() => {
    removeTokenFromUrl(config);
    setTokenInUrl(false);
  }, [config]);

  const setRememberToken = useCallback((value: boolean) => {
    setRememberTokenState(value);
  }, []);

  return {
    config,
    updateConfig,
    updateReconnect,
    resetConfig,
    tokenInUrl,
    dismissTokenInUrl,
    removeToken,
    rememberToken,
    setRememberToken,
  };
}
