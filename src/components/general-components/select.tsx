/** @format */

"use client";

import customStyles from '@/styles/inputStyle';
import dynamic from 'next/dynamic';
import React, { FC, Suspense } from 'react';

const ReactSelect = dynamic(() => import('react-select'), { ssr: false });

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  name: string;
  className?: string;
  id?: string;
  options: string[];
  value?: string;
  onChange?: (selectedOption: SelectOption | null) => void;
  placeholder?: string;
  disable?: boolean;
}

const SelectFallback = ({ className }: { className?: string }) => (
  <div className={`w-full outline-none min-h-[50px] border-[1px] py-[12px] px-[16px] bg-[#FAFAFA] border-[#D6DDEB] text-black text-base leading-[25.6px] rounded ${className}`} />
);

const Select: FC<SelectProps> = ({
  className,
  id,
  name,
  options,
  value,
  onChange,
  placeholder,
  disable,
}) => {
  const formattedOptions = options.map((option) => ({
    value: option,
    label: option,
  }));

  const selectedOption =
    formattedOptions.find((opt) => opt.value === value) || null;

  return (
    <label
      htmlFor={id ?? name}
      className={`min-h-[80px] ${className} flex flex-col gap-[4px]`}>
      <span className='text-base leading-[25.6px] font-medium text-[#1E1E1E]'>
        {name}
      </span>
      <Suspense fallback={<SelectFallback className={className} />}>
        <ReactSelect
          isDisabled={disable}
          options={formattedOptions}
          value={selectedOption}
          onChange={(value) => onChange?.(value as any)}
          styles={customStyles}
          className='w-full outline-none min-h-[50px] border-[1px] py-[12px] px-[16px] bg-[#FAFAFA] border-[#D6DDEB] placeholder:text-[#A8ADB7] text-black text-base leading-[25.6px]'
          name=''
          placeholder={placeholder}
          id=''
        />
      </Suspense>
    </label>
  );
};

export default Select;
