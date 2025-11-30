/** @format */

"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader } from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { PUT_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

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
}

interface EditBriefModalProps {
  brief: Brief;
  onClose: () => void;
  onSave: () => void;
}

const validationSchema = Yup.object({
  price: Yup.number()
    .required("Price is required")
    .min(1, "Price must be greater than 0"),
  propertyCondition: Yup.string().required("Property condition is required"),
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
  additionalFeatures: Yup.object({
    noOfBedroom: Yup.string(),
    noOfBathroom: Yup.string(),
    noOfToilet: Yup.string(),
    noOfCarPark: Yup.string(),
  }),
});

const EditBriefModal: React.FC<EditBriefModalProps> = ({
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

  const availableFeatures = [
    "Air conditioner",
    "POP Ceilings",
    "Built-in cupboards",
    "Staff Room",
    "In-house Cinema",
    "Parking",
    "Gym house",
    "Children Playground",
    "Bath Tub",
    "Walk-in closet",
    "Outdoor Kitchen",
  ];

  const availableTenantCriteria = [
    "No smoking",
    "No pets",
    "Family only",
    "Working professionals",
    "Students welcome",
    "Short term lease",
    "Long term lease",
  ];

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

  const initialValues = {
    price: brief.price,
    propertyCondition: brief.propertyCondition,
    isAvailable: brief.isAvailable,
    location: {
      state: brief.location.state,
      localGovernment: brief.location.localGovernment,
      area: brief.location.area,
    },
    landSize: {
      size: brief.landSize.size,
      measurementType: brief.landSize.measurementType,
    },
    additionalFeatures: {
      noOfBedroom: brief.additionalFeatures?.noOfBedroom || "",
      noOfBathroom: brief.additionalFeatures?.noOfBathroom || "",
      noOfToilet: brief.additionalFeatures?.noOfToilet || "",
      noOfCarPark: brief.additionalFeatures?.noOfCarPark || "",
    },
    areYouTheOwner: brief.areYouTheOwner,
  };

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        features: selectedFeatures,
        tenantCriteria: selectedTenantCriteria,
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

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature],
    );
  };

  const toggleTenantCriteria = (criteria: string) => {
    setSelectedTenantCriteria((prev) =>
      prev.includes(criteria)
        ? prev.filter((c) => c !== criteria)
        : [...prev, criteria],
    );
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
          className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-[#09391C]">Edit Brief</h2>
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
                <Form className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#09391C] mb-2">
                        Price (₦)
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

                    <div>
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
                      <ErrorMessage
                        name="propertyCondition"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <label className="block text-sm font-medium text-[#09391C] mb-2">
                      Availability
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

                  {/* Location */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#09391C] mb-4">
                      Location
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#09391C] mb-2">
                          State
                        </label>
                        <Field
                          name="location.state"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                          placeholder="Enter state"
                        />
                        <ErrorMessage
                          name="location.state"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#09391C] mb-2">
                          Local Government
                        </label>
                        <Field
                          name="location.localGovernment"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                          placeholder="Enter LGA"
                        />
                        <ErrorMessage
                          name="location.localGovernment"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#09391C] mb-2">
                          Area
                        </label>
                        <Field
                          name="location.area"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                          placeholder="Enter area"
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
                  <div>
                    <h3 className="text-lg font-semibold text-[#09391C] mb-4">
                      Land Size
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#09391C] mb-2">
                          Size
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
                          Measurement Type
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

                  {/* Additional Features */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#09391C] mb-4">
                      Room Details
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#09391C] mb-2">
                          Bedrooms
                        </label>
                        <Field
                          name="additionalFeatures.noOfBedroom"
                          type="number"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                          placeholder="0"
                        />
                      </div>

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

                  {/* Features */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#09391C] mb-4">
                      Property Features
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {availableFeatures.map((feature) => (
                        <label
                          key={feature}
                          className="flex items-center cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedFeatures.includes(feature)}
                            onChange={() => toggleFeature(feature)}
                            className="mr-2 h-4 w-4 text-[#8DDB90] border-gray-300 rounded focus:ring-[#8DDB90]"
                          />
                          <span className="text-sm text-[#5A5D63]">
                            {feature}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Tenant Criteria (for rent properties) */}
                  {brief.briefType === "Rent" && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#09391C] mb-4">
                        Tenant Criteria
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {availableTenantCriteria.map((criteria) => (
                          <label
                            key={criteria}
                            className="flex items-center cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedTenantCriteria.includes(
                                criteria,
                              )}
                              onChange={() => toggleTenantCriteria(criteria)}
                              className="mr-2 h-4 w-4 text-[#8DDB90] border-gray-300 rounded focus:ring-[#8DDB90]"
                            />
                            <span className="text-sm text-[#5A5D63]">
                              {criteria}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Owner Declaration */}
                  <div>
                    <label className="flex items-center cursor-pointer">
                      <Field
                        type="checkbox"
                        name="areYouTheOwner"
                        className="mr-2 h-4 w-4 text-[#8DDB90] border-gray-300 rounded focus:ring-[#8DDB90]"
                      />
                      <span className="text-sm text-[#5A5D63]">
                        I am the legal owner of this property
                      </span>
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
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

export default EditBriefModal;
