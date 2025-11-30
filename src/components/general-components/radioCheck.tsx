"use client";

import React, { ChangeEventHandler, FC } from "react";

interface RadioCheckProps {
  id?: string;
  title?: string;
  value: string;
  name: string;
  type?: "radio" | "checkbox";
  isDisabled?: boolean;
  className?: string;
  handleChange?: ChangeEventHandler<HTMLInputElement>;
  isChecked?: boolean;
  selectedValue?: string;
  modifyStyle?: React.CSSProperties;
  onClick?: () => void;
  variant?: "default" | "card";
  error?: boolean;
  showLabel?: boolean;
}

const RadioCheck: FC<RadioCheckProps> = ({
  id,
  title,
  value,
  name,
  type = "radio",
  isDisabled,
  className,
  handleChange,
  isChecked,
  selectedValue,
  modifyStyle,
  onClick,
  variant = "default",
  error = false,
  showLabel = true,
}) => {
  const inputId = id ?? `${name}-${value}`;
  const isSelected =
    isChecked !== undefined ? isChecked : selectedValue === value;

  if (variant === "card") {
    return (
      <label
        title={title ?? value}
        htmlFor={inputId}
        className={`
          relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
          ${
            isSelected
              ? "border-[#8DDB90] bg-[#8DDB90]/10 text-[#09391C] shadow-sm"
              : error
                ? "border-red-500 hover:border-red-600 text-gray-700 bg-red-50/50"
                : "border-gray-200 hover:border-[#8DDB90]/50 text-gray-700 hover:bg-gray-50"
          }
          ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
          ${className || ""}
        `}
      >
        <div className="flex items-center w-full">
          <div className="relative flex-shrink-0 mr-3">
            <input
              id={inputId}
              type={type}
              name={name}
              disabled={isDisabled}
              checked={isSelected}
              onChange={handleChange}
              onClick={onClick}
              className="sr-only"
            />
            <div
              className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
              ${
                isSelected
                  ? "border-[#8DDB90] bg-[#8DDB90]"
                  : error
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
              }
            `}
            >
              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </div>
          <span style={modifyStyle} className="text-sm font-medium flex-1">
            {title || value}
          </span>
          {isSelected && (
            <div className="ml-2 text-[#8DDB90]">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
      title={title ?? value}
      htmlFor={inputId}
      className={`
        flex items-center cursor-pointer transition-all duration-200 group
        ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"}
        ${className || ""}
      `}
    >
      <div className="relative flex-shrink-0 mr-3">
        <input
          id={inputId}
          type={type}
          name={name}
          disabled={isDisabled}
          checked={isSelected}
          onChange={handleChange}
          onClick={onClick}
          className="sr-only"
        />
        <div
          className={`
          w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200
          ${
            isSelected
              ? "border-[#8DDB90] bg-[#8DDB90] shadow-sm"
              : error
                ? "border-red-500 bg-red-50 group-hover:border-red-600"
                : "border-gray-300 group-hover:border-[#8DDB90]"
          }
        `}
        >
          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
        </div>
      </div>
      {showLabel && (
        <span
          style={modifyStyle}
          className={`
              text-base font-medium transition-colors duration-200
              ${isSelected ? "text-[#09391C]" : "text-gray-700"}
              ${isDisabled ? "" : "group-hover:text-[#09391C]"}
            `}
        >
          {title || value}
        </span>
      )}
    </label>
  );
};

export default RadioCheck;
