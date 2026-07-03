import React from "react";
import type { AddressBreakdown } from "@/utils/address";

type AddressBreakdownFieldsProps = {
  value: AddressBreakdown;
  onChange: (value: AddressBreakdown) => void;
  labelClass: string;
  inputClass: string;
  required?: boolean;
};

export function AddressBreakdownFields({
  value,
  onChange,
  labelClass,
  inputClass,
  required = false,
}: AddressBreakdownFieldsProps) {
  const update = (field: keyof AddressBreakdown, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-bold text-gray-900">
        Property address{required ? " *" : " (optional)"}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>House number (optional)</label>
          <input
            type="text"
            value={value.houseNumber}
            onChange={(e) => update("houseNumber", e.target.value)}
            className={inputClass}
            placeholder="e.g. 12A"
          />
        </div>
        <div>
          <label className={labelClass}>Street{required ? " *" : ""}</label>
          <input
            type="text"
            value={value.street}
            onChange={(e) => update("street", e.target.value)}
            className={inputClass}
            placeholder="e.g. Victoria Island Road"
            required={required}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>City{required ? " *" : ""}</label>
          <input
            type="text"
            value={value.city}
            onChange={(e) => update("city", e.target.value)}
            className={inputClass}
            placeholder="e.g. Ikeja"
            required={required}
          />
        </div>
        <div>
          <label className={labelClass}>State{required ? " *" : ""}</label>
          <input
            type="text"
            value={value.state}
            onChange={(e) => update("state", e.target.value)}
            className={inputClass}
            placeholder="e.g. Lagos State"
            required={required}
          />
        </div>
      </div>
      <div className="sm:max-w-xs">
        <label className={labelClass}>Postal code (optional)</label>
        <input
          type="text"
          value={value.postalCode}
          onChange={(e) => update("postalCode", e.target.value)}
          className={inputClass}
          placeholder="e.g. 100001"
        />
      </div>
    </div>
  );
}
