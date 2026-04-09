# Preference submission with AI — implementation spec

This document describes the **current frontend logic** for the interactive preference (buyer/public) AI flow: conversation ordering, **exact user-facing prompts**, suggest-API wrapping, merge rules, and final submit payload. Another team can mirror this behaviour server-side or in a different client.

**Primary source files (this repo)**

| Concern | Path |
|--------|------|
| Conversation UI & orchestration | `src/components/preference-form/PreferenceAiConversationFlow.tsx` |
| User-facing question text (display + TTS) | `src/utils/aiInteractivePrompts.ts` → `getPreferenceFieldPrompt`, `preferenceAllDonePrompt` |
| Suggest API client | `src/services/aiFormService.ts` → `suggestPreference` |
| User text wrapper for LLM | `src/utils/wrapAiSuggestUserInput.ts` → `wrapUserInputForAiSuggest` |
| Merge API → collected state | `src/utils/aiSuggestPreferenceMerge.ts` |
| Submit payload | `src/utils/buildPreferencePayload.ts` |
| Budget typing / STT formatting | `src/utils/nairaAmountInput.ts`, `src/components/ai-form-fill/AiFillBlock.tsx` |

---

## High-level flow

```mermaid
sequenceDiagram
  participant U as User
  participant UI as AiFillBlock + Chat
  participant F as PreferenceAiConversationFlow
  participant API as POST /ai/suggest-preference
  participant M as mergePreferenceAiCollectedData
  participant S as POST /preferences/submit

  U->>UI: Type or speak message
  UI->>F: onSuggest(text) — digits-only for budget steps when amount mode
  F->>F: Append user message; build contextual userInput
  F->>API: userInput = wrapUserInputForAiSuggest(contextual)
  API-->>F: { success, data: partial preference shape }
  F->>M: merge + client-side patches (location, bedrooms, etc.)
  F->>F: getMissingFieldsFromPreferenceData → first missing → prompt
  F->>UI: Assistant message (displayLine + speakLine + focusedMissingField)

  Note over U,S: After "all done", user confirms name/email, then summary submit
  F->>S: buildPreferencePayload(mergedFormData, type)
```

1. User must start with a **listing type**: Buy, Rent, Shortlet, or JV (detected from text or stored `preferenceType`).
2. Each turn: call **`suggestPreference`** with wrapped + contextual text; **merge** response into accumulated `preferenceAiCollectedData`; apply **client-side fixes** when the model omits fields; recompute **missing fields**; ask the **first** missing item.
3. When nothing is missing, show **`preferenceAllDonePrompt`**; user opens contact step, enters name/email, then summary → **`buildPreferencePayload`** → **`POST …/preferences/submit`** (no `receiverMode`; general preference).

---

## 1. Suggest API (extraction LLM)

### Endpoint

- **Method / path:** `POST {NEXT_PUBLIC_API_URL}/ai/suggest-preference`
- **Auth:** None (public).
- **Body:** `{ "userInput": "<wrapped string>" }`
- **Client timeout:** 120 seconds (`AI_SUGGEST_POST_TIMEOUT_MS` in `aiFormService.ts`).

### Exact wrapper prepended to every `userInput` (LLM-only; not shown in chat UI)

From `src/utils/wrapAiSuggestUserInput.ts`, function `wrapUserInputForAiSuggest`:

```
The following text may come from voice dictation or hurried typing. Before extracting fields: (1) Correct likely misheard or misspelled words; (2) Fix Nigerian place names, areas, LGAs, landmarks, and common property terms; (3) Normalize spoken numbers and naira amounts to sensible figures; DO NOT change the user's intent. Use the corrected understanding for extraction only — output structured data as usual.

--- USER DESCRIPTION ---

```

Immediately after this block, the client appends the **contextual** user text (see below).

### Contextual suffix (focused field)

From `PreferenceAiConversationFlow` `handleSend`, when the **previous assistant** message had `focusedMissingField`, the string sent to the API is:

```text
<accumulated user messages joined by ". ">

[The user is answering this specific field: <focusedMissingField>]
```

