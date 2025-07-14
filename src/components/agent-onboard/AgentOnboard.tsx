/** @format */

"use client";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  MapPin,
  Building,
  Upload,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Eye,
  Trash2,
  X,
} from "lucide-react";
import { useUserContext } from "@/context/user-context";
import { PUT_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import Cookies from "js-cookie";
import naijaStates from "naija-state-local-government";
import ReactSelect from "react-select";
import AttachFile from "@/components/general-components/attach_file";

interface Option {
  value: string;
  label: string;
}

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

interface FormValues {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  houseNumber: string;
  street: string;
  state: string;
  localGovtArea: string;
  selectedRegion: string[]; // important for correct typing in multiselect
  typeOfID: string;
  idNumber: string;
  companyName: string;
  cacNumber: string;
}

// Success Modal Component
const SuccessModal: React.FC<{
  showModal: boolean;
  onGoToDashboard: () => void;
}> = ({ showModal, onGoToDashboard }) => (
  <AnimatePresence>
    {showModal && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 text-center"
        >
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-[#8DDB90]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-[#8DDB90]" />
            </div>
            <h3 className="text-2xl font-bold text-[#09391C] mb-2">
              Application Submitted Successfully!
            </h3>
            <p className="text-[#5A5D63] mb-6">
              Thank you for submitting your agent application. Our admin team
              will review your submission and respond to you soon.
            </p>
          </div>

          {/* Success Details */}
          <div className="bg-[#8DDB90]/10 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold text-[#09391C] mb-2 flex items-center justify-center gap-2">
              <AlertCircle size={16} />
              What happens next?
            </h4>
            <div className="text-sm text-[#5A5D63] space-y-1 text-left">
              <p>• Your application is now under review</p>
              <p>• We'll verify your documents within 24-48 hours</p>
              <p>• You'll receive an email notification once approved</p>
              <p>• Access to agent features will be activated upon approval</p>
            </div>
          </div>

          {/* Dashboard Button - Only way to close modal */}
          <button
            onClick={onGoToDashboard}
            className="w-full bg-[#8DDB90] hover:bg-[#7BC87F] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#8DDB90]/50 focus:ring-offset-2"
          >
            <div className="flex items-center justify-center space-x-2">
              <span>Go to Dashboard</span>
              <ArrowRight size={18} />
            </div>
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <div className="flex items-center justify-center space-x-2 mb-8">
      {Array.from({ length: totalSteps }, (_, index) => (
        <React.Fragment key={index}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
              index < currentStep
                ? "bg-[#8DDB90] text-white"
                : index === currentStep
                  ? "bg-[#8DDB90] text-white ring-4 ring-[#8DDB90]/20"
                  : "bg-gray-200 text-gray-500"
            }`}
          >
            {index < currentStep ? <CheckCircle size={16} /> : index + 1}
          </div>
          {index < totalSteps - 1 && (
            <div
              className={`h-1 w-12 transition-all duration-300 ${
                index < currentStep ? "bg-[#8DDB90]" : "bg-gray-200"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const AgentOnboard: React.FC = () => {
  const router = useRouter();
  const { user } = useUserContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAgentType, setSelectedAgentType] =
    useState<string>("Individual");
  const [selectedState, setSelectedState] = useState<Option | null>(null);
  const [selectedLGA, setSelectedLGA] = useState<Option | null>(null);
  const [selectedIdType, setSelectedIdType] = useState<Option | null>(null);
  const [stateOptions, setStateOptions] = useState<Option[]>([]);
  const [lgaOptions, setLgaOptions] = useState<Option[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // File upload states
  const [idFileUrl, setIdFileUrl] = useState<string | null>(null);
  const [cacFileUrl, setCacFileUrl] = useState<string | null>(null);
  const [utilityBillFileUrl, setUtilityBillFileUrl] = useState<string | null>(
    null,
  );

  const validationSchema = Yup.object({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    phoneNumber: Yup.string().required("Phone number is required"),
    houseNumber: Yup.string().required("House number is required"),
    street: Yup.string().required("Street is required"),
    state: Yup.string().required("State is required"),
    localGovtArea: Yup.string().required("Local government is required"),
    selectedRegion: Yup.array().min(1, "At least one region is required"),
    typeOfID: Yup.string().required("Type of ID is required"),
    idNumber: Yup.string().required("ID number is required"),
    ...(selectedAgentType === "Company" && {
      companyName: Yup.string().required("Company name is required"),
      cacNumber: Yup.string().required("CAC number is required"),
    }),
  });

  const formik = useFormik<FormValues>({
    initialValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phoneNumber: user?.phoneNumber || "",
      email: user?.email || "",
      houseNumber: "",
      street: "",
      state: "",
      localGovtArea: "",
      selectedRegion: [],
      typeOfID: "",
      idNumber: "",
      companyName: "",
      cacNumber: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      // Handle submission
      await handleSubmit(values);
    },
  });

  useEffect(() => {
    setStateOptions(
      naijaStates.states().map((state: string) => ({
        value: state,
        label: state,
      })),
    );
  }, []);

  const handleStateChange = (selected: Option | null) => {
    formik.setFieldValue("state", selected?.value || "");
    setSelectedState(selected);

    if (selected) {
      const lgas = naijaStates.lgas(selected.value)?.lgas;
      if (Array.isArray(lgas)) {
        setLgaOptions(
          lgas.map((lga: string) => ({
            value: lga,
            label: lga,
          })),
        );
      } else {
        setLgaOptions([]);
      }
      setSelectedLGA(null);
      formik.setFieldValue("localGovtArea", "");
    } else {
      setLgaOptions([]);
      setSelectedLGA(null);
    }
  };

  const handleLGAChange = (selected: Option | null) => {
    formik.setFieldValue("localGovtArea", selected?.value || "");
    setSelectedLGA(selected);
  };

  const handleIdTypeChange = (selected: Option | null) => {
    formik.setFieldValue("typeOfID", selected?.value || "");
    setSelectedIdType(selected);
  };

  const handleSubmit = async (values: any) => {
    if (submitting) return;

    // Validation for file uploads
    if (selectedAgentType === "Company") {
      if (!cacFileUrl) {
        toast.error("Please upload your CAC document");
        return;
      }
    }
    if (!idFileUrl) {
      toast.error("Please upload your government-issued ID");
      return;
    }
    if (!utilityBillFileUrl) {
      toast.error("Please upload your utility bill");
      return;
    }

    setSubmitting(true);

    const payload = {
      token: Cookies.get("token"),
      address: {
        homeNo: values.houseNumber,
        street: values.street,
        state: values.state,
        localGovtArea: values.localGovtArea,
      },
      regionOfOperation: values.selectedRegion,
      agentType: selectedAgentType,
      ...(selectedAgentType === "Company" && {
        companyAgent: {
          companyName: values.companyName,
          cacNumber: values.cacNumber,
        },
      }),
      govtId: {
        typeOfId: values.typeOfID,
        idNumber: values.idNumber,
      },
      firstName: values.firstName,
      lastName: values.lastName,
      phoneNumber: values.phoneNumber,
      email: values.email,
      meansOfId:
        selectedAgentType === "Individual"
          ? [
              {
                name: selectedIdType?.value,
                docImg: idFileUrl ? [idFileUrl] : [],
              },
              {
                name: "utility bill",
                docImg: utilityBillFileUrl ? [utilityBillFileUrl] : [],
              },
            ]
          : [
              {
                name: "cac",
                docImg: cacFileUrl ? [cacFileUrl] : [],
              },
              {
                name: "govID",
                docImg: idFileUrl ? [idFileUrl] : [],
              },
              {
                name: "utility bill",
                docImg: utilityBillFileUrl ? [utilityBillFileUrl] : [],
              },
            ],
    };

    try {
      await toast.promise(
        PUT_REQUEST(
          URLS.BASE + URLS.agentOnboarding,
          payload,
          Cookies.get("token"),
        ).then((response) => {
          if (response.success) {
            Cookies.set("token", (response as any).token);
            // Show success modal instead of redirecting
            setShowSuccessModal(true);
            return "Application submitted successfully";
          } else {
            throw new Error((response as any).error || "Submission failed");
          }
        }),
        {
          loading: "Submitting your application...",
          success: "Application submitted successfully!",
          error: (error: any) => error.message || "Submission failed",
        },
      );
    } catch (error: any) {
      console.error("Submission error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoToDashboard = () => {
    setShowSuccessModal(false);
    router.push("/agent/dashboard");
  };

  const nextStep = () => {
    if (currentStep === 0) {
      // Validate basic info before proceeding
      const basicErrors = [
        !formik.values.firstName && "First name is required",
        !formik.values.lastName && "Last name is required",
        !formik.values.phoneNumber && "Phone number is required",
        !formik.values.houseNumber && "House number is required",
        !formik.values.street && "Street is required",
        !formik.values.state && "State is required",
        !formik.values.localGovtArea && "Local government is required",
        (!formik.values.selectedRegion ||
          formik.values.selectedRegion.length === 0) &&
          "Region of operation is required",
      ].filter(Boolean);

      if (basicErrors.length > 0) {
        basicErrors.forEach((error) => toast.error(error as string));
        return;
      }
    }

    if (currentStep === 1) {
      // Validate agent type specific fields
      const agentErrors = [
        !formik.values.typeOfID && "Type of ID is required",
        !formik.values.idNumber && "ID number is required",
        ...(selectedAgentType === "Company"
          ? [
              !formik.values.companyName && "Company name is required",
              !formik.values.cacNumber && "CAC number is required",
            ]
          : []),
      ].filter(Boolean);

      if (agentErrors.length > 0) {
        agentErrors.forEach((error) => toast.error(error as string));
        return;
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, 2));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const steps = [
    {
      title: "Personal Information",
      description: "Tell us about yourself and your location",
      icon: User,
    },
    {
      title: "Agent Details",
      description: "Choose your agent type and provide credentials",
      icon: Building,
    },
    {
      title: "Document Upload",
      description: "Upload required documents for verification",
      icon: FileText,
    },
  ];

  const idTypeOptions = [
    { value: "international passport", label: "International Passport" },
    { value: "nin", label: "NIN" },
    { value: "driver license", label: "Driver License" },
    { value: "voter card", label: "Voter Card" },
  ];

  const customSelectStyles = {
    control: (provided: any) => ({
      ...provided,
      border: "1px solid #D6DDEB",
      borderRadius: "8px",
      padding: "4px",
      fontSize: "14px",
      "&:hover": {
        borderColor: "#8DDB90",
      },
      "&:focus": {
        borderColor: "#8DDB90",
        boxShadow: "0 0 0 1px #8DDB90",
      },
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF1F1] to-[#F8FFFE] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="bg-gradient-to-r from-[#09391C] to-[#8DDB90] bg-clip-text text-transparent">
            <h1 className="text-3xl sm:text-4xl font-bold font-display mb-4">
              Welcome to Khabi-teq Realty
            </h1>
          </div>
          <div className="max-w-2xl mx-auto bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-[#5A5D63] text-lg">
              🎉 <strong>Congratulations!</strong> You&apos;re one step away
              from joining our exclusive agent network.
              <br />
              <span className="text-[#09391C] font-semibold">
                Please complete your verification
              </span>{" "}
              by providing the required information below.
            </p>
          </div>
        </motion.div>

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} totalSteps={3} />

        {/* Current Step Info */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg p-6 mb-8 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-[#8DDB90]/10 rounded-lg">
              {React.createElement(steps[currentStep].icon, {
                size: 24,
                className: "text-[#8DDB90]",
              })}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#09391C]">
                {steps[currentStep].title}
              </h2>
              <p className="text-[#5A5D63]">{steps[currentStep].description}</p>
            </div>
          </div>
        </motion.div>

        {/* Form Content */}
        <form onSubmit={formik.handleSubmit}>
          <AnimatePresence mode="wait">
            {/* Step 1: Personal Information */}
            {currentStep === 0 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
              >
                <div className="space-y-6">
                  {/* Personal Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#09391C] mb-4 flex items-center gap-2">
                      <User size={20} />
                      Personal Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#09391C] mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formik.values.firstName}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                          placeholder="Enter your first name"
                        />
                        {formik.touched.firstName &&
                          formik.errors.firstName && (
                            <p className="text-red-500 text-sm mt-1">
                              {formik.errors.firstName}
                            </p>
                          )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#09391C] mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formik.values.lastName}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                          placeholder="Enter your last name"
                        />
                        {formik.touched.lastName && formik.errors.lastName && (
                          <p className="text-red-500 text-sm mt-1">
                            {formik.errors.lastName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#09391C] mb-2">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          name="phoneNumber"
                          value={formik.values.phoneNumber}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                          placeholder="Enter your phone number"
                        />
                        {formik.touched.phoneNumber &&
                          formik.errors.phoneNumber && (
                            <p className="text-red-500 text-sm mt-1">
                              {formik.errors.phoneNumber}
                            </p>
                          )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#09391C] mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formik.values.email}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                          placeholder="Your email address"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#09391C] mb-4 flex items-center gap-2">
                      <MapPin size={20} />
                      Address Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#09391C] mb-2">
                          House Number
                        </label>
                        <input
                          type="text"
                          name="houseNumber"
                          value={formik.values.houseNumber}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                          placeholder="Enter house number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#09391C] mb-2">
                          Street
                        </label>
                        <input
                          type="text"
                          name="street"
                          value={formik.values.street}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                          placeholder="Enter street name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#09391C] mb-2">
                          State
                        </label>
                        <ReactSelect
                          options={stateOptions}
                          value={selectedState}
                          onChange={handleStateChange}
                          styles={customSelectStyles}
                          placeholder="Select state"
                          isClearable
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#09391C] mb-2">
                          Local Government Area
                        </label>
                        <ReactSelect
                          options={lgaOptions}
                          value={selectedLGA}
                          onChange={handleLGAChange}
                          styles={customSelectStyles}
                          placeholder="Select LGA"
                          isClearable
                          isDisabled={!selectedState}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Region of Operation */}
                  <div>
                    <label className="block text-sm font-medium text-[#09391C] mb-2">
                      Region of Operation
                    </label>
                    <ReactSelect
                      isMulti
                      options={lgaOptions}
                      value={lgaOptions.filter((opt) =>
                        formik.values.selectedRegion.includes(opt.label),
                      )}
                      onChange={(selectedOptions) => {
                        const values = selectedOptions
                          ? selectedOptions.map((opt: any) => opt.label)
                          : [];
                        formik.setFieldValue("selectedRegion", values);
                      }}
                      styles={customSelectStyles}
                      placeholder="Select regions where you operate"
                      isDisabled={!selectedState}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Select the areas where you plan to operate as an agent
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Agent Details */}
            {currentStep === 1 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
              >
                <div className="space-y-6">
                  {/* Agent Type */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#09391C] mb-4 flex items-center gap-2">
                      <Building size={20} />
                      Agent Type
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {["Individual", "Company"].map((type) => (
                        <div
                          key={type}
                          onClick={() => setSelectedAgentType(type)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedAgentType === type
                              ? "border-[#8DDB90] bg-[#8DDB90]/5"
                              : "border-gray-200 hover:border-[#8DDB90]/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded-full border-2 ${
                                selectedAgentType === type
                                  ? "border-[#8DDB90] bg-[#8DDB90]"
                                  : "border-gray-300"
                              }`}
                            />
                            <div>
                              <h4 className="font-medium text-[#09391C]">
                                {type} Agent
                              </h4>
                              <p className="text-sm text-gray-600">
                                {type === "Individual"
                                  ? "Operating as an individual"
                                  : "Operating as a company"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Company Details (if Company selected) */}
                  {selectedAgentType === "Company" && (
                    <div>
                      <h4 className="text-md font-semibold text-[#09391C] mb-4">
                        Company Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#09391C] mb-2">
                            Company Name
                          </label>
                          <input
                            type="text"
                            name="companyName"
                            value={formik.values.companyName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                            placeholder="Enter company name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#09391C] mb-2">
                            CAC Number
                          </label>
                          <input
                            type="text"
                            name="cacNumber"
                            value={formik.values.cacNumber}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                            placeholder="Enter CAC number"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ID Information */}
                  <div>
                    <h4 className="text-md font-semibold text-[#09391C] mb-4">
                      Government ID Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#09391C] mb-2">
                          Type of Government ID
                        </label>
                        <ReactSelect
                          options={idTypeOptions}
                          value={selectedIdType}
                          onChange={handleIdTypeChange}
                          styles={customSelectStyles}
                          placeholder="Select ID type"
                          isClearable
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#09391C] mb-2">
                          ID Number
                        </label>
                        <input
                          type="text"
                          name="idNumber"
                          value={formik.values.idNumber}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                          placeholder="Enter ID number"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Document Upload */}
            {currentStep === 2 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
              >
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-[#09391C] mb-4 flex items-center gap-2">
                    <Upload size={20} />
                    Document Upload
                  </h3>

                  {/* Government ID Upload */}
                  <div>
                    <AttachFile
                      heading={`Upload your ${selectedIdType?.label || "Government ID"}`}
                      setFileUrl={setIdFileUrl}
                      id="id-upload"
                    />
                    {idFileUrl && (
                      <div className="mt-3 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle size={16} className="text-green-500" />
                          <span className="text-sm text-gray-700">
                            ID document uploaded
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setImageModalUrl(idFileUrl)}
                            className="text-[#8DDB90] hover:text-[#7BC87F]"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setIdFileUrl(null)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CAC Upload (if Company) */}
                  {selectedAgentType === "Company" && (
                    <div>
                      <AttachFile
                        heading="Upload your CAC Certificate"
                        setFileUrl={setCacFileUrl}
                        id="cac-upload"
                      />
                      {cacFileUrl && (
                        <div className="mt-3 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <CheckCircle size={16} className="text-green-500" />
                            <span className="text-sm text-gray-700">
                              CAC document uploaded
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setImageModalUrl(cacFileUrl)}
                              className="text-[#8DDB90] hover:text-[#7BC87F]"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setCacFileUrl(null)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Utility Bill Upload */}
                  <div>
                    <AttachFile
                      heading="Upload your Utility Bill (for address verification)"
                      setFileUrl={setUtilityBillFileUrl}
                      id="utility-bill-upload"
                    />
                    {utilityBillFileUrl && (
                      <div className="mt-3 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle size={16} className="text-green-500" />
                          <span className="text-sm text-gray-700">
                            Utility bill uploaded
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setImageModalUrl(utilityBillFileUrl)}
                            className="text-[#8DDB90] hover:text-[#7BC87F]"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setUtilityBillFileUrl(null)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Requirements checklist */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                      <AlertCircle size={16} />
                      Document Requirements
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Government ID must be clear and readable</li>
                      {selectedAgentType === "Company" && (
                        <li>• CAC certificate must be current and valid</li>
                      )}
                      <li>• Utility bill must be recent (within 3 months)</li>
                      <li>
                        • All documents must be in JPG, PNG, or PDF format
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft size={16} />
                Previous
              </button>
            ) : (
              <div />
            )}

            {currentStep < 2 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 bg-[#8DDB90] text-white rounded-lg hover:bg-[#7BC87F] transition-colors"
              >
                Next
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 bg-[#8DDB90] text-white rounded-lg hover:bg-[#7BC87F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit Application"}
                <CheckCircle size={16} />
              </button>
            )}
          </div>
        </form>

        {/* Image Modal */}
        {imageModalUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-lg shadow-lg p-4 relative max-w-[90vw] max-h-[90vh] flex flex-col items-center">
              <button
                className="absolute top-2 right-2 text-gray-700 hover:text-red-500 text-2xl font-bold"
                onClick={() => setImageModalUrl(null)}
                aria-label="Close"
              >
                <X size={24} />
              </button>
              <img
                src={imageModalUrl}
                alt="Preview"
                className="max-w-full max-h-[70vh] rounded"
              />
            </div>
          </div>
        )}

        {/* Success Modal */}
        <SuccessModal
          showModal={showSuccessModal}
          onGoToDashboard={handleGoToDashboard}
        />
      </div>
    </div>
  );
};

export default AgentOnboard;
