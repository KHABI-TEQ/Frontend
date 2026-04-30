/**
 * AI-assisted form filling (OpenAI) — FRONTEND_API_GUIDE.md §10.
 * Suggest property form (Agent, Landlord, Developer) and suggest preference form (Buyer/Public).
 */

import { POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { wrapUserInputForAiSuggest } from "@/utils/wrapAiSuggestUserInput";

/** LLM-backed routes often exceed the default 15s client timeout. */
const AI_SUGGEST_POST_TIMEOUT_MS = 120_000;

function sanitizeAiErrorMessage(raw: unknown): string {
  const message = String(raw || "").trim();
  if (!message) return "Could not get suggestions.";
  const technicalPatterns: RegExp[] = [
    /expected\s*','\s*or\s*'\}'\s*after\s*property\s*value\s*in\s*json/i,
    /json\s+at\s+position\s+\d+/i,
    /syntaxerror/i,
    /unexpected\s+token/i,
    /line\s+\d+\s+column\s+\d+/i,
    /cannot\s+read\s+propert/i,
    /stack\s+trace/i,
  ];
  if (technicalPatterns.some((re) => re.test(message))) {
    return "I couldn't process that response properly. Please repeat the last answer in simple words.";
  }
  return message;
}

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
    token,
    undefined,
    0,
    AI_SUGGEST_POST_TIMEOUT_MS
  );
  if (response.success && response.data) {
    return { success: true, message: response.message, data: response.data as Record<string, unknown> };
  }
  const rawMessage =
    (response as { message?: string }).message ||
    (response as { error?: string }).error ||
    "Could not get suggestions.";
  const message = sanitizeAiErrorMessage(rawMessage);
  const msg = message.toLowerCase();
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
    undefined,
    undefined,
    0,
    AI_SUGGEST_POST_TIMEOUT_MS
  );
  if (response.success && response.data) {
    return { success: true, message: response.message, data: response.data as Record<string, unknown> };
  }
  const rawMessage =
    (response as { message?: string }).message ||
    (response as { error?: string }).error ||
    "Could not get suggestions.";
  const message = sanitizeAiErrorMessage(rawMessage);
  const messageText = String(message || "");
  const is503 =
    messageText.toLowerCase().includes("not configured") ||
    messageText.toLowerCase().includes("unavailable") ||
    messageText.toLowerCase().includes("503");
  return {
    success: false,
    message: is503
      ? "AI service is temporarily unavailable. Please fill the form manually."
      : message,
  };
}
