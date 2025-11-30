"use client";

import React from "react";
import { FormikProps } from "formik";
import RadioCheck from "@/components/general-components/radioCheck";
import Input from "@/components/general-components/Input";

interface Step4Props {
  formik: FormikProps<any>;
  areInputsDisabled: boolean;
}

const Step4OwnershipDeclaration: React.FC<Step4Props> = ({
  formik,
  areInputsDisabled,
}) => {
  return (
    <div className="min-h-[629px] py-[10px] lg:px-[80px] border-[#8D909680] w-full">
      <h2 className="text-[#0B0D0C] lg:text-[24px] lg:leading-[40.4px] font-bold font-display text-center text-[18px] leading-[40.4px] mt-7">
        Ownership & Contact Details
      </h2>
      <div className="w-full min-h-[629px] flex flex-col gap-[30px]">
        {/* Property Ownership */}
        <div className="min-h-[73px] gap-[15px] flex flex-col w-full">
          <h2 className="text-[20px] leading-[32px] font-medium text-[#1E1E1E]">
            Property Ownership
          </h2>
          <div className="w-full gap-[20px] lg:gap-[50px] flex flex-row flex-wrap">
            <RadioCheck
              selectedValue={formik.values?.ownershipType}
              handleChange={() => {
                formik.setFieldValue("ownershipType", "Owner");
              }}
              type="radio"
              value="Owner"
              name="ownershipType"
              isDisabled={areInputsDisabled}
            />
            <RadioCheck
              selectedValue={formik.values?.ownershipType}
              handleChange={() => {
                formik.setFieldValue("ownershipType", "Agent/Broker");
              }}
              type="radio"
              name="ownershipType"
              value="Agent/Broker"
              isDisabled={areInputsDisabled}
            />
            <RadioCheck
              selectedValue={formik.values?.ownershipType}
              handleChange={() => {
                formik.setFieldValue("ownershipType", "Property Manager");
              }}
              type="radio"
              name="ownershipType"
              value="Property Manager"
              isDisabled={areInputsDisabled}
            />
          </div>
          {formik.touched.ownershipType && formik.errors.ownershipType && (
            <span className="text-red-600 text-sm">
              {String(formik.errors.ownershipType)}
            </span>
          )}
        </div>

        {/* Contact Information */}
        <div className="min-h-[127px] w-full flex flex-col gap-[15px]">
          <h2 className="text-[20px] leading-[32px] font-medium text-[#1E1E1E]">
            Contact Information
          </h2>
          <div className="min-h-[80px] flex gap-[15px] lg:grid lg:grid-cols-2 flex-col">
            <Input
              label="Full Name"
              name="contactName"
              placeholder="Enter your full name"
              forState={false}
              forLGA={false}
              onChange={formik.handleChange}
              value={formik.values.contactName || ""}
              type="text"
              isDisabled={areInputsDisabled}
            />
            <Input
              label="Phone Number"
              name="contactPhone"
              placeholder="Enter your phone number"
              forState={false}
              forLGA={false}
              onChange={formik.handleChange}
              value={formik.values.contactPhone || ""}
              type="tel"
              isDisabled={areInputsDisabled}
            />
          </div>
          <div className="min-h-[80px] flex gap-[15px] lg:grid lg:grid-cols-2 flex-col">
            <Input
              label="Email Address"
              name="contactEmail"
              placeholder="Enter your email address"
              forState={false}
              forLGA={false}
              onChange={formik.handleChange}
              value={formik.values.contactEmail || ""}
              type="email"
              isDisabled={areInputsDisabled}
            />
            <Input
              label="WhatsApp Number (Optional)"
              name="whatsappNumber"
              placeholder="Enter WhatsApp number"
              forState={false}
              forLGA={false}
              onChange={formik.handleChange}
              value={formik.values.whatsappNumber || ""}
              type="tel"
              isDisabled={areInputsDisabled}
            />
          </div>
          {((formik.touched.contactName && formik.errors.contactName) ||
            (formik.touched.contactPhone && formik.errors.contactPhone) ||
            (formik.touched.contactEmail && formik.errors.contactEmail)) && (
            <div className="text-red-600 text-sm space-y-1">
              {formik.touched.contactName && formik.errors.contactName && (
                <div>{String(formik.errors.contactName)}</div>
              )}
              {formik.touched.contactPhone && formik.errors.contactPhone && (
                <div>{String(formik.errors.contactPhone)}</div>
              )}
              {formik.touched.contactEmail && formik.errors.contactEmail && (
                <div>{String(formik.errors.contactEmail)}</div>
              )}
            </div>
          )}
        </div>

        {/* Availability Schedule */}
        <div className="min-h-[73px] gap-[15px] flex flex-col w-full">
          <h2 className="text-[20px] leading-[32px] font-medium text-[#1E1E1E]">
            Best Time to Contact
          </h2>
          <div className="w-full gap-[20px] lg:gap-[30px] flex flex-row flex-wrap">
            <RadioCheck
              selectedValue={formik.values?.bestTimeToContact}
              handleChange={() => {
                formik.setFieldValue(
                  "bestTimeToContact",
                  "Morning (9AM - 12PM)",
                );
              }}
              type="radio"
              value="Morning (9AM - 12PM)"
              name="bestTimeToContact"
              isDisabled={areInputsDisabled}
            />
            <RadioCheck
              selectedValue={formik.values?.bestTimeToContact}
              handleChange={() => {
                formik.setFieldValue(
                  "bestTimeToContact",
                  "Afternoon (12PM - 5PM)",
                );
              }}
              type="radio"
              name="bestTimeToContact"
              value="Afternoon (12PM - 5PM)"
              isDisabled={areInputsDisabled}
            />
            <RadioCheck
              selectedValue={formik.values?.bestTimeToContact}
              handleChange={() => {
                formik.setFieldValue(
                  "bestTimeToContact",
                  "Evening (5PM - 8PM)",
                );
              }}
              type="radio"
              name="bestTimeToContact"
              value="Evening (5PM - 8PM)"
              isDisabled={areInputsDisabled}
            />
            <RadioCheck
              selectedValue={formik.values?.bestTimeToContact}
              handleChange={() => {
                formik.setFieldValue("bestTimeToContact", "Anytime");
              }}
              type="radio"
              name="bestTimeToContact"
              value="Anytime"
              isDisabled={areInputsDisabled}
            />
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="min-h-[100px] gap-[15px] flex flex-col w-full">
          <h2 className="text-[20px] leading-[32px] font-medium text-[#1E1E1E]">
            Declaration & Agreement
          </h2>
          <div className="bg-[#F8F9FA] rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3">
              <RadioCheck
                selectedValue={formik.values?.agreeToTerms}
                handleChange={() => {
                  formik.setFieldValue(
                    "agreeToTerms",
                    !formik.values?.agreeToTerms,
                  );
                }}
                type="checkbox"
                value="true"
                name="agreeToTerms"
                isDisabled={areInputsDisabled}
              />
              <label className="text-[14px] text-[#1E1E1E] leading-relaxed">
                I confirm that I am authorized to list this property and that
                all information provided is accurate and truthful.
              </label>
            </div>

            <div className="flex items-start gap-3">
              <RadioCheck
                selectedValue={formik.values?.agreeToMarketing}
                handleChange={() => {
                  formik.setFieldValue(
                    "agreeToMarketing",
                    !formik.values?.agreeToMarketing,
                  );
                }}
                type="checkbox"
                value="true"
                name="agreeToMarketing"
                isDisabled={areInputsDisabled}
              />
              <label className="text-[14px] text-[#1E1E1E] leading-relaxed">
                I agree to KhabiTeq&apos;s terms and conditions and authorize
                the marketing of this property on the platform.
              </label>
            </div>

            <div className="flex items-start gap-3">
              <RadioCheck
                selectedValue={formik.values?.agreeToDataUsage}
                handleChange={() => {
                  formik.setFieldValue(
                    "agreeToDataUsage",
                    !formik.values?.agreeToDataUsage,
                  );
                }}
                type="checkbox"
                value="true"
                name="agreeToDataUsage"
                isDisabled={areInputsDisabled}
              />
              <label className="text-[14px] text-[#1E1E1E] leading-relaxed">
                I consent to the collection and use of my personal data for
                property listing and communication purposes.
              </label>
            </div>
          </div>

          {((formik.touched.agreeToTerms && formik.errors.agreeToTerms) ||
            (formik.touched.agreeToMarketing &&
              formik.errors.agreeToMarketing) ||
            (formik.touched.agreeToDataUsage &&
              formik.errors.agreeToDataUsage)) && (
            <div className="text-red-600 text-sm space-y-1">
              {formik.touched.agreeToTerms && formik.errors.agreeToTerms && (
                <div>{String(formik.errors.agreeToTerms)}</div>
              )}
              {formik.touched.agreeToMarketing &&
                formik.errors.agreeToMarketing && (
                  <div>{String(formik.errors.agreeToMarketing)}</div>
                )}
              {formik.touched.agreeToDataUsage &&
                formik.errors.agreeToDataUsage && (
                  <div>{String(formik.errors.agreeToDataUsage)}</div>
                )}
            </div>
          )}
        </div>

        {/* Additional Notes */}
        <div className="min-h-[127px] w-full flex flex-col gap-[15px]">
          <h2 className="text-[20px] leading-[32px] font-medium text-[#1E1E1E]">
            Additional Notes (Optional)
          </h2>
          <textarea
            name="additionalNotes"
            placeholder="Any additional information you would like to share about the property or listing..."
            className="min-h-[100px] border border-[#8D909680] rounded-[2px] px-3 py-2 text-[#1E1E1E] focus:outline-none focus:border-[#8DDB90] resize-vertical"
            value={formik.values.additionalNotes || ""}
            onChange={formik.handleChange}
            disabled={areInputsDisabled}
          />
        </div>
      </div>
    </div>
  );
};

export default Step4OwnershipDeclaration;
