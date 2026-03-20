# AI vs Manual Form Implementation Guide

This document describes how the **AI or manual form** flow is implemented for property posting (and can be adapted for other multi-step forms). Use it to replicate the same behavior on another frontend application.

---

## 1. Overview

- **Entry point**: User sees two options: **Use AI** or **Fill form manually**.
- **If AI**: The main form is hidden. User enters a conversational flow (text + optional voice). The AI suggests form fields from their description and asks for missing details until the user is satisfied. Then a **data summary** is shown (no auto-fill). User clicks "Continue to image upload" (or equivalent) to merge data and proceed to the next step (e.g. image upload, then rest of form).
- **If manual**: The main form is shown; the AI input/conversation is hidden.
- **Voice**: Optional. Mic icon starts browser Speech Recognition; Stop button ends it. While converting speech to text, a clear "Converting your speech to text…" message with animation is shown until the text appears (or a timeout).

---

## 2. State (Context)

Use a single form/context that holds:

| State | Type | Purpose |
|-------|------|--------|
| `postingMode` | `"ai" \| "manual" \| null` | `null` = not chosen yet; `"ai"` = AI flow; `"manual"` = manual form. |
| `aiFlowStep` | `"conversation" \| "summary" \| null` | When in AI mode: show conversation UI or the data summary screen. |
| `aiConversationMessages` | `Array<{ role: "user" \| "assistant"; content: string; data?: object; missingFields?: string[] }>` | Chat messages. Assistant messages can carry `data` and `missingFields` for display/logic. |
| `aiCollectedData` | `Record<string, unknown> \| null` | Latest merged suggestion from the AI (used for summary and for merging into form when user continues). |

**Initial values:**

- `postingMode: null`
- `aiFlowStep: null`
- `aiConversationMessages: []`
- `aiCollectedData: null`

**Reset (e.g. on "Change to manual form" or form reset):** Set all four back to these initial values.

---

## 3. Mode Selection Screen

- **When:** `postingMode === null`.
- **UI:** Two options (e.g. cards or buttons):
  1. **Use AI** – On click: `setPostingMode("ai")`, `setAiFlowStep("conversation")`.
  2. **Fill form manually** – On click: `setPostingMode("manual")`.

- **Copy:** e.g. "Describe your property in your own words. The AI will ask for any missing details until everything is ready." vs "Complete each section of the form step by step."

---

## 4. Conditional Rendering in the Form Page

Assume a multi-step form with `currentStep` (e.g. 0 = first step, 1 = details, 2 = image upload, …).

- **Stepper:** Hide when `postingMode === "ai" && currentStep === 0` (so the stepper is hidden during the AI conversation).
- **Mode selector:** Show when `postingMode === null`.
- **AI conversation + summary:** Show when `postingMode === "ai" && currentStep === 0`. Render the AI flow component (which internally switches between conversation and summary based on `aiFlowStep`).
- **Main form (steps):** Show when `postingMode === "manual"` **or** `(postingMode === "ai" && currentStep > 0)`. So once the user has finished the AI flow and clicked "Continue to image upload", you set `currentStep` to the image step and show the normal form.

**Important:** When `postingMode === "ai"` and user is on step 0, only the AI flow is visible (conversation or summary). The rest of the form is hidden.

---

## 5. AI Conversation Flow Component

### 5.1 Two sub-views

- **Conversation** (`aiFlowStep === "conversation"`): Chat thread + input (textarea + mic + send).
- **Summary** (`aiFlowStep === "summary"`): Table of collected data + "Continue to image upload" (or "Continue") button.

### 5.2 Conversation view

- **Header:** e.g. "Describe your [property type] property" and a link/button "Change to manual form" that resets: `setPostingMode(null)`, `setAiConversationMessages([])`, `setAiCollectedData(null)`, `setAiFlowStep(null)`.
- **Short instructions:** "Type or use the mic to describe your property. The AI will ask for any missing details. When you're done, click 'I'm done' to see the summary and continue to image upload."
- **Tip:** "If voice input fails (e.g. network), type your description instead."
- **Loading state:** While waiting for the AI API after Send, show a persistent message, e.g. "Reading your description and preparing suggestions…" with a spinner.
- **Message list:** Scrollable list of messages. User messages right-aligned, assistant left-aligned with an avatar/icon. Each message has `content`. Assistant messages can also show "I still need: …" when there are missing fields.
- **Input area:** Use a reusable **AiFillBlock** (see section 7): textarea + mic button + primary action button (e.g. "Send").
- **"I'm done — show summary" button:** Shown when there is at least one assistant message. On click: `setAiFlowStep("summary")`.

### 5.3 Sending a message (handleSend)

