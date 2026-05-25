"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { usePostPropertyContext } from "@/context/post-property-context";
import { suggestProperty } from "@/services/aiFormService";
import AiFillBlock from "@/components/ai-form-fill/AiFillBlock";
import PropertyAiDataSummary from "./PropertyAiDataSummary";
import { mergeSuggestPropertyIntoForm } from "@/utils/aiSuggestPropertyMerge";
import {
  getPropertyFieldPrompt,
  propertyAllDonePrompt,
} from "@/utils/aiInteractivePrompts";
import {
  applyFocusedPropertyAnswer,
  briefTypeLabelToPropertyType,
  canonicalPropertyAiFieldKey,
  getPropertyAiMissingFields,
  isPropertyAiFieldSkippable,
  normalizePropertyAiCollectedData,
  mergePropertyAiCollectedData,
  markPropertyAiUserAnswer,
  filterMissingPropertyAiFields,
  PROPERTY_AI_FIELD,
} from "@/utils/propertyAiFieldGuide";
import { assistantMessageToSpeakable } from "@/utils/ttsText";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { ArrowLeft, MessageSquare, Bot, Loader2, Volume2, VolumeX } from "lucide-react";
import { getAreasByStateLGA, getLGAsByState, getStates } from "@/utils/location-utils";

const LOCATION_OPTIONS_PAGE_SIZE = Number.MAX_SAFE_INTEGER;
const SHOW_MORE_LOCATION_OPTIONS = "Show more";
const DONE_SELECTING_AREAS = "Done selecting areas";
const AREA_DONE_MARKER = "__AREA_DONE__::";

function fieldLabelOnly(field: string): string {
  return field.replace(/\s*\([^)]*\)\s*$/, "").trim() || field;
}

function getSpeakableAssistantText(msg: { content: string; speakLine?: string }): string {
  return assistantMessageToSpeakable(msg);
}

const SKIP_UTTERANCE_RE = /^\s*(please\s+)?skip\b/i;


