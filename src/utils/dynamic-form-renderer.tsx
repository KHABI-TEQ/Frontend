/** @format */

import React from "react";
import Input from "@/components/general-components/Input";
import RadioCheck from "@/components/general-components/radioCheck";
import {
  FormField,
  validateFieldValue,
} from "@/data/post-property-form-config";

interface DynamicFieldRendererProps {
  field: FormField;
  value: any;
  onChange: (fieldId: string, value: any) => void;
  error?: string;
  className?: string;
}

export const DynamicFieldRenderer: React.FC<DynamicFieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
  className = "",
}) => {
  const handleChange = (newValue: any) => {
    onChange(field.id, newValue);
  };

  const commonProps = {
    label: field.label,
    placeholder: field.placeholder,
    className: `w-full ${className}`,
  };

  switch (field.type) {
    case "text":
      return (
        <div>
          <Input
            {...commonProps}
            type="text"
            name={field.id}
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      );

    case "number":
      return (
        <div>
          <Input
            {...commonProps}
            type="number"
            name={field.id}
            value={value || ""}
            onChange={(e) => handleChange(parseInt(e.target.value) || 0)}
            minNumber={field.validation?.min}
            maxNumber={field.validation?.max}
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      );

    case "select":
      return (
        <div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-[#09391C] mb-2">
              {field.label}
            </label>
          </div>
          <select
            name={field.id}
            value={value || ""}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              handleChange(e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-[#8DDB90]"
          >
            <option value="">
              {field.placeholder || `Select ${field.label}`}
            </option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      );

    case "multiselect":
      return (
        <div>
          <label className="block text-sm font-medium text-[#09391C] mb-3">
            {field.label}
          </label>
          <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {field.options?.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <input
                  type="checkbox"
                  checked={(value || []).includes(option.value)}
                  onChange={(e) => {
                    const currentValues = value || [];
                    if (e.target.checked) {
                      handleChange([...currentValues, option.value]);
                    } else {
                      handleChange(
                        currentValues.filter((v: string) => v !== option.value),
                      );
                    }
                  }}
                  className="w-4 h-4 text-[#8DDB90] border-gray-300 rounded focus:ring-[#8DDB90]"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      );

    case "radio":
      return (
        <div>
          <label className="block text-sm font-medium text-[#09391C] mb-3">
            {field.label}
          </label>
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center">
                <RadioCheck
                  type="radio"
                  name={field.id}
                  value={option.value}
                  isChecked={value === option.value}
                  handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange(e.target.value)
                  }
                />
                <span className="ml-2 text-sm text-gray-700">
                  {option.label}
                </span>
              </div>
            ))}
          </div>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      );

    case "checkbox":
      return (
        <div>
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label
                key={option.value}
                className="flex items-start space-x-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={(value || []).includes(option.value)}
                  onChange={(e) => {
                    const currentValues = value || [];
                    if (e.target.checked) {
                      handleChange([...currentValues, option.value]);
                    } else {
                      handleChange(
                        currentValues.filter((v: string) => v !== option.value),
                      );
                    }
                  }}
                  className="w-4 h-4 text-[#8DDB90] border-gray-300 rounded focus:ring-[#8DDB90] mt-0.5"
                />
                <span className="text-sm text-gray-700 leading-5">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      );

    case "textarea":
      return (
        <div>
          <label className="block text-sm font-medium text-[#09391C] mb-2">
            {field.label}
          </label>
          <textarea
            name={field.id}
            value={value || ""}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              handleChange(e.target.value)
            }
            placeholder={field.placeholder}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-[#8DDB90] resize-vertical"
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      );

    default:
      return <div>Unsupported field type: {field.type}</div>;
  }
};

export const validateField = (field: FormField, value: any): string | null => {
  return validateFieldValue(field, value);
};
