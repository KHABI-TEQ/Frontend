# Preference Submission with AI — Implementation Guide

This document describes the **exact logic and UI design** for the preference submission with AI flow in this app. Use it to implement the same behavior on another frontend application.

---

## 1. Overview

- **Entry point:** On the preference page, the user sees two options: **Use AI** or **Fill form manually**.
- **If Use AI:** The manual form (preference type tabs, steps, fields) is hidden. The user enters a **conversation flow**: they type or use voice to describe what they want; the AI returns structured data and asks for missing details. When the user is satisfied, they see a **summary** of collected data and can either **Submit** (send to API) or **Add more in form instead** (merge into manual form and continue editing).
- **If Fill form manually:** The mode selector is hidden and the standard multi-step preference form is shown (type selector, steps, fields, submit).
- **Voice:** Optional. A mic button starts browser Speech Recognition; a Stop button ends it. After stopping, a “Converting your speech to text…” message is shown until the transcript appears in the text area (or a timeout).
- **Text-to-speech (optional):** Users can enable “Play replies aloud” so the assistant’s replies are spoken via the Web Speech API (SpeechSynthesis). Each assistant message has a speaker icon to replay or stop playback.

---

## 2. State (Context)

Use a single preference form context that holds both manual form state and AI flow state.

### 2.1 AI flow state

| State | Type | Purpose |
|-------|------|--------|
| `preferenceEntryMode` | `"ai" \| "manual" \| null` | `null` = user has not chosen; `"ai"` = AI flow; `"manual"` = manual form. |
| `preferenceAiFlowStep` | `"conversation" \| "summary" \| null` | When in AI mode: show conversation UI or the data summary screen. `null` when not in AI flow or after user leaves AI (e.g. “Add more in form instead”). |
| `preferenceAiMessages` | `Array<PreferenceAiMessage>` | Chat messages (user and assistant). |
| `preferenceAiCollectedData` | `Record<string, unknown> \| null` | Latest structured data returned by the suggest-preference API; used for summary and for submit/merge. |

**Message type:**

```ts
interface PreferenceAiMessage {
  role: "user" | "assistant";
  content: string;
  data?: Record<string, unknown>;       // present on assistant messages with API data
  missingFields?: string[];             // human-readable missing field labels
  formatHint?: string;                   // optional hint for expected format
}
```

**Initial values:**

- `preferenceEntryMode: null`
- `preferenceAiFlowStep: null`
- `preferenceAiMessages: []`
- `preferenceAiCollectedData: null`

**Reset (e.g. “Change to manual form”, or after successful submit):** Set all four to the initial values above. Also clear any manual form data if your design requires a full reset.

---

## 3. Page-level conditional rendering

On the preference page (single page with provider):

1. **When `preferenceEntryMode === null`**  
   Show only the **mode selector** (Use AI vs Fill form manually). Hide preference type tabs, steps, and form.

2. **When `preferenceEntryMode === "ai"` and `preferenceAiFlowStep !== null`**  
   Show only the **AI flow** component (conversation or summary). Hide preference type tabs, steps, and manual form.

3. **When `preferenceEntryMode === "manual"` OR (`preferenceEntryMode === "ai"` and `preferenceAiFlowStep === null`)**  
   Show **preference type selector**, **step progress**, and **manual form** (all steps).  
   - If the user came from AI and clicked “Add more in form instead”, `preferenceAiFlowStep` is set to `null` and merged data is already in form state, so they see the form with data filled.

4. **Success modal**  
   When the user submits from the AI summary (or from the manual form), show the same success modal (e.g. “Preference Submitted Successfully!” with “Submit a new preference” and “Go to marketplace”). Register a callback (e.g. `registerOnSubmittedFromAi`) so that the AI flow can trigger this modal on successful submit.

---

## 4. Mode selector UI

**When:** `preferenceEntryMode === null`.

**Layout:** One card/row with two options.

**Option 1 — Use AI**

- **Copy (heading):** “Use AI”
- **Copy (body):** “Describe what you're looking for in your own words. The AI will ask for any missing details until we have enough to match you.”
- **Icon:** Sparkles (or similar).
- **Styling:** Border and background in brand green (e.g. `border-[#8DDB90]`, `bg-[#f0fdf4]/60`), hover slightly darker.
- **On click:** `setPreferenceEntryMode("ai")`, `setPreferenceAiFlowStep("conversation")`.

**Option 2 — Fill form manually**

