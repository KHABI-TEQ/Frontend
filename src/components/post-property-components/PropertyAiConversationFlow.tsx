"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { usePostPropertyContext } from "@/context/post-property-context";
import { suggestProperty } from "@/services/aiFormService";
import AiFillBlock from "@/components/ai-form-fill/AiFillBlock";
import PropertyAiDataSummary from "./PropertyAiDataSummary";
import { mergeSuggestPropertyIntoForm } from "@/utils/aiSuggestPropertyMerge";
import { pickAiComplimentPrefix } from "@/utils/aiComplimentPrefix";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { ArrowLeft, MessageSquare, Bot, Loader2, Volume2, VolumeX } from "lucide-react";

function fieldLabelOnly(field: string): string {
  return field.replace(/\s*\([^)]*\)\s*$/, "").trim() || field;
}

function getShortFormatForPropertyField(field: string): string {
  const s = field.toLowerCase();
  const rules: { test: (x: string) => boolean; format: string }[] = [
    { test: (x) => x.includes("local government") || x.includes("lga"), format: "e.g. Ikeja" },
    { test: (x) => x.includes("location") && x.includes("state"), format: "state, area, LGA — e.g. Lagos, Lekki, Ikeja" },
    { test: (x) => x.includes("property type") && x.includes("sale"), format: "sale | rent | shortlet | joint venture" },
    { test: (x) => x.includes("property category"), format: "Residential | Commercial | Land" },
    { test: (x) => x.includes("price"), format: "Naira number no commas e.g. 50000000" },
    { test: (x) => x.includes("description"), format: "one or two short sentences" },
    { test: (x) => x.includes("bathrooms") && x.includes("toilets"), format: "counts e.g. 2 bathrooms 2 toilets" },
    { test: (x) => x.includes("bathroom"), format: "integer" },
    { test: (x) => x.includes("toilet"), format: "integer" },
    { test: (x) => x.includes("bedroom"), format: "integer e.g. 3" },
    { test: (x) => x.includes("property condition"), format: "new | fairly used | renovated …" },
    { test: (x) => x.includes("type of building"), format: "flat | duplex | terrace | detached …" },
    { test: (x) => x.includes("parking"), format: "number or none" },
    { test: (x) => x.includes("document") || x.includes("title"), format: "comma list C of O Survey plan …" },
    { test: (x) => x.includes("measurement type"), format: "Square Meter | Plot | Hectares …" },
    { test: (x) => x.includes("land size") && x.includes("numeric"), format: "number e.g. 500" },
    { test: (x) => x.includes("features"), format: "comma list parking generator security …" },
  ];
  const hit = rules.find((r) => r.test(s));
  return hit ? hit.format : "short text or number";
}

/** Returns plain text suitable for TTS from an assistant message (Web Speech API — SpeechSynthesis). */
function getSpeakableAssistantText(msg: { content: string; missingFields?: string[] }): string {
  if (!msg.missingFields?.length) return msg.content;
  const lines = msg.missingFields.map(
    (f) => `${fieldLabelOnly(f)}. Format: ${getShortFormatForPropertyField(f)}`,
  );
  return `${msg.content} Still need: ${lines.join(". ")}`;
}

