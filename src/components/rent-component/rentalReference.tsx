/** @format */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, {
  Fragment,
  MouseEvent,
  MouseEventHandler,
  useEffect,
  useState,
} from 'react';
import Button from '../general-components/button';
import { useFormik } from 'formik';
import ReactSelect, { components } from 'react-select';
import Input from '../general-components/Input';
import api from '@/utils/axiosConfig';
import { URLS } from '@/utils/URLS';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDown,
  faArrowDownUpLock,
  faArrowLeft,
  faCaretDown,
} from '@fortawesome/free-solid-svg-icons';
import MultiSelectionProcess from '../multiSelectionProcess';
import customStyles from '@/styles/inputStyle';
import { useUserContext } from '@/context/user-context';
import toast from 'react-hot-toast';
import { shuffleArray } from '@/utils/shuffleArray';
import SubmitPrefrenceModal from '../can-not-find-brief-modal';
import { usePageContext } from '@/context/page-context';
import data from '@/data/state-lga';

interface RentalReferenceDataProps {
  rentalReferenceData: { heading: string; options: string[] }[];
  isDisabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  data?: any[];
  setData?: (type: any[]) => void;
  setDataLoading?: (type: boolean) => void;
  setFound: ({ isFound, count }: { isFound: boolean; count: number }) => void;
  found: { isFound: boolean; count: number };
}

interface valuesProps {
  propertyType: string;
  budgetRange: string;
  state: string;
  landSize: string;
  docOnProperty: [];
  desireFeatures: [];
  selectedLGA: string | null;
  selectedState: '';
  bedroom: number | undefined | string;
  homeCondition: string;
  tenantCriteria: string[];
}

interface Option {
  value: string;
  label: string;
}