- **Copy (heading):** “Fill form manually”
- **Copy (body):** “Complete each section of the preference form step by step.”
- **Icon:** FileEdit (or similar).
- **Styling:** Neutral border/background (e.g. `border-gray-200`, `bg-gray-50/50`).
- **On click:** `setPreferenceEntryMode("manual")`.

**Container:** Heading above: “How would you like to submit your property preference?” Subheading: “Use AI to describe what you're looking for in conversation, or fill the form manually.”

---

## 5. AI conversation flow — two sub-views

The AI flow component switches between **conversation** and **summary** based on `preferenceAiFlowStep`.

---

### 5.1 Conversation view (`preferenceAiFlowStep === "conversation"`)

**Container:** Rounded card, light green border/background (e.g. `rounded-xl border border-[#8DDB90]/40 bg-[#f0fdf4]/60`), padding `p-4 md:p-6`, spacing `space-y-4`.

**Header row**

- **Title:** “Describe what you're looking for” with MessageSquare icon in green.
- **Link/button (right):** “Change to manual form”. On click: `setPreferenceEntryMode(null)`, `setPreferenceAiMessages([])`, `setPreferenceAiCollectedData(null)`, `setPreferenceAiFlowStep(null)`.

**Instructions**

- Line 1: “Type or use the mic to describe the property you want. The AI will ask for any missing details. When you're done, click ‘I'm done’ to see the summary and continue to the form.”
- Line 2 (smaller, italic): “Tip: If voice input fails (e.g. network), type your description instead.”

**Play replies aloud (optional)**

- Checkbox: “Play replies aloud (text-to-speech)”. When checked, the latest assistant reply is spoken automatically when it arrives (Web Speech API SpeechSynthesis). Unchecking stops any current playback.

**Loading state (while waiting for suggest API)**

- Visible when `loading === true`.
- Block: rounded border, light green background, spinner (Loader2) + text: “Reading your description and preparing suggestions…”.

**Message list**

- Scrollable area (e.g. `max-h-64 overflow-y-auto`), white background, border, padding.
- Empty state: “Start by describing what you're looking for below.” (italic, muted).
- For each message:
  - **User:** Row aligned right (`justify-end`). Bubble: dark green background (`bg-[#09391C]`), white text, rounded, `max-w-[85%]`. Content: `msg.content`.
  - **Assistant:** Row aligned left (`justify-start`). Left: small avatar circle (e.g. Bot icon on `bg-[#8DDB90]/20`) and below it a **speaker button** (Volume2 when idle, VolumeX when speaking). On click: if currently speaking, stop; else speak `getSpeakableAssistantText(msg)` (content + “I still need: …” if `missingFields`). Bubble: gray background (`bg-gray-100`), dark text (`text-[#09391C]`).
  - **Assistant message with missing fields:** Show `msg.content`, then “I still need:”, then `<ul>` of `missingFields`, then “Please provide these so we can match you with the right properties.” and append `formatHint` if present.
  - **Assistant message without missing fields:** Show only `msg.content`.
- Scroll to bottom after appending messages (ref on a div at end of list, `scrollIntoView({ behavior: "smooth" })`).

**Input area (AiFillBlock)**

- **Props:** `title=""`, `placeholder="e.g. 3-bedroom in Lekki, Lagos, max 50 million, with parking..."`, `buttonLabel={loading ? "Sending…" : "Send"}`, `onSuggest={handleSuggest}`, `disabled={loading}`, `maxHeight="80px"`.
- **Behavior:** User types or uses mic; on Send, `handleSuggest(userInput)` is called (which calls `handleSend`).

**“I'm done — show summary” button**

- Shown only when there is at least one assistant message: `preferenceAiMessages.some(m => m.role === "assistant")`.
- Styling: outline style, green border, e.g. `border-2 border-[#8DDB90] text-[#09391C]`.
- On click: `setPreferenceAiFlowStep("summary")`.

---

### 5.2 Sending a message (handleSend) — exact logic

1. **Validate:** `trimmed = textOverride.toString().trim()`. If empty, toast “Please enter or say something.” and return.
2. **Set loading:** `setLoading(true)`.
3. **Append user message:** `setPreferenceAiMessages(prev => [...prev, { role: "user", content: trimmed }])`.
4. **Scroll to bottom.**
5. **Build accumulated user text:**  
   `accumulated = [...preferenceAiMessages, { role: "user", content: trimmed }].filter(m => m.role === "user").map(m => m.content).join(". ")`
