/** @format */

"use client";
import React from "react";
import { useRouter } from "next/navigation";

interface EmptyStateProps {
  tab: "buy" | "jv" | "rent" | "shortlet";
}

const EmptyState: React.FC<EmptyStateProps> = ({ tab }) => {
  const router = useRouter();

  const getTabDisplayName = () => {
    switch (tab) {
      case "buy":
        return "buy";
      case "jv":
        return "joint venture";
      case "rent":
        return "rent/lease";
      default:
        return "properties";
    }
  };

  const getTabMessage = () => {
    switch (tab) {
      case "buy":
        return "We couldn't find any properties for sale matching your criteria.";
      case "jv":
        return "We couldn't find any joint venture opportunities matching your criteria.";
      case "rent":
        return "We couldn't find any rental properties matching your criteria.";
      default:
        return "We couldn't find any properties matching your criteria.";
    }
  };

  const getTabSuggestion = () => {
    switch (tab) {
      case "buy":
        return "Try adjusting your search filters or share your buying preferences with us.";
      case "jv":
        return "Try adjusting your search filters or share your investment preferences with us.";
      case "rent":
        return "Try adjusting your search filters or share your rental preferences with us.";
      default:
        return "Try adjusting your search filters or share your preferences with us.";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Icon */}
      <div className="w-24 h-24 mb-6 bg-[#F5F5F5] rounded-full flex items-center justify-center">
        <svg
          className="w-12 h-12 text-[#9CA3AF]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-[#374151] mb-2">
        No Properties Found
      </h3>

      {/* Message */}
      <p className="text-[#6B7280] mb-4 max-w-md">{getTabMessage()}</p>

      {/* Suggestion */}
      <p className="text-[#6B7280] mb-8 max-w-md text-sm">
        {getTabSuggestion()}
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-[#8DDB90] text-white rounded-lg font-semibold hover:bg-[#76c77a] transition-colors"
        >
          Refresh Search
        </button>
        <button
          onClick={() => router.push("/preference")}
          className="px-6 py-3 bg-transparent border-2 border-[#09391C] text-[#09391C] rounded-lg font-semibold hover:bg-[#09391C] hover:text-white transition-colors"
        >
          Share Your Preferences
        </button>
      </div>

      {/* Additional Help */}
      <div className="mt-8 text-sm text-[#6B7280]">
        <p>
          Need help?{" "}
          <span className="text-[#8DDB90] hover:underline cursor-pointer">
            Contact our support team
          </span>
        </p>
      </div>
    </div>
  );
};

export default EmptyState;
