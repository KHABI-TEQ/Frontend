'use client';
import useClickOutside from '@/hooks/clickOutside';
import { FormikProps } from 'formik';
import React, { useEffect, useRef } from 'react';
import RadioCheck from '../general-components/radioCheck';
import { motion } from 'framer-motion';

type FormikType = {
  minPrice: number;
  maxPrice: number;
};

interface PriceComponentMenuListProps {
  formik: FormikProps<FormikType>;
  heading: string;
  closeModal: (type: boolean) => void;
  setSlectedRadioValue: (type: string) => void;
  selectedRadioValue: string; // ✅ New prop
}

const PriceRange: React.FC<PriceComponentMenuListProps> = ({
  heading,
  formik,
  closeModal,
  setSlectedRadioValue,
  selectedRadioValue,
}) => {
  const divRef = useRef<HTMLDivElement | null>(null);

  useClickOutside(divRef, () => closeModal(false));

  const priceRangeOptions = [
    '500k - 1million',
    '2million - 4million',
    '5million - 6million',
    '10million - above',
  ];

  const predefinedRanges: Record<string, { min: number; max: number }> = {
    '500k - 1million': { min: 500_000, max: 1_000_000 },
    '2million - 4million': { min: 2_000_000, max: 4_000_000 },
    '5million - 6million': { min: 5_000_000, max: 6_000_000 },
    '10million - above': { min: 10_000_000, max: 999_999_999 },
  };

  const formatNumberInput = (value: number): string => {
    return value === 0 ? '' : value.toLocaleString();
  };

  const parseInputValue = (value: string): number => {
    const parsed = parseInt(value.replace(/,/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleRadioSelection = (selectedRange: string) => {
    setSlectedRadioValue(selectedRange);

    const range = predefinedRanges[selectedRange];
    if (range) {
      formik.setFieldValue('minPrice', range.min);
      formik.setFieldValue('maxPrice', range.max);
    } else {
      formik.setFieldValue('minPrice', 0);
      formik.setFieldValue('maxPrice', 0);
    }
  };

  const handleManualInput = (field: 'minPrice' | 'maxPrice', value: string) => {
    const numericValue = parseInputValue(value);
    formik.setFieldValue(field, numericValue);

    // Clear radio selection if manual input is used
    if (numericValue > 0) {
      setSlectedRadioValue('');
    }
  };

  const validatePriceRange = (): boolean => {
    const { minPrice, maxPrice } = formik.values;
    return !(minPrice > 0 && maxPrice > 0 && minPrice >= maxPrice);
  };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      viewport={{ once: true }}
      ref={divRef}
      className='flex flex-col gap-[10px] justify-start items-start pb-10 absolute mt-[20px] bg-white border border-[#8D9096] h-[360px] shadow-md z-[999] rounded-md'
      style={{ padding: '19px', color: '#555', width: '400px' }}
    >
      <span className='text-[#000000] text-base font-medium'>{heading}</span>

      {/* Manual Inputs */}
      <div className='h-[47px] w-full flex gap-[20px] justify-between'>
        {/* Min */}
        <div className='w-[163px] h-full py-[16px] px-[12px] border border-[#D6DDEB] flex items-center justify-between gap-[10px]'>
          <span className='text-base text-[#000000]'>Min</span>
          <label htmlFor='min' className='flex-1'>
            <input
              type='text'
              className='w-full text-center h-full outline-none text-sm'
              value={formatNumberInput(formik.values.minPrice)}
              onChange={(e) => handleManualInput('minPrice', e.target.value)}
              onBlur={() => {
                if (!validatePriceRange()) {
                  console.warn('Invalid min price');
                }
              }}
              placeholder='0'
              name='minPrice'
              id='min'
              title='Minimum price'
            />
          </label>
          <span className='text-base text-[#000000]'>₦</span>
        </div>

        {/* Max */}
        <div className='w-[163px] h-full py-[16px] px-[12px] border border-[#D6DDEB] flex items-center justify-between gap-[10px]'>
          <span className='text-base text-[#000000]'>Max</span>
          <label htmlFor='max' className='flex-1'>
            <input
              type='text'
              className='w-full text-center h-full outline-none text-sm'
              value={formatNumberInput(formik.values.maxPrice)}
              onChange={(e) => handleManualInput('maxPrice', e.target.value)}
              onBlur={() => {
                if (!validatePriceRange()) {
                  console.warn('Invalid max price');
                }
              }}
              placeholder='0'
              name='maxPrice'
              id='max'
              title='Maximum price'
            />
          </label>
          <span className='text-base text-[#000000]'>₦</span>
        </div>
      </div>

      {/* Error Message */}
      {!validatePriceRange() && (
        <div className='text-red-500 py-1 text-xs'>
          Min price should be less than max price
        </div>
      )}

      <div className='w-full h-[1px] bg-[#E5E7EB] my-1'></div>
      <span className='text-[#666666] text-sm'>Or select a range:</span>

      {/* Radio Buttons */}
      <div className='flex flex-col gap-[10px] mt-1 w-full'>
        {priceRangeOptions.map((item, idx) => (
          <RadioCheck
            key={idx}
            type='radio'
            isChecked={selectedRadioValue === item}
            handleChange={() => handleRadioSelection(item)}
            value={item}
            name='priceRanges'
          />
        ))}
      </div>

      {/* Buttons */}
      <div className='flex gap-[10px] mt-1 w-full justify-end'>
        <button
          type='button'
          onClick={() => {
            formik.setFieldValue('minPrice', 0);
            formik.setFieldValue('maxPrice', 0);
            setSlectedRadioValue('');
          }}
          className='px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50'
        >
          Clear
        </button>
        <button
          type='button'
          onClick={() => {
            if (validatePriceRange()) {
              closeModal(false);
            }
          }}
          className='px-4 py-2 text-sm bg-[#8DDB90] text-white rounded hover:bg-[#7CC87F]'
        >
          Apply
        </button>
      </div>
    </motion.div>
  );
};

export default PriceRange;
