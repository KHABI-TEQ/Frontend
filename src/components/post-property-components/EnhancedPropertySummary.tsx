/** @format */

"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { usePostPropertyContext } from "@/context/post-property-context";
import { getBriefTypeConfig } from "@/data/post-property-form-config";
import Button from "@/components/general-components/button";
import { kebabToTitleCase } from "@/utils/helpers";

const EnhancedPropertySummary: React.FC = () => {
  const {
    propertyData,
    images,
    getUserType,
    setShowCommissionModal,
    setShowPropertySummary,
  } = usePostPropertyContext();

  const briefConfig = getBriefTypeConfig(propertyData.propertyType);
  const userType = getUserType();

  const formatPrice = (price: string | number | undefined) => {
    if (!price) return "Not specified";

    const numericPrice =
      typeof price === "string"
        ? parseInt(price.replace(/,/g, ""))
        : price;

    return `₦${numericPrice.toLocaleString()}`;
  };

  const validImages = images.filter(
    (img) => img.file !== null || img.url || img.preview
  );

  const handleProceedToCommission = () => {
    // If plan has NO_COMMISSION_FEES, skip modal and submit directly via a global event
    try {
      const evtName = 'khabiteq:submit-property';
      const hasNoCommission = typeof window !== 'undefined' && (window as any).__khabiteq_no_commission__ === true;
      setShowPropertySummary(false);
      if (hasNoCommission) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event(evtName));
        }
        return;
      }
    } catch {}
    setShowCommissionModal(true);
  };

  const getSummaryData = () => {
    const summary = [];

    // Basic Information
    summary.push({
      title: "Basic Information",
      items: [
        {
          label: "Brief Type",
          value: briefConfig?.label || propertyData.propertyType,
        },
        { label: "Property Category", value: propertyData.propertyCategory },
        { label: "Price", value: formatPrice(propertyData.price) },
        {
          label: "Location",
          value: `${propertyData.area}, ${propertyData.lga?.label}, ${propertyData.state?.label}`,
        },
      ],
    });

    // Property Details
    if (propertyData.propertyCategory !== "Land") {
      summary.push({
        title: "Property Details",
        items: [
          { label: "Type of Building", value: kebabToTitleCase(propertyData.typeOfBuilding) },
          ...(propertyData.bedrooms > 0
            ? [{ label: "Bedrooms", value: propertyData.bedrooms.toString() }]
            : []),
          ...(propertyData.bathrooms > 0
            ? [{ label: "Bathrooms", value: propertyData.bathrooms.toString() }]
            : []),
          ...(propertyData.toilets > 0
            ? [{ label: "Toilets", value: propertyData.toilets.toString() }]
            : []),
          ...(propertyData.parkingSpaces > 0
            ? [
                {
                  label: "Parking Spaces",
                  value: propertyData.parkingSpaces.toString(),
                },
              ]
            : []),
        ],
      });
    }

    // Rental/Shortlet Specific
    if (
      propertyData.propertyType === "rent" ||
      propertyData.propertyType === "shortlet"
    ) {
      const rentalItems = [];
      if (propertyData.rentalType)
        rentalItems.push({
          label: "Rental Type",
          value: kebabToTitleCase(propertyData.rentalType),
        });
      if (propertyData.propertyCondition)
        rentalItems.push({
          label: "Property Condition",
          value: kebabToTitleCase(propertyData.propertyCondition),
        });
      if (propertyData.shortletDuration)
        rentalItems.push({
          label: "Shortlet Duration",
          value: kebabToTitleCase(propertyData.shortletDuration),
        });
      if (propertyData.leaseHold)
        rentalItems.push({
          label: "Lease Hold",
          value: kebabToTitleCase(propertyData.leaseHold),
        });

      if (rentalItems.length > 0) {
        summary.push({
          title:
            propertyData.propertyType === "shortlet"
              ? "Shortlet Details"
              : "Rental Details",
          items: rentalItems,
        });
      }
    }

    // Land Information (for sell/jv)
    if (
      (propertyData.propertyType === "sell" ||
        propertyData.propertyType === "jv") &&
      propertyData.landSize
    ) {
      summary.push({
        title: "Land Information",
        items: [
          {
            label: "Land Size",
            value: `${propertyData.landSize} ${kebabToTitleCase(propertyData.measurementType)}`,
          },
        ],
      });
    }

    // Features
    if (propertyData.features.length > 0) {
      summary.push({
        title: "Features",
        items: [
          {
            label: "Selected Features",
            value:  propertyData.features.map(kebabToTitleCase).join(", "),
          },
        ],
      });
    }

    // Documents (for sell/jv)
    if (
      (propertyData.propertyType === "sell" ||
        propertyData.propertyType === "jv") &&
      propertyData.documents.length > 0
    ) {
      summary.push({
        title: "Documents",
        items: [
          {
            label: "Available Documents",
            value: propertyData.documents.map(kebabToTitleCase).join(", "),
          },
        ],
      });
    }

    // JV Conditions
    if (
      propertyData.propertyType === "jv" &&
      propertyData.jvConditions.length > 0
    ) {
      summary.push({
        title: "Joint Venture Conditions",
        items: [
          {
            label: "JV Conditions",
            value: propertyData.jvConditions.join(", "),
          },
        ],
      });
    }

    // Tenant Criteria (for rent/shortlet)
    if (
      (propertyData.propertyType === "rent" ||
        propertyData.propertyType === "shortlet") &&
      propertyData.tenantCriteria.length > 0
    ) {
      summary.push({
        title: "Tenant Criteria",
        items: [
          { label: "Criteria", value: propertyData.tenantCriteria.join(", ") },
        ],
      });
    }

    // Additional Information
    if (propertyData.additionalInfo || propertyData.isTenanted) {
      const additionalItems = [];
      if (propertyData.isTenanted)
        additionalItems.push({
          label: "Tenancy Status",
          value: kebabToTitleCase(propertyData.isTenanted),
        });
      if (propertyData.additionalInfo)
        additionalItems.push({
          label: "Additional Information",
          value: propertyData.additionalInfo,
        });

      summary.push({
        title: "Additional Information",
        items: additionalItems,
      });
    }


    return summary;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#09391C] font-display mb-4">
          Property Summary
        </h2>
        <p className="text-[#5A5D63] text-lg">
          Please review your property listing details before submission
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Property Details */}
        <div className="lg:col-span-2 space-y-6">
          {getSummaryData().map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-[#E5E7EB] rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-[#09391C] mb-4 border-b border-[#E5E7EB] pb-2">
                {section.title}
              </h3>
              <div className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4"
                  >
                    <span className="text-[#5A5D63] font-medium min-w-0 sm:min-w-[140px]">
                      {item.label}:
                    </span>
                    <span className="text-[#09391C] flex-1 break-words">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Images Preview */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-[#E5E7EB] rounded-lg p-6 sticky top-4"
          >
            <h3 className="text-lg font-semibold text-[#09391C] mb-4 border-b border-[#E5E7EB] pb-2">
              Property Images ({validImages.length})
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {validImages.slice(0, 4).map((image, index) => (
                <div
                  key={image.id}
                  className="relative aspect-square rounded-lg overflow-hidden"
                >
                  <Image
                    src={image.preview || ""}
                    alt={`Property image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
              {validImages.length > 4 && (
                <div className="col-span-2 text-center text-[#5A5D63] text-sm mt-2">
                  +{validImages.length - 4} more images
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="mt-6 pt-4 border-t border-[#E5E7EB]">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#5A5D63]">Images:</span>
                  <span className="text-[#09391C] font-medium">
                    {validImages.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A5D63]">User Type:</span>
                  <span className="text-[#09391C] font-medium capitalize">
                    {userType}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
      >
        <Button
          type="button"
          value="Edit Property"
          onClick={() => setShowPropertySummary(false)}
          className="px-8 py-3 border-2 border-[#8DDB90] text-[#8DDB90] hover:bg-[#8DDB90] hover:text-white transition-colors rounded-lg font-semibold"
        />
        <Button
          type="button"
          value="Continue to Post"
          onClick={handleProceedToCommission}
          className="px-8 py-3 bg-[#8DDB90] hover:bg-[#7BC87F] text-white transition-colors rounded-lg font-semibold"
        />
      </motion.div>
    </motion.div>
  );
};

export default EnhancedPropertySummary;
