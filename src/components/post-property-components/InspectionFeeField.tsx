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
      label="Inspection fee (optional)"
      value={value > 0 ? formatPriceForDisplay(value) : ""}
      onChange={(raw: string) => {
        const cleaned = cleanNumericInput(raw);
        const n = cleaned === "" || cleaned == null ? 0 : listingInspectionFeeNaira(cleaned);
        setFieldTouched("inspectionFee", true);
        setFieldValue("inspectionFee", n);
        updatePropertyData("inspectionFee" as any, n);
      }}
      placeholder="Leave blank if none"
      prefix="₦"
      description="Optional. Buyer pays this after you accept the inspection request. If you set a fee, use ₦1,000–₦50,000. Leave blank if there is no inspection fee."
    />
  );
}
