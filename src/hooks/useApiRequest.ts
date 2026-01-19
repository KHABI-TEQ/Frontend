/** @format */

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface UseApiRequestOptions {
  showPreloader?: boolean;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}

export const useApiRequest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const makeRequest = async <T = unknown>(
    url: string,
    method: RequestMethod = "GET",
    data?: unknown,
    token?: string,
    options: UseApiRequestOptions = {},
  ): Promise<T> => {
    const {
      showPreloader = true,
      successMessage,
      errorMessage,
      onSuccess,
      onError,
      signal,
    } = options;

    try {
      if (showPreloader) {
        setIsLoading(true);
      }
      setError(null);

      controllerRef.current = new AbortController();

      const requestConfig: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        signal: signal || controllerRef.current.signal,
      };

      if (data && ["POST", "PUT", "PATCH"].includes(method)) {
        requestConfig.body = JSON.stringify(data);
      }

      const response = await fetch(url, requestConfig);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();

      if (successMessage) {
        toast.success(successMessage);
      }

      if (onSuccess) {
        onSuccess(responseData);
      }

      return responseData;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (error.name === "AbortError") {
        return undefined as unknown as T;
      }

      const errorMsg = error.message || errorMessage || "An error occurred";
      setError(errorMsg);

      if (errorMessage || !options.errorMessage) {
        toast.error(errorMsg);
      }

      if (onError) {
        onError(error);
      }

      throw error;
    } finally {
      if (showPreloader) {
        setIsLoading(false);
      }
    }
  };

  const cancelRequest = () => {
    controllerRef.current?.abort();
  };

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  return {
    isLoading,
    error,
    makeRequest,
    setIsLoading,
    setError,
    cancelRequest,
  };
};
