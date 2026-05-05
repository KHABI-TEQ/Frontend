"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo, useLayoutEffect } from "react";
import { usePreferenceForm } from "@/context/preference-form-context";
import { suggestPreference } from "@/services/aiFormService";
import AiFillBlock from "@/components/ai-form-fill/AiFillBlock";
import {
  mergePreferenceAiCollectedData,
  mergeSuggestPreferenceIntoForm,
} from "@/utils/aiSuggestPreferenceMerge";
import {
  getPreferenceFieldPrompt,
  preferenceAllDonePrompt,
} from "@/utils/aiInteractivePrompts";
import { assistantMessageToSpeakable } from "@/utils/ttsText";
import { buildPreferencePayload } from "@/utils/buildPreferencePayload";
import { POST_REQUEST } from "@/utils/requests";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import {
  resolveVoiceArea,
  resolveVoiceIntent,
  resolveVoiceLga,
  resolveVoiceState,
} from "@/utils/voicePreferenceResolver";
import toast from "react-hot-toast";
import { ArrowLeft, MessageSquare, Bot, Loader2, CheckCircle, Volume2, VolumeX, ChevronDown } from "lucide-react";
import nigerianStateLgaJson from "@/data/state-lga.json";
import { getAreasByStateLGA, getLGAsByState, getStates } from "@/utils/location-utils";

const LOCATION_OPTIONS_PAGE_SIZE = Number.MAX_SAFE_INTEGER;
const SHOW_MORE_LOCATION_OPTIONS = "Show more";
const DONE_SELECTING_AREAS = "Done selecting areas";
const AREA_DONE_MARKER = "__AREA_DONE__::";

/** Lowercase names as in the location form dataset (keys of state-lga.json). */
const NIGERIAN_STATE_NAMES_LOWER = new Set(
  Object.keys(nigerianStateLgaJson as Record<string, unknown>).map((k) => k.trim().toLowerCase()),
);
const NIGERIAN_STATE_NAMES = Object.keys(nigerianStateLgaJson as Record<string, unknown>).map((k) => k.trim());

function sanitizeAiFailureMessage(raw: unknown): string {
  const message = String(raw || "").trim();
  if (!message) {
    return "I couldn't process that properly. Please repeat your last answer in simple words.";
  }
  const technicalPatterns: RegExp[] = [
    /expected\s*','\s*or\s*'\}'\s*after\s*property\s*value\s*in\s*json/i,
    /json\s+at\s+position\s+\d+/i,
    /syntaxerror/i,
    /unexpected\s+token/i,
    /cannot\s+read\s+propert/i,
    /stack\s+trace/i,
    /line\s+\d+\s+column\s+\d+/i,
  ];
  if (technicalPatterns.some((re) => re.test(message))) {
    return "I couldn't process that properly. Please repeat your last answer in simple words.";
  }
  return message;
}

function fieldLabelOnly(field: string): string {
  return field.replace(/\s*\([^)]*\)\s*$/, "").trim() || field;
}

function getSpeakableAssistantText(msg: { content: string; speakLine?: string }): string {
  return assistantMessageToSpeakable(msg);
}

const SKIP_UTTERANCE_RE = /^\s*(please\s+)?skip\b/i;

function isPreferenceFieldSkippable(field: string): boolean {
  const f = field.toLowerCase();
  if (f.includes("(optional)")) return true;
  if (f.includes("key features") || f.includes("amenities")) return true;
  if (f.includes("additional notes") || f.includes("special requirements")) return true;
  if (f.includes("nearby landmark")) return true;
  return false;
}

function buildPreferenceInteractiveReply(
  data: Record<string, unknown>,
  skipped: Set<string>,
  questionVariant: number,
): {
  content: string;
  speakLine?: string;
  focusedMissingField?: string;
  missingFields: string[];
  remainingMissingCount: number;
  quickOptions?: string[];
  locationAllOptions?: string[];
  locationOptionsOffset?: number;
  locationOptionsLabel?: string;
} {
  const missing = getMissingFieldsFromPreferenceData(data).filter((f) => !skipped.has(f));
  const missingRequiredForCount = missing.filter((f) => !isPreferenceFieldSkippable(f));

  if (missing.length === 0) {
    const done = preferenceAllDonePrompt();
    return {
      content: done.displayLine,
      speakLine: done.speakLine,
      missingFields: [],
      remainingMissingCount: 0,
    };
  }

  const focus = missing[0];
  // Stable wording (variant 0): do not rotate phrasing for the same field — avoids sounding like a new question.
  const { displayLine, speakLine } = getPreferenceFieldPrompt(focus, 0);

  return {
    content: displayLine,
    speakLine,
    focusedMissingField: focus,
    missingFields: [focus],
    remainingMissingCount: Math.max(0, missingRequiredForCount.length - 1),
  };
}

function buildLocationPagedReply(
  baseReply: {
    content: string;
    speakLine?: string;
    focusedMissingField?: string;
    missingFields: string[];
    remainingMissingCount: number;
    quickOptions?: string[];
  },
  label: string,
  allOptions: string[],
  offset = 0,
) {
  const start = Math.max(0, offset);
  const page = allOptions;
  const hasMore = false;
  const isAreaLabel = label.toLowerCase().includes("areas in ");
  const range = page.length > 0 ? `${start + 1}-${start + page.length}` : "0";
  return {
    ...baseReply,
    content: `${baseReply.content}\n\nAvailable ${label}:\n${page.join(", ")}${
      hasMore
        ? `\n\nShowing ${range} of ${allOptions.length}.`
        : ""
    }${isAreaLabel ? `\n\nYou can select multiple areas, then tap "${DONE_SELECTING_AREAS}".` : ""}`,
    quickOptions: [
      ...page,
      ...(hasMore ? [SHOW_MORE_LOCATION_OPTIONS] : []),
      ...(isAreaLabel ? [DONE_SELECTING_AREAS] : []),
    ],
    locationAllOptions: allOptions,
    locationOptionsOffset: start,
    locationOptionsLabel: label,
  };
}

function resolveCanonicalStateName(rawState: string): string {
  const state = rawState.trim();
  if (!state) return "";
  const match = getStates().find((s) => s.toLowerCase() === state.toLowerCase());
  return match || state;
}

function resolveCanonicalLgaName(state: string, rawLga: string): string {
  const lga = rawLga.trim();
  if (!state || !lga) return "";
  const match = getLGAsByState(state).find((x) => x.toLowerCase() === lga.toLowerCase());
  return match || lga;
}

function withPreferenceLocationOptions(
  reply: {
    content: string;
    speakLine?: string;
    focusedMissingField?: string;
    missingFields: string[];
    remainingMissingCount: number;
    quickOptions?: string[];
    locationAllOptions?: string[];
    locationOptionsOffset?: number;
    locationOptionsLabel?: string;
  },
  data: Record<string, unknown>,
) {
  const focus = normalizePreferenceFieldKey(reply.focusedMissingField || "");
  const loc = getSanitizedPreferenceLocation(data);
  if (!focus || !loc) return reply;

  if (focus.includes("preference location - lga")) {
    const state = resolveCanonicalStateName(String(loc.state || ""));
    const lgas = getLGAsByState(state);
    if (lgas.length > 0) {
      return buildLocationPagedReply(reply, `LGAs in ${state}`, lgas, 0);
    }
    return reply;
  }

  if (focus.includes("preference location - area")) {
    const state = resolveCanonicalStateName(String(loc.state || ""));
    const selectedLga = resolveCanonicalLgaName(
      state,
      getMeaningfulLgas(loc, state)[0] || "",
    );
    const areas = getAreasByStateLGA(state, selectedLga);
    if (areas.length > 0) {
      return buildLocationPagedReply(reply, `areas in ${selectedLga}, ${state}`, areas, 0);
    }
  }

  return reply;
}

function isMeaningful(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return !Number.isNaN(value) && value >= 0;
  if (Array.isArray(value)) return value.length > 0;
  return false;
}

function preferenceModeFromType(t: string): string {
  switch (t) {
    case "buy":
      return "buy";
    case "rent":
      return "tenant";
    case "shortlet":
      return "shortlet";
    case "joint-venture":
      return "developer";
    default:
      return "";
  }
}

/** Detect Buy / Rent / Shortlet / JV from natural text so the user can start with a type, as the form requires. */
function detectPreferenceTypeFromText(text: string): string | null {
  const raw = text.trim();
  if (!raw) return null;
  // Reuse voice resolver aliases even for typed/text responses (handles ASR words like "Bye" => buy).
  const resolved = resolveVoiceIntent(raw);
  if (resolved.kind === "normalized") {
    const v = String(resolved.value || "").trim().toLowerCase();
    if (v === "buy" || v === "rent" || v === "shortlet" || v === "joint-venture") {
      return v;
    }
  }
  if (/\bjoint\s*venture\b|\bjv\b/i.test(raw)) return "joint-venture";
  if (/\bshortlet\b|\bshort\s*let\b/i.test(raw)) return "shortlet";
  if (/\bbuy\b|\bpurchase\b|\bto\s+buy\b/i.test(raw)) return "buy";
  if (/\brent\b|\bletting\b|\btenant\b/i.test(raw)) return "rent";
  return null;
}

function budgetAmountNgn(value: unknown): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number") return Number.isFinite(value) && value > 0 ? value : 0;
  const cleaned = String(value).replace(/,/g, "").trim();
  const n = parseFloat(cleaned);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function landSizeAmountPositive(value: unknown): boolean {
  if (value === undefined || value === null || value === "") return false;
  const n = parseFloat(String(value).replace(/,/g, "").trim());
  return Number.isFinite(n) && n > 0;
}

function getPropertySubtype(pd: Record<string, unknown> | undefined): string {
  if (!pd) return "";
  const s = pd.propertySubtype ?? pd.propertyType;
  return String(s || "").toLowerCase().trim();
}

function bedroomsPresent(pd: Record<string, unknown> | undefined): boolean {
  if (!pd) return false;
  const b = pd.bedrooms ?? pd.minBedrooms;
  if (b === undefined || b === null || b === "") return false;
  if (b === "More") return true;
  const n = typeof b === "number" ? b : parseInt(String(b), 10);
  return Number.isFinite(n);
}

function bathroomsPositive(pd: Record<string, unknown> | undefined): boolean {
  if (!pd || pd.bathrooms == null) return false;
  const n = typeof pd.bathrooms === "number" ? pd.bathrooms : parseFloat(String(pd.bathrooms).replace(/,/g, ""));
  return Number.isFinite(n) && n > 0;
}

/** Buy residential bathrooms use string "1"–"10" or "more" (matches PropertyDetails options). */
function buyResidentialBathroomsAnswered(pd: Record<string, unknown> | undefined): boolean {
  if (!pd || pd.bathrooms == null) return false;
  const s = String(pd.bathrooms).trim().toLowerCase();
  if (!s) return false;
  if (s === "more") return true;
  const n = parseInt(s, 10);
  return Number.isFinite(n) && n >= 1 && n <= 10;
}

function nonNegativeIntPresent(v: unknown, max = 99): boolean {
  if (v === undefined || v === null || v === "") return false;
  const n = typeof v === "number" ? v : parseInt(String(v), 10);
  return Number.isFinite(n) && n >= 0 && n <= max;
}

function parseFirstCountFromUserText(text: string): number | null {
  const m = text.trim().match(/\b(\d{1,3})\b/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) ? n : null;
}

function parseBuyBathroomChoiceFromUserText(text: string): string | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  if (/\bmore\b/.test(t)) return "more";
  const n = parseFirstCountFromUserText(t);
  if (n != null && n >= 1 && n <= 10) return String(n);
  return null;
}

function shortletMaxGuestsPresent(
  pd: Record<string, unknown> | undefined,
  bd: Record<string, unknown> | undefined,
): boolean {
  const mg = pd?.maxGuests;
  if (mg !== undefined && mg !== null && mg !== "") {
    const n = typeof mg === "number" ? mg : parseInt(String(mg), 10);
    if (Number.isFinite(n) && n > 0) return true;
  }
  const ng = bd?.numberOfGuests;
  if (ng != null) {
    const n = typeof ng === "number" ? ng : parseInt(String(ng), 10);
    if (Number.isFinite(n) && n > 0) return true;
  }
  return false;
}

