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
  //FormikType: {}
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
      label.includes(input)
    );
    if (!filteredOptions) return;
    //setStateOptions(filteredOptions);
    // console.log(filteredOptions);
  };

  /**
   * External Hook
   */

  useClickOutside(inputRef, () => setShowLocationModal(true));

  //All use Effects
  /**
   * Load all states from json on load of the page
   */
  useEffect(() => {
    // Load Nigerian states correctly
    const sample = Object.keys(nigeriaStates);
    // console.log(sample);
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
      <div className='flex items-center w-full h-[50px] border-[1px] cursor-pointer border-[#D6DDEB] disabled:bg-gray-300 disabled:cursor-not-allowed'>
        <input
          className='w-[85%] outline-none h-full px-[12px] text-base placeholder:text-[#A8ADB7] text-black cursor-pointer'
          type='text'
          name={name}
          title={title}
          disabled={isDisabled}
          readOnly
          value={
            formik.values.selectedState || formik.values.selectedLGA
              ? `${formik.values.selectedState}${
                  formik.values.selectedLGA
                    ? `, ${formik.values.selectedLGA}`
                    : ''
                }`
              : '' // Show placeholder if both are empty
          }
          onFocus={() => {
            setShowLocationModal(true);
          }}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            event.preventDefault();
            setShowLocationModal(true);
            filterBasedOnText(event.target.value);
            // console.log(formik.values);
          }}
          placeholder={placeholder}
          id={id}
        />
        <div className='w-[15%] h-full flex items-center justify-center'>
          <FaSearch
            size={'sm'}
            width={16}
            height={16}
            className='w-[16px] h-[16px] '
          />
        </div>
      </div>
      {showLocationModal && (
        <SelectOption
          selectedStateHandler={'selectedState'}
          selectedLGAHandler={'selectedLGA'}
          formik={formik}
          heading={heading}
          stateOptions={stateOptions}
          closeModalFunction={setShowLocationModal}
        />
      )}
    </label>
  );
};

type SelectOptionProps = {
  closeModalFunction?: (type: boolean) => void;
  stateOptions?: Option[];
  heading?: string;
  formik: FormikProps<FormikType>;
  selectedStateHandler: string;
  selectedLGAHandler: string;
};

const SelectOption: FC<SelectOptionProps> = ({
  closeModalFunction,
  stateOptions,
  heading,
  formik,
  selectedLGAHandler,
  selectedStateHandler,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [dataOptions, setDataOptions] = useState<Option[] | undefined>(
    stateOptions
  );
  const [modifyHeading, setModifyHeading] = useState<string | undefined>(
    heading
  );
  const [selectStatus, setSelectStatus] = useState<'state' | 'lga'>('state');

  const handleInput = (option: Option) => {
    if (selectStatus === 'state') {
      formik.setFieldValue(selectedStateHandler, option.label);
      formik.setFieldValue(selectedLGAHandler, '');
      const lgas = Object.values(nigeriaStates[option.label]);

      if (Array.isArray(lgas)) {
        setDataOptions(
          lgas.map((lga: string) => ({
            value: lga,
            label: lga,
          }))
        );
        //setStatus to lga
        setSelectStatus('lga');
        setModifyHeading(`${option.label} state`);
      }
    } else if (selectStatus === 'lga') {
      formik.setFieldValue(selectedLGAHandler, option.label);
      setSelectStatus('state');
      setModifyHeading('Location');
      closeModalFunction?.(false);
    }
  };

  useClickOutside(ref, () => {
    closeModalFunction?.(false);
  });

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      viewport={{ once: true }}
      ref={ref}
      className='w-[241px] min-h-fit absolute z-30 mt-[100px] flex flex-col p-[19px] gap-[13px] shadow-md bg-[#FFFFFF]'>
      <div className='py-[2px] flex items-center'>
        <h2 className='text-sm font-medium text-[#000000] flex gap-3'>
          {modifyHeading !== 'Location' ? (
            <Image
              src={arrowIcon}
              width={20}
              height={20}
              className='w-[20px] h-[20px] transform rotate-90 cursor-pointer'
              alt='arrow icon'
              onClick={() => {
                setModifyHeading('Location');
                setSelectStatus('state');
                setDataOptions(stateOptions);
              }}
            />
          ) : null}
          <span>Filter by {modifyHeading}</span>
        </h2>
      </div>
      <div className='w-full h-[166px] overflow-y-auto flex flex-col gap-[5px] border-t-[1px] py-[15px] hide-scrollbar border-[#1E1E1E]'>
        {dataOptions?.length !== 0 &&
          dataOptions?.map((option: Option, idx: number) => (
            <div
              key={idx}
              title={option.label}
              onClick={() => {
                handleInput(option);
                // console.log(formik.values);
              }}
              className={`w-full flex items-center justify-between cursor-pointer hover:bg-[#8DDB90] py-[8px] px-[5px] rounded-[5px]`}>
              <span className='text-base font-normal text-[#000000]'>
                {option.label}
              </span>
              <Image
                src={arrowIcon}
                width={20}
                height={20}
                className='w-[20px] h-[20px] transform -rotate-90'
                alt='arrow icon'
              />
            </div>
          ))}
      </div>
    </motion.div>
  );
};
export default SelectStateLGA;
