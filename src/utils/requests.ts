/** @format */

import Cookies from 'js-cookie';

interface ApiResponse<T = unknown, P = unknown> {
  success: boolean;
  message?: string;
  data?: T | null;
  error?: string;
  pagination?: P | null;
}

const isAuthExpiredMessage = (msg?: string) => {
  if (!msg) return false;
  const m = msg.toLowerCase();
  return m.includes('unauthorized') || m.includes('jwt') || m.includes('expired') || m.includes('malformed');
};

const handleAuthExpirySideEffects = () => {
  try { Cookies.remove('token'); } catch {}
  try {
    if (typeof window !== 'undefined') {
      try { localStorage.removeItem('token'); } catch {}
      const current = (window.location?.pathname || '') + (window.location?.search || '');
      if (current && !sessionStorage.getItem('redirectAfterLogin')) {
        try { sessionStorage.setItem('redirectAfterLogin', current); } catch {}
      }
      try { window.dispatchEvent(new CustomEvent('auth:expired')); } catch {}
    }
  } catch {}
};

export const GET_REQUEST = async <T = unknown, P = unknown>(
  url: string,
  token?: string,
  retryCount = 0,
): Promise<ApiResponse<T, P>> => {
  try {
    // Check if URL is valid
    if (!url || url.includes("undefined")) {
      // Invalid API URL provided
      return {
        error: "Invalid API URL",
        success: false,
        message: "API configuration is missing.",
        data: null,
      };
    }

    // Making request to URL

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const request = await fetch(url, {
      signal: controller.signal,
      // Explicit CORS settings
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        Accept: "application/json",
      },
    });

    clearTimeout(timeoutId);

    // Check if request was successful
    if (!request.ok) {
      const errorMessage = `HTTP ${request.status}: ${request.statusText}`;
      if (request.status === 401) {
        handleAuthExpirySideEffects();
      }
      return {
        error: errorMessage,
        success: false,
        message: "Failed to fetch data from server.",
        data: null,
      };
    }

    // Check if response has content before parsing JSON
    const text = await request.text();
    if (!text) {
      // Empty response received
      return {
        error: "Empty response",
        success: false,
        message: "Server returned empty response.",
        data: null,
      };
    }

    try {
      const response = JSON.parse(text);
      if (!response?.success && isAuthExpiredMessage(response?.message || response?.error)) {
        handleAuthExpirySideEffects();
      }
      return response;
    } catch (parseError) {
      // JSON parse error for response
      return {
        error: "Invalid JSON response",
        success: false,
        message: "Server returned invalid data format.",
        data: null,
      };
    }
  } catch (error: unknown) {
    const err = error as Error & { name?: string };
    const isAbort = err.name === "AbortError";
    const errorMsg = err.message || (isAbort ? "Request timed out" : "Network error");

    // Retry once for transient network errors
    if (retryCount === 0 && !isAbort) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return GET_REQUEST(url, token, 1);
    }

    return {
      error: errorMsg,
      success: false,
      message: errorMsg,
      data: null,
    };
  }
};

export const DELETE_REQUEST = async <T = unknown>(url: string, data?: unknown, token?: string): Promise<ApiResponse<T, unknown>> => {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const request = await fetch(url, {
      method: "DELETE",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!request.ok && request.status === 401) {
      handleAuthExpirySideEffects();
    }
    const response = await request.json();
    if (!response?.success && isAuthExpiredMessage(response?.message || response?.error)) {
      handleAuthExpirySideEffects();
    }
    return response;
  } catch (error: unknown) {
    // Error occurred
    return {
      error: (error as Error).message || "Unknown error",
      success: false,
      message: "An error occurred, please try again.",
    };
  }
};

