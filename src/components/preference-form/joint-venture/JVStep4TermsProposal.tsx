/** @format */

"use client";
import React, { useState, useEffect, memo } from "react";
import { usePreferenceForm } from "@/context/preference-form-context";

interface JVStep4TermsProposalProps {
  className?: string;
}

const SHARING_RATIO_OPTIONS = [
  {
    value: "60:40-developer",
    label: "60:40 (in favour of developer)",
    description: "Developer gets 60%, Landowner gets 40%",
  },
  {
    value: "50:50",
    label: "50:50 (Equal sharing)",
    description: "Equal partnership between developer and landowner",
  },
  {
    value: "40:60-landowner",
    label: "40:60 (in favour of landowner)",
    description: "Developer gets 40%, Landowner gets 60%",
  },
  {
    value: "70:30-developer",
    label: "70:30 (in favour of developer)",
    description: "Developer gets 70%, Landowner gets 30%",
  },
  {
    value: "30:70-landowner",
    label: "30:70 (in favour of landowner)",
    description: "Developer gets 30%, Landowner gets 70%",
  },
  {
    value: "negotiable",
    label: "Negotiable",
    description: "Open to discussion based on specific project requirements",
  },
];

const JVStep4TermsProposal: React.FC<JVStep4TermsProposalProps> = memo(
  ({ className = "" }) => {
    const { state, updateFormData } = usePreferenceForm();

    // Local state for JV terms
    const [preferredSharingRatio, setPreferredSharingRatio] = useState<string>("");
    const [proposalDetails, setProposalDetails] = useState<string>("");

    // Initialize from existing form data
    useEffect(() => {
      if (state.formData?.developmentDetails) {
        const details = state.formData.developmentDetails as any;
        setPreferredSharingRatio(details.preferredSharingRatio || "");
        setProposalDetails(details.proposalDetails || "");
      }
    }, [state.formData]);

    // Update context when values change
    useEffect(() => {
      updateFormData({
        developmentDetails: {
          ...state.formData?.developmentDetails,
          preferredSharingRatio: preferredSharingRatio.trim(),
          proposalDetails: proposalDetails.trim(),
        },
      } as any);
    }, [preferredSharingRatio, proposalDetails, updateFormData, state.formData?.developmentDetails]);

    return (
      <div className={`space-y-8 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Step 4: JV Terms & Proposal
          </h3>
          <p className="text-sm text-gray-600">
            Define your preferred joint venture terms and sharing arrangements
          </p>
        </div>

        {/* Preferred Sharing Ratio */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-gray-800">
            Preferred Sharing Ratio <span className="text-red-500">*</span>
          </h4>
          <p className="text-sm text-gray-600">
            Select your preferred profit/ownership sharing ratio for joint venture projects
          </p>

          <div className="space-y-3">
            {SHARING_RATIO_OPTIONS.map((option) => (
              <div
                key={option.value}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  preferredSharingRatio === option.value
                    ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100"
                    : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50"
                }`}
                onClick={() => setPreferredSharingRatio(option.value)}
              >
                <div className="flex items-start space-x-3">
                  {/* Radio Button */}
                  <div className={`w-4 h-4 rounded-full border-2 mt-1 flex items-center justify-center ${
                    preferredSharingRatio === option.value
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-gray-300"
                  }`}>
                    {preferredSharingRatio === option.value && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h5 className="text-sm font-semibold text-gray-900 mb-1">
                      {option.label}
                    </h5>
                    <p className="text-sm text-gray-600">
                      {option.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Proposal Details */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-gray-800">
            Additional Proposal Details <span className="text-gray-500">(Optional)</span>
          </h4>
          <p className="text-sm text-gray-600">
            Provide additional details about your joint venture proposal, expectations, or special requirements
          </p>
          
          <textarea
            value={proposalDetails}
            onChange={(e) => setProposalDetails(e.target.value)}
            placeholder="e.g., Timeline expectations, specific construction standards, financing arrangements, project management approach, etc."
            rows={6}
            maxLength={1000}
            className="w-full px-3 py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none"
          />
          
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Describe your proposal approach, timeline, or any special requirements</span>
            <span>{proposalDetails.length}/1000 characters</span>
          </div>
        </div>

        {/* Selected Terms Summary */}
        {preferredSharingRatio && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <h5 className="text-sm font-semibold text-emerald-800 mb-2">
              Selected Terms Summary:
            </h5>
            <div className="text-sm text-emerald-700">
              <p className="mb-2">
                <strong>Sharing Ratio:</strong>{" "}
                {SHARING_RATIO_OPTIONS.find(o => o.value === preferredSharingRatio)?.label}
              </p>
              {proposalDetails && (
                <div>
                  <strong>Additional Details:</strong>
                  <p className="mt-1 text-emerald-600 italic">
                    {proposalDetails.length > 100 
                      ? `${proposalDetails.substring(0, 100)}...`
                      : proposalDetails
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* JV Terms Guidelines */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="text-blue-500 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-800 mb-1">
                Joint Venture Best Practices
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Sharing ratios can be negotiated based on land value and development costs</li>
                <li>• Consider who provides land, financing, construction management, and marketing</li>
                <li>• Clear timelines and milestones help ensure project success</li>
                <li>• Legal documentation and proper agreements are essential</li>
                <li>• Factor in market conditions and location premiums</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

JVStep4TermsProposal.displayName = "JVStep4TermsProposal";

export default JVStep4TermsProposal;
