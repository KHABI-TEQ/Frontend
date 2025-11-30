/** @format */

"use client";
import React, { useState, useEffect, memo } from "react";
import { usePreferenceForm } from "@/context/preference-form-context";

interface JVStep5TitleDocumentationProps {
  className?: string;
}

const TITLE_REQUIREMENTS = [
  {
    value: "certificate-of-occupancy",
    label: "Certificate of Occupancy (C of O)",
    description: "Government-issued title document",
    recommended: true,
  },
  {
    value: "deed-of-assignment",
    label: "Deed of Assignment",
    description: "Legal transfer document from previous owner",
    recommended: true,
  },
  {
    value: "governors-consent",
    label: "Governor's Consent",
    description: "State government approval for land transfer",
    recommended: true,
  },
  {
    value: "survey-plan",
    label: "Survey Plan",
    description: "Official land survey and demarcation",
    recommended: true,
  },
  {
    value: "excision",
    label: "Excision",
    description: "Government approval to remove land from public ownership",
    recommended: false,
  },
  {
    value: "gazette",
    label: "Gazette",
    description: "Official publication of land ownership",
    recommended: false,
  },
  {
    value: "family-receipt",
    label: "Family Receipt",
    description: "Acknowledgment from selling family",
    recommended: false,
  },
];