export const POST_REQUEST = async <T = unknown>(
  url: string,
  data: unknown,
  token?: string,
  customHeaders?: Record<string, string>,
  retryCount = 0,
): Promise<ApiResponse<T, unknown>> => {
  try {
    // Check if URL is valid
    if (!url || url.includes("undefined")) {
      return {
        error: "Invalid API URL",
        success: false,
        message: "API configuration is missing.",
        data: null,
      };
    }

    // Build headers with sensible defaults
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(customHeaders || {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
    // Let the browser set the correct Content-Type boundary for FormData
    if (isFormData) {
      delete headers["Content-Type"];
    }

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const request = await fetch(url, {
      method: "POST",
      headers,
      body: isFormData ? (data as FormData) : JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Read response body safely only once
    const text = await request.text();
    const parsed = text ? (() => { try { return JSON.parse(text); } catch { return { success: false, error: "Invalid JSON response" }; } })() : {};

    if (!request.ok) {
      if (request.status === 401) {
        handleAuthExpirySideEffects();
      }
      const errMsg = (parsed as any)?.error || (parsed as any)?.message || `HTTP ${request.status}`;
      return {
        error: errMsg,
        success: false,
        message: errMsg,
        data: null,
      };
    }

    if (!(parsed as any)?.success && isAuthExpiredMessage((parsed as any)?.message || (parsed as any)?.error)) {
      handleAuthExpirySideEffects();
    }

    return parsed as ApiResponse<T, unknown>;
  } catch (error: unknown) {
    const err = error as Error & { name?: string };
    const isAbort = err.name === "AbortError";
    const errorMsg = err.message || (isAbort ? "Request timed out" : "Network error");

    // Retry once for transient network errors
    if (retryCount === 0 && !isAbort) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return POST_REQUEST(url, data, token, customHeaders, 1);
    }

    return {
      error: errorMsg,
      success: false,
      message: errorMsg,
      data: null,
    };
  }
};

export const POST_REQUEST_FILE_UPLOAD = async <T = unknown>(
  url: string,
  data: FormData,
  token?: string,
): Promise<ApiResponse<T, unknown>> => {
  try {
    const request = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: data,
    });
    if (!request.ok && request.status === 401) {
      handleAuthExpirySideEffects();
    }
    const response = await request.json();
    if (!response?.success && isAuthExpiredMessage(response?.message || response?.error)) {
      handleAuthExpirySideEffects();
    }
    return response;
  } catch (error: unknown) {
    // Error occurred
    return {
      error: (error as Error).message || "Unknown error",
      success: false,
      message: "An error occurred, please try again.",
    };
  }
};

export const PUT_REQUEST = async <T = unknown>(
  url: string,
  data: unknown,
  token?: string,
  customHeaders?: Record<string, string>,
): Promise<ApiResponse<T, unknown>> => {
  try {
    const headers: Record<string, string> = customHeaders || {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const request = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    if (!request.ok && request.status === 401) {
      handleAuthExpirySideEffects();
    }
    const response = await request.json();
    if (!response?.success && isAuthExpiredMessage(response?.message || response?.error)) {
      handleAuthExpirySideEffects();
    }
    return response;
  } catch (error: unknown) {
    // Error occurred
    return {
      error: (error as Error).message || "Unknown error",
      success: false,
      message: "An error occurred, please try again.",
    };
  }
};


export const PATCH_REQUEST = async <T = unknown>(
  url: string,
  data: unknown,
  token?: string,
  customHeaders?: Record<string, string>,
): Promise<ApiResponse<T, unknown>> => {
  try {
    const headers: Record<string, string> = customHeaders || {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const request = await fetch(url, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
    });
    if (!request.ok && request.status === 401) {
      handleAuthExpirySideEffects();
    }
    const response = await request.json();
    if (!response?.success && isAuthExpiredMessage(response?.message || response?.error)) {
      handleAuthExpirySideEffects();
    }
    return response;
  } catch (error: unknown) {
    // Error occurred
    return {
      error: (error as Error).message || "Unknown error",
      success: false,
      message: "An error occurred, please try again.",
    };
  }
};
