/** @format */

"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  memo,
  useMemo,
  useRef,
} from "react";
import Select from "react-select";
import { usePreferenceForm } from "@/context/preference-form-context";

interface Option {
  value: string;
  label: string;
}

interface PropertyDetailsProps {
  preferenceType: "buy" | "rent" | "joint-venture" | "shortlet";
  className?: string;
}

// Property sub-types
const PROPERTY_SUBTYPES = [
  { value: "land", label: "Land" },
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
];

// Document types
const DOCUMENT_TYPES = [
  { value: "deed-of-assignment", label: "Deed of Assignment" },
  { value: "deed-of-ownership", label: "Deed of Ownership" },
  { value: "deed-of-conveyance", label: "Deed of Conveyance" },
  { value: "survey-plan", label: "Survey Plan" },
  { value: "governors-consent", label: "Governor's Consent" },
  { value: "certificate-of-occupancy", label: "Certificate of Occupancy" },
  { value: "family-receipt", label: "Family Receipt" },
  { value: "contract-of-sale", label: "Contract of Sale" },
  { value: "land-certificate", label: "Land Certificate" },
  { value: "gazette", label: "Gazette" },
  { value: "excision", label: "Excision" },
];

// Measurement units
const MEASUREMENT_UNITS = [
  { value: "plot", label: "Plot" },
  { value: "sqm", label: "SQM" },
  { value: "hectares", label: "Hectares" },
];

// Property conditions
const PROPERTY_CONDITIONS = {
  buy: {
    residential: [
      { value: "new", label: "New" },
      { value: "renovated", label: "Renovated" },
      { value: "old", label: "Old" },
    ],
    commercial: [
      { value: "new", label: "New" },
      { value: "renovated", label: "Renovated" },
      { value: "old", label: "Old" },
    ],
  },
  rent: {
    residential: [
      { value: "new", label: "New" },
      { value: "good-condition", label: "Good Condition" },
      { value: "renovation", label: "Renovation" },
    ],
    commercial: [
      { value: "new", label: "New" },
      { value: "good-condition", label: "Good Condition" },
      { value: "renovation", label: "Renovation" },
    ],
  },
  "joint-venture": {
    residential: [
      { value: "new", label: "New" },
      { value: "renovated", label: "Renovated" },
      { value: "uncompleted", label: "Uncompleted" },
    ],
    commercial: [
      { value: "new", label: "New" },
      { value: "renovated", label: "Renovated" },
      { value: "uncompleted", label: "Uncompleted" },
    ],
  },
};

// Building types
const BUILDING_TYPES = {
  buy: {
    residential: [
      { value: "bungalow", label: "Bungalow" },
      { value: "duplex-fully-detached", label: "Duplex (Fully Detached)" },
      { value: "duplex-semi-detached", label: "Duplex (Semi Detached)" },
      { value: "duplex-terrace", label: "Duplex (Terrace)" },
      { value: "blocks-of-flat", label: "Blocks of Flat" },
    ],
    commercial: [
      { value: "office-complex", label: "Office Complex" },
      { value: "warehouse", label: "Warehouse" },
      { value: "plaza", label: "Plaza" },
      { value: "shop", label: "Shop" },
    ],
  },
  rent: {
    residential: [
      { value: "detached", label: "Detached" },
      { value: "semi-detached", label: "Semi-detached" },
      { value: "bungalow", label: "Bungalow" },
      { value: "duplex", label: "Duplex" },
      { value: "blocks-of-flat", label: "Blocks of Flat" },
    ],
    commercial: [
      { value: "office-complex", label: "Office Complex" },
      { value: "plaza", label: "Plaza" },
      { value: "shop", label: "Shop" },
      { value: "warehouse", label: "Warehouse" },
    ],
  },
  "joint-venture": {
    residential: [
      { value: "block-of-flats", label: "Block of Flats" },
      { value: "duplex", label: "Duplex" },
      { value: "bungalow", label: "Bungalow" },
      { value: "terrace", label: "Terrace" },
    ],
    commercial: [
      { value: "plaza", label: "Plaza" },
      { value: "office-complex", label: "Office Complex" },
      { value: "warehouse", label: "Warehouse" },
      { value: "shop-space", label: "Shop Space" },
    ],
  },
};

