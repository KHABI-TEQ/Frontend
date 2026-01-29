"use client";
import React, { useMemo, useState } from "react";
import { useFormik, getIn } from "formik";
import * as Yup from "yup";
import { PUT_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import {
  AgentKycSubmissionPayload,
  SPECIALIZATION_OPTIONS,
  SERVICE_OPTIONS,
  LANGUAGE_OPTIONS,
} from "@/types/agent-upgrade.types";
import AttachFile from "@/components/general-components/attach_file";
import {
  FileText,
  Award,
  MapPin,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Image as ImageIcon,
  Plus,
  X,
  Check,
} from "lucide-react";
import { getCookie } from "cookies-next";
import Select from "react-select";
import customStyles from "@/styles/inputStyle";
import { useUserContext } from "@/context/user-context";
import { getStates, getLGAsByState, getAreasByStateLGA } from "@/utils/location-utils";
import PendingKycReview from "@/components/agent-kyc/PendingKycReview";
import ProcessingRequest from "../loading-component/ProcessingRequest";
import { handleApiError } from "@/utils/handleApiError";

const kycValidationSchema = Yup.object({
  meansOfId: Yup.array().of(
    Yup.object({
      name: Yup.string().required("ID type is required"),
      docImg: Yup.array().of(Yup.string()).min(1, "At least one document image is required"),
    }),
  ).min(1, "At least one form of identification is required"),
  agentLicenseNumber: Yup.string().optional().min(3, "License number must be at least 3 characters"),
  profileBio: Yup.string().optional().max(500, "Bio cannot exceed 500 characters"),
  specializations: Yup.array().of(Yup.string()).min(1, "Pick at least one specialization").max(5, "Maximum 5 specializations allowed"),
  languagesSpoken: Yup.array().of(Yup.string()).min(1, "Pick at least one language"),
  servicesOffered: Yup.array().of(Yup.string()).min(1, "Pick at least one service"),
  address: Yup.object({
    street: Yup.string().required("Street address is required"),
    homeNo: Yup.string().required("House number is required"),
    state: Yup.string().required("State is required"),
    localGovtArea: Yup.string().required("Local government area is required"),
  }),
  regionOfOperation: Yup.array().of(Yup.string()).min(1, "Select at least one region"),
  achievements: Yup.array().optional(),
});

const steps = [
  { key: "identity", title: "Identity Documents" },
  { key: "professional", title: "Professional Info" },
  { key: "location", title: "Address & Regions" },
  { key: "portfolio", title: "Achievements" },
] as const;

const isImage = (url?: string) => !!url && /(\.png|\.jpg|\.jpeg|\.gif|\.webp)$/i.test(url);

const AgentKycForm: React.FC = () => {
  const { user, setUser } = useUserContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const formik = useFormik<AgentKycSubmissionPayload>({
    initialValues: {
      meansOfId: [{ name: "", docImg: [] }],
      agentLicenseNumber: "",
      profileBio: "",
      specializations: [],
      languagesSpoken: [],
      servicesOffered: [],
      achievements: [],
      address: {
        street: "",
        homeNo: "",
        state: "",
        localGovtArea: "",
      },
      regionOfOperation: [],
      agentType: "Individual",
    },
    validationSchema: kycValidationSchema,
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
      "address.street", "address.homeNo", "address.state", "address.localGovtArea", "regionOfOperation"
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
  const lgaOptions = useMemo(() => (selectedState ? getLGAsByState(selectedState) : []), [selectedState]);
  const areaOptions = useMemo(() => {
    if (!selectedState) return [] as string[];
    const areas: string[] = [];
    lgaOptions.forEach((lga) => areas.push(...getAreasByStateLGA(selectedState, lga)));
    const merged = Array.from(new Set([...(areas || []), ...(lgaOptions || [])]));
    return merged;
  }, [selectedState, lgaOptions]);

  const handleSubmit = async (values: AgentKycSubmissionPayload) => {
    setIsSubmitting(true);
    try {
      const token = getCookie("token") as string;
      const response = await PUT_REQUEST(`${URLS.BASE}${URLS.submitKyc}`, values, token as string);

      if (!response.success) {
        handleApiError(response);
        return;
      }

      setUser({
        _id: user?._id ?? "",
        id: user?.id,
        email: user?.email,
        firstName: user?.firstName,
        lastName: user?.lastName,
        phoneNumber: user?.phoneNumber,
        selectedRegion: user?.selectedRegion,
        userType: user?.userType,
        accountApproved: user?.accountApproved ?? true,
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
      });

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
        "profileBio",
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
        formik.values.regionOfOperation.length > 0
      );
    }

    return true;
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
    field: "meansOfId" | "achievements",
    index: number,
    imgIndex?: number,
  ) => {
    if (field === "meansOfId" && typeof imgIndex === "number") {
      const copy = [...formik.values.meansOfId];
      if (!copy[index].docImg) copy[index].docImg = [];
      copy[index].docImg[imgIndex] = fileUrl;
      formik.setFieldValue("meansOfId", copy);
      formik.setFieldTouched(`meansOfId[${index}].docImg`, true, true);
    } else if (field === "achievements") {
      const copy = [...(formik.values.achievements || [])];
      copy[index].fileUrl = fileUrl;
      formik.setFieldValue("achievements", copy);
    }
  };

  const addAchievement = () => {
    formik.setFieldValue("achievements", [
      ...(formik.values.achievements || []),
      { title: "", description: "", dateAwarded: "", fileUrl: "" },
    ]);
  };
  const removeAchievement = (index: number) => {
    formik.setFieldValue(
      "achievements",
      (formik.values.achievements || []).filter((_, i) => i !== index),
    );
  };

  const toggleMultiSelect = (
    field: keyof AgentKycSubmissionPayload,
    value: string,
  ) => {
    const current = (formik.values[field] as string[]) || [];
    const requiresMinimum = ["specializations", "languagesSpoken", "servicesOffered", "regionOfOperation"].includes(field as string);

    if (current.includes(value)) {
      // Prevent deselecting if it's a required field with only 1 item
      if (requiresMinimum && current.length === 1) {
        return;
      }
      const next = current.filter((v) => v !== value);
      formik.setFieldValue(field, next);
    } else {
      const next = [...current, value];
      formik.setFieldValue(field, next);
    }
    formik.setFieldTouched(field as string, true, true);
  };

  const CheckboxTag: React.FC<{
    selected: boolean;
    label: string;
    onToggle: () => void;
  }> = ({ selected, label, onToggle }) => (
    <label
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm cursor-pointer select-none transition-colors ${
        selected
          ? "bg-[#0B572B] text-white border-[#0B572B]"
          : "bg-white text-[#0C1E1B] border-gray-300 hover:border-[#0B572B]"
      }`}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={selected}
        onChange={onToggle}
      />
      <span
        className={`flex items-center justify-center h-4 w-4 rounded-full border ${
          selected ? "bg-white text-[#0B572B] border-white" : "border-gray-300"
        }`}
      >
        {selected && <Check className="w-3 h-3" />}
      </span>
      <span>{label}</span>
    </label>
  );

  const kycStatus = (user as any)?.agentData?.kycStatus as string | undefined;
  if (kycStatus === "pending" || kycStatus === "in_review") {
    return <PendingKycReview />;
  }

  if (kycStatus === "approved") {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <CheckCircle2 size={48} className="text-[#8DDB90] mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-[#0C1E1B] mb-2">KYC Approved</h2>
            <p className="text-[#4F5B57] mb-6">Your agent KYC has been approved. You can now proceed to your dashboard and access verified agent features.</p>
            <div className="flex items-center justify-center gap-3">
              <a href="/dashboard" className="px-6 py-2 bg-green-600 text-white rounded-lg">Go to Dashboard</a>
              <a href="/agent-subscriptions" className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg">Manage Subscription</a>
            </div>
          </div>
        </div>
      </div>
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
                  setUser({
                    ...(user as any),
                    agentData: {
                      ...(user as any)?.agentData,
                      kycStatus: "none",
                    },
                  });
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
    if (currentStep === steps.length - 1) {
      await formik.submitForm();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ProcessingRequest
        isVisible={isSubmitting || isUploading}
        title={isUploading ? "Uploading File" : "Submitting Request"}
        message={
          isUploading
            ? "Your file is being uploaded. Please hold on..."
            : "We’re processing your KYC submission. This may take a moment..."
        }
        iconColor="#8DDB90"
      />

      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agent KYC Verification</h1>
          <p className="text-gray-600 mt-1">Complete your verification to enhance your public agent profile</p>
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
                      {s.title}
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
                    return (
                      <div key={index} className={`bg-gray-50 p-6 rounded-lg border-2 ${nameError || imgError ? "border-red-500" : "border-gray-200"}`}>
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-medium text-[#0C1E1B]">Document {index + 1}</h3>
                          {formik.values.meansOfId.length > 1 && (
                            <button type="button" onClick={() => removeMeansOfId(index)} className="text-red-500 hover:text-red-700">
                              <X size={20} />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <label className="block text-sm font-medium text-[#0C1E1B] mb-2">Document Images *</label>
                            <div className={`space-y-3 p-3 border-2 rounded-lg ${shouldShowRedBorder(imgPath) ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"}`}>
                              {[0, 1].map((imgIndex) => (
                                <div key={imgIndex} className="space-y-2">
                                  <AttachFile
                                    heading={`Upload Image ${imgIndex + 1}`}
                                    setFileUrl={(url: string | null) => handleFileUpload(url!, "meansOfId", index, imgIndex)}
                                    id={`means-of-id-${index}-${imgIndex}`}
                                    className="w-full"
                                    acceptedFileTypes="image/*"
                                    onUploadStart={() => setIsUploading(true)}
                                    onUploadEnd={() => setIsUploading(false)}
                                  />
                                  {idDoc.docImg?.[imgIndex] && (
                                    <div className="flex items-center gap-3">
                                      <div className="w-20 h-14 rounded overflow-hidden bg-white border">
                                        <img src={idDoc.docImg[imgIndex]} alt={`Document ${index + 1}-${imgIndex + 1}`} className="w-full h-full object-cover" />
                                      </div>
                                      <a className="text-sm text-[#0B572B] underline" href={idDoc.docImg[imgIndex]} target="_blank" rel="noreferrer">
                                        Preview
                                      </a>
                                    </div>
                                  )}
                                </div>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#0C1E1B] mb-2">Agent License Number (Optional)</label>
                    <input type="text" {...formik.getFieldProps("agentLicenseNumber")} className={inputClass("agentLicenseNumber")} placeholder="AGT-12345-XYZ" />
                    {formik.touched.agentLicenseNumber && formik.errors.agentLicenseNumber && (
                      <p className="text-red-500 text-sm mt-2">{formik.errors.agentLicenseNumber as string}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#0C1E1B] mb-2">Agent Type (Optional)</label>
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
                      placeholder="Select agent type"
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
                    placeholder="Describe your experience, expertise, and what makes you unique as a real estate agent..."
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
                      const selected = formik.values.specializations.includes(option.value);
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
                      const selected = formik.values.languagesSpoken.includes(language);
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
                      const selected = formik.values.servicesOffered.includes(option.value);
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
                      placeholder="Select state"
                      isClearable
                    />
                    {getError("address.state") && <p className="text-red-500 text-sm mt-2">{getError("address.state")}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0C1E1B] mb-2">Local Government Area *</label>
                    <Select
                      styles={makeSelectStyles("address.localGovtArea")}
                      isDisabled={!selectedState}
                      options={lgaOptions.map((l) => ({ value: l, label: l }))}
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
                      placeholder="Select LGA"
                      isClearable
                    />
                    {getError("address.localGovtArea") && <p className="text-red-500 text-sm mt-2">{getError("address.localGovtArea")}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0C1E1B] mb-2">Region of Operation *</label>
                  <p className="text-xs text-gray-500 mb-2">Select at least 2 areas/LGAs you primarily operate in for the selected state</p>
                  <div className={`grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-auto p-3 border-2 rounded-lg ${shouldShowRedBorder("regionOfOperation") ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"}`}>
                    {(areaOptions || []).map((area) => {
                      const selected = formik.values.regionOfOperation.includes(area);
                      return (
                        <CheckboxTag
                          key={area}
                          selected={selected}
                          label={area}
                          onToggle={() => toggleMultiSelect("regionOfOperation", area)}
                        />
                      );
                    })}
                  </div>
                  {hasError("regionOfOperation") && (
                    <p className="text-red-500 text-sm mt-2">{getError("regionOfOperation")}</p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                  <Award className="text-[#0B572B]" size={24} />
                  <h2 className="text-xl font-semibold text-[#0C1E1B]">Achievements</h2>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-[#0C1E1B]">Achievements (Optional)</h3>
                  {(formik.values.achievements || []).map((ach, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Achievement {index + 1}</span>
                        <button type="button" onClick={() => removeAchievement(index)} className="text-red-500 hover:text-red-700">
                          <X size={18} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={ach.title}
                          onChange={(e) => {
                            const copy = [...(formik.values.achievements || [])];
                            copy[index].title = e.target.value;
                            formik.setFieldValue("achievements", copy);
                          }}
                          className={inputBase + " border-gray-300"}
                          placeholder="Title (e.g., Top Seller 2022)"
                        />
                        <input
                          type="date"
                          value={ach.dateAwarded}
                          onChange={(e) => {
                            const copy = [...(formik.values.achievements || [])];
                            copy[index].dateAwarded = e.target.value;
                            formik.setFieldValue("achievements", copy);
                          }}
                          className={inputBase + " border-gray-300"}
                        />
                      </div>
                      <textarea
                        value={ach.description}
                        onChange={(e) => {
                          const copy = [...(formik.values.achievements || [])];
                          copy[index].description = e.target.value;
                          formik.setFieldValue("achievements", copy);
                        }}
                        className={inputBase + " border-gray-300"}
                        rows={3}
                        placeholder="Description"
                      />
                      <div className="space-y-2">
                        <AttachFile
                          heading="Upload Certificate (optional)"
                          setFileUrl={(url: string | null) => handleFileUpload(url!, "achievements", index)}
                          id={`achievement-${index}`}
                          className="w-full"
                          acceptedFileTypes="*"
                          onUploadStart={() => setIsUploading(true)}
                          onUploadEnd={() => setIsUploading(false)}
                        />
                        {ach.fileUrl && (
                          <div className="flex items-center gap-3">
                            {isImage(ach.fileUrl) ? (
                              <div className="w-20 h-14 rounded overflow-hidden bg-white border">
                                <img src={ach.fileUrl} alt="Certificate" className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <ImageIcon className="w-5 h-5 text-gray-500" />
                            )}
                            <a href={ach.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-[#0B572B] underline">
                              Preview file
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addAchievement} className="flex items-center gap-2 px-4 py-2 text-[#0B572B] border border-[#8DDB90] rounded-lg">
                    <Plus size={16} /> Add Achievement
                  </button>
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
                  disabled={isSubmitting || !formik.isValid}
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