function normalizedPreferenceType(data: Record<string, unknown>): string {
  const t = String(data.preferenceType || "").toLowerCase().trim();
  if (["buy", "rent", "shortlet", "joint-venture"].includes(t)) return t;
  return "";
}

/** Must match `MEASUREMENT_UNITS` values in PropertyDetails.tsx (buy) and JV land step. */
const PREFERENCE_LAND_MEASUREMENT_VALUES = new Set(["plot", "sqm", "hectares", "acres"]);

function isValidLandMeasurementUnitValue(v: unknown): boolean {
  const s = String(v ?? "").trim().toLowerCase();
  return PREFERENCE_LAND_MEASUREMENT_VALUES.has(s);
}

/** Map free text to canonical measurement `value` when the user is answering that field (API often omits it). */
function parseLandMeasurementUnitFromUserText(text: string): string | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  if (/\b(sqm|square\s*met(?:er|re)s?|m\s*2|m²)\b/i.test(t)) return "sqm";
  if (/\bhectares?\b/i.test(t)) return "hectares";
  if (/\bacres?\b/i.test(t)) return "acres";
  if (/\bplots?\b/i.test(t)) return "plot";
  if (PREFERENCE_LAND_MEASUREMENT_VALUES.has(t)) return t;
  return null;
}

/** Writes measurement unit from the user's reply when the assistant asked for that field. */
function applyPreferenceLandMeasurementFromFocusedAnswer(
  data: Record<string, unknown>,
  trimmed: string,
  focusedField: string | undefined,
): Record<string, unknown> {
  if (!focusedField || !trimmed) return data;
  const f = normalizePreferenceFieldKey(focusedField);
  const type = normalizedPreferenceType(data);
  const unit = parseLandMeasurementUnitFromUserText(trimmed);
  if (!unit) return data;

  if (type === "buy" && f.includes("land measurement unit")) {
    const pd = { ...((data.propertyDetails || {}) as Record<string, unknown>), measurementUnit: unit };
    return { ...data, propertyDetails: pd };
  }

  if (type === "joint-venture" && f.includes("measurement unit")) {
    const dev = { ...((data.developmentDetails || {}) as Record<string, unknown>), measurementUnit: unit };
    return { ...data, developmentDetails: dev };
  }

  return data;
}

/** Persist land size values when the user is answering land-size prompts (API can omit these). */
function applyPreferenceLandSizeFromFocusedAnswer(
  data: Record<string, unknown>,
  trimmed: string,
  focusedField: string | undefined,
): Record<string, unknown> {
  if (!focusedField || !trimmed) return data;
  const f = normalizePreferenceFieldKey(focusedField);
  const n = parseFloat(trimmed.replace(/,/g, "").trim());
  if (!Number.isFinite(n) || n <= 0) return data;
  const value = String(n);
  const type = normalizedPreferenceType(data);

  if (type === "buy") {
    const pd = { ...((data.propertyDetails || {}) as Record<string, unknown>) };
    if (f.includes("minimum land size")) {
      return { ...data, propertyDetails: { ...pd, minLandSize: value } };
    }
    if (f.includes("maximum land size")) {
      return { ...data, propertyDetails: { ...pd, maxLandSize: value } };
    }
    if (f.includes("land size")) {
      return { ...data, propertyDetails: { ...pd, landSize: value } };
    }
  }

  if (type === "joint-venture") {
    const dev = { ...((data.developmentDetails || {}) as Record<string, unknown>) };
    if (f.includes("minimum land size")) {
      return { ...data, developmentDetails: { ...dev, minLandSize: value } };
    }
    if (f.includes("maximum land size")) {
      return { ...data, developmentDetails: { ...dev, maxLandSize: value } };
    }
    if (f.includes("land size")) {
      return { ...data, developmentDetails: { ...dev, minLandSize: value } };
    }
  }

  return data;
}

function parseDocumentTypesFromUserText(text: string): string[] {
  const raw = text.trim();
  if (!raw) return [];
  const normalized = raw
    .replace(/\band\b/gi, ",")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const deduped: string[] = [];
  const seen = new Set<string>();
  for (const item of normalized) {
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }
  return deduped;
}

function parseBuyPropertySubtypeFromUserText(text: string): "land" | "residential" | "commercial" | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  if (/\bland\b/.test(t)) return "land";
  if (/\bresiden/i.test(t)) return "residential";
  if (/\bcommerc/i.test(t)) return "commercial";
  return null;
}

/** Persist property subtype directly from focused subtype prompt to avoid AI flipping subtype later. */
function applyPreferenceSubtypeFromFocusedAnswer(
  data: Record<string, unknown>,
  trimmed: string,
  focusedField: string | undefined,
): Record<string, unknown> {
  if (!focusedField || !trimmed) return data;
  const f = normalizePreferenceFieldKey(focusedField);
  if (!f.includes("property subtype")) return data;
  const type = normalizedPreferenceType(data);
  if (type !== "buy" && type !== "rent") return data;

  const pd = { ...((data.propertyDetails || {}) as Record<string, unknown>) };
  if (type === "buy") {
    const buySubtype = parseBuyPropertySubtypeFromUserText(trimmed);
    if (!buySubtype) return data;
    return { ...data, propertyDetails: { ...pd, propertySubtype: buySubtype, propertyType: buySubtype } };
  }

  return {
    ...data,
    propertyDetails: {
      ...pd,
      propertySubtype: trimmed.trim(),
      propertyType: trimmed.trim(),
    },
  };
}

/** Persist document types from the focused documents prompt (prevents repeat asking). */
function applyPreferenceDocumentTypesFromFocusedAnswer(
  data: Record<string, unknown>,
  trimmed: string,
  focusedField: string | undefined,
): Record<string, unknown> {
  if (!focusedField || !trimmed) return data;
  const f = normalizePreferenceFieldKey(focusedField);
  if (!f.includes("document type") && !f.includes("documents do you need")) return data;
  const docs = parseDocumentTypesFromUserText(trimmed);
  if (docs.length === 0) return data;
  if (normalizedPreferenceType(data) === "joint-venture") {
    const dev = { ...((data.developmentDetails || {}) as Record<string, unknown>) };
    return { ...data, developmentDetails: { ...dev, minimumTitleRequirements: docs } };
  }
  const pd = { ...((data.propertyDetails || {}) as Record<string, unknown>) };
  return { ...data, propertyDetails: { ...pd, documentTypes: docs } };
}

/** Persist bedroom count when answering the bedrooms question (suggest API often omits or strips it). */
function applyPreferenceBedroomsFromFocusedAnswer(
  data: Record<string, unknown>,
  trimmed: string,
  focusedField: string | undefined,
): Record<string, unknown> {
  if (!focusedField || !trimmed) return data;
  const f = normalizePreferenceFieldKey(focusedField);
  if (!f.includes("number of bedrooms")) return data;

  const pd = { ...((data.propertyDetails || {}) as Record<string, unknown>) };
  if (/\bmore\b/i.test(trimmed)) {
    return { ...data, propertyDetails: { ...pd, bedrooms: "More", minBedrooms: "More" } };
  }
  const n = parseFirstCountFromUserText(trimmed);
  if (n == null || n < 0) return data;
  const s = String(n);
  return { ...data, propertyDetails: { ...pd, bedrooms: s, minBedrooms: s } };
}

/** Persist bathroom / toilet / car-park counts when the user replies to those questions (API often omits them). */
function applyPreferenceBuyResidentialCountFromFocusedAnswer(
  data: Record<string, unknown>,
  trimmed: string,
  focusedField: string | undefined,
): Record<string, unknown> {
  if (!focusedField || !trimmed) return data;
  if (normalizedPreferenceType(data) !== "buy") return data;
  const pd = (data.propertyDetails || {}) as Record<string, unknown>;
  if (getPropertySubtype(pd) !== "residential") return data;

  const f = normalizePreferenceFieldKey(focusedField);
  const nextPd = () => ({ ...pd });

  if (f.includes("number of bathrooms") && f.includes("residential buy")) {
    const b = parseBuyBathroomChoiceFromUserText(trimmed);
    if (b) return { ...data, propertyDetails: { ...nextPd(), bathrooms: b } };
  }
  if (f.includes("number of toilets") && f.includes("residential buy")) {
    const n = parseFirstCountFromUserText(trimmed);
    if (n != null && n >= 0 && n <= 99) return { ...data, propertyDetails: { ...nextPd(), toilets: n } };
  }
  if (f.includes("car park") && f.includes("residential buy")) {
    const n = parseFirstCountFromUserText(trimmed);
    if (n != null && n >= 0 && n <= 99) return { ...data, propertyDetails: { ...nextPd(), parkingSpaces: n } };
  }

  return data;
}

function normalizePreferenceFieldKey(field: string): string {
  return field.toLowerCase().replace(/\u2013|\u2014/g, "-");
}

/** LGAs that are non-empty and not a duplicate of the state name (API often confuses state and LGA). */
function getMeaningfulLgas(loc: Record<string, unknown>, stateStr: string): string[] {
  const stateL = stateStr.trim().toLowerCase();
  const raw = Array.isArray(loc.localGovernmentAreas)
    ? loc.localGovernmentAreas
    : Array.isArray(loc.lgas)
      ? loc.lgas
      : [];
  return (raw as unknown[])
    .map((x) => String(x).trim())
    .filter((s) => s.length > 0 && s.toLowerCase() !== stateL);
}

/** Areas must be non-empty and not duplicates of state/LGA labels. */
function getMeaningfulAreas(loc: Record<string, unknown>, stateStr: string): string[] {
  const stateL = stateStr.trim().toLowerCase();
  const lgaSet = new Set(getMeaningfulLgas(loc, stateStr).map((x) => x.toLowerCase()));
  const raw = Array.isArray(loc.areas) ? loc.areas : [];
  return (raw as unknown[])
    .map((x) => String(x).trim())
    .filter((s) => {
      const l = s.toLowerCase();
      if (!l) return false;
      if (l === stateL) return false;
      if (lgaSet.has(l)) return false;
      return true;
    });
}

function syncPreferenceLocationLgaKeys(loc: Record<string, unknown>): Record<string, unknown> {
  const raw = Array.isArray(loc.localGovernmentAreas)
    ? loc.localGovernmentAreas
    : loc.lgas;
  const list = (Array.isArray(raw) ? raw : [])
    .map((x) => String(x).trim())
    .filter((s) => s.length > 0);
  return { ...loc, lgas: list, localGovernmentAreas: list };
}

/** Keep area keys aligned: accept singular `area` and normalize into `areas[]`. */
function syncPreferenceLocationAreaKeys(loc: Record<string, unknown>): Record<string, unknown> {
  const fromArr = (Array.isArray(loc.areas) ? (loc.areas as unknown[]) : [])
    .map((x) => String(x).trim())
    .filter(Boolean);
  const single = String(loc.area ?? "").trim();
  const merged = [...fromArr, ...(single ? [single] : [])];
  const deduped: string[] = [];
  const seen = new Set<string>();
  for (const item of merged) {
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }
  const next: Record<string, unknown> = { ...loc, areas: deduped };
  if (deduped.length > 0) next.area = deduped[0];
  else delete next.area;
  return next;
}

/** Only parse user text into location fields when they are answering a location step (matches form order: state → LGA → area). */
function shouldApplyUserTextToPreferenceLocation(focusedMissingField: string | undefined): boolean {
  if (!focusedMissingField) return false;
  const f = normalizePreferenceFieldKey(focusedMissingField);
  return (
    f.includes("preference location - state") ||
    f.includes("preference location - lga") ||
    f.includes("preference location - area")
  );
}

/**
 * Apply the user's answer directly to the currently focused location field.
 * This prevents AI merge noise from causing repeated location prompts.
 */
