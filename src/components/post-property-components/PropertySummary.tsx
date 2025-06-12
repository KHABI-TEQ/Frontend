import React, { useState, useEffect } from "react";
import Button from "@/components/general-components/button";

// Define the sections and their fields (with headers)
const SECTIONS: { title: string; fields: string[] }[] = [
  {
    title: "Property Details",
    fields: [
      "propertyType",
      "propertyCondition",
      "typeOfBuilding",
      "selectedState",
      "selectedLGA",
      "selectedCity",
      "landSize",
      "measurementType",
      "price",
      "leaseHold",
      "noOfBedroom",
      "noOfBathroom",
      "noOfToilet",
      "noOfCarPark",
      "isTenanted",
    ],
  },
  {
    title: "Feature & Conditions",
    fields: [
      "features",
      "documents",
      "jvConditions",
      "tenantCriteria",
    ],
  },
];

const FIELD_LABELS: Record<string, string> = {
  propertyType: "Property Type",
  propertyCondition: "Property Condition",
  typeOfBuilding: "Type of Building",
  selectedState: "State",
  selectedLGA: "Local Government",
  selectedCity: "Area",
  landSize: "Land Size",
  measurementType: "Measurement Type",
  price: "Price",
  leaseHold: "Lease Hold",
  ownerFullName: "Owner Name",
  ownerPhoneNumber: "Owner Phone",
  ownerEmail: "Owner Email",
  noOfBedroom: "Number of Bedroom",
  noOfBathroom: "Number of Bathroom",
  noOfToilet: "Number of Toilet",
  noOfCarPark: "Number of Car Park",
  documents: "Documents on Property",
  features: "Features",
  jvConditions: "JV Conditions",
  tenantCriteria: "Tenant Criteria",
  isTenanted: "Property Tenanted Status",
};

interface PropertySummaryProps {
  values: Record<string, any>;
  images: (string | null)[];
  onEdit: () => void;
  onSubmit?: () => void;
  submitButtonType?: "button" | "submit";
  formik?: any;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size));
  }
  return res;
}

