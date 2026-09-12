"use client";

import { useEffect } from "react";

const RELOAD_KEY = "khabiteq-chunk-reload-at";
const RELOAD_COOLDOWN_MS = 60_000;

function isChunkLoadError(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const error = value as { name?: string; message?: string };
  return (
    error.name === "ChunkLoadError" ||
    (typeof error.message === "string" && error.message.includes("ChunkLoadError"))
  );
}

function reloadOncePerMinute(): void {
  try {
    const lastReload = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    const now = Date.now();
    if (lastReload && now - lastReload < RELOAD_COOLDOWN_MS) {
      return;
    }
    sessionStorage.setItem(RELOAD_KEY, String(now));
  } catch {
    return;
  }
  window.location.reload();
}

export default function ChunkErrorHandler() {
  useEffect(() => {
    const handleChunkError = (event: ErrorEvent) => {
      if (!isChunkLoadError(event.error)) return;
      console.warn("ChunkLoadError detected; reloading once if cooldown allows.");
      reloadOncePerMinute();
    };

    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      if (!isChunkLoadError(event.reason)) return;
      console.warn("ChunkLoadError in promise rejection; reloading once if cooldown allows.");
      reloadOncePerMinute();
    };

    window.addEventListener("error", handleChunkError);
    window.addEventListener("unhandledrejection", handlePromiseRejection);

    return () => {
      window.removeEventListener("error", handleChunkError);
      window.removeEventListener("unhandledrejection", handlePromiseRejection);
    };
  }, []);

  return null;
}
