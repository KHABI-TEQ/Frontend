"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { PUT_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import AttachFile from "@/components/general-components/attach_file";
import { CheckCircle2, Clock, FileText, Plus, X } from "lucide-react";
import { getCookie } from "cookies-next";
import { getLGAsByState, PILOT_STATE, isPilotState, PILOT_LOCATION_MESSAGE } from "@/utils/location-utils";
import ProcessingRequest from "@/components/loading-component/ProcessingRequest";
import { handleApiError } from "@/utils/handleApiError";
import { useDeveloperPlanEntitlement } from "@/hooks/useDeveloperPlanEntitlement";
import toast from "react-hot-toast";

type KycTier = "basic" | "advanced";

const basicSchema = Yup.object({
  practitionerType: Yup.string().oneOf(["Individual", "Company"]).required("Choose individual or company"),
  profileBio: Yup.string().required("Tell buyers who you are").max(800),
  regionOfOperation: Yup.array().of(Yup.string()).min(1, "Select at least one region"),
  companyName: Yup.string().when("practitionerType", {
    is: "Company",
    then: (schema) => schema.required("Company name is required"),
    otherwise: (schema) => schema.optional(),
  }),
});

const advancedSchema = basicSchema.concat(
  Yup.object({
    companyName: Yup.string().required("Company name is required"),
    cacNumber: Yup.string().required("CAC number is required"),
    street: Yup.string().required("Street is required"),
    homeNo: Yup.string().required("House number is required"),
    state: Yup.string()
      .required("State is required")
      .test("pilot-state", PILOT_LOCATION_MESSAGE, (value) => isPilotState(value)),
    localGovtArea: Yup.string().required("Local government is required"),
    idType: Yup.string().required("ID type is required"),
    idUrl: Yup.string().required("Upload at least one ID"),
    projectName: Yup.string().required("Project name is required"),
    projectLocation: Yup.string().required("Project location is required"),
    projectStage: Yup.string().required("Project stage is required"),
    expectedCompletion: Yup.string().required("Expected completion is required"),
    supportingDocs: Yup.array().of(Yup.string()).min(1, "Upload at least one supporting document"),
  })
);

