/** @format */

"use client";
import React, { useState, useEffect, memo } from "react";
import { usePreferenceForm } from "@/context/preference-form-context";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface JVStep1DeveloperInfoProps {
  className?: string;
}

const JVStep1DeveloperInfo: React.FC<JVStep1DeveloperInfoProps> = memo(
  ({ className = "" }) => {
    const { state, updateFormData } = usePreferenceForm();

    // Local state for form fields
    const [fullName, setFullName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");

    // Initialize from existing form data
    useEffect(() => {
      if (state.formData?.contactInfo) {
        const contactInfo = state.formData.contactInfo as any;
        setFullName(contactInfo.fullName || "");
        setEmail(contactInfo.email || "");
        setPhoneNumber(contactInfo.phoneNumber || "");
      }
    }, [state.formData]);

    // Update context when values change
    useEffect(() => {
      const developerInfo = {
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
      };
      
      updateFormData({ 
        contactInfo: {
          ...state.formData?.contactInfo,
          ...developerInfo
        }
      } as any);
    }, [fullName, email, phoneNumber, updateFormData, state.formData?.contactInfo]);

    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Step 1: Developer Information
          </h3>
          <p className="text-sm text-gray-600">
            Please provide your personal or company details
          </p>
        </div>

        <div className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-3 py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
            />
            <p className="text-xs text-gray-500">
              Enter the name of the primary contact person or company representative
            </p>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="phone-input-container">
              <PhoneInput
                international
                defaultCountry="NG"
                value={phoneNumber}
                onChange={(value) => setPhoneNumber(value || "")}
                placeholder="Enter phone number"
                className="w-full"
              />
            </div>
            <p className="text-xs text-gray-500">
              A valid phone number for direct communication
            </p>
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-3 py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
            />
            <p className="text-xs text-gray-500">
              Email for official correspondence and document sharing
            </p>
          </div>
        </div>
      </div>
    );
  },
);

JVStep1DeveloperInfo.displayName = "JVStep1DeveloperInfo";

export default JVStep1DeveloperInfo;
