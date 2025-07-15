/** @format */

"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Select from "react-select";
import { usePreferenceForm } from "@/context/preference-form-context";

interface DateSelectionProps {
  className?: string;
}

// Check-in/out time options
const CHECK_TIMES = [
  { value: "08:00", label: "8:00 AM" },
  { value: "09:00", label: "9:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "13:00", label: "1:00 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "15:00", label: "3:00 PM" },
  { value: "16:00", label: "4:00 PM" },
  { value: "17:00", label: "5:00 PM" },
  { value: "18:00", label: "6:00 PM" },
  { value: "19:00", label: "7:00 PM" },
  { value: "20:00", label: "8:00 PM" },
  { value: "21:00", label: "9:00 PM" },
  { value: "22:00", label: "10:00 PM" },
];

// Custom select styles
const customSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    minHeight: "44px",
    border: state.isFocused ? "2px solid #10B981" : "1px solid #E5E7EB",
    borderRadius: "8px",
    backgroundColor: "#FFFFFF",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#10B981",
    },
    transition: "all 0.2s ease",
  }),
  valueContainer: (provided: any) => ({
    ...provided,
    padding: "8px 12px",
    fontSize: "14px",
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: "#9CA3AF",
    fontSize: "14px",
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#10B981"
      : state.isFocused
        ? "#F3F4F6"
        : "white",
    color: state.isSelected ? "white" : "#374151",
    padding: "10px 12px",
    fontSize: "14px",
  }),
};

