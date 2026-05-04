"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { speakUtteranceWithNigerianVoice, warmSpeechSynthesisVoices } from "@/utils/speechVoices";

/**
 * Options for speech synthesis (Text-to-Speech).
 * Uses Web Speech API — SpeechSynthesis: https://developer.mozilla.org/en-US/docs/Web/API/Speech_Synthesis_API
 * All usage is client-only (no window in SSR).
 */
export interface UseSpeechSynthesisOptions {
  /** Preferred BCP 47 tag when no matching voice is found. Default "en-NG". */
  lang?: string;
  /** Speech rate: 0.1–10, 1 = normal. Default 0.95. */
  rate?: number;
  /** Pitch: 0–2, 1 = normal. Default 1. */
  pitch?: number;
  /** Volume: 0–1. Default 1. */
  volume?: number;
}

function getSynth(): SpeechSynthesis | null {
  if (typeof window === "undefined") return null;
  return window.speechSynthesis;
}

/**
 * Hook for Text-to-Speech (reply playback) using the Web Speech API — SpeechSynthesis.
 * Uses the closest available Nigerian English voice when the engine exposes one.
 */
export function useSpeechSynthesis(options: UseSpeechSynthesisOptions = {}) {
  const { lang = "en-NG", rate = 0.95, pitch = 1, volume = 1 } = options;
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    warmSpeechSynthesisVoices();
  }, []);

  const stop = useCallback(() => {
    const synth = getSynth();
    if (synth) {
      synth.cancel();
      setSpeaking(false);
    }
    utteranceRef.current = null;
  }, []);

  const speak = useCallback(
    (text: string) => {
      const trimmed = (text || "").toString().trim();
      if (!trimmed) return;

      const synth = getSynth();
      if (!synth) return;

      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(trimmed);
      utterance.rate = Math.max(0.1, Math.min(10, rate));
      utterance.pitch = Math.max(0, Math.min(2, pitch));
      utterance.volume = Math.max(0, Math.min(1, volume));

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      utteranceRef.current = utterance;
      speakUtteranceWithNigerianVoice(synth, utterance, lang);
    },
    [lang, rate, pitch, volume]
  );

  return { speak, stop, speaking };
}