function applyPreferenceLocationFromFocusedAnswer(
  text: string,
  focusedMissingField: string | undefined,
  loc: Record<string, unknown>,
): Record<string, unknown> {
  const raw = text.trim();
  if (!raw || !focusedMissingField) return loc;
  const f = normalizePreferenceFieldKey(focusedMissingField);
  const next: Record<string, unknown> = { ...loc };

  if (f.includes("preference location - state")) {
    next.state = raw;
    next.localGovernmentAreas = [];
    next.lgas = [];
    next.areas = [];
    delete next.area;
    return syncPreferenceLocationAreaKeys(syncPreferenceLocationLgaKeys(next));
  }

  if (f.includes("preference location - lga")) {
    next.localGovernmentAreas = [raw];
    next.lgas = [raw];
    next.areas = [];
    delete next.area;
    return syncPreferenceLocationAreaKeys(syncPreferenceLocationLgaKeys(next));
  }

  if (f.includes("preference location - area")) {
    const current = Array.isArray(next.areas)
      ? (next.areas as unknown[]).map((x) => String(x).trim()).filter(Boolean)
      : [];
    const additions = raw
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    const merged = [...current];
    const seen = new Set(current.map((x) => x.toLowerCase()));
    for (const item of additions) {
      const key = item.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(item);
    }
    next.areas = merged;
    if (merged.length > 0) next.area = merged[0];
    return syncPreferenceLocationAreaKeys(syncPreferenceLocationLgaKeys(next));
  }

  return next;
}

/**
 * Remove `state` when it is clearly not a state name (e.g. whole sentence "I want to buy a property" from bad merges).
 * Prevents skipping ahead to LGA before a real state is chosen.
 */
function stripImplausiblePreferenceLocationState(loc: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!loc || typeof loc !== "object") return {};
  const st = String(loc.state ?? "").trim();
  if (!st) return { ...loc };
  const wordCount = st.split(/\s+/).filter(Boolean).length;
  const looksLikeNarration =
    wordCount > 5 ||
    /\b(i want|i'd like|i need|looking for|searching for|help me|submit|preference)\b/i.test(st);
  const looksLikeIntentNotState =
    /^(buy|rent|sale|sell|shortlet|jv|property|properties|land|flat|apartment|house|duplex|bungalow|studio|commercial|residential)$/i.test(
      st,
    ) || /\b(i want|looking)\b.*\b(buy|rent)\b/i.test(st);
  if (!looksLikeNarration && !looksLikeIntentNotState) return { ...loc };
  const next = { ...loc };
  delete next.state;
  return next;
}

function isRecognizedNigerianStateName(raw: string): boolean {
  const s = raw.trim().toLowerCase();
  if (!s) return false;
  if (NIGERIAN_STATE_NAMES_LOWER.has(s)) return true;
  return false;
}

/** Drop API-hallucinated location: keep only state/LGA/area/custom the user actually typed or said. */
function normalizeUserMentionBlob(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function userMessagesMentionPhrase(blobNorm: string, phrase: string): boolean {
  const p = normalizeUserMentionPhrase(phrase);
  if (!p) return false;
  return blobNorm.includes(p);
}

function normalizeUserMentionPhrase(phrase: string): string {
  return phrase.toLowerCase().replace(/\s+/g, " ").trim();
}

function filterPreferenceLocationToUserMentionedOnly(
  loc: Record<string, unknown>,
  userMessagesCombined: string,
): Record<string, unknown> {
  const blob = normalizeUserMentionBlob(userMessagesCombined);
  if (!blob) return { ...loc };

  let out: Record<string, unknown> = syncPreferenceLocationAreaKeys({ ...loc });
  const st = String(out.state ?? "").trim();
  if (st && !userMessagesMentionPhrase(blob, st)) {
    out = { ...out, state: "" };
  }

  const stateForLga = String(out.state ?? "").trim();
  const rawLgas = getMeaningfulLgas(out, stateForLga);
  const keptLgas = rawLgas.filter((g) => userMessagesMentionPhrase(blob, g));
  if (rawLgas.length > 0 && keptLgas.length === 0) {
    out = { ...out, localGovernmentAreas: [], lgas: [] };
  } else {
    out = { ...out, localGovernmentAreas: keptLgas, lgas: keptLgas };
  }

  const areas = Array.isArray(out.areas) ? (out.areas as unknown[]).map((x) => String(x).trim()).filter(Boolean) : [];
  const keptAreas = areas.filter((a) => userMessagesMentionPhrase(blob, a));
  if (areas.length > 0 && keptAreas.length === 0) {
    out = { ...out, areas: [] };
  } else {
    out = { ...out, areas: keptAreas };
  }

  const custom = String(out.customLocation ?? "").trim();
  if (custom && !userMessagesMentionPhrase(blob, custom)) {
    delete out.customLocation;
  }

  return syncPreferenceLocationAreaKeys(syncPreferenceLocationLgaKeys(out));
}

/** Same order as the form: no state → no LGA/areas; unknown state string → clear children. */
function coercePreferenceLocationFormHierarchy(loc: Record<string, unknown>): Record<string, unknown> {
  const st = String(loc.state ?? "").trim();
  if (!st) {
    const next: Record<string, unknown> = { ...loc, state: "", localGovernmentAreas: [], lgas: [], areas: [] };
    delete next.area;
    return syncPreferenceLocationLgaKeys(next);
  }
  if (!isRecognizedNigerianStateName(st)) {
    return syncPreferenceLocationLgaKeys({
      state: "",
      localGovernmentAreas: [],
      lgas: [],
      areas: [],
    });
  }
  return syncPreferenceLocationLgaKeys(loc);
}

/** Until at least one LGA is chosen, drop areas so the flow stays state → LGA → area. */
function stripPreferenceAreasUntilLgaSelected(loc: Record<string, unknown>): Record<string, unknown> {
  const st = String(loc.state ?? "").trim();
  if (!st || getMeaningfulLgas(loc, st).length > 0) return loc;
  const next: Record<string, unknown> = { ...loc, areas: [] };
  delete next.area;
  return syncPreferenceLocationLgaKeys(next);
}

/** Remove area values that are actually state/LGA repeats. */
function stripPreferenceAreasThatDuplicateStateOrLga(loc: Record<string, unknown>): Record<string, unknown> {
  const st = String(loc.state ?? "").trim();
  const areas = getMeaningfulAreas(loc, st);
  const next: Record<string, unknown> = { ...loc, areas };
  if (areas.length > 0) next.area = areas[0];
  else delete next.area;
  return next;
}

function getSanitizedPreferenceLocation(data: Record<string, unknown>): Record<string, unknown> {
  let loc = normalizeCompoundPreferenceLocation((data.location || {}) as Record<string, unknown>);
  loc = syncPreferenceLocationAreaKeys(loc);
  loc = stripImplausiblePreferenceLocationState(loc);
  loc = coercePreferenceLocationFormHierarchy(loc);
  loc = stripPreferenceAreasUntilLgaSelected(loc);
  loc = stripPreferenceAreasThatDuplicateStateOrLga(loc);
  return syncPreferenceLocationAreaKeys(loc);
}

/**
 * Prevent non-location turns from regressing already-captured location progress
 * due to imperfect AI merges (e.g. LGA gets dropped later and is asked again).
 */
function keepBestPreferenceLocationProgress(
  previousLocRaw: Record<string, unknown> | undefined,
  nextLocRaw: Record<string, unknown>,
  isLocationTurn: boolean,
): Record<string, unknown> {
  if (isLocationTurn) return nextLocRaw;
  const prev = getSanitizedPreferenceLocation({ location: previousLocRaw || {} } as Record<string, unknown>);
  const next = getSanitizedPreferenceLocation({ location: nextLocRaw || {} } as Record<string, unknown>);

  const prevState = String(prev.state ?? "").trim();
  const nextState = String(next.state ?? "").trim();
  const prevLgas = getMeaningfulLgas(prev, prevState);
  const nextLgas = getMeaningfulLgas(next, nextState);
  const prevAreas = Array.isArray(prev.areas) ? (prev.areas as unknown[]).map((x) => String(x).trim()).filter(Boolean) : [];
  const nextAreas = Array.isArray(next.areas) ? (next.areas as unknown[]).map((x) => String(x).trim()).filter(Boolean) : [];
  const prevHasCustom = isMeaningful(prev.customLocation);
  const nextHasCustom = isMeaningful(next.customLocation);

  // If next is less complete than previous, keep previous to avoid duplicate prompts.
  if (prevState && !nextState) return prev;
  if (prevLgas.length > 0 && nextLgas.length === 0) return prev;
  if ((prevAreas.length > 0 || prevHasCustom) && nextAreas.length === 0 && !nextHasCustom) return prev;
  return next;
}

/**
 * Prevent non-related turns from dropping already captured property details
 * (e.g. bedrooms disappearing and being asked again).
 */
function keepBestPreferencePropertyDetailsProgress(
  previousData: Record<string, unknown>,
  nextData: Record<string, unknown>,
  focusedField: string | undefined,
): Record<string, unknown> {
  const prevPd = (previousData.propertyDetails || {}) as Record<string, unknown>;
  const nextPd = (nextData.propertyDetails || {}) as Record<string, unknown>;
  if (!prevPd || Object.keys(prevPd).length === 0) return nextData;

  const mergedPd: Record<string, unknown> = { ...nextPd };
  const carry = (key: string) => {
    const prevVal = prevPd[key];
    const nextVal = nextPd[key];
    if (isMeaningful(prevVal) && !isMeaningful(nextVal)) {
      mergedPd[key] = prevVal;
    }
  };

  // Keep core progression fields stable unless user is actively answering them.
  carry("propertySubtype");
  carry("propertyType");
  carry("measurementUnit");
  carry("landSize");
  carry("minLandSize");
  carry("maxLandSize");
  carry("documentTypes");
  carry("propertyCondition");
  carry("buildingType");
  carry("bedrooms");
  carry("minBedrooms");
  carry("bathrooms");
  carry("toilets");
  carry("parkingSpaces");
  carry("carParks");
  carry("maxGuests");

  // Normalize malformed documentTypes from AI (string/object) into string[].
  const rawDocTypes = mergedPd.documentTypes;
  if (!Array.isArray(rawDocTypes)) {
    const fromRaw =
      typeof rawDocTypes === "string"
        ? parseDocumentTypesFromUserText(rawDocTypes)
        : Array.isArray(prevPd.documentTypes)
          ? (prevPd.documentTypes as string[])
          : [];
    if (fromRaw.length > 0) mergedPd.documentTypes = fromRaw;
  }

  // Keep previous valid numeric land-size values if AI returned invalid placeholders.
  const keepValidPositive = (key: "landSize" | "minLandSize" | "maxLandSize") => {
    const prevVal = prevPd[key];
    const nextVal = mergedPd[key];
    if (landSizeAmountPositive(prevVal) && !landSizeAmountPositive(nextVal)) {
      mergedPd[key] = prevVal;
    }
  };
  keepValidPositive("landSize");
  keepValidPositive("minLandSize");
  keepValidPositive("maxLandSize");

  return { ...nextData, propertyDetails: mergedPd };
}

/** Step 0 complete: state, LGAs, and at least one area or custom (same as validateStep case 0). */
function isPreferenceLocationCompleteForData(data: Record<string, unknown>): boolean {
  const loc = getSanitizedPreferenceLocation(data);
  if (!isMeaningful(loc.state)) return false;
  const hasLgas = getMeaningfulLgas(loc, String(loc.state || "")).length > 0;
  if (!hasLgas) return false;
  const hasArea = getMeaningfulAreas(loc, String(loc.state || "")).length > 0;
  const custom = String(loc.customLocation ?? "").trim();
  const customL = custom.toLowerCase();
  const hasCustom =
    custom.length > 0 &&
    customL !== String(loc.state ?? "").trim().toLowerCase() &&
    !new Set(getMeaningfulLgas(loc, String(loc.state || "")).map((x) => x.toLowerCase())).has(customL);
  return Boolean(hasArea || hasCustom);
}

/**
 * Parse "Lagos, Ikeja, Lekki Phase" (or single-segment replies per step) into
 * location.state, location.localGovernmentAreas, location.areas as the form expects.
 */
function applyPreferenceLocationFromNaturalText(
  text: string,
  loc: Record<string, unknown> | undefined,
): Record<string, unknown> {
  const base: Record<string, unknown> = { ...(loc || {}) };
  const raw = text.trim();
  if (!raw) return base;

  const hasState = isMeaningful(base.state);
  const hasLga = getMeaningfulLgas(base, String(base.state || "")).length > 0;
  const hasArea =
    (Array.isArray(base.areas) && base.areas.length > 0) ||
    isMeaningful(base.area) ||
    isMeaningful(base.customLocation);

  const parts = raw.split(/[,;]/).map((p) => p.trim()).filter(Boolean);

  if (parts.length >= 3) {
    base.state = parts[0];
    base.localGovernmentAreas = [parts[1]];
    base.areas = [parts.slice(2).join(", ")];
    return syncPreferenceLocationLgaKeys(base);
  }

  if (parts.length === 2) {
    if (!hasState) {
      base.state = parts[0];
      base.localGovernmentAreas = [parts[1]];
      return syncPreferenceLocationLgaKeys(base);
    }
    if (!hasLga) {
      base.localGovernmentAreas = [parts[0]];
      base.areas = [parts[1]];
      return syncPreferenceLocationLgaKeys(base);
    }
    if (!hasArea) {
      base.areas = [parts.join(", ")];
    }
    return syncPreferenceLocationLgaKeys(base);
  }

  if (parts.length === 1) {
    const v = parts[0];
    if (!hasState) base.state = v;
    else if (!hasLga) base.localGovernmentAreas = [v];
    else if (!hasArea) base.areas = [v];
    return syncPreferenceLocationLgaKeys(base);
  }

  return syncPreferenceLocationLgaKeys(base);
}

/** If API put "Lagos, Ikeja, ..." only in state, split into structured location. */
function normalizeCompoundPreferenceLocation(loc: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!loc || typeof loc !== "object") return {};
  const st = String(loc.state ?? "").trim();
  if (!st.includes(",")) return { ...loc };
  const withoutState = { ...loc, state: "" };
  return applyPreferenceLocationFromNaturalText(st, withoutState);
}