6. **Call suggest API:** `suggestPreference(accumulated || trimmed)` (no auth; see API section).
7. **On API success with `res.data`:**
   - Let `data = res.data` (or `{}`).
   - **Contact from user text:** Run `extractContactFromText(trimmed)` and `extractContactFromText(accumulated)`; merge email, phoneNumber, fullName into `data.contactInfo` (only set non-empty).
   - **Missing fields:** `missingFields = getMissingFieldsFromPreferenceData(data)`.
   - **Format hint:** `formatHint = getFormatHintForMissingFields(missingFields)` (optional string to append to assistant message).
   - **Assistant content:**  
     - If `missingFields.length > 0`: “Here's what I have so far:”  
     - Else: “Here's what I have so far: I have enough to build your preference. If everything looks good, click \"I'm done\" below to see the summary and continue to the form.”
   - **Update state:**  
     - `setPreferenceAiCollectedData(data)`  
     - Append assistant message: `{ role: "assistant", content: assistantContent, data, missingFields: hasMissing ? missingFields : undefined, formatHint: hasMissing ? formatHint : undefined }`
   - **Scroll to bottom.**
8. **On API success with `!res.success`:** Append assistant message with `content: res.message || "Could not get suggestions. Please try again or add more detail."`, scroll to bottom.
9. **On throw:** Toast error, append assistant “Something went wrong. Please try again or add more detail.”, scroll to bottom.
10. **Finally:** `setLoading(false)`.

---

### 5.3 getMissingFieldsFromPreferenceData(data)

Implement a function that returns a **string[]** of human-readable missing/incomplete field names, based on the same rules as your manual form validation and backend expectations.

**Required for all:**

- **Preference type:** One of buy, rent, shortlet, joint venture.
- **Location:** State and at least one LGA (or area); plus area name or custom location.
- **Budget:** `minPrice` and `maxPrice` (numbers > 0); `maxPrice > minPrice`.
- **Contact (non-JV):** fullName, email or phoneNumber.
- **Contact (JV):** companyName, contactPerson, email, phoneNumber.

**By preference type:**

- **Buy:** propertyType (land/residential/commercial), buildingType, propertyCondition, bedrooms (if residential/commercial), documentTypes (at least one).
- **Rent:** propertyType, buildingType, propertyCondition, leaseTerm, bedrooms (if residential).
- **Shortlet:** checkInDate, checkOutDate, propertyType, bedrooms, bathrooms, numberOfGuests, travelType.
- **Joint-venture:** minLandSize, measurementUnit, jvType or developmentTypes (at least one), preferredSharingRatio, minimumTitleRequirements (at least one).

**Optional but suggested:** features/amenities, additional notes.

Return a string array; these are shown in the assistant message as “I still need: …”.

---

### 5.4 getFormatHintForMissingFields(missingFields)

Optional. Returns a short string describing **expected format** for the missing categories (e.g. “preference type: write exactly one of buy, rent, shortlet, joint venture”; “budget: minPrice and maxPrice in Naira, no commas”). Append this to the assistant message so users know how to phrase the next reply. Use simple text; no apostrophes in examples.

---

### 5.5 extractContactFromText(text)

Parse `text` for email (regex), Nigerian phone (0xxxxxxxxxx or 234…), and full name (after “name:” or last non-email, non-phone segment). Return `{ email?, phoneNumber?, fullName? }`. Used to merge contact into API `data` when the API omits or misparses contact.

---

### 5.6 Summary view (`preferenceAiFlowStep === "summary"`)

**Back link:** “Back to conversation” with ArrowLeft icon. On click: `setPreferenceAiFlowStep("conversation")`.

**Container:** Same green-tinted card style as conversation view.

**Title:** “Preference summary” with CheckCircle icon (green).

**Subtitle:** “Review the details below. When you're ready, submit your preference to get matched with properties.”

**Table:** Two columns — Field (label) | Value.

- Rows from `flattenPreferenceData(preferenceAiCollectedData)` (see below).
- If no rows: show one row with “No data to display. Add more in the conversation.” (centered, muted).
- Styling: white background, border, header row with gray background; cells padded (e.g. `py-3 px-4`).

