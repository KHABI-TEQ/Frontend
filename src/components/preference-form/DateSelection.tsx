/** @format */

"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  memo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
  control: (provided: Record<string, unknown>, state: { isFocused: boolean }) => ({
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
  valueContainer: (provided: Record<string, unknown>) => ({
    ...provided,
    padding: "8px 12px",
    fontSize: "14px",
  }),
  placeholder: (provided: Record<string, unknown>) => ({
    ...provided,
    color: "#9CA3AF",
    fontSize: "14px",
  }),
  option: (provided: Record<string, unknown>, state: { isSelected: boolean; isFocused: boolean }) => ({
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

// Custom DatePicker Input Component
const CustomDateInput = forwardRef<
  HTMLInputElement,
  {
    value?: string;
    onClick?: () => void;
    placeholder?: string;
    hasError?: boolean;
    [key: string]: unknown;
  }
>(({ value, onClick, placeholder, hasError, ...props }, ref) => (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="relative group"
    >
      <input
        {...(props as any)}
        ref={ref}
        value={value as string}
        onClick={onClick as React.MouseEventHandler<HTMLInputElement>}
        placeholder={placeholder as string}
        readOnly
        className={`w-full px-6 py-4 text-base border-2 rounded-xl bg-white transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer ${
          hasError
            ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
            : value
              ? "border-emerald-500 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-200"
              : "border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 hover:border-emerald-300"
        }`}
      />
      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
        <motion.div
          className={`p-1 rounded-lg transition-all duration-200 ${
            value ? "bg-emerald-100" : "bg-gray-100"
          }`}
          animate={{
            backgroundColor: value ? "#DCFCE7" : "#F3F4F6",
            scale: value ? 1.1 : 1,
          }}
        >
          <svg
            className={`w-4 h-4 transition-colors duration-200 ${
              value ? "text-emerald-600" : "text-gray-400"
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
        </motion.div>
      </div>
    </motion.div>
  ),
);

CustomDateInput.displayName = "CustomDateInput";

const DateSelection: React.FC<DateSelectionProps> = memo(
  ({ className = "" }) => {
    const { state, updateFormData, getValidationErrorsForField } =
      usePreferenceForm();

    const [checkInDate, setCheckInDate] = useState<Date | null>(null);
    const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
    const [numberOfNights, setNumberOfNights] = useState<number>(0);
    const [preferredCheckInTime, setPreferredCheckInTime] = useState<any>(null);
    const [preferredCheckOutTime, setPreferredCheckOutTime] =
      useState<any>(null);

    // Get validation errors
    const checkInErrors = getValidationErrorsForField(
      "bookingDetails.checkInDate",
    );
    const checkOutErrors = getValidationErrorsForField(
      "bookingDetails.checkOutDate",
    );

    // Initialize from context data and reset when form is cleared
    useEffect(() => {
      const formData = state.formData as any;

      // Reset all fields if form data is empty (form was reset)
      if (!formData || Object.keys(formData).length === 0) {
        setCheckInDate(null);
        setCheckOutDate(null);
        setNumberOfNights(0);
        setPreferredCheckInTime(null);
        setPreferredCheckOutTime(null);
        return;
      }

      if (formData.bookingDetails) {
        const checkIn = formData.bookingDetails.checkInDate;
        const checkOut = formData.bookingDetails.checkOutDate;

        if (checkIn) setCheckInDate(new Date(checkIn));
        if (checkOut) setCheckOutDate(new Date(checkOut));
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
        const timeDifference = checkOutDate.getTime() - checkInDate.getTime();
        const dayDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
        setNumberOfNights(dayDifference > 0 ? dayDifference : 0);
      } else {
        setNumberOfNights(0);
      }
    }, [checkInDate, checkOutDate]);

    // Optimized update context when values change with debouncing
    useEffect(() => {
      const timeoutId = setTimeout(() => {
        const currentBookingDetails =
          (state.formData as any).bookingDetails || {};
        const currentContactInfo = (state.formData as any).contactInfo || {};

        const newBookingDetails = {
          ...currentBookingDetails,
          checkInDate: checkInDate
            ? checkInDate.toISOString().split("T")[0]
            : "",
          checkOutDate: checkOutDate
            ? checkOutDate.toISOString().split("T")[0]
            : "",
        };

        const newContactInfo = {
          ...currentContactInfo,
          preferredCheckInTime: preferredCheckInTime?.value || "",
          preferredCheckOutTime: preferredCheckOutTime?.value || "",
        };

        // Only update if there are actual changes
        const hasBookingChanges =
          JSON.stringify(currentBookingDetails) !==
          JSON.stringify(newBookingDetails);
        const hasContactChanges =
          JSON.stringify(currentContactInfo) !== JSON.stringify(newContactInfo);

        if (hasBookingChanges || hasContactChanges) {
          updateFormData({
            bookingDetails: newBookingDetails,
            contactInfo: newContactInfo,
          });
        }
      }, 300); // Debounce updates

      return () => clearTimeout(timeoutId);
    }, [
      checkInDate,
      checkOutDate,
      preferredCheckInTime,
      preferredCheckOutTime,
      updateFormData,
      state.formData.bookingDetails,
      state.formData.contactInfo,
    ]);

    // Handle check-in date change
    const handleCheckInChange = useCallback(
      (date: Date | null) => {
        setCheckInDate(date);

        // Auto-adjust check-out date if it's before new check-in date
        if (checkOutDate && date && checkOutDate <= date) {
          const nextDay = new Date(date);
          nextDay.setDate(nextDay.getDate() + 1);
          setCheckOutDate(nextDay);
        }
      },
      [checkOutDate],
    );

    // Handle check-out date change
    const handleCheckOutChange = useCallback((date: Date | null) => {
      setCheckOutDate(date);
    }, []);

    // Quick selection options
    const quickSelections = [
      { label: "1 Night", nights: 1, icon: "🌙" },
      { label: "2 Nights", nights: 2, icon: "🌛" },
      { label: "3 Nights", nights: 3, icon: "���" },
      { label: "1 Week", nights: 7, icon: "📅" },
      { label: "2 Weeks", nights: 14, icon: "🗓️" },
      { label: "1 Month", nights: 30, icon: "📊" },
    ];

    // Handle quick selection
    const handleQuickSelection = useCallback(
      (nights: number) => {
        if (!checkInDate) {
          // Set check-in to today if not set
          const today = new Date();
          setCheckInDate(today);

          // Set check-out based on nights
          const checkOut = new Date(today);
          checkOut.setDate(checkOut.getDate() + nights);
          setCheckOutDate(checkOut);
        } else {
          // Set check-out based on existing check-in
          const checkOut = new Date(checkInDate);
          checkOut.setDate(checkOut.getDate() + nights);
          setCheckOutDate(checkOut);
        }
      },
      [checkInDate],
    );

    // Format date for display
    const formatDisplayDate = useCallback((date: Date | null) => {
      if (!date) return "";
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }, []);

    // Check if dates are valid
    const areDatesValid =
      checkInDate && checkOutDate && checkOutDate > checkInDate;

    return (
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Select Your Dates
          </h3>
          <p className="text-sm text-gray-600">
            Choose your check-in and check-out dates with time preferences
          </p>
        </motion.div>

        {/* Enhanced Date Inputs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          {/* Quick Selection Options - Moved Above Date Inputs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-semibold text-gray-800 flex items-center">
              <span className="mr-2">⚡</span>
              Quick Selection
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {quickSelections.map((option, index) => (
                <motion.button
                  key={option.nights}
                  type="button"
                  onClick={() => handleQuickSelection(option.nights)}
                  className="px-3 py-2 text-xs font-medium border border-gray-300 rounded-lg bg-white hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm hover:shadow-md"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-base">{option.icon}</span>
                    <span>{option.label}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Date Selection */}
          <div className="w-full flex flex-col md:flex-row gap-5 justify-start items-start">
            {/* Check-in Date */}
            <div className="space-y-3 w-full">
              <label className="block text-sm font-semibold text-gray-800">
                Check-in Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                selected={checkInDate}
                className="w-full"
                onChange={handleCheckInChange}
                minDate={new Date()}
                placeholderText="Select check-in date"
                customInput={
                  <CustomDateInput hasError={checkInErrors.length > 0} />
                }
                dateFormat="MMMM d, yyyy"
                showPopperArrow={false}
                popperClassName="react-datepicker-popper"
                calendarClassName="react-datepicker-calendar"
              />
              <AnimatePresence>
                {checkInErrors.length > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
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
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="p-3 bg-emerald-50 rounded-lg border border-emerald-200"
                  >
                    <p className="text-sm font-medium text-emerald-800">
                      ✨ Check-in: {formatDisplayDate(checkInDate)}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Check-out Date */}
            <div className="space-y-3 w-full">
              <label className="block text-sm font-semibold text-gray-800">
                Check-out Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                className="w-full"
                selected={checkOutDate}
                onChange={handleCheckOutChange}
                minDate={
                  checkInDate
                    ? new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000)
                    : new Date()
                }
                disabled={!checkInDate}
                placeholderText={
                  checkInDate
                    ? "Select check-out date"
                    : "Select check-in first"
                }
                customInput={
                  <CustomDateInput hasError={checkOutErrors.length > 0} />
                }
                dateFormat="MMMM d, yyyy"
                showPopperArrow={false}
                popperClassName="react-datepicker-popper"
                calendarClassName="react-datepicker-calendar"
              />
              <AnimatePresence>
                {checkOutErrors.length > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
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
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="p-3 bg-emerald-50 rounded-lg border border-emerald-200"
                  >
                    <p className="text-sm font-medium text-emerald-800">
                      🏁 Check-out: {formatDisplayDate(checkOutDate)}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Time Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </motion.div>
        </motion.div>

        {/* Enhanced Date Summary */}
        <AnimatePresence>
          {areDatesValid && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl border-2 border-emerald-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <motion.h4
                  initial={{ x: -20 }}
                  animate={{ x: 0 }}
                  className="text-lg font-bold text-emerald-800 flex items-center"
                >
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
                </motion.h4>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="px-4 py-2 bg-emerald-100 rounded-full"
                >
                  <span className="text-sm font-bold text-emerald-700">
                    {numberOfNights} night{numberOfNights !== 1 ? "s" : ""}
                  </span>
                </motion.div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-2 h-2 bg-emerald-500 rounded-full"
                    ></motion.div>
                    <span className="text-sm font-medium text-emerald-800">
                      Check-in:
                    </span>
                  </div>
                  <p className="text-sm text-emerald-700 ml-4">
                    {formatDisplayDate(checkInDate)}
                    {preferredCheckInTime && (
                      <span className="block text-xs text-emerald-600 mt-1">
                        🕐 Preferred time: {preferredCheckInTime.label}
                      </span>
                    )}
                  </p>
                </motion.div>
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                      className="w-2 h-2 bg-teal-500 rounded-full"
                    ></motion.div>
                    <span className="text-sm font-medium text-emerald-800">
                      Check-out:
                    </span>
                  </div>
                  <p className="text-sm text-emerald-700 ml-4">
                    {formatDisplayDate(checkOutDate)}
                    {preferredCheckOutTime && (
                      <span className="block text-xs text-emerald-600 mt-1">
                        🕐 Preferred time: {preferredCheckOutTime.label}
                      </span>
                    )}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Booking Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm"
        >
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
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-start space-x-3"
              >
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Minimum Stay
                  </p>
                  <p className="text-xs text-gray-600">
                    1 night minimum booking
                  </p>
                </div>
              </motion.div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-start space-x-3"
              >
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Check-in Time
                  </p>
                  <p className="text-xs text-gray-600">Usually after 2:00 PM</p>
                </div>
              </motion.div>
            </div>
            <div className="space-y-3">
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-start space-x-3"
              >
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Check-out Time
                  </p>
                  <p className="text-xs text-gray-600">
                    Usually before 11:00 AM
                  </p>
                </div>
              </motion.div>
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="flex items-start space-x-3"
              >
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Confirmation
                  </p>
                  <p className="text-xs text-gray-600">
                    Exact times confirmed with owner
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Custom DatePicker Styles */}
        <style jsx global>{`
          .react-datepicker-popper {
            z-index: 9999;
          }

          .react-datepicker {
            border: 2px solid #10b981;
            border-radius: 12px;
            box-shadow:
              0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
            font-family: inherit;
          }

          .react-datepicker__header {
            background-color: #10b981;
            border-bottom: none;
            border-radius: 10px 10px 0 0;
          }

          .react-datepicker__current-month {
            color: white;
            font-weight: 600;
          }

          .react-datepicker__navigation {
            top: 12px;
          }

          .react-datepicker__navigation--previous {
            border-right-color: white;
          }

          .react-datepicker__navigation--next {
            border-left-color: white;
          }

          .react-datepicker__day-name {
            color: white;
            font-weight: 600;
          }

          .react-datepicker__day {
            border-radius: 8px;
            transition: all 0.2s ease;
          }

          .react-datepicker__day:hover {
            background-color: #dcfce7;
            color: #065f46;
          }

          .react-datepicker__day--selected {
            background-color: #10b981;
            color: white;
          }

          .react-datepicker__day--keyboard-selected {
            background-color: #34d399;
            color: white;
          }

          .react-datepicker__day--disabled {
            color: #d1d5db;
          }

          .react-datepicker__day--today {
            font-weight: 600;
            color: #10b981;
          }
        `}</style>
      </div>
    );
  },
);

DateSelection.displayName = "DateSelection";

export default DateSelection;
