"use client";

import React from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-16 text-center">
      {/* Icon */}
      <div className="mb-6">
        {icon ? (
          icon
        ) : (
          <div className="w-16 h-16 md:w-20 md:h-20 bg-[#F5F7F9] rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 md:w-10 md:h-10 text-[#C7CAD0]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg md:text-xl font-semibold text-[#09391C] mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm md:text-base text-[#5A5D63] max-w-md mx-auto mb-6">
        {description}
      </p>

      {/* Action Button */}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-[#8DDB90] hover:bg-[#7BC87F] text-white font-semibold rounded-lg transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
