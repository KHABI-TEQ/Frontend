"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Sparkles, Mic, Loader2, Send } from "lucide-react";
import toast from "react-hot-toast";
import { playSpeechEndBeep } from "@/utils/playSpeechEndBeep";

export interface AiFillBlockProps {
  /** Main label, e.g. "Describe your property" or "Describe what you're looking for" */
  title: string;
  /** Placeholder for the textarea */
  placeholder: string;
  /** Button label, e.g. "Fill with AI" */
  buttonLabel?: string;
  /** Called with the user's text (and optionally after speech-to-text). Returns promise; errors shown via toast. */
  onSuggest: (userInput: string) => Promise<void>;
  /** Optional: disable the block (e.g. when user type not allowed) */
  disabled?: boolean;
  /** Optional: max height of textarea */
  maxHeight?: string;
}

/** Rebuild full utterance from all results each event — avoids repeating / duplicating partials. */
function getSessionTranscriptFromResults(results: SpeechRecognitionResultList): { final: string; interim: string } {
  let final = "";
  let interim = "";
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const t = r[0]?.transcript?.trim() ?? "";
    if (!t) continue;
    if (r.isFinal) {
      final = final ? `${final} ${t}` : t;
    } else {
      interim = interim ? `${interim} ${t}` : t;
    }
  }
  return { final, interim };
}

function combineBaseAndUtterance(base: string, utterance: string): string {
  const u = utterance.trim();
  if (!u) return base;
  const b = base.trimEnd();
  return b ? `${b} ${u}` : u;
}

