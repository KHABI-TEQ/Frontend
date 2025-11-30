"use client";

import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import Button from "@/components/general-components/button";
import { POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import ProcessingRequest from "../loading-component/ProcessingRequest";

interface DateTimeSelectionProps {
  selectedProperties: any[];
  inspectionFee: number;
  negotiatedPrices: any[];
  activeTab: "buy" | "jv" | "rent" | "shortlet";
  loiDocuments: any[];
  onComplete: () => void;
  onBack: () => void;
}

type InspectionMode = "in_person" | "virtual";

type PropertySchedule = {
  date: string;
  time: string;
};

const INSPECTION_TIMES: string[] = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
];

const getInitialDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 3);

  while (date.getDay() === 0) {
    date.setDate(date.getDate() + 1);
  }

  return format(date, "MMM d, yyyy");
};

const getInitialTime = () => {
  const currentHour = new Date().getHours();
  const nextHour = currentHour + 1;

  const hourMap: Record<number, string> = {
    8: "8:00 AM",
    9: "9:00 AM",
    10: "10:00 AM",
    11: "11:00 AM",
    12: "12:00 PM",
    13: "1:00 PM",
    14: "2:00 PM",
    15: "3:00 PM",
    16: "4:00 PM",
    17: "5:00 PM",
    18: "6:00 PM",
  };

  if (nextHour >= 8 && nextHour <= 18 && hourMap[nextHour]) {
    return hourMap[nextHour];
  }

  return INSPECTION_TIMES[0];
};

const getAvailableDates = (count: number) => {
  const dates: string[] = [];
  const date = new Date();
  date.setDate(date.getDate() + 3);

  while (dates.length < count) {
    if (date.getDay() !== 0) {
      dates.push(format(date, "MMM d, yyyy"));
    }
    date.setDate(date.getDate() + 1);
  }
  return dates;
};

const getStaggeredTime = (position: number, baseTime: string) => {
  const baseIndex = INSPECTION_TIMES.indexOf(baseTime);
  if (baseIndex === -1) {
    return INSPECTION_TIMES[Math.min(position, INSPECTION_TIMES.length - 1)];
  }
  const targetIndex = Math.min(baseIndex + position, INSPECTION_TIMES.length - 1);
  return INSPECTION_TIMES[targetIndex];
};

const initializeSchedules = (
  properties: any[],
  defaultDate: string,
  defaultTime: string,
) => {
  const schedules: Record<string, PropertySchedule> = {};
  properties.forEach((property, index) => {
    schedules[property.propertyId] = {
      date: defaultDate,
      time: getStaggeredTime(index, defaultTime),
    };
  });
  return schedules;
};

