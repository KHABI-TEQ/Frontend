"use client";

import { Fragment } from "react";

interface DateTimeSelectorProps {
  heading: "Select Date" | "Select Time" | "Counter Date" | "Counter Time";
  value: string;
  id: string;
  name: string;
  onClick?: () => void;
  onChange?: (value: string) => void;
  type?: "date" | "time" | "text";
  min?: string;
  max?: string;
  disabled?: boolean;
}

export const DateTimeSelector = ({
  id,
  heading,
  value,
  name,
  onClick,
  onChange,
  type = "text",
  min,
  max,
  disabled = false,
}: DateTimeSelectorProps) => {
  // Determine input type based on heading if not explicitly provided
  const getInputType = () => {
    if (type !== "text") return type;
    if (heading.toLowerCase().includes("date")) return "date";
    if (heading.toLowerCase().includes("time")) return "time";
    return "text";
  };

  const inputType = getInputType();

  // Format value for different input types
  const getFormattedValue = () => {
    if (!value) return "";

    if (inputType === "date") {
      // If value is in format like "MMM d, yyyy", convert to YYYY-MM-DD
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split("T")[0];
        }
      } catch (e) {
        console.error("Date parsing error:", e);
      }
    }

    if (inputType === "time") {
      // If value is in format like "2:00 PM", convert to 24-hour format HH:MM
      if (value.includes("AM") || value.includes("PM")) {
        try {
          const [time, period] = value.split(/\s+(AM|PM)/i);
          const [hours, minutes] = time.split(":");
          let hour24 = parseInt(hours);

          if (period.toUpperCase() === "PM" && hour24 !== 12) {
            hour24 += 12;
          } else if (period.toUpperCase() === "AM" && hour24 === 12) {
            hour24 = 0;
          }

          return `${hour24.toString().padStart(2, "0")}:${minutes.padStart(2, "0")}`;
        } catch (e) {
          console.error("Time parsing error:", e);
        }
      }
    }

    return value;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      let newValue = e.target.value;

      // Convert back to display format if needed
      if (inputType === "time" && newValue) {
        try {
          const [hours, minutes] = newValue.split(":");
          const hour12 = parseInt(hours);
          const period = hour12 >= 12 ? "PM" : "AM";
          const displayHour =
            hour12 === 0 ? 12 : hour12 > 12 ? hour12 - 12 : hour12;
          newValue = `${displayHour}:${minutes} ${period}`;
        } catch (e) {
          console.error("Time conversion error:", e);
        }
      }

      if (inputType === "date" && newValue) {
        try {
          const date = new Date(newValue);
          if (!isNaN(date.getTime())) {
            newValue = date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
          }
        } catch (e) {
          console.error("Date conversion error:", e);
        }
      }

      onChange(newValue);
    }
  };

  // Set minimum date to today for date inputs
  const getMinDate = () => {
    if (inputType === "date" && !min) {
      return new Date().toISOString().split("T")[0];
    }
    return min;
  };

  const getMaxDate = () => {
    if (inputType === "date" && !max) {
      // Set max date to 30 days from now
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 30);
      return maxDate.toISOString().split("T")[0];
    }
    return max;
  };

  return (
    <Fragment>
      <label htmlFor={id} className="flex flex-col gap-[4px]">
        <h5 className="text-base font-medium text-[#1E1E1E]">{heading}</h5>
        <input
          id={id}
          type={inputType}
          value={getFormattedValue()}
          name={name}
          min={getMinDate()}
          max={getMaxDate()}
          disabled={disabled}
          onClick={onClick}
          onChange={handleChange}
          className={`w-[183px] py-[16px] px-[12px] bg-[#FAFAFA] border-[1px] border-[#D6DDEB] text-base text-[#000000] font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            disabled
              ? "cursor-not-allowed opacity-50"
              : onClick && !onChange
                ? "cursor-pointer"
                : "cursor-text"
          }`}
          placeholder={
            inputType === "date"
              ? "Select date"
              : inputType === "time"
                ? "Select time"
                : "Enter value"
          }
        />
      </label>
    </Fragment>
  );
};