export default function DeveloperKycForm() {
  const { entitlement, loading, refresh } = useDeveloperPlanEntitlement();
  const [tier, setTier] = useState<KycTier>("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTier, setSubmittedTier] = useState<KycTier | null>(null);
  const regionOptions = useMemo(() => getLGAsByState(PILOT_STATE), []);

  const formik = useFormik({
    initialValues: {
      practitionerType: "Company" as "Individual" | "Company",
      profileBio: "",
      regionOfOperation: [] as string[],
      companyName: "",
      cacNumber: "",
      street: "",
      homeNo: "",
      state: PILOT_STATE,
      localGovtArea: "",
      idType: "",
      idUrl: "",
      projectName: "",
      projectLocation: "",
      projectStage: "",
      expectedCompletion: "",
      supportingDocs: [] as string[],
    },
    validationSchema: tier === "advanced" ? advancedSchema : basicSchema,
    enableReinitialize: false,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const token = getCookie("token") as string;
        const payload: Record<string, unknown> = {
          kycTier: tier,
          practitionerType: values.practitionerType,
          agentType: values.practitionerType,
          profileBio: values.profileBio,
          regionOfOperation: values.regionOfOperation,
          companyDetails: {
            companyName: values.companyName,
            cacNumber: values.cacNumber,
          },
        };
        if (tier === "advanced") {
          payload.address = {
            street: values.street,
            homeNo: values.homeNo,
            state: values.state,
            localGovtArea: values.localGovtArea,
          };
          payload.meansOfId = [{ name: values.idType, docImg: [values.idUrl] }];
          payload.advancedKyc = {
            companyName: values.companyName,
            cacNumber: values.cacNumber,
            projectName: values.projectName,
            projectLocation: values.projectLocation,
            projectStage: values.projectStage,
            expectedCompletion: values.expectedCompletion,
            supportingDocs: values.supportingDocs,
          };
        }
        const response = await PUT_REQUEST(`${URLS.BASE}${URLS.submitKyc}`, payload, token);
        if (!response.success) {
          handleApiError(response);
          return;
        }
        setSubmittedTier(tier);
        toast.success(
          tier === "advanced"
            ? "Advanced KYC submitted for review."
            : "Developer profile saved. You can now list completed properties."
        );
        await refresh();
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const lgas = formik.values.state ? getLGAsByState(formik.values.state) : [];

  const toggleRegion = (value: string) => {
    const current = formik.values.regionOfOperation;
    formik.setFieldValue(
      "regionOfOperation",
      current.includes(value) ? current.filter((r) => r !== value) : [...current, value]
    );
  };

  if (loading && !entitlement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EEF1F1]">
        <ProcessingRequest isVisible title="Loading" message="Fetching your developer profile..." />
      </div>
    );
  }

  if (entitlement?.advancedKycApproved) {
    return (
      <div className="min-h-screen bg-[#EEF1F1] py-10 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-xl border border-gray-200 p-8 text-center">
          <CheckCircle2 className="mx-auto text-[#8DDB90] mb-4" size={48} />
          <h1 className="text-2xl font-semibold text-[#09391C]">Advanced KYC approved</h1>
          <p className="text-[#5A5D63] mt-2">
            Your developer verification is complete. Subscribe to Off-Plan to list off-plan projects.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard" className="px-5 py-2 rounded-lg bg-[#8DDB90] text-white font-medium">
              Dashboard
            </Link>
            <Link href="/agent-subscriptions?tab=plans" className="px-5 py-2 rounded-lg border border-[#8DDB90] text-[#09391C] font-medium">
              Subscribe
            </Link>
            <Link href="/pricing" className="px-5 py-2 rounded-lg border border-gray-200 text-[#09391C] font-medium">
              View professional plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (entitlement?.advancedKycStatus === "pending" || entitlement?.advancedKycStatus === "in_review" || submittedTier === "advanced") {
    return (
      <div className="min-h-screen bg-[#EEF1F1] py-10 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Clock className="mx-auto text-[#8DDB90] mb-4" size={48} />
          <h1 className="text-2xl font-semibold text-[#09391C]">Advanced KYC pending review</h1>
          <p className="text-[#5A5D63] mt-2">
            We are reviewing your business and project information. You can still list completed properties and accept professionals on an active Distribution plan.
          </p>
          <Link href="/dashboard" className="inline-block mt-6 px-5 py-2 rounded-lg bg-[#8DDB90] text-white font-medium">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF1F1] py-8 px-4">
      <ProcessingRequest isVisible={isSubmitting} title="Saving" message="Submitting your developer details..." />
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard" className="text-sm text-[#09391C] hover:underline">
          ← Back to dashboard
        </Link>
        <h1 className="text-3xl font-bold text-[#09391C] mt-3">Developer verification</h1>
        <p className="text-[#5A5D63] mt-2">
          Start with a basic profile to establish presence. Advanced KYC unlocks off-plan listing after approval.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {(["basic", "advanced"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setTier(option)}
              className={`rounded-lg border px-4 py-3 text-left ${
                tier === option ? "border-[#8DDB90] bg-white" : "border-gray-200 bg-white/70"
              }`}
            >
              <p className="font-semibold text-[#09391C]">
                {option === "basic" ? "Basic profile" : "Advanced KYC"}
              </p>
              <p className="text-xs text-[#5A5D63] mt-1">
                {option === "basic"
                  ? "Company or individual, bio, and regions."
                  : "Business IDs plus project details for off-plan."}
              </p>
            </button>
          ))}
        </div>

        <form onSubmit={formik.handleSubmit} className="mt-6 bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#09391C] mb-2">Account type</label>
            <div className="flex gap-3">
              {(["Individual", "Company"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => formik.setFieldValue("practitionerType", type)}
                  className={`px-4 py-2 rounded-lg border text-sm ${
                    formik.values.practitionerType === type
                      ? "bg-[#09391C] text-white border-[#09391C]"
                      : "bg-white text-[#09391C] border-gray-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#09391C] mb-1">Company name</label>
            <input
              name="companyName"
              value={formik.values.companyName}
              onChange={formik.handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2"
              placeholder="Registered company or trading name"
            />
            {formik.touched.companyName && formik.errors.companyName && (
              <p className="text-xs text-red-600 mt-1">{formik.errors.companyName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#09391C] mb-1">Profile bio</label>
            <textarea
              name="profileBio"
              value={formik.values.profileBio}
              onChange={formik.handleChange}
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2"
              placeholder="Whether you sell completed properties or develop off-plan projects, introduce your work."
            />
            {formik.touched.profileBio && formik.errors.profileBio && (
              <p className="text-xs text-red-600 mt-1">{formik.errors.profileBio}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#09391C] mb-2">Lagos LGAs of operation</label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {regionOptions.map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => toggleRegion(region)}
                  className={`px-3 py-1 rounded-full text-xs border ${
                    formik.values.regionOfOperation.includes(region)
                      ? "bg-[#09391C] text-white border-[#09391C]"
                      : "bg-white text-[#09391C] border-gray-200"
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
            {formik.touched.regionOfOperation && formik.errors.regionOfOperation && (
              <p className="text-xs text-red-600 mt-1">{String(formik.errors.regionOfOperation)}</p>
            )}
          </div>

          {tier === "advanced" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#09391C] mb-1">CAC number</label>
                  <input
                    name="cacNumber"
                    value={formik.values.cacNumber}
                    onChange={formik.handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                  />
                  {formik.touched.cacNumber && formik.errors.cacNumber && (
                    <p className="text-xs text-red-600 mt-1">{formik.errors.cacNumber}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#09391C] mb-1">House / office number</label>
                  <input
                    name="homeNo"
                    value={formik.values.homeNo}
                    onChange={formik.handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#09391C] mb-1">Street address</label>
                <input
                  name="street"
                  value={formik.values.street}
                  onChange={formik.handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#09391C] mb-1">State</label>
                  <select
                    name="state"
                    value={formik.values.state || PILOT_STATE}
                    disabled
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 cursor-not-allowed"
                  >
                    <option value={PILOT_STATE}>{PILOT_STATE}</option>
                  </select>
                  <p className="text-xs text-[#5A5D63] mt-1">Lagos State only (pilot location)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#09391C] mb-1">Local government</label>
                  <select
                    name="localGovtArea"
                    value={formik.values.localGovtArea}
                    onChange={formik.handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                  >
                    <option value="">Select LGA</option>
                    {lgas.map((lga) => (
                      <option key={lga} value={lga}>
                        {lga}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#09391C] mb-1">Means of ID</label>
                <input
                  name="idType"
                  value={formik.values.idType}
                  onChange={formik.handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-2"
                  placeholder="NIN, driver’s licence, or international passport"
                />
                <AttachFile
                  id="developer-id"
                  heading={formik.values.idUrl ? "Replace ID document" : "Upload ID document"}
                  acceptedFileTypes="image/*,.pdf"
                  setFileUrl={(url: string | null) => formik.setFieldValue("idUrl", url || "")}
                />
                {formik.values.idUrl && (
                  <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1">
                    <FileText size={12} /> Document attached
                  </p>
                )}
              </div>
              <div className="border-t border-gray-100 pt-4">
                <h2 className="font-semibold text-[#09391C] mb-3">Project information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    name="projectName"
                    value={formik.values.projectName}
                    onChange={formik.handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    placeholder="Project name"
                  />
                  <input
                    name="projectLocation"
                    value={formik.values.projectLocation}
                    onChange={formik.handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    placeholder="Project location"
                  />
                  <input
                    name="projectStage"
                    value={formik.values.projectStage}
                    onChange={formik.handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    placeholder="Stage (e.g. foundation, finishing)"
                  />
                  <input
                    name="expectedCompletion"
                    value={formik.values.expectedCompletion}
                    onChange={formik.handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    placeholder="Expected completion (e.g. Q4 2027)"
                  />
                </div>
                <div className="mt-4">
                  <AttachFile
                    id="developer-project-doc"
                    heading="Upload supporting project document"
                    acceptedFileTypes="image/*,.pdf"
                    setFileUrl={(url: string | null) => {
                      if (!url) return;
                      formik.setFieldValue("supportingDocs", [...formik.values.supportingDocs, url]);
                    }}
                  />
                  <div className="mt-2 space-y-1">
                    {formik.values.supportingDocs.map((doc, index) => (
                      <div key={`${doc}-${index}`} className="flex items-center justify-between text-xs bg-gray-50 px-3 py-2 rounded">
                        <span className="truncate mr-2">{doc}</span>
                        <button
                          type="button"
                          onClick={() =>
                            formik.setFieldValue(
                              "supportingDocs",
                              formik.values.supportingDocs.filter((_, i) => i !== index)
                            )
                          }
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-[#8DDB90] hover:bg-[#7BC87F] text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            {tier === "advanced" ? "Submit Advanced KYC" : "Save developer profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
