/**
 * AI-assisted form filling (OpenAI) — FRONTEND_API_GUIDE.md §10.
 * Suggest property form (Agent, Landlord, Developer) and suggest preference form (Buyer/Public).
 */

import { POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { wrapUserInputForAiSuggest } from "@/utils/wrapAiSuggestUserInput";

export interface SuggestPropertyResponse {
  success: boolean;
  message?: string;
  data?: Record<string, unknown>;
}

export interface SuggestPreferenceResponse {
  success: boolean;
  message?: string;
  data?: Record<string, unknown>;
}


/**
 * Suggest property form fields from natural-language description.
 * POST /account/ai/suggest-property — Auth: Bearer token.
 * Allowed: Agent, Landowners, Developer. 403 for others.
 * Errors: 400 (missing/invalid userInput), 403 (forbidden), 503 (OpenAI not configured).
 */
export async function suggestProperty(
  userInput: string,
  token: string
): Promise<SuggestPropertyResponse> {
  const trimmed = typeof userInput === "string" ? userInput.trim() : "";
  if (!trimmed) {
    return { success: false, message: "Please enter a description." };
  }
  const url = `${URLS.BASE}${URLS.aiSuggestProperty}`;
  const response = await POST_REQUEST<{ success: boolean; message?: string; data?: Record<string, unknown> }>(
    url,
    { userInput: wrapUserInputForAiSuggest(trimmed) },
    token
  );
  if (response.success && response.data) {
    return { success: true, message: response.message, data: response.data as Record<string, unknown> };
  }
  const message =
    (response as { message?: string }).message ||
    (response as { error?: string }).error ||
    "Could not get suggestions.";
  const msg = typeof message === "string" ? message.toLowerCase() : "";
  if (msg.includes("404") || msg.includes("not found")) {
    return {
      success: false,
      message: "AI suggestions are not available yet. Please fill in the form manually.",
    };
  }
  const is503 =
    msg.includes("not configured") || msg.includes("unavailable") || msg.includes("503");
  return {
    success: false,
    message: is503
      ? "AI service is temporarily unavailable. Please fill the form manually."
      : message,
  };
}

/**
 * Suggest preference form fields from natural-language description.
 * POST /ai/suggest-preference — No auth (public).
 * Errors: 400 (missing/invalid userInput), 503 (AI service not configured).
 */
export async function suggestPreference(
  userInput: string
): Promise<SuggestPreferenceResponse> {
  const trimmed = typeof userInput === "string" ? userInput.trim() : "";
  if (!trimmed) {
    return { success: false, message: "Please enter a description." };
  }
  const url = `${URLS.BASE}${URLS.aiSuggestPreference}`;
  const response = await POST_REQUEST<{ success: boolean; message?: string; data?: Record<string, unknown> }>(
    url,
    { userInput: wrapUserInputForAiSuggest(trimmed) },
    undefined
  );
  if (response.success && response.data) {
    return { success: true, message: response.message, data: response.data as Record<string, unknown> };
  }
  const message =
    (response as { message?: string }).message ||
    (response as { error?: string }).error ||
    "Could not get suggestions.";
  const is503 =
    typeof message === "string" &&
    (message.toLowerCase().includes("not configured") ||
      message.toLowerCase().includes("unavailable") ||
      message.toLowerCase().includes("503"));
  return {
    success: false,
    message: is503
      ? "AI service is temporarily unavailable. Please fill the form manually."
      : message,
  };
}
