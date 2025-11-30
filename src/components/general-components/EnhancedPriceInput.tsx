"use client";

import React, { useState, useEffect, FC } from "react";

interface EnhancedPriceInputProps {
  name: string;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  className?: string;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  required?: boolean;
  description?: string;
}

const EnhancedPriceInput: FC<EnhancedPriceInputProps> = ({
  name,
  label,
  value,
  onChange,
  placeholder = "Enter amount",
  prefix = "₦",
  suffix,
  className,
  error,
  touched,
  disabled,
  required,
  description,
}) => {
  const [displayValue, setDisplayValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Format number with commas
  const formatNumber = (num: string | number) => {
    if (!num) return "";
    const numericValue = num.toString().replace(/[^0-9]/g, "");
    return numericValue ? Number(numericValue).toLocaleString() : "";
  };

  // Update display value when prop value changes
  useEffect(() => {
    const numericValue = value.toString().replace(/[^0-9]/g, "");
    setDisplayValue(formatNumber(numericValue));
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Remove all non-numeric characters
    const numericValue = inputValue.replace(/[^0-9]/g, "");

    // Update display value with formatting
    setDisplayValue(formatNumber(numericValue));

    // Pass raw numeric value to parent
    onChange(numericValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const hasError = error && touched;
  const hasValue = value && value.toString().replace(/[^0-9]/g, "") !== "";
  const isValid = hasValue && !hasError;

  return (
    <div className={`space-y-2 ${className || ""}`}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-[#707281]"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {description && <p className="text-xs text-gray-500">{description}</p>}

      <div className="relative">
        <div
          className={`
          relative flex items-center border-2 rounded-lg transition-all duration-200
                    ${
                      hasError
                        ? "border-red-500 focus-within:border-red-600"
                        : isFocused
                          ? isValid
                            ? "border-green-500 shadow-sm"
                            : "border-[#8DDB90] shadow-sm"
                          : isValid
                            ? "border-green-500 hover:border-green-600"
                            : required && !hasValue
                              ? "border-red-500 hover:border-red-600"
                              : "border-gray-200 hover:border-gray-300"
                    }
          ${disabled ? "bg-gray-50 opacity-60" : "bg-white"}
        `}
        >
          {prefix && (
            <div className="flex items-center pl-3 pr-1">
              <span
                className={`
                text-sm font-medium
                ${hasError ? "text-red-500" : "text-gray-600"}
              `}
              >
                {prefix}
              </span>
            </div>
          )}

          <input
            id={name}
            name={name}
            type="text"
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              flex-1 px-3 py-3 text-sm bg-transparent border-0 outline-none
              placeholder-gray-400 text-gray-900
              ${prefix ? "pl-1" : ""}
              ${suffix ? "pr-1" : ""}
              disabled:cursor-not-allowed
            `}
          />

          {suffix && (
            <div className="flex items-center pr-3 pl-1">
              <span
                className={`
                text-sm font-medium
                ${hasError ? "text-red-500" : "text-gray-600"}
              `}
              >
                {suffix}
              </span>
            </div>
          )}
        </div>

        {/* Error state indicator */}
        {hasError && (
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {hasError && (
        <p className="text-red-500 text-sm flex items-center">
          <svg
            className="w-4 h-4 mr-1 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}

      {/* Show formatted preview for large numbers */}
      {value &&
        !hasError &&
        Number(value.toString().replace(/[^0-9]/g, "")) >= 1000000 && (
          <p className="text-xs text-gray-500 flex items-center">
            <svg
              className="w-3 h-3 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            {prefix}
            {displayValue} {suffix}
          </p>
        )}
    </div>
  );
};

export default EnhancedPriceInput;