function buildPropertyInteractiveReply(
  data: Record<string, unknown>,
  skipped: Set<string>,
  listingTypePreset?: string | null,
  userAnsweredFields?: Set<string>,
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
  const normalized = normalizePropertyAiCollectedData({
    ...data,
    ...(listingTypePreset && !data.propertyType ? { propertyType: listingTypePreset } : {}),
  });
  const missing = filterMissingPropertyAiFields(
    getPropertyAiMissingFields(normalized, { listingTypePreset }),
    skipped,
    userAnsweredFields ?? new Set(),
  );

  if (missing.length === 0) {
    const done = propertyAllDonePrompt();
    return {
      content: done.displayLine,
      speakLine: done.speakLine,
      missingFields: [],
      remainingMissingCount: 0,
    };
  }

  const focus = missing[0];
  const { displayLine, speakLine } = getPropertyFieldPrompt(focus, 0);

  return {
    content: displayLine,
    speakLine,
    focusedMissingField: focus,
    missingFields: [focus],
    remainingMissingCount: Math.max(0, missing.length - 1),
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

function normalizeFieldKey(field: string): string {
  return field.toLowerCase().replace(/\u2013|\u2014/g, "-");
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

function applyPropertyLocationFromFocusedAnswer(
  text: string,
  focusedMissingField: string | undefined,
  location: Record<string, unknown>,
): Record<string, unknown> {
  const value = text.trim();
  if (!value || !focusedMissingField) return location;
  const focus = normalizeFieldKey(focusedMissingField);
  const next = { ...location };
  if (focus.includes("state")) {
    next.state = value;
    next.localGovernment = "";
    next.area = "";
    return next;
  }
  if (focus.includes("local government") || focus.includes("/ lga") || focus.includes("lga")) {
    next.localGovernment = value;
    next.area = "";
    return next;
  }
  if (focus.includes("area")) {
    const current = Array.isArray(next.areas)
      ? (next.areas as unknown[]).map((x) => String(x).trim()).filter(Boolean)
      : [];
    const additions = value
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
    next.area = merged[0] || "";
    return next;
  }
  return next;
}

function withPropertyLocationOptions(
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
  const focus = normalizeFieldKey(reply.focusedMissingField || "");
  const loc = (data.location || {}) as Record<string, unknown>;
  const state = resolveCanonicalStateName(String(loc.state || ""));
  const lga = resolveCanonicalLgaName(state, String(loc.localGovernment || ""));

  if (focus.includes("local government") || focus.includes("/ lga") || focus.includes("lga")) {
    const lgas = getLGAsByState(state);
    if (state && lgas.length > 0) {
      return buildLocationPagedReply(reply, `LGAs in ${state}`, lgas, 0);
    }
  }

  if (focus.includes("area")) {
    const areas = getAreasByStateLGA(state, lga);
    if (state && lga && areas.length > 0) {
      return buildLocationPagedReply(reply, `areas in ${lga}, ${state}`, areas, 0);
    }
  }
  return reply;
}

function normalizedListingPropertyType(data: Record<string, unknown>): string {
  const t = String(data.propertyType || "").toLowerCase().trim();
  if (["sell", "off-plan", "rent", "shortlet", "jv"].includes(t)) return t;
  return "";
}

/** Maps natural language to post-property `propertyType` (sell | rent | shortlet | jv). */
function detectListingPropertyTypeFromText(text: string): string | null {
  const raw = text.trim();
  if (!raw) return null;
  if (/\bjoint\s*venture\b|\bjv\b/i.test(raw)) return "jv";
  if (/\bshortlet\b|\bshort\s*let\b/i.test(raw)) return "shortlet";
  if (/\brent\b|\bletting\b|\blease\b/i.test(raw)) return "rent";
  if (/\boff\s*plan\b|\boff-plan\b/i.test(raw)) return "off-plan";
  if (/\bsale\b|\bsell\b|\boutright\b|\bbuy\b/i.test(raw)) return "sell";
  return null;
}

/** Extract local government / LGA from user text so we recognize it even if the API omits it. */
function extractLocalGovernmentFromText(text: string): string | null {
  const t = text.trim();
  if (!t || t.length < 2) return null;
  const lgaMatch = t.match(/(?:local\s*gov(?:ernment)?|LGA)\s*[:\s]+\s*([A-Za-z\s\-]+?)(?:\.|,|$)/i);
  if (lgaMatch) return lgaMatch[1].trim();
  return null;
}

/** Extract land size and measurement type from user text. */
function extractLandSizeFromText(text: string): { measurementType?: string; size?: number } | null {
  const t = text.trim();
  if (!t) return null;
  const out: { measurementType?: string; size?: number } = {};
  const measurementTypes = ["Square Meter", "SQM", "Plot", "Hectares", "Acres", "Square Feet"];
  for (const mt of measurementTypes) {
    const re = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*${mt.replace(/\s+/g, "\\s+")}`, "i");
    const m = t.match(re);
    if (m) {
      out.size = Number(m[1]);
      out.measurementType = mt === "SQM" ? "Square Meter" : mt;
      return out;
    }
  }
  const sizeLabel = t.match(/(?:land\s*size|size)\s*[:\s]+\s*(\d+(?:\.\d+)?)/i);
  if (sizeLabel) out.size = Number(sizeLabel[1]);
  const typeLabel = t.match(/(?:measurement\s*type|type)\s*[:\s]+\s*([A-Za-z\s]+?)(?:\.|,|$)/i);
  if (typeLabel) {
    const typ = typeLabel[1].trim();
    const match = measurementTypes.find((mt) => mt.toLowerCase().startsWith(typ.toLowerCase()) || typ.toLowerCase().includes(mt.toLowerCase()));
    if (match) out.measurementType = match === "SQM" ? "Square Meter" : match;
  }
  if (out.size != null || out.measurementType) return out;
  return null;
}

/** Extract document/title names from user text so we recognize them even if the API omits or uses different keys. */
function extractDocumentsFromText(text: string): string[] {
  const t = text.trim();
  if (!t) return [];
  const out: string[] = [];
  // After "documents:" or "document:" or "title:" take comma-separated list
  const labelMatch = t.match(/(?:documents?|title)\s*[:\s]+\s*([^.]+?)(?:\.|$)/i);
  if (labelMatch) {
    const list = labelMatch[1].split(/[,;]/).map((s) => s.trim()).filter((s) => s.length >= 2);
    list.forEach((s) => { if (s && !out.includes(s)) out.push(s); });
  }
  // Common document names anywhere in text (no special chars)
  const known = ["C of O", "Certificate of Occupancy", "Governors consent", "Governor consent", "Survey plan", "Deed of assignment", "Deed of Assignment", "Excision", "Gazette"];
  known.forEach((doc) => {
    const normalized = doc.replace(/'/g, "");
    if (t.includes(doc) || t.toLowerCase().includes(normalized.toLowerCase())) {
      if (!out.some((o) => o.toLowerCase() === doc.toLowerCase())) out.push(doc);
    }
  });
  return out;
}

interface PropertyAiConversationFlowProps {
  /** Brief type label for display, e.g. "Outright Sales" */
  briefTypeLabel: string;
  /** Image step index (e.g. 2 for 0-based step that is image upload) */
  imageStepIndex: number;
}

export default function PropertyAiConversationFlow({
  briefTypeLabel,
  imageStepIndex,
}: PropertyAiConversationFlowProps) {
  const {
    aiFlowStep,
    setAiFlowStep,
    aiConversationMessages,
    setAiConversationMessages,
    aiCollectedData,
    setAiCollectedData,
    propertyData,
    setPropertyData,
    setCurrentStep,
    setPostingMode,
  } = usePostPropertyContext();

  const [loading, setLoading] = useState(false);
  const skippedFieldsRef = useRef<Set<string>>(new Set());
  /** Fields the user already answered — never ask again even if the suggest API omits them. */
  const userAnsweredFieldsRef = useRef<Set<string>>(new Set());
  const collectedDataRef = useRef<Record<string, unknown> | null>(null);
  /** Default on: speak each assistant reply automatically; user can mute via toggle or stop via speaker icon. */
  const [playRepliesAloud, setPlayRepliesAloud] = useState(true);
  const [selectedAreaOptions, setSelectedAreaOptions] = useState<string[]>([]);
  const prevMessageCountRef = useRef(0);
  const conversationScrollRef = useRef<HTMLDivElement>(null);
  const inputSectionRef = useRef<HTMLDivElement>(null);
  const { speak, stop, speaking } = useSpeechSynthesis({ lang: "en-NG", rate: 0.95 });

  /** Scroll only the conversation panel — avoid scrollIntoView on the page (jumps to top). */
  const scrollConversationToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    requestAnimationFrame(() => {
      const container = conversationScrollRef.current;
      if (container) {
        container.scrollTo({ top: container.scrollHeight, behavior });
      }
    });
  }, []);

  const keepInputSectionInView = useCallback(() => {
    requestAnimationFrame(() => {
      inputSectionRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  }, []);

  const listingTypePreset =
    propertyData.propertyType || briefTypeLabelToPropertyType(briefTypeLabel) || null;

  useEffect(() => {
    if (!listingTypePreset) return;
    setAiCollectedData((prev) =>
      normalizePropertyAiCollectedData({
        ...(prev || {}),
        propertyType: listingTypePreset,
      }),
    );
  }, [listingTypePreset, setAiCollectedData]);

  useEffect(() => {
    collectedDataRef.current = aiCollectedData;
  }, [aiCollectedData]);

  useEffect(() => {
    if (aiConversationMessages.length === 0) {
      skippedFieldsRef.current = new Set();
      userAnsweredFieldsRef.current = new Set();
      setSelectedAreaOptions([]);
    }
  }, [aiConversationMessages.length]);

  useEffect(() => {
    const lastAssistant = [...aiConversationMessages].reverse().find((m) => m.role === "assistant") as
      | { focusedMissingField?: string }
      | undefined;
    const focus = normalizeFieldKey(lastAssistant?.focusedMissingField || "");
    if (!focus.includes("area")) {
      setSelectedAreaOptions([]);
    }
  }, [aiConversationMessages]);

  const handleSend = useCallback(async (textOverride: string) => {
    const rawInput = textOverride.toString().trim();
    const doneMarkerPayload = rawInput.startsWith(AREA_DONE_MARKER)
      ? rawInput.slice(AREA_DONE_MARKER.length).trim()
      : "";
    const trimmed = doneMarkerPayload || rawInput;
    if (/^\s*show\s+more\s*$/i.test(trimmed)) {
      const lastAssistant = [...aiConversationMessages].reverse().find((m) => m.role === "assistant") as
        | {
            focusedMissingField?: string;
            missingFields?: string[];
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
          setAiConversationMessages((prev) => [
            ...prev,
            { role: "user", content: trimmed },
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
        setAiConversationMessages((prev) => [
          ...prev,
          { role: "user", content: trimmed },
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

    if (!trimmed) {
      toast.error("Please enter or say something.");
      return;
    }

    const lastAssistant = [...aiConversationMessages].reverse().find((m) => m.role === "assistant") as
      | {
          focusedMissingField?: string;
          locationAllOptions?: string[];
          locationOptionsLabel?: string;
        }
      | undefined;
    const lastFocusNorm = normalizeFieldKey(lastAssistant?.focusedMissingField || "");
    const doneSelectingAreas =
      Boolean(doneMarkerPayload) || /^\s*done(\s+selecting\s+areas)?\s*$/i.test(trimmed);
    if (lastFocusNorm.includes("area")) {
      const currentData = { ...(collectedDataRef.current || {}) } as Record<string, unknown>;
      const currentLoc = (currentData.location || {}) as Record<string, unknown>;
      const state = resolveCanonicalStateName(String(currentLoc.state || ""));
      const lga = resolveCanonicalLgaName(state, String(currentLoc.localGovernment || ""));
      const availableAreas = getAreasByStateLGA(state, lga);
      const existingAreas = Array.isArray(currentLoc.areas)
        ? (currentLoc.areas as unknown[]).map((x) => String(x).trim()).filter(Boolean)
        : String(currentLoc.area || "").trim()
          ? [String(currentLoc.area).trim()]
          : [];
      if (doneSelectingAreas && existingAreas.length > 0) {
        const reply = withPropertyLocationOptions(
          buildPropertyInteractiveReply(
            currentData,
            skippedFieldsRef.current,
            listingTypePreset,
            userAnsweredFieldsRef.current,
          ),
          currentData,
        );
        setAiConversationMessages((prev) => [
          ...prev,
          { role: "user", content: trimmed },
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
      if (!doneSelectingAreas && !/^\s*show\s+more\s*$/i.test(trimmed)) {
        const nextLoc = applyPropertyLocationFromFocusedAnswer(
          trimmed,
          lastAssistant?.focusedMissingField,
          currentLoc,
        );
        const nextData = { ...currentData, location: nextLoc };
        setAiCollectedData(nextData);
        const selectedAreas = Array.isArray(nextLoc.areas)
          ? (nextLoc.areas as unknown[]).map((x) => String(x).trim()).filter(Boolean)
          : [];
        const remaining = availableAreas.filter(
          (a) => !selectedAreas.some((s) => s.toLowerCase() === a.toLowerCase()),
        );
        const page = remaining;
        const hasMore = false;
        const followUp =
          selectedAreas.length > 0
            ? `Selected area(s): ${selectedAreas.join(", ")}.\nAdd another area or tap "${DONE_SELECTING_AREAS}" when finished.`
            : `Please select at least one area from ${lga}, ${state}.`;
        setAiConversationMessages((prev) => [
          ...prev,
          { role: "user", content: trimmed },
          {
            role: "assistant",
            content: followUp,
            speakLine: followUp,
            data: nextData,
            missingFields: lastAssistant?.focusedMissingField
              ? [lastAssistant.focusedMissingField]
              : undefined,
            focusedMissingField: lastAssistant?.focusedMissingField,
            remainingMissingCount: 0,
            quickOptions: [
              ...page,
              ...(hasMore ? [SHOW_MORE_LOCATION_OPTIONS] : []),
              DONE_SELECTING_AREAS,
            ],
            locationAllOptions: remaining,
            locationOptionsOffset: 0,
            locationOptionsLabel: `areas in ${lga}, ${state}`,
          },
        ]);
        return;
      }
    }

    if (SKIP_UTTERANCE_RE.test(trimmed)) {
      setLoading(true);
      try {
        setAiConversationMessages((prev) => {
          const lastAssist = [...prev].reverse().find((m) => m.role === "assistant");
          const lastFocus = lastAssist?.focusedMissingField;
          const data = { ...(collectedDataRef.current || {}) } as Record<string, unknown>;
          const skipped = skippedFieldsRef.current;
          const missingBefore = filterMissingPropertyAiFields(
            getPropertyAiMissingFields(data, { listingTypePreset }),
            skipped,
            userAnsweredFieldsRef.current,
          );
          const toSkip =
            lastFocus && missingBefore.includes(lastFocus) ? lastFocus : missingBefore[0];
          if (toSkip && !isPropertyAiFieldSkippable(canonicalPropertyAiFieldKey(toSkip))) {
            const label = fieldLabelOnly(toSkip);
            const reqLine = `${label} is required. Please answer in your next message.`;
            return [
              ...prev,
              { role: "user" as const, content: trimmed },
              {
                role: "assistant" as const,
                content: reqLine,
                speakLine: `${label} is required. Please share an answer.`,
                data,
                missingFields: [toSkip],
                focusedMissingField: toSkip,
                remainingMissingCount: Math.max(0, missingBefore.length - 1),
              },
            ];
          }
          if (toSkip) skipped.add(canonicalPropertyAiFieldKey(toSkip));
          const reply = withPropertyLocationOptions(
            buildPropertyInteractiveReply(
              data,
              skipped,
              listingTypePreset,
              userAnsweredFieldsRef.current,
            ),
            data,
          );
          return [
            ...prev,
            { role: "user" as const, content: trimmed },
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

    const accumulated = [...aiConversationMessages, { role: "user", content: trimmed }]
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join(". ");

    const storedListing = normalizedListingPropertyType((collectedDataRef.current || {}) as Record<string, unknown>);
    const detectedListing =
      detectListingPropertyTypeFromText(trimmed) || detectListingPropertyTypeFromText(accumulated);
    const effectiveListing = storedListing || listingTypePreset || detectedListing;

    if (!effectiveListing) {
      const typeField = "property type — start with Sale, Rent, Shortlet, or JV (listing type on the form)";
      const prompt = getPropertyFieldPrompt(typeField, 0);
      setAiConversationMessages((prev) => [
        ...prev,
        { role: "user", content: trimmed },
        {
          role: "assistant",
          content: prompt.displayLine,
          speakLine: prompt.speakLine,
          missingFields: [typeField],
          focusedMissingField: typeField,
          remainingMissingCount: 0,
        },
      ]);
      return;
    }

    setLoading(true);
    setAiConversationMessages((prev) => [...prev, { role: "user", content: trimmed }]);

    try {
      const lastAssist = [...aiConversationMessages].reverse().find((m) => m.role === "assistant");
      const focus = lastAssist?.focusedMissingField;
      markPropertyAiUserAnswer(userAnsweredFieldsRef.current, focus, trimmed);
      const localBeforeApi = applyFocusedPropertyAnswer(
        trimmed,
        focus,
        normalizePropertyAiCollectedData({
          ...(collectedDataRef.current || {}),
          propertyType: effectiveListing,
        }),
      );
      setAiCollectedData(localBeforeApi);
      collectedDataRef.current = localBeforeApi;

      const contextual = focus
        ? `${accumulated || trimmed}\n\n[The user is answering this specific field: ${focus}]`
        : accumulated || trimmed;

      const res = await suggestProperty(contextual, Cookies.get("token") ?? "");
      if (!res.success) {
        setAiConversationMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.message || "Could not get suggestions. Please try again or add more detail." },
        ]);
        return;
      }
      let data = mergePropertyAiCollectedData(localBeforeApi, res.data || {}, effectiveListing);
      data = applyFocusedPropertyAnswer(trimmed, focus, data);
      const lgaUser = extractLocalGovernmentFromText(trimmed);
      const lgaAccumulated = extractLocalGovernmentFromText(accumulated || trimmed);
      const parsedLga = lgaUser || lgaAccumulated;
      if (parsedLga) {
        const loc = (data.location || {}) as Record<string, unknown>;
        data = { ...data, location: { ...loc, localGovernment: parsedLga } };
      }
      {
        const currentLoc = (data.location || {}) as Record<string, unknown>;
        data = {
          ...data,
          location: applyPropertyLocationFromFocusedAnswer(trimmed, focus, currentLoc),
        };
      }
      const fromUser = extractDocumentsFromText(trimmed);
      const fromAccumulated = extractDocumentsFromText(accumulated || trimmed);
      const parsedDocs = [...new Set([...fromUser, ...fromAccumulated])];
      if (parsedDocs.length > 0) {
        const existing = (Array.isArray(data.documents) ? data.documents : Array.isArray(data.docOnProperty) ? (data.docOnProperty as { docName?: string }[]).map((d) => d.docName).filter(Boolean) : []) as string[];
        data = { ...data, documents: [...new Set([...existing, ...parsedDocs])] };
      }
      const landFromUser = extractLandSizeFromText(trimmed);
      const landFromAccumulated = extractLandSizeFromText(accumulated || trimmed);
      const parsedLand = landFromUser || landFromAccumulated;
      if (parsedLand && (parsedLand.measurementType || parsedLand.size != null)) {
        const existing = (data.landSize || {}) as { measurementType?: string; size?: number };
        data = {
          ...data,
          landSize: {
            measurementType: parsedLand.measurementType || existing.measurementType || "",
            size: parsedLand.size ?? existing.size ?? 0,
          },
        };
      }
      data = normalizePropertyAiCollectedData(data);
      const focusKey = canonicalPropertyAiFieldKey(focus || "");
      const stillMissing = getPropertyAiMissingFields(data, { listingTypePreset }).map((f) =>
        canonicalPropertyAiFieldKey(f),
      );
      if (!stillMissing.includes(focusKey)) {
        userAnsweredFieldsRef.current.add(focusKey);
      }
      setAiCollectedData(data);
      collectedDataRef.current = data;
      const reply = withPropertyLocationOptions(
        buildPropertyInteractiveReply(
          data,
          skippedFieldsRef.current,
          listingTypePreset,
          userAnsweredFieldsRef.current,
        ),
        data,
      );
      setAiConversationMessages((prev) => [
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
      toast.error((e as Error)?.message || "Something went wrong.");
      setAiConversationMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again or add more detail." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [
    aiCollectedData,
    aiConversationMessages,
    listingTypePreset,
    setAiConversationMessages,
    setAiCollectedData,
  ]);

  // Auto-play latest assistant reply when TTS is enabled (Web Speech API — SpeechSynthesis).
  useEffect(() => {
    const n = aiConversationMessages.length;
    if (n > prevMessageCountRef.current && aiConversationMessages[n - 1]?.role === "assistant" && playRepliesAloud) {
      speak(
        getSpeakableAssistantText(
          aiConversationMessages[n - 1] as { content: string; speakLine?: string },
        ),
      );
    }
    prevMessageCountRef.current = n;
  }, [aiConversationMessages, playRepliesAloud, speak]);

  // Scroll the thread inside its panel; keep the send box in view on the main page.
  useEffect(() => {
    if (aiConversationMessages.length === 0 && !loading) return;
    const behavior: ScrollBehavior =
      aiConversationMessages.length <= 2 ? "auto" : "smooth";
    scrollConversationToBottom(behavior);
    keepInputSectionInView();
    const t = window.setTimeout(() => {
      scrollConversationToBottom(behavior);
      keepInputSectionInView();
    }, 120);
    return () => window.clearTimeout(t);
  }, [
    aiConversationMessages,
    loading,
    scrollConversationToBottom,
    keepInputSectionInView,
  ]);

  /** Price step: digits-only field with commas; otherwise format long digit runs in free text. */
  const propertyAmountEntryMode = useMemo(() => {
    const last = [...aiConversationMessages].reverse().find((m) => m.role === "assistant") as
      | { focusedMissingField?: string }
      | undefined;
    return canonicalPropertyAiFieldKey(last?.focusedMissingField ?? "") === PROPERTY_AI_FIELD.PRICE;
  }, [aiConversationMessages]);

  const handleSuggest = useCallback(
    async (userInput: string) => {
      await handleSend(userInput.trim());
    },
    [handleSend]
  );

  const handlePropertyQuickOptionClick = useCallback(
    async (
      option: string,
      msg: { focusedMissingField?: string; quickOptions?: string[] },
    ) => {
      const focus = normalizeFieldKey(msg.focusedMissingField || "");
      const isAreaMultiSelect =
        focus.includes("area") &&
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

  const handleProceedToSummary = useCallback(() => {
    setAiFlowStep("summary");
  }, [setAiFlowStep]);

  const handleContinueToImageUpload = useCallback(() => {
    if (aiCollectedData) {
      const merged = mergeSuggestPropertyIntoForm(propertyData, aiCollectedData);
      setPropertyData({ ...propertyData, ...merged });
    }
    setAiFlowStep(null);
    setCurrentStep(imageStepIndex);
  }, [aiCollectedData, propertyData, setPropertyData, setCurrentStep, setAiFlowStep, imageStepIndex]);

  const handleBackToMode = useCallback(() => {
    skippedFieldsRef.current = new Set();
    userAnsweredFieldsRef.current = new Set();
    setPostingMode(null);
    setAiConversationMessages([]);
    setAiCollectedData(null);
    setAiFlowStep(null);
  }, [setPostingMode, setAiConversationMessages, setAiCollectedData, setAiFlowStep]);

  if (aiFlowStep === "summary") {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setAiFlowStep("conversation")}
          className="text-sm text-[#09391C] hover:text-[#8DDB90] flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back to conversation
        </button>
        <PropertyAiDataSummary onContinueToImageUpload={handleContinueToImageUpload} />
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-[#8DDB90]/40 bg-[#f0fdf4]/60 p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#09391C] flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[#8DDB90]" />
          Describe your {briefTypeLabel} property
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
        The AI asks for <strong>one form field at a time</strong> (category, location, price, rooms, parking, documents, etc.) based on your{" "}
        <strong>{briefTypeLabel}</strong> listing type and property category — same fields as the manual form. Use comma-separated Naira amounts (e.g.{" "}
        <span className="whitespace-nowrap">85,000,000</span>). Say <strong>skip</strong> only for optional key features. When ready, use <strong>I&apos;m done</strong> for the summary and image upload.
      </p>
      <p className="text-xs text-[#5A5D63] italic">
        Tip: If voice input fails (e.g. network), type instead.
      </p>

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

      <div
        ref={conversationScrollRef}
        className="bg-white rounded-lg border border-gray-200 w-full min-h-[20rem] max-h-[min(70vh,36rem)] overflow-y-auto overscroll-contain scroll-smooth p-4 md:p-5 space-y-3"
        role="log"
        aria-live="polite"
        aria-label="Property listing conversation"
      >
        {aiConversationMessages.length === 0 ? (
          <p className="text-sm text-[#5A5D63] italic">
            Example: &quot;Sale — duplex in Ikoyi…&quot; or &quot;Rent, 3-bed in Surulere…&quot; You must include Sale, Rent, Shortlet, or JV.
          </p>
        ) : (
          aiConversationMessages.map((msg, i) => (
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
                className={`rounded-lg px-4 py-2.5 text-sm ${
                  msg.role === "user"
                    ? "max-w-[min(100%,28rem)] bg-[#09391C] text-white"
                    : "max-w-[min(100%,42rem)] bg-gray-100 text-[#09391C]"
                }`}
              >
                {msg.role === "assistant" &&
                (msg as { focusedMissingField?: string }).focusedMissingField ? (
                  <>
                    <p className="mb-2 whitespace-pre-line">{msg.content}</p>
                    {(msg as { quickOptions?: string[] }).quickOptions &&
                    (msg as { quickOptions?: string[] }).quickOptions!.length > 0 ? (
                      <div className="mb-2">
                        <p className="mb-1 text-[11px] font-medium text-[#5A5D63]">
                          Tap to choose
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(msg as { quickOptions?: string[] }).quickOptions!.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() =>
                                handlePropertyQuickOptionClick(
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
        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#8DDB90]/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-[#09391C]" aria-hidden />
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 text-sm text-[#09391C]">
              <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-[#8DDB90]" aria-hidden />
              <span>Reading your description and preparing suggestions…</span>
            </div>
          </div>
        )}
      </div>

      <div ref={inputSectionRef} className="flex flex-col gap-3 scroll-mt-4">
        <AiFillBlock
          title=""
          placeholder={
            propertyAmountEntryMode
              ? "e.g. 85,000,000"
              : "e.g. Sale — 3-bedroom in Lekki, Lagos, price 85,000,000…"
          }
          buttonLabel={loading ? "Sending…" : "Send"}
          onSuggest={handleSuggest}
          disabled={loading}
          maxHeight="80px"
          amountEntryMode={propertyAmountEntryMode}
          formatAmountRunsInText={!propertyAmountEntryMode}
        />
        <div className="flex flex-wrap gap-2 items-center">
          {aiConversationMessages.some((m) => m.role === "assistant") && (
            <button
              type="button"
              onClick={handleProceedToSummary}
              className="px-4 py-2 rounded-lg border-2 border-[#8DDB90] text-[#09391C] font-medium hover:bg-[#8DDB90]/10"
            >
              I’m done — show summary
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