// Land conditions (for Joint Venture)
const LAND_CONDITIONS = [
  { value: "fenced", label: "Fenced" },
  { value: "dry", label: "Dry" },
  { value: "gated", label: "Gated" },
  { value: "accessible-road", label: "Accessible Road" },
];

// Bedroom options
const BEDROOM_OPTIONS = [
  { value: "1", label: "1 Bedroom" },
  { value: "2", label: "2 Bedrooms" },
  { value: "3", label: "3 Bedrooms" },
  { value: "4", label: "4 Bedrooms" },
  { value: "5", label: "5 Bedrooms" },
  { value: "6", label: "6 Bedrooms" },
  { value: "7", label: "7 Bedrooms" },
  { value: "8", label: "8 Bedrooms" },
  { value: "9", label: "9 Bedrooms" },
  { value: "10", label: "10 Bedrooms" },
  { value: "more", label: "More than 10" },
];

// Bathroom options
const BATHROOM_OPTIONS = [
  { value: "1", label: "1 Bathroom" },
  { value: "2", label: "2 Bathrooms" },
  { value: "3", label: "3 Bathrooms" },
  { value: "4", label: "4 Bathrooms" },
  { value: "5", label: "5 Bathrooms" },
  { value: "6", label: "6 Bathrooms" },
  { value: "7", label: "7 Bathrooms" },
  { value: "8", label: "8 Bathrooms" },
  { value: "9", label: "9 Bathrooms" },
  { value: "10", label: "10 Bathrooms" },
  { value: "more", label: "More than 10" },
];

// Shortlet property types
const SHORTLET_PROPERTY_TYPES = [
  { value: "studio", label: "Studio" },
  { value: "apartment", label: "Apartment" },
  { value: "duplex", label: "Duplex" },
  { value: "bungalow", label: "Bungalow" },
];

// Travel types for shortlet
const TRAVEL_TYPES = [
  { value: "solo", label: "Solo" },
  { value: "couple", label: "Couple" },
  { value: "family", label: "Family" },
  { value: "group", label: "Group" },
  { value: "business", label: "Business" },
];

// Custom select styles
const customSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    minHeight: "48px",
    border: state.isFocused ? "2px solid #10B981" : "1px solid #E5E7EB",
    borderRadius: "8px",
    backgroundColor: "#FFFFFF",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#10B981",
    },
    transition: "all 0.2s ease",
  }),
  valueContainer: (provided: any) => ({
    ...provided,
    padding: "8px 12px",
    fontSize: "15px",
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: "#9CA3AF",
    fontSize: "15px",
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#10B981"
      : state.isFocused
        ? "#F3F4F6"
        : "white",
    color: state.isSelected ? "white" : "#374151",
    padding: "10px 12px",
    fontSize: "15px",
  }),
};