**flattenPreferenceData(data):** Build an array of `{ key, label, value }` from `data`, e.g. preferenceType → “Preference type”, location.state → “State”, location.localGovernmentAreas/lgas → “LGAs / Areas”, budget.minPrice/maxPrice → “Min budget (₦)” / “Max budget (₦)”, propertyDetails.*, contactInfo.*, features, nearbyLandmark, additionalNotes, developmentDetails.*, bookingDetails.*. Format nested objects and arrays as readable strings (e.g. array → comma-separated).

**Primary button:** “Submit”

- On click: `handleSubmitFromSummary`.
- Disabled when `submitting || rows.length === 0`.
- While submitting: show Loader2 spinner and “Submitting…” in button.

**Secondary button:** “Add more in form instead”

- On click: merge `preferenceAiCollectedData` into form state via `mergeSuggestPreferenceIntoForm`, then `setPreferenceAiFlowStep(null)`, `goToStep(0)`. User then sees the manual form with data filled so they can edit and submit from there.

---

### 5.7 handleSubmitFromSummary — exact logic

1. If `!preferenceAiCollectedData` return.
2. `merged = mergeSuggestPreferenceIntoForm(preferenceAiCollectedData)` (API shape → form-like shape).
3. `type = String(preferenceAiCollectedData.preferenceType ?? "buy").toLowerCase()`.
4. If type not in `["buy", "rent", "shortlet", "joint-venture"]`, toast “Invalid preference type. Please go back and specify buy, rent, shortlet, or joint venture.” and return.
5. `setSubmitting(true)`.
6. **Build payload:** `payload = buildPreferencePayload(merged, type)`. Your `buildPreferencePayload` must accept the merged form-like object and selected type and return the payload your submit API expects (location, budget, features, propertyDetails/bookingDetails/developmentDetails, contactInfo, etc.).
7. **POST** to your preference submit URL (e.g. `POST /preferences/submit`) with `payload`.
8. On success: toast “Preference submitted successfully!”, call `resetForm()` (or equivalent: reset AI state and optionally form state), then `triggerSubmittedFromAi()` so the page shows the success modal.
9. On failure: toast “Failed to submit preference. Please try again.”
10. **Finally:** `setSubmitting(false)`.

---

## 6. Merge and payload

**mergeSuggestPreferenceIntoForm(apiData):** Maps API response (preferenceType, location, budget, propertyDetails, features, contactInfo, bookingDetails, developmentDetails, etc.) into the **same shape** your manual form and `buildPreferencePayload` use (e.g. `location.lgas`, `location.state`, `budget.minPrice`/`maxPrice`, `contactInfo.fullName`/`email`/`phoneNumber`). Return a single object that can be spread into form state or passed to `buildPreferencePayload`.

**buildPreferencePayload(formData, selectedPreferenceType):** Builds the exact JSON body your backend expects for `POST /preferences/submit`. Handle buy, rent, shortlet, joint-venture with the correct fields (e.g. propertyDetails for buy/rent, bookingDetails for shortlet, developmentDetails for JV). Used both by the manual form submit and by the AI summary submit (with `merged` as formData).

---

## 7. AiFillBlock (input + voice + converting message)

Reusable block: textarea + mic/Stop + primary button.

**Props:** `title`, `placeholder`, `buttonLabel`, `onSuggest: (userInput: string) => Promise<void>`, `disabled`, `maxHeight`.

**Behavior:**

- User types in textarea; on primary button click, call `onSuggest(trimmed)`. If empty, toast “Please enter a description first.” Disable button (and mic) while `onSuggest` is in progress; show spinner in button and label “Sending…” (or “Getting suggestions…”).
- **Mic:** Idle = Mic icon. Click → start Web Speech Recognition (`SpeechRecognition` or `webkitSpeechRecognition`), `continuous: true`, `interimResults: true`, `lang: "en-NG"`. Show Stop (red dot + “Stop”) and optional 5 vertical bars with scale animation. On Stop → `recognition.stop()`, set “Converting your speech to text…” (see below). Process `onresult` using `event.resultIndex` as start index; push final transcripts into pending list; keep last interim in a ref. On stop, flush pending + last interim into the textarea (append to existing). Handle `onerror` (aborted, no-speech, not-allowed, network, other) and `onend` (restart if not user-stopped).
- **Converting message:** Shown after user clicks Stop until transcript is written or timeout (e.g. 4 s). Block: rounded, light green border/background, Loader2 spinner, title “Converting your speech to text…”, subtitle “This may take a moment”. Optional subtle glow animation.

**UI details:** Textarea full width, rounded, border; focus ring green. Mic/Stop button at bottom-right of textarea. Primary button (e.g. green “Send”) beside or below the textarea row.