/**
 * Parse user text for email, phone, and full name so we recognize them even if the API
 * returns a different structure or omits contactInfo. Handles formats like:
 * "contact(maito4me@gmail.com), Sulaimon Rasheed" or "email: x@y.com, name: John Doe"
 */
function extractContactFromText(text: string): {
  email?: string;
  phoneNumber?: string;
  fullName?: string;
} {
  const out: { email?: string; phoneNumber?: string; fullName?: string } = {};
  const t = text.trim();
  if (!t) return out;

  // Email: standard pattern or inside contact(...)
  const emailInParens = t.match(/contact\s*\(\s*([^)]+)\s*\)/i);
  if (emailInParens) {
    const inner = emailInParens[1].trim();
    const emailMatch = inner.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) out.email = emailMatch[0];
  }
  if (!out.email) {
    const emailMatch = t.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) out.email = emailMatch[0];
  }
  // Also catch "email: x@y.com" or "e-mail: x@y.com"
  const emailLabel = t.match(/(?:email|e-mail)\s*[:\s]+\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
  if (emailLabel && !out.email) out.email = emailLabel[1].trim();

  // Nigerian phone: 0xxxxxxxxxx, +234..., 234...
  const phoneMatch = t.match(/(?:\+?234|0)[789]\d{9}\b/);
  if (phoneMatch) out.phoneNumber = phoneMatch[0].replace(/^234/, "0");
  const phoneLabel = t.match(/(?:phone|tel|number)\s*[:\s]+\s*([+\d][\d\s-]{9,})/i);
  if (phoneLabel && !out.phoneNumber) out.phoneNumber = phoneLabel[1].replace(/\s+/g, "").trim();

  // Name: after "name:" or last comma-separated segment that is not email/phone and has letters
  const nameLabel = t.match(/(?:name|full name)\s*[:\s]+\s*([A-Za-z][A-Za-z\s.-]{1,80})/i);
  if (nameLabel) {
    const n = nameLabel[1].trim();
    if (n.length >= 2 && !n.includes("@")) out.fullName = n;
  }
  if (!out.fullName) {
    // "contact(email), Sulaimon Rasheed" -> take part after last comma that looks like a name
    const parts = t.split(/[,;]/).map((p) => p.trim()).filter(Boolean);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      if (p.includes("@") || /^[+\d\s-]+$/.test(p)) continue;
      if (p.length >= 2 && /[A-Za-z]/.test(p)) {
        out.fullName = p;
        break;
      }
    }
  }

  return out;
}

/**
 * Returns missing fields in the same order users complete the real form (`validateStep` in preference-form-context).
 * Joint-venture uses only JV step rules (no buy/rent property-budget block); budget is not validated on JV steps.
 */
function getMissingFieldsFromPreferenceData(data: Record<string, unknown>): string[] {
  const missing: string[] = [];
  const type = normalizedPreferenceType(data);

  if (!type) {
    missing.push(
      "preference type (required: start with Buy, Rent, Shortlet, or JV — same as choosing listing type on the form)",
    );
    return missing;
  }

  const pushLocs = () => {
    const loc = getSanitizedPreferenceLocation(data);
    const hasState = loc && isMeaningful(loc.state);
    const hasLgas = loc && getMeaningfulLgas(loc, String(loc.state || "")).length > 0;
    const hasArea = loc && getMeaningfulAreas(loc, String(loc.state || "")).length > 0;
    const custom = String(loc?.customLocation ?? "").trim();
    const customL = custom.toLowerCase();
    const hasCustomLocation =
      custom.length > 0 &&
      customL !== String(loc?.state ?? "").trim().toLowerCase() &&
      !new Set(getMeaningfulLgas((loc || {}) as Record<string, unknown>, String(loc?.state || "")).map((x) => x.toLowerCase())).has(customL);

    if (!hasState) {
      missing.push("preference location - state (required)");
      return;
    }
    if (!hasLgas) {
      missing.push("preference location - LGA (required)");
      return;
    }
    if (!hasArea && !hasCustomLocation) {
      missing.push("preference location - area (required)");
    }
  };

  const pushBudgetBuyRentShortlet = () => {
    const budget = data.budget as Record<string, unknown> | undefined;
    const minPrice = budgetAmountNgn(budget?.minPrice);
    const maxPrice = budgetAmountNgn(budget?.maxPrice);
    if (minPrice <= 0) {
      missing.push("budget minimum price in Naira (required — same as min price on the form, use commas e.g. 20,000,000)");
    }
    if (maxPrice <= 0) {
      missing.push("budget maximum price in Naira (required — same as max price on the form, use commas e.g. 50,000,000)");
    }
    if (minPrice > 0 && maxPrice > 0 && maxPrice <= minPrice) {
      missing.push("budget max price must be greater than min price");
    }
  };

  // --- Joint venture (form steps: development type → land requirements → terms → title) ---
  if (type === "joint-venture") {
    const dev = data.developmentDetails as Record<string, unknown> | undefined;
    if (!dev || !Array.isArray(dev.developmentTypes) || (dev.developmentTypes as unknown[]).length === 0) {
      missing.push("development type(s) (required — at least one, as on JV form step Development Type)");
    }
    pushLocs();
    if (!dev || !isValidLandMeasurementUnitValue(dev.measurementUnit)) {
      missing.push("measurement unit for land (required — plot, sqm, hectares, or acres)");
    }
    if (!dev || !landSizeAmountPositive(dev.minLandSize)) {
      missing.push("minimum land size (required — numeric size as on JV land requirements step)");
    }
    if (!dev || !isMeaningful(dev.preferredSharingRatio)) {
      missing.push("preferred sharing ratio (required — JV terms & proposal step)");
    }
    if (!dev || !Array.isArray(dev.minimumTitleRequirements) || (dev.minimumTitleRequirements as unknown[]).length === 0) {
      missing.push("minimum title requirements (required — at least one, e.g. C of O, as on title & documentation step)");
    }
    const contact = data.contactInfo as Record<string, unknown> | undefined;
    if (!contact || !isMeaningful(contact.companyName)) {
      missing.push("company name (required for JV contact — full name and email are filled on the next screen only)");
    }
  } else {
    pushLocs();

    const pd = data.propertyDetails as Record<string, unknown> | undefined;
    const subtype = getPropertySubtype(pd);

    // Form order: step 0 Location must be complete before Property details & Budget (step 1).
    if (isPreferenceLocationCompleteForData(data)) {
      if (type === "buy" || type === "rent") {
        if (!pd || !isMeaningful(pd.propertySubtype ?? pd.propertyType)) {
          missing.push(
            type === "buy"
              ? "property subtype (required — land, residential, or commercial, as on Property details & Budget)"
              : "property subtype (required — e.g. self-con, flat, as on Property details & Budget)",
          );
        }
      }

      if (type === "buy" && subtype) {
        if (!pd || !isValidLandMeasurementUnitValue(pd.measurementUnit)) {
          missing.push("land measurement unit (required for buy — plot, sqm, hectares, or acres)");
        } else if (String(pd.measurementUnit).toLowerCase() === "sqm") {
          if (!landSizeAmountPositive(pd.minLandSize)) {
            missing.push("minimum land size (required for buy when unit is sqm — same as form min land size)");
          }
          if (!landSizeAmountPositive(pd.maxLandSize)) {
            missing.push("maximum land size (required for buy when unit is sqm — same as form max land size)");
          }
        } else if (!landSizeAmountPositive(pd.landSize)) {
          missing.push("land size (required for buy — single size when unit is not sqm, same as form)");
        }

        if (!pd || !Array.isArray(pd.documentTypes) || (pd.documentTypes as unknown[]).length === 0) {
          missing.push("document type(s) (required for buy — at least one, same as form)");
        }

        if (subtype !== "land") {
          if (!isMeaningful(pd?.propertyCondition)) {
            missing.push("property condition (required for buy when not land — same as form)");
          }
          if (!isMeaningful(pd?.buildingType)) {
            missing.push("building type (required for buy when not land — same as form)");
          }
          if (subtype === "residential") {
            const pdr = (pd || {}) as Record<string, unknown>;
            if (!bedroomsPresent(pd)) {
              missing.push("number of bedrooms (required for residential buy — same as form)");
            } else if (!buyResidentialBathroomsAnswered(pd)) {
              missing.push("number of bathrooms (required for residential buy — after bedrooms)");
            } else if (!nonNegativeIntPresent(pdr.toilets)) {
              missing.push("number of toilets (required for residential buy — after bathrooms)");
            } else if (!nonNegativeIntPresent(pdr.parkingSpaces ?? pdr.carParks)) {
              missing.push("number of car parks (required for residential buy — after toilets)");
            }
          }
        }
      }

      if (type === "rent") {
        if (subtype && subtype !== "land") {
          if (!isMeaningful(pd?.propertyCondition)) {
            missing.push("property condition (required for rent when not land — same as form)");
          }
          if (!isMeaningful(pd?.buildingType)) {
            missing.push("building type (required for rent when not land — same as form)");
          }
          if (subtype === "residential" && !bedroomsPresent(pd)) {
            missing.push("number of bedrooms (required for residential rent — same as form)");
          }
        }
      }

      if (type === "shortlet") {
        const bd = data.bookingDetails as Record<string, unknown> | undefined;
        if (!pd || !isMeaningful(pd.propertyType)) {
          missing.push(
            "property type (required for shortlet — e.g. studio, 1-bed apartment, as on Property details & Budget)",
          );
        }
        if (!pd || !isMeaningful(pd.travelType)) {
          missing.push("travel type (required for shortlet — same as form)");
        }
        if (!bedroomsPresent(pd)) {
          missing.push("number of bedrooms (required for shortlet — same as form)");
        }
        if (!bathroomsPositive(pd)) {
          missing.push("number of bathrooms (required for shortlet — same as form)");
        }
        if (!shortletMaxGuestsPresent(pd, bd)) {
          missing.push("maximum guests (required for shortlet — same as max guests on Property details & Budget)");
        }
      }

      pushBudgetBuyRentShortlet();

      if (type === "shortlet") {
        const bd = data.bookingDetails as Record<string, unknown> | undefined;
        if (!bd || !isMeaningful(bd.checkInDate)) {
          missing.push("check-in date (required for shortlet — Features step / dates on form, e.g. YYYY-MM-DD)");
        }
        if (!bd || !isMeaningful(bd.checkOutDate)) {
          missing.push("check-out date (required for shortlet — same as form)");
        }
      }
    }
  }

  // Features, additionalNotes, nearbyLandmark: optional in API — `buildPreferencePayload` defaults
  // empty feature arrays and omits empty optionals; do not prompt in AI flow.

  return missing;
}

