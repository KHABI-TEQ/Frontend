/** @format */

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface UseApiRequestOptions {
  showPreloader?: boolean;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  signal?: AbortSignal;
}

export const useApiRequest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const makeRequest = async (
    url: string,
    method: RequestMethod = "GET",
    data?: any,
    token?: string,
    options: UseApiRequestOptions = {},
  ) => {
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
    } catch (err: any) {
      if (err.name === "AbortError") {
        return;
      }

      const errorMsg = err.message || errorMessage || "An error occurred";
      setError(errorMsg);

      if (errorMessage || !options.errorMessage) {
        toast.error(errorMsg);
      }

      if (onError) {
        onError(err);
      }

      throw err;
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