const RentalReference = ({
  rentalReferenceData,
  isDisabled,
  onClick,
  setData,
  setDataLoading,
  found,
  setFound,
}: RentalReferenceDataProps) => {
  const { setPropertyReference, setRentPage } = usePageContext();
  const [stateOptions, setStateOptions] = useState<Option[]>([]);
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [formStatus, setFormStatus] = useState<
    'idle' | 'pending' | 'success' | 'error'
  >('idle');
  const { user } = useUserContext();

  const formik = useFormik({
    initialValues: {
      propertyType: '',
      budgetRange: '',
      state: '',
      landSize: '',
      docOnProperty: [],
      desireFeatures: [],
      selectedState: '',
      selectedLGA: '',
      bedroom: '',
      homeCondition: '',
      tenantCriteria: [],
    },
    onSubmit: async (values: valuesProps) => {
      const payload = {
        location: {
          state: values.selectedState,
          localGovernment: values.selectedLGA
            ? values.selectedLGA.split(',')[1]?.trimStart() ?? ''
            : '',
          area: 'N/A',
        },
        propertyCondition: values.homeCondition,
        propertyType: values.propertyType, // values.propertyType
        budgetRange: values.budgetRange.trimStart() || '',
        rentalPrice: 0,
        noOfBedrooms: Number(values.bedroom),
        areYouTheOwner: true,
        owner: {
          fullName: user?.firstName + ' ' + user?.lastName,
          phoneNumber: user?.phoneNumber,
          email: user?.email,
        },
      };
      console.log(payload);
      setFormStatus('pending');
      setDataLoading?.(true);
      try {
        const response = await axios.post(
          URLS.BASE + '/properties/rent/request/rent/search',
          payload
        );
        console.log(response);
        if (response.status === 200) {
          // toast.success('')
          setFound({ isFound: true, count: response.data.length });
          const shuffled = shuffleArray(response.data);
          setData?.(shuffled);
          setDataLoading?.(false);
        }

        setFormStatus('success');
      } catch (error) {
        console.log(error);
        setFormStatus('error');
        setDataLoading?.(false);
        setFound({ isFound: false, count: 0 });
      }
      console.log(values);
    },
  });

  const submitPreference = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const payload = {
      propertyType: formik.values.propertyType,
      propertyCondition: formik.values.homeCondition,
      areYouTheOwner: true, //assumption
      pictures: [], //no pictures required in the design,
      budgetRange: formik.values.budgetRange,
      location: {
        state: formik.values.selectedState,
        localGovernment: formik.values.selectedLGA,
        area: 'N/A', //assumption, same,
      },
      rentalPrice: 0,
      features: formik.values.desireFeatures.map((item: string) => ({
        featureName: item,
      })),
      noOfBedrooms: formik.values.bedroom,
      tenantCriteria: formik.values.tenantCriteria.map((item: string) => ({
        criteria: item,
      })),
      landSize: {
        measurementType: formik.values.landSize.split(' ')[1],
        size: Number(formik.values.landSize.split(' ')[0]),
      },
      // typeOfMeasurment: formik.values.typeOfMeasurement
    };

    const rentalReferenceData = {
      payload,
      type: 'rental',
    };
    console.warn(rentalReferenceData);
    setPropertyReference({
      type: 'rental',
      payload: payload,
    });
    setRentPage({
      submitPreference: true,
      isSubmitForInspectionClicked: false,
    });
  };

  useEffect(() => {
    // Load Nigerian states correctly
    setStateOptions(
      Object.keys(data).map((state: string) => ({
        value: state,
        label: state,
      }))
    );
  }, []);
  return (
    <Fragment>
      <form
        onSubmit={formik.handleSubmit}
        className='min-h-[398px] lg:min-h-[257px] py-[24px] px-[20px] lg:py-[30px] w-full lg:w-[1153px] lg:px-[45px] bg-[#FFFFFF]'>
        <div className='w-full flex flex-col gap-[37px]'>
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-[30px] lg:gap-[37px] items-end'>
            {/**Type of Property */}
            <Select
              allowMultiple={false}
              heading={'propertyType'}
              formik={formik}
              name={'Type of Home'}
              options={[
                'Residential',
                'Duplex',
                'Commercial Spaces (Office, Shop)',
              ]}
              placeholder='Select'
              isDisabled={formStatus === 'pending'}
            />

            {/**Home Condition */}
            <Select
              allowMultiple={false}
              heading={'homeCondition'}
              formik={formik}
              name='Home Condition'
              options={[
                'Brand New',
                'Good Condition',
                'Fairly Used',
                'Needs Renovation',
              ]}
              placeholder='Select'
              isDisabled={formStatus === 'pending'}
            />

            {/**Budget Range */}
            <Select
              allowMultiple={false}
              heading={'budgetRange'}
              formik={formik}
              name={rentalReferenceData[1].heading}
              options={[
                `₦2.5 Million - ₦5 Million/year`,
                `₦5 Million - ₦10 Million/year`,
                `Above ₦10 Million/year`,
              ]}
              placeholder='Select'
              isDisabled={formStatus === 'pending'}
            />

            {/**Preferred Location */}

            <div className='flex flex-col gap-[10px]'>
              <label htmlFor='selectedLGA' className='flex flex-col gap-[4px]'>
                <span className='text-base leading-[25.6px] font-medium text-[#1E1E1E]'>
                  Preferred Location
                </span>{' '}
                <div className='flex items-center'>
                  <input
                    id='selectedLGA'
                    placeholder='select location'
                    disabled={formStatus === 'pending'}
                    onClick={() => {
                      setShowLocationModal(!showLocationModal);
                    }}
                    className={`w-full outline-none min-h-[50px] border-[1px] py-[12px] px-[16px] bg-white disabled:bg-[#FAFAFA] border-[#D6DDEB] placeholder:text-[#A8ADB7] text-black text-base leading-[25.6px] disabled:cursor-not-allowed cursor-pointer rounded-[5px] ${
                      showLocationModal &&
                      'focus:outline-[1.5px] focus:outline-[#14b8a6] focus:outline-offset-0'
                    }`}
                    readOnly
                    value={
                      formik.values.selectedLGA
                        ? `${formik.values.selectedLGA}`
                        : ''
                    }
                  />
                  {/* <FontAwesomeIcon
                  icon={faCaretDown}
                  size='lg'
                  color={`${showLocationModal ? '#8DDB90' : 'gray'}`}
                  className={`absolute ml-[210px] hover:text-[#09391C] cursor-pointer transition-all duration-500`}
                /> */}
                </div>
              </label>
              {showLocationModal && (
                <MultiSelectionProcess
                  name='selectedState'
                  formik={formik}
                  options={stateOptions}
                  closeModalFunction={setShowLocationModal}
                  heading='location'
                  type='Preferred Location'
                />
              )}
            </div>

            {/**Number of Bedrooms */}
            <Input
              id='bedroom'
              label='Number of Bedroom'
              name='bedroom'
              type='number'
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder='This is placeholder'
              // formik={formik}
              isDisabled={formStatus === 'pending'}
            />

            {/**Desires Features */}
            <Select
              allowMultiple={true}
              heading={'desireFeatures'}
              formik={formik}
              name={rentalReferenceData[5].heading}
              options={rentalReferenceData[5].options}
              placeholder='Select'
              isDisabled={formStatus === 'pending'}
            />

            {/**Tenant Criteria */}
            <Select
              allowMultiple={true}
              heading={'tenantCriteria'}
              formik={formik}
              name='Tenant Criteria'
              options={[
                'Self Employed',
                'Employee',
                'Families',
                'Corporate Tenants',
                'Students',
                'No Pets Allowed',
                'Male',
                'Female',
                'Both Genders',
                'Individual Tenant',
                'Must Provide Credit Report',
                'Tenant Responsible for Basic Maintenance',
              ]}
              isDisabled={formStatus === 'pending'}
            />

            <Button
              value={`${formStatus === 'pending' ? 'Searching...' : 'Search'}`}
              type='submit'
              onClick={isDisabled ? undefined : onClick}
              className={`hover:bg-[#09391C] text-[#FFFFFF] text-base leading-[25.6px] font-bold h-[50px] py-[12px] px-[24px] w-full ${
                formStatus === 'pending' ? 'bg-[#09391C]' : 'bg-[#8DDB90]'
              }`}
            />
          </div>
        </div>
      </form>
      {found.isFound && (
        <SubmitPrefrenceModal
          formik={formik}
          submitPreference={submitPreference}
        />
      )}
    </Fragment>
  );
};

