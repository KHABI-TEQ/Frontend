"use client";

import React, { ChangeEventHandler, FC } from "react";

interface EnhancedCheckboxProps {
  id?: string;
  label: string;
  name?: string;
  isDisabled?: boolean;
  className?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  checked?: boolean;
  value?: string;
  error?: boolean;
  variant?: "default" | "card";
  description?: string;
}

const EnhancedCheckbox: FC<EnhancedCheckboxProps> = ({
  id,
  label,
  name,
  isDisabled,
  className,
  onChange,
  checked = false,
  value,
  error = false,
  variant = "default",
  description,
}) => {
  const inputId = id ?? `checkbox-${name}-${value || label}`;

  if (variant === "card") {
    return (
      <label
        htmlFor={inputId}
        className={`
          relative flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
          ${
            checked
              ? "border-[#8DDB90] bg-[#8DDB90]/10 text-[#09391C] shadow-sm"
              : error
                ? "border-red-500 hover:border-red-600 text-gray-700 bg-red-50/50"
                : "border-gray-200 hover:border-[#8DDB90]/50 text-gray-700 hover:bg-gray-50"
          }
          ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
          ${className || ""}
        `}
      >
        <div className="flex items-start w-full">
          <div className="relative flex-shrink-0 mr-3 mt-0.5">
            <input
              id={inputId}
              type="checkbox"
              name={name}
              value={value}
              disabled={isDisabled}
              checked={checked}
              onChange={onChange}
              className="sr-only"
            />
            <div
              className={`
              w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200
              ${
                checked
                  ? "border-[#8DDB90] bg-[#8DDB90]"
                  : error
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
              }
            `}
            >
              {checked && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium block">{label}</span>
            {description && (
              <span className="text-xs text-gray-500 mt-1 block">
                {description}
              </span>
            )}
          </div>
          {checked && (
            <div className="ml-2 text-[#8DDB90] mt-0.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>
      </label>
    );
  }

  // Default variant
  return (
    <label
      htmlFor={inputId}
      className={`
        flex items-start cursor-pointer transition-all duration-200 group
        ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"}
        ${className || ""}
      `}
    >
      <div className="relative flex-shrink-0 mr-3 mt-0.5">
        <input
          id={inputId}
          type="checkbox"
          name={name}
          value={value}
          disabled={isDisabled}
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div
          className={`
          w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200
          ${
            checked
              ? "border-[#8DDB90] bg-[#8DDB90] shadow-sm"
              : error
                ? "border-red-500 bg-red-50 group-hover:border-red-600"
                : "border-gray-300 group-hover:border-[#8DDB90]"
          }
        `}
        >
          {checked && (
            <svg
              className="w-3 h-3 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>
      <div className="flex-1">
        <span
          className={`
          text-sm font-medium transition-colors duration-200 block
          ${checked ? "text-[#09391C]" : "text-gray-700"}
          ${isDisabled ? "" : "group-hover:text-[#09391C]"}
        `}
        >
          {label}
        </span>
        {description && (
          <span className="text-xs text-gray-500 mt-1 block">
            {description}
          </span>
        )}
      </div>
    </label>
  );
};

export default EnhancedCheckbox;
