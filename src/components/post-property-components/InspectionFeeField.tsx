"use client";

import EnhancedPriceInput from "@/components/general-components/EnhancedPriceInput";
import { usePostPropertyContext } from "@/context/post-property-context";
import { useFormikContext } from "formik";
import {
  cleanNumericInput,
  formatPriceForDisplay,
} from "@/utils/price-helpers";
import { listingInspectionFeeNaira } from "@/utils/scoutListingAuth";
import { PropertyFormData } from "@/types/post-property.types";

export default function InspectionFeeField() {
  const { propertyData, updatePropertyData } = usePostPropertyContext();
  const { setFieldValue, setFieldTouched } = useFormikContext<PropertyFormData>();
  const value = listingInspectionFeeNaira(
    (propertyData as { inspectionFee?: number }).inspectionFee,
  );

  return (
    <EnhancedPriceInput
      name="inspectionFee"
      label="Inspection fee"
      value={formatPriceForDisplay(value)}
      onChange={(raw: string) => {
        const n = listingInspectionFeeNaira(cleanNumericInput(raw));
        setFieldTouched("inspectionFee", true);
        setFieldValue("inspectionFee", n);
        updatePropertyData("inspectionFee" as any, n);
      }}
      placeholder="5000"
      prefix="₦"
      description="Buyer pays this fee after you accept the inspection request. Allowed range ₦1,000–₦50,000. Default ₦5,000."
    />
  );
}
