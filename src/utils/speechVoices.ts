/** @format */

/**
 * Choose a Web Speech synthesis voice closest to Nigerian English.
 * Many engines ignore `lang` alone; assigning `voice` improves accent when en-NG is installed.
 */
export function pickNigerianEnglishVoice(
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | undefined {
  if (!voices?.length) return undefined;

  const rank = (v: SpeechSynthesisVoice): number => {
    const lang = (v.lang || "").toLowerCase().replace(/_/g, "-");
    const name = (v.name || "").toLowerCase();
    if (lang === "en-ng") return 100;
    if (lang.startsWith("en-ng")) return 98;
    if (name.includes("nigeria") || name.includes("nigerian")) return 95;
    if (lang === "en-gh") return 48;
    if (lang.startsWith("en-gh")) return 46;
    if (lang === "en-za") return 40;
    if (lang.startsWith("en-za")) return 38;
    if (lang === "en-gb") return 30;
    if (lang.startsWith("en-gb")) return 28;
    if (lang === "en-us") return 10;
    if (lang.startsWith("en-")) return 6;
    return 0;
  };

  let best: SpeechSynthesisVoice | undefined;
  let bestRank = -1;
  for (const v of voices) {
    const r = rank(v);
    if (r > bestRank) {
      bestRank = r;
      best = v;
    }
  }
  if (bestRank >= 28) return best;
  return voices.find((v) => (v.lang || "").toLowerCase().startsWith("en-")) ?? best;
}

/**
 * Speak one utterance after binding the best Nigerian / English voice (handles delayed `voiceschanged`).
 */
export function speakUtteranceWithNigerianVoice(
  synth: SpeechSynthesis,
  utterance: SpeechSynthesisUtterance,
  preferredLang = "en-NG"
): void {
  let fired = false;
  let tid: number | undefined;

  const go = () => {
    if (fired) return;
    fired = true;
    synth.removeEventListener("voiceschanged", onVoices);
    if (tid !== undefined) {
      window.clearTimeout(tid);
    }

    const voice = pickNigerianEnglishVoice(synth.getVoices());
    if (voice) {
      utterance.voice = voice;
      utterance.lang = (voice.lang || preferredLang).replace(/_/g, "-");
    } else {
      utterance.lang = preferredLang;
    }
    synth.speak(utterance);
  };

  const onVoices = () => {
    if (synth.getVoices().length > 0) go();
  };

  synth.addEventListener("voiceschanged", onVoices);
  tid = window.setTimeout(go, 650) as unknown as number;
  if (synth.getVoices().length > 0) go();
}

/** Prime the voice list (call on mount in client components that use TTS). */
export function warmSpeechSynthesisVoices(): void {
  if (typeof window === "undefined") return;
  try {
    window.speechSynthesis?.getVoices();
  } catch {
    /* ignore */
  }
}
