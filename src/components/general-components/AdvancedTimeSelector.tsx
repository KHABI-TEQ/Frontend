"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "lucide-react";

interface AdvancedTimeSelectorProps {
  value: string;
  onChange: (time: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
  disabled?: boolean;
}

const AdvancedTimeSelector: React.FC<AdvancedTimeSelectorProps> = ({
  value,
  onChange,
  placeholder = "Select time",
  className = "",
  error = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState("");
  const [selectedMinute, setSelectedMinute] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse the time value on component mount and when value changes
  useEffect(() => {
    if (value) {
      const [hour, minute] = value.split(":");
      setSelectedHour(hour);
      setSelectedMinute(minute);
    } else {
      // Reset state when value is cleared
      setSelectedHour("");
      setSelectedMinute("");
    }
  }, [value]);

  // Generate hours (00-23)
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );

  // Generate minutes (00-59 in 15-minute intervals)
  const minutes = ["00", "15", "30", "45"];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleHourSelect = (hour: string) => {
    setSelectedHour(hour);
    const newTime = `${hour}:${selectedMinute || "00"}`;
    onChange(newTime);
    // Don't close dropdown yet, let user select minute
  };

  const handleMinuteSelect = (minute: string) => {
    setSelectedMinute(minute);
    const newTime = `${selectedHour || "00"}:${minute}`;
    onChange(newTime);
    // Close dropdown after minute selection
    setIsOpen(false);
  };

  const formatDisplayTime = () => {
    if (!selectedHour || !selectedMinute) return "";

    const hour24 = parseInt(selectedHour);
    const isPM = hour24 >= 12;
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;

    return `${hour12}:${selectedMinute} ${isPM ? "PM" : "AM"}`;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full p-3 border rounded-lg text-left flex items-center justify-between focus:ring-2 focus:ring-[#8DDB90] focus:border-[#8DDB90] transition-all ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
            : value
              ? "border-green-500 hover:border-green-600"
              : "border-[#C7CAD0] hover:border-[#8DDB90]"
        } ${
          disabled
            ? "bg-gray-50 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-900 cursor-pointer"
        }`}
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value ? formatDisplayTime() : placeholder}
        </span>
        <ChevronDownIcon
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Instructions */}
          <div className="p-2 bg-blue-50 text-xs text-blue-600 border-b border-gray-200">
            Select hour first, then minute. Use quick select for common times.
          </div>
          <div className="flex">
            {/* Hours column */}
            <div className="w-1/2 border-r border-gray-200">
              <div className="p-2 bg-gray-50 text-sm font-medium text-gray-700 border-b border-gray-200">
                Hour
              </div>
              <div className="max-h-48 overflow-y-auto">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => handleHourSelect(hour)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${
                      selectedHour === hour
                        ? "bg-[#8DDB90] text-white hover:bg-[#7BC87F]"
                        : "text-gray-700"
                    }`}
                  >
                    {parseInt(hour) === 0
                      ? "12 AM"
                      : parseInt(hour) < 12
                        ? `${parseInt(hour)} AM`
                        : parseInt(hour) === 12
                          ? "12 PM"
                          : `${parseInt(hour) - 12} PM`}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes column */}
            <div className="w-1/2">
              <div className="p-2 bg-gray-50 text-sm font-medium text-gray-700 border-b border-gray-200">
                Minute
              </div>
              <div className="max-h-48 overflow-y-auto">
                {minutes.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => handleMinuteSelect(minute)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${
                      selectedMinute === minute
                        ? "bg-[#8DDB90] text-white hover:bg-[#7BC87F]"
                        : "text-gray-700"
                    }`}
                  >
                    {minute}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick select presets */}
          <div className="border-t border-gray-200 p-2 bg-gray-50">
            <div className="text-xs font-medium text-gray-600 mb-1">
              Quick Select:
            </div>
            <div className="flex gap-1 flex-wrap">
              {[
                { label: "9 AM", value: "09:00" },
                { label: "11 AM", value: "11:00" },
                { label: "12 PM", value: "12:00" },
                { label: "3 PM", value: "15:00" },
                { label: "6 PM", value: "18:00" },
              ].map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => {
                    onChange(preset.value);
                    setIsOpen(false);
                  }}
                  className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedTimeSelector;