export default RentalReference;

interface SelectProps {
  heading: string;
  placeholder?: string;
  options: any[];
  formik: any;
  allowMultiple?: boolean;
  name: string;
  isDisabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
  heading,
  options,
  formik,
  allowMultiple,
  name,
  isDisabled,
}) => {
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
        isDisabled={isDisabled}
        name={name}
        components={{ MenuList: ComponentMenuList(`Filter by ${name}`) }}
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
        onBlur={formik.handleBlur}
        value={formik.values[heading]?.label}
        options={opts}
        className={`w-full`}
        styles={customStyles}
        placeholder='Select'
      />
    </label>
  );
};

/**
 * Component Menu List
 */

const ComponentMenuList = (heading: string) => {
  const WrappedMenuList = (props: any) => (
    <components.MenuList {...props}>
      {heading && (
        <div
          className='flex gap-[10px] justify-start items-center border-[#8D9096] border-b-[1px] w-[95%] mx-auto'
          style={{ padding: '8px 12px', fontWeight: 'bold', color: '#555' }}>
          <FontAwesomeIcon
            icon={faArrowLeft}
            size='sm'
            color='black'
            className='cursor-pointer'
          />
          <span className='text-[#000000] text-sm font-medium'>{heading}</span>
        </div>
      )}
      {props.children}
    </components.MenuList>
  );

  WrappedMenuList.displayName = 'ComponentMenuList';

  return WrappedMenuList;
};