const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({
  selectedProperties,
  inspectionFee,
  negotiatedPrices,
  activeTab,
  loiDocuments,
  onComplete,
  onBack,
}) => {
  const defaultInitialDate = useMemo(() => getInitialDate(), []);
  const defaultInitialTime = useMemo(() => getInitialTime(), []);

  const [inspectionMode, setInspectionMode] =
    useState<InspectionMode>("in_person");
  const [buyerInfo, setBuyerInfo] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    whatsAppNumber: "",
  });
  const [showMoreDates, setShowMoreDates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirectingToPayment, setIsRedirectingToPayment] = useState(false);

  const availableDates = useMemo(
    () => getAvailableDates(showMoreDates ? 20 : 10),
    [showMoreDates],
  );

  const [propertySchedules, setPropertySchedules] = useState<
    Record<string, PropertySchedule>
  >(() => initializeSchedules(selectedProperties, defaultInitialDate, defaultInitialTime));

  useEffect(() => {
    setPropertySchedules((prev) => {
      const next: Record<string, PropertySchedule> = {};
      selectedProperties.forEach((property, index) => {
        const existing = prev[property.propertyId];
        if (existing) {
          next[property.propertyId] = existing;
        } else {
          next[property.propertyId] = {
            date: defaultInitialDate,
            time: getStaggeredTime(index, defaultInitialTime),
          };
        }
      });
      return next;
    });
  }, [selectedProperties, defaultInitialDate, defaultInitialTime]);

  useEffect(() => {
    if (isSubmitting || isRedirectingToPayment) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSubmitting, isRedirectingToPayment]);

  const handleBuyerInfoChange = (field: string, value: string) => {
    setBuyerInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleScheduleChange = (
    propertyId: string,
    field: keyof PropertySchedule,
    value: string,
  ) => {
    setPropertySchedules((prev) => {
      const schedule = prev[propertyId] ?? {
        date: defaultInitialDate,
        time: defaultInitialTime,
      };

      return {
        ...prev,
        [propertyId]: {
          ...schedule,
          [field]: value,
        },
      };
    });
  };

  const copyScheduleFrom = (sourceId: string, targetId: string) => {
    setPropertySchedules((prev) => {
      const source = prev[sourceId];
      if (!source) {
        return prev;
      }
      return {
        ...prev,
        [targetId]: { ...source },
      };
    });
  };

  const hasCompleteSchedules = useMemo(
    () =>
      selectedProperties.every((property) => {
        const schedule = propertySchedules[property.propertyId];
        return Boolean(schedule?.date && schedule?.time);
      }),
    [propertySchedules, selectedProperties],
  );

  const buildInspectionPayload = () => {
    const fallbackSchedule =
      selectedProperties.length > 0
        ? propertySchedules[selectedProperties[0].propertyId]
        : undefined;

    const payload = selectedProperties.map((property) => {
      const negotiatedPrice = negotiatedPrices.find(
        (price) => price.propertyId === property.propertyId,
      );

      const loiDoc = loiDocuments.find(
        (doc) => doc.propertyId === property.propertyId,
      );

      const propertyPayload: any = {
        propertyId: property.propertyId,
        inspectionType: property.sourceTab === "jv" ? "LOI" : "price",
        negotiationPrice: negotiatedPrice?.negotiatedPrice || undefined,
        letterOfIntention: loiDoc?.documentUrl || undefined,
      };

      if (property.sourcePage) {
        propertyPayload.requestSource = { page: property.sourcePage };
      }

      if (property.sourceMeta) {
        propertyPayload.requestSource = {
          ...(propertyPayload.requestSource || {}),
          matchedId: property.sourceMeta.matchedId,
          preferenceId: property.sourceMeta.preferenceId,
        };
      }

      const schedule = propertySchedules[property.propertyId];
      if (schedule) {
        propertyPayload.inspectionDate = schedule.date;
        propertyPayload.inspectionTime = schedule.time;
      }

      return propertyPayload;
    });

    return {
      requestedBy: buyerInfo,
      inspectionDetails: {
        inspectionDate: fallbackSchedule?.date ?? defaultInitialDate,
        inspectionTime: fallbackSchedule?.time ?? defaultInitialTime,
        inspectionMode,
      },
      inspectionAmount: inspectionFee,
      properties: payload,
    };
  };

  const handleSubmitInspectionRequest = async () => {
    if (!hasCompleteSchedules) {
      toast.error("Please select an inspection date and time for each property.");
      return;
    }

    if (
      !buyerInfo.fullName.trim() ||
      !buyerInfo.phoneNumber.trim() ||
      !buyerInfo.email.trim()
    ) {
      toast.error(
        "Please fill in all buyer information fields (Full Name, Phone Number, and Email).",
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(buyerInfo.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(buyerInfo.phoneNumber)) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildInspectionPayload();

      const response = await POST_REQUEST(
        URLS.BASE + URLS.requestInspection,
        payload,
      );

      if (response.success) {
        if (response.data?.transaction?.authorization_url) {
          toast.success(
            "🎉 Inspection request submitted successfully! Redirecting to payment...",
          );
          setIsRedirectingToPayment(true);

          setTimeout(() => {
            window.location.href = response.data.transaction.authorization_url;
          }, 2000);
        } else {
          toast.success("🎉 Inspection request submitted successfully!");
          setTimeout(() => {
            onComplete();
          }, 1000);
        }
      } else {
        toast.error("Failed to submit request. Please try again.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const firstPropertyId = selectedProperties[0]?.propertyId;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
  
      <ProcessingRequest
        isVisible={isSubmitting || isRedirectingToPayment}
        title={isRedirectingToPayment ? "Redirecting to Payment" : "Submitting Request"}
        message={isRedirectingToPayment
                ? "Your inspection request has been processed. You will be redirected to the payment page shortly..."
                : "Please wait while we process your inspection request and generate your payment link..."}
        iconColor="#8DDB90"
      />

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-[#09391C] mb-4">
          Inspection Summary
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[#5A5D63]">Properties Selected:</span>
            <span className="font-medium text-[#24272C]">
              {selectedProperties.length}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#5A5D63]">Inspection Fee:</span>
            <span className="font-semibold text-[#09391C] text-lg">
              ₦{inspectionFee.toLocaleString()}
            </span>
          </div>

          <div className="border-t pt-3 space-y-2">
            <div className="text-sm text-[#5A5D63]">Schedules:</div>
            {selectedProperties.map((item, index) => {
              const schedule = propertySchedules[item.propertyId];
              return (
                <div
                  key={item.propertyId}
                  className="text-sm text-[#24272C] flex flex-col"
                >
                  <span>
                    {index + 1}. {item.property?.propertyType || "Property"} – {" "}
                    {item.property?.location?.area}, {" "}
                    {item.property?.location?.localGovernment}
                  </span>
                  {schedule && (
                    <span className="text-xs text-[#5A5D63]">
                      {schedule.date} • {schedule.time}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {selectedProperties.map((property, index) => {
          const schedule = propertySchedules[property.propertyId];
          const propertyLabel = `Property ${index + 1}`;
          return (
            <div
              key={property.propertyId}
              className="bg-white rounded-lg border border-gray-200 p-6 space-y-5"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#5A5D63]">
                    {propertyLabel}
                  </p>
                  <h4 className="text-base font-semibold text-[#09391C]">
                    {property.property?.propertyType || "Selected Property"}
                  </h4>
                  <p className="text-sm text-[#5A5D63]">
                    {property.property?.location?.area}, {" "}
                    {property.property?.location?.localGovernment}
                  </p>
                </div>
                {index > 0 && firstPropertyId && property.propertyId !== firstPropertyId && (
                  <button
                    onClick={() => copyScheduleFrom(firstPropertyId, property.propertyId)}
                    className="self-start text-sm font-medium text-[#8DDB90] hover:text-[#76c77a]"
                  >
                    Match Property 1 schedule
                  </button>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h5 className="text-sm font-semibold text-[#09391C] mb-3">
                    Select Date
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    {availableDates.map((date) => (
                      <button
                        key={`${property.propertyId}-${date}`}
                        onClick={() => handleScheduleChange(property.propertyId, "date", date)}
                        className={`p-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                          schedule?.date === date
                            ? "border-[#8DDB90] bg-[#E4EFE7] text-[#09391C]"
                            : "border-gray-200 hover:border-[#8DDB90] text-[#24272C]"
                        }`}
                      >
                        {date}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-semibold text-[#09391C] mb-3">
                    Select Time
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    {INSPECTION_TIMES.map((time) => (
                      <button
                        key={`${property.propertyId}-${time}`}
                        onClick={() => handleScheduleChange(property.propertyId, "time", time)}
                        className={`p-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                          schedule?.time === time
                            ? "border-[#8DDB90] bg-[#E4EFE7] text-[#09391C]"
                            : "border-gray-200 hover:border-[#8DDB90] text-[#24272C]"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {!showMoreDates && (
          <div className="text-center">
            <button
              onClick={() => setShowMoreDates(true)}
              className="text-[#8DDB90] hover:text-[#76c77a] font-medium text-sm"
            >
              Show More Dates →
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-[#09391C] mb-4">
          Select Inspection Mode
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => setInspectionMode("in_person")}
            className={`p-4 rounded-lg border-2 transition-colors text-sm font-medium ${
              inspectionMode === "in_person"
                ? "border-[#8DDB90] bg-[#E4EFE7] text-[#09391C]"
                : "border-gray-200 hover:border-[#8DDB90] text-[#24272C]"
            }`}
          >
            <div className="text-center">
              <div className="text-lg mb-2">🏠</div>
              <div className="font-semibold">In Person</div>
              <div className="text-xs text-gray-600 mt-1">
                Physical inspection at the property
              </div>
            </div>
          </button>

          <button
            onClick={() => setInspectionMode("virtual")}
            className={`p-4 rounded-lg border-2 transition-colors text-sm font-medium ${
              inspectionMode === "virtual"
                ? "border-[#8DDB90] bg-[#E4EFE7] text-[#09391C]"
                : "border-gray-200 hover:border-[#8DDB90] text-[#24272C]"
            }`}
          >
            <div className="text-center">
              <div className="text-lg mb-2">💻</div>
              <div className="font-semibold">Virtual</div>
              <div className="text-xs text-gray-600 mt-1">
                Online video inspection
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-[#09391C] mb-4">
          Buyer Information <span className="text-red-500">*</span>
        </h3>
        <p className="text-sm text-[#5A5D63] mb-6">
          Please provide your contact information for the inspection appointment.
        </p>

        <div className="space-y-4">
          <div className="w-full flex flex-col gap-4 md:flex-row">
            <div className="w-full">
              <label className="block text-sm font-medium text-[#24272C] mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={buyerInfo.fullName}
                onChange={(e) => handleBuyerInfoChange("fullName", e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                required
              />
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-[#24272C] mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={buyerInfo.email}
                onChange={(e) => handleBuyerInfoChange("email", e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                required
              />
            </div>

          </div>

          <div className="w-full flex flex-col gap-4 md:flex-row">
            <div className="w-full">
              <label className="block text-sm font-medium text-[#24272C] mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={buyerInfo.phoneNumber}
                onChange={(e) => handleBuyerInfoChange("phoneNumber", e.target.value)}
                placeholder="Enter your phone number"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                required
              />
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-[#24272C] mb-2">
                WhatsApp Number
              </label>
              <input
                type="text"
                value={buyerInfo.whatsAppNumber}
                onChange={(e) => handleBuyerInfoChange("whatsAppNumber", e.target.value)}
                placeholder="Enter your whatsApp Number"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#FFF3E0] border border-[#FFB74D] rounded-lg p-4">
        <h4 className="font-semibold text-[#E65100] mb-2">Important Notes:</h4>
        <ul className="text-sm text-[#E65100] space-y-1">
          <li>• Inspections are available Monday to Saturday (excluding Sundays)</li>
          <li>• Please arrive 15 minutes before your scheduled time</li>
          <li>• Bring a valid form of identification</li>
          <li>• Payment confirmation is required before inspection</li>
          <li>• Confirmation details will be sent to your provided email</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 border border-[#E9EBEB] text-[#5A5D63] rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Back to Selection
        </button>

        <Button
          onClick={handleSubmitInspectionRequest}
          value="Submit to Payment"
          isDisabled={
            !hasCompleteSchedules ||
            !buyerInfo.fullName.trim() ||
            !buyerInfo.phoneNumber.trim() ||
            !buyerInfo.email.trim()
          }
          className="flex-1 px-6 py-3 bg-[#8DDB90] text-white rounded-lg font-medium hover:bg-[#76c77a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
};

export default DateTimeSelection;