const PropertySummary: React.FC<PropertySummaryProps> = ({
  values,
  images,
  onEdit,
  onSubmit,
  submitButtonType,
}) => {
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);
  const [isYesDisabled, setIsYesDisabled] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const [submitBtnText, setSubmitBtnText] = useState("Submit");

  useEffect(() => {
    setSubmitBtnText(isSubmitDisabled ? "Submitting..." : "Submit");
  }, [isSubmitDisabled]);

  // Hide modal if submission is in progress or after submit
  useEffect(() => {
    if (isSubmitDisabled) {
      setShowSubmitConfirmModal(false);
    }
  }, [isSubmitDisabled]);

  // Collect all fields used in the main sections
  const allSectionFields = SECTIONS.flatMap((section) => section.fields);

  // Find any additional info fields (not in main sections, not owner info, not addtionalInfo, not areYouTheOwner)
  const additionalFields = Object.keys(values).filter(
    (key) =>
      !allSectionFields.includes(key) &&
      !["ownerFullName", "ownerPhoneNumber", "ownerEmail", "addtionalInfo", "areYouTheOwner"].includes(key) &&
      values[key] !== undefined &&
      values[key] !== "" &&
      !(Array.isArray(values[key]) && values[key].length === 0)
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded shadow p-6 my-10 w-[90%] mx-auto">
        <div className="flex flex-col gap-6">
          {SECTIONS.map((section) => {
            // Filter fields that have values
            const sectionFields = section.fields.filter(
              (key) =>
                values[key] !== undefined &&
                values[key] !== "" &&
                !(Array.isArray(values[key]) && values[key].length === 0)
            );
            if (sectionFields.length === 0) return null;

            // Arrange fields in groups of 3, then flex into 2 columns
            const groupsOf3 = chunk(sectionFields, 3);

            return (
              <div key={section.title} className="mb-4">
                <h3 className="font-bold text-lg mb-2 text-[#09391C]">
                  {section.title}
                </h3>
                {groupsOf3.map((group, groupIdx) => (
                  <div
                    key={groupIdx}
                    className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-2 ${groupIdx > 0 ? "mt-4" : ""}`}
                  >
                    <div className="flex flex-col gap-2">
                      {group.map((key) => {
                        const value = values[key];
                        if (Array.isArray(value) && value.length > 0) {
                          return (
                            <div key={key} className="text-sm bg-[#F7F7F8] px-3 py-1">
                              {FIELD_LABELS[key] || key}: <span className="font-semibold">{value.join(", ")}</span>
                            </div>
                          );
                        }
                        if (value && !Array.isArray(value)) {
                          return (
                            <div key={key} className="text-sm bg-[#F7F7F8] px-3 py-1">
                              {FIELD_LABELS[key] || key}: <span className="font-semibold">{value}</span>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
          {/* Additional Info Section */}
          {(additionalFields.length > 0 || values.addtionalInfo) && (
            <div className="mb-4">
              <h3 className="font-bold text-lg mb-2 text-[#09391C]">
                Additional Info
              </h3>
              {chunk(additionalFields, 3).map((group, idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-2 ${idx > 0 ? "mt-4" : ""}`}
                >
                  <div className="flex flex-col gap-2">
                    {group.map((key) => {
                      const value = values[key];
                      if (Array.isArray(value) && value.length > 0) {
                        return (
                          <div key={key} className="text-sm bg-[#F7F7F8] px-3 py-1">
                            {FIELD_LABELS[key] || key}: <span className="font-semibold">{value.join(", ")}</span>
                          </div>
                        );
                      }
                      if (value && !Array.isArray(value)) {
                        return (
                          <div key={key} className="text-sm bg-[#F7F7F8] px-3 py-1">
                            {FIELD_LABELS[key] || key}: <span className="font-semibold">{value}</span>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              ))}
              {values.addtionalInfo && (
                <div className="w-full text-sm bg-[#F7F7F8] px-3 py-2 mt-2 rounded">
                  <span className="font-semibold">Additional Information:</span>{" "}
                  {values.addtionalInfo}
                </div>
              )}
            </div>
          )}
          {/* Images Preview */}
          {images.filter(Boolean).length > 0 && (
            <div className="w-full">
              <div className="flex flex-wrap gap-4 mt-2">
                {images.filter(Boolean).map((img, idx) => (
                  <img
                    key={idx}
                    src={img as string}
                    alt={`Preview ${idx + 1}`}
                    className="w-16 sm:w-20 md:w-24 h-auto max-w-full object-cover rounded border"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Buttons outside the white container */}
      <div className="flex items-center mt-8 gap-5 justify-between">
        <Button
          value="Edit"
          type="button"
          onClick={onEdit}
          className="border-[1px] border-black w-[40%] text-black text-base font-bold min-h-[50px] py-[12px] px-[24px]"
        />
        <Button
          value={submitBtnText}
          type="button"
          onClick={() => setShowSubmitConfirmModal(true)}
          className="bg-[#8DDB90] w-[40%] text-white text-base font-bold min-h-[50px] py-[12px] px-[24px]"
          isDisabled={isSubmitDisabled}
        />
      </div>
      {showSubmitConfirmModal && !isSubmitDisabled && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div
            className="bg-white shadow-lg p-10 w-[80%] max-w-[95vw] sm:max-w-[500px] min-w-[0] flex flex-col items-center justify-center"
            style={{ borderRadius: "12px" }}
          >
            <p className="text-2xl font-semibold mb-8 text-[#09391C]">Are you sure you want to submit?</p>
            <div className="flex w-full gap-6">
              <button
                type="button"
                className="flex-1 py-3 rounded bg-[#8DDB90] text-[#0B423D] font-bold border border-[#8DDB90] transition text-lg"
                disabled={isYesDisabled}
                onClick={async () => {
                  setIsYesDisabled(true);
                  setIsSubmitDisabled(true);
                  setShowSubmitConfirmModal(false);
                  if (onSubmit) {
                    await onSubmit();
                  }
                  setIsYesDisabled(false);
                  setIsSubmitDisabled(false);
                }}
              >
                Yes
              </button>
              <button
                type="button"
                className="flex-1 py-3 rounded bg-white text-[#FF2539] font-bold border border-[#FF2539] transition text-lg"
                onClick={() => setShowSubmitConfirmModal(false)}
              >
                Not yet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertySummary;