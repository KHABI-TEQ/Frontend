"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Grace period after dictation ends before auto-submit fires (user can cancel). */
export const VOICE_AUTO_SUBMIT_DELAY_MS = 5_000;

export function useCancellableAutoSubmit(submit: (text: string) => Promise<void>) {
  const [pending, setPending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingTextRef = useRef("");
  const generationRef = useRef(0);
  const submitRef = useRef(submit);
  submitRef.current = submit;

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const cancelAutoSubmit = useCallback(() => {
    generationRef.current += 1;
    clearTimers();
    pendingTextRef.current = "";
    setPending(false);
    setSecondsLeft(0);
  }, [clearTimers]);

  const scheduleAutoSubmit = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      generationRef.current += 1;
      const gen = generationRef.current;
      clearTimers();

      pendingTextRef.current = trimmed;
      setPending(true);
      const endsAt = Date.now() + VOICE_AUTO_SUBMIT_DELAY_MS;
      setSecondsLeft(Math.ceil(VOICE_AUTO_SUBMIT_DELAY_MS / 1000));

      intervalRef.current = setInterval(() => {
        const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
        setSecondsLeft(left);
      }, 200);

      timerRef.current = setTimeout(() => {
        if (gen !== generationRef.current) return;
        clearTimers();
        setPending(false);
        setSecondsLeft(0);
        const toSend = pendingTextRef.current;
        pendingTextRef.current = "";
        if (toSend) void submitRef.current(toSend);
      }, VOICE_AUTO_SUBMIT_DELAY_MS);
    },
    [clearTimers]
  );

  useEffect(() => () => cancelAutoSubmit(), [cancelAutoSubmit]);

  return {
    pendingAutoSubmit: pending,
    autoSubmitSecondsLeft: secondsLeft,
    scheduleAutoSubmit,
    cancelAutoSubmit,
  };
}
