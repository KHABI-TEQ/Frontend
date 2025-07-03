'use client';

import React, { useState, useEffect } from 'react';
import { FormikProps } from 'formik';
import Input from '@/components/general-components/Input';
import ReactSelect from 'react-select';
import RadioCheck from '@/components/general-components/radioCheck';
import data from '@/data/state-lga';
import { propertyReferenceData } from '@/data/buy_page_data';
import customStyles from '@/styles/inputStyle';

interface Option {
  value: string;
  label: string;
}

interface Step1Props {
  formik: FormikProps<any>;
  selectedCard: 'sell' | 'rent' | 'jv';
  areInputsDisabled: boolean;
  formatNumber: (val: string) => string;
}

const Step1PropertyDetails: React.FC<Step1Props> = ({
  formik,
  selectedCard,
  areInputsDisabled,
  formatNumber,
}) => {
  const [selectedState, setSelectedState] = useState<Option | null>(null);
  const [selectedLGA, setSelectedLGA] = useState<Option | null>(null);
  const [stateOptions, setStateOptions] = useState<Option[]>([]);
  const [lgaOptions, setLgaOptions] = useState<Option[]>([]);
  const [formatedPrice, setFormatedPrice] = useState<string>('');
  const [formatedHold, setFormatedHold] = useState<string>('');
  const [formattedLandSizeNumber, setFormatedLandNumber] = useState<string>('');

  useEffect(() => {
    // Load Nigerian states
    setStateOptions(
      Object.keys(data).map((state: string) => ({
        value: state,
        label: state,
      }))
    );
  }, []);

  const handleLGAChange = (selected: Option | null) => {
    formik.setFieldValue('selectedLGA', selected?.value);
    setSelectedLGA(selected);
  };

  const handleStateChange = (selected: Option | null) => {
    formik.setFieldValue('selectedState', selected?.value);
    setSelectedState(selected);

    if (selected) {
      const lgas = Object.values(data[selected.label]);
      if (Array.isArray(lgas)) {
        setLgaOptions(
          lgas.map((lga: string) => ({
            value: lga,
            label: lga,
          }))
        );
      } else {
        setLgaOptions([]);
      }
      setSelectedLGA(null);
    } else {
      setLgaOptions([]);
      setSelectedLGA(null);
    }
  };

  const getFormTitle = () => {
    switch (selectedCard) {
      case 'sell':
        return 'Submit your property brief';
      case 'rent':
        return 'Provide your Rental Details';
      case 'jv':
        return 'Submit your property brief';
      default:
        return '';
    }
  };

  return (
    <div className='min-h-[629px] py-[10px] lg:px-[80px] border-[#8D909680] w-full'>
      <h2 className='text-[#0B0D0C] lg:text-[24px] lg:leading-[40.4px] font-bold font-display text-center text-[18px] leading-[40.4px] mt-7'>
        {getFormTitle()}
      </h2>
      <div className='w-full min-h-[629px] flex flex-col gap-[30px]'>
        <div className='min-h-[73px] gap-[15px] flex flex-col w-full'>
          <h2 className='text-[20px] leading-[32px] font-medium text-[#1E1E1E]'>
            Property Type
          </h2>
          <div className='w-full gap-[20px] lg:gap-[20px] flex flex-row flex-wrap'>
            {(selectedCard === 'jv'
              ? ['Residential', 'Commercial', 'Mixed Development']
              : ['Residential', 'Commercial', 'Land']
            ).map((type) => (
              <div
                key={type}
                className={`border-[#8D909680] border-[1px] rounded-[2px] w-full lg:w-[200px] h-[50px] flex items-center justify-center cursor-pointer
                  ${
                    formik.values.propertyType === type
                      ? 'bg-[#8DDB90] text-white font-bold border-[#8DDB90]'
                      : ' text-[#1E1E1E]'
                  }`}
                onClick={() => formik.setFieldValue('propertyType', type)}>
                {type}
              </div>
            ))}
          </div>
          {formik.touched.propertyType && formik.errors.propertyType && (
            <span className='text-red-600 text-sm'>
              {String(formik.errors.propertyType)}
            </span>
          )}
        </div>

        {selectedCard === 'rent' && formik.values.propertyType !== 'Land' && (
          <div className='min-h-[73px] gap-[15px] flex flex-col w-full'>
            <h2 className='text-[20px] leading-[32px] font-medium text-[#1E1E1E]'>
              Select your rental type
            </h2>
            <div className='w-full gap-[20px] lg:gap-[50px] flex flex-row flex-wrap'>
              <RadioCheck
                selectedValue={formik.values?.rentalType}
                handleChange={() => {
                  formik.setFieldValue('rentalType', 'Rent');
                }}
                type='radio'
                value='Rent'
                name='rentalType'
              />
              <RadioCheck
                selectedValue={formik.values?.rentalType}
                handleChange={() => {
                  formik.setFieldValue('rentalType', 'Lease');
                }}
                type='radio'
                name='rentalType'
                value='Lease'
              />
            </div>
            {formik.touched.rentalType && formik.errors.rentalType && (
              <span className='text-red-600 text-sm'>
                {String(formik.errors.rentalType)}
              </span>
            )}
          </div>
        )}

        {selectedCard === 'rent' && (
          <div className='min-h-[73px] gap-[15px] flex flex-col w-full'>
            <h2 className='text-[20px] leading-[32px] font-medium text-[#1E1E1E]'>
              Property Condition
            </h2>
            <div className='w-full gap-[20px] lg:gap-[50px] flex flex-row flex-wrap'>
              <RadioCheck
                selectedValue={formik.values?.propertyCondition}
                handleChange={() => {
                  formik.setFieldValue('propertyCondition', 'Brand New');
                }}
                type='radio'
                value='Brand New'
                name='propertyCondition'
              />
              <RadioCheck
                selectedValue={formik.values?.propertyCondition}
                handleChange={() => {
                  formik.setFieldValue('propertyCondition', 'Good Condition');
                }}
                type='radio'
                name='propertyCondition'
                value='Good Condition'
              />
              <RadioCheck
                selectedValue={formik.values?.propertyCondition}
                handleChange={() => {
                  formik.setFieldValue('propertyCondition', 'Needs Renovation');
                }}
                type='radio'
                name='propertyCondition'
                value='Needs Renovation'
              />
            </div>
            {formik.touched.propertyCondition && formik.errors.propertyCondition && (
              <span className='text-red-600 text-sm'>
                {String(formik.errors.propertyCondition)}
              </span>
            )}
          </div>
        )}

        <div className='min-h-[127px] w-full flex flex-col gap-[15px]'>
          <h2 className='text-[20px] leading-[32px] font-medium text-[#1E1E1E]'>
            Location
          </h2>
          <div className='min-h-[80px] flex gap-[15px] lg:grid lg:grid-cols-3 flex-col'>
            <Input
              label='State'
              name='selectedState'
              forState={true}
              forLGA={false}
              type='text'
              placeholder='Select State'
              formik={formik}
              selectedState={selectedState}
              stateOptions={stateOptions}
              setSelectedState={handleStateChange}
              isDisabled={areInputsDisabled}
            />
            <Input
              label='Local Government'
              name='selectedLGA'
              type='text'
              formik={formik}
              forLGA={true}
              forState={false}
              selectedLGA={selectedLGA}
              stateValue={selectedState?.label}
              lgasOptions={lgaOptions}
              setSelectedLGA={handleLGAChange}
              isDisabled={areInputsDisabled}
            />
            <Input
              label='Area'
              name='selectedCity'
              placeholder='Enter Area or Neighbourhood'
              forState={false}
              forLGA={false}
              onChange={formik.handleChange}
              type='text'
              isDisabled={areInputsDisabled}
            />
          </div>
        </div>

        {(formik.values.propertyType === 'Land' ||
          selectedCard === 'sell' ||
          selectedCard === 'jv') && (        <div className='min-h-[127px] w-full flex flex-col gap-[15px]'>
          <h2 className='text-[20px] leading-[32px] font-medium text-[#1E1E1E]'>
            Land Size
          </h2>
          <div className='min-h-[80px] flex gap-[15px] lg:grid lg:grid-cols-2 flex-col'>
            <label
              htmlFor='measurementType'
              className='min-h-[80px] w-full flex flex-col gap-[4px]'>
              <h2 className='text-base font-medium leading-[25.6px] text-[#1E1E1E]'>
                Type of Measurement
              </h2>
              <ReactSelect
                isDisabled={areInputsDisabled}
                name='measurementType'
                onChange={(selectedOption: any) =>
                  formik.setFieldValue('measurementType', selectedOption?.label)
                }
                value={
                  formik.values.measurementType
                    ? {
                        value: formik.values.measurementType,
                        label: formik.values.measurementType,
                      }
                    : null
                }
                options={['Plot', 'Acres', 'Square Meter'].map((option) => ({
                  value: option,
                  label: option,
                }))}
                styles={customStyles}
                placeholder='Select measurement type'
              />
            </label>
            <Input
              label='Enter Land Size'
              name='landSize'
              forState={false}
              forLGA={false}
              value={formattedLandSizeNumber}
              onChange={(e) => {
                const rawValue = (
                  e.target as HTMLInputElement | HTMLTextAreaElement
                ).value;
                setFormatedLandNumber(formatNumber?.(rawValue) ?? '');
                formik.setFieldValue('landSize', rawValue.replace(/,/g, ''));
              }}
              type='text'
              isDisabled={areInputsDisabled}
            />
          </div>
          {formik.touched.landSize && formik.errors.landSize && (
            <span className='text-red-600 text-sm'>
              {String(formik.errors.landSize)}
            </span>
          )}
        </div>
        )}

        <div className='min-h-[50px] flex flex-col gap-[15px]'>
          <h2 className='text-[20px] leading-[32px] font-medium text-[#1E1E1E]'>
            Price Details
          </h2>
          <div
            className={
              selectedCard !== 'jv' && selectedCard !== 'sell'
                ? 'min-h-[80px] flex gap-[15px] lg:grid lg:grid-cols-2 flex-col'
                : 'min-h-[80px] flex flex-col gap-[15px]'
            }>
            <Input
              label='Price'
              placeholder='Enter property price'
              name='price'
              type='text'
              className={
                selectedCard === 'jv' ? 'w-full col-span-2' : 'w-full'
              }
              minNumber={0}
              value={formatedPrice}
              onChange={(e) => {
                const rawValue = (
                  e.target as HTMLInputElement | HTMLTextAreaElement
                ).value;
                setFormatedPrice(formatNumber?.(rawValue) ?? '');
                formik.setFieldValue('price', rawValue.replace(/,/g, ''));
              }}
              isDisabled={areInputsDisabled}
            />

            {selectedCard !== 'jv' && selectedCard !== 'sell' && (
              <Input
                label='Lease Hold'
                placeholder='Enter lease hold'
                name='leaseHold'
                type='text'
                className='w-full'
                minNumber={0}
                value={formatedHold}
                onChange={(e) => {
                  const rawValue = (
                    e.target as HTMLInputElement | HTMLTextAreaElement
                  ).value;
                  setFormatedHold(formatNumber?.(rawValue) ?? '');
                  formik.setFieldValue('leaseHold', rawValue.replace(/,/g, ''));
                }}
                isDisabled={areInputsDisabled}
              />
            )}
          </div>
        </div>

        {formik.values.propertyType !== 'Land' && selectedCard !== 'jv' && (
          <div className='min-h-[129px] gap-[15px] flex flex-col w-full'>
            <h2 className='text-[20px] leading-[32px] font-medium text-[#1E1E1E]'>
              Property Details
            </h2>
            <div className='min-h-[80px] flex gap-[15px] lg:grid lg:grid-cols-2 flex-col'>
              <label
                htmlFor='typeOfBuilding'
                className='min-h-[80px] w-full flex flex-col gap-[4px]'>
                <h2 className='text-base font-medium leading-[25.6px] text-[#1E1E1E]'>
                  Type of Building
                </h2>
                <ReactSelect
                  isDisabled={areInputsDisabled}
                  name='typeOfBuilding'
                  onChange={(selectedOption: any) =>
                    formik.setFieldValue('typeOfBuilding', selectedOption?.label)
                  }
                  value={
                    formik.values.typeOfBuilding
                      ? {
                          value: formik.values.typeOfBuilding,
                          label: formik.values.typeOfBuilding,
                        }
                      : null
                  }
                  options={(
                    formik.values.propertyType === 'Residential'
                      ? propertyReferenceData[0].options
                      : formik.values.propertyType === 'Commercial'
                      ? propertyReferenceData[1].options
                      : []
                  ).map((option) => ({
                    value: option,
                    label: option,
                  }))}
                  styles={customStyles}
                  placeholder='Select building type'
                />
              </label>
              <label
                htmlFor='noOfBedroom'
                className='min-h-[80px] w-full flex flex-col gap-[4px]'>
                <h2 className='text-base font-medium leading-[25.6px] text-[#1E1E1E]'>
                  Number of Bedroom
                </h2>
                <ReactSelect
                  isDisabled={areInputsDisabled}
                  name='noOfBedroom'
                  onChange={(selectedOption: any) =>
                    formik.setFieldValue('noOfBedroom', selectedOption?.label)
                  }
                  value={
                    formik.values.noOfBedroom
                      ? {
                          value: formik.values.noOfBedroom,
                          label: formik.values.noOfBedroom,
                        }
                      : null
                  }
                  options={propertyReferenceData[
                    propertyReferenceData.length - 2
                  ].options.map((option) => ({
                    value: option,
                    label: option,
                  }))}
                  styles={customStyles}
                  placeholder='Select bedrooms'
                />
              </label>
            </div>
            <div className='min-h-[80px] flex gap-[15px] lg:grid lg:grid-cols-3 flex-col mt-2'>
              <label
                htmlFor='noOfBathroom'
                className='min-h-[80px] w-full flex flex-col gap-[4px]'>
                <h2 className='text-base font-medium leading-[25.6px] text-[#1E1E1E]'>
                  Number of Bathroom
                </h2>
                <ReactSelect
                  isDisabled={areInputsDisabled}
                  name='noOfBathroom'
                  onChange={(selectedOption: any) =>
                    formik.setFieldValue('noOfBathroom', selectedOption?.label)
                  }
                  value={
                    formik.values.noOfBathroom
                      ? {
                          value: formik.values.noOfBathroom,
                          label: formik.values.noOfBathroom,
                        }
                      : null
                  }
                  options={propertyReferenceData[
                    propertyReferenceData.length - 2
                  ].options.map((option) => ({
                    value: option,
                    label: option,
                  }))}
                  styles={customStyles}
                  placeholder='Select bathrooms'
                />
              </label>
              <label
                htmlFor='noOfToilet'
                className='min-h-[80px] w-full flex flex-col gap-[4px]'>
                <h2 className='text-base font-medium leading-[25.6px] text-[#1E1E1E]'>
                  Number of Toilet
                </h2>
                <ReactSelect
                  isDisabled={areInputsDisabled}
                  name='noOfToilet'
                  onChange={(selectedOption: any) =>
                    formik.setFieldValue('noOfToilet', selectedOption?.label)
                  }
                  value={
                    formik.values.noOfToilet
                      ? {
                          value: formik.values.noOfToilet,
                          label: formik.values.noOfToilet,
                        }
                      : null
                  }
                  options={propertyReferenceData[
                    propertyReferenceData.length - 2
                  ].options.map((option) => ({
                    value: option,
                    label: option,
                  }))}
                  styles={customStyles}
                  placeholder='Select toilets'
                />
              </label>
              <label
                htmlFor='noOfCarPark'
                className='min-h-[80px] w-full flex flex-col gap-[4px]'>
                <h2 className='text-base font-medium leading-[25.6px] text-[#1E1E1E]'>
                  Number of Car Park
                </h2>
                <ReactSelect
                  isDisabled={areInputsDisabled}
                  name='noOfCarPark'
                  onChange={(selectedOption: any) =>
                    formik.setFieldValue('noOfCarPark', selectedOption?.label)
                  }
                  value={
                    formik.values.noOfCarPark
                      ? {
                          value: formik.values.noOfCarPark,
                          label: formik.values.noOfCarPark,
                        }
                      : null
                  }
                  options={propertyReferenceData[
                    propertyReferenceData.length - 2
                  ].options.map((option) => ({
                    value: option,
                    label: option,
                  }))}
                  styles={customStyles}
                  placeholder='Select car parks'
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step1PropertyDetails;
