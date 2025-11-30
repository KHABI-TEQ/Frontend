"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSecureNegotiation } from "@/context/secure-negotiations-context";
import { motion } from "framer-motion";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiCheckCircle,
  FiEdit3,
  FiChevronDown,
  FiAlertTriangle,
  FiX,
} from "react-icons/fi";
import StandardPreloader from "@/components/new-marketplace/StandardPreloader";
import toast from "react-hot-toast";

interface InspectionDateTimeStepProps {
  userType: "seller" | "buyer";
  negotiationAction?: {
    type: "accept" | "counter" | "reject";
    counterPrice?: number;
    loiFile?: File;
    rejectReason?: string;
  } | null;
}

export interface InspectionModeOption {
  value: "in_person" | "virtual";
  label: string;
  icon: string;
}

const actionLabelMap: Record<
  "accept" | "counter" | "reject",
  string
> = {
  accept: "Accept",
  counter: "Counter",
  reject: "Reject",
};

const InspectionDateTimeStep: React.FC<InspectionDateTimeStepProps> = ({
  userType,
  negotiationAction,
}) => {
  const {
    state,
    submitNegotiationAction,
    createAcceptPayload,
    createCounterPayload,
    createRejectPayload,
    uploadFile,
  } = useSecureNegotiation();

  const { details, loadingStates, inspectionId, inspectionType } = state;
  const [newDate, setNewDate] = useState(details?.inspectionDate || "");
  const [newTime, setNewTime] = useState(details?.inspectionTime || "");
  const [newInspectionMode, setNewInspectionMode] = useState(details?.inspectionMode || "in_person");
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showAllDays, setShowAllDays] = useState(false);

  // Check if inspection date has passed
  const inspectionDatePassed = useMemo(() => {
    if (!details?.inspectionDate) return false;
    const inspectionDate = new Date(details.inspectionDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    inspectionDate.setHours(0, 0, 0, 0);
    return inspectionDate < today;
  }, [details?.inspectionDate]);

  // Check if inspection date is today
  const inspectionDateIsToday = useMemo(() => {
    if (!details?.inspectionDate) return false;
    const inspectionDate = new Date(details.inspectionDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    inspectionDate.setHours(0, 0, 0, 0);
    return inspectionDate.getTime() === today.getTime();
  }, [details?.inspectionDate]);

  // Check if inspection date and time has completely passed
  const inspectionDateTimePassed = useMemo(() => {
    if (!details?.inspectionDate || !details?.inspectionTime) return false;

    const inspectionDate = new Date(details.inspectionDate);
    const now = new Date();

    // Parse time and set it on the inspection date
    const timeParts = details.inspectionTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (timeParts) {
      let hours = parseInt(timeParts[1]);
      const minutes = parseInt(timeParts[2]);
      const ampm = timeParts[3].toUpperCase();

      if (ampm === "PM" && hours !== 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;

      inspectionDate.setHours(hours, minutes, 0, 0);
    }

    return inspectionDate < now;
  }, [details?.inspectionDate, details?.inspectionTime]);

  // Define time object interface
  interface TimeObj {
    value: string;
    display: string;
    isPassed?: boolean;
  }
  
  // Generate available times (8 AM to 6 PM, hourly only)
  const availableTimes = useMemo(() => {
    const times: TimeObj[] = [];
    for (let hour = 8; hour <= 18; hour++) {
      const time12 =
        hour <= 12
          ? `${hour}:00 ${hour === 12 ? "PM" : "AM"}`
          : `${hour - 12}:00 PM`;

      times.push({
        value: time12,
        display: time12,
      });
    }
    return times;
  }, []);

  // Generate valid dates starting from tomorrow (excluding passed dates and Sundays)
  const generateValidDates = useMemo(() => {
    const dates = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // Start from tomorrow

    const currentDate = new Date(startDate);
    let count = 0;
    const maxDates = 20; // Generate more dates to have enough after filtering

    while (count < maxDates) {
      // Skip Sundays (0 = Sunday)
      if (currentDate.getDay() !== 0) {
        const dateStr = currentDate.toISOString().split("T")[0];

        dates.push({
          date: dateStr,
          displayDate: currentDate.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
          fullDate: currentDate.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          isPassed: false, // All generated dates are future dates
        });
        count++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Add current inspection date if it's valid and not passed
    if (details?.inspectionDate && !inspectionDatePassed) {
      const inspectionDateFormatted = new Date(details.inspectionDate)
        .toISOString()
        .split("T")[0];

      // Check if inspection date is already in the list
      const existsInList = dates.some(
        (d) => d.date === inspectionDateFormatted,
      );

      if (!existsInList) {
        const inspectionDate = new Date(details.inspectionDate);
        // Insert at the beginning if it's a valid future date
        dates.unshift({
          date: inspectionDateFormatted,
          displayDate: inspectionDate.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
          fullDate: inspectionDate.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          isPassed: false,
        });
      }
    }

    return dates.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [details?.inspectionDate, inspectionDatePassed]);

  // Filter times based on selected date and current time
  const getAvailableTimesForDate = useMemo(() => {
    return (selectedDate: string) => {
      if (!selectedDate) return availableTimes;

      const selected = new Date(selectedDate);
      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selected.setHours(0, 0, 0, 0);

      // If selected date is today, filter out passed times
      if (selected.getTime() === today.getTime()) {
        const currentHour = now.getHours();
        return availableTimes.map((timeObj) => {
          const timeParts = timeObj.value.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (timeParts) {
            let hours = parseInt(timeParts[1]);
            const ampm = timeParts[3].toUpperCase();

            if (ampm === "PM" && hours !== 12) hours += 12;
            if (ampm === "AM" && hours === 12) hours = 0;

            return {
              ...timeObj,
              isPassed: hours <= currentHour + 1, // Add 1 hour buffer
            };
          }
          return timeObj;
        });
      }

      return availableTimes.map((timeObj) => ({ ...timeObj, isPassed: false }));
    };
  }, [availableTimes]);

  // Show first 10 dates by default, then show more on demand
  const displayedDates = useMemo(() => {
    const validDates = generateValidDates;

    // If current inspection date exists, ensure it's in the first 10
    if (details?.inspectionDate && !inspectionDatePassed) {
      const inspectionDateFormatted = new Date(details.inspectionDate)
        .toISOString()
        .split("T")[0];

      const inspectionDateIndex = validDates.findIndex(
        (d) => d.date === inspectionDateFormatted,
      );

      if (inspectionDateIndex >= 10 && !showAllDays) {
        // Move inspection date to the beginning if it's not in first 10
        const inspectionDateObj = validDates[inspectionDateIndex];
        const otherDates = validDates.filter(
          (_, index) => index !== inspectionDateIndex,
        );
        const firstTen = [inspectionDateObj, ...otherDates.slice(0, 9)];
        return firstTen;
      }
    }

    return showAllDays ? validDates.slice(0, 15) : validDates.slice(0, 10);
  }, [
    generateValidDates,
    showAllDays,
    details?.inspectionDate,
    inspectionDatePassed,
  ]);

  // Auto-populate date and time when modal opens
  const openUpdateModal = () => {
    // Auto-select current inspection date if valid, otherwise use first available
    let dateToSelect = displayedDates[0]?.date || "";

    if (details?.inspectionDate && !inspectionDatePassed) {
      const inspectionDateFormatted = new Date(details.inspectionDate)
        .toISOString()
        .split("T")[0];
      const dateExists = displayedDates.some(
        (d) => d.date === inspectionDateFormatted,
      );
      if (dateExists) {
        dateToSelect = inspectionDateFormatted;
      }
    }

    const timeToSelect =
      details?.inspectionTime || availableTimes[0]?.value || "";
    const modeToSelect = details?.inspectionMode || "in_person";

    // Set the modal state to appropriate values
    setNewDate(dateToSelect);
    setNewTime(timeToSelect);
    setNewInspectionMode(modeToSelect);
    setShowUpdateForm(true);
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showUpdateForm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showUpdateForm]);

  const currentDate = useMemo(() => {
    if (details?.inspectionDate && !inspectionDatePassed) {
      return new Date(details.inspectionDate).toISOString().split("T")[0];
    }
    return newDate || displayedDates[0]?.date || "";
  }, [details?.inspectionDate, newDate, displayedDates, inspectionDatePassed]);

  const currentTime = useMemo(() => {
    return details?.inspectionTime || newTime || availableTimes[0]?.value || "";
  }, [details?.inspectionTime, newTime, availableTimes]);

  const currentInspectionMode = useMemo(() => {
    return details?.inspectionMode || newInspectionMode || "in_person";
  }, [details?.inspectionMode, newInspectionMode]);

  const inspectionModeOptions: InspectionModeOption[] = [
    { value: "in_person", label: "In Person", icon: "👥" },
    { value: "virtual", label: "Virtual", icon: "💻" },
  ];

  const getInspectionModeDisplay = (mode: string) => {
    const option = inspectionModeOptions.find(opt => opt.value === mode);
    return option ? `${option.icon} ${option.label}` : mode;
  };

  const propertyAddress = details?.propertyId?.location
    ? `${details.propertyId.location.area}, ${details.propertyId.location.localGovernment}, ${details.propertyId.location.state}`
    : "Property address not specified";

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "Not specified";
    return timeString;
  };

  const handleConfirmDateTime = async () => {
    if (!currentDate || !currentTime) {
      toast.error("Date or time not selected")
      return;
    }

    try {
      let payload: any;

      if (negotiationAction) {
        // We're coming from a negotiation action, include that in the payload
        switch (negotiationAction.type) {
          case "accept":
            payload = createAcceptPayload(
              inspectionType!,
              currentDate,
              currentTime,
              currentInspectionMode,
            );
            break;
          case "reject":
            payload = createRejectPayload(
              inspectionType!,
              negotiationAction.rejectReason,
              newDate,
              newTime,
              newInspectionMode,
            );
            break;
          case "counter":
            payload = createCounterPayload(
              inspectionType!,
              negotiationAction.counterPrice,
              currentDate,
              currentTime,
              currentInspectionMode,
            );
            break;
        }
      } else {
        // Just confirming current schedule
        payload = createAcceptPayload(
          inspectionType!,
          currentDate,
          currentTime,
          currentInspectionMode,
        );
      }

      const response = await submitNegotiationAction(inspectionId!, userType, payload);

      if (response.success) {
        toast.success(response.message)
      }else{
        toast.error(response.error)
      }

    } catch (error) {
      console.error("Failed to confirm inspection date/time:", error);
    }
  };

  const handleUpdateDateTime = async () => {
    if (!newDate || !newTime) {
      toast.error("Date or time not selected")
      return;
    }

    try {
      let payload: any;

      if (negotiationAction) {
        // We're coming from a negotiation action, include that in the payload
        switch (negotiationAction.type) {
          case "accept":
            payload = createAcceptPayload(
              inspectionType!, 
              newDate, 
              newTime, 
              newInspectionMode
            );
            break;
          case "reject":
            payload = createRejectPayload(
              inspectionType!,
              negotiationAction.rejectReason,
              newDate,
              newTime,
              newInspectionMode,
            );
            break;
          case "counter":
            payload = createCounterPayload(
              inspectionType!,
              negotiationAction.counterPrice,
              newDate,
              newTime,
              newInspectionMode,
            );
            break;
        }
      } else {
        // Just updating schedule
        payload = createCounterPayload(
          inspectionType!,
          undefined,
          newDate,
          newTime,
          newInspectionMode,
        );
      }
      const response = await submitNegotiationAction(inspectionId!, userType, payload);

      if (response.success) {
        toast.success(response.message)
      }else{
        toast.error(response.error)
      }
      
      setShowUpdateForm(false);
    } catch (error) {
      console.error("Failed to update inspection date/time:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Loading Overlay */}
      <StandardPreloader
        isVisible={
          loadingStates.submitting ||
          loadingStates.accepting ||
          loadingStates.countering
        }
        message={
          loadingStates.accepting
            ? "Accepting offer with inspection schedule..."
            : loadingStates.countering
              ? "Submitting counter offer with inspection schedule..."
              : loadingStates.submitting
                ? "Updating inspection schedule..."
                : "Processing..."
        }
        overlay={true}
      />

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#09391C] mb-2">
          Inspection Schedule
        </h2>
        <p className="text-gray-600">
          {negotiationAction
            ? "Confirm or update the inspection date and time for your response."
            : "Review and confirm the inspection schedule."}
        </p>
      </div>

      {/* Current Schedule Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#EEF1F1] rounded-xl border border-[#C7CAD0]"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Current Inspection Details
          </h3>

          {/* Status badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {inspectionDateTimePassed && (
              <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                Expired
              </span>
            )}
            {inspectionDateIsToday && !inspectionDateTimePassed && (
              <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
                Today
              </span>
            )}
            {!inspectionDatePassed && !inspectionDateIsToday && (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Scheduled
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <FiCalendar className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">
                  Inspection Date
                </span>
              </div>
              <p className="text-blue-700 font-semibold">
                {formatDate(currentDate)}
              </p>
            </div>

            {/* Time */}
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <FiClock className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">
                  Inspection Time
                </span>
              </div>
              <p className="text-green-700 font-semibold">
                {formatTime(currentTime)}
              </p>
            </div>

            {/* Inspection Mode */}
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">🔍</span>
                <span className="font-medium text-orange-800">
                  Inspection Mode
                </span>
              </div>
              <p className="text-orange-700 font-semibold">
                {getInspectionModeDisplay(currentInspectionMode)}
              </p>
            </div>

            {/* Location */}
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <FiMapPin className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-800">
                  Property Location
                </span>
              </div>
              <p className="text-purple-700">{propertyAddress}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-[#C7CAD0]"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {negotiationAction ? "Submit Your Response" : "Choose Your Action"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Confirm Current Schedule */}
            <button
              onClick={handleConfirmDateTime}
              disabled={
                loadingStates.submitting ||
                loadingStates.accepting ||
                loadingStates.countering ||
                inspectionDateTimePassed
              }
              className="flex items-center justify-center space-x-2 p-4 bg-[#09391C] text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200"
            >
              <FiCheckCircle className="w-5 h-5" />
              <span>
                {negotiationAction
                  ? `${negotiationAction.type === "accept" ? "Accept" : negotiationAction.type === "counter" ? "Counter" : "Request Changes"} & Confirm`
                  : "Confirm Schedule"}
              </span>
            </button>

            {/* Update Schedule */}
            <button
              onClick={openUpdateModal}
              disabled={
                loadingStates.submitting ||
                loadingStates.accepting ||
                loadingStates.countering
              }
              className="flex items-center justify-center space-x-2 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
            >
              <FiEdit3 className="w-5 h-5" />
              <span>Update Schedule</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Update Schedule Modal - FIXED: Full backdrop overlay */}
      {showUpdateForm && (
        <div
          className="fixed inset-0 -top-6 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowUpdateForm(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#C7CAD0]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[#09391C]">
                  Update Inspection Schedule
                </h3>
                <button
                  onClick={() => setShowUpdateForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Status warning in modal */}
              {(inspectionDatePassed || inspectionDateTimePassed) && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FiAlertTriangle className="w-4 h-4 text-red-600" />
                    <p className="text-red-800 text-sm font-medium">
                      {inspectionDateTimePassed
                        ? "Current inspection date and time has expired"
                        : "Current inspection date has passed"}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select New Date
                  </label>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                    {displayedDates.map((dateObj) => (
                      <button
                        key={dateObj.date}
                        onClick={() => setNewDate(dateObj.date)}
                        className={`p-3 text-left rounded-lg border transition-colors duration-200 ${
                          newDate === dateObj.date
                            ? "border-[#09391C] bg-green-50 text-[#09391C]"
                            : "border-[#C7CAD0] hover:border-[#09391C] hover:bg-gray-50"
                        }`}
                      >
                        <div className="font-medium">{dateObj.displayDate}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {dateObj.fullDate}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* View More Button */}
                  {!showAllDays && generateValidDates.length > 10 && (
                    <button
                      onClick={() => setShowAllDays(true)}
                      className="mt-3 flex items-center space-x-2 text-[#09391C] hover:text-green-700 transition-colors duration-200"
                    >
                      <span className="text-sm font-medium">
                        View More Dates (
                        {Math.min(5, generateValidDates.length - 10)} more)
                      </span>
                      <FiChevronDown className="w-4 h-4" />
                    </button>
                  )}

                  {/* Show Less Button */}
                  {showAllDays && generateValidDates.length > 10 && (
                    <button
                      onClick={() => setShowAllDays(false)}
                      className="mt-3 flex items-center space-x-2 text-[#09391C] hover:text-green-700 transition-colors duration-200"
                    >
                      <span className="text-sm font-medium">Show Less</span>
                      <FiChevronDown className="w-4 h-4 transform rotate-180" />
                    </button>
                  )}
                </div>

                {/* Time Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select New Time
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                    {getAvailableTimesForDate(newDate).map((timeObj) => (
                      <button
                        key={timeObj.value}
                        onClick={() => setNewTime(timeObj.value)}
                        disabled={timeObj.isPassed}
                        className={`p-2 text-center rounded-lg border transition-colors duration-200 ${
                          timeObj.isPassed
                            ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                            : newTime === timeObj.value
                              ? "border-[#09391C] bg-green-50 text-[#09391C]"
                              : "border-[#C7CAD0] hover:border-[#09391C] hover:bg-gray-50"
                        }`}
                      >
                        <div className="text-sm font-medium">
                          {timeObj.display}
                        </div>
                        {timeObj.isPassed && (
                          <div className="text-xs text-red-500">Passed</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inspection Mode Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Inspection Mode
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {inspectionModeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setNewInspectionMode(option.value)}
                        className={`p-4 text-left rounded-lg border transition-colors duration-200 ${
                          newInspectionMode === option.value
                            ? "border-[#09391C] bg-green-50 text-[#09391C]"
                            : "border-[#C7CAD0] hover:border-[#09391C] hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{option.icon}</span>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {option.value === "in_person" ? "Physical property visit" :
                               option.value === "virtual" ? "Video call inspection" :
                               "Developer-guided visit"}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Summary */}
                {newDate && newTime && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">
                      New Schedule Summary
                    </h4>
                    <p className="text-blue-700">
                      <strong>Response Type:</strong> {negotiationAction ? actionLabelMap[negotiationAction.type] : null}
                    </p>
                    <p className="text-blue-700">
                      <strong>Date:</strong> {formatDate(newDate)}
                    </p>
                    <p className="text-blue-700">
                      <strong>Time:</strong> {formatTime(newTime)}
                    </p>
                    <p className="text-blue-700">
                      <strong>Mode:</strong> {getInspectionModeDisplay(newInspectionMode)}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowUpdateForm(false)}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateDateTime}
                    disabled={
                      !newDate ||
                      !newTime ||
                      !newInspectionMode ||
                      loadingStates.submitting ||
                      loadingStates.accepting ||
                      loadingStates.countering
                    }
                    className="flex-1 py-3 px-4 bg-[#09391C] text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200"
                  >
                    {negotiationAction
                      ? `Update & ${actionLabelMap[negotiationAction.type]}`
                      : "Update Schedule"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default InspectionDateTimeStep;