---

## 8. Text-to-speech (optional)

- **API:** `window.speechSynthesis`, `SpeechSynthesisUtterance`. Client-only.
- **Hook:** e.g. `useSpeechSynthesis({ lang: "en-NG", rate: 0.95 })` returning `{ speak, stop, speaking }`.
- **Auto-play:** When “Play replies aloud” is checked and a new assistant message is added, call `speak(getSpeakableAssistantText(msg))` (e.g. in a `useEffect` when message list length increases and last message is assistant).
- **Per-message:** Speaker icon on each assistant message: click to play that message’s text or stop if already playing.

---

## 9. APIs

### 9.1 Suggest preference (conversation)

- **Endpoint:** `POST /ai/suggest-preference` (or your equivalent; public, no auth).
- **Body:** `{ userInput: string }` — accumulated or single user message.
- **Response:** `{ success: boolean, message?: string, data?: Record<string, unknown> }`.
- **Frontend:** If `success && data`, use `data` for missing-fields check, contact merge, and `preferenceAiCollectedData`. If `!success`, show `message` in an assistant message. On 503 or “not configured”/“unavailable”, show “AI service is temporarily unavailable. Please fill the form manually.”

### 9.2 Submit preference (summary and manual form)

- **Endpoint:** `POST /preferences/submit` (or your equivalent).
- **Body:** Same payload as manual form (from `buildPreferencePayload`).
- **Response:** `{ success: boolean, ... }`.
- **On success:** Toast, reset AI state, trigger success modal (same as manual submit).

---

## 10. Success modal (shared)

After submit (from AI summary or manual form):

- **Title:** “Preference Submitted Successfully!”
- **Body:** e.g. “Thank you for submitting your property preference. We'll start matching you with suitable properties…”
- **Primary button:** “Do you want to submit a new preference” → close modal, reset form, go to step 0.
- **Secondary link:** “No, go to market place” (or home) → close modal, reset, navigate.

---

## 11. File / component checklist

| Item | Purpose |
|------|--------|
| Context | `preferenceEntryMode`, `preferenceAiFlowStep`, `preferenceAiMessages`, `preferenceAiCollectedData` + setters; reset on “Change to manual form” and on submit; `registerOnSubmittedFromAi` / `triggerSubmittedFromAi` for success modal. |
| Mode selector | Two options (Use AI / Fill form manually); sets `preferenceEntryMode` and `preferenceAiFlowStep`. |
| Preference AI flow component | Conversation view (messages, AiFillBlock, “I'm done”), summary view (table, Submit, Add more in form), handleSend, handleSubmitFromSummary, handleContinueToForm, handleBackToMode. |
| getMissingFieldsFromPreferenceData | Returns string[] of missing field labels from API `data`. |
| getFormatHintForMissingFields | Optional; returns format hint string from missing fields. |
| extractContactFromText | Parses email, phone, name from user text. |
| flattenPreferenceData | Converts `preferenceAiCollectedData` to table rows `{ key, label, value }`. |
| mergeSuggestPreferenceIntoForm | API data → form-like object for merge and buildPreferencePayload. |
| buildPreferencePayload | Form-like data + type → submit API payload (buy/rent/shortlet/joint-venture). |
| AiFillBlock | Textarea, mic/Stop, “Converting…”, primary button, Speech Recognition. |
| useSpeechSynthesis | Optional TTS hook for “Play replies aloud” and per-message speaker. |
| Preference page | Conditional render: mode selector when null; AI flow when ai + flowStep non-null; manual form when manual or ai + flowStep null. Success modal triggered by manual submit or triggerSubmittedFromAi. |

---

## 12. UX summary

- **Mode choice** is explicit and reversible (“Change to manual form”).
- **AI does not auto-submit.** User sees a summary, then chooses “Submit” or “Add more in form instead”.
- **Voice:** Mic → recording (Stop + optional bars) → Stop → “Converting your speech to text…” until transcript appears or timeout.
- **Errors:** Network/voice → suggest typing; API errors → assistant message + optional toast.
- **Missing fields** are derived from API `data` and shown in the assistant reply (“I still need: …”) so the user can add more in the next message.
- **Loading:** While suggest API is in progress, show “Reading your description and preparing suggestions…”.
- **Submit from summary** uses the same submit endpoint and success modal as the manual form.

This guide gives you the exact logic and UI design to replicate preference submission with AI on another frontend.
