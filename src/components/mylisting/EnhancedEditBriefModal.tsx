/** @format */

"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader, Upload, Trash2 } from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import ReactSelect from "react-select";
import PhoneInput from "react-phone-number-input";
import { PUT_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import customStyles from "@/styles/inputStyle";
import {
  getStates,
  getLGAsByState,
  getAreasByStateLGA,
} from "@/utils/location-utils";
import { propertyReferenceData } from "@/data/buy_page_data";
import {
  featuresData,
  DocOnPropertyData,
  JvConditionData,
} from "@/data/buy_data";
import { tenantCriteriaData } from "@/data/landlord";
import "react-phone-number-input/style.css";

interface Brief {
  _id: string;
  propertyType: string;
  propertyCondition: string;
  briefType: string;
  price: number;
  features: string[];
  tenantCriteria: string[];
  owner: string;
  areYouTheOwner: boolean;
  isAvailable: string;
  pictures: string[];
  isApproved: boolean;
  isRejected: boolean;
  docOnProperty: Array<{
    docName: string;
    isProvided: boolean;
    _id: string;
  }>;
  isPreference: boolean;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
  location: {
    state: string;
    localGovernment: string;
    area: string;
  };
  landSize: {
    measurementType: string;
    size: number;
  };
  additionalFeatures: {
    additionalFeatures: string[];
    noOfBedroom?: string;
    noOfBathroom?: string;
    noOfToilet?: string;
    noOfCarPark?: string;
  };
  propertyCategory?: string;
  rentalType?: string;
  typeOfBuilding?: string;
  description?: string;
  isTenanted?: string;
  contactInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  documents?: string[];
  jvConditions?: string[];
  holdDuration?: number;
  leaseHold?: number;
  isLegalOwner?: boolean;
  ownershipDocuments?: string[];
  additionalInfo?: string;
}

interface EnhancedEditBriefModalProps {
  brief: Brief;
  onClose: () => void;
  onSave: () => void;
}

interface Option {
  value: string;
  label: string;
}

const validationSchema = Yup.object({
  price: Yup.number()
    .required("Price is required")
    .min(1, "Price must be greater than 0"),
  propertyCondition: Yup.string(),
  isAvailable: Yup.string().required("Availability status is required"),
  location: Yup.object({
    state: Yup.string().required("State is required"),
    localGovernment: Yup.string().required("Local Government is required"),
    area: Yup.string().required("Area is required"),
  }),
  landSize: Yup.object({
    size: Yup.number()
      .required("Land size is required")
      .min(1, "Land size must be greater than 0"),
    measurementType: Yup.string().required("Measurement type is required"),
  }),
  propertyCategory: Yup.string().required("Property category is required"),
  typeOfBuilding: Yup.string().when("propertyCategory", {
    is: (val: string) => val !== "Land",
    then: (schema) => schema.required("Building type is required"),
    otherwise: (schema) => schema,
  }),
  contactInfo: Yup.object({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string().required("Phone number is required"),
  }),
});

const EnhancedEditBriefModal: React.FC<EnhancedEditBriefModalProps> = ({
  brief,
  onClose,
  onSave,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    brief.features || [],
  );
  const [selectedTenantCriteria, setSelectedTenantCriteria] = useState<
    string[]
  >(brief.tenantCriteria || []);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>(
    brief.documents || [],
  );
  const [selectedJvConditions, setSelectedJvConditions] = useState<string[]>(
    brief.jvConditions || [],
  );
  const [selectedOwnershipDocs, setSelectedOwnershipDocs] = useState<string[]>(
    brief.ownershipDocuments || [],
  );
  const [stateOptions, setStateOptions] = useState<Option[]>([]);
  const [lgaOptions, setLgaOptions] = useState<Option[]>([]);
  const [areaOptions, setAreaOptions] = useState<Option[]>([]);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);

  const propertyConditions = [
    "New",
    "Excellent",
    "Good",
    "Fair",
    "Needs renovation",
  ];
  const measurementTypes = [
    "Plot",
    "Acres",
    "Square meters",
    "Square feet",
    "Hectares",
  ];

  useEffect(() => {
    const states = getStates().map((state: string) => ({
      value: state,
      label: state,
    }));
    setStateOptions(states);
  }, []);

  useEffect(() => {
    if (brief.location.state) {
      const lgas = getLGAsByState(brief.location.state).map((lga: string) => ({
        value: lga,
        label: lga,
      }));
      setLgaOptions(lgas);
    }
  }, [brief.location.state]);

  useEffect(() => {
    if (brief.location.state && brief.location.localGovernment) {
      const areas = getAreasByStateLGA(
        brief.location.state,
        brief.location.localGovernment,
      ).map((area: string) => ({
        value: area,
        label: area,
      }));
      setAreaOptions(areas);
    }
  }, [brief.location.state, brief.location.localGovernment]);

  const initialValues = {
    // Basic Details
    price: brief.price,
    propertyCondition: brief.propertyCondition || "",
    isAvailable: brief.isAvailable,
    propertyCategory: brief.propertyCategory || "Residential",
    rentalType: brief.rentalType || "",
    typeOfBuilding: brief.typeOfBuilding || "",
    description: brief.description || "",

    // Location
    location: {
      state: brief.location.state,
      localGovernment: brief.location.localGovernment,
      area: brief.location.area,
    },

    // Land Size
    landSize: {
      size: brief.landSize.size,
      measurementType: brief.landSize.measurementType,
    },

    // Property Details
    additionalFeatures: {
      noOfBedroom: brief.additionalFeatures?.noOfBedroom || "",
      noOfBathroom: brief.additionalFeatures?.noOfBathroom || "",
      noOfToilet: brief.additionalFeatures?.noOfToilet || "",
      noOfCarPark: brief.additionalFeatures?.noOfCarPark || "",
    },

    // Contact Information
    contactInfo: {
      firstName: brief.contactInfo?.firstName || "",
      lastName: brief.contactInfo?.lastName || "",
      email: brief.contactInfo?.email || "",
      phone: brief.contactInfo?.phone || "",
    },

    // Additional Fields
    areYouTheOwner: brief.areYouTheOwner,
    isLegalOwner: brief.isLegalOwner ?? true,
    isTenanted: brief.isTenanted || "",
    additionalInfo: brief.additionalInfo || "",
    holdDuration: brief.holdDuration || 0,
    leaseHold: brief.leaseHold || 0,
  };

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        features: selectedFeatures,
        tenantCriteria: selectedTenantCriteria,
        documents: selectedDocuments,
        jvConditions: selectedJvConditions,
        ownershipDocuments: selectedOwnershipDocs,
        // Additional fields that might be in the brief
        briefType: brief.briefType,
        propertyType: brief.propertyType,
      };

      const response = await PUT_REQUEST(
        `${URLS.BASE}/user/briefs/${brief._id}`,
        payload,
        Cookies.get("token"),
      );

      if (response && response.success !== false) {
        toast.success("Brief updated successfully!");
        onSave();
      } else {
        toast.error(response?.message || "Failed to update brief");
      }
    } catch (error) {
      console.error("Error updating brief:", error);
      toast.error("An error occurred while updating the brief");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleArrayItem = (
    item: string,
    array: string[],
    setArray: (arr: string[]) => void,
  ) => {
    setArray(
      array.includes(item) ? array.filter((i) => i !== item) : [...array, item],
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setUploadedImages((prev) => [...prev, ...Array.from(files)]);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h2 className="text-2xl font-bold text-[#09391C]">
              Edit Property Brief
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, values, setFieldValue }) => (
                <Form className="space-y-8">
                  {/* Basic Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-[#09391C] mb-6">
                      Basic Information
                    </h3>

                    {/* Property Category */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-[#09391C] mb-3">
                        Property Category *
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {["Residential", "Commercial", "Land"].map(
                          (category) => (
                            <button
                              key={category}
                              type="button"
                              onClick={() =>
                                setFieldValue("propertyCategory", category)
                              }
                              className={`p-4 border-2 rounded-lg text-center transition-all ${
                                values.propertyCategory === category
                                  ? "border-[#8DDB90] bg-[#E4EFE7] text-[#09391C] font-semibold"
                                  : "border-[#C7CAD0] hover:border-[#8DDB90] text-[#5A5D63]"
                              }`}
                            >
                              {category}
                            </button>
                          ),
                        )}
                      </div>
                      <ErrorMessage
                        name="propertyCategory"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-[#09391C] mb-2">
                          Price (₦) *
                        </label>
                        <Field
                          name="price"
                          type="number"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                          placeholder="Enter price"
                        />
                        <ErrorMessage
                          name="price"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      {brief.briefType === "rent" && (
                        <div>
                          <label className="block text-sm font-medium text-[#09391C] mb-2">
                            Lease Hold
                          </label>
                          <Field
                            name="leaseHold"
                            type="number"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                            placeholder="Enter lease hold amount"
                          />
                        </div>
                      )}
                    </div>

                    {/* Rental Type for rent properties */}
                    {brief.briefType === "rent" &&
                      values.propertyCategory !== "Land" && (
                        <div className="mt-6">
                          <label className="block text-sm font-medium text-[#09391C] mb-3">
                            Rental Type *
                          </label>
                          <div className="flex gap-6">
                            <label className="flex items-center">
                              <Field
                                type="radio"
                                name="rentalType"
                                value="Rent"
                                className="mr-2"
                              />
                              Rent
                            </label>
                            <label className="flex items-center">
                              <Field
                                type="radio"
                                name="rentalType"
                                value="Lease"
                                className="mr-2"
                              />
                              Lease
                            </label>
                          </div>
                        </div>
                      )}

                    {/* Property Condition */}
                    {brief.briefType === "rent" &&
                      values.propertyCategory !== "Land" && (
                        <div className="mt-6">
                          <label className="block text-sm font-medium text-[#09391C] mb-2">
                            Property Condition
                          </label>
                          <Field
                            as="select"
                            name="propertyCondition"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                          >
                            <option value="">Select condition</option>
                            {propertyConditions.map((condition) => (
                              <option key={condition} value={condition}>
                                {condition}
                              </option>
                            ))}
                          </Field>
                        </div>
                      )}

                    {/* Availability */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-[#09391C] mb-3">
                        Availability *
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <Field
                            type="radio"
                            name="isAvailable"
                            value="yes"
                            className="mr-2"
                          />
                          Available
                        </label>
                        <label className="flex items-center">
                          <Field
                            type="radio"
                            name="isAvailable"
                            value="no"
                            className="mr-2"
                          />
                          Not Available
                        </label>
                      </div>
                      <ErrorMessage
                        name="isAvailable"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-[#09391C] mb-6">
                      Property Location
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#09391C] mb-2">
                          State *
                        </label>
                        <ReactSelect
                          options={stateOptions}
                          value={stateOptions.find(
                            (opt) => opt.value === values.location.state,
                          )}
                          onChange={(option) => {
                            setFieldValue(
                              "location.state",
                              option?.value || "",
                            );
                            setFieldValue("location.localGovernment", "");
                            setFieldValue("location.area", "");
                          }}
                          placeholder="Select state"
                          styles={customStyles}
                          isSearchable
                        />
                        <ErrorMessage
                          name="location.state"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#09391C] mb-2">
                          Local Government *
                        </label>
                        <ReactSelect
                          options={lgaOptions}
                          value={lgaOptions.find(
                            (opt) =>
                              opt.value === values.location.localGovernment,
                          )}
                          onChange={(option) => {
                            setFieldValue(
                              "location.localGovernment",
                              option?.value || "",
                            );
                            setFieldValue("location.area", "");
                          }}
                          placeholder="Select LGA"
                          styles={customStyles}
                          isSearchable
                          isDisabled={!values.location.state}
                        />
                        <ErrorMessage
                          name="location.localGovernment"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#09391C] mb-2">
                          Area/Neighborhood *
                        </label>
                        <ReactSelect
                          options={areaOptions}
                          value={areaOptions.find(
                            (opt) => opt.value === values.location.area,
                          )}
                          onChange={(option) =>
                            setFieldValue("location.area", option?.value || "")
                          }
                          placeholder="Select area"
                          styles={customStyles}
                          isSearchable
                          isDisabled={!values.location.localGovernment}
                        />
                        <ErrorMessage
                          name="location.area"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Land Size */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-[#09391C] mb-6">
                      Land Size
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#09391C] mb-2">
                          Size *
                        </label>
                        <Field
                          name="landSize.size"
                          type="number"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                          placeholder="Enter size"
                        />
                        <ErrorMessage
                          name="landSize.size"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#09391C] mb-2">
                          Measurement Type *
                        </label>
                        <Field
                          as="select"
                          name="landSize.measurementType"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                        >
                          {measurementTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage
                          name="landSize.measurementType"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Property Details (for non-Land properties) */}
                  {values.propertyCategory !== "Land" && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-[#09391C] mb-6">
                        Property Details
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-[#09391C] mb-2">
                            Type of Building *
                          </label>
                          <ReactSelect
                            options={
                              values.propertyCategory === "Residential"
                                ? propertyReferenceData[0].options.map(
                                    (option) => ({
                                      value: option,
                                      label: option,
                                    }),
                                  )
                                : values.propertyCategory === "Commercial"
                                  ? propertyReferenceData[1].options.map(
                                      (option) => ({
                                        value: option,
                                        label: option,
                                      }),
                                    )
                                  : []
                            }
                            value={
                              values.typeOfBuilding
                                ? {
                                    value: values.typeOfBuilding,
                                    label: values.typeOfBuilding,
                                  }
                                : null
                            }
                            onChange={(option) =>
                              setFieldValue(
                                "typeOfBuilding",
                                option?.value || "",
                              )
                            }
                            placeholder="Select building type"
                            styles={customStyles}
                          />
                          <ErrorMessage
                            name="typeOfBuilding"
                            component="div"
                            className="text-red-500 text-sm mt-1"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#09391C] mb-2">
                            Number of Bedrooms
                          </label>
                          <Field
                            name="additionalFeatures.noOfBedroom"
                            type="number"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#09391C] mb-2">
                            Bathrooms
                          </label>
                          <Field
                            name="additionalFeatures.noOfBathroom"
                            type="number"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                            placeholder="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#09391C] mb-2">
                            Toilets
                          </label>
                          <Field
                            name="additionalFeatures.noOfToilet"
                            type="number"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                            placeholder="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#09391C] mb-2">
                            Parking Spaces
                          </label>
                          <Field
                            name="additionalFeatures.noOfCarPark"
                            type="number"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Features & Conditions */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-[#09391C] mb-6">
                      Features & Conditions
                    </h3>

                    {/* Documents (for sell and jv) */}
                    {brief.briefType !== "rent" && (
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-[#09391C] mb-4">
                          Documents on Property
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {DocOnPropertyData.map((document, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() =>
                                toggleArrayItem(
                                  document,
                                  selectedDocuments,
                                  setSelectedDocuments,
                                )
                              }
                              className={`p-3 rounded-md border text-left transition-all text-sm ${
                                selectedDocuments.includes(document)
                                  ? "border-[#8DDB90] bg-[#E4EFE7] text-[#09391C] font-medium"
                                  : "border-[#C7CAD0] hover:border-[#8DDB90] text-[#5A5D63] hover:bg-gray-50"
                              }`}
                            >
                              {document}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Property Features */}
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-[#09391C] mb-4">
                        Property Features
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {featuresData.map((feature, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() =>
                              toggleArrayItem(
                                feature,
                                selectedFeatures,
                                setSelectedFeatures,
                              )
                            }
                            className={`p-3 rounded-md border text-left transition-all text-sm ${
                              selectedFeatures.includes(feature)
                                ? "border-[#8DDB90] bg-[#E4EFE7] text-[#09391C] font-medium"
                                : "border-[#C7CAD0] hover:border-[#8DDB90] text-[#5A5D63] hover:bg-gray-50"
                            }`}
                          >
                            {feature}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tenant Criteria (for rent) */}
                    {brief.briefType === "rent" && (
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-[#09391C] mb-4">
                          Tenant Criteria
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {tenantCriteriaData.map((criteria, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() =>
                                toggleArrayItem(
                                  criteria,
                                  selectedTenantCriteria,
                                  setSelectedTenantCriteria,
                                )
                              }
                              className={`p-4 rounded-lg border-2 text-left transition-all ${
                                selectedTenantCriteria.includes(criteria)
                                  ? "border-blue-500 bg-blue-50 text-blue-900"
                                  : "border-gray-200 hover:border-blue-500 text-gray-700"
                              }`}
                            >
                              {criteria}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Joint Venture Conditions */}
                    {brief.briefType === "jv" && (
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-[#09391C] mb-4">
                          Joint Venture Terms
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {JvConditionData.map((condition, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() =>
                                toggleArrayItem(
                                  condition,
                                  selectedJvConditions,
                                  setSelectedJvConditions,
                                )
                              }
                              className={`p-4 rounded-lg border-2 text-left transition-all ${
                                selectedJvConditions.includes(condition)
                                  ? "border-purple-500 bg-purple-50 text-purple-900"
                                  : "border-gray-200 hover:border-purple-500 text-gray-700"
                              }`}
                            >
                              {condition}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Property Tenancy Status */}
                    <div>
                      <h4 className="text-lg font-semibold text-[#09391C] mb-4">
                        Tenancy Status
                      </h4>
                      <div className="flex flex-wrap gap-6">
                        <label className="flex items-center">
                          <Field
                            type="radio"
                            name="isTenanted"
                            value="Yes"
                            className="mr-2"
                          />
                          Yes - Currently Tenanted
                        </label>
                        <label className="flex items-center">
                          <Field
                            type="radio"
                            name="isTenanted"
                            value="No"
                            className="mr-2"
                          />
                          No - Vacant
                        </label>
                        <label className="flex items-center">
                          <Field
                            type="radio"
                            name="isTenanted"
                            value="I live in it"
                            className="mr-2"
                          />
                          I live in it
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-[#09391C] mb-6">
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-[#09391C] mb-2">
                          First Name *
                        </label>
                        <Field
                          name="contactInfo.firstName"
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                          placeholder="Enter first name"
                        />
                        <ErrorMessage
                          name="contactInfo.firstName"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#09391C] mb-2">
                          Last Name *
                        </label>
                        <Field
                          name="contactInfo.lastName"
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                          placeholder="Enter last name"
                        />
                        <ErrorMessage
                          name="contactInfo.lastName"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#09391C] mb-2">
                          Email *
                        </label>
                        <Field
                          name="contactInfo.email"
                          type="email"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                          placeholder="Enter email address"
                        />
                        <ErrorMessage
                          name="contactInfo.email"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#09391C] mb-2">
                          Phone Number *
                        </label>
                        <PhoneInput
                          international
                          countryCallingCodeEditable={false}
                          defaultCountry="NG"
                          value={values.contactInfo.phone}
                          onChange={(value) =>
                            setFieldValue("contactInfo.phone", value || "")
                          }
                          className="phone-input"
                        />
                        <ErrorMessage
                          name="contactInfo.phone"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ownership Declaration */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-[#09391C] mb-6">
                      Ownership Declaration
                    </h3>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-[#09391C] mb-3">
                        Legal Ownership
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <Field
                            type="radio"
                            name="isLegalOwner"
                            value={true}
                            className="mr-2"
                          />
                          I am the legal owner of this property
                        </label>
                        <label className="flex items-center">
                          <Field
                            type="radio"
                            name="isLegalOwner"
                            value={false}
                            className="mr-2"
                          />
                          I am authorized by the legal owner to list this
                          property
                        </label>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-[#09391C] mb-4">
                        Available Ownership Documents
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {DocOnPropertyData.map((doc, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() =>
                              toggleArrayItem(
                                doc,
                                selectedOwnershipDocs,
                                setSelectedOwnershipDocs,
                              )
                            }
                            className={`p-4 rounded-lg border-2 text-left transition-all ${
                              selectedOwnershipDocs.includes(doc)
                                ? "border-[#8DDB90] bg-[#8DDB90] bg-opacity-10 text-[#09391C]"
                                : "border-gray-200 hover:border-[#8DDB90] text-gray-700"
                            }`}
                          >
                            {doc}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center cursor-pointer">
                        <Field
                          type="checkbox"
                          name="areYouTheOwner"
                          className="mr-2 h-4 w-4 text-[#8DDB90] border-gray-300 rounded focus:ring-[#8DDB90]"
                        />
                        <span className="text-sm text-[#5A5D63]">
                          I confirm that I am the legal owner or authorized
                          representative of this property
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-[#09391C] mb-6">
                      Additional Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#09391C] mb-2">
                          Property Description
                        </label>
                        <Field
                          as="textarea"
                          name="description"
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent resize-none"
                          placeholder="Describe your property in detail..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#09391C] mb-2">
                          Additional Information
                        </label>
                        <Field
                          as="textarea"
                          name="additionalInfo"
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent resize-none"
                          placeholder="Any other relevant information..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 sticky bottom-0 bg-white">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-[#8DDB90] text-white rounded-lg hover:bg-[#7BC87F] transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader size={16} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EnhancedEditBriefModal;
