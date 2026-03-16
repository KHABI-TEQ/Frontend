"use client";

import React from "react";
import { usePostPropertyContext } from "@/context/post-property-context";
import { Sparkles, FileEdit } from "lucide-react";

export default function PropertyPostModeSelector() {
  const { setPostingMode, setAiFlowStep } = usePostPropertyContext();

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8">
      <h2 className="text-lg font-semibold text-[#09391C] mb-2">How would you like to add your property?</h2>
      <p className="text-sm text-[#5A5D63] mb-6">
        Use AI to describe your property in conversation, or fill the form manually.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => { setPostingMode("ai"); setAiFlowStep("conversation"); }}
          className="flex flex-col items-center gap-3 rounded-xl border-2 border-[#8DDB90] bg-[#f0fdf4]/60 p-6 text-left hover:bg-[#dcfce7] hover:border-[#7BC87F] transition-colors"
        >
          <div className="p-3 rounded-full bg-[#8DDB90]/20">
            <Sparkles className="h-8 w-8 text-[#09391C]" />
          </div>
          <span className="font-semibold text-[#09391C]">Use AI</span>
          <span className="text-sm text-[#5A5D63] text-center">
            Describe your property in your own words. The AI will ask for any missing details until everything is ready.
          </span>
        </button>
        <button
          type="button"
          onClick={() => setPostingMode("manual")}
          className="flex flex-col items-center gap-3 rounded-xl border-2 border-gray-200 bg-gray-50/50 p-6 text-left hover:bg-gray-100 hover:border-gray-300 transition-colors"
        >
          <div className="p-3 rounded-full bg-gray-200">
            <FileEdit className="h-8 w-8 text-[#5A5D63]" />
          </div>
          <span className="font-semibold text-[#09391C]">Fill form manually</span>
          <span className="text-sm text-[#5A5D63] text-center">
            Complete each section of the form step by step.
          </span>
        </button>
      </div>
    </div>
  );
}
