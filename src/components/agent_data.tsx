/**
 * eslint-disable react-hooks/exhaustive-deps
 *
 * @format
 */

/** @format */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { usePageContext } from "@/context/page-context";
import React, { FC, use, useEffect, useState } from "react";
import Button from "./general-components/button";
import Input from "./general-components/Input";
import Select from "./general-components/select";
import AttachFile from "@/components/general-components/attach_file";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Stepper from "@/components/post-property-components/Stepper";
//import * as Yup from 'yup';
import Cookies from "js-cookie";
import { PUT_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { useUserContext } from "@/context/user-context";
import naijaStates from "naija-state-local-government";
import ReactSelect from "react-select";
import customStyles from "@/styles/inputStyle";

interface Option {
  value: string;
  label: string;
}
const AgentData = () => {
  const router = useRouter();
  const { isContactUsClicked, isModalOpened } = usePageContext();
  const { user } = useUserContext();
  const [selectedAgentType, setSelectedAgentType] =
    useState<string>("Individual Agent");
  const [selectedState, setSelectedState] = useState<Option | null>(null);
  const [selectedLGA, setSelectedLGA] = useState<Option | null>(null);
  const [selectedIdType, setSelectedIdType] = useState<Option | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [stateOptions, setStateOptions] = useState<Option[]>([]);
  const [lgaOptions, setLgaOptions] = useState<Option[]>([]);
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const [idFileUrl, setIdFileUrl] = useState<string | null>(null);
  const [cacFileUrl, setCacFileUrl] = useState<string | null>(null);
  const [utilityBillFileUrl, setUtilityBillFileUrl] = useState<string | null>(
    null,
  ); // For utility bill upload

  useEffect(() => {
    console.log("User:", user);
  }, [user]);

  type StepStatus = "completed" | "active" | "pending";
  interface Step {
    label: string;
    status: StepStatus;
  }
  const steps: Step[] = [
    {
      label: "Personal Information",
      status:
        currentStep > 0
          ? "completed"
          : currentStep === 0
            ? "active"
            : "pending",
    },
    {
      label: "Upload Document",
      status:
        currentStep > 1
          ? "completed"
          : currentStep === 1
            ? "active"
            : "pending",
    },
  ];

  useEffect(() => {
    // Load Nigerian states correctly
    setStateOptions(
      naijaStates.states().map((state: string) => ({
        value: state,
        label: state,
      })),
    );
  }, []);

  const handleLGAChange = (selected: Option | null) => {
    formik.setFieldValue("localGovtArea", selected?.value);
    setSelectedLGA?.(selected);
  };

  const handleStateChange = (selected: Option | null) => {
    formik.setFieldValue("state", selected?.value);
    setSelectedState?.(selected);

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
      setSelectedLGA?.(null);
    } else {
      setLgaOptions([]);
      setSelectedLGA?.(null);
    }
  };

  const handleIdTypeChange = (selected: Option | null) => {
    formik.setFieldValue("typeOfID", selected?.value);
    setSelectedIdType(selected);
  };

  const validate = (values: any) => {
    const errors: any = {};

    // Common required fields
    if (!values.houseNumber) errors.houseNumber = "House number is required";
    if (!values.street) errors.street = "Street is required";
    if (!values.state) errors.state = "State is required";
    if (!values.localGovtArea)
      errors.localGovtArea = "Local government is required";
    if (!values.selectedRegion || values.selectedRegion.length === 0)
      errors.selectedRegion = "Region of operation is required";
    if (!values.firstName) errors.firstName = "First name is required";
    if (!values.lastName) errors.lastName = "Last name is required";
    if (!values.phoneNumber) errors.phoneNumber = "Phone number is required";

    // Required for both agent types
    if (!values.typeOfID) errors.typeOfID = "Type of ID is required";
    if (!values.idNumber) errors.idNumber = "ID Number is required";
    return errors;
  };

  const formik = useFormik({
    initialValues: {
      houseNumber: "",
      cacNumber: "",
      // IdNumber: '',
      street: "",
      state: "",
      localGovtArea: "",
      selectedRegion: [""],
      typeOfID: "",
      companyName: "",
      idNumber: "",
      registrationNumber: "",
      firstName: user?.firstName,
      lastName: user?.lastName,
      phoneNumber: user?.phoneNumber,
      email: user?.email,
    },
    validate,
    onSubmit: async () => {
      if (submitting) return; // Prevent double submissions

      if (selectedAgentType === "Corporate Agent") {
        if (!cacFileUrl) {
          return toast.error("Please upload your CAC document");
        }
      } else {
        if (!idFileUrl) {
          return toast.error("Please upload your government-issued ID");
        }
      }
      if (!utilityBillFileUrl) {
        return toast.error(
          "Please upload your utility bill for address verification",
        );
      }
      if (!user?.email) {
        return toast.error("User email is required. Please log in again.");
      }

      setSubmitting(true);

      const payload = {
        token: Cookies.get("token"),
        address: {
          homeNo: formik.values.houseNumber,
          street: formik.values.street,
          state: formik.values.state,
          localGovtArea: formik.values.localGovtArea,
        },
        regionOfOperation: formik.values.selectedRegion,
        agentType:
          selectedAgentType === "Individual Agent" ? "Individual" : "Company",
        ...(selectedAgentType === "Individual Agent"
          ? {}
          : {
              companyAgent: {
                companyName: formik.values.companyName,
                cacNumber: formik.values.cacNumber,
              },
            }),
        govtId: {
          typeOfId: formik.values.typeOfID,
          idNumber: formik.values.idNumber,
        },
        firstName: formik.values.firstName,
        lastName: formik.values.lastName,
        phoneNumber: formik.values.phoneNumber,
        email: user?.email,
        meansOfId:
          selectedAgentType === "Individual Agent"
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
      // console.log('Payload:', payload);
      try {
        await toast.promise(
          PUT_REQUEST(
            URLS.BASE + URLS.accountSettingsBaseUrl + "/onBoard",
            payload,
            Cookies.get("token") || "",
          ).then((response) => {
            if (response.success) {
              toast.success("Agent data submitted successfully");
              Cookies.set(
                "token",
                (response as unknown as { token: string }).token,
              );
              router.push("/agent-under-review");
              return "Agent data submitted successfully";
            } else {
              const errorMessage =
                (response as any).error ||
                (response as any).message ||
                "Submission failed";
              setSubmitting(false);
              throw new Error(errorMessage);
            }
          }),
          {
            loading: "Submitting...",
          },
        );
      } catch (error: any) {
        setSubmitting(false);
        // Show the actual error message from the API if available
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
        } else if (error?.message) {
          toast.error(error.message);
        } else {
          toast.error("Submission failed");
        }
      }
    },
  });

  useEffect(() => {
    if (user && !isInitialized) {
      formik.setValues({
        street: "",
        state: user?.address?.state || "",
        localGovtArea: user.address?.localGovtArea || "",
        selectedRegion: user.selectedRegion || [],
        typeOfID:
          user.agentType === "Individual"
            ? user.individualAgent?.typeOfId || ""
            : "",
        companyName:
          user.agentType === "Company"
            ? user?.companyAgent?.companyName || ""
            : "",
        idNumber:
          user.agentType === "Individual"
            ? user.individualAgent?.idNumber || ""
            : "",
        registrationNumber:
          user.agentType === "Company"
            ? user.companyAgent?.companyRegNumber || ""
            : "",
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        houseNumber: "",
        cacNumber: "",
        email: user.email,
      });
      setIsInitialized(true);
    }
  }, [user, isInitialized]);

  return (
    <section
      className={`flex items-center filter justify-center transition duration-500 bg-[#EEF1F1] min-h-[800px] py-[40px]  ${
        (isContactUsClicked || isModalOpened) && "brightness-[30%]"
      }`}
    >
      <form
        onSubmit={formik.handleSubmit}
        className="lg:w-[870px] flex flex-col justify-center items-center gap-[40px] w-full px-[20px]"
      >
        <div className="w-full min-h-[137px] flex flex-col gap-[24px] justify-center items-center">
          <div className="bg-gradient-to-r from-[#09391C] to-[#8DDB90] bg-clip-text text-transparent">
            <h2 className="text-center text-[32px] md:text-[40px] leading-[49.2px] font-display font-bold">
              Welcome to Khabi-teq Realty
            </h2>
          </div>
          <div className="max-w-2xl mx-auto bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <p className="text-[#5A5D63] text-[18px] md:text-[20px] leading-[32px] text-center">
              🎉 <strong>Congratulations!</strong> You&apos;re one step away
              from joining our exclusive agent network.
              <br />
              <span className="text-[#09391C] font-semibold">
                Please complete your verification
              </span>{" "}
              by uploading the required documents below.
            </p>
          </div>
        </div>

        <div className="my-8 w-full flex justify-center">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <Stepper steps={steps} />
          </div>
        </div>

        {currentStep === 0 && (
          <div className="lg:w-[602px] flex flex-col gap-[20px]">
            {/* <div className='flex flex-col w-full gap-[20px]'> */}
            <h2 className="text-[20px] leading-[32px] text-[#09391C] font-semibold">
              Address Information
            </h2>
            <div className="w-full flex flex-col gap-[20px]">
              <div className="min-h-[80px] flex gap-[15px] lg:flex-row flex-col">
                <Input
                  label="House Number"
                  name="houseNumber"
                  type="text"
                  value={formik.values.houseNumber}
                  id="houseNumber"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full sm:w-[45%] "
                  placeholder="This is a placeholder"
                />
                <Input
                  label="Street"
                  name="street"
                  type="text"
                  value={formik.values.street}
                  id="street"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="This is a placeholder"
                />
              </div>
              <div className=" flex gap-[15px] lg:flex-row flex-col">
                <Input
                  label="State"
                  name="state"
                  forState={true}
                  forLGA={false}
                  type="text"
                  placeholder="Select State"
                  formik={formik}
                  selectedState={selectedState}
                  stateOptions={stateOptions}
                  setSelectedState={handleStateChange}
                  // isDisabled={areInputsDisabled}
                />
                <Input
                  label="Local Government"
                  name="localGovtArea"
                  type="text"
                  formik={formik}
                  forLGA={true}
                  forState={false}
                  stateValue={selectedState?.label}
                  selectedLGA={selectedLGA}
                  lgasOptions={lgaOptions}
                  setSelectedLGA={handleLGAChange}
                  // isDisabled={areInputsDisabled}
                />
              </div>
              <RegionMultipleInput
                name="selectedRegion"
                formik={formik}
                allowMultiple={true}
                heading="Region of Operation"
                options={lgaOptions}
              />
            </div>
            {/* Agent Type */}
            <h2 className="text-[20px] text-[#09391C] font-semibold">
              Agent Type
            </h2>
            <div className="w-full flex flex-col gap-[20px]">
              <Select
                value={selectedAgentType}
                onChange={(option: any) => setSelectedAgentType(option.value)}
                name="Are you an Individual Agent or Corporate Agent?"
                className="cursor-pointer"
                options={["Individual Agent", "Corporate Agent"]}
              />
              <div className="w-full min-h-[80px] gap-[15px] flex lg:flex-row flex-col">
                {selectedAgentType === "Corporate Agent" ? (
                  <div className="w-full flex flex-col gap-[20px]">
                    <div
                      className={`w-full gap-[20px] ${
                        selectedAgentType === "Corporate Agent"
                          ? "flex-col"
                          : "flex lg:flex-row flex-col"
                      } flex`}
                    >
                      {/* Business/Company Name */}
                      <Input
                        label="Business/Company Name"
                        name="companyName"
                        className="md:w-full w-full"
                        type="text"
                        value={formik.values.companyName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        id="companyName"
                        placeholder="This is a placeholder"
                      />
                      {/* CAC Number */}
                      <Input
                        label="CAC Number"
                        name="cacNumber"
                        className="md:w-full w-full"
                        type="text"
                        value={formik.values.cacNumber}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        id="cacNumber"
                        placeholder="This is a placeholder"
                      />
                    </div>
                    <div
                      className={`w-full gap-[20px] ${
                        selectedAgentType === "Corporate Agent"
                          ? "flex-col"
                          : "flex lg:flex-row flex-col"
                      } flex`}
                    >
                      {/* Type of Government ID */}
                      <Input
                        label="Type of Government ID"
                        name="typeOfID"
                        type="text"
                        formik={formik}
                        forIdtype={true}
                        selectedIdType={selectedIdType}
                        idTypeOptions={[
                          {
                            value: "international passport",
                            label: "International Passport",
                          },
                          { value: "nin", label: "NIN" },
                          { value: "driver license", label: "Driver License" },
                          { value: "voter card", label: "Voter Card" },
                        ]}
                        className="md:w-full w-full"
                        setSelectedIdType={handleIdTypeChange}
                      />
                      {/* ID Number */}
                      <Input
                        label="ID Number"
                        name="idNumber"
                        className=" w-full"
                        type="number"
                        value={formik.values.idNumber}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        id="idNumber"
                        placeholder="This is a placeholder"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Only show these for Individual Agent */}
                    <Input
                      label="Type of Government ID"
                      name="typeOfID"
                      type="text"
                      formik={formik}
                      forIdtype={true}
                      selectedIdType={selectedIdType}
                      idTypeOptions={[
                        {
                          value: "international passport",
                          label: "International Passport",
                        },
                        { value: "nin", label: "NIN" },
                        { value: "driver license", label: "Driver License" },
                        { value: "voter card", label: "Voter Card" },
                      ]}
                      setSelectedIdType={handleIdTypeChange}
                    />
                    <Input
                      label="ID Number"
                      name="idNumber"
                      className="md:w-full w-full"
                      type="number"
                      value={formik.values.idNumber}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      id="idNumber"
                      placeholder="This is a placeholder"
                    />
                  </>
                )}
              </div>
            </div>
            <div className="flex justify-end w-full">
              <Button
                value="Next"
                type="button"
                green={true}
                className="bg-[#8DDB90] min-h-[50px] py-[12px] px-[24px] md:w-[40%] w-full text-[#FAFAFA] text-base leading-[25.6px] font-bold mt-4"
                onClick={() => setCurrentStep(1)}
              />
            </div>
          </div>
        )}
        {currentStep === 1 && (
          <>
            <div className="lg:w-[602px] min-h-[654px] flex flex-col gap-[40px]">
              {/**Agent Type */}
              <h2 className="text-[20px] leading-[32px] text-[#09391C]     font-semibold mb-[10px]">
                Upload for verification
              </h2>

              {selectedAgentType === "Individual Agent" ? (
                <div className="flex flex-col items-start gap-4">
                  <AttachFile
                    heading={`Upload your ${selectedIdType?.label || "ID"}`}
                    setFileUrl={setIdFileUrl}
                    id="id-upload"
                  />
                  <ImagePreview
                    fileUrl={idFileUrl}
                    onDelete={() => setIdFileUrl(null)}
                    onView={setImageModalUrl}
                    label="Uploaded ID"
                  />
                </div>
              ) : (
                <>
                  <AttachFile
                    heading={`Upload your ${selectedIdType?.label || "ID"}`}
                    setFileUrl={setIdFileUrl}
                    id="id-upload"
                  />
                  <ImagePreview
                    fileUrl={idFileUrl}
                    onDelete={() => setIdFileUrl(null)}
                    onView={setImageModalUrl}
                    label="Uploaded ID"
                  />
                  <AttachFile
                    heading="Upload your CAC"
                    setFileUrl={setCacFileUrl}
                    id="cac-upload"
                  />
                  <ImagePreview
                    fileUrl={cacFileUrl}
                    onDelete={() => setCacFileUrl(null)}
                    onView={setImageModalUrl}
                    label="Uploaded ID"
                  />
                </>
              )}

              <AttachFile
                heading="Upload your utility bill to verify your address"
                setFileUrl={setUtilityBillFileUrl}
                id="utility-bill-upload"
              />
              <ImagePreview
                fileUrl={utilityBillFileUrl}
                onDelete={() => setUtilityBillFileUrl(null)}
                onView={setImageModalUrl}
                label="Utility Bill"
              />

              {/* Modal for image preview */}
              {imageModalUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                  <div className="bg-white rounded-lg shadow-lg p-4 relative max-w-[90vw] max-h-[90vh] flex flex-col items-center">
                    <button
                      className="absolute top-2 right-2 text-gray-700 hover:text-red-500 text-2xl font-bold"
                      onClick={() => setImageModalUrl(null)}
                      aria-label="Close"
                    >
                      &times;
                    </button>
                    <img
                      src={imageModalUrl}
                      alt="Preview"
                      className="max-w-full max-h-[70vh] rounded"
                    />
                  </div>
                </div>
              )}
              {!formik.isValid && (
                <div className="text-red-500 text-sm mb-1">
                  Please fill all required fields to enable submit.
                </div>
              )}
              <div className="flex gap-4 w-full mt-4 justify-between">
                <Button
                  value="Back"
                  type="button"
                  green={false}
                  className="bg-gray-200 min-h-[50px] py-[12px] px-[24px] md:w-[30%] w-full text-[#09391C] text-base leading-[25.6px] font-bold"
                  onClick={() => {
                    setCurrentStep(0);
                    setIdFileUrl(null);
                    setUtilityBillFileUrl(null);
                  }}
                />
                <Button
                  value={submitting ? "Submitting..." : "Submit"}
                  type="button"
                  green={true}
                  isDisabled={submitting}
                  className="bg-[#8DDB90] min-h-[50px] py-[12px] px-[24px] md:w-[30%] w-full text-[#FAFAFA] text-base leading-[25.6px] font-bold"
                  onClick={() => {
                    if (!formik.isValid) {
                      const errors = validate(formik.values);
                      Object.values(errors).forEach((msg) =>
                        toast.error(String(msg)),
                      );
                      return;
                    }
                    formik.handleSubmit();
                  }}
                />
              </div>
            </div>
          </>
        )}
      </form>
    </section>
  );
};

