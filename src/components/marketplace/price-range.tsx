/** @format */
'use client';
import useClickOutside from '@/hooks/clickOutside';
import { FormikProps } from 'formik';
import React, { useEffect, useRef, useState } from 'react';
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
}

const PriceRange: React.FC<PriceComponentMenuListProps> = ({
  heading,
  formik,
  closeModal,
  setSlectedRadioValue,
}) => {
  const divRef = useRef<HTMLDivElement | null>(null);
  const [radioValue, setRadioValue] = useState<string>('');

  useClickOutside(divRef, () => closeModal(false));

  // Predefined price range options
  const priceRangeOptions = [
    '500k - 1million',
    '2million - 4million',
    '5million - 6million',
    '10million - above'
  ];

  // Function to format number input display
  const formatNumberInput = (value: number): string => {
    if (value === 0) return '';
    return value.toLocaleString();
  };

  // Function to parse input value (remove commas)
  const parseInputValue = (value: string): number => {
    const parsed = parseInt(value.replace(/,/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  };

  // Function to handle radio button selection
  const handleRadioSelection = (selectedRange: string) => {
    setRadioValue(selectedRange);
    // Clear manual input when radio is selected
    formik.setFieldValue('minPrice', 0);
    formik.setFieldValue('maxPrice', 0);
  };

  // Function to handle manual input changes
  const handleManualInput = (field: 'minPrice' | 'maxPrice', value: string) => {
    const numericValue = parseInputValue(value);
    formik.setFieldValue(field, numericValue);
    // Clear radio selection when manual input is used
    if (numericValue > 0) {
      setRadioValue('');
    }
  };

  // Function to validate price range
  const validatePriceRange = (): boolean => {
    const minPrice = formik.values.minPrice;
    const maxPrice = formik.values.maxPrice;
    
    if (minPrice > 0 && maxPrice > 0 && minPrice >= maxPrice) {
      return false; // Invalid range
    }
    return true;
  };

  useEffect(() => {
    console.log('Price formik values:', formik.values);
    console.log('Selected radio value:', radioValue);
    
    // Validate price range
    if (!validatePriceRange()) {
      console.warn('Invalid price range: Min price should be less than max price');
    }
  }, [formik.values, radioValue]);

  useEffect(() => {
    setSlectedRadioValue(radioValue);
  }, [radioValue, setSlectedRadioValue]);

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      viewport={{ once: true }}
      ref={divRef}
      className='flex flex-col gap-[10px] justify-start items-start border-[#8D9096] border-b-[1px] absolute mt-[100px] bg-white border-[1px] h-[350px] shadow-md z-50'
      style={{ padding: '19px', color: '#555', width: '400px' }}>
      
      <span className='text-[#000000] text-base font-medium'>{heading}</span>

      {/* Manual Price Input Section */}
      <div className='h-[47px] w-full flex gap-[20px] justify-between'>
        {/* Min price */}
        <div className='w-[163px] h-full py-[16px] px-[12px] border-[1px] border-[#D6DDEB] flex items-center justify-between gap-[10px]'>
          <span className='text-base text-[#000000]'>Min</span>
          <label htmlFor='min' className='flex-1'>
            <input
              type='text'
              className='w-full text-center h-full outline-none text-sm'
              value={formatNumberInput(formik.values.minPrice)}
              onChange={(event) => {
                handleManualInput('minPrice', event.target.value);
              }}
              onBlur={() => {
                // Validate on blur
                if (!validatePriceRange()) {
                  console.warn('Min price should be less than max price');
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

        {/* Max price */}
        <div className='w-[163px] h-full py-[16px] px-[12px] border-[1px] border-[#D6DDEB] flex items-center justify-between gap-[10px]'>
          <span className='text-base text-[#000000]'>Max</span>
          <label htmlFor='max' className='flex-1'>
            <input
              type='text'
              className='w-full outline-none text-center h-full text-sm'
              value={formatNumberInput(formik.values.maxPrice)}
              onChange={(event) => {
                handleManualInput('maxPrice', event.target.value);
              }}
              onBlur={() => {
                // Validate on blur
                if (!validatePriceRange()) {
                  console.warn('Max price should be greater than min price');
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

      {/* Price Range Validation Message */}
      {!validatePriceRange() && (
        <div className='text-red-500 text-xs'>
          Min price should be less than max price
        </div>
      )}

      {/* Divider */}
      <div className='w-full h-[1px] bg-[#E5E7EB] my-2'></div>
      
      <span className='text-[#666666] text-sm'>Or select a range:</span>

      {/* Radio Button Options */}
      <div className='flex flex-col gap-[10px] mt-2 w-full'>
        {priceRangeOptions.map((item: string, idx: number) => (
          <RadioCheck
            key={idx}
            type='radio'
            isChecked={radioValue === item}
            onClick={() => handleRadioSelection(item)}
            value={item}
            name='priceRanges'
          />
        ))}
      </div>

      {/* Apply/Clear Buttons */}
      <div className='flex gap-[10px] mt-4 w-full justify-end'>
        <button
          type='button'
          onClick={() => {
            // Clear all selections
            setRadioValue('');
            formik.setFieldValue('minPrice', 0);
            formik.setFieldValue('maxPrice', 0);
            setSlectedRadioValue('');
          }}
          className='px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50'>
          Clear
        </button>
        <button
          type='button'
          onClick={() => {
            // Close modal and apply current selection
            if (validatePriceRange()) {
              closeModal(false);
            }
          }}
          className='px-4 py-2 text-sm bg-[#8DDB90] text-white rounded hover:bg-[#7CC87F]'>
          Apply
        </button>
      </div>
    </motion.div>
  );
};

export default PriceRange;