function formatValue(value: unknown): string {
  if (value === undefined || value === null) return "—";
  if (typeof value === "object" && !Array.isArray(value)) {
    const loc = value as Record<string, unknown>;
    const parts = [loc.state, loc.localGovernmentAreas ?? loc.lgas].filter(Boolean);
    if (Array.isArray(parts[1])) return [loc.state, (parts[1] as string[]).join(", ")].filter(Boolean).join(": ") || "—";
    return parts.length ? String(parts[0]) : "—";
  }
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

function flattenPreferenceData(data: Record<string, unknown>): { key: string; label: string; value: string }[] {
  const out: { key: string; label: string; value: string }[] = [];
  if (data.preferenceType) out.push({ key: "preferenceType", label: "Preference type", value: String(data.preferenceType) });
  const loc = data.location as Record<string, unknown> | undefined;
  if (loc) {
    if (loc.state) out.push({ key: "state", label: "State", value: String(loc.state) });
    const lgas = loc.localGovernmentAreas ?? loc.lgas;
    if (Array.isArray(lgas) && lgas.length) out.push({ key: "lgas", label: "LGA(s)", value: (lgas as string[]).join(", ") });
    if (Array.isArray(loc.areas) && loc.areas.length) {
      out.push({ key: "areas", label: "Area(s)", value: (loc.areas as string[]).join(", ") });
    }
    if (loc.customLocation) out.push({ key: "customLocation", label: "Custom location", value: String(loc.customLocation) });
  }
  const budget = data.budget as Record<string, unknown> | undefined;
  if (budget) {
    if (budget.minPrice != null) out.push({ key: "minPrice", label: "Min budget (₦)", value: String(budget.minPrice) });
    if (budget.maxPrice != null) out.push({ key: "maxPrice", label: "Max budget (₦)", value: String(budget.maxPrice) });
  }
  const pd = data.propertyDetails as Record<string, unknown> | undefined;
  if (pd) {
    if (pd.propertySubtype) out.push({ key: "propertySubtype", label: "Property subtype", value: String(pd.propertySubtype) });
    if (pd.propertyType) out.push({ key: "propertyType", label: "Property type", value: String(pd.propertyType) });
    if (pd.bedrooms != null || pd.minBedrooms != null) out.push({ key: "bedrooms", label: "Bedrooms", value: String(pd.bedrooms ?? pd.minBedrooms) });
    if (pd.bathrooms != null || pd.minBathrooms != null) out.push({ key: "bathrooms", label: "Bathrooms", value: String(pd.bathrooms ?? pd.minBathrooms) });
    if (pd.toilets != null && pd.toilets !== "") out.push({ key: "toilets", label: "Toilets", value: String(pd.toilets) });
    const pk = (pd as Record<string, unknown>).parkingSpaces ?? (pd as Record<string, unknown>).carParks;
    if (pk != null && pk !== "") out.push({ key: "parkingSpaces", label: "Car parks", value: String(pk) });
    if (pd.buildingType) out.push({ key: "buildingType", label: "Building type", value: String(pd.buildingType) });
    if (pd.propertyCondition) out.push({ key: "propertyCondition", label: "Condition", value: String(pd.propertyCondition) });
    if (pd.leaseTerm) out.push({ key: "leaseTerm", label: "Lease term", value: String(pd.leaseTerm) });
    if (pd.purpose) out.push({ key: "purpose", label: "Purpose", value: String(pd.purpose) });
    if (Array.isArray(pd.documentTypes) && pd.documentTypes.length) {
      out.push({
        key: "documentTypes",
        label: "Documents needed",
        value: (pd.documentTypes as string[]).join(", "),
      });
    }
  }
  const dev = data.developmentDetails as Record<string, unknown> | undefined;
  if (dev) {
    if (dev.minLandSize || dev.maxLandSize) out.push({ key: "landSize", label: "Land size", value: [dev.minLandSize, dev.maxLandSize].filter(Boolean).join(" – ") });
    if (Array.isArray(dev.developmentTypes) && dev.developmentTypes.length) out.push({ key: "developmentTypes", label: "Development types", value: (dev.developmentTypes as string[]).join(", ") });
    if (dev.preferredSharingRatio) out.push({ key: "preferredSharingRatio", label: "Preferred sharing", value: String(dev.preferredSharingRatio) });
    if (Array.isArray(dev.minimumTitleRequirements) && dev.minimumTitleRequirements.length) {
      out.push({
        key: "minimumTitleRequirements",
        label: "Title documents needed",
        value: (dev.minimumTitleRequirements as string[]).join(", "),
      });
    }
  }
  const bd = data.bookingDetails as Record<string, unknown> | undefined;
  if (bd) {
    if (bd.checkInDate) out.push({ key: "checkInDate", label: "Check-in", value: String(bd.checkInDate) });
    if (bd.checkOutDate) out.push({ key: "checkOutDate", label: "Check-out", value: String(bd.checkOutDate) });
    if (bd.numberOfGuests != null) out.push({ key: "numberOfGuests", label: "Guests", value: String(bd.numberOfGuests) });
    if (Array.isArray(bd.documentTypes) && bd.documentTypes.length) {
      out.push({
        key: "bookingDocumentTypes",
        label: "Documents needed",
        value: (bd.documentTypes as string[]).join(", "),
      });
    }
  }
  const contact = data.contactInfo as Record<string, unknown> | undefined;
  if (contact) {
    if (contact.fullName) out.push({ key: "fullName", label: "Name", value: String(contact.fullName) });
    if (contact.email) out.push({ key: "email", label: "Email", value: String(contact.email) });
    if (contact.phoneNumber) out.push({ key: "phoneNumber", label: "Phone", value: String(contact.phoneNumber) });
    if (contact.preferredCheckInTime) out.push({ key: "preferredCheckInTime", label: "Check-in time", value: String(contact.preferredCheckInTime) });
    if (contact.preferredCheckOutTime) out.push({ key: "preferredCheckOutTime", label: "Check-out time", value: String(contact.preferredCheckOutTime) });
  }
  const features = data.features as Record<string, unknown> | undefined;
  if (features) {
    const base = features.baseFeatures as string[] | undefined;
    const premium = features.premiumFeatures as string[] | undefined;
    if (Array.isArray(base) && base.length) out.push({ key: "baseFeatures", label: "Features", value: base.join(", ") });
    if (Array.isArray(premium) && premium.length) out.push({ key: "premiumFeatures", label: "Premium features", value: premium.join(", ") });
  }
  if (data.nearbyLandmark) out.push({ key: "nearbyLandmark", label: "Nearby landmark", value: String(data.nearbyLandmark) });
  if (data.additionalNotes) out.push({ key: "additionalNotes", label: "Additional notes", value: String(data.additionalNotes) });
  return out;
}

const PREFERENCE_SUBMIT_URL = `${process.env.NEXT_PUBLIC_API_URL || ""}/preferences/submit`;

export default function PreferenceAiConversationFlow() {
  const {
    preferenceAiFlowStep,
    setPreferenceAiFlowStep,
    preferenceAiMessages,
    setPreferenceAiMessages,
    preferenceAiCollectedData,
    setPreferenceAiCollectedData,
    setPreferenceEntryMode,
    updateFormData,
    goToStep,
    resetForm,
    triggerSubmittedFromAi,
  } = usePreferenceForm();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  /** Manual name/email after voice (typed for accuracy). */
  const [manualFullName, setManualFullName] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  /** Fields the user skipped in the interactive AI flow (exact strings from getMissingFieldsFromPreferenceData). */
  const skippedFieldsRef = useRef<Set<string>>(new Set());
  const collectedDataRef = useRef<Record<string, unknown> | null>(null);
  const preferenceQuestionVariantRef = useRef(0);
  /** Default on: speak each assistant reply automatically; user can mute via toggle or stop via speaker icon. */
  const [playRepliesAloud, setPlayRepliesAloud] = useState(true);
  const [selectedAreaOptions, setSelectedAreaOptions] = useState<string[]>([]);
  const prevMessageCountRef = useRef(0);
  const conversationScrollRef = useRef<HTMLDivElement | null>(null);
  const newestChipsRef = useRef<HTMLDivElement | null>(null);
  const { speak, stop, speaking } = useSpeechSynthesis({ lang: "en-NG", rate: 0.95 });

  /** Budget min/max steps: format amounts with commas; send digits-only to the flow / backend. */
  const preferenceAmountEntryMode = useMemo(() => {
    const last = [...preferenceAiMessages].reverse().find((m) => m.role === "assistant") as
      | { focusedMissingField?: string }
      | undefined;
    const f = (last?.focusedMissingField ?? "").toLowerCase();
    if (!f) return false;
    return (
      (f.includes("budget") && (f.includes("naira") || f.includes("price"))) ||
      f.includes("minimum price") ||
      f.includes("maximum price")
    );
  }, [preferenceAiMessages]);

  useEffect(() => {
    collectedDataRef.current = preferenceAiCollectedData;
  }, [preferenceAiCollectedData]);

  useEffect(() => {
    if (preferenceAiMessages.length === 0) {
      skippedFieldsRef.current = new Set();
      preferenceQuestionVariantRef.current = 0;
      setSelectedAreaOptions([]);
    }
  }, [preferenceAiMessages.length]);

  useEffect(() => {
    const lastAssistant = [...preferenceAiMessages].reverse().find((m) => m.role === "assistant") as
      | { focusedMissingField?: string }
      | undefined;
    const focus = normalizePreferenceFieldKey(lastAssistant?.focusedMissingField || "");
    if (!focus.includes("preference location - area")) {
      setSelectedAreaOptions([]);
    }
  }, [preferenceAiMessages]);

  // Auto-play latest assistant reply when TTS is enabled (Web Speech API — SpeechSynthesis).
  useEffect(() => {
    const n = preferenceAiMessages.length;
    if (n > prevMessageCountRef.current && preferenceAiMessages[n - 1]?.role === "assistant" && playRepliesAloud) {
      speak(
        getSpeakableAssistantText(
          preferenceAiMessages[n - 1] as { content: string; speakLine?: string },
        ),
      );
    }
    prevMessageCountRef.current = n;
  }, [preferenceAiMessages, playRepliesAloud, speak]);

  // Keep chat pinned to newest content (latest AI suggestion / user turn),
  // while preventing parent-page scroll jumps.
  useLayoutEffect(() => {
    const container = conversationScrollRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [preferenceAiMessages, loading, submitting]);

  // When clarification chips appear, bring that set into view for quick mobile taps.
  useEffect(() => {
    const container = conversationScrollRef.current;
    const chips = newestChipsRef.current;
    if (!container || !chips) return;
    requestAnimationFrame(() => {
      const chipTop = chips.offsetTop;
      const chipBottom = chipTop + chips.offsetHeight;
      const viewTop = container.scrollTop;
      const viewBottom = viewTop + container.clientHeight;
      if (chipBottom > viewBottom) {
        container.scrollTo({ top: chipBottom - container.clientHeight + 12, behavior: "smooth" });
      } else if (chipTop < viewTop) {
        container.scrollTo({ top: Math.max(0, chipTop - 12), behavior: "smooth" });
      }
    });
  }, [preferenceAiMessages]);

  const handleSend = useCallback(
    async (textOverride: string) => {
      const rawInput = textOverride.toString().trim();
      const doneMarkerPayload = rawInput.startsWith(AREA_DONE_MARKER)
        ? rawInput.slice(AREA_DONE_MARKER.length).trim()
        : "";
      const trimmed = doneMarkerPayload || rawInput;
      if (!trimmed) {
        toast.error("Please enter or say something.");
        return;
      }

      const lastAssistForVoice = [...preferenceAiMessages]
        .reverse()
        .find((m) => m.role === "assistant");
      const voiceFocus = lastAssistForVoice?.focusedMissingField;
      const voiceFocusNorm = normalizePreferenceFieldKey(voiceFocus || "");
      const currentState = String(
        (((collectedDataRef.current || {}) as Record<string, unknown>).location as Record<string, unknown> | undefined)
          ?.state || "",
      ).trim();
      let normalizedInput = trimmed;
      const pulledLocationOptions =
        Array.isArray((lastAssistForVoice as { locationAllOptions?: string[] } | undefined)?.locationAllOptions)
          ? ((lastAssistForVoice as { locationAllOptions?: string[] }).locationAllOptions as string[])
          : [];
      if (voiceFocusNorm.includes("preference type")) {
        const resolved = resolveVoiceIntent(trimmed);
        if (resolved.kind === "clarify") {
          setPreferenceAiMessages((prev) => [
            ...prev,
            { role: "user", content: trimmed },
            {
              role: "assistant",
              content: resolved.prompt,
              speakLine: resolved.prompt,
              missingFields: voiceFocus ? [voiceFocus] : undefined,
              focusedMissingField: voiceFocus,
              remainingMissingCount: 0,
              quickOptions: resolved.options,
            },
          ]);
          return;
        }
        normalizedInput = resolved.value;
      } else if (voiceFocusNorm.includes("preference location - state")) {
        const resolved = resolveVoiceState(trimmed, NIGERIAN_STATE_NAMES);
        if (resolved.kind === "clarify") {
          setPreferenceAiMessages((prev) => [
            ...prev,
            { role: "user", content: trimmed },
            {
              role: "assistant",
              content: resolved.prompt,
              speakLine: resolved.prompt,
              missingFields: voiceFocus ? [voiceFocus] : undefined,
              focusedMissingField: voiceFocus,
              remainingMissingCount: 0,
              quickOptions: resolved.options,
            },
          ]);
          return;
        }
        normalizedInput = resolved.value;
      } else if (voiceFocusNorm.includes("preference location - lga")) {
        if (pulledLocationOptions.some((o) => o.toLowerCase() === trimmed.toLowerCase())) {
          normalizedInput = pulledLocationOptions.find(
            (o) => o.toLowerCase() === trimmed.toLowerCase(),
          ) as string;
        } else {
          const resolved = resolveVoiceLga(trimmed, currentState);
          if (resolved.kind === "clarify") {
            setPreferenceAiMessages((prev) => [
              ...prev,
              { role: "user", content: trimmed },
              {
                role: "assistant",
                content: resolved.prompt,
                speakLine: resolved.prompt,
                missingFields: voiceFocus ? [voiceFocus] : undefined,
                focusedMissingField: voiceFocus,
                remainingMissingCount: 0,
                quickOptions: resolved.options,
              },
            ]);
            return;
          }
          normalizedInput = resolved.value;
        }
      } else if (voiceFocusNorm.includes("preference location - area")) {
        if (
          pulledLocationOptions.some((o) => o.toLowerCase() === trimmed.toLowerCase()) ||
          /^\s*done(\s+selecting\s+areas)?\s*$/i.test(trimmed)
        ) {
          normalizedInput = trimmed;
        } else {
          const resolved = resolveVoiceArea(trimmed, currentState);
          if (resolved.kind === "clarify") {
            setPreferenceAiMessages((prev) => [
              ...prev,
              { role: "user", content: trimmed },
              {
                role: "assistant",
                content: resolved.prompt,
                speakLine: resolved.prompt,
                missingFields: voiceFocus ? [voiceFocus] : undefined,
                focusedMissingField: voiceFocus,
                remainingMissingCount: 0,
                quickOptions: resolved.options,
              },
            ]);
            return;
          }
          normalizedInput = resolved.value;
        }
      }
      const userText = normalizedInput;
      const doneSelectingAreas =
        Boolean(doneMarkerPayload) || /^\s*done(\s+selecting\s+areas)?\s*$/i.test(userText);
      if (/^\s*show\s+more\s*$/i.test(userText)) {
        const lastAssistant = [...preferenceAiMessages].reverse().find((m) => m.role === "assistant") as
          | {
              content: string;
              speakLine?: string;
              data?: Record<string, unknown>;
              missingFields?: string[];
              focusedMissingField?: string;
              remainingMissingCount?: number;
              locationAllOptions?: string[];
              locationOptionsOffset?: number;
              locationOptionsLabel?: string;
            }
          | undefined;
        const all = lastAssistant?.locationAllOptions || [];
        if (all.length > 0) {
          const nextOffset =
            (lastAssistant?.locationOptionsOffset ?? 0) + LOCATION_OPTIONS_PAGE_SIZE;
          if (nextOffset >= all.length) {
            setPreferenceAiMessages((prev) => [
              ...prev,
              { role: "user", content: userText },
              {
                role: "assistant",
                content: "No more options to show. Please select one from the list.",
                focusedMissingField: lastAssistant?.focusedMissingField,
                missingFields: lastAssistant?.missingFields,
                remainingMissingCount: lastAssistant?.remainingMissingCount,
                quickOptions: all.slice(
                  Math.max(0, all.length - LOCATION_OPTIONS_PAGE_SIZE),
                  all.length,
                ),
                locationAllOptions: all,
                locationOptionsOffset: Math.max(0, all.length - LOCATION_OPTIONS_PAGE_SIZE),
                locationOptionsLabel: lastAssistant?.locationOptionsLabel,
              },
            ]);
            return;
          }
          const page = all.slice(nextOffset, nextOffset + LOCATION_OPTIONS_PAGE_SIZE);
          const hasMore = nextOffset + LOCATION_OPTIONS_PAGE_SIZE < all.length;
          const range = `${nextOffset + 1}-${nextOffset + page.length}`;
          const label = lastAssistant?.locationOptionsLabel || "options";
          const isAreaLabel = label.toLowerCase().includes("areas in ");
          setPreferenceAiMessages((prev) => [
            ...prev,
            { role: "user", content: userText },
            {
              role: "assistant",
              content: `Available ${label}:\n${page.join(", ")}${
                hasMore
                  ? `\n\nShowing ${range} of ${all.length}. Select one or tap "${SHOW_MORE_LOCATION_OPTIONS}".`
                  : ""
              }${isAreaLabel ? `\n\nYou can select multiple areas, then tap "${DONE_SELECTING_AREAS}".` : ""}`,
              focusedMissingField: lastAssistant?.focusedMissingField,
              missingFields: lastAssistant?.missingFields,
              remainingMissingCount: lastAssistant?.remainingMissingCount,
              quickOptions: [
                ...page,
                ...(hasMore ? [SHOW_MORE_LOCATION_OPTIONS] : []),
                ...(isAreaLabel ? [DONE_SELECTING_AREAS] : []),
              ],
              locationAllOptions: all,
              locationOptionsOffset: nextOffset,
              locationOptionsLabel: label,
            },
          ]);
          return;
        }
      }

      if (voiceFocusNorm.includes("preference location - area")) {
        const currentData = { ...(collectedDataRef.current || {}) } as Record<string, unknown>;
        const currentLoc = (currentData.location || {}) as Record<string, unknown>;
        const state = resolveCanonicalStateName(String(currentLoc.state || ""));
        const selectedLga = resolveCanonicalLgaName(
          state,
          getMeaningfulLgas(currentLoc, state)[0] || "",
        );
        const availableAreas = getAreasByStateLGA(state, selectedLga);
        const existingAreas = getMeaningfulAreas(currentLoc, state);

        if (doneSelectingAreas && existingAreas.length > 0) {
          const reply = withPreferenceLocationOptions(
            buildPreferenceInteractiveReply(currentData, skippedFieldsRef.current, 0),
            currentData,
          );
          setPreferenceAiMessages((prev) => [
            ...prev,
            { role: "user", content: userText },
            {
              role: "assistant",
              content: reply.content,
              speakLine: reply.speakLine,
              data: currentData,
              missingFields: reply.missingFields.length ? reply.missingFields : undefined,
              focusedMissingField: reply.focusedMissingField,
              remainingMissingCount: reply.remainingMissingCount,
              quickOptions: reply.quickOptions,
              locationAllOptions: reply.locationAllOptions,
              locationOptionsOffset: reply.locationOptionsOffset,
              locationOptionsLabel: reply.locationOptionsLabel,
            },
          ]);
          return;
        }

        if (!doneSelectingAreas) {
          const nextLoc = applyPreferenceLocationFromFocusedAnswer(userText, voiceFocus, currentLoc);
          const nextData = { ...currentData, location: nextLoc };
          setPreferenceAiCollectedData(nextData);
          const selectedAreas = getMeaningfulAreas(nextLoc, state);
          const remaining = availableAreas.filter(
            (a) => !selectedAreas.some((s) => s.toLowerCase() === a.toLowerCase()),
          );
          const page = remaining;
          const hasMore = false;
          const followUp =
            selectedAreas.length > 0
              ? `Selected area(s): ${selectedAreas.join(", ")}.\nAdd another area or tap "${DONE_SELECTING_AREAS}" when finished.`
              : `Please select at least one area from ${selectedLga}, ${state}.`;
          setPreferenceAiMessages((prev) => [
            ...prev,
            { role: "user", content: userText },
            {
              role: "assistant",
              content: followUp,
              speakLine: followUp,
              data: nextData,
              missingFields: voiceFocus ? [voiceFocus] : undefined,
              focusedMissingField: voiceFocus,
              remainingMissingCount: 0,
              quickOptions: [
                ...page,
                ...(hasMore ? [SHOW_MORE_LOCATION_OPTIONS] : []),
                DONE_SELECTING_AREAS,
              ],
              locationAllOptions: remaining,
              locationOptionsOffset: 0,
              locationOptionsLabel: `areas in ${selectedLga}, ${state}`,
            },
          ]);
          return;
        }
      }

      if (SKIP_UTTERANCE_RE.test(userText)) {
        setLoading(true);
        try {
          setPreferenceAiMessages((prev) => {
            const lastAssist = [...prev].reverse().find((m) => m.role === "assistant");
            const lastFocus = lastAssist?.focusedMissingField;
            const data = { ...(collectedDataRef.current || {}) } as Record<string, unknown>;
            const skipped = skippedFieldsRef.current;
            const missingBefore = getMissingFieldsFromPreferenceData(data).filter((f) => !skipped.has(f));
            const toSkip =
              lastFocus && missingBefore.includes(lastFocus) ? lastFocus : missingBefore[0];
            if (toSkip && !isPreferenceFieldSkippable(toSkip)) {
              const label = fieldLabelOnly(toSkip);
              const reqLine = `${label} is required. Please answer in your next message.`;
              const missingReq = missingBefore.filter((f) => !isPreferenceFieldSkippable(f));
              return [
                ...prev,
                { role: "user" as const, content: userText },
                {
                  role: "assistant" as const,
                  content: reqLine,
                  speakLine: `${label} is required. Please share an answer.`,
                  data,
                  missingFields: [toSkip],
                  focusedMissingField: toSkip,
                  remainingMissingCount: Math.max(0, missingReq.length - 1),
                },
              ];
            }
            if (toSkip) skipped.add(toSkip);
            const reply = withPreferenceLocationOptions(buildPreferenceInteractiveReply(data, skipped, 0), data);
            return [
              ...prev,
              { role: "user" as const, content: userText },
              {
                role: "assistant" as const,
                content: reply.content,
                speakLine: reply.speakLine,
                data,
                missingFields: reply.missingFields.length ? reply.missingFields : undefined,
                focusedMissingField: reply.focusedMissingField,
                remainingMissingCount: reply.remainingMissingCount,
                quickOptions: reply.quickOptions,
                locationAllOptions: reply.locationAllOptions,
                locationOptionsOffset: reply.locationOptionsOffset,
                locationOptionsLabel: reply.locationOptionsLabel,
              },
            ];
          });
        } finally {
          setLoading(false);
        }
        return;
      }

      const accumulated = [...preferenceAiMessages, { role: "user", content: userText }]
        .filter((m) => m.role === "user")
        .map((m) => m.content)
        .join(". ");

      const storedType = normalizedPreferenceType((collectedDataRef.current || {}) as Record<string, unknown>);
      const detectedFromMsg = detectPreferenceTypeFromText(userText);
      const detectedFromAccum = detectPreferenceTypeFromText(accumulated);
      const effectiveType = storedType || detectedFromMsg || detectedFromAccum;

      if (!effectiveType) {
        const typeFieldLabel =
          "preference type (required: start with Buy, Rent, Shortlet, or JV — same as choosing listing type on the form)";
        const prompt = getPreferenceFieldPrompt(typeFieldLabel, preferenceQuestionVariantRef.current++);
        setPreferenceAiMessages((prev) => [
          ...prev,
          { role: "user", content: userText },
          {
            role: "assistant",
            content: prompt.displayLine,
            speakLine: prompt.speakLine,
            missingFields: [typeFieldLabel],
            focusedMissingField: typeFieldLabel,
            remainingMissingCount: 0,
          },
        ]);
        return;
      }

      setLoading(true);
      setPreferenceAiMessages((prev) => [...prev, { role: "user", content: userText }]);

      try {
        const contextual =
          (() => {
            const lastAssist = [...preferenceAiMessages].reverse().find((m) => m.role === "assistant");
            const focus = lastAssist?.focusedMissingField;
            if (!focus) return accumulated || userText;
            return `${accumulated || userText}\n\n[The user is answering this specific field: ${focus}]`;
          })();
        const res = await suggestPreference(contextual);
        if (!res.success) {
          const safeMsg = sanitizeAiFailureMessage(res.message);
          setPreferenceAiMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: safeMsg || "Could not get suggestions. Please try again or add more detail.",
            },
          ]);
          return;
        }
        const seedData: Record<string, unknown> = {
          ...(collectedDataRef.current || {}),
          preferenceType: effectiveType,
          preferenceMode: preferenceModeFromType(effectiveType),
        };
        let data = mergePreferenceAiCollectedData(seedData, (res.data || {}) as Record<string, unknown>);
        data.preferenceType = effectiveType;
        data.preferenceMode = preferenceModeFromType(effectiveType);

        const lastAssistBeforeTurn = [...preferenceAiMessages]
          .reverse()
          .find((m) => m.role === "assistant");
        const lastFocusBeforeMerge = lastAssistBeforeTurn?.focusedMissingField;
        data = applyPreferenceSubtypeFromFocusedAnswer(data, userText, lastFocusBeforeMerge);
        data = applyPreferenceLandMeasurementFromFocusedAnswer(data, userText, lastFocusBeforeMerge);
        data = applyPreferenceLandSizeFromFocusedAnswer(data, userText, lastFocusBeforeMerge);
        data = applyPreferenceDocumentTypesFromFocusedAnswer(data, userText, lastFocusBeforeMerge);
        data = applyPreferenceBedroomsFromFocusedAnswer(data, userText, lastFocusBeforeMerge);
        data = applyPreferenceBuyResidentialCountFromFocusedAnswer(data, userText, lastFocusBeforeMerge);

        const fromUser = extractContactFromText(userText);
        const fromAccumulated = extractContactFromText(accumulated || userText);
        const parsedContact = {
          email: fromUser.email || fromAccumulated.email,
          phoneNumber: fromUser.phoneNumber || fromAccumulated.phoneNumber,
          fullName: fromUser.fullName || fromAccumulated.fullName,
        };
        const existingContact = (data.contactInfo || {}) as Record<string, unknown>;
        const mergedContact = {
          ...existingContact,
          ...(parsedContact.email && { email: parsedContact.email }),
          ...(parsedContact.phoneNumber && { phoneNumber: parsedContact.phoneNumber }),
        };
        if (Object.keys(mergedContact).length > 0) {
          data = { ...data, contactInfo: mergedContact };
        }
        {
          const lastFocusBeforeTurn = lastFocusBeforeMerge;
          const isLocationTurn = shouldApplyUserTextToPreferenceLocation(lastFocusBeforeTurn);
          const previousLocation = ((collectedDataRef.current || {}).location || {}) as Record<string, unknown>;
          const normalizedFocus = normalizePreferenceFieldKey(lastFocusBeforeTurn || "");
          const isAreaTurn = normalizedFocus.includes("preference location - area");
          let loc = (data.location || {}) as Record<string, unknown>;
          loc = normalizeCompoundPreferenceLocation(loc);
          // Guardrail: when answering AREA, keep already-confirmed state/LGA from prior turns.
          // AI merge can mistakenly overwrite LGA with the area text, which then causes
          // sanitizers to drop the area as a duplicate and ask repeatedly.
          if (isAreaTurn) {
            const prevLoc = normalizeCompoundPreferenceLocation(previousLocation);
            const prevState = String(prevLoc.state ?? "").trim();
            const prevLgas = getMeaningfulLgas(prevLoc, prevState);
            if (prevState) {
              loc.state = prevState;
            }
            if (prevLgas.length > 0) {
              loc.localGovernmentAreas = prevLgas;
              loc.lgas = prevLgas;
            }
          }
          if (isLocationTurn) {
            loc = applyPreferenceLocationFromFocusedAnswer(userText, lastFocusBeforeTurn, loc);
            loc = applyPreferenceLocationFromNaturalText(userText, loc);
          }
          loc = stripImplausiblePreferenceLocationState(loc);
          // Always trust only what the user has mentioned (prevents AI-inserted area/LGA values).
          loc = filterPreferenceLocationToUserMentionedOnly(loc, accumulated || userText);
          loc = coercePreferenceLocationFormHierarchy(loc);
          loc = stripPreferenceAreasUntilLgaSelected(loc);
          loc = keepBestPreferenceLocationProgress(previousLocation, loc, isLocationTurn);
          data = { ...data, location: loc };
        }
        data = keepBestPreferencePropertyDetailsProgress(
          (collectedDataRef.current || {}) as Record<string, unknown>,
          data,
          lastFocusBeforeMerge,
        );
        setPreferenceAiCollectedData(data);
        const reply = withPreferenceLocationOptions(
          buildPreferenceInteractiveReply(data, skippedFieldsRef.current, 0),
          data,
        );
        setPreferenceAiMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: reply.content,
            speakLine: reply.speakLine,
            data,
            missingFields: reply.missingFields.length ? reply.missingFields : undefined,
            focusedMissingField: reply.focusedMissingField,
            remainingMissingCount: reply.remainingMissingCount,
            quickOptions: reply.quickOptions,
            locationAllOptions: reply.locationAllOptions,
            locationOptionsOffset: reply.locationOptionsOffset,
            locationOptionsLabel: reply.locationOptionsLabel,
          },
        ]);
      } catch (e) {
        const safeMsg = sanitizeAiFailureMessage((e as Error)?.message);
        toast.error(safeMsg || "Something went wrong.");
        setPreferenceAiMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              safeMsg || "Something went wrong. Please try again or add more detail.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [preferenceAiMessages, setPreferenceAiMessages, setPreferenceAiCollectedData],
  );

  const handleSuggest = useCallback(
    async (userInput: string) => {
      await handleSend(userInput.trim());
    },
    [handleSend]
  );

  const handlePreferenceQuickOptionClick = useCallback(
    async (
      option: string,
      msg: { focusedMissingField?: string; quickOptions?: string[] },
    ) => {
      const focus = normalizePreferenceFieldKey(msg.focusedMissingField || "");
      const isAreaMultiSelect =
        focus.includes("preference location - area") &&
        Array.isArray(msg.quickOptions) &&
        msg.quickOptions.includes(DONE_SELECTING_AREAS);
      if (!isAreaMultiSelect) {
        await handleSuggest(option);
        return;
      }

        if (option === DONE_SELECTING_AREAS) {
        if (selectedAreaOptions.length === 0) {
          toast.error("Select at least one area before tapping Done.");
          return;
        }
          await handleSuggest(`${AREA_DONE_MARKER}${selectedAreaOptions.join(", ")}`);
          setSelectedAreaOptions([]);
          return;
      }

      if (option === SHOW_MORE_LOCATION_OPTIONS) {
        await handleSuggest(option);
        return;
      }

      setSelectedAreaOptions((prev) =>
        prev.some((x) => x.toLowerCase() === option.toLowerCase())
          ? prev.filter((x) => x.toLowerCase() !== option.toLowerCase())
          : [...prev, option],
      );
    },
    [handleSuggest, selectedAreaOptions],
  );

  const handleProceedToContactConfirm = useCallback(() => {
    setPreferenceAiFlowStep("contactConfirm");
  }, [setPreferenceAiFlowStep]);

  useEffect(() => {
    if (preferenceAiFlowStep !== "contactConfirm" || !preferenceAiCollectedData) return;
    const c = preferenceAiCollectedData.contactInfo as Record<string, unknown> | undefined;
    setManualFullName("");
    setManualEmail(String(c?.email || "").trim());
  }, [preferenceAiFlowStep, preferenceAiCollectedData]);

  const handleContactConfirmContinue = useCallback(() => {
    const name = manualFullName.trim();
    const email = manualEmail.trim();
    if (!name || !email) {
      toast.error("Please enter your name and email.");
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setPreferenceAiCollectedData((prev) => {
      const base = { ...(prev || {}) };
      const prevContact = (base.contactInfo || {}) as Record<string, unknown>;
      const type = String(base.preferenceType || "").toLowerCase();
      if (type === "joint-venture") {
        base.contactInfo = {
          ...prevContact,
          contactPerson: name,
          email,
        };
      } else {
        base.contactInfo = {
          ...prevContact,
          fullName: name,
          email,
        };
      }
      return base;
    });
    setPreferenceAiFlowStep("summary");
  }, [
    manualEmail,
    manualFullName,
    setPreferenceAiCollectedData,
    setPreferenceAiFlowStep,
  ]);

  const handleSubmitFromSummary = useCallback(async () => {
    if (!preferenceAiCollectedData) return;
    const merged = mergeSuggestPreferenceIntoForm(preferenceAiCollectedData) as Record<string, unknown>;
    const type = String(preferenceAiCollectedData.preferenceType ?? "buy").toLowerCase();
    if (!["buy", "rent", "shortlet", "joint-venture"].includes(type)) {
      toast.error("Invalid preference type. Please go back and specify buy, rent, shortlet, or joint venture.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = buildPreferencePayload(merged, type);
      const response = await POST_REQUEST(PREFERENCE_SUBMIT_URL, payload);
      if (response?.success) {
        toast.success("Preference submitted successfully!");
        resetForm();
        triggerSubmittedFromAi();
      } else {
        toast.error("Failed to submit preference. Please try again.");
      }
    } catch (e) {
      toast.error((e as Error)?.message || "Failed to submit preference. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [preferenceAiCollectedData, resetForm, triggerSubmittedFromAi]);

  const handleContinueToForm = useCallback(() => {
    if (preferenceAiCollectedData) {
      const merged = mergeSuggestPreferenceIntoForm(preferenceAiCollectedData);
      updateFormData(merged as any, true);
    }
    setPreferenceAiFlowStep(null);
    goToStep(0);
  }, [preferenceAiCollectedData, updateFormData, setPreferenceAiFlowStep, goToStep]);

  const handleBackToMode = useCallback(() => {
    skippedFieldsRef.current = new Set();
    preferenceQuestionVariantRef.current = 0;
    setPreferenceEntryMode(null);
    setPreferenceAiMessages([]);
    setPreferenceAiCollectedData(null);
    setPreferenceAiFlowStep(null);
  }, [setPreferenceEntryMode, setPreferenceAiMessages, setPreferenceAiCollectedData, setPreferenceAiFlowStep]);

  if (preferenceAiFlowStep === "contactConfirm") {
    const type = String(preferenceAiCollectedData?.preferenceType || "").toLowerCase();
    const nameLabel = type === "joint-venture" ? "Contact person name" : "Your full name";
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setPreferenceAiFlowStep("conversation")}
          className="text-sm text-[#09391C] hover:text-[#8DDB90] flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back to conversation
        </button>
        <div className="rounded-xl border border-[#8DDB90]/40 bg-[#f0fdf4]/60 p-6 md:p-8 space-y-4">
          <h2 className="text-lg font-semibold text-[#09391C] flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#8DDB90]" />
            Confirm your name and email
          </h2>
          <p className="text-sm text-[#5A5D63]">
            Voice input often mishears names and emails. Type them below so we can reach you correctly.
          </p>
          <div className="space-y-3 max-w-md">
            <div>
              <label htmlFor="pref-ai-manual-name" className="block text-sm font-medium text-[#09391C] mb-1">
                {nameLabel}
              </label>
              <input
                id="pref-ai-manual-name"
                type="text"
                autoComplete="name"
                value={manualFullName}
                onChange={(e) => setManualFullName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#8DDB90] focus:border-[#8DDB90]"
                placeholder={type === "joint-venture" ? "e.g. Jane Doe" : "e.g. Jane Doe"}
              />
            </div>
            <div>
              <label htmlFor="pref-ai-manual-email" className="block text-sm font-medium text-[#09391C] mb-1">
                Email
              </label>
              <input
                id="pref-ai-manual-email"
                type="email"
                autoComplete="email"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#8DDB90] focus:border-[#8DDB90]"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={handleContactConfirmContinue}
              className="px-6 py-3 rounded-lg bg-[#8DDB90] hover:bg-[#7BC87F] text-[#09391C] font-semibold transition-colors"
            >
              Continue to summary
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (preferenceAiFlowStep === "summary") {
    const data = preferenceAiCollectedData || {};
    const rows = flattenPreferenceData(data);
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setPreferenceAiFlowStep("contactConfirm")}
          className="text-sm text-[#09391C] hover:text-[#8DDB90] flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back to contact details
        </button>
        <div className="rounded-xl border border-[#8DDB90]/40 bg-[#f0fdf4]/60 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-[#09391C] mb-2 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-[#8DDB90]" />
            Preference summary
          </h2>
          <p className="text-sm text-[#5A5D63] mb-6">
            Review the details below. When you&apos;re ready, submit your preference to get matched with properties.
          </p>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-[#09391C]">Field</th>
                  <th className="text-left py-3 px-4 font-medium text-[#09391C]">Value</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-6 px-4 text-[#5A5D63] text-center">
                      No data to display. Add more in the conversation.
                    </td>
                  </tr>
                ) : (
                  rows.map(({ key, label, value }) => (
                    <tr key={key} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 px-4 text-[#5A5D63]">{label}</td>
                      <td className="py-3 px-4 text-[#09391C] font-medium">{value}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <button
              type="button"
              onClick={handleSubmitFromSummary}
              disabled={submitting || rows.length === 0}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#8DDB90] hover:bg-[#7BC87F] disabled:opacity-60 disabled:cursor-not-allowed text-[#09391C] font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                  Submitting…
                </>
              ) : (
                "Submit"
              )}
            </button>
            <button
              type="button"
              onClick={handleContinueToForm}
              className="w-full sm:w-auto px-4 py-2 rounded-lg border border-[#8DDB90] text-[#09391C] text-sm font-medium hover:bg-[#8DDB90]/10 transition-colors"
            >
              Add more in form instead
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#8DDB90]/40 bg-[#f0fdf4]/60 p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#09391C] flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[#8DDB90]" />
          Describe what you&apos;re looking for
        </h2>
        <button
          type="button"
          onClick={handleBackToMode}
          className="text-sm text-[#5A5D63] hover:text-[#09391C] flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Change to manual form
        </button>
      </div>
      <p className="text-sm text-[#5A5D63]">
        Tell us what you need. We&apos;ll guide you step-by-step.
      </p>

      <div className="border border-[#8DDB90]/30 rounded-lg overflow-hidden bg-white">
        <details className="group">
          <summary className="flex items-center justify-between px-4 py-3 text-sm font-medium text-[#09391C] bg-[#8DDB90]/10 hover:bg-[#8DDB90]/20 cursor-pointer transition-colors list-none select-none">
            <span>How to use</span>
            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="px-4 py-3 space-y-3 text-sm text-[#5A5D63]">
            <p>
              <strong>Start with the listing type</strong> — say <strong>Buy</strong>, <strong>Rent</strong>, <strong>Shortlet</strong>, or <strong>JV</strong> first. The AI asks for one detail at a time. For budgets, use commas (e.g. <span className="whitespace-nowrap">20,000,000</span>). Say <strong>skip</strong> on optional lines. Use <strong>I&apos;m done</strong> to review and submit.
            </p>
            <div className="pt-2 border-t border-gray-100">
              <p className="font-medium text-[#09391C] mb-2">What you need to get started:</p>
              <p className="mb-2">1. Pick a Type: Buy · Rent · Shortlet · JV</p>
              <p className="mb-1">2. Key Details to Mention:</p>
              <ul className="space-y-1 ml-4 text-xs">
                <li className="flex items-start gap-2">
                  <span>📍</span>
                  <span><strong>Location:</strong> Area & LGA (e.g. Ikate, Eti-Osa)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>🏡</span>
                  <span><strong>Property:</strong> Type & Features (Pool, Serviced, etc.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>💰</span>
                  <span><strong>Budget:</strong> Your price range or daily rate</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>📄</span>
                  <span><strong>Title (For Buy/JV):</strong> e.g. C of O or Consent</span>
                </li>
              </ul>
            </div>
            <p className="text-xs italic pt-2 border-t border-gray-100">
              Tip: If voice input fails, type instead. Name and email are confirmed on the next step.
            </p>
          </div>
        </details>
      </div>

      <label className="flex items-start gap-2 text-sm text-[#5A5D63] cursor-pointer">
        <input
          type="checkbox"
          checked={playRepliesAloud}
          onChange={(e) => {
            setPlayRepliesAloud(e.target.checked);
            if (!e.target.checked) stop();
          }}
          className="mt-1 rounded border-gray-300 text-[#8DDB90] focus:ring-[#8DDB90]"
        />
        <span>
          <span className="block font-medium text-[#09391C]">Play AI replies aloud</span>
          <span className="block text-xs text-[#5A5D63] mt-0.5">On by default. Tap the speaker icon on a reply to stop playback.</span>
        </span>
      </label>

      {loading && (
        <div className="flex items-center gap-3 rounded-lg border border-[#8DDB90]/50 bg-[#f0fdf4] px-4 py-3 text-sm text-[#09391C]">
          <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-[#8DDB90]" aria-hidden />
          <span>Reading your description and preparing suggestions…</span>
        </div>
      )}

      <div
        ref={conversationScrollRef}
        className="bg-white rounded-lg border border-gray-200 max-h-[400px] overflow-y-auto p-4 space-y-3"
      >
        {preferenceAiMessages.length === 0 ? (
          <div className="border border-[#8DDB90]/30 rounded-lg overflow-hidden">
            <details className="group">
              <summary className="flex items-center justify-between px-3 py-2.5 text-sm font-medium text-[#09391C] bg-[#8DDB90]/10 hover:bg-[#8DDB90]/20 cursor-pointer transition-colors list-none select-none">
                <span>Example messages</span>
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-3 py-2.5 text-sm text-[#5A5D63] italic">
                &quot;Buy — 3 bedroom in Lekki…&quot; or &quot;Shortlet in Victoria Island…&quot; You must include Buy, Rent, Shortlet, or JV.
              </div>
            </details>
          </div>
        ) : (
          preferenceAiMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="flex flex-col gap-1 items-center">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#8DDB90]/20 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-[#09391C]" />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      speaking
                        ? stop()
                        : speak(getSpeakableAssistantText(msg as { content: string; speakLine?: string }))
                    }
                    className="p-1 rounded text-[#5A5D63] hover:bg-[#8DDB90]/20 hover:text-[#09391C]"
                    title={speaking ? "Stop playback" : "Play reply aloud"}
                    aria-label={speaking ? "Stop playback" : "Play reply aloud"}
                  >
                    {speaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2 text-sm ${
                  msg.role === "user" ? "bg-[#09391C] text-white" : "bg-gray-100 text-[#09391C]"
                }`}
              >
                {msg.role === "assistant" &&
                (msg as { focusedMissingField?: string }).focusedMissingField ? (
                  <>
                    <p className="mb-2 whitespace-pre-line">{msg.content}</p>
                    {(msg as { quickOptions?: string[] }).quickOptions &&
                    (msg as { quickOptions?: string[] }).quickOptions!.length > 0 ? (
                      <div
                        ref={i === preferenceAiMessages.length - 1 ? newestChipsRef : null}
                        className="mb-2"
                      >
                        <p className="mb-1 text-[11px] font-medium text-[#5A5D63]">
                          Tap to choose
                        </p>
                        <div className="flex flex-wrap gap-2">
                        {(msg as { quickOptions?: string[] }).quickOptions!.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() =>
                              handlePreferenceQuickOptionClick(
                                option,
                                msg as { focusedMissingField?: string; quickOptions?: string[] },
                              )
                            }
                            disabled={loading}
                            className={`rounded-full border px-3 py-1 text-xs font-medium disabled:opacity-50 ${
                              option === DONE_SELECTING_AREAS
                                ? "border-[#09391C] bg-[#8DDB90] text-[#09391C] font-semibold shadow-sm hover:bg-[#7BC87F]"
                                : selectedAreaOptions.some((x) => x.toLowerCase() === option.toLowerCase())
                                  ? "border-[#09391C] bg-[#09391C] text-white"
                                  : "border-[#8DDB90] bg-white text-[#09391C] hover:bg-[#8DDB90]/15"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                        </div>
                      </div>
                    ) : null}
                    {(msg as { remainingMissingCount?: number }).remainingMissingCount ? (
                      <p className="text-xs text-[#5A5D63] mt-2 pt-2 border-t border-gray-200">
                        {(msg as { remainingMissingCount: number }).remainingMissingCount} more item
                        {(msg as { remainingMissingCount: number }).remainingMissingCount !== 1 ? "s" : ""}{" "}
                        after this (or say skip).
                      </p>
                    ) : null}
                  </>
                ) : (
                  <span className="whitespace-pre-line">{msg.content}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col gap-3">
        <AiFillBlock
          title=""
          placeholder="e.g. Buy — 3-bedroom in Lekki, Lagos, budget max 50,000,000…"
          buttonLabel={loading ? "Sending…" : "Send"}
          onSuggest={handleSuggest}
          disabled={loading}
          maxHeight="80px"
          amountEntryMode={preferenceAmountEntryMode}
        />
        <div className="flex flex-wrap gap-2 items-center">
          {preferenceAiMessages.some((m) => m.role === "assistant") && (
            <button
              type="button"
              onClick={handleProceedToContactConfirm}
              className="px-4 py-2 rounded-lg border-2 border-[#8DDB90] text-[#09391C] font-medium hover:bg-[#8DDB90]/10"
            >
              I&apos;m done — confirm contact
            </button>
          )}
        </div>
      </div>
    </div>
  );
}