const JVStep5TitleDocumentation: React.FC<JVStep5TitleDocumentationProps> = memo(
  ({ className = "" }) => {
    const { state, updateFormData } = usePreferenceForm();

    // Local state for documentation requirements
    const [minimumTitleRequirements, setMinimumTitleRequirements] = useState<string[]>([]);
    const [willingToConsiderPendingTitle, setWillingToConsiderPendingTitle] = useState<boolean>(false);
    const [additionalRequirements, setAdditionalRequirements] = useState<string>("");

    // Initialize from existing form data
    useEffect(() => {
      if (state.formData?.developmentDetails) {
        const details = state.formData.developmentDetails as any;
        setMinimumTitleRequirements(details.minimumTitleRequirements || []);
        setWillingToConsiderPendingTitle(details.willingToConsiderPendingTitle || false);
        setAdditionalRequirements(details.additionalRequirements || "");
      }
    }, [state.formData]);

    // Update context when values change
    useEffect(() => {
      updateFormData({
        developmentDetails: {
          ...state.formData?.developmentDetails,
          minimumTitleRequirements,
          willingToConsiderPendingTitle,
          additionalRequirements: additionalRequirements.trim(),
        },
      } as any);
    }, [minimumTitleRequirements, willingToConsiderPendingTitle, additionalRequirements, updateFormData, state.formData?.developmentDetails]);

    const handleTitleRequirementToggle = (requirement: string) => {
      setMinimumTitleRequirements(prev => {
        if (prev.includes(requirement)) {
          return prev.filter(r => r !== requirement);
        } else {
          return [...prev, requirement];
        }
      });
    };

    const recommendedRequirements = TITLE_REQUIREMENTS.filter(req => req.recommended);
    const additionalDocuments = TITLE_REQUIREMENTS.filter(req => !req.recommended);

    return (
      <div className={`space-y-8 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Step 5: Land Title & Documentation Expectations
          </h3>
          <p className="text-sm text-gray-600">
            Specify your minimum requirements for land documentation and title validity
          </p>
        </div>

        {/* Minimum Title Requirements */}
        <div className="space-y-6">
          <h4 className="text-base font-semibold text-gray-800">
            Minimum Title Requirements <span className="text-red-500">*</span>
          </h4>
          <p className="text-sm text-gray-600">
            Select the minimum documentation you require for any land consideration
          </p>

          {/* Recommended Documents */}
          <div className="space-y-4">
            <h5 className="text-sm font-semibold text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
              Recommended Documents
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recommendedRequirements.map((requirement) => {
                const isSelected = minimumTitleRequirements.includes(requirement.value);
                
                return (
                  <div
                    key={requirement.value}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50"
                    }`}
                    onClick={() => handleTitleRequirementToggle(requirement.value)}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Checkbox */}
                      <div className={`w-4 h-4 rounded border-2 mt-1 flex items-center justify-center ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-gray-300"
                      }`}>
                        {isSelected && (
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <h6 className="text-sm font-semibold text-gray-900 mb-1">
                          {requirement.label}
                        </h6>
                        <p className="text-xs text-gray-600">
                          {requirement.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional Documents */}
          <div className="space-y-4">
            <h5 className="text-sm font-semibold text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Additional Documents (Optional)
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {additionalDocuments.map((requirement) => {
                const isSelected = minimumTitleRequirements.includes(requirement.value);
                
                return (
                  <div
                    key={requirement.value}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
                    }`}
                    onClick={() => handleTitleRequirementToggle(requirement.value)}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Checkbox */}
                      <div className={`w-4 h-4 rounded border-2 mt-1 flex items-center justify-center ${
                        isSelected
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}>
                        {isSelected && (
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <h6 className="text-sm font-semibold text-gray-900 mb-1">
                          {requirement.label}
                        </h6>
                        <p className="text-xs text-gray-600">
                          {requirement.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pending Title Consideration */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-gray-800">
            Pending Title Consideration
          </h4>
          <p className="text-sm text-gray-600">
            Are you willing to consider land with pending title documentation?
          </p>
          
          <div className="space-y-3">
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                willingToConsiderPendingTitle
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 bg-white hover:border-emerald-300"
              }`}
              onClick={() => setWillingToConsiderPendingTitle(true)}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  willingToConsiderPendingTitle
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-gray-300"
                }`}>
                  {willingToConsiderPendingTitle && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-gray-900">
                    Yes, I'm willing to consider pending titles
                  </h5>
                  <p className="text-xs text-gray-600">
                    Open to land with documentation in progress (with proper verification)
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                !willingToConsiderPendingTitle
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 bg-white hover:border-red-300"
              }`}
              onClick={() => setWillingToConsiderPendingTitle(false)}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  !willingToConsiderPendingTitle
                    ? "border-red-500 bg-red-500"
                    : "border-gray-300"
                }`}>
                  {!willingToConsiderPendingTitle && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-gray-900">
                    No, only complete documentation
                  </h5>
                  <p className="text-xs text-gray-600">
                    Only consider land with all required documents already in place
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Requirements */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-gray-800">
            Additional Documentation Requirements <span className="text-gray-500">(Optional)</span>
          </h4>
          <p className="text-sm text-gray-600">
            Specify any additional documentation or verification requirements
          </p>
          
          <textarea
            value={additionalRequirements}
            onChange={(e) => setAdditionalRequirements(e.target.value)}
            placeholder="e.g., Property verification from lawyer, Environmental Impact Assessment, Soil test results, Community acceptance letter, etc."
            rows={4}
            maxLength={500}
            className="w-full px-3 py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none"
          />
          
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Any specific documentation or verification requirements</span>
            <span>{additionalRequirements.length}/500 characters</span>
          </div>
        </div>

        {/* Requirements Summary */}
        {minimumTitleRequirements.length > 0 && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <h5 className="text-sm font-semibold text-emerald-800 mb-2">
              Documentation Requirements Summary:
            </h5>
            <div className="text-sm text-emerald-700 space-y-2">
              <div>
                <strong>Required Documents:</strong>
                <div className="mt-1 flex flex-wrap gap-1">
                  {minimumTitleRequirements.map((req) => {
                    const reqData = TITLE_REQUIREMENTS.find(r => r.value === req);
                    return (
                      <span
                        key={req}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded"
                      >
                        {reqData?.label}
                      </span>
                    );
                  })}
                </div>
              </div>
              <p>
                <strong>Pending Title:</strong>{" "}
                {willingToConsiderPendingTitle ? "Will consider" : "Will not consider"}
              </p>
            </div>
          </div>
        )}

        {/* Documentation Guidelines */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="text-amber-500 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-800 mb-1">
                Important Documentation Notes
              </h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Always verify documents with relevant government agencies</li>
                <li>• Consider hiring a property lawyer for due diligence</li>
                <li>• Pending titles may require additional time and costs to perfect</li>
                <li>• Some documents may have expiry dates or renewal requirements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

JVStep5TitleDocumentation.displayName = "JVStep5TitleDocumentation";

export default JVStep5TitleDocumentation;