1. Validate: input text trimmed non-empty; else toast "Please enter or say something."
2. Append user message: `setAiConversationMessages(prev => [...prev, { role: "user", content: trimmed }])`.
3. Build **accumulated** user text: concatenate all previous user messages + current, e.g. `messages.filter(m => m.role === "user").map(m => m.content).join(". ") + " " + trimmed` (or equivalent).
4. Call your **suggest API** (e.g. `POST /account/ai/suggest-property`) with `{ userInput: accumulated }` and auth token.
5. On success, parse response `data` (object). Run **getMissingFieldsFromData(data)** (see 5.5) to get a list of missing field labels.
6. Build assistant reply:
   - Base: "Here's what I have so far:"
   - If `missingFields.length > 0`: append " I still need: [missing list]. Please provide these so we can complete your listing."
   - Else: append " I have enough to build your listing. If everything looks good, click 'I'm done' below to see the summary and continue to image upload."
7. Update state: `setAiCollectedData(data)`, append assistant message with `content`, `data`, and optionally `missingFields`.
8. On API error: append an assistant message like "Something went wrong. Please try again or add more detail." and optionally toast.
9. Always scroll to bottom of message list after appending.

### 5.4 Summary view

- **Back link:** "Back to conversation" → `setAiFlowStep("conversation")`.
- **Table:** For each key in `aiCollectedData` (flattened: include `location.state`, `location.area`, `additionalFeatures.noOfBedroom`, etc.), show a row: Field name (human-readable label) | Value.
- **Button:** "Continue to image upload". On click:
  - Merge `aiCollectedData` into your form state (only fill empty fields or overwrite with AI values as per your merge logic).
  - `setAiFlowStep(null)`.
  - `setCurrentStep(imageStepIndex)` (e.g. 2) so the next screen is the image upload step.

### 5.5 getMissingFieldsFromData(data)

Implement a function that returns an array of **human-readable missing field names** from the API `data` object. Be strict: treat empty strings, zero, undefined, or empty arrays as "missing". Example checks:

- **Required-like:** property type, property category, location (state and area or local government), price (number > 0), description.
- **Condition / building:** property condition, type of building.
- **Rooms:** If bedrooms present but bathrooms/toilets missing → add "number of bathrooms and toilets" (or split). If bathrooms/toilets present but bedrooms missing → add "number of bedrooms". If residential and none of bedrooms/bathrooms/toilets → add "number of bedrooms, bathrooms, and toilets".
- **Parking:** If no parking info but you have bedrooms or category → add "parking (number of spaces or none)".
- **Documents:** If no `documents` or `docOnProperty` (or empty) → add "property documents / title (e.g. C of O, governor's consent)".
- **Features:** If no `features` or empty → add "key features (e.g. parking, generator, security, water supply)".

Return a string array; these are concatenated into "I still need: …" in the assistant reply.

---

## 6. Data Summary and Merge

- **Summary:** Flatten `aiCollectedData` for display (location as object → state, area, localGovernment; `additionalFeatures` → noOfBedroom, noOfBathroom, noOfToilet, noOfCarPark; top-level keys like propertyType, price, description, features).
- **Merge:** When user clicks "Continue to image upload", run a **merge function** that takes current form state and `aiCollectedData` and returns a partial form state: only set fields that are empty in current or that the API provided. Then set form state to `{ ...current, ...merged }` and navigate to the image step.

---

## 7. AiFillBlock (Input + Voice + Converting Message)

Reusable component: textarea + mic button + primary action (e.g. "Send" or "Fill with AI").

### 7.1 Props

- `title` (optional label)
- `placeholder` (textarea)
- `buttonLabel` (e.g. "Send" or "Fill with AI")
- `onSuggest: (userInput: string) => Promise<void>` – called with trimmed text when user submits (primary button or equivalent)
- `disabled`, `maxHeight` (optional)

### 7.2 Mic icon and Stop button

- **Idle:** Show a **Mic** icon; button label is mic only or "Use voice".
- **Recording:** On click, start browser Speech Recognition. Then show:
  - A **Stop** control (same button toggles to Stop): e.g. a small **blinking red dot** + text "Stop".
  - Optional: a row of 5 vertical bars with a subtle scale animation (e.g. `transform: scaleY(0.4)` to `scaleY(1)`) to indicate "listening".
- **Stop:** On Stop click, call `recognition.stop()`, set `listening` to false, and show the "Converting your speech to text…" state (see 7.4).

### 7.3 Speech Recognition setup

- Use `window.SpeechRecognition` or `window.webkitSpeechRecognition`.
- Set `continuous: true` and `interimResults: true` so the user can speak for a long time and you get partial results.
- Set `lang` (e.g. `"en-NG"`).
- **onresult:** Collect only **final** results (`result.isFinal`). Concatenate transcripts and update the textarea (append or replace as desired). When you append final transcript to the input, **clear the "Converting…" message** and cancel any timeout (so the message disappears as soon as text is ready).
- **onerror:**
  - `aborted`: no UI change.
  - `no-speech`: do nothing (recognition may restart via onend).
  - `not-allowed`: toast "Microphone access denied. Allow the mic and try again."
  - `network`: toast "Voice needs a stable internet connection. You can type your description below instead."
  - Others: toast "Voice input failed. Try typing instead."
  - On any handled error (except aborted/no-speech): set `recognitionRef.current = null` and `setListening(false)` so the UI returns to the mic state.