const DateSelection: React.FC<DateSelectionProps> = ({ className = "" }) => {
  const { state, updateFormData, getValidationErrorsForField } =
    usePreferenceForm();

  const [checkInDate, setCheckInDate] = useState<string>("");
  const [checkOutDate, setCheckOutDate] = useState<string>("");
  const [numberOfNights, setNumberOfNights] = useState<number>(0);
  const [preferredCheckInTime, setPreferredCheckInTime] = useState<any>(null);
  const [preferredCheckOutTime, setPreferredCheckOutTime] = useState<any>(null);

  // Get validation errors
  const checkInErrors = getValidationErrorsForField(
    "bookingDetails.checkInDate",
  );
  const checkOutErrors = getValidationErrorsForField(
    "bookingDetails.checkOutDate",
  );

  // Initialize from context data
  useEffect(() => {
    const formData = state.formData as any;
    if (formData.bookingDetails) {
      setCheckInDate(formData.bookingDetails.checkInDate || "");
      setCheckOutDate(formData.bookingDetails.checkOutDate || "");
    }
    if (formData.contactInfo) {
      const checkInTime = formData.contactInfo.preferredCheckInTime;
      const checkOutTime = formData.contactInfo.preferredCheckOutTime;
      if (checkInTime) {
        setPreferredCheckInTime(
          CHECK_TIMES.find((t) => t.value === checkInTime) || null,
        );
      }
      if (checkOutTime) {
        setPreferredCheckOutTime(
          CHECK_TIMES.find((t) => t.value === checkOutTime) || null,
        );
      }
    }
  }, [state.formData]);

  // Calculate number of nights
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const timeDifference = checkOut.getTime() - checkIn.getTime();
      const dayDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
      setNumberOfNights(dayDifference > 0 ? dayDifference : 0);
    } else {
      setNumberOfNights(0);
    }
  }, [checkInDate, checkOutDate]);

  // Update context when values change
  useEffect(() => {
    const currentBookingDetails = (state.formData as any).bookingDetails || {};
    const currentContactInfo = (state.formData as any).contactInfo || {};

    updateFormData({
      bookingDetails: {
        ...currentBookingDetails,
        checkInDate,
        checkOutDate,
      },
      contactInfo: {
        ...currentContactInfo,
        preferredCheckInTime: preferredCheckInTime?.value || "",
        preferredCheckOutTime: preferredCheckOutTime?.value || "",
      },
    });
  }, [
    checkInDate,
    checkOutDate,
    preferredCheckInTime,
    preferredCheckOutTime,
    updateFormData,
  ]);

  // Get minimum date (today)
  const getMinDate = useCallback(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }, []);

  // Get minimum check-out date (day after check-in)
  const getMinCheckOutDate = useCallback(() => {
    if (!checkInDate) return getMinDate();

    const checkIn = new Date(checkInDate);
    checkIn.setDate(checkIn.getDate() + 1);
    return checkIn.toISOString().split("T")[0];
  }, [checkInDate, getMinDate]);

  // Handle check-in date change
  const handleCheckInChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newCheckInDate = e.target.value;
      setCheckInDate(newCheckInDate);

      // Auto-adjust check-out date if it's before new check-in date
      if (
        checkOutDate &&
        newCheckInDate &&
        new Date(checkOutDate) <= new Date(newCheckInDate)
      ) {
        const nextDay = new Date(newCheckInDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setCheckOutDate(nextDay.toISOString().split("T")[0]);
      }
    },
    [checkOutDate],
  );

  // Handle check-out date change
  const handleCheckOutChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCheckOutDate(e.target.value);
    },
    [],
  );

  // Quick selection options
  const quickSelections = [
    { label: "1 Night", nights: 1 },
    { label: "2 Nights", nights: 2 },
    { label: "3 Nights", nights: 3 },
    { label: "1 Week", nights: 7 },
    { label: "2 Weeks", nights: 14 },
    { label: "1 Month", nights: 30 },
  ];

  // Handle quick selection
  const handleQuickSelection = useCallback(
    (nights: number) => {
      if (!checkInDate) {
        // Set check-in to today if not set
        const today = new Date();
        const todayString = today.toISOString().split("T")[0];
        setCheckInDate(todayString);

        // Set check-out based on nights
        const checkOut = new Date(today);
        checkOut.setDate(checkOut.getDate() + nights);
        setCheckOutDate(checkOut.toISOString().split("T")[0]);
      } else {
        // Set check-out based on existing check-in
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + nights);
        setCheckOutDate(checkOut.toISOString().split("T")[0]);
      }
    },
    [checkInDate],
  );

  // Format date for display
  const formatDisplayDate = useCallback((dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  // Check if dates are valid
  const areDatesValid =
    checkInDate &&
    checkOutDate &&
    new Date(checkOutDate) > new Date(checkInDate);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Select Your Dates
        </h3>
        <p className="text-sm text-gray-600">
          Choose your check-in and check-out dates with time preferences
        </p>
      </div>

      {/* Advanced Date Inputs */}
      <div className="space-y-8">
        {/* Date Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Check-in Date */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-800">
              Check-in Date <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <input
                type="date"
                value={checkInDate}
                onChange={handleCheckInChange}
                min={getMinDate()}
                className={`w-full px-4 py-3 text-sm border-2 rounded-xl bg-white focus:ring-4 focus:ring-emerald-100 transition-all duration-300 shadow-sm hover:shadow-md ${
                  checkInErrors.length > 0
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : checkInDate
                      ? "border-emerald-400 focus:border-emerald-500"
                      : "border-gray-200 focus:border-emerald-400 hover:border-emerald-300"
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <div
                  className={`p-1 rounded-lg transition-colors duration-200 ${
                    checkInDate ? "bg-emerald-100" : "bg-gray-100"
                  }`}
                >
                  <svg
                    className={`w-4 h-4 transition-colors duration-200 ${
                      checkInDate ? "text-emerald-600" : "text-gray-400"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            {checkInErrors.length > 0 && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500 font-medium flex items-center space-x-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{checkInErrors[0].message}</span>
              </motion.p>
            )}
            {checkInDate && !checkInErrors.length && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-emerald-50 rounded-lg border border-emerald-200"
              >
                <p className="text-sm font-medium text-emerald-800">
                  Check-in: {formatDisplayDate(checkInDate)}
                </p>
              </motion.div>
            )}
          </div>

          {/* Check-out Date */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-800">
              Check-out Date <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <input
                type="date"
                value={checkOutDate}
                onChange={handleCheckOutChange}
                min={getMinCheckOutDate()}
                disabled={!checkInDate}
                className={`w-full px-4 py-3 text-sm border-2 rounded-xl bg-white focus:ring-4 focus:ring-emerald-100 transition-all duration-300 shadow-sm hover:shadow-md disabled:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-200 ${
                  checkOutErrors.length > 0
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : checkOutDate
                      ? "border-emerald-400 focus:border-emerald-500"
                      : "border-gray-200 focus:border-emerald-400 hover:border-emerald-300"
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <div
                  className={`p-1 rounded-lg transition-colors duration-200 ${
                    checkOutDate
                      ? "bg-emerald-100"
                      : !checkInDate
                        ? "bg-gray-50"
                        : "bg-gray-100"
                  }`}
                >
                  <svg
                    className={`w-4 h-4 transition-colors duration-200 ${
                      checkOutDate
                        ? "text-emerald-600"
                        : !checkInDate
                          ? "text-gray-300"
                          : "text-gray-400"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            {checkOutErrors.length > 0 && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500 font-medium flex items-center space-x-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{checkOutErrors[0].message}</span>
              </motion.p>
            )}
            {checkOutDate && !checkOutErrors.length && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-emerald-50 rounded-lg border border-emerald-200"
              >
                <p className="text-sm font-medium text-emerald-800">
                  Check-out: {formatDisplayDate(checkOutDate)}
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Time Preferences */}
        <div className="space-y-4">
          <h5 className="text-sm font-semibold text-gray-800 flex items-center">
            <svg
              className="w-4 h-4 mr-2 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Preferred Check-in & Check-out Times
          </h5>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Preferred Check-in Time
              </label>
              <Select
                options={CHECK_TIMES}
                value={preferredCheckInTime}
                onChange={setPreferredCheckInTime}
                placeholder="Select check-in time..."
                styles={customSelectStyles}
                isClearable
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Preferred Check-out Time
              </label>
              <Select
                options={CHECK_TIMES}
                value={preferredCheckOutTime}
                onChange={setPreferredCheckOutTime}
                placeholder="Select check-out time..."
                styles={customSelectStyles}
                isClearable
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Selection Options */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-800">Quick Selection</h4>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {quickSelections.map((option) => (
            <motion.button
              key={option.nights}
              type="button"
              onClick={() => handleQuickSelection(option.nights)}
              className="px-3 py-2 text-xs font-medium border border-gray-300 rounded-lg bg-white hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Enhanced Date Summary */}
      {areDatesValid && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-emerald-800 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
              Booking Summary
            </h4>
            <div className="px-3 py-1 bg-emerald-100 rounded-full">
              <span className="text-xs font-semibold text-emerald-700">
                {numberOfNights} night{numberOfNights !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm font-medium text-emerald-800">
                  Check-in:
                </span>
              </div>
              <p className="text-sm text-emerald-700 ml-4">
                {formatDisplayDate(checkInDate)}
                {preferredCheckInTime && (
                  <span className="block text-xs text-emerald-600 mt-1">
                    Preferred time: {preferredCheckInTime.label}
                  </span>
                )}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                <span className="text-sm font-medium text-emerald-800">
                  Check-out:
                </span>
              </div>
              <p className="text-sm text-emerald-700 ml-4">
                {formatDisplayDate(checkOutDate)}
                {preferredCheckOutTime && (
                  <span className="block text-xs text-emerald-600 mt-1">
                    Preferred time: {preferredCheckOutTime.label}
                  </span>
                )}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Booking Guidelines */}
      <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h4 className="text-base font-semibold text-gray-800">
            Booking Guidelines
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Minimum Stay
                </p>
                <p className="text-xs text-gray-600">1 night minimum booking</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Check-in Time
                </p>
                <p className="text-xs text-gray-600">Usually after 2:00 PM</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Check-out Time
                </p>
                <p className="text-xs text-gray-600">Usually before 11:00 AM</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Confirmation
                </p>
                <p className="text-xs text-gray-600">
                  Exact times confirmed with owner
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateSelection;