Where `<focusedMissingField>` is the **internal missing-field key** (see §3), e.g. `preference location - state (required)`.

---

## 2. Missing-field keys and question order

Logic: `getMissingFieldsFromPreferenceData` in `PreferenceAiConversationFlow.tsx`.  
The **first** element of the returned array is the next question.  
Skipped optional fields are tracked in a `Set` (skippable fields only).

### 2.1 `preferenceType` / `preferenceMode`

- If no type: push  
  `preference type (required: start with Buy, Rent, Shortlet, or JV — same as choosing listing type on the form)`  
- Stored type must be one of: `buy` | `rent` | `shortlet` | `joint-venture`.  
- `preferenceMode` pairing (also enforced on submit):  
  - buy → `buy`  
  - rent → `tenant`  
  - shortlet → `shortlet`  
  - joint-venture → `developer`

### 2.2 Location (all types that use it)

After sanitization (`getSanitizedPreferenceLocation`, LGA/area dedupe, user-mention filter, etc.), **in order**:

1. `preference location - state (required)`
2. `preference location - LGA (required)`
3. `preference location - area (required)` — unless `customLocation` is set (and not duplicate of state/LGA).

### 2.3 Joint venture only (`joint-venture`)

After location block:

1. `development type(s) (required — at least one, as on JV form step Development Type)`
2. `measurement unit for land (required — plot, sqm, hectares, or acres)`
3. `minimum land size (required — numeric size as on JV land requirements step)`
4. `preferred sharing ratio (required — JV terms & proposal step)`
5. `minimum title requirements (required — at least one, e.g. C of O, as on title & documentation step)`
6. `company name (required for JV contact — full name and email are filled on the next screen only)`

JV path does **not** use the buy/rent/shortlet budget block in this function.

### 2.4 Buy / rent / shortlet (non–JV)

Location first; **only when** `isPreferenceLocationCompleteForData(data)`:

**Buy** (`propertyDetails` + subtype):

- Subtype: `property subtype (required — land, residential, or commercial, as on Property details & Budget)`
- Land measurement: `land measurement unit (required for buy — plot, sqm, hectares, or acres)`
- If unit is `sqm`:  
  - `minimum land size (required for buy when unit is sqm — same as form min land size)`  
  - `maximum land size (required for buy when unit is sqm — same as form max land size)`  
- Else: `land size (required for buy — single size when unit is not sqm, same as form)`
- `document type(s) (required for buy — at least one, same as form)`
- If subtype ≠ land: condition + building type; if residential: bedrooms → bathrooms → toilets → car parks (see exact strings below).

**Rent:** subtype, condition/building (if not land), residential bedrooms.

**Shortlet:** property type, travel type, bedrooms, bathrooms, max guests; after budget block: check-in / check-out.

**Budget (buy, rent, shortlet):**

- `budget minimum price in Naira (required — same as min price on the form, use commas e.g. 20,000,000)`
- `budget maximum price in Naira (required — same as max price on the form, use commas e.g. 50,000,000)`
- If both set and invalid: `budget max price must be greater than min price`

**Residential buy chain (exact strings):**

- `number of bedrooms (required for residential buy — same as form)`
- `number of bathrooms (required for residential buy — after bedrooms)`
- `number of toilets (required for residential buy — after bathrooms)`
- `number of car parks (required for residential buy — after toilets)`

### 2.5 Not prompted in AI flow (defaults on submit)

Features, additional notes, and nearby landmark are **not** added to `missing` anymore; `buildPreferencePayload` supplies empty/default `features` etc.

---

## 3. Exact user-facing prompts (`getPreferenceFieldPrompt`)

Implementation: `src/utils/aiInteractivePrompts.ts`.

The chat shows **`displayLine`**; TTS uses **`speakLine`** (no “format:” clause in speak line).

**Variant usage:** `buildPreferenceInteractiveReply` calls `getPreferenceFieldPrompt(focus, 0)` — **always variant `0`**. So for branches that use `pickVariant([...], variant)`, **only the first option** is used in production.

