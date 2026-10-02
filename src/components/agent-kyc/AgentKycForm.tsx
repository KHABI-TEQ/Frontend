"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormik, getIn } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { GET_REQUEST, PUT_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { PRACTITIONER_SETUP_PATH } from "@/lib/practitioner-setup-flow";
import {
  AgentKycSubmissionPayload,
  SPECIALIZATION_OPTIONS,
  SERVICE_OPTIONS,
  LANGUAGE_OPTIONS,
} from "@/types/agent-upgrade.types";
import AttachFile from "@/components/general-components/attach_file";
import {
  FileText,
  MapPin,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Plus,
  X,
  Check,
} from "lucide-react";
import { getCookie } from "cookies-next";
import Select from "react-select";
import customStyles from "@/styles/inputStyle";
import { useUserContext, normalizeUser } from "@/context/user-context";
import { resolveAgentKycStatus } from "@/hooks/useAgentEligibility";
import { getStates, getLGAsByState, isPilotState, PILOT_LOCATION_MESSAGE } from "@/utils/location-utils";
import PendingKycReview from "@/components/agent-kyc/PendingKycReview";
import KycSubmittedConfirmation from "@/components/kyc/KycSubmittedConfirmation";
import ProcessingRequest from "../loading-component/ProcessingRequest";
import { handleApiError } from "@/utils/handleApiError";
import {
  RegistrationCertificateFields,
  type RegistrationCertificateKind,
} from "@/components/kyc/RegistrationCertificateFields";

const kycValidationSchema = Yup.object({
  meansOfId: Yup.array().of(
    Yup.object({
      name: Yup.string().required("ID type is required"),
      docImg: Yup.array().of(Yup.string()).min(1, "At least one document image is required"),
    }),
  ).min(1, "At least one form of identification is required"),
  agentLicenseNumber: Yup.string().optional().min(3, "License number must be at least 3 characters"),
  profileBio: Yup.string().optional().max(500, "Bio cannot exceed 500 characters"),
  specializations: Yup.array().of(Yup.string()).min(1, "Pick at least one specialization"),
  languagesSpoken: Yup.array().of(Yup.string()).min(1, "Pick at least one language"),
  servicesOffered: Yup.array().of(Yup.string()).min(1, "Pick at least one service"),
  address: Yup.object({
    street: Yup.string().required("Street address is required"),
    homeNo: Yup.string().required("House number is required"),
    state: Yup.string()
      .required("State is required")
      .test("pilot-state", PILOT_LOCATION_MESSAGE, (value) => isPilotState(value)),
    localGovtArea: Yup.string().required("Local government area is required"),
  }),
  regionOfOperation: Yup.array().of(Yup.string()).min(1, "Select the Lagos LGAs you primarily operate in"),
  utilityBillUrl: Yup.string().required("Upload a utility bill as proof of address"),
});

type KycSelectOption = { value: string; label: string };

type PractitionerKycFormConfig = {
  title?: string;
  subtitle?: string;
  steps?: { key: string; label: string; order: number }[];
  addressAndRegions?: {
    state?: { value?: string; helperText?: string; locked?: boolean };
    localGovtArea?: { placeholder?: string; options?: KycSelectOption[] };
    regionOfOperation?: {
      label?: string;
      helperText?: string;
      placeholder?: string;
      options?: KycSelectOption[];
    };
  };
};

const FALLBACK_KYC_STEPS: { key: string; label: string; order: number }[] = [
  { key: "identityDocuments", label: "Identity Documents", order: 1 },
  { key: "professionalInfo", label: "Professional Info", order: 2 },
  { key: "addressAndRegions", label: "Address & Regions", order: 3 },
];

function asStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function CheckboxTag({
  selected,
  label,
  onToggle,
}: {
  selected: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm cursor-pointer select-none text-left transition-colors ${
        selected
          ? "bg-[#0B572B] text-white border-[#0B572B]"
          : "bg-white text-[#0C1E1B] border-gray-300 hover:border-[#0B572B]"
      }`}
    >
      <span
        className={`flex items-center justify-center h-4 w-4 shrink-0 rounded-full border ${
          selected ? "bg-white text-[#0B572B] border-white" : "border-gray-300"
        }`}
      >
        {selected ? <Check className="w-3 h-3" /> : null}
      </span>
      <span>{label}</span>
    </button>
  );
}

const AgentKycForm: React.FC = () => {
  const router = useRouter();
  const { user, setUser } = useUserContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [kycForm, setKycForm] = useState<PractitionerKycFormConfig | null>(null);

  const formik = useFormik<AgentKycSubmissionPayload>({
    initialValues: {
      meansOfId: [{ name: "", docImg: [] }],
      agentLicenseNumber: "",
      certificateKind: "cac",
      certificateNumber: "",
      cacCertificateUrls: [],
      lasreraCertificateUrls: [],
      profileBio: "",
      specializations: [],
      languagesSpoken: [],
      servicesOffered: [],
      address: {
        street: "",
        homeNo: "",
        state: "Lagos",
        localGovtArea: "",
      },
      regionOfOperation: [],
      utilityBillUrl: "",
      agentType: "Individual",
    },
    validationSchema: kycValidationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      await handleSubmit(values);
    },
  });

  // Initialize agentType field as touched on mount to ensure default value is recognized
  React.useEffect(() => {
    if (currentStep === 1 && !formik.touched.agentType) {
      formik.setFieldTouched("agentType", true, false);
    }
  }, [currentStep]);

  const getError = (path: string): string | undefined => {
    const touched = getIn(formik.touched, path);
    const error = getIn(formik.errors, path);
    const value = getIn(formik.values, path);

    // If these array fields have at least one selection, suppress errors
    const arrayFields = ["specializations", "languagesSpoken", "servicesOffered", "regionOfOperation"];
    if (arrayFields.includes(path) && Array.isArray(value) && value.length > 0) {
      return undefined;
    }

    // If address fields have values, suppress errors
    if ((path === "address.state" || path === "address.localGovtArea") && typeof value === "string" && value.trim().length > 0) {
      return undefined;
    }

    if (!touched || !error) return undefined;
    if (typeof error === 'string') return error;
    return undefined;
  };

  const isRequired = (path: string): boolean => {
    const requiredFields = [
      "meansOfId", "specializations", "languagesSpoken", "servicesOffered",
      "address.street", "address.homeNo", "address.state", "address.localGovtArea", "regionOfOperation", "utilityBillUrl"
    ];
    return requiredFields.some(field => path === field || path.startsWith(field + "["));
  };

  const hasError = (path: string) => !!getError(path);

  const shouldShowRedBorder = (path: string): boolean => {
    const value = getIn(formik.values, path);
    const error = getError(path);
    const isReq = isRequired(path);
    
    // If not required, never show red border
    if (!isReq) return false;

    // For arrays (like specializations, languagesSpoken, servicesOffered, regionOfOperation)
    if (Array.isArray(value)) {
      // If array has items, no red border (value is valid, ignore stale errors)
      if (value.length > 0) return false;
      // Empty array for required field = red border
      return true;
    }

    // For meansOfId docImg arrays - check if at least first image exists
    if (path.includes('docImg')) {
      if (!value || !Array.isArray(value)) return true;
      // Check if first image exists
      if (value[0] && value[0].trim() !== '') return false;
      return true;
    }

    // For strings
    if (typeof value === 'string') {
      // If string has content, no red border (value is valid, ignore stale errors)
      if (value && value.trim() !== '') return false;
      // Empty string for required field = red border
      return true;
    }

    // Check error as fallback
    if (error) return true;

    // Default: show red if value is falsy
    return !value;
  };
  

  const inputBase = "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent";
  const inputClass = (path: string) => `${inputBase} ${shouldShowRedBorder(path) ? "border-red-500" : "border-gray-300"}`;
  const makeSelectStyles = (path: string) => ({
    ...customStyles,
    control: (base: any, state: any) => ({
      ...(customStyles as any).control?.(base, state),
      borderColor: shouldShowRedBorder(path) ? "#ef4444" : state.isFocused ? "teal" : base.borderColor,
      boxShadow: state.isFocused ? "0 0 0 1px teal" : base.boxShadow,
    }),
  });

  const selectedState = formik.values.address.state;
  const stateOptions = useMemo(() => getStates(), []);
  const steps = useMemo(() => {
    const fromApi = kycForm?.steps?.filter((step) => step.key && step.label) ?? [];
    if (!fromApi.length) return FALLBACK_KYC_STEPS;
    return [...fromApi].sort((a, b) => a.order - b.order);
  }, [kycForm]);
  const addressConfig = kycForm?.addressAndRegions;
  const lgaSelectOptions = useMemo(() => {
    const fromApi = addressConfig?.localGovtArea?.options?.filter((option) => option.value) ?? [];
    if (fromApi.length) return fromApi;
    return (selectedState ? getLGAsByState(selectedState) : []).map((name) => ({
      value: name,
      label: name,
    }));
  }, [addressConfig?.localGovtArea?.options, selectedState]);
  const regionSelectOptions = useMemo(() => {
    const fromApi = addressConfig?.regionOfOperation?.options?.filter((option) => option.value) ?? [];
    return fromApi.length ? fromApi : lgaSelectOptions;
  }, [addressConfig?.regionOfOperation?.options, lgaSelectOptions]);

  useEffect(() => {
    let cancelled = false;
    const loadForm = async () => {
      const token = getCookie("token") as string | undefined;
      const response = await GET_REQUEST<PractitionerKycFormConfig>(
        `${URLS.BASE}${URLS.practitionerKycForm}`,
        token,
      );
      if (cancelled || !response.success || !response.data) return;
      setKycForm(response.data);
    };
    void loadForm();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (values: AgentKycSubmissionPayload) => {
    setIsSubmitting(true);
    try {
      const token = getCookie("token") as string;
      const certificateKind: RegistrationCertificateKind =
        values.certificateKind === "lasrera" ? "lasrera" : "cac";
      const certificateNumber = String(values.certificateNumber || "").trim();
      const certUrl =
        certificateKind === "lasrera"
          ? values.lasreraCertificateUrls?.[0]
          : values.cacCertificateUrls?.[0];
      const response = await PUT_REQUEST(
        `${URLS.BASE}${URLS.submitKyc}`,
        {
          ...values,
          certificateKind,
          certificateNumber,
          cacCertificateUrls: certificateKind === "cac" && certUrl ? [certUrl] : [],
          lasreraCertificateUrls: certificateKind === "lasrera" && certUrl ? [certUrl] : [],
        },
        token as string,
      );

      if (!response.success) {
        handleApiError(response);
        return;
      }

      setUser(normalizeUser({
        _id: user?._id ?? "",
        id: user?.id,
        email: user?.email,
        firstName: user?.firstName,
        lastName: user?.lastName,
        phoneNumber: user?.phoneNumber,
        selectedRegion: user?.selectedRegion,
        userType: user?.userType,
        accountApproved: user?.accountApproved ?? true,
        kycStatus: "pending",
        agentData: {
          accountApproved: user?.agentData?.accountApproved ?? true,
          agentType: user?.agentData?.agentType ?? "Agent",
          kycStatus: "pending",
          kycData: values,
        },
        address: user?.address,
        profile_picture: user?.profile_picture,
        referralCode: user?.referralCode,
        isAccountVerified: user?.isAccountVerified,
        activeSubscription: user?.activeSubscription ?? null,
        doc: user?.doc,
        individualAgent: user?.individualAgent,
        companyAgent: user?.companyAgent,
      }));
      toast.success("KYC submitted successfully. Please await admin approval within 24 hours.");
      router.replace("/dashboard");

    } catch (error) {
      // Error handled, validation messages will be shown via formik
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    const setAllTouched = (fields: string[]) => {
      const touched: any = { ...(formik.touched as any) };
      fields.forEach((f) => (touched[f] = true));
      formik.setTouched(touched, true);
    };

    if (currentStep === 0) {
      const idErrors = await formik.validateField("meansOfId");
      if (idErrors) {
        const fields: string[] = [];
        (formik.values.meansOfId || []).forEach((_, i) => {
          fields.push(`meansOfId[${i}].name`);
          fields.push(`meansOfId[${i}].docImg`);
        });
        setAllTouched(["meansOfId", ...fields]);
        return false;
      }
    }

    if (currentStep === 1) {
      const fields = [
        "specializations",
        "languagesSpoken",
        "servicesOffered",
      ];

      const errors: any = {};
      for (const field of fields) {
        const err = await formik.validateField(field);
        if (err) errors[field] = err;
      }

      const hasErrors = Object.keys(errors).length > 0;
      if (hasErrors) {
        setAllTouched(fields);
        return false;
      }
    }

    if (currentStep === 2) {
      const fields = [
        "address.street",
        "address.homeNo",
        "address.state",
        "address.localGovtArea",
        "regionOfOperation",
        "utilityBillUrl",
      ];

      const errors: any = {};
      for (const field of fields) {
        const err = await formik.validateField(field);
        if (err) errors[field] = err;
      }

      const hasErrors = Object.keys(errors).length > 0;
      if (hasErrors) {
        setAllTouched(fields);
        return false;
      }
    }

    return true;
  };

  const isCurrentStepValid = (): boolean => {
    const errors = formik.errors;

    if (currentStep === 0) {
      return (
        !errors.meansOfId &&
        formik.values.meansOfId.length > 0 &&
        formik.values.meansOfId.every(
          (doc) => !!doc.name && doc.docImg.length > 0
        )
      );
    }

    if (currentStep === 1) {
      const hasSpecializations = formik.values.specializations.length > 0;
      const hasLanguages = formik.values.languagesSpoken.length > 0;
      const hasServices = formik.values.servicesOffered.length > 0;
      return hasSpecializations && hasLanguages && hasServices;
    }

    if (currentStep === 2) {
      return (
        !errors.address &&
        !errors.regionOfOperation &&
        !!formik.values.address.street &&
        !!formik.values.address.homeNo &&
        !!formik.values.address.state &&
        !!formik.values.address.localGovtArea &&
        asStringList(formik.values.regionOfOperation).length > 0
      );
    }

    return true;
  };

  // Check if all required fields are valid for final submission
  const isFormValidForSubmission = (): boolean => {
    const errors = formik.errors;
    
    // Check step 0: Identity
    const step0Valid = !errors.meansOfId &&
      formik.values.meansOfId.length > 0 &&
      formik.values.meansOfId.every(
        (doc) => !!doc.name && doc.docImg.length > 0
      );

    // Check step 1: Professional
    const step1Valid = formik.values.specializations.length > 0 &&
      formik.values.languagesSpoken.length > 0 &&
      formik.values.servicesOffered.length > 0;

    // Check step 2: Location
    const step2Valid = !errors.address &&
      !errors.regionOfOperation &&
      !!formik.values.address.street &&
      !!formik.values.address.homeNo &&
      !!formik.values.address.state &&
      !!formik.values.address.localGovtArea &&
      asStringList(formik.values.regionOfOperation).length > 0;

    return step0Valid && step1Valid && step2Valid;
  };


  const goNext = async () => {
    const ok = await validateCurrentStep();
    if (!ok) return;
    if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1);
  };
  const goPrev = () => setCurrentStep((s) => Math.max(0, s - 1));

  const addMeansOfId = () => {
    formik.setFieldValue("meansOfId", [...formik.values.meansOfId, { name: "", docImg: [] }]);
  };
  const removeMeansOfId = (index: number) => {
    formik.setFieldValue("meansOfId", formik.values.meansOfId.filter((_, i) => i !== index));
  };

  const handleFileUpload = (
    fileUrl: string,
    index: number,
    imgIndex: number,
  ) => {
    const copy = [...formik.values.meansOfId];
    if (!copy[index].docImg) copy[index].docImg = [];
    copy[index].docImg[imgIndex] = fileUrl;
    formik.setFieldValue("meansOfId", copy);
    formik.setFieldTouched(`meansOfId[${index}].docImg`, true, true);
  };

  const toggleMultiSelect = (
    field: keyof AgentKycSubmissionPayload,
    value: string,
  ) => {
    const current = asStringList(formik.values[field]);

    if (current.includes(value)) {
      formik.setFieldValue(field, current.filter((item) => item !== value), false);
    } else {
      formik.setFieldValue(field, [...current, value], false);
    }
    formik.setFieldTouched(field as string, true, false);
  };

  const kycStatus = resolveAgentKycStatus(user);
  if (kycStatus === "pending" || kycStatus === "in_review") {
    return <PendingKycReview />;
  }

  if (kycStatus === "approved") {
    return (
      <KycSubmittedConfirmation
        userType="Agent"
        variant="approved"
        continueHref={PRACTITIONER_SETUP_PATH}
        continueLabel="Set up your practitioner page"
      />
    );
  }

  if (kycStatus === "rejected" || kycStatus === "reject") {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <X size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-[#0C1E1B] mb-2">KYC Rejected</h2>
            <p className="text-[#4F5B57] mb-6">Unfortunately, your KYC submission was rejected. You may resubmit your KYC with corrected or additional information.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setUser(normalizeUser({
                    ...(user as any),
                    agentData: {
                      ...(user as any)?.agentData,
                      kycStatus: "none",
                    },
                  }));
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg"
              >
                Resubmit KYC
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Do nothing - form should only submit via the Submit button click
    return false;
  };

  const handleSubmitButtonClick = async () => {
    if (currentStep !== steps.length - 1) return;
    const ok = await validateCurrentStep();
    if (!ok) return;
    await formik.submitForm();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ProcessingRequest
        isVisible={isSubmitting || isUploading}
        title={isUploading ? "Uploading File" : "Submitting Request"}
        message={
          isUploading
            ? "Your file is being uploaded. Please hold on..."
            : "We're processing your KYC submission. This may take a moment..."
        }
        iconColor="#8DDB90"
      />

      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{kycForm?.title || "Practitioner KYC Verification"}</h1>
          <p className="text-gray-600 mt-1">{kycForm?.subtitle || "Complete your verification to enhance your public practitioner profile"}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 pt-6">
            <ol className="flex items-center gap-4 overflow-x-auto">
              {steps.map((s, idx) => {
                const active = idx === currentStep;
                const done = idx < currentStep;
                return (
                  <li key={s.key} className="flex items-center gap-2">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full border ${
                        active
                          ? "bg-[#0B572B] text-white border-[#0B572B]"
                          : done
                          ? "bg-[#8DDB90] text-white border-[#8DDB90]"
                          : "border-gray-300 text-gray-600"
                      }`}
                    >
                      {done ? <CheckCircle2 size={18} /> : <span className="text-xs">{idx + 1}</span>}
                    </div>
                    <span className={`text-sm whitespace-nowrap ${active ? "text-[#0B572B] font-medium" : "text-gray-600"}`}>
                      {s.label}
                    </span>
                    {idx < steps.length - 1 && <span className="w-8 h-px bg-gray-300 mx-1" />}
                  </li>
                );
              })}
            </ol>
          </div>

          <form
            onSubmit={handleFormSubmit}
            className="p-6 space-y-8"
          >
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                  <FileText className="text-[#0B572B]" size={24} />
                  <h2 className="text-xl font-semibold text-[#0C1E1B]">Identity Documents</h2>
                </div>

                <div className="space-y-4">
                  {formik.values.meansOfId.map((idDoc, index) => {
                    const namePath = `meansOfId[${index}].name`;
                    const imgPath = `meansOfId[${index}].docImg`;
                    const nameError = getError(namePath);
                    const imgError = getError(imgPath);
                    const idLabel = idDoc.name
                      ? `Upload your ${idDoc.name.replace(/^./, (c) => c.toLowerCase())}`
                      : "Upload your ID";
                    return (
                      <div key={index} className={`bg-white p-6 rounded-2xl border ${nameError || imgError ? "border-red-500" : "border-gray-100"}`}>
                        <div className="flex justify-between items-start mb-5">
                          <h3 className="font-medium text-[#0C1E1B]">Document {index + 1}</h3>
                          {formik.values.meansOfId.length > 1 && (
                            <button type="button" onClick={() => removeMeansOfId(index)} className="text-red-500 hover:text-red-700">
                              <X size={20} />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <label className="block text-sm font-medium text-[#0C1E1B] mb-2">ID Type *</label>
                            <Select
                              styles={makeSelectStyles(namePath)}
                              options={[
                                { value: "International Passport", label: "International Passport" },
                                { value: "National ID", label: "National ID" },
                                { value: "Driver's License", label: "Driver's License" },
                                { value: "Voter's Card", label: "Voter's Card" },
                              ]}
                              placeholder="Select ID Type"
                              value={idDoc.name ? ({ value: idDoc.name, label: idDoc.name } as any) : null}
                              onChange={(opt: any) => {
                                const next = [...formik.values.meansOfId];
                                next[index].name = opt?.value || "";
                                formik.setFieldValue("meansOfId", next);
                                formik.setFieldTouched(namePath, true, true);
                              }}
                              isClearable
                            />
                            {nameError && (
                              <p className="text-red-500 text-sm mt-2">{nameError}</p>
                            )}
                          </div>

                          <div>
                            <p className="mb-3 text-sm font-medium text-[#0C1E1B]">{idLabel}</p>
                            <div className="space-y-4">
                              {[
                                { imgIndex: 0, heading: "Upload front image" },
                                { imgIndex: 1, heading: "Upload back image" },
                              ].map(({ imgIndex, heading }) => (
                                <AttachFile
                                  key={imgIndex}
                                  variant="kyc-id"
                                  heading={heading}
                                  fileUrl={idDoc.docImg?.[imgIndex] || null}
                                  setFileUrl={(url: string | null) => {
                                    if (url) handleFileUpload(url, index, imgIndex);
                                  }}
                                  id={`means-of-id-${index}-${imgIndex}`}
                                  className="w-full"
                                  acceptedFileTypes="image/*,.pdf"
                                  onUploadStart={() => setIsUploading(true)}
                                  onUploadEnd={() => setIsUploading(false)}
                                />
                              ))}
                            </div>
                            {imgError && (
                              <p className="text-red-500 text-sm mt-2">{imgError}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {getError("meansOfId") && (
                    <p className="text-red-500 text-sm">{getError("meansOfId")}</p>
                  )}
                </div>

                <button type="button" onClick={addMeansOfId} className="flex items-center gap-2 px-4 py-2 text-[#0B572B] border border-[#8DDB90] rounded-lg hover:bg-[#E8F7EE]">
                  <Plus size={16} /> Add Another ID Document
                </button>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                  <Briefcase className="text-[#0B572B]" size={24} />
                  <h2 className="text-xl font-semibold text-[#0C1E1B]">Professional Information</h2>
                </div>

                <RegistrationCertificateFields
                  kind={formik.values.certificateKind === "lasrera" ? "lasrera" : "cac"}
                  onKindChange={(kind) => {
                    formik.setFieldValue("certificateKind", kind);
                    formik.setFieldValue(
                      kind === "cac" ? "lasreraCertificateUrls" : "cacCertificateUrls",
                      [],
                    );
                  }}
                  certificateNumber={formik.values.certificateNumber || ""}
                  onCertificateNumberChange={(value) => formik.setFieldValue("certificateNumber", value)}
                  fileUrl={
                    formik.values.certificateKind === "lasrera"
                      ? formik.values.lasreraCertificateUrls?.[0] || ""
                      : formik.values.cacCertificateUrls?.[0] || ""
                  }
                  onFileUrlChange={(url) => {
                    const kind = formik.values.certificateKind === "lasrera" ? "lasrera" : "cac";
                    formik.setFieldValue(
                      kind === "lasrera" ? "lasreraCertificateUrls" : "cacCertificateUrls",
                      url ? [url] : [],
                    );
                  }}
                  uploadId="agent-registration-certificate"
                  onUploadStart={() => setIsUploading(true)}
                  onUploadEnd={() => setIsUploading(false)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#0C1E1B] mb-2">Practitioner License Number (Optional)</label>
                    <input type="text" {...formik.getFieldProps("agentLicenseNumber")} className={inputClass("agentLicenseNumber")} placeholder="AGT-12345-XYZ" />
                    {formik.touched.agentLicenseNumber && formik.errors.agentLicenseNumber && (
                      <p className="text-red-500 text-sm mt-2">{formik.errors.agentLicenseNumber as string}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#0C1E1B] mb-2">Practitioner Type (Optional)</label>
                    <Select
                      styles={customStyles}
                      options={[
                        { value: "Individual", label: "Individual" },
                        { value: "Company", label: "Company" },
                      ]}
                      value={{ value: formik.values.agentType, label: formik.values.agentType }}
                      onChange={(opt: any) => {
                        formik.setFieldValue("agentType", opt?.value || "Individual");
                      }}
                      placeholder="Select practitioner type"
                      isSearchable={false}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0C1E1B] mb-2">Profile Bio (Optional)</label>
                  <textarea
                    {...formik.getFieldProps("profileBio")}
                    rows={5}
                    className={inputClass("profileBio")}
                    placeholder="Describe your experience, expertise, and what makes you unique as a real estate practitioner..."
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>{formik.values.profileBio.length}/500 characters</span>
                    {formik.touched.profileBio && formik.errors.profileBio && <span className="text-red-500">{formik.errors.profileBio as string}</span>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0C1E1B] mb-2">Specializations *</label>
                  <div className={`grid grid-cols-2 md:grid-cols-3 gap-2 p-3 border-2 rounded-lg ${shouldShowRedBorder("specializations") ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"}`}>
                    {SPECIALIZATION_OPTIONS.map((option) => {
                      const selected = asStringList(formik.values.specializations).includes(option.value);
                      return (
                        <CheckboxTag
                          key={option.value}
                          selected={selected}
                          label={option.label}
                          onToggle={() => toggleMultiSelect("specializations", option.value)}
                        />
                      );
                    })}
                  </div>
                  {hasError("specializations") && (
                    <p className="text-red-500 text-sm mt-2">{getError("specializations")}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0C1E1B] mb-2">Languages Spoken *</label>
                  <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 p-3 border-2 rounded-lg ${shouldShowRedBorder("languagesSpoken") ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"}`}>
                    {LANGUAGE_OPTIONS.map((language) => {
                      const selected = asStringList(formik.values.languagesSpoken).includes(language);
                      return (
                        <CheckboxTag
                          key={language}
                          selected={selected}
                          label={language}
                          onToggle={() => toggleMultiSelect("languagesSpoken", language)}
                        />
                      );
                    })}
                  </div>
                  {hasError("languagesSpoken") && (
                    <p className="text-red-500 text-sm mt-2">{getError("languagesSpoken")}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0C1E1B] mb-2">Services Offered *</label>
                  <div className={`grid grid-cols-2 md:grid-cols-3 gap-2 p-3 border-2 rounded-lg ${shouldShowRedBorder("servicesOffered") ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"}`}>
                    {SERVICE_OPTIONS.map((option) => {
                      const selected = asStringList(formik.values.servicesOffered).includes(option.value);
                      return (
                        <CheckboxTag
                          key={option.value}
                          selected={selected}
                          label={option.label}
                          onToggle={() => toggleMultiSelect("servicesOffered", option.value)}
                        />
                      );
                    })}
                  </div>
                  {hasError("servicesOffered") && (
                    <p className="text-red-500 text-sm mt-2">{getError("servicesOffered")}</p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                  <MapPin className="text-[#0B572B]" size={24} />
                  <h2 className="text-xl font-semibold text-[#0C1E1B]">Address & Regions</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#0C1E1B] mb-2">Street Address *</label>
                    <input type="text" {...formik.getFieldProps("address.street")} className={inputClass("address.street")} placeholder="Bode Thomas Street" />
                    {getError("address.street") && <p className="text-red-500 text-sm mt-2">{getError("address.street")}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0C1E1B] mb-2">House Number *</label>
                    <input type="text" {...formik.getFieldProps("address.homeNo")} className={inputClass("address.homeNo")} placeholder="12A" />
                    {getError("address.homeNo") && <p className="text-red-500 text-sm mt-2">{getError("address.homeNo")}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0C1E1B] mb-2">State *</label>
                    <Select
                      styles={makeSelectStyles("address.state")}
                      options={stateOptions.map((s) => ({ value: s, label: s }))}
                      value={
                        formik.values.address.state
                          ? ({ value: formik.values.address.state, label: formik.values.address.state } as any)
                          : null
                      }
                      onChange={(opt: any) => {
                        formik.setFieldValue("address.state", opt?.value || "");
                        formik.setFieldTouched("address.state", true, true);
                        formik.setFieldValue("address.localGovtArea", "");
                        formik.setFieldValue("regionOfOperation", []);
                      }}
                      placeholder="Lagos State"
                      isClearable={false}
                      isDisabled={true}
                      isSearchable={false}
                    />
                    <p className="text-xs text-gray-500 mt-1">{addressConfig?.state?.helperText || "Lagos State only (pilot location)"}</p>
                    {getError("address.state") && <p className="text-red-500 text-sm mt-2">{getError("address.state")}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0C1E1B] mb-2">Local Government Area *</label>
                    <Select
                      styles={makeSelectStyles("address.localGovtArea")}
                      isDisabled={!selectedState}
                      options={lgaSelectOptions}
                      value={
                        formik.values.address.localGovtArea
                          ? ({
                              value: formik.values.address.localGovtArea,
                              label: formik.values.address.localGovtArea,
                            } as any)
                          : null
                      }
                      onChange={(opt: any) => {
                        formik.setFieldValue("address.localGovtArea", opt?.value || "");
                        formik.setFieldTouched("address.localGovtArea", true, true);
                      }}
                      placeholder={addressConfig?.localGovtArea?.placeholder || "Select LGA"}
                      isClearable
                    />
                    {getError("address.localGovtArea") && <p className="text-red-500 text-sm mt-2">{getError("address.localGovtArea")}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0C1E1B] mb-2">
                    {addressConfig?.regionOfOperation?.label || "Region of operation"} *
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    {addressConfig?.regionOfOperation?.helperText ||
                      "Select the LGAs you primarily operate in for the selected state"}
                  </p>
                  <Select
                    isMulti
                    closeMenuOnSelect={false}
                    styles={{
                      ...makeSelectStyles("regionOfOperation"),
                      multiValue: (base: Record<string, unknown>) => ({
                        ...base,
                        backgroundColor: "#E7F6EC",
                        borderRadius: 999,
                      }),
                      multiValueLabel: (base: Record<string, unknown>) => ({
                        ...base,
                        color: "#0C1E1B",
                        fontSize: "0.875rem",
                      }),
                      multiValueRemove: (base: Record<string, unknown>) => ({
                        ...base,
                        color: "#0B572B",
                        borderRadius: 999,
                        ":hover": { backgroundColor: "#D7F0E2", color: "#083D1E" },
                      }),
                    }}
                    options={regionSelectOptions}
                    value={regionSelectOptions.filter((option) =>
                      asStringList(formik.values.regionOfOperation).includes(option.value),
                    )}
                    onChange={(opts) => {
                      const next = Array.isArray(opts) ? opts.map((opt) => opt.value) : [];
                      formik.setFieldValue("regionOfOperation", next);
                      formik.setFieldTouched("regionOfOperation", true, false);
                    }}
                    placeholder="Select LGA"
                    isClearable={false}
                  />
                  {hasError("regionOfOperation") && (
                    <p className="text-red-500 text-sm mt-2">{getError("regionOfOperation")}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <AttachFile
                    variant="kyc-id"
                    heading="Upload your utility bill"
                    fileUrl={formik.values.utilityBillUrl || null}
                    setFileUrl={(url: string | null) => {
                      formik.setFieldValue("utilityBillUrl", url || "");
                      formik.setFieldTouched("utilityBillUrl", true, true);
                    }}
                    id="agent-utility-bill"
                    acceptedFileTypes="image/*,.pdf"
                    onUploadStart={() => setIsUploading(true)}
                    onUploadEnd={() => setIsUploading(false)}
                  />
                  {getError("utilityBillUrl") && (
                    <p className="text-red-500 text-sm">{getError("utilityBillUrl")}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={goPrev}
                disabled={currentStep === 0}
                className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-[#0B572B] border-[#8DDB90] disabled:opacity-50"
              >
                <ChevronLeft size={18} /> Back
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!isCurrentStepValid()}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-[#0B572B] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight size={18} />
                </button>
              ) : currentStep === steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleSubmitButtonClick}
                  disabled={isSubmitting || !isCurrentStepValid()}
                  className="px-8 py-2 bg-gradient-to-r from-[#0B572B] to-[#8DDB90] text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Submit KYC"}
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgentKycForm;