/** Returns true only if the value is non-empty and meaningful (not placeholder) */
function isMeaningful(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return !Number.isNaN(value) && value > 0;
  if (Array.isArray(value)) return value.length > 0;
  return false;
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

function getMissingFieldsFromData(data: Record<string, unknown>): string[] {
  const missing: string[] = [];

  const propertyType = data.propertyType;
  if (!isMeaningful(propertyType)) {
    missing.push("property type (e.g. sale, rent, shortlet, joint venture)");
  }

  const propertyCategory = data.propertyCategory;
  if (!isMeaningful(propertyCategory)) {
    missing.push("property category (e.g. Residential, Commercial, Land)");
  }

  const loc = data.location as Record<string, unknown> | undefined;
  const hasState = loc && isMeaningful(loc.state);
  const hasArea = loc && isMeaningful(loc.area);
  const hasLga = loc && isMeaningful(loc.localGovernment);
  if (!hasState && !hasArea && !hasLga) {
    missing.push("location (state, area, and local government / LGA)");
  } else if (!hasLga) {
    missing.push("local government / LGA (required by the form)");
  }

  const price = data.price;
  const priceOk =
    typeof price === "number" && price > 0 ||
    (typeof price === "string" && price.trim() !== "" && Number(price.replace(/\D/g, "")) > 0);
  if (!priceOk) {
    missing.push("price (in Naira)");
  }

  const description = data.description;
  if (!isMeaningful(description)) {
    missing.push("description of the property");
  }

  const add = data.additionalFeatures as Record<string, unknown> | undefined;
  const bedrooms = add && (typeof add.noOfBedroom === "number" || add.noOfBedroom !== undefined) ? Number(add.noOfBedroom) : undefined;
  const bathrooms = add && (typeof add.noOfBathroom === "number" || add.noOfBathroom !== undefined) ? Number(add.noOfBathroom) : undefined;
  const toilets = add && (typeof add.noOfToilet === "number" || add.noOfToilet !== undefined) ? Number(add.noOfToilet) : undefined;
  const hasBedrooms = typeof bedrooms === "number" && bedrooms >= 0;
  const hasBathrooms = typeof bathrooms === "number" && bathrooms >= 0;
  const hasToilets = typeof toilets === "number" && toilets >= 0;
  if (hasBedrooms && (!hasBathrooms || !hasToilets)) {
    if (!hasBathrooms && !hasToilets) {
      missing.push("number of bathrooms and toilets");
    } else if (!hasBathrooms) {
      missing.push("number of bathrooms");
    } else {
      missing.push("number of toilets");
    }
  }

  const propertyCondition = data.propertyCondition;
  if (!isMeaningful(propertyCondition)) {
    missing.push("property condition (e.g. new, fairly used, renovated)");
  }

  const typeOfBuilding = data.typeOfBuilding;
  if (!isMeaningful(typeOfBuilding)) {
    missing.push("type of building (e.g. flat, duplex, terrace, detached house)");
  }

  if (!hasBedrooms && (hasBathrooms || hasToilets)) {
    missing.push("number of bedrooms");
  }
  const isResidential = isMeaningful(propertyCategory) &&
    String(propertyCategory).toLowerCase().includes("residential");
  if (isResidential && !hasBedrooms && !hasBathrooms && !hasToilets) {
    missing.push("number of bedrooms, bathrooms, and toilets");
  }

  const parking = add && (add.noOfCarPark !== undefined || add.parkingSpaces !== undefined)
    ? Number(add.noOfCarPark ?? add.parkingSpaces) : undefined;
  const hasParking = typeof parking === "number" && parking >= 0;
  if (!hasParking && (hasBedrooms || isMeaningful(propertyCategory))) {
    missing.push("parking (number of spaces or none)");
  }

  const documents = data.documents ?? data.docOnProperty;
  const docList = Array.isArray(documents) ? documents : [];
  const docNames = docList.map((d) => (typeof d === "string" ? d : (d as { docName?: string })?.docName)).filter(Boolean);
  const hasDocuments = docNames.length > 0;
  if (!hasDocuments) {
    missing.push("property documents / title (e.g. C of O, governor's consent)");
  }

  const landSizeObj = data.landSize as { measurementType?: string; size?: number } | undefined;
  const landSizeType = isMeaningful(landSizeObj?.measurementType);
  const landSizeNum = landSizeObj?.size != null && typeof landSizeObj.size === "number" && !Number.isNaN(landSizeObj.size);
  const landSizeFromAdd = add && (add.landSize !== undefined || add.plotSize !== undefined);
  if (!landSizeType || !landSizeNum) {
    if (!landSizeType && !landSizeFromAdd) {
      missing.push("land size measurement type (e.g. Square Meter, Plot, Hectares)");
    }
    if (!landSizeNum && !landSizeFromAdd) {
      missing.push("land size (numeric value, e.g. 500)");
    }
  }

  const features = data.features;
  const hasFeatures = Array.isArray(features) && features.length > 0;
  if (!hasFeatures) {
    missing.push("key features (e.g. parking, generator, security, water supply)");
  }

  return missing;
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
  /** Default on: speak each assistant reply automatically; user can mute via toggle or stop via speaker icon. */
  const [playRepliesAloud, setPlayRepliesAloud] = useState(true);
  const prevMessageCountRef = useRef(0);
  const { speak, stop, speaking } = useSpeechSynthesis({ lang: "en-NG", rate: 0.95 });

  const handleSend = useCallback(async (textOverride: string) => {
    const trimmed = textOverride.toString().trim();
    if (!trimmed) {
      toast.error("Please enter or say something.");
      return;
    }
    setLoading(true);
    setAiConversationMessages((prev) => [...prev, { role: "user", content: trimmed }]);

    try {
      const accumulated = [...aiConversationMessages, { role: "user", content: trimmed }]
        .filter((m) => m.role === "user")
        .map((m) => m.content)
        .join(". ");
      const res = await suggestProperty(accumulated || trimmed, Cookies.get("token") ?? "");
      if (!res.success) {
        setAiConversationMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.message || "Could not get suggestions. Please try again or add more detail." },
        ]);
        return;
      }
      let data = (res.data || {}) as Record<string, unknown>;
      const lgaUser = extractLocalGovernmentFromText(trimmed);
      const lgaAccumulated = extractLocalGovernmentFromText(accumulated || trimmed);
      const parsedLga = lgaUser || lgaAccumulated;
      if (parsedLga) {
        const loc = (data.location || {}) as Record<string, unknown>;
        data = { ...data, location: { ...loc, localGovernment: parsedLga } };
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
      const missingFields = getMissingFieldsFromData(data);
      const hasMissing = missingFields.length > 0;
      const praise = pickAiComplimentPrefix();
      const assistantContent = hasMissing ? praise : `${praise}\n\nReady. Tap I'm done for summary.`;
      setAiCollectedData(data);
      setAiConversationMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: assistantContent,
          data,
          missingFields: hasMissing ? missingFields : undefined,
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
  }, [aiConversationMessages, setAiConversationMessages, setAiCollectedData]);

  // Auto-play latest assistant reply when TTS is enabled (Web Speech API — SpeechSynthesis).
  useEffect(() => {
    const n = aiConversationMessages.length;
    if (n > prevMessageCountRef.current && aiConversationMessages[n - 1]?.role === "assistant" && playRepliesAloud) {
      speak(getSpeakableAssistantText(aiConversationMessages[n - 1] as { content: string; missingFields?: string[] }));
    }
    prevMessageCountRef.current = n;
  }, [aiConversationMessages, playRepliesAloud, speak]);

  const handleSuggest = useCallback(
    async (userInput: string) => {
      await handleSend(userInput.trim());
    },
    [handleSend]
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
    <div className="rounded-xl border border-[#8DDB90]/40 bg-[#f0fdf4]/60 p-4 md:p-6 space-y-4">
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
        Type or use the mic to describe your property. The AI will ask for any missing details. When you’re done, click “I’m done” to see the summary and continue to image upload.
      </p>
      <p className="text-xs text-[#5A5D63] italic">
        Tip: If voice input fails (e.g. network), type your description instead.
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
        {aiConversationMessages.length === 0 ? (
          <p className="text-sm text-[#5A5D63] italic">Start by describing your property below.</p>
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
                    onClick={() => (speaking ? stop() : speak(getSpeakableAssistantText(msg as { content: string; missingFields?: string[] })))}
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
                  msg.role === "user"
                    ? "bg-[#09391C] text-white"
                    : "bg-gray-100 text-[#09391C]"
                }`}
              >
                {msg.role === "assistant" && (msg as { missingFields?: string[] }).missingFields?.length ? (
                  <>
                    <p className="mb-2 whitespace-pre-line">{msg.content}</p>
                    <p className="text-xs font-semibold text-[#5A5D63] uppercase tracking-wide mb-1.5">Still need</p>
                    <ul className="space-y-2 text-sm">
                      {(msg as { missingFields: string[] }).missingFields.map((f, j) => (
                        <li key={j} className="border-l-2 border-[#8DDB90]/60 pl-2">
                          <span className="font-medium text-[#09391C]">{fieldLabelOnly(f)}</span>
                          <span className="text-[#5A5D63]"> — {getShortFormatForPropertyField(f)}</span>
                        </li>
                      ))}
                    </ul>
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
          placeholder="e.g. 3-bedroom in Lekki, Lagos, 85 million, with parking..."
          buttonLabel={loading ? "Sending…" : "Send"}
          onSuggest={handleSuggest}
          disabled={loading}
          maxHeight="80px"
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
