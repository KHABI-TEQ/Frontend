"use client";

import React from "react";
import { usePreferenceForm } from "@/context/preference-form-context";
import { Sparkles, FileEdit, ArrowRight } from "lucide-react";

export default function PreferenceModeSelector() {
  const { setPreferenceEntryMode, setPreferenceAiFlowStep } = usePreferenceForm();

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8">
      <h2 className="text-lg font-semibold text-[#09391C] mb-2">
        How would you like to submit your property preference?
      </h2>
      <p className="text-sm text-[#5A5D63] mb-6">
        Describe what you&apos;re looking for using AI, or complete the form manually.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => {
            setPreferenceEntryMode("ai");
            setPreferenceAiFlowStep("conversation");
          }}
          className="group flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-[#8DDB90] bg-[#f0fdf4]/60 p-6 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#7BC87F] hover:bg-[#dcfce7] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8DDB90] focus-visible:ring-offset-2 active:scale-[0.99]"
        >
          <div className="p-3 rounded-full bg-[#8DDB90]/20">
            <Sparkles className="h-8 w-8 text-[#09391C]" />
          </div>
          <span className="font-semibold text-[#09391C]">Describe it with AI</span>
          <span className="text-sm text-[#5A5D63] text-center">
            Describe what you&apos;re looking for in your own words. AI will ask for any missing details needed to understand your preferences and help match you with suitable opportunities.
          </span>
          <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#09391C]/70 transition-colors group-hover:text-[#09391C]">
            Continue
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </button>
        <button
          type="button"
          onClick={() => setPreferenceEntryMode("manual")}
          className="group flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-gray-200 bg-gray-50/50 p-6 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:bg-gray-100 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8DDB90] focus-visible:ring-offset-2 active:scale-[0.99]"
        >
          <div className="p-3 rounded-full bg-gray-200">
            <FileEdit className="h-8 w-8 text-[#5A5D63]" />
          </div>
          <span className="font-semibold text-[#09391C]">Fill out the form manually</span>
          <span className="text-sm text-[#5A5D63] text-center">
            Complete each section of the preference form step by step.
          </span>
          <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#09391C]/70 transition-colors group-hover:text-[#09391C]">
            Continue
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </button>
      </div>
    </div>
  );
}
