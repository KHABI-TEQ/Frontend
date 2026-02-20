/** @format */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use clients';
import React, { MouseEventHandler, useEffect, useState } from 'react';
import Button from './button';
import { useFormik } from 'formik';
import ReactSelect from 'react-select';
import Input from './Input';
import naijaStates from 'naija-state-local-government';
import axios from 'axios';
import { URLS } from '@/utils/URLS';

interface RentalReferenceDataProps {
  rentalReferenceData: { heading: string; options: string[] }[];
  isDisabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  // setFound: ({ isFound, count }: { isFound: boolean; count: number }) => void;
  // found: { isFound: boolean; count: number };
}

interface valuesProps {
  propertyType: string;
  budgetRange: string;
  state: string;
  landSize: string;
  docOnProperty: [];
  desireFeatures: [];
}

interface Option {
  value: string;
  label: string;
}

const RentalReference = ({
  rentalReferenceData,
  isDisabled,
  onClick,
}: RentalReferenceDataProps) => {
  const [selectedState, setSelectedState] = useState<Option | null>(null);
  const [stateOptions, setStateOptions] = useState<Option[]>([]);

  const formik = useFormik({
    initialValues: {
      propertyType: '',
      budgetRange: '',
      state: '',
      landSize: '',
      docOnProperty: [],
      desireFeatures: [],
    },
    onSubmit: async (values: valuesProps) => {
      console.log(values);
      const payload = {
        location: {
          state: values.state,
          localGovernment: 'Iwo',
          area: 'Ibadan',
        },
        propertyCondition: 'New Building',
        propertyType: values.propertyType,
        budgetRange: values.budgetRange,
        docOnProperty: values.docOnProperty,
        desireFeatures: values.desireFeatures,
        rentalPrice: 4000000,
      };
      try {
        const response = axios.post(
          URLS.BASE + '/properties/rents/rent/new',
          payload
        );
        console.log(response);
      } catch (error) {
        console.log(error);
      }
    },
  });

  const handleStateChange = (selected: Option | null) => {
    //console.log('Selected State:', selected);
    formik.setFieldValue('state', selected?.value);
    setSelectedState?.(selected);
  };

  useEffect(() => {
    console.log(formik.values);
  }, [formik.values]);

  useEffect(() => {
    // Load Nigerian states correctly
    setStateOptions(
      naijaStates.states().map((state: string) => ({
        value: state,
        label: state,
      }))
    );
  }, []);
  return (
    <form
      onSubmit={formik.handleSubmit}
      className='min-h-[398px] lg:min-h-[344px] py-[24px] px-[20px] lg:py-[30px] w-full lg:w-[1153px] lg:px-[45px] bg-[#FFFFFF]'>
      <div className='w-full min-h-[284px] flex flex-col gap-[37px]'>
        <div className='grid grid-cols-2 lg:grid-cols-3 gap-[30px] lg:gap-[37px]'>
          {/**Type of Property */}
          <Select
            allowMultiple={false}
            heading={'propertyType'}
            formik={formik}
            name={rentalReferenceData[0].heading}
            options={rentalReferenceData[0].options}
            placeholder='Select'
          />

          {/**Budget Range */}
          <Select
            allowMultiple={false}
            heading={'budgetRange'}
            formik={formik}
            name={rentalReferenceData[1].heading}
            options={rentalReferenceData[1].options}
            placeholder='Select'
          />
          {/**Preferred Location */}

          <Input
            label='Preferred Location'
            name='selectedState'
            forState={true}
            forLGA={false}
            type='text'
            placeholder='Select State'
            formik={formik}
            selectedState={selectedState}
            stateOptions={stateOptions}
            setSelectedState={handleStateChange}
          />
          {/**Land Size */}
          <Select
            allowMultiple={false}
            heading={'landSize'}
            formik={formik}
            name={rentalReferenceData[3].heading}
            options={rentalReferenceData[3].options}
            placeholder='Select'
          />
          {/**Document Type */}
          <Select
            allowMultiple={true}
            heading={'docOnProperty'}
            formik={formik}
            name={rentalReferenceData[4].heading}
            options={rentalReferenceData[4].options}
            placeholder='Select'
          />
          {/**Desires Features */}
          <Select
            allowMultiple={true}
            heading={'desireFeatures'}
            formik={formik}
            name={rentalReferenceData[5].heading}
            options={rentalReferenceData[5].options}
            placeholder='Select'
          />

          {/* {rentalReferenceData.map((item, idx: number) => (
            <Select formik={formik} key={idx} {...item} />
            //  <Select
            //   allowMultiple={false}
            //   heading={'propertyType'}
            //   formik={formik}
            //   name={propertyReferenceData[0].heading}
            //   options={propertyReferenceData[0].options}
            //   placeholder='Select'
            // />
          ))} */}
        </div>
        <div className='w-full justify-end items-end flex'>
          <Button
            value='Search'
            green={true}
            type='submit'
            onClick={isDisabled ? undefined : onClick}
            className='bg-[#8DDB90] text-[#FFFFFF] text-base leading-[25.6px] font-bold min-h-[50px] py-[12px] px-[24px] lg:w-[334px] w-full'
          />
        </div>
      </div>
    </form>
  );
};

