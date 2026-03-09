"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Sparkles, Mic, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

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

export default function AiFillBlock({
  title,
  placeholder,
  buttonLabel = "Fill with AI",
  onSuggest,
  disabled = false,
  maxHeight = "120px",
}: AiFillBlockProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [showConvertingMessage, setShowConvertingMessage] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const convertingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognitionAPI() as SpeechRecognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-NG";
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .filter((r) => r.isFinal)
        .map((r) => r[0].transcript)
        .join(" ");
      if (transcript) {
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
    };
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const error = (event as SpeechRecognitionErrorEvent).error;
      if (error === "aborted") return;
      if (error === "no-speech") {
        // Don't stop or toast: onend will fire and we'll restart so it keeps waiting for you
        return;
      }
      setListening(false);
      if (error === "not-allowed") {
        toast.error("Microphone access denied. Allow the mic and try again.");
        return;
      }
      if (error === "network") {
        toast.error("Network error. Check your connection and try again.");
        return;
      }
      toast.error("Voice input failed. Try typing instead.");
    };
    recognition.onend = () => {
      // If we didn't call stop() (ref still set), browser ended the session (e.g. silence).
      // Restart so it keeps listening until you click Stop.
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          setListening(false);
        }
      } else {
        setListening(false);
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, []);

  const stopVoice = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
    setShowConvertingMessage(true);
    if (convertingTimeoutRef.current) clearTimeout(convertingTimeoutRef.current);
    convertingTimeoutRef.current = setTimeout(() => {
      setShowConvertingMessage(false);
      convertingTimeoutRef.current = null;
    }, 2500);
  }, []);

  useEffect(() => {
    return () => {
      if (convertingTimeoutRef.current) clearTimeout(convertingTimeoutRef.current);
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
        Optionally describe in a few words or sentences; we&apos;ll suggest form fields. You can review and edit before submitting.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
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
              className={`inline-flex items-center gap-2 rounded px-2 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                listening
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "text-gray-500 hover:bg-gray-100 hover:text-[#09391C]"
              }`}
              title={listening ? "Stop recording" : "Use voice input"}
              aria-label={listening ? "Stop voice input" : "Start voice input"}
            >
              {listening ? (
                <>
                  <span
                    className="h-2 w-2 rounded-full bg-red-500 animate-pulse"
                    aria-hidden
                  />
                  <span>Stop</span>
                </>
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        {showConvertingMessage && (
          <p className="mt-2 text-sm text-[#5A5D63] italic">
            Converting your speech to text…
          </p>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#8DDB90] px-4 py-2.5 font-medium text-[#09391C] transition-colors hover:bg-[#7BC87F] disabled:opacity-60 sm:self-end"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          ) : (
            <Sparkles className="h-5 w-5" aria-hidden />
          )}
          <span>{loading ? "Getting suggestions…" : buttonLabel}</span>
        </button>
      </div>
    </div>
  );
}