### 3.1 Completion (no missing fields)

From `preferenceAllDonePrompt()`:

- **displayLine:** `All set. Tap "I'm done — confirm contact" to type your name and email.`
- **speakLine:** `All set. Tap I'm done, confirm contact, to type your name and email.`

### 3.2 Format pattern

For most fields:  
`displayLine = "${speak} (format: ${sample})"`  
where `sample` comes from `preferenceSample(focus)` in the same file.

### 3.3 Fixed preference-location prompts (variant-independent)

| Internal key contains | speak (display prepends this + ` (format: …)`) |
|------------------------|--------------------------------------------------|
| `preference location - state` | `Which Nigerian state?` |
| `preference location - lga` | `Which local government area (LGA)?` |
| `preference location - area` | `Which area or neighbourhood within that LGA?` |

Samples: `Lagos`, `Ikeja`, `Lekki Phase 1` respectively.

### 3.4 Preference type (variant **0**)

- **speak:** `Start by saying whether this is Buy, Rent, Shortlet, or JV.`
- **display:** above + ` (format: Buy)`

### 3.5 Budget strings (variant **0**)

| Missing key contains | speak |
|---------------------|--------|
| `min price` (and not `max price must`) | `What's your minimum budget in Naira? Use comma-separated digits, e.g. 20,000,000.` |
| `max price must` | `Maximum must be higher than minimum — enter max price in Naira with commas.` |
| `max price` | `What's your maximum budget in Naira? Use commas, e.g. 50,000,000.` |

Samples: `15,000,000` / `50,000,000` / `50,000,000` per `preferenceSample`.

### 3.6 Buy subtype & land (fixed speak lines)

| Condition | speak |
|-----------|--------|
| `property subtype` (buy/rent branch) | `Property subtype: land, residential, or commercial for a buy preference, or your rent subtype (e.g. flat, bungalow).` |
| `land measurement unit` (buy) | `Measurement unit for land size: plot, sqm, hectares, or acres?` |
| `land size` + `single` (buy) | First variant: `Total land size in that unit?` |
| `minimum land size` + `sqm` (buy) | First variant: `Minimum land size in square metres?` |
| `maximum land size` + `buy` | First variant: `Maximum land size for buy?` |

### 3.7 Buy documents, condition, building, bedrooms, baths (variant **0** where pickVariant)

| Missing key contains | speak |
|---------------------|--------|
| `document type` or `document` + `least` | `Which documents do you need?` |
| `property condition` | `What condition?` |
| `building type` | `What type of building?` |
| `bedroom` | `How many bedrooms?` |
| `bathroom` + `residential buy` | `How many bathrooms? Say 1 to 10, or more for more than ten.` |
| `toilet` + `residential buy` | `How many toilets?` |
| `car park` + `residential buy` | `How many car parking spaces?` |

### 3.8 Rent / shortlet / JV (representative variant **0**)

- **Rent** residential bedrooms: `How many bedrooms?`
- **Shortlet** property type: `Which shortlet property type?`  
- **Shortlet** travel type: `Travel type?`  
- **Shortlet** bathrooms: `How many bathrooms?`  
- **Shortlet** guests: `Maximum guests the unit should allow?`  
- **Shortlet** check-in / check-out: `Check-in date?` / `Check-out date?`  
- **JV** `measurement unit for land`: `Which unit for land size: plot, sqm, hectares, or acres?`  
- **JV** `development type`: `What are you developing?`  
- **JV** `minimum land size` + `land requirements`: `Minimum land size for this JV requirement?`  
- **JV** `preferred sharing` / `sharing ratio`: `Preferred profit split?`  
- **JV** `minimum title`: `Minimum title requirements?`  
- **JV** `company name`: `What's the company name?`

### 3.9 Fallback

If no branch matches, `getPreferenceFieldPrompt` uses generic templates with `fieldPromptLabel(focus)`:

- `What ${lab}?` / `Which ${lab}?` / … (variant 0: `What ${lab}?`)

