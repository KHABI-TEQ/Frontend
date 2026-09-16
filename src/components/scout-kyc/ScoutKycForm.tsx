"use client";

import React, { useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { PUT_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import AttachFile from "@/components/general-components/attach_file";
import { getCookie } from "cookies-next";
import { useUserContext, normalizeUser } from "@/context/user-context";
import { getStates, getLGAsByState, isPilotState, PILOT_LOCATION_MESSAGE } from "@/utils/location-utils";
import PendingKycReview from "@/components/agent-kyc/PendingKycReview";
import ProcessingRequest from "@/components/loading-component/ProcessingRequest";
import { handleApiError } from "@/utils/handleApiError";
import { useRouter } from "next/navigation";

const schema = Yup.object({
  meansOfId: Yup.array()
    .of(
      Yup.object({
        name: Yup.string().required("ID type is required"),
        docImg: Yup.array().of(Yup.string()).min(1, "At least one document image is required"),
      }),
    )
    .min(1, "At least one form of identification is required"),
  address: Yup.object({
    street: Yup.string().required("Street address is required"),
    homeNo: Yup.string().required("House number is required"),
    state: Yup.string()
      .required("State is required")
      .test("pilot-state", PILOT_LOCATION_MESSAGE, (value) => isPilotState(value)),
    localGovtArea: Yup.string().required("Local government area is required"),
  }),
});

export default function ScoutKycForm() {
  const { user, setUser } = useUserContext();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const kycStatus = user?.kycStatus || "none";

  const formik = useFormik({
    initialValues: {
      meansOfId: [{ name: "National ID", docImg: [] as string[] }],
      address: {
        street: "",
        homeNo: "",
        state: "Lagos",
        localGovtArea: "",
      },
      practitionerType: "Individual",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const token = getCookie("token") as string;
        const response = await PUT_REQUEST(
          `${URLS.BASE}${URLS.submitKyc}`,
          {
            ...values,
            regionOfOperation: values.address.state ? [values.address.state] : ["Lagos"],
          },
          token,
        );
        if (!response.success) {
          handleApiError(response);
          return;
        }
        setUser(
          normalizeUser({
            ...user,
            kycStatus: "pending",
          }),
        );
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const lgaOptions = useMemo(
    () => getLGAsByState(formik.values.address.state),
    [formik.values.address.state],
  );

  if (kycStatus === "pending" || kycStatus === "in_review") {
    return <PendingKycReview />;
  }

  if (kycStatus === "approved") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-[#8DDB90]/40 bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-[#09391C]">KYC VERIFIED</p>
        <p className="mt-2 text-sm text-[#5A5D63]">
          Identity verification is complete. Property listings still need Khabiteq review before they go LIVE.
        </p>
        <button
          type="button"
          onClick={() => router.push("/post-property")}
          className="mt-6 rounded-xl bg-[#09391C] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Submit a Property Opportunity
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={formik.handleSubmit} className="mx-auto max-w-xl space-y-6 rounded-2xl bg-white p-6 shadow-sm">
      <ProcessingRequest isVisible={isSubmitting} title="Submitting KYC" message="Please wait..." />
      <div>
        <h1 className="text-2xl font-bold text-[#09391C]">Property Scout KYC</h1>
        <p className="mt-1 text-sm text-[#5A5D63]">
          KYC verifies your identity. It does not mean a property opportunity is verified.
        </p>
        {kycStatus === "rejected" && (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            KYC FAILED / REQUIRES ACTION. Please update your documents and resubmit.
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-semibold text-[#09391C]">ID type</label>
        <input
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
          {...formik.getFieldProps("meansOfId.0.name")}
        />
        <div className="mt-3">
          <AttachFile
            id="scout-kyc-id"
            heading="Upload ID image"
            acceptedFileTypes="image/*"
            setFileUrl={(url: string | null) => {
              if (!url) return;
              formik.setFieldValue("meansOfId.0.docImg", [url]);
            }}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-[#09391C]">House no.</label>
          <input className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2" {...formik.getFieldProps("address.homeNo")} />
        </div>
        <div>
          <label className="text-sm font-semibold text-[#09391C]">Street</label>
          <input className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2" {...formik.getFieldProps("address.street")} />
        </div>
        <div>
          <label className="text-sm font-semibold text-[#09391C]">State</label>
          <select className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2" {...formik.getFieldProps("address.state")}>
            {getStates().map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-[#09391C]">LGA</label>
          <select className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2" {...formik.getFieldProps("address.localGovtArea")}>
            <option value="">Select LGA</option>
            {lgaOptions.map((lga) => (
              <option key={lga} value={lga}>{lga}</option>
            ))}
          </select>
        </div>
      </div>

      <button type="submit" className="w-full rounded-xl bg-[#09391C] py-3 text-sm font-semibold text-white">
        Submit KYC
      </button>
    </form>
  );
}
