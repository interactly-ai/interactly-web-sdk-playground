import { useCallback, useEffect, useState } from "react";

export interface MicDevice {
  deviceId: string;
  label: string;
}

export type MicPermission = "prompt" | "granted" | "denied" | "unknown";

/**
 * Enumerate audio input devices and track mic permission. Device labels are
 * only revealed by the browser after permission is granted, so before a call
 * we fall back to generic "Microphone N" names.
 *
 * Note: the Interactly SDK always captures the system-default device
 * (`getUserMedia({ audio: true })`) — this selection drives our own visualizer
 * analyser and is surfaced to the user as an informational control.
 */
export function useMediaDevices() {
  const [devices, setDevices] = useState<MicDevice[]>([]);
  const [permission, setPermission] = useState<MicPermission>("unknown");

  const refresh = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      const mics = list
        .filter((d) => d.kind === "audioinput")
        .map((d, i) => ({
          deviceId: d.deviceId,
          label: d.label || `Microphone ${i + 1}`,
        }));
      setDevices(mics);
    } catch {
      /* ignore enumeration failures */
    }
  }, []);

  useEffect(() => {
    void refresh();

    const mediaDevices = navigator.mediaDevices;
    mediaDevices?.addEventListener?.("devicechange", refresh);

    let permStatus: PermissionStatus | undefined;
    const onPermChange = () => {
      if (permStatus) setPermission(permStatus.state as MicPermission);
    };
    navigator.permissions
      ?.query?.({ name: "microphone" as PermissionName })
      .then((status) => {
        permStatus = status;
        setPermission(status.state as MicPermission);
        status.addEventListener("change", onPermChange);
        // Labels appear once granted — refresh to pick them up.
        if (status.state === "granted") void refresh();
      })
      .catch(() => {
        /* permissions API unsupported (e.g. Safari) */
      });

    return () => {
      mediaDevices?.removeEventListener?.("devicechange", refresh);
      permStatus?.removeEventListener("change", onPermChange);
    };
  }, [refresh]);

  return { devices, permission, refresh };
}
