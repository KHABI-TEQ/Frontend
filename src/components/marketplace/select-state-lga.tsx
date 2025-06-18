/** @format */

'use client';
import React, { FC, useEffect, useRef, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { Option } from './types/option';
import nigeriaStates from '@/data/state-lga';
import { FormikProps } from 'formik';
import useClickOutside from '@/hooks/clickOutside';
import Image from 'next/image';
import arrowIcon from '@/svgs/arrowDown.svg';
import { motion } from 'framer-motion';

type SelectStateLGAProps = {
  id?: string;
  name?: string;
  title?: string;
  placeholder?: string;
  isDisabled?: boolean;
  heading?: string;
  formik: FormikProps<FormikType>;
};

interface FormikType {
  selectedLGA: string;
  selectedState: string;
}

const SelectStateLGA: FC<SelectStateLGAProps> = ({
  formik,
  placeholder,
  id,
  name,
  title,
  isDisabled,
  heading,
}) => {
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [stateOptions, setStateOptions] = useState<Option[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const filterBasedOnText = (input: string) => {
    const filteredOptions = stateOptions.filter(({ label }) =>
      label.toLowerCase().includes(input.toLowerCase())
    );
    if (!filteredOptions) return;
  };

  useClickOutside(inputRef, () => setShowLocationModal(false));

  useEffect(() => {
    const sample = Object.keys(nigeriaStates);
    setStateOptions(
      Object.keys(nigeriaStates).map((state: string) => ({
        value: state,
        label: state,
      }))
    );
  }, []);

  return (
    <label htmlFor='' className='flex flex-col w-full'>
      {heading && <h2 className='text-base text-[#1E1E1E] font-medium'>{heading}</h2>}
      <div className='flex items-center w-full h-[50px] border-[1px] border-[#D6DDEB] disabled:bg-gray-300 disabled:cursor-not-allowed'>
        <input
          className='w-[85%] outline-none h-full px-[12px] text-base placeholder:text-[#A8ADB7] text-black'
          type='text'
          name={name}
          title={title}
          disabled={isDisabled}
          value={formik.values.selectedState || formik.values.selectedLGA
            ? `${formik.values.selectedState}${
                formik.values.selectedLGA
                  ? `, ${formik.values.selectedLGA}`
                  : ''
              }`
            : ''}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            const parts = value.split(',').map(part => part.trim());
            
            if (parts.length >= 1) {
              formik.setFieldValue('selectedState', parts[0]);
            }
            if (parts.length >= 2) {
              formik.setFieldValue('selectedLGA', parts[1]);
            }
            
            filterBasedOnText(value);
          }}
          placeholder={placeholder}
          id={id}
          ref={inputRef}
        />
        <div className='w-[15%] h-full flex items-center justify-center'>
          <FaSearch
            size={'sm'}
            width={16}
            height={16}
            className='w-[16px] h-[16px]'
          />
        </div>
      </div>
    </label>
  );
};

export default SelectStateLGA;
