"use client";

import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  const onNavigate = () => onStoreChange();

  window.addEventListener("popstate", onNavigate);

  const { pushState, replaceState } = history;
  history.pushState = function (...args) {
    pushState.apply(this, args as never);
    onNavigate();
  };
  history.replaceState = function (...args) {
    replaceState.apply(this, args as never);
    onNavigate();
  };

  return () => {
    window.removeEventListener("popstate", onNavigate);
    history.pushState = pushState;
    history.replaceState = replaceState;
  };
}

function getPathname() {
  return window.location.pathname;
}

/** Pathname without next/navigation — avoids scheduling updates during router commits. */
export function useClientPathname(): string {
  return useSyncExternalStore(subscribe, getPathname, () => "");
}
