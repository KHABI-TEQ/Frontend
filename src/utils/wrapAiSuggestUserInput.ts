/** @format */

/**
 * Prepends guidance so the suggest-preference / suggest-property LLM corrects
 * typical speech-to-text errors before extracting structured fields.
 * Chat UI still shows the raw user text; only the API payload is wrapped.
 */
const SPEECH_AND_TYPING_HINT =
  "The following text may come from voice dictation or hurried typing. " +
  "Before extracting fields: (1) Correct likely misheard or misspelled words; " +
  "(2) Fix Nigerian place names, areas, LGAs, landmarks, and common property terms; " +
  "(3) Normalize spoken numbers and naira amounts to sensible figures; DO NOT change the user's intent. " +
  "Use the corrected understanding for extraction only — output structured data as usual.\n\n" +
  "--- USER DESCRIPTION ---\n";

export function wrapUserInputForAiSuggest(userInput: string): string {
  const t = typeof userInput === "string" ? userInput.trim() : "";
  if (!t) return "";
  return SPEECH_AND_TYPING_HINT + t;
}
