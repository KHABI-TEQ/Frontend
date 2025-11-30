import { useCallback, useEffect, useRef, useState } from "react";

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

interface AsyncOptions {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

export function useSafeAsync<T>(
  asyncFunction: () => Promise<T>,
  deps: React.DependencyList = [],
  options: AsyncOptions = {},
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    loading: false,
  });

  const isMountedRef = useRef(true);
  const { retries = 1, retryDelay = 2000, timeout = 15000 } = options;

  const safeSetState = useCallback((newState: Partial<AsyncState<T>>) => {
    if (isMountedRef.current) {
      setState((prev) => ({ ...prev, ...newState }));
    }
  }, []);

  const execute = useCallback(
    async (retryCount = 0) => {
      if (!isMountedRef.current) return;

      safeSetState({ loading: true, error: null });

      try {
        // Add timeout wrapper
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Request timeout")), timeout);
        });

        const result = await Promise.race([asyncFunction(), timeoutPromise]);

        if (isMountedRef.current) {
          safeSetState({ data: result, loading: false, error: null });
        }
      } catch (error) {
        console.error("Async operation failed:", error);

        // Retry logic
        if (retryCount < retries && isMountedRef.current) {
          console.log(`Retrying... (${retryCount + 1}/${retries})`);
          setTimeout(() => execute(retryCount + 1), retryDelay);
          return;
        }

        if (isMountedRef.current) {
          safeSetState({
            error: error instanceof Error ? error : new Error("Unknown error"),
            loading: false,
          });
        }
      }
    },
    [asyncFunction, retries, retryDelay, timeout, safeSetState],
  );

  useEffect(() => {
    execute();
  }, deps);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    ...state,
    retry: () => execute(),
  };
}