- **onend:** If the ref is still set (you didn’t call stop), the browser ended the session (e.g. silence). Call `recognition.start()` again so it keeps listening until the user clicks Stop. If ref is null, set `listening` to false.
- **Stop button:** Call `recognition.stop()` in try/catch, then set ref to null and `listening` to false in a `finally` block so state always resets even if `stop()` throws.

### 7.4 "Converting your speech to text…"

- **When to show:** As soon as the user clicks **Stop** (or when you stop recognition programmatically and are waiting for final transcript).
- **When to hide:**
  - As soon as you receive **final** transcript in `onresult` and update the textarea (clear message and clear timeout).
  - Or after a **timeout** (e.g. 4 seconds) if the browser never sends a final result.
- **UI:** Do not use a tiny italic line. Use a clear block:
  - Container: rounded card with light green border/background (e.g. gradient).
  - A **spinner** (e.g. Loader2) next to the text.
  - Title: "Converting your speech to text…"
  - Subtitle: "This may take a moment"
  - Optional: a subtle **animation** on the container (e.g. gentle glow or pulse via `box-shadow` / opacity keyframes) so the state is obvious.

### 7.5 Primary action button

- On click: get trimmed text from textarea. If empty, toast "Please enter a description first." Else call `onSuggest(trimmed)`. On success you may clear the textarea and show a success toast. On error, show error toast. Disable button (and optionally mic) while `onSuggest` is in progress and show a loading spinner in the button.

### 7.6 Text-to-Speech (reply playback)

- **API:** [Web Speech API — SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/Speech_Synthesis_API). Client-only (no `window` in SSR).
- **Usage:** `window.speechSynthesis`, `SpeechSynthesisUtterance` for the text, and `speak()` to play. Optionally set `lang` (e.g. `"en-NG"`), `rate`, `pitch`, `volume` for a consistent assistant voice.
- **In the app:** Preference and property AI flows use `useSpeechSynthesis` (see `src/hooks/useSpeechSynthesis.ts`). Users can enable "Play replies aloud" to hear the latest assistant message when it arrives, and use the speaker icon on each assistant message to replay or stop playback.

---

## 8. API Contract (Suggest Property)

- **Endpoint:** e.g. `POST /account/ai/suggest-property`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ userInput: string }` (accumulated or single message)
- **Response:** `{ success: boolean, message?: string, data?: Record<string, unknown> }`
- **Frontend:** If `success` and `data`, use `data` for missing-fields check and for `aiCollectedData`. If 404 or "not found", show "AI suggestions are not available yet. Please fill in the form manually." If 503 or "unavailable", show "AI service is temporarily unavailable. Please fill the form manually."

For full request/response shapes and backend expectations, see **FRONTEND_API_GUIDE.md** Section 10 (AI-assisted form filling).

---

## 9. File / Component Checklist

Implement or adapt:

| Item | Purpose |
|------|--------|
| Context state | `postingMode`, `aiFlowStep`, `aiConversationMessages`, `aiCollectedData` + setters and reset in form reset |
| Mode selector | Two options; sets `postingMode` and `aiFlowStep` |
| AI conversation component | Conversation + summary views, handleSend, getMissingFieldsFromData, "I'm done", "Continue to image upload", "Change to manual form" |
| Data summary component | Flatten and display aiCollectedData; "Continue to image upload" triggers merge and step change |
| AiFillBlock | Textarea, mic/Stop, "Converting…" block with spinner and animation, primary button, Speech Recognition with continuous/interim, error handling |
| Merge utility | `mergeSuggestPropertyIntoForm(current, apiData)` → partial form state |
| Form page | Conditional render: mode selector when null; AI flow when ai + step 0; main form when manual or ai + step > 0; hide stepper when ai + step 0 |

---

## 10. Optional: TypeScript Types

```ts
type PostingMode = "ai" | "manual" | null;

interface AiConversationMessage {
  role: "user" | "assistant";
  content: string;
  data?: Record<string, unknown>;
  missingFields?: string[];
}

// In context:
postingMode: PostingMode;
aiFlowStep: "conversation" | "summary" | null;
aiConversationMessages: AiConversationMessage[];
aiCollectedData: Record<string, unknown> | null;
```

---

## 11. Summary of UX Details

- **Mode choice** is explicit and reversible ("Change to manual form").
- **AI does not auto-fill the form;** it shows a **summary** of collected data, then user continues to image upload and the merged data is applied before the next step.
- **Voice:** Mic → recording (blinking red dot + Stop + optional bars) → Stop → "Converting your speech to text…" (visible with spinner and animation until text is in or timeout).
- **Network/voice errors** are met with a clear message and suggestion to type instead.
- **Missing fields** are strictly derived on the frontend from the API `data` and echoed in the assistant reply ("I still need: …") so the user can add more in the next message.
- **Loading:** While waiting for the suggest API, a persistent "Reading your description and preparing suggestions…" (or similar) message is shown so the user knows the app is working.

This guide is sufficient for a Cursor agent to implement the same AI vs manual form flow, including mic, Stop, converting message, and suggestion of missing/optional fields, on another frontend application.
