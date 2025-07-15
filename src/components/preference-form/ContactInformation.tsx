/** @format */

"use client";
import React, { useState, useEffect, useCallback } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import Select from "react-select";
import "react-phone-number-input/style.css";
import { usePreferenceForm } from "@/context/preference-form-context";

interface ContactInformationProps {
  preferenceType: "buy" | "rent" | "joint-venture" | "shortlet";
  className?: string;
}

// Cancellation policy options for shortlet
const CANCELLATION_POLICIES = [
  { value: "flexible", label: "Flexible" },
  { value: "moderate", label: "Moderate" },
  { value: "strict", label: "Strict" },
];

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
    minHeight: "48px",
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
    fontSize: "15px",
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: "#9CA3AF",
    fontSize: "15px",
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
    fontSize: "15px",
  }),
};

const ContactInformation: React.FC<ContactInformationProps> = ({
  preferenceType,
  className = "",
}) => {
  const { state, updateFormData } = usePreferenceForm();

  // Common fields
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");

  // Joint venture fields
  const [companyName, setCompanyName] = useState<string>("");
  const [contactPerson, setContactPerson] = useState<string>("");
  const [cacRegistrationNumber, setCacRegistrationNumber] =
    useState<string>("");

  // Shortlet specific fields
  const [preferredCheckInTime, setPreferredCheckInTime] = useState<any>(null);
  const [preferredCheckOutTime, setPreferredCheckOutTime] = useState<any>(null);
  const [petsAllowed, setPetsAllowed] = useState<boolean>(false);
  const [smokingAllowed, setSmokingAllowed] = useState<boolean>(false);
  const [partiesAllowed, setPartiesAllowed] = useState<boolean>(false);
  const [additionalRequests, setAdditionalRequests] = useState<string>("");
  const [maxBudgetPerNight, setMaxBudgetPerNight] = useState<string>("");
  const [willingToPayExtra, setWillingToPayExtra] = useState<boolean>(false);
  const [cleaningFeeBudget, setCleaningFeeBudget] = useState<string>("");
  const [securityDepositBudget, setSecurityDepositBudget] =
    useState<string>("");
  const [cancellationPolicy, setCancellationPolicy] = useState<any>(null);

  // Auto-populate max budget per night from budget range
  React.useEffect(() => {
    if (preferenceType === "shortlet" && state.formData.budget?.maxPrice) {
      const formattedBudget = formatNumberWithCommas(
        state.formData.budget.maxPrice.toString(),
      );
      setMaxBudgetPerNight(formattedBudget);
    }
  }, [preferenceType, state.formData.budget?.maxPrice, formatNumberWithCommas]);

  // Clear all fields when form is reset
  useEffect(() => {
    if (!state.formData || Object.keys(state.formData).length === 0) {
      setEmail("");
      setPhoneNumber("");
      setFullName("");
      setCompanyName("");
      setContactPerson("");
      setCacRegistrationNumber("");
      setPreferredCheckInTime(null);
      setPreferredCheckOutTime(null);
      setPetsAllowed(false);
      setSmokingAllowed(false);
      setPartiesAllowed(false);
      setAdditionalRequests("");
      setMaxBudgetPerNight("");
      setWillingToPayExtra(false);
      setCleaningFeeBudget("");
      setSecurityDepositBudget("");
      setCancellationPolicy(null);
    }
  }, [state.formData]);

  // Update context when values change
  useEffect(() => {
    if (preferenceType === "joint-venture") {
      const contactData = {
        companyName,
        contactPerson,
        email,
        phoneNumber,
        cacRegistrationNumber: cacRegistrationNumber || undefined,
      };
      updateFormData({ contactInfo: contactData });
    } else if (preferenceType === "shortlet") {
      const contactData = {
        fullName,
        email,
        phoneNumber,
        preferredCheckInTime: preferredCheckInTime?.value || "",
        preferredCheckOutTime: preferredCheckOutTime?.value || "",
        petsAllowed,
        smokingAllowed,
        partiesAllowed,
        additionalRequests,
        maxBudgetPerNight: parseFloat(maxBudgetPerNight.replace(/,/g, "")) || 0,
        willingToPayExtra,
        cleaningFeeBudget: parseFloat(cleaningFeeBudget.replace(/,/g, "")) || 0,
        securityDepositBudget:
          parseFloat(securityDepositBudget.replace(/,/g, "")) || 0,
        cancellationPolicy: cancellationPolicy?.value || "",
      };
      updateFormData({ contactInfo: contactData });
    } else {
      const contactData = {
        fullName,
        email,
        phoneNumber,
      };
      updateFormData({ contactInfo: contactData });
    }
  }, [
    preferenceType,
    fullName,
    companyName,
    contactPerson,
    email,
    phoneNumber,
    cacRegistrationNumber,
    preferredCheckInTime,
    preferredCheckOutTime,
    petsAllowed,
    smokingAllowed,
    partiesAllowed,
    additionalRequests,
    maxBudgetPerNight,
    willingToPayExtra,
    cleaningFeeBudget,
    securityDepositBudget,
    cancellationPolicy,
    updateFormData,
  ]);

  // Validate email
  const isValidEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Validate phone number
  const isValidPhone = useCallback((phone: string): boolean => {
    return phone ? isValidPhoneNumber(phone) : false;
  }, []);

  // Format number with commas
  const formatNumberWithCommas = useCallback((value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }, []);

  // Render shortlet contact and preferences
  if (preferenceType === "shortlet") {
    return (
      <div className={`space-y-8 ${className}`}>
        {/* Header */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Contact Information & Stay Preferences
          </h3>
          <p className="text-sm text-gray-600">
            Provide your contact details and specify your stay preferences
          </p>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          <h4 className="text-md font-semibold text-gray-800 border-b pb-2">
            Contact Information
          </h4>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-gray-400"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <PhoneInput
                international
                defaultCountry="NG"
                value={phoneNumber}
                onChange={(value) => setPhoneNumber(value || "")}
                placeholder="Enter phone number"
                className="modern-phone-input"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Email Address <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Stay Preferences */}
        <div className="space-y-6">
          <h4 className="text-md font-semibold text-gray-800 border-b pb-2">
            Stay Preferences
          </h4>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Preferred Check-in Time
              </label>
              <Select
                options={CHECK_TIMES}
                value={preferredCheckInTime}
                onChange={setPreferredCheckInTime}
                placeholder="Select check-in time..."
                styles={customSelectStyles}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Preferred Check-out Time
              </label>
              <Select
                options={CHECK_TIMES}
                value={preferredCheckOutTime}
                onChange={setPreferredCheckOutTime}
                placeholder="Select check-out time..."
                styles={customSelectStyles}
              />
            </div>
          </div>

          {/* Property Rules */}
          <div className="space-y-4">
            <h5 className="text-sm font-semibold text-gray-800">
              Property Rules Preferences
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={petsAllowed}
                  onChange={(e) => setPetsAllowed(e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">Pets Allowed</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={smokingAllowed}
                  onChange={(e) => setSmokingAllowed(e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">Smoking Allowed</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={partiesAllowed}
                  onChange={(e) => setPartiesAllowed(e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">
                  Parties/Events Allowed
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Budget & Pricing */}
        <div className="space-y-6">
          <h4 className="text-md font-semibold text-gray-800 border-b pb-2">
            Budget & Pricing Expectations
          </h4>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Max Budget per Night <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ₦
                </span>
                <input
                  type="text"
                  value={maxBudgetPerNight}
                  readOnly
                  disabled
                  className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed text-gray-700 font-medium"
                />
              </div>
              <p className="text-xs text-gray-500">
                Auto-populated from your budget range (max price)
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Preferred Cancellation Policy
              </label>
              <Select
                options={CANCELLATION_POLICIES}
                value={cancellationPolicy}
                onChange={setCancellationPolicy}
                placeholder="Select cancellation policy..."
                styles={customSelectStyles}
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={willingToPayExtra}
                onChange={(e) => setWillingToPayExtra(e.target.checked)}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-700">
                Willing to Pay Extra for Premium Features
              </span>
            </label>

            {willingToPayExtra && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ml-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Cleaning Fee Budget{" "}
                    <span className="text-gray-500">(Optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₦
                    </span>
                    <input
                      type="text"
                      value={cleaningFeeBudget}
                      onChange={(e) =>
                        setCleaningFeeBudget(
                          formatNumberWithCommas(e.target.value),
                        )
                      }
                      placeholder="Enter cleaning fee budget"
                      className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Security Deposit Budget{" "}
                    <span className="text-gray-500">(Optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₦
                    </span>
                    <input
                      type="text"
                      value={securityDepositBudget}
                      onChange={(e) =>
                        setSecurityDepositBudget(
                          formatNumberWithCommas(e.target.value),
                        )
                      }
                      placeholder="Enter security deposit budget"
                      className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Requests */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Additional Requests or Notes{" "}
            <span className="text-gray-500">(Optional)</span>
          </label>
          <textarea
            value={additionalRequests}
            onChange={(e) => setAdditionalRequests(e.target.value)}
            placeholder="Enter any additional requests or special requirements..."
            rows={4}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-gray-400 resize-none"
          />
        </div>
      </div>
    );
  }

  // Render joint venture contact form
  if (preferenceType === "joint-venture") {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Company Information
          </h3>
          <p className="text-sm text-gray-600">
            Provide your company details for partnership opportunities
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Company / Developer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company or developer name"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-gray-400"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Contact Person <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Enter contact person name"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <PhoneInput
                international
                defaultCountry="NG"
                value={phoneNumber}
                onChange={(value) => setPhoneNumber(value || "")}
                placeholder="Enter phone number"
                className="modern-phone-input"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              CAC Registration Number{" "}
              <span className="text-gray-500">(Optional)</span>
            </label>
            <input
              type="text"
              value={cacRegistrationNumber}
              onChange={(e) => setCacRegistrationNumber(e.target.value)}
              placeholder="Enter CAC registration number"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-gray-400"
            />
          </div>
        </div>
      </div>
    );
  }

  // Render individual contact form for Buy and Rent
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Contact Information
        </h3>
        <p className="text-sm text-gray-600">
          We'll use this information to contact you about matching properties
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-gray-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <PhoneInput
              international
              defaultCountry="NG"
              value={phoneNumber}
              onChange={(value) => setPhoneNumber(value || "")}
              placeholder="Enter phone number"
              className="modern-phone-input"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              Email Address <span className="text-gray-500">(Optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-gray-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInformation;
