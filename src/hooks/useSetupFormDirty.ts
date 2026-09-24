import { useRef } from "react";

/** True after the user changes any tracked field from the first ready snapshot. */
export function useSetupFormDirty(snapshot: unknown, ready = true) {
  const baselineRef = useRef<string | null>(null);
  const serialized = JSON.stringify(snapshot);
  if (ready && baselineRef.current === null) {
    baselineRef.current = serialized;
  }
  return Boolean(ready && baselineRef.current && serialized !== baselineRef.current);
}
