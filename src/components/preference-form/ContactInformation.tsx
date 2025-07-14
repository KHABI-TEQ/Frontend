/** @format */

"use client";
import React, { useState, useEffect, useCallback } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { usePreferenceForm } from "@/context/preference-form-context";

interface ContactInformationProps {
  preferenceType: "buy" | "rent" | "joint-venture" | "shortlet";
  className?: string;
}

const ContactInformation: React.FC<ContactInformationProps> = ({
  preferenceType,
  className = "",
}) => {
  const { state, updateFormData, getValidationErrorsForField } =
    usePreferenceForm();

  // Common fields
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  // Individual fields
  const [fullName, setFullName] = useState<string>("");

  // Joint venture fields
  const [companyName, setCompanyName] = useState<string>("");
  const [contactPerson, setContactPerson] = useState<string>("");
  const [cacRegistrationNumber, setCacRegistrationNumber] =
    useState<string>("");

  // Get validation errors
  const emailErrors = getValidationErrorsForField("contactInfo.email");
  const phoneErrors = getValidationErrorsForField("contactInfo.phoneNumber");
  const fullNameErrors = getValidationErrorsForField("contactInfo.fullName");
  const companyNameErrors = getValidationErrorsForField(
    "contactInfo.companyName",
  );
  const contactPersonErrors = getValidationErrorsForField(
    "contactInfo.contactPerson",
  );

  // Initialize from context data and clear when form is reset
  useEffect(() => {
    // If formData is empty (form was reset), clear all local state
    if (
      !state.formData ||
      Object.keys(state.formData).length === 0 ||
      !state.formData.contactInfo
    ) {
      setEmail("");
      setPhoneNumber("");
      setFullName("");
      setCompanyName("");
      setContactPerson("");
      setCacRegistrationNumber("");
      return;
    }

    if (state.formData.contactInfo) {
      const contact = state.formData.contactInfo as any;
      setEmail(contact.email || "");
      setPhoneNumber(contact.phoneNumber || "");

      if (preferenceType === "joint-venture") {
        setCompanyName(contact.companyName || "");
        setContactPerson(contact.contactPerson || "");
        setCacRegistrationNumber(contact.cacRegistrationNumber || "");
        setFullName(""); // Clear other preference type fields
      } else {
        setFullName(contact.fullName || "");
        setCompanyName(""); // Clear joint venture fields
        setContactPerson("");
        setCacRegistrationNumber("");
      }
    }
  }, [state.formData, preferenceType]);

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

      updateFormData({
        contactInfo: contactData,
      });
    } else {
      const contactData = {
        fullName,
        email,
        phoneNumber,
      };

      updateFormData({
        contactInfo: contactData,
      });
    }
  }, [
    preferenceType,
    fullName,
    companyName,
    contactPerson,
    email,
    phoneNumber,
    cacRegistrationNumber,
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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Contact Information
        </h3>
        <p className="text-sm text-gray-600">
          {preferenceType === "joint-venture"
            ? "Provide your company details for partnership opportunities"
            : "We'll use this information to contact you about matching properties"}
        </p>
      </div>

      {/* Contact Form */}
      <div className="space-y-6">
        {preferenceType === "joint-venture" ? (
          // Joint Venture Contact Form
          <>
            {/* Company Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  Company / Developer Name{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company or developer name"
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all duration-200 placeholder-gray-400 ${
                    companyNameErrors.length > 0
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : companyName
                        ? "border-emerald-500 focus:border-emerald-500"
                        : "border-gray-200 focus:border-emerald-500"
                  }`}
                />
                {companyNameErrors.length > 0 && (
                  <p className="text-sm text-red-500 font-medium">
                    {companyNameErrors[0].message}
                  </p>
                )}
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
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all duration-200 placeholder-gray-400 ${
                    contactPersonErrors.length > 0
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : contactPerson
                        ? "border-emerald-500 focus:border-emerald-500"
                        : "border-gray-200 focus:border-emerald-500"
                  }`}
                />
                {contactPersonErrors.length > 0 && (
                  <p className="text-sm text-red-500 font-medium">
                    {contactPersonErrors[0].message}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Details */}
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
                  className={`modern-phone-input ${
                    phoneErrors.length > 0
                      ? "error"
                      : phoneNumber && isValidPhone(phoneNumber)
                        ? "valid"
                        : ""
                  }`}
                />
                {phoneErrors.length > 0 && (
                  <p className="text-sm text-red-500 font-medium">
                    {phoneErrors[0].message}
                  </p>
                )}
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
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all duration-200 placeholder-gray-400 ${
                    emailErrors.length > 0
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : email && isValidEmail(email)
                        ? "border-emerald-500 focus:border-emerald-500"
                        : "border-gray-200 focus:border-emerald-500"
                  }`}
                />
                {emailErrors.length > 0 && (
                  <p className="text-sm text-red-500 font-medium">
                    {emailErrors[0].message}
                  </p>
                )}
              </div>
            </div>

            {/* CAC Registration Number */}
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
                className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all duration-200 placeholder-gray-400 ${
                  cacRegistrationNumber
                    ? "border-emerald-500 focus:border-emerald-500"
                    : "border-gray-200 focus:border-emerald-500"
                }`}
              />
            </div>
          </>
        ) : (
          // Individual Contact Form
          <>
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
                className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all duration-200 placeholder-gray-400 ${
                  fullNameErrors.length > 0
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : fullName
                      ? "border-emerald-500 focus:border-emerald-500"
                      : "border-gray-200 focus:border-emerald-500"
                }`}
              />
              {fullNameErrors.length > 0 && (
                <p className="text-sm text-red-500 font-medium">
                  {fullNameErrors[0].message}
                </p>
              )}
            </div>

            {/* Phone and Email */}
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
                  className={`modern-phone-input ${
                    phoneErrors.length > 0
                      ? "error"
                      : phoneNumber && isValidPhone(phoneNumber)
                        ? "valid"
                        : ""
                  }`}
                />
                {phoneErrors.length > 0 && (
                  <p className="text-sm text-red-500 font-medium">
                    {phoneErrors[0].message}
                  </p>
                )}
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
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all duration-200 placeholder-gray-400 ${
                    emailErrors.length > 0
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : email && isValidEmail(email)
                        ? "border-emerald-500 focus:border-emerald-500"
                        : "border-gray-200 focus:border-emerald-500"
                  }`}
                />
                {emailErrors.length > 0 && (
                  <p className="text-sm text-red-500 font-medium">
                    {emailErrors[0].message}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="text-blue-500 mt-0.5">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div>
            <h5 className="text-sm font-semibold text-blue-800">
              Privacy & Security
            </h5>
            <p className="text-xs text-blue-700 mt-1">
              Your contact information is secure and will only be used to match
              you with suitable properties and communicate about your
              preferences. We never share your data with third parties without
              consent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInformation;
