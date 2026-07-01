"use client";

import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
let historyPatched = false;
let originalPushState: History["pushState"] | null = null;
let originalReplaceState: History["replaceState"] | null = null;

/** Defer store notifications so pushState during commit/useInsertionEffect cannot schedule sync updates. */
function notifyListeners() {
  queueMicrotask(() => {
    listeners.forEach((listener) => listener());
  });
}

function patchHistoryOnce() {
  if (historyPatched || typeof window === "undefined") return;
  historyPatched = true;

  originalPushState = history.pushState.bind(history);
  originalReplaceState = history.replaceState.bind(history);

  history.pushState = function (...args) {
    originalPushState!(...args);
    notifyListeners();
  };
  history.replaceState = function (...args) {
    originalReplaceState!(...args);
    notifyListeners();
  };

  window.addEventListener("popstate", notifyListeners);
}

function subscribe(onStoreChange: () => void) {
  patchHistoryOnce();
  listeners.add(onStoreChange);

  return () => {
    listeners.delete(onStoreChange);
  };
}

function getPathname() {
  return window.location.pathname;
}

/** Pathname without next/navigation — avoids scheduling updates during router commits. */
export function useClientPathname(): string {
  return useSyncExternalStore(subscribe, getPathname, () => "");
}
