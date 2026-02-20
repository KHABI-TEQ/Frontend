/** @format */

import React, { FC } from 'react';
import ReactSelect from 'react-select';

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
}

const Select: FC<SelectProps> = ({
  className,
  id,
  name,
  options,
  value,
  onChange,
}) => {
  // Convert string array to ReactSelect option format
  const formattedOptions = options.map((option) => ({
    value: option,
    label: option,
  }));

  // Find the selected option
  const selectedOption =
    formattedOptions.find((opt) => opt.value === value) || null;
  return (
    <label
      htmlFor={id ?? name}
      className={`min-h-[80px] ${className} flex flex-col gap-[4px]`}>
      <span className='text-base leading-[25.6px] font-medium text-[#1E1E1E]'>
        {name}
      </span>
      {/* <input
        type={type}
        placeholder={placeholder ?? 'This is placeholder'}
        className='w-full outline-none min-h-[50px] border-[1px] py-[12px] px-[16px] bg-[#FAFAFA] border-[#D6DDEB] placeholder:text-[#A8ADB7] text-black text-base leading-[25.6px]'
      /> */}
      <ReactSelect
        options={formattedOptions}
        value={selectedOption}
        onChange={onChange}
        className='w-full outline-none min-h-[50px] border-[1px] py-[12px] px-[16px] bg-[#FAFAFA] border-[#D6DDEB] placeholder:text-[#A8ADB7] text-black text-base leading-[25.6px]'
        name=''
        id=''
      />
      {/* {options.map((item: string, idx: number) => (
          <option value={item} key={idx}>
            {item}
          </option>
        ))} */}
      {/* </ReactSelect> */}
    </label>
  );
};

export default Select;