---

## 4. Client-side patches after each suggest merge

Still in `PreferenceAiConversationFlow.tsx` (after `mergePreferenceAiCollectedData`):

- **`applyPreferenceLandMeasurementFromFocusedAnswer`** — if focus is land measurement, map words → `plot|sqm|hectares|acres`.
- **`applyPreferenceBedroomsFromFocusedAnswer`** — if focus contains `number of bedrooms`, set `bedrooms` + `minBedrooms`.
- **`applyPreferenceBuyResidentialCountFromFocusedAnswer`** — bathrooms / toilets / car parks for residential buy.
- **Location:** `applyPreferenceLocationFromFocusedAnswer`, `filterPreferenceLocationToUserMentionedOnly`, hierarchy coercions, `keepBestPreferenceLocationProgress`, etc.
- **Contact:** email/phone merged from `extractContactFromText`; **`fullName` is not** merged during chat (name only on contact confirm step).

**Skip utterance:** `/^\s*(please\s+)?skip\b/i` — skips skippable fields only; required fields get a refusal message.

**Type detection:** `detectPreferenceTypeFromText` on current message and accumulated user text; must align with stored `preferenceType`.

---

## 5. Budget input (STT + typing)

When the **last assistant** `focusedMissingField` matches budget min/max (see `preferenceAmountEntryMode` in `PreferenceAiConversationFlow.tsx`), `AiFillBlock` sets **`amountEntryMode`**:

- **Typing:** `normalizeNairaAmountTyping` — digits only in value, displayed with thousands separators.
- **Speech:** `mergeVoiceTextWithSpokenAmount` — converts phrases like “five million” to formatted digits when the utterance is “complete” (e.g. contains thousand/million/billion, or parsed value ≥ 1000, or digit string length ≥ 4).
- **Send:** `stripNairaAmountToDigits` — `onSuggest` receives **no commas** (e.g. `5000000`).  
- **“skip”** in amount mode still sends the word `skip`, not digits.

---

## 6. Merge and submit

### 6.1 `mergeSuggestPreferenceIntoForm` / `mergePreferenceAiCollectedData`

- Maps API `features.baseFeatures` → form `basicFeatures`; `autoAdjustToFeatures` or `autoAdjustToBudget` → `autoAdjustToBudget`.
- Preserves non-empty LGA/areas when API sends empty arrays.
- Reads `location.lgasWithAreas` into `enhancedLocation.lgasWithAreas` when present.
- Does not merge top-level `receiverMode` or `status` from patch.

### 6.2 Final submit

- **`mergeSuggestPreferenceIntoForm(preferenceAiCollectedData)`** then **`buildPreferencePayload(merged, type)`**.
- **POST** `{NEXT_PUBLIC_API_URL}/preferences/submit` with payload matching backend Joi (see comments in `buildPreferencePayload.ts`): includes `location.lgasWithAreas`, `budget.currency: "NGN"`, `features.baseFeatures` / `premiumFeatures` / `autoAdjustToFeatures`, and exactly one of `propertyDetails` | `developmentDetails` | `bookingDetails` by type. **Do not** send `receiverMode` for general submit.

---

## 7. Checklist for a second implementation

- [ ] Same **missing-field key strings** (or identical ordering rules) so `getPreferenceFieldPrompt` mapping stays consistent if you share prompt tables.
- [ ] Same **wrap** string for `userInput` + **focused-field** suffix.
- [ ] Same **merge** semantics (empty array handling, `enhancedLocation`, features key names).
- [ ] Same **client patches** for location, bedrooms, bathrooms, land unit, or accept that the model must return complete objects every time.
- [ ] **Submit payload** shape aligned with `buildPreferencePayload.ts` and your API’s Joi schema.
- [ ] **120s** timeout (or equivalent) on suggest calls.
- [ ] **Amount mode** behaviour if you replicate budget UX (comma display, digit-only to API).

---

*Generated from the Frontend repo implementation. Update this file when prompt strings or `getMissingFieldsFromPreferenceData` change.*