const PropertyDetails: React.FC<PropertyDetailsProps> = memo(
  ({ preferenceType, className = "" }) => {
    const { state, updateFormData } = usePreferenceForm();
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Memoized options to prevent recreation
    const propertySubtypeOptions = useMemo(() => PROPERTY_SUBTYPES, []);
    const measurementUnitOptions = useMemo(() => MEASUREMENT_UNITS, []);
    const documentTypeOptions = useMemo(() => DOCUMENT_TYPES, []);
    const landConditionOptions = useMemo(() => LAND_CONDITIONS, []);
    const bedroomOptions = useMemo(() => BEDROOM_OPTIONS, []);
    const bathroomOptions = useMemo(() => BATHROOM_OPTIONS, []);
    const shortletPropertyTypeOptions = useMemo(
      () => SHORTLET_PROPERTY_TYPES,
      [],
    );
    const travelTypeOptions = useMemo(() => TRAVEL_TYPES, []);

    // Form state
    const [propertySubtype, setPropertySubtype] = useState<Option | null>(null);
    const [landSize, setLandSize] = useState<string>("");
    const [measurementUnit, setMeasurementUnit] = useState<Option | null>(null);
    const [documentTypes, setDocumentTypes] = useState<string[]>([]);
    const [propertyCondition, setPropertyCondition] = useState<Option | null>(
      null,
    );
    const [buildingType, setBuildingType] = useState<Option | null>(null);
    const [bedrooms, setBedrooms] = useState<Option | null>(null);
    const [bathrooms, setBathrooms] = useState<Option | null>(null);
    const [landConditions, setLandConditions] = useState<Option[]>([]);

    // Shortlet specific fields
    const [propertyType, setPropertyType] = useState<Option | null>(null);
    const [maxGuests, setMaxGuests] = useState<string>("");
    const [travelType, setTravelType] = useState<Option | null>(null);
    const [nearbyLandmark, setNearbyLandmark] = useState<string>("");

    // Clear all fields when form is reset or preference type changes
    useEffect(() => {
      if (!state.formData || Object.keys(state.formData).length === 0) {
        setPropertySubtype(null);
        setLandSize("");
        setMeasurementUnit(null);
        setDocumentTypes([]);
        setPropertyCondition(null);
        setBuildingType(null);
        setBedrooms(null);
        setBathrooms(null);
        setLandConditions([]);
        setPropertyType(null);
        setMaxGuests("");
        setTravelType(null);
        setNearbyLandmark("");
      } else {
        // Initialize from existing form data
        const propertyDetails = state.formData.propertyDetails as any;
        if (propertyDetails) {
          if (preferenceType === "shortlet") {
            setPropertyType(propertyDetails.propertyType ? { value: propertyDetails.propertyType, label: propertyDetails.propertyType } : null);
            setBedrooms(propertyDetails.bedrooms ? { value: propertyDetails.bedrooms, label: `${propertyDetails.bedrooms} Bedroom${propertyDetails.bedrooms !== '1' ? 's' : ''}` } : null);
            setBathrooms(propertyDetails.bathrooms ? { value: propertyDetails.bathrooms, label: `${propertyDetails.bathrooms} Bathroom${propertyDetails.bathrooms !== '1' ? 's' : ''}` } : null);
            setMaxGuests(propertyDetails.maxGuests?.toString() || "");
            setTravelType(propertyDetails.travelType ? { value: propertyDetails.travelType, label: propertyDetails.travelType } : null);
            setNearbyLandmark(propertyDetails.nearbyLandmark || "");
          } else {
            setPropertySubtype(propertyDetails.propertySubtype ? { value: propertyDetails.propertySubtype, label: propertyDetails.propertySubtype } : null);
            setLandSize(propertyDetails.landSize || "");
            setMeasurementUnit(propertyDetails.measurementUnit ? { value: propertyDetails.measurementUnit, label: propertyDetails.measurementUnit } : null);
            setDocumentTypes(propertyDetails.documentTypes || []);
            setPropertyCondition(propertyDetails.propertyCondition ? { value: propertyDetails.propertyCondition, label: propertyDetails.propertyCondition } : null);
            setBuildingType(propertyDetails.buildingType ? { value: propertyDetails.buildingType, label: propertyDetails.buildingType } : null);
            setBedrooms(propertyDetails.bedrooms ? { value: propertyDetails.bedrooms, label: `${propertyDetails.bedrooms} Bedroom${propertyDetails.bedrooms !== '1' ? 's' : ''}` } : null);
            setBathrooms(propertyDetails.bathrooms ? { value: propertyDetails.bathrooms, label: `${propertyDetails.bathrooms} Bathroom${propertyDetails.bathrooms !== '1' ? 's' : ''}` } : null);
            setLandConditions(propertyDetails.landConditions ? propertyDetails.landConditions.map((lc: string) => ({ value: lc, label: lc })) : []);
          }
        }
      }
    }, [state.formData, state.currentStep, preferenceType]);

    // Update context when values change
    useEffect(() => {
      if (preferenceType === "shortlet") {
        const shortletData = {
          propertyType: propertyType?.value || "",
          bedrooms: bedrooms?.value || "",
          bathrooms: bathrooms?.value || "",
          maxGuests: parseInt(maxGuests) || 0,
          travelType: travelType?.value || "",
          nearbyLandmark,
        };
        updateFormData({ propertyDetails: shortletData } as any);
      } else {
        const propertyData = {
          propertySubtype: propertySubtype?.value || "",
          landSize,
          measurementUnit: measurementUnit?.value || "",
          documentTypes: documentTypes || [],
          propertyCondition: propertyCondition?.value || "",
          buildingType: buildingType?.value || "",
          bedrooms: bedrooms?.value || "",
          bathrooms: bathrooms?.value || "",
          landConditions: landConditions.map((lc) => lc.value) || [],
        };
        updateFormData({ propertyDetails: propertyData } as any);
      }
    }, [
      preferenceType,
      propertySubtype,
      landSize,
      measurementUnit,
      documentTypes,
      propertyCondition,
      buildingType,
      bedrooms,
      bathrooms,
      landConditions,
      propertyType,
      maxGuests,
      travelType,
      nearbyLandmark,
      updateFormData,
    ]);

    // Render shortlet specific fields
    if (preferenceType === "shortlet") {
      return (
        <div className={`space-y-6 ${className}`}>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Shortlet Property Details
            </h3>
            <p className="text-sm text-gray-600">
              Specify your stay requirements and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Property Type */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Property Type <span className="text-red-500">*</span>
              </label>
              <Select
                options={SHORTLET_PROPERTY_TYPES}
                value={propertyType}
                onChange={setPropertyType}
                placeholder="Select property type..."
                styles={customSelectStyles}
              />
            </div>

            {/* Travel Type */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Type of Travel <span className="text-red-500">*</span>
              </label>
              <Select
                options={TRAVEL_TYPES}
                value={travelType}
                onChange={setTravelType}
                placeholder="Select travel type..."
                styles={customSelectStyles}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bedrooms */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Bedrooms <span className="text-red-500">*</span>
              </label>
              <Select
                options={BEDROOM_OPTIONS}
                value={bedrooms}
                onChange={setBedrooms}
                placeholder="Select bedrooms..."
                styles={customSelectStyles}
              />
            </div>

            {/* Bathrooms */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Bathrooms <span className="text-red-500">*</span>
              </label>
              <Select
                options={BATHROOM_OPTIONS}
                value={bathrooms}
                onChange={setBathrooms}
                placeholder="Select bathrooms..."
                styles={customSelectStyles}
              />
            </div>

            {/* Maximum Guests */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Maximum Guests <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={maxGuests}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  // Allow empty string for deletion
                  if (inputValue === "") {
                    setMaxGuests("");
                    return;
                  }
                  // Parse and validate the number
                  const numValue = parseInt(inputValue);
                  if (!isNaN(numValue) && numValue >= 1) {
                    setMaxGuests(numValue.toString());
                  } else if (numValue < 1) {
                    // If less than 1, set to empty (user can type a valid number)
                    setMaxGuests("");
                  }
                }}
                onBlur={(e) => {
                  // On blur, if empty, set to default of 1
                  if (e.target.value === "" || parseInt(e.target.value) < 1) {
                    setMaxGuests("1");
                  }
                }}
                placeholder="Number of guests"
                min="1"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Nearby Landmark */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              Nearby Landmark <span className="text-gray-500">(Optional)</span>
            </label>
            <input
              type="text"
              value={nearbyLandmark}
              onChange={(e) => setNearbyLandmark(e.target.value)}
              placeholder="Enter nearby landmark"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
      );
    }
 
    // Render regular property details for Buy, Rent, Joint Venture
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Property Details
          </h3>
          <p className="text-sm text-gray-600">
            Specify your property requirements and preferences
          </p>
        </div>

        {/* Property Sub-type Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Property Type <span className="text-red-500">*</span>
          </label>
          <Select
            options={PROPERTY_SUBTYPES}
            value={propertySubtype}
            onChange={(selected) => {
              setPropertySubtype(selected);
              // Reset dependent fields when property type changes
              setBuildingType(null);
              setPropertyCondition(null);
              setDocumentTypes([]);
            }}
            placeholder="Select property type..."
            styles={customSelectStyles}
          />
        </div>

        {propertySubtype && (
          <>
            {/* Land Size and Measurement Unit (optional for rent, required for buy/joint-venture) */}
            {(preferenceType === "buy" || preferenceType === "joint-venture") && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Measurement Unit <span className="text-red-500">*</span>
                  </label>
                  <Select
                    options={MEASUREMENT_UNITS}
                    value={measurementUnit}
                    onChange={setMeasurementUnit}
                    placeholder="Select unit..."
                    styles={customSelectStyles}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Land Size <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={landSize}
                    onChange={(e) => {
                      const value = Math.max(0, parseFloat(e.target.value) || 0);
                      setLandSize(value.toString());
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLInputElement;
                      if (parseFloat(target.value) < 0) {
                        target.value = "0";
                      }
                    }}
                    placeholder="Enter land size"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            )}


            {/* Document Types */}
            {(preferenceType === "buy" ||
              preferenceType === "joint-venture") && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Document Types <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500">
                    Select all applicable document types you prefer
                  </p>
                </div>
                <Select
                  isMulti
                  options={DOCUMENT_TYPES}
                  value={DOCUMENT_TYPES.filter((doc) =>
                    documentTypes.includes(doc.value),
                  )}
                  onChange={(selected) => {
                    const selectedValues = selected
                      ? selected.map((option: any) => option.value)
                      : [];
                    setDocumentTypes(selectedValues);
                  }}
                  placeholder="Select document types..."
                  styles={customSelectStyles}
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  components={{
                    Option: ({
                      innerRef,
                      innerProps,
                      isSelected,
                      data,
                    }: any) => (
                      <div
                        ref={innerRef}
                        {...innerProps}
                        className={`flex items-center space-x-3 p-3 cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? "bg-emerald-50 text-emerald-800"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border-2 transition-all ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-500"
                              : "border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <svg
                              className="w-2.5 h-2.5 text-white absolute top-0.5 left-0.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-medium">
                          {data.label}
                        </span>
                      </div>
                    ),
                  }}
                />
              </div>
            )}

            {/* Property Condition (for residential and commercial) */}
            {propertySubtype.value !== "land" && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  Property Condition <span className="text-red-500">*</span>
                </label>
                <Select
                  options={
                    PROPERTY_CONDITIONS[preferenceType]?.[
                      propertySubtype.value as keyof (typeof PROPERTY_CONDITIONS)[typeof preferenceType]
                    ] || []
                  }
                  value={propertyCondition}
                  onChange={setPropertyCondition}
                  placeholder="Select condition..."
                  styles={customSelectStyles}
                />
              </div>
            )}

            {/* Building Type (for residential and commercial) */}
            {propertySubtype.value !== "land" && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  Building Type <span className="text-red-500">*</span>
                </label>
                <Select
                  options={
                    BUILDING_TYPES[preferenceType]?.[
                      propertySubtype.value as keyof (typeof BUILDING_TYPES)[typeof preferenceType]
                    ] || []
                  }
                  value={buildingType}
                  onChange={setBuildingType}
                  placeholder="Select building type..."
                  styles={customSelectStyles}
                />
              </div>
            )}

            {/* Bedrooms and Bathrooms (for residential) */}
            {propertySubtype.value === "residential" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Bedrooms <span className="text-red-500">*</span>
                  </label>
                  <Select
                    options={BEDROOM_OPTIONS}
                    value={bedrooms}
                    onChange={setBedrooms}
                    placeholder="Select bedrooms..."
                    styles={customSelectStyles}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Bathrooms <span className="text-red-500">*</span>
                  </label>
                  <Select
                    options={BATHROOM_OPTIONS}
                    value={bathrooms}
                    onChange={setBathrooms}
                    placeholder="Select bathrooms..."
                    styles={customSelectStyles}
                  />
                </div>
              </div>
            )}

            {/* Bathrooms only (for commercial) */}
            {propertySubtype.value === "commercial" && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  Bathrooms <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="number"
                  value={bathrooms}
                  onChange={(e) => {
                    const value = Math.max(0, parseInt(e.target.value) || 0);
                    setBathrooms(value.toString());
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (parseInt(target.value) < 0) {
                      target.value = "0";
                    }
                  }}
                  placeholder="Number of bathrooms"
                  min="0"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            )}

            {/* Land Conditions (for Joint Venture Land) */}
            {preferenceType === "joint-venture" &&
              propertySubtype.value === "land" && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Land Condition <span className="text-red-500">*</span>
                  </label>
                  <Select
                    isMulti
                    options={LAND_CONDITIONS}
                    value={landConditions}
                    onChange={(selected) =>
                      setLandConditions(selected as Option[])
                    }
                    placeholder="Select land conditions..."
                    styles={customSelectStyles}
                  />
                </div>
              )}
          </>
        )}
      </div>
    );
  },
);

PropertyDetails.displayName = "PropertyDetails";

export default PropertyDetails;
