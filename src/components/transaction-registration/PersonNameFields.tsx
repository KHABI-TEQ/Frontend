import React from "react";

type PersonNameFieldsProps = {
  firstName: string;
  lastName: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  labelPrefix: string;
  required?: boolean;
  labelClass: string;
  inputClass: string;
};

export function PersonNameFields({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
  labelPrefix,
  required = false,
  labelClass,
  inputClass,
}: PersonNameFieldsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className={labelClass}>
          {labelPrefix} first name{required ? " *" : ""}
        </label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => onFirstNameChange(e.target.value)}
          className={inputClass}
          required={required}
          autoComplete="given-name"
        />
      </div>
      <div>
        <label className={labelClass}>
          {labelPrefix} last name{required ? " *" : ""}
        </label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => onLastNameChange(e.target.value)}
          className={inputClass}
          required={required}
          autoComplete="family-name"
        />
      </div>
    </div>
  );
}
