"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { usePreferenceForm } from "@/context/preference-form-context";
import { suggestPreference } from "@/services/aiFormService";
import AiFillBlock from "@/components/ai-form-fill/AiFillBlock";
import { mergeSuggestPreferenceIntoForm } from "@/utils/aiSuggestPreferenceMerge";
import {
  getPreferenceFieldPrompt,
  preferenceAllDonePrompt,
} from "@/utils/aiInteractivePrompts";
import { assistantMessageToSpeakable } from "@/utils/ttsText";
import { buildPreferencePayload } from "@/utils/buildPreferencePayload";
import { POST_REQUEST } from "@/utils/requests";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import toast from "react-hot-toast";
import { ArrowLeft, MessageSquare, Bot, Loader2, CheckCircle, Volume2, VolumeX } from "lucide-react";

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
} {
  const missing = getMissingFieldsFromPreferenceData(data).filter((f) => !skipped.has(f));

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
  const { displayLine, speakLine } = getPreferenceFieldPrompt(focus, questionVariant);

  return {
    content: displayLine,
    speakLine,
    focusedMissingField: focus,
    missingFields: [focus],
    remainingMissingCount: Math.max(0, missing.length - 1),
  };
}

function isMeaningful(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return !Number.isNaN(value) && value >= 0;
  if (Array.isArray(value)) return value.length > 0;
  return false;
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
  const hasLga =
    (Array.isArray(base.localGovernmentAreas) && base.localGovernmentAreas.length > 0) ||
    (Array.isArray(base.lgas) && base.lgas.length > 0);
  const hasArea =
    (Array.isArray(base.areas) && base.areas.length > 0) ||
    isMeaningful(base.area) ||
    isMeaningful(base.customLocation);

  const parts = raw.split(/[,;]/).map((p) => p.trim()).filter(Boolean);

  if (parts.length >= 3) {
    base.state = parts[0];
    base.localGovernmentAreas = [parts[1]];
    base.areas = [parts.slice(2).join(", ")];
    return base;
  }

  if (parts.length === 2) {
    if (!hasState) {
      base.state = parts[0];
      base.localGovernmentAreas = [parts[1]];
      return base;
    }
    if (!hasLga) {
      base.localGovernmentAreas = [parts[0]];
      base.areas = [parts[1]];
      return base;
    }
    if (!hasArea) {
      base.areas = [parts.join(", ")];
    }
    return base;
  }

  if (parts.length === 1) {
    const v = parts[0];
    if (!hasState) base.state = v;
    else if (!hasLga) base.localGovernmentAreas = [v];
    else if (!hasArea) base.areas = [v];
    return base;
  }

  return base;
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
 * Returns list of missing/incomplete fields aligned with the preference form required/optional fields.
 * Mirrors location, budget, contact, propertyDetails, bookingDetails, developmentDetails validation.
 */
function getMissingFieldsFromPreferenceData(data: Record<string, unknown>): string[] {
  const missing: string[] = [];
  const type = String(data.preferenceType || "").toLowerCase();

  // --- Required for all: preference type ---
  if (!isMeaningful(data.preferenceType)) {
    missing.push("preference type (required: one of buy, rent, shortlet, joint venture)");
  }

  // --- Required for all: location — ask state, then LGA, then area (one step each) ---
  const loc = normalizeCompoundPreferenceLocation((data.location || {}) as Record<string, unknown>);
  const hasState = loc && isMeaningful(loc.state);
  const hasLgas = loc && Array.isArray(loc.localGovernmentAreas) && (loc.localGovernmentAreas as unknown[]).length > 0;
  const hasLgasAlt = loc && Array.isArray(loc.lgas) && (loc.lgas as unknown[]).length > 0;
  const hasArea =
    (loc && Array.isArray(loc.areas) && (loc.areas as unknown[]).length > 0) ||
    (loc && loc.area && isMeaningful(loc.area));
  const hasCustomLocation = loc && isMeaningful(loc.customLocation);

  if (!hasState) {
    missing.push("preference location — state (required)");
  } else if (!hasLgas && !hasLgasAlt) {
    missing.push("preference location — LGA (required)");
  } else if (!hasArea && !hasCustomLocation) {
    missing.push("preference location — area (required)");
  }

  // --- Required for all: budget (form requires both min and max) ---
  const budget = data.budget as Record<string, unknown> | undefined;
  const minPrice = budget && typeof budget.minPrice === "number" ? budget.minPrice : 0;
  const maxPrice = budget && typeof budget.maxPrice === "number" ? budget.maxPrice : 0;
  if (!(minPrice > 0)) {
    missing.push("budget min price in Naira (required)");
  }
  if (!(maxPrice > 0)) {
    missing.push("budget max price in Naira (required)");
  }
  if (minPrice > 0 && maxPrice > 0 && maxPrice <= minPrice) {
    missing.push("budget max price must be greater than min price");
  }

  // --- Contact identity is collected in the dedicated post-conversation form ---
  // Do not ask for name/email during AI chat.
  if (type === "joint-venture") {
    const contact = data.contactInfo as Record<string, unknown> | undefined;
    if (!contact || !isMeaningful(contact.companyName)) {
      missing.push("company name (required for JV)");
    }
  }

  // --- Optional but suggested: features, additional notes ---
  const features = data.features as Record<string, unknown> | undefined;
  const hasFeatures = features && (Array.isArray(features.baseFeatures) || Array.isArray(features.premiumFeatures));
  if (!hasFeatures) {
    missing.push("key features or amenities (e.g. parking, security, water)");
  }
  if (!isMeaningful(data.additionalNotes)) {
    missing.push("additional notes or special requirements (optional)");
  }

  // --- Buy: property details required by form ---
  if (type === "buy") {
    const pd = data.propertyDetails as Record<string, unknown> | undefined;
    if (!pd || !isMeaningful(pd.propertyType)) {
      missing.push("property type (required: land, residential, or commercial)");
    }
    const subtype = String(pd?.propertyType || pd?.propertySubtype || "").toLowerCase();
    if (subtype && subtype !== "land") {
      if (!pd || !isMeaningful(pd.buildingType)) {
        missing.push("building type (required for buy: e.g. detached, semi-detached, block of flats)");
      }
      if (!pd || !isMeaningful(pd.propertyCondition)) {
        missing.push("property condition (required: e.g. new, renovated, any)");
      }
      if (subtype === "residential" && (!pd || !isMeaningful(pd.bedrooms) && !isMeaningful(pd.minBedrooms))) {
        missing.push("number of bedrooms (required for residential)");
      }
    }
    if (!pd || !Array.isArray(pd.documentTypes) || (pd.documentTypes as unknown[]).length === 0) {
      missing.push("at least one document type (required for buy: e.g. C of O, Survey plan)");
    }
    if (!isMeaningful(data.nearbyLandmark)) {
      missing.push("nearby landmark (optional)");
    }
  }

  // --- Rent: property details required by form ---
  if (type === "rent") {
    const pd = data.propertyDetails as Record<string, unknown> | undefined;
    if (!pd || !isMeaningful(pd.propertyType)) {
      missing.push("property type (required: residential or commercial)");
    }
    if (!pd || !isMeaningful(pd.buildingType)) {
      missing.push("building type (required for rent)");
    }
    if (!pd || !isMeaningful(pd.propertyCondition)) {
      missing.push("property condition (required for rent)");
    }
    if (!pd || !isMeaningful(pd.leaseTerm)) {
      missing.push("lease term (required: e.g. 6 Months, 1 Year)");
    }
    const subtype = String(pd?.propertyType || "").toLowerCase();
    if (subtype === "residential" && (!pd || !isMeaningful(pd.bedrooms) && !isMeaningful(pd.minBedrooms))) {
      missing.push("number of bedrooms (required for residential rent)");
    }
  }

  // --- Shortlet: required fields ---
  if (type === "shortlet") {
    const bd = data.bookingDetails as Record<string, unknown> | undefined;
    const pd = data.propertyDetails as Record<string, unknown> | undefined;
    if (!bd || !isMeaningful(bd.checkInDate)) {
      missing.push("check-in date (required, e.g. YYYY-MM-DD)");
    }
    if (!bd || !isMeaningful(bd.checkOutDate)) {
      missing.push("check-out date (required, e.g. YYYY-MM-DD)");
    }
    if (!pd || !isMeaningful(pd.propertyType)) {
      missing.push("property type for shortlet (required: e.g. studio, apartment)");
    }
    if (!pd || (!isMeaningful(pd.bedrooms) && !isMeaningful(pd.minBedrooms))) {
      missing.push("number of bedrooms (required for shortlet)");
    }
    if (!pd || (pd.bathrooms == null && pd.minBathrooms == null)) {
      missing.push("number of bathrooms (required for shortlet)");
    }
    if (!bd || (bd.numberOfGuests == null || Number(bd.numberOfGuests) < 1)) {
      missing.push("number of guests (required for shortlet)");
    }
    if (!pd || !isMeaningful(pd.travelType)) {
      missing.push("travel type (required: e.g. solo, couple, family, group, business)");
    }
  }

  // --- Joint venture: development details required by form ---
  if (type === "joint-venture") {
    const dev = data.developmentDetails as Record<string, unknown> | undefined;
    if (!dev || !isMeaningful(dev.minLandSize)) {
      missing.push("land size (required for JV, e.g. 500)");
    }
    if (!dev || !isMeaningful(dev.measurementUnit)) {
      missing.push("measurement unit (required for JV: plot, sqm, or hectares)");
    }
    if (!dev || !isMeaningful(dev.jvType)) {
      missing.push("JV type (required: Equity Split, Lease-to-Build, or Development Partner)");
    }
    if (!dev || !Array.isArray(dev.developmentTypes) || (dev.developmentTypes as unknown[]).length === 0) {
      missing.push("at least one development type (required for JV)");
    }
    if (!dev || !isMeaningful(dev.preferredSharingRatio)) {
      missing.push("preferred sharing ratio (required for JV)");
    }
    if (!dev || !Array.isArray(dev.minimumTitleRequirements) || (dev.minimumTitleRequirements as unknown[]).length === 0) {
      missing.push("minimum title requirements (required for JV: e.g. C of O, Governors consent)");
    }
  }

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
    if (Array.isArray(lgas) && lgas.length) out.push({ key: "lgas", label: "LGAs / Areas", value: (lgas as string[]).join(", ") });
    if (loc.customLocation) out.push({ key: "customLocation", label: "Custom location", value: String(loc.customLocation) });
  }
  const budget = data.budget as Record<string, unknown> | undefined;
  if (budget) {
    if (budget.minPrice != null) out.push({ key: "minPrice", label: "Min budget (₦)", value: String(budget.minPrice) });
    if (budget.maxPrice != null) out.push({ key: "maxPrice", label: "Max budget (₦)", value: String(budget.maxPrice) });
  }
  const pd = data.propertyDetails as Record<string, unknown> | undefined;
  if (pd) {
    if (pd.propertyType) out.push({ key: "propertyType", label: "Property type", value: String(pd.propertyType) });
    if (pd.bedrooms != null || pd.minBedrooms != null) out.push({ key: "bedrooms", label: "Bedrooms", value: String(pd.bedrooms ?? pd.minBedrooms) });
    if (pd.bathrooms != null || pd.minBathrooms != null) out.push({ key: "bathrooms", label: "Bathrooms", value: String(pd.bathrooms ?? pd.minBathrooms) });
    if (pd.buildingType) out.push({ key: "buildingType", label: "Building type", value: String(pd.buildingType) });
    if (pd.propertyCondition) out.push({ key: "propertyCondition", label: "Condition", value: String(pd.propertyCondition) });
    if (pd.leaseTerm) out.push({ key: "leaseTerm", label: "Lease term", value: String(pd.leaseTerm) });
    if (pd.purpose) out.push({ key: "purpose", label: "Purpose", value: String(pd.purpose) });
  }
  const dev = data.developmentDetails as Record<string, unknown> | undefined;
  if (dev) {
    if (dev.minLandSize || dev.maxLandSize) out.push({ key: "landSize", label: "Land size", value: [dev.minLandSize, dev.maxLandSize].filter(Boolean).join(" – ") });
    if (Array.isArray(dev.developmentTypes) && dev.developmentTypes.length) out.push({ key: "developmentTypes", label: "Development types", value: (dev.developmentTypes as string[]).join(", ") });
    if (dev.preferredSharingRatio) out.push({ key: "preferredSharingRatio", label: "Preferred sharing", value: String(dev.preferredSharingRatio) });
  }
  const bd = data.bookingDetails as Record<string, unknown> | undefined;
  if (bd) {
    if (bd.checkInDate) out.push({ key: "checkInDate", label: "Check-in", value: String(bd.checkInDate) });
    if (bd.checkOutDate) out.push({ key: "checkOutDate", label: "Check-out", value: String(bd.checkOutDate) });
    if (bd.numberOfGuests != null) out.push({ key: "numberOfGuests", label: "Guests", value: String(bd.numberOfGuests) });
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
  const prevMessageCountRef = useRef(0);
  const { speak, stop, speaking } = useSpeechSynthesis({ lang: "en-NG", rate: 0.95 });

  useEffect(() => {
    collectedDataRef.current = preferenceAiCollectedData;
  }, [preferenceAiCollectedData]);

  useEffect(() => {
    if (preferenceAiMessages.length === 0) {
      skippedFieldsRef.current = new Set();
      preferenceQuestionVariantRef.current = 0;
    }
  }, [preferenceAiMessages.length]);

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

  const handleSend = useCallback(
    async (textOverride: string) => {
      const trimmed = textOverride.toString().trim();
      if (!trimmed) {
        toast.error("Please enter or say something.");
        return;
      }

      if (SKIP_UTTERANCE_RE.test(trimmed)) {
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
            if (toSkip) skipped.add(toSkip);
            const reply = buildPreferenceInteractiveReply(
              data,
              skipped,
              preferenceQuestionVariantRef.current++,
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
              },
            ];
          });
        } finally {
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setPreferenceAiMessages((prev) => [...prev, { role: "user", content: trimmed }]);

      try {
        const accumulated = [...preferenceAiMessages, { role: "user", content: trimmed }]
          .filter((m) => m.role === "user")
          .map((m) => m.content)
          .join(". ");
        const contextual =
          (() => {
            const lastAssist = [...preferenceAiMessages].reverse().find((m) => m.role === "assistant");
            const focus = lastAssist?.focusedMissingField;
            if (!focus) return accumulated || trimmed;
            return `${accumulated || trimmed}\n\n[The user is answering this specific field: ${focus}]`;
          })();
        const res = await suggestPreference(contextual);
        if (!res.success) {
          setPreferenceAiMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: res.message || "Could not get suggestions. Please try again or add more detail.",
            },
          ]);
          return;
        }
        let data = (res.data || {}) as Record<string, unknown>;
        const fromUser = extractContactFromText(trimmed);
        const fromAccumulated = extractContactFromText(accumulated || trimmed);
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
          ...(parsedContact.fullName && { fullName: parsedContact.fullName }),
        };
        if (Object.keys(mergedContact).length > 0) {
          data = { ...data, contactInfo: mergedContact };
        }
        {
          let loc = (data.location || {}) as Record<string, unknown>;
          loc = normalizeCompoundPreferenceLocation(loc);
          loc = applyPreferenceLocationFromNaturalText(trimmed, loc);
          data = { ...data, location: loc };
        }
        setPreferenceAiCollectedData(data);
        const reply = buildPreferenceInteractiveReply(
          data,
          skippedFieldsRef.current,
          preferenceQuestionVariantRef.current++,
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
          },
        ]);
      } catch (e) {
        toast.error((e as Error)?.message || "Something went wrong.");
        setPreferenceAiMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Something went wrong. Please try again or add more detail." },
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

  const handleProceedToContactConfirm = useCallback(() => {
    setPreferenceAiFlowStep("contactConfirm");
  }, [setPreferenceAiFlowStep]);

  useEffect(() => {
    if (preferenceAiFlowStep !== "contactConfirm" || !preferenceAiCollectedData) return;
    const c = preferenceAiCollectedData.contactInfo as Record<string, unknown> | undefined;
    const type = String(preferenceAiCollectedData.preferenceType || "").toLowerCase();
    if (type === "joint-venture") {
      setManualFullName(String(c?.contactPerson || c?.fullName || ""));
    } else {
      setManualFullName(String(c?.fullName || ""));
    }
    setManualEmail(String(c?.email || ""));
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
        Type or use the mic to describe what you want. The AI asks for <strong>one detail at a time</strong>, using what you already said. Say <strong>skip</strong> to move to the next item. When you&apos;re ready, use <strong>I&apos;m done</strong> to enter your name and email, then review the summary.
      </p>
      <p className="text-xs text-[#5A5D63] italic">
        Tip: If voice input fails (e.g. network), type instead. Name and email are confirmed on the next step.
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

      {loading && (
        <div className="flex items-center gap-3 rounded-lg border border-[#8DDB90]/50 bg-[#f0fdf4] px-4 py-3 text-sm text-[#09391C]">
          <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-[#8DDB90]" aria-hidden />
          <span>Reading your description and preparing suggestions…</span>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 max-h-64 overflow-y-auto p-4 space-y-3">
        {preferenceAiMessages.length === 0 ? (
          <p className="text-sm text-[#5A5D63] italic">Start by describing what you&apos;re looking for below.</p>
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
          placeholder="e.g. 3-bedroom in Lekki, Lagos, max 50 million, with parking..."
          buttonLabel={loading ? "Sending…" : "Send"}
          onSuggest={handleSuggest}
          disabled={loading}
          maxHeight="80px"
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
