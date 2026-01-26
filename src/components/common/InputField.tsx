import React, { FC } from 'react';
import Image from 'next/image';
import { StaticImageData } from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FormikProps } from 'formik';

interface InputFieldProps<T extends Record<string, unknown> = Record<string, unknown>> {
  label: string;
  name: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  icon?: StaticImageData;
  formik: FormikProps<any>;
  showPasswordToggle?: boolean;
  isPasswordVisible?: boolean;
  togglePasswordVisibility?: () => void;
  className?: string;
}

const InputField: FC<InputFieldProps> = ({
  label,
  name,
  type = 'text', // Default to 'text'
  placeholder,
  icon,
  formik,
  showPasswordToggle = false,
  isPasswordVisible,
  togglePasswordVisibility,
  className,
}) => {
  const isPasswordType = type === 'password';
  const displayType = isPasswordType && isPasswordVisible ? 'text' : type;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={name} className="text-base font-medium text-[#1E1E1E]">
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          id={name}
          name={name}
          type={displayType}
          placeholder={placeholder || `Enter your ${label.toLowerCase()}`}
          value={formik.values[name]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`w-full min-h-[55px] px-4 py-3 bg-[#FAFAFA] border border-[#D6DDEB] rounded-md
            placeholder:text-[#A8ADB7] text-black text-base outline-none focus:border-[#8DDB90]
            ${formik.touched[name] && formik.errors[name] ? 'border-red-500' : ''}`}
        />

        {/* Conditional rendering for icons */}
        {isPasswordType && showPasswordToggle && togglePasswordVisibility && (
          <FontAwesomeIcon
            icon={isPasswordVisible ? faEye : faEyeSlash}
            className="absolute right-4 cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
            onClick={togglePasswordVisibility}
            title={isPasswordVisible ? "Hide password" : "Show password"}
          />
        )}
        {icon && !isPasswordType && ( // Only show if an icon is provided and it's not a password field
          <Image
            src={icon}
            alt={`${label} icon`}
            width={20}
            height={20}
            className="absolute right-4 w-5 h-5 text-gray-500"
          />
        )}
      </div>
      {/* Error message */}
      {formik.touched[name] && formik.errors[name] && (
        <p className="text-sm text-red-500">{formik.errors[name] as string}</p>
      )}
    </div>
  );
};

export default InputField;
