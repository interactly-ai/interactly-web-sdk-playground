import { useEffect, useRef } from "react";

/**
 * Drives the audio visualizer. The Interactly SDK never exposes microphone
 * volume, so we attach our OWN AnalyserNode to the SDK-owned MediaStream (no
 * second getUserMedia) and compute a smoothed RMS level in [0, 1].
 *
 * Returns a ref (not state) so the visualizer can animate at 60fps via its own
 * requestAnimationFrame loop without re-rendering React every frame.
 */
export function useMicAnalyser(stream: MediaStream | null) {
  const levelRef = useRef(0);

  useEffect(() => {
    levelRef.current = 0;
    if (!stream) return;

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    let raf = 0;
    let ctx: AudioContext | null = null;
    try {
      ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        // Scale up (speech RMS is small) and clamp, then smooth toward target.
        const target = Math.min(1, rms * 3.2);
        levelRef.current = levelRef.current * 0.7 + target * 0.3;
        raf = requestAnimationFrame(tick);
      };

      void ctx.resume?.().catch(() => {});
      raf = requestAnimationFrame(tick);
    } catch {
      /* analyser is best-effort; ignore failures */
    }

    const closingCtx = ctx;
    return () => {
      cancelAnimationFrame(raf);
      try {
        closingCtx?.close();
      } catch {
        /* ignore */
      }
      levelRef.current = 0;
    };
  }, [stream]);

  return levelRef;
}