interface SelectProps {
  heading: string;
  placeholder?: string;
  options: any[];
  formik: any;
  allowMultiple?: boolean;
  name: string;
}

const RegionMultipleInput: FC<SelectProps> = ({
  name,
  formik,
  allowMultiple,
  heading,
  options,
}) => {
  useEffect(() => {
    console.log(`options: ${options} \n length: ${options.length}`);
  }, [options]);
  return (
    <label
      htmlFor="select"
      className="min-h-[80px] w-full flex flex-col gap-[4px]"
    >
      <h2 className="text-base font-medium leading-[25.6px] text-[#1E1E1E]">
        {heading}
      </h2>
      <ReactSelect
        isMulti={allowMultiple}
        name={name}
        onChange={(selectedOption) =>
          allowMultiple
            ? formik.setFieldValue(
                name,
                [
                  ...(Array.isArray(selectedOption)
                    ? selectedOption.map((opt: any) => opt.label)
                    : []),
                ].filter(Boolean),
              )
            : formik.setFieldValue(name, selectedOption?.label ?? "")
        }
        onBlur={formik.handleBlur}
        value={
          allowMultiple
            ? options.filter((opt) => formik.values[name]?.includes(opt.label))
            : options.find((opt) => opt.label === formik.values[name]) || null
        }
        // value={options.length !== 0 ? formik.values[heading]?.label : null}
        options={options.length !== 0 ? options : []}
        className={`w-full bg-white`}
        styles={customStyles}
        placeholder="Select"
      />
    </label>
  );
};

