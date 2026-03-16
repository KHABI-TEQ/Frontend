"use client";

import React, { useState, useRef, useCallback } from "react";
import { usePreferenceForm } from "@/context/preference-form-context";
import { suggestPreference } from "@/services/aiFormService";
import AiFillBlock from "@/components/ai-form-fill/AiFillBlock";
import { mergeSuggestPreferenceIntoForm } from "@/utils/aiSuggestPreferenceMerge";
import { buildPreferencePayload } from "@/utils/buildPreferencePayload";
import { POST_REQUEST } from "@/utils/requests";
import toast from "react-hot-toast";
import { ArrowLeft, MessageSquare, Bot, Loader2, CheckCircle } from "lucide-react";

function isMeaningful(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return !Number.isNaN(value) && value >= 0;
  if (Array.isArray(value)) return value.length > 0;
  return false;
}

/**
 * Returns the exact format expected for each missing category so the AI can process the response.
 * Use simple text only; no apostrophes or special characters. Shown when suggesting missing fields.
 */
function getFormatHintForMissingFields(missingFields: string[]): string {
  if (missingFields.length === 0) return "";
  const parts: string[] = [];
  const has = (...keywords: string[]) =>
    missingFields.some((f) => keywords.some((k) => f.toLowerCase().includes(k)));

  if (has("preference type")) {
    parts.push("preference type: write exactly one of buy, rent, shortlet, joint venture");
  }
  if (has("location", "state", "lga", "area", "local government", "custom location")) {
    parts.push("location: state: Lagos, LGA: Ikeja, area: Lekki or customLocation: near Chevron (state and at least one LGA or area, no special characters)");
  }
  if (has("budget", "price", "naira", "min", "max")) {
    parts.push("budget: minPrice: 10000000, maxPrice: 50000000 (both numbers in Naira, no commas or spaces in the number)");
  }
  if (has("contact", "email", "phone", "your name")) {
    parts.push("contact: email: you@example.com, phone: 08012345678, name: Your Full Name (phone must start with 0 or 234)");
  }
  if (has("company name", "contact person") || (has("joint") && has("contact"))) {
    parts.push("JV contact: companyName: Company Ltd, contactPerson: John Doe, email: x@y.com, phone: 08012345678");
  }
  if (has("property type", "bedrooms", "bathrooms", "building", "condition", "lease")) {
    parts.push("property: propertyType: residential or commercial or land, bedrooms: 3, bathrooms: 2, buildingType: detached, propertyCondition: new, leaseTerm: 1 Year (use exact words)");
  }
  if (has("document type")) {
    parts.push("document types: at least one e.g. C of O, Survey plan, Governors consent (no apostrophes)");
  }
  if (has("check-in", "check-out", "guests", "shortlet")) {
    parts.push("shortlet: checkInDate: 2025-04-01, checkOutDate: 2025-04-05, numberOfGuests: 2, travelType: family (dates as YYYY-MM-DD)");
  }
  if (has("land size", "development", "sharing", "title", "JV") && !has("contact")) {
    parts.push("JV details: minLandSize: 500, measurementUnit: sqm, developmentTypes: Mini Flats, preferredSharingRatio: 60-40, minimumTitleRequirements: C of O (no apostrophes)");
  }
  if (has("features", "amenities")) {
    parts.push("features: list separated by commas e.g. parking, security, water, generator");
  }
  if (has("additional notes", "landmark")) {
    parts.push("notes or landmark: e.g. near Chevron, quiet estate");
  }

  if (parts.length === 0) return "";
  return " Expected format so we can process your reply: " + parts.join("; ") + ".";
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

  // --- Required for all: location (state, at least one LGA, and area or custom location) ---
  const loc = data.location as Record<string, unknown> | undefined;
  const hasState = loc && isMeaningful(loc.state);
  const hasLgas = loc && Array.isArray(loc.localGovernmentAreas) && (loc.localGovernmentAreas as unknown[]).length > 0;
  const hasLgasAlt = loc && Array.isArray(loc.lgas) && (loc.lgas as unknown[]).length > 0;
  const hasArea = (loc && Array.isArray(loc.areas) && (loc.areas as unknown[]).length > 0) || (loc && loc.area && isMeaningful(loc.area));
  const hasCustomLocation = loc && isMeaningful(loc.customLocation);
  if (!hasState && !hasLgas && !hasLgasAlt) {
    missing.push("location (required: state and at least one LGA or area)");
  } else {
    if (!hasState) missing.push("location state (required)");
    if (!hasLgas && !hasLgasAlt) missing.push("at least one LGA or area name (required)");
    if (!hasArea && !hasCustomLocation) missing.push("area name or custom location (required)");
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

  // --- Required for all (except JV uses different contact): fullName, email, phoneNumber ---
  if (type === "joint-venture") {
    const contact = data.contactInfo as Record<string, unknown> | undefined;
    if (!contact || !isMeaningful(contact.companyName)) {
      missing.push("company name (required for JV)");
    }
    if (!contact || !isMeaningful(contact.contactPerson)) {
      missing.push("contact person name (required for JV)");
    }
    if (!contact || !isMeaningful(contact.email)) {
      missing.push("email (required)");
    }
    if (!contact || !isMeaningful(contact.phoneNumber)) {
      missing.push("phone number (required, e.g. 08012345678)");
    }
  } else {
    const contact = data.contactInfo as Record<string, unknown> | undefined;
    const hasEmail = contact && isMeaningful(contact.email);
    const hasPhone = contact && isMeaningful(contact.phoneNumber);
    const hasName = contact && isMeaningful(contact.fullName);
    if (!hasEmail && !hasPhone) {
      missing.push("contact email or phone number (required)");
    }
    if (!hasName) {
      missing.push("your full name (required)");
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSend = useCallback(
    async (textOverride: string) => {
      const trimmed = textOverride.toString().trim();
      if (!trimmed) {
        toast.error("Please enter or say something.");
        return;
      }
      setLoading(true);
      setPreferenceAiMessages((prev) => [...prev, { role: "user", content: trimmed }]);
      scrollToBottom();

      try {
        const accumulated = [...preferenceAiMessages, { role: "user", content: trimmed }]
          .filter((m) => m.role === "user")
          .map((m) => m.content)
          .join(". ");
        const res = await suggestPreference(accumulated || trimmed);
        if (!res.success) {
          setPreferenceAiMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: res.message || "Could not get suggestions. Please try again or add more detail.",
            },
          ]);
          scrollToBottom();
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
        const missingFields = getMissingFieldsFromPreferenceData(data);
        const formatHint = getFormatHintForMissingFields(missingFields);
        const hasMissing = missingFields.length > 0;
        const _suffixPref = hasMissing ? "" : " I have enough to build your preference. If everything looks good, click \"I'm done\" below to see the summary and continue to the form.";
        const assistantContent = hasMissing ? "Here's what I have so far:" : "Here's what I have so far:" + _suffixPref;
        setPreferenceAiCollectedData(data);
        setPreferenceAiMessages((prev) => [
          ...prev,
          { role: "assistant", content: assistantContent, data, missingFields: hasMissing ? missingFields : undefined, formatHint: hasMissing ? formatHint : undefined },
        ]);
        scrollToBottom();
      } catch (e) {
        toast.error((e as Error)?.message || "Something went wrong.");
        setPreferenceAiMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Something went wrong. Please try again or add more detail." },
        ]);
        scrollToBottom();
      } finally {
        setLoading(false);
      }
    },
    [preferenceAiMessages, setPreferenceAiMessages, setPreferenceAiCollectedData, scrollToBottom]
  );

  const handleSuggest = useCallback(
    async (userInput: string) => {
      await handleSend(userInput.trim());
    },
    [handleSend]
  );

  const handleProceedToSummary = useCallback(() => {
    setPreferenceAiFlowStep("summary");
  }, [setPreferenceAiFlowStep]);

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
    setPreferenceEntryMode(null);
    setPreferenceAiMessages([]);
    setPreferenceAiCollectedData(null);
    setPreferenceAiFlowStep(null);
  }, [setPreferenceEntryMode, setPreferenceAiMessages, setPreferenceAiCollectedData, setPreferenceAiFlowStep]);

  if (preferenceAiFlowStep === "summary") {
    const data = preferenceAiCollectedData || {};
    const rows = flattenPreferenceData(data);
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setPreferenceAiFlowStep("conversation")}
          className="text-sm text-[#09391C] hover:text-[#8DDB90] flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back to conversation
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
        Type or use the mic to describe the property you want. The AI will ask for any missing details. When you&apos;re done, click “I’m done” to see the summary and continue to the form.
      </p>
      <p className="text-xs text-[#5A5D63] italic">
        Tip: If voice input fails (e.g. network), type your description instead.
      </p>

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
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#8DDB90]/20 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-[#09391C]" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2 text-sm ${
                  msg.role === "user" ? "bg-[#09391C] text-white" : "bg-gray-100 text-[#09391C]"
                }`}
              >
                {msg.role === "assistant" && (msg as { missingFields?: string[]; formatHint?: string }).missingFields?.length ? (
                  <>
                    <p>{msg.content}</p>
                    <p className="font-medium mt-2">I still need:</p>
                    <ul className="list-disc list-inside mt-1 space-y-0.5 ml-1">
                      {(msg as { missingFields: string[] }).missingFields.map((f, j) => (
                        <li key={j}>{f}</li>
                      ))}
                    </ul>
                    <p className="mt-2">Please provide these so we can match you with the right properties.{(msg as { formatHint?: string }).formatHint}</p>
                  </>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
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