export default function AiFillBlock({
  title,
  placeholder,
  buttonLabel = "Fill with AI",
  onSuggest,
  disabled = false,
  maxHeight = "120px",
}: AiFillBlockProps) {
  const [input, setInput] = useState("");
  const canSend = input.trim().length > 0;
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  /** Textarea snapshot when current mic session started — new speech appends after this. */
  const voiceBaseRef = useRef("");
  /** Latest combined final+interim for this utterance (so onend can sync). */
  const latestUtteranceRef = useRef("");
  /** Avoid double beep if both onerror(aborted) and onend run. */
  const endBeepPlayedRef = useRef(false);
  /** One finish path per mic session (onend + onerror can both fire). */
  const sessionActiveRef = useRef(false);

  const playEndBeepOnce = useCallback(() => {
    if (endBeepPlayedRef.current) return;
    endBeepPlayedRef.current = true;
    playSpeechEndBeep();
  }, []);

  const finishRecognitionSession = useCallback(() => {
    if (!sessionActiveRef.current) return;
    sessionActiveRef.current = false;
    recognitionRef.current = null;
    setListening(false);
    setInput(combineBaseAndUtterance(voiceBaseRef.current, latestUtteranceRef.current));
    playEndBeepOnce();
  }, [playEndBeepOnce]);

  const handleSubmit = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      toast.error("Please enter a description first.");
      return;
    }
    setLoading(true);
    try {
      await onSuggest(trimmed);
      toast.success("Suggestions applied. Review and edit as needed.");
      setInput("");
    } catch (e) {
      toast.error((e as Error)?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [input, onSuggest]);

  const startVoice = useCallback(() => {
    if (typeof window === "undefined") return;
    endBeepPlayedRef.current = false;
    sessionActiveRef.current = true;
    latestUtteranceRef.current = "";
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    voiceBaseRef.current = input.trimEnd();

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognitionAPI() as SpeechRecognition;
    /** One utterance per start: stops when you pause — text updates live; beep on end. Tap mic again to add more. */
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-NG";
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const { final, interim } = getSessionTranscriptFromResults(event.results);
      const utterance = [final, interim].filter(Boolean).join(" ").trim();
      latestUtteranceRef.current = utterance;
      setInput(combineBaseAndUtterance(voiceBaseRef.current, utterance));
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const error = (event as SpeechRecognitionErrorEvent).error;
      // These are normal closure paths; `onend` still runs in Chromium and will finish + beep.
      if (error === "aborted" || error === "no-speech") {
        return;
      }
      sessionActiveRef.current = false;
      recognitionRef.current = null;
      setListening(false);
      endBeepPlayedRef.current = true;
      if (error === "not-allowed") {
        toast.error("Microphone access denied. Allow the mic and try again.");
        return;
      }
      if (error === "network") {
        toast.error("Voice needs a stable internet connection. You can type your description below instead.");
        return;
      }
      toast.error("Voice input failed. Try typing instead.");
    };

    recognition.onend = () => {
      finishRecognitionSession();
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      sessionActiveRef.current = false;
      recognitionRef.current = null;
      setListening(false);
      toast.error("Could not start microphone.");
    }
  }, [input, finishRecognitionSession]);

  const stopVoice = useCallback(() => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch {
      finishRecognitionSession();
    }
  }, [finishRecognitionSession]);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    };
  }, []);

  return (
    <div className="rounded-xl border border-[#8DDB90]/40 bg-[#f0fdf4]/60 p-4 md:p-5">
      <style>{`
        @keyframes ai-fill-bar {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
      `}</style>
      <div className="mb-2 flex items-center gap-2 text-[#09391C]">
        <Sparkles className="h-5 w-5 text-[#8DDB90]" aria-hidden />
        <span className="font-semibold">{title}</span>
      </div>
      <p className="mb-3 text-sm text-[#5A5D63]">
        Optionally describe in a few words or sentences; we&apos;ll suggest form fields. You can review and edit before
        submitting.{" "}
        <span className="text-[#09391C] font-medium">
          Voice: speak clearly — text appears as you talk (no repeats). When you pause, recognition stops and you&apos;ll hear a short beep. Tap the mic again to add more.
        </span>
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={disabled || listening}
            rows={3}
            className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-[#09391C] placeholder-gray-400 focus:border-[#8DDB90] focus:outline-none focus:ring-2 focus:ring-[#8DDB90]/20 disabled:bg-gray-100 disabled:opacity-70"
            style={{ maxHeight }}
            aria-label={title}
          />
          <div className="absolute bottom-2 right-2 flex items-center gap-2">
            {listening && (
              <div className="flex items-end gap-0.5 h-5" aria-hidden>
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="w-1 rounded-full bg-red-500 min-h-1 origin-bottom"
                    style={{
                      height: "12px",
                      animation: "ai-fill-bar 0.6s ease-in-out infinite",
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={listening ? stopVoice : startVoice}
              disabled={disabled || loading}
              className={`inline-flex items-center gap-2 rounded px-2 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                listening
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "text-gray-500 hover:bg-gray-100 hover:text-[#09391C]"
              }`}
              title={listening ? "Stop listening" : "Speak — tap again after a pause to add more text"}
              aria-label={listening ? "Stop voice input" : "Start voice input"}
            >
              {listening ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" aria-hidden />
                  <span>Stop</span>
                </>
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        <div className="relative sm:self-end inline-block min-w-[8rem]">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={disabled || loading || !canSend}
            className="inline-flex w-full min-h-[2.75rem] items-center justify-center gap-2 rounded-lg bg-[#8DDB90] px-4 py-2.5 font-medium text-[#09391C] transition-colors hover:bg-[#7BC87F] disabled:opacity-45"
            aria-label={!canSend && !loading ? `${buttonLabel} (enter text first)` : buttonLabel}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            ) : (
              <Sparkles className="h-5 w-5" aria-hidden />
            )}
            <span>{loading ? "Getting suggestions…" : buttonLabel}</span>
          </button>
          {!canSend && !loading && !disabled && (
            <div
              className="absolute inset-0 z-[1] flex cursor-not-allowed items-center justify-center rounded-lg bg-transparent group/send-empty"
              title="Type or use the mic, then send"
              aria-hidden
            >
              <Send
                className="h-6 w-6 text-[#09391C] opacity-0 transition-opacity duration-150 group-hover/send-empty:opacity-55"
                aria-hidden
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