// ...existing imports...

interface ImagePreviewProps {
  fileUrl: string | null;
  onDelete: () => void;
  onView: (url: string) => void;
  label?: string;
}

const ImagePreview: FC<ImagePreviewProps> = ({
  fileUrl,
  onDelete,
  onView,
  label,
}) => {
  if (!fileUrl) return null;
  return (
    <div className="w-full flex justify-end">
      <div className="flex flex-col items-center w-[140px]">
        {/* Delete icon at top right, overlayed */}
        <div className="w-full flex justify-end">
          <button
            type="button"
            className="rounded-full shadow mr-7 p-1"
            onClick={onDelete}
            title="Remove"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path
                d="M6 7h12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h12z"
                stroke="#F41515"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 11v6M14 11v6"
                stroke="#F41515"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        {/* Image preview */}
        <div className="w-[80px] h-[80px] relative">
          <img
            src={fileUrl}
            alt={label || "Uploaded file"}
            className="w-full h-full object-cover rounded"
            style={{ cursor: "pointer" }}
            onClick={() => onView(fileUrl)}
          />
          {/* View image text inside image container */}
          <span
            className="absolute bottom-1 left-1 right-1 text-center text-[10px] text-[#0B423D] font-semibold px-1 cursor-pointer underline"
            onClick={() => onView(fileUrl)}
          >
            View image
          </span>
          <p>
            <span className="text-xs text-gray-500">
              {label || "Uploaded file"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
// ...existing code...
export default AgentData;
