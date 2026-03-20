/** @format */

/**
 * Short non-intrusive beep when browser speech recognition ends (utterance / silence).
 * Uses Web Audio API — no asset file.
 */
export function playSpeechEndBeep(): void {
  if (typeof window === "undefined") return;
  try {
    const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 920;
    o.connect(g);
    g.connect(ctx.destination);
    const now = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.06, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    o.start(now);
    o.stop(now + 0.15);
    o.onended = () => {
      try {
        ctx.close();
      } catch {
        /* ignore */
      }
    };
  } catch {
    /* ignore if audio blocked */
  }
}