export default RentalReference;

// interface SelectProps {
//   heading: string;
//   placeholder?: string;
//   options: string[];
//   formik: any;
// }

// const Select: React.FC<SelectProps> = ({ heading, options, formik }) => {
//   // const [valueSelected, setValueSelected] = useState<string>('');
//   return (
//     <label
//       htmlFor='select'
//       className='min-h-[80px] lg:w-[334.33px] w-full flex flex-col gap-[4px]'>
//       <h2 className='text-base font-medium leading-[25.6px] text-[#1E1E1E]'>
//         {heading}
//       </h2>
//       <select
//         onChange={formik.handleChange}
//         value={formik.values[heading]}
//         onBlur={formik.handleBlur}
//         className='min-h-[50px] border-[1px] py-[12px] px-[16px] bg-[#FFFFFF00] border-[#D6DDEB]'
//         name={heading}
//         id={heading}>
//         {options.map((option: string, idx: number) => (
//           <option value={option} key={idx}>
//             {option}
//           </option>
//         ))}
//       </select>
//     </label>
//   );
// };

interface SelectProps {
  heading: string;
  placeholder?: string;
  options: any[];
  formik: any;
  allowMultiple?: boolean;
  name: string;
}

const Select: React.FC<SelectProps> = ({
  heading,
  options,
  formik,
  allowMultiple,
  name,
}) => {
  // const [valueSelected, setValueSelected] =
  //   useState<SingleValue<OptionType>>(null);

  const opts = options.map((item) => ({
    value: typeof item === 'string' ? item.toLowerCase() : `${item} Bedroom`,
    label: typeof item === 'number' ? Number(item) : item,
  }));
  return (
    <label
      htmlFor='select'
      className='min-h-[80px] lg:w-[243.25px] w-full flex flex-col gap-[4px]'>
      <h2 className='text-base font-medium leading-[25.6px] text-[#1E1E1E]'>
        {name}
      </h2>
      <ReactSelect
        isMulti={allowMultiple}
        name={name}
        onChange={(selectedOption) =>
          allowMultiple
            ? formik.setFieldValue(
                heading,
                [
                  ...(Array.isArray(selectedOption)
                    ? selectedOption.map((opt: any) => opt.label)
                    : []),
                ].filter(Boolean) // Removes undefined values
              )
            : formik.setFieldValue(heading, selectedOption?.label ?? '')
        }
        /** const selectedLabels = selectedOption ? selectedOption.map(opt => opt.label) : [];
    formik.setFieldValue(heading, selectedLabels); */
        onBlur={formik.handleBlur}
        value={formik.values[heading]?.label}
        options={opts}
        className={`w-full`}
        styles={{
          control: (base) => ({
            ...base,
            height: '50px',
            background: '#FFFFFF00',
            overflow: 'hidden',
            display: 'flex',
            width: '100%',
          }),
        }}
        placeholder='Select'
      />
      {/* <select
        onChange={(e) => {
          setValueSelected(e.target.value);
        }}
        value={valueSelected}
        className='min-h-[50px] border-[1px] py-[12px] px-[16px] bg-[#FFFFFF00] border-[#D6DDEB]'
        name='select'
        id='select'>
        {options.map((option: string, idx: number) => (
          <option value={option} key={idx}>
            {option}
          </option>
        ))}
      </select> */}
    </label>
  );
};
