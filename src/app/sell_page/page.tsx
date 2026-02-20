/** @format */
/* eslint-disable @typescript-eslint/no-explicit-any*/
'use client';
import Button from '@/components/button';
import Loading from '@/components/loading';
import { toast } from 'react-hot-toast';
// import { usePageContext } from '@/context/page-context';
import { useLoading } from '@/hooks/useLoading';
import React, { Fragment, useEffect, useState } from 'react';
import RadioCheck from '@/components/radioCheck';
import Input from '@/components/Input';
import { usePageContext } from '@/context/page-context';
import { POST_REQUEST } from '@/utils/requests';
import { URLS } from '@/utils/URLS';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ReactSelect from 'react-select';
import { propertyReferenceData } from '@/data/buy_page_data';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import naijaStates from 'naija-state-local-government';
// import { useUserContext } from '@/context/user-context';

//import SubmitPopUp from '@/components/submit';
//import Select from '@/components/select';

interface Option {
  value: string;
  label: string;
}
const Sell = () => {
  // const { user } = useUserContext();
  const isLoading = useLoading();
  const [isLegalOwner, setIsLegalOwner] = useState<boolean>(false);
  const { setIsSubmittedSuccessfully } = usePageContext();
  const [areInputsDisabled, setAreInputsDisabled] = useState<boolean>(false);

  const [selectedState, setSelectedState] = useState<Option | null>(null);
  const [selectedLGA, setSelectedLGA] = useState<Option | null>(null);

  const [stateOptions, setStateOptions] = useState<Option[]>([]);
  const [lgaOptions, setLgaOptions] = useState<Option[]>([]);

  useEffect(() => {
    // Load Nigerian states correctly
    setStateOptions(
      naijaStates.states().map((state: string) => ({
        value: state,
        label: state,
      }))
    );
  }, []);

  const handleLGAChange = (selected: Option | null) => {
    formik.setFieldValue('selectedLGA', selected?.value);
    console.log('Selected LGA:', formik.values); // Debugging
    setSelectedLGA?.(selected);
  };

  const handleStateChange = (selected: Option | null) => {
    console.log('Selected State:', selected);
    formik.setFieldValue('selectedState', selected?.value);
    setSelectedState?.(selected);

    if (selected) {
      const lgas = naijaStates.lgas(selected.value)?.lgas;
      console.log('Raw LGA Data:', lgas); // Log raw LGA data

      if (Array.isArray(lgas)) {
        setLgaOptions(
          lgas.map((lga: string) => ({
            value: lga,
            label: lga,
          }))
        );
      } else {
        console.error('LGAs not returned as an array:', lgas);
        setLgaOptions([]);
      }
      setSelectedLGA?.(null);
    } else {
      console.log('Hey');
      setLgaOptions([]);
      setSelectedLGA?.(null);
    }
  };

  const docOfTheProperty: string[] = [
    'C of O',
    'Survey Document',
    'Receipt',
    'Governor Consent',
    'Deed of Assignment',
  ];
  const formik = useFormik({
    initialValues: {
      propertyType: '',
      usageOptions: [] as string[],
      price: '',
      documents: [] as string[],
      noOfBedroom: '',
      additionalFeatures: [] as string[],
      selectedState: '',
      // selectedAddress: '',
      selectedCity: '',
      selectedLGA: '',
      ownerFullName: '',
      ownerPhoneNumber: '',
      ownerEmail: '',
      areYouTheOwner: true,
    },
    validationSchema: Yup.object({
      propertyType: Yup.string().required('Property type is required'),
      usageOptions: Yup.array().min(1, 'At least one usage option is required'),
      price: Yup.string().required('Price is required'),
      documents: Yup.array().min(1, 'At least one document is required'),
      noOfBedroom: Yup.string().required('Number of bedrooms is required'),
      additionalFeatures: Yup.array()
        .of(Yup.string())
        .min(1, 'At least one additional feature is required'),
      selectedState: Yup.string().required('State is required'),
      // selectedAddress: Yup.string().required('Address is required'),
      selectedCity: Yup.string().required('City is required'),
      selectedLGA: Yup.string().required('LGA is required'),
      ownerFullName: Yup.string().required('Owner full name is required'),
      ownerPhoneNumber: Yup.string()
        .required('Owner phone number is required')
        .test('is-valid-phone', 'Invalid phone number', (value) =>
          value ? isValidPhoneNumber(value) : false
        ),
      ownerEmail: Yup.string()
        .email('Invalid email')
        .required('Owner email is required'),
    }),
    onSubmit: async (values) => {
      console.log(values);
      setAreInputsDisabled(true);
      try {
        const url = URLS.BASE + URLS.agentCreateBrief;
        const payload = {
          propertyType: values.propertyType,
          usageOptions: values.usageOptions,
          propertyFeatures: {
            noOfBedrooms: values.noOfBedroom,
            additionalFeatures: values.additionalFeatures,
          },
          docOnProperty: values.documents.map((doc) => ({
            docName: doc,
            isProvided: true, // Assuming all selected documents are provided
          })),
          location: {
            state: values.selectedState,
            // address: values.selectedAddress,
            localGovernment: values.selectedLGA,
            area: values.selectedCity,
          },
          price: values.price,
          owner: {
            fullName: values.ownerFullName,
            phoneNumber: values.ownerPhoneNumber,
            email: values.ownerEmail,
          },
          areYouTheOwner: values.areYouTheOwner,
        };

        console.log('Payload:', payload);

        await toast.promise(
          POST_REQUEST(url, payload).then((response) => {
            console.log('response from brief', response);
            if ((response as any).owner) {
              toast.success('Property submitted successfully');
              // router.push('/success');
              setIsSubmittedSuccessfully(true);
              setAreInputsDisabled(false);
              return 'Property submitted successfully';
            } else {
              const errorMessage =
                (response as any).error || 'Submission failed';
              toast.error(errorMessage);
              setAreInputsDisabled(false);
              throw new Error(errorMessage);
            }
          }),
          {
            loading: 'Submitting...',
            // success: 'Property submitted successfully',
            // error: 'An error occurred, please try again',
          }
        );
      } catch (error) {
        console.error(error);
        setAreInputsDisabled(false);
        // toast.error('An error occurred, please try again');
      } finally {
        setAreInputsDisabled(false);
      }
    },
  });

  if (isLoading) return <Loading />;
  return (
    <Fragment>
      <section
        className={`min-h-[800px] bg-[#EEF1F1] w-full flex justify-center items-center transition-all duration-500`}>
        <div className='container flex flex-col justify-center items-center gap-[30px] my-[60px] px-[20px]'>
          <h2 className='text-[#09391C] lg:text-[40px] lg:leading-[64px] font-semibold font-display text-center text-[30px] leading-[41px]'>
            Submit Your{' '}
            <span className='text-[#8DDB90] font-display'>Property Brief</span>
          </h2>
          <div className='lg:w-[953px] w-full text-[24px] leading-[38.4px] text-[#5A5D63] font-normal text-center'>
            Khabi-Teq helps you reach a wide network of potential buyers and
            simplifies the property selling process. Our platform ensures your
            property is showcased effectively, connects you with verified
            buyers, and streamlines negotiations for a smooth and successful
            sale
          </div>
          <div className='lg:w-[877px] w-full'>
            <h3 className='text-[24px] leading-[38.4px] font-semibold text-[#09391C] lg:py-[30px] py-[20px] lg:px-[80px] w-full'>
              Brief Details
            </h3>
            <form
              onSubmit={formik.handleSubmit}
              className='w-full border-t-[1px] border-[#8D909680] min-h-[1177px] flex flex-col'>
              <div className='min-h-[629px] py-[40px] lg:px-[80px] border-[#8D909680] border-y-[1px] w-full'>
                <div className='w-full min-h-[629px] flex flex-col gap-[46px]'>
                  {/**Property Type */}
                  <div className='min-h-[73px] gap-[15px] flex flex-col lg:w-[535px] w-full'>
                    <h2 className='text-[20px] leading-[32px] font-medium text-[#1E1E1E]'>
                      Property Type
                    </h2>
                    <div className='w-full gap-[20px] lg:gap-[50px] flex flex-row flex-wrap'>
                      <RadioCheck
                        isDisabled={formik.values?.propertyType ? true : false}
                        selectedValue={formik.values?.propertyType}
                        handleChange={() => {
                          formik.setFieldValue('propertyType', 'Residential');
                        }}
                        type='radio'
                        value='Residential'
                        name='propertyType'
                      />
                      <RadioCheck
                        isDisabled={formik.values?.propertyType ? true : false}
                        selectedValue={formik.values?.propertyType}
                        handleChange={() => {
                          formik.setFieldValue('propertyType', 'Commercial');
                        }}
                        type='radio'
                        name='propertyType'
                        value='Commercial'
                      />
                      <RadioCheck
                        isDisabled={formik.values?.propertyType ? true : false}
                        selectedValue={formik.values?.propertyType}
                        handleChange={() => {
                          formik.setFieldValue('propertyType', 'Land');
                        }}
                        type='radio'
                        name='propertyType'
                        value='Land'
                      />
                    </div>
                    {formik.touched.propertyType &&
                      formik.errors.propertyType && (
                        <span className='text-red-600 text-sm'>
                          {formik.errors.propertyType}
                        </span>
                      )}
                  </div>
                  {/**Usage Options */}
                  <div className='min-h-[73px] flex flex-col gap-[15px]'>
                    <h2 className='text-[20px] leading-[32px] font-medium text-[#1E1E1E]'>
                      Usage Options
                    </h2>
                    <div className='flex flex-wrap gap-[15px] w-full'>
                      {['All', 'Lease', 'Joint Venture', 'Outright Sale'].map(
                        (item: string, idx: number) => (
                          <RadioCheck
                            isDisabled={areInputsDisabled}
                            type='checkbox'
                            value={item}
                            key={idx}
                            name='Usage Options'
                            handleChange={() => {
                              const usageOptions =
                                formik.values.usageOptions.includes(item)
                                  ? formik.values.usageOptions.filter(
                                      (option) => option !== item
                                    )
                                  : [...formik.values.usageOptions, item];
                              formik.setFieldValue(
                                'usageOptions',
                                usageOptions
                              );
                            }}
                          />
                        )
                      )}
                    </div>
                    {formik.touched.usageOptions &&
                      formik.errors.usageOptions && (
                        <span className='text-red-600 text-sm'>
                          {formik.errors.usageOptions}
                        </span>
                      )}
                  </div>
                  {/**Location */}
                  <div className='min-h-[127px] w-full flex flex-col gap-[15px]'>
                    <h2 className='text-[20px] leading-[32px] font-medium text-[#1E1E1E]'>
                      Location
                    </h2>
                    <div className='min-h-[80px] flex gap-[15px] lg:grid lg:grid-cols-2 flex-col'>
                      {/* <Input
                        name='selectedAddress'
                        label='Address'
                        type='text'
                        value={formik.values.selectedAddress}
                        onChange={formik.handleChange}
                      /> */}
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
                        lgasOptions={lgaOptions}
                        setSelectedLGA={handleLGAChange}
                        isDisabled={areInputsDisabled}
                      />
                      <Input
                        label='Area or Neighbourhood'
                        name='selectedCity'
                        forState={false}
                        forLGA={false}
                        onChange={formik.handleChange}
                        type='text'
                        isDisabled={areInputsDisabled}
                      />
                    </div>
                    {formik.touched.selectedState &&
                      formik.errors.selectedState && (
                        <span className='text-red-600 text-sm'>
                          {formik.errors.selectedState}
                        </span>
                      )}
                    {formik.touched.selectedLGA &&
                      formik.errors.selectedLGA && (
                        <span className='text-red-600 text-sm'>
                          {formik.errors.selectedLGA}
                        </span>
                      )}
                    {formik.touched.selectedCity &&
                      formik.errors.selectedCity && (
                        <span className='text-red-600 text-sm'>
                          {formik.errors.selectedCity}
                        </span>
                      )}
                  </div>
                  {/**Price */}
                  <div className='min-h-[50px] flex flex-col gap-[15px]'>
                    <Input
                      label='Price'
                      placeholder='Enter property price'
                      name='price'
                      type='number'
                      className='w-full'
                      minNumber={0}
                      value={formik.values?.price}
                      onChange={formik.handleChange}
                      isDisabled={areInputsDisabled}
                    />
                  </div>
                  {formik.touched.documents && formik.errors.documents && (
                    <span className='text-red-600 text-sm'>
                      {formik.errors.documents}
                    </span>
                  )}
                  {/**Document of the property */}
                  <div className='min-h-[50px] flex flex-col gap-[15px]'>
                    <h2 className='text-[20px] leading-[32px] font-medium text-[#1E1E1E]'>
                      Document on the property
                    </h2>
                    <div className='flex flex-wrap gap-[20px] w-full'>
                      {docOfTheProperty.map((item: string, idx: number) => (
                        <RadioCheck
                          type='checkbox'
                          key={idx}
                          value={item}
                          name='documents'
                          handleChange={() => {
                            const documents = formik.values.documents.includes(
                              item
                            )
                              ? formik.values.documents.filter(
                                  (doc) => doc !== item
                                )
                              : [...formik.values.documents, item];
                            formik.setFieldValue('documents', documents);
                          }}
                          isDisabled={areInputsDisabled}
                        />
                      ))}
                    </div>
                    {formik.touched.documents && formik.errors.documents && (
                      <span className='text-red-600 text-sm'>
                        {formik.errors.documents}
                      </span>
                    )}
                  </div>
                  {/**Property Features */}
                  <div className='min-h-[129px] gap-[15px] flex flex-col w-full'>
                    <h2 className='text-[20px] leading-[32px] font-medium text-[#1E1E1E]'>
                      Property Features
                    </h2>
                    <div className='min-h-[80px] flex gap-[15px] lg:grid lg:grid-cols-2 flex-col'>
                      <Input
                        label='Number of Bedroom'
                        name='noOfBedroom'
                        type='number'
                        className='w-full'
                        // isDisabled={formik.values?.noOfBedroom ? true : false}
                        value={formik.values?.noOfBedroom}
                        onChange={formik.handleChange}
                        isDisabled={areInputsDisabled}
                      />
                      <Select
                        label='Additional Features'
                        name='additionalFeatures'
                        heading='additionalFeatures'
                        allowMultiple={true}
                        options={
                          propertyReferenceData[
                            propertyReferenceData.length - 2
                          ].options
                        }
                        formik={formik}
                        isDisabled={areInputsDisabled}
                      />
                    </div>
                    {formik.touched.noOfBedroom &&
                      formik.errors.noOfBedroom && (
                        <span className='text-red-600 text-sm'>
                          {formik.errors.noOfBedroom}
                        </span>
                      )}
                    {formik.touched.additionalFeatures &&
                      formik.errors.additionalFeatures && (
                        <span className='text-red-600 text-sm'>
                          {formik.errors.additionalFeatures}
                        </span>
                      )}
                  </div>
                  {/**end */}
                </div>
              </div>
              {/**contact detail */}
              <div className='min-h-[348px] py-[40px] lg:px-[80px] border-[#8D909680] border-b-[1px] w-full'>
                <div className='w-full min-h-[348px] flex flex-col gap-[20px]'>
                  <h2 className='text-[#09391C] text-[24px] leading-[38.4px] font-semibold'>
                    Contact Detail
                  </h2>
                  <h3 className='text-[#1E1E1E] text-[18px] leading-[38.4px] font-semibold'>
                    Ownership Declaration
                  </h3>

                  <div className='w-full flex flex-col gap-[15px] min-h-[270px]'>
                    <RadioCheck
                      name='confirm'
                      type='checkbox'
                      onClick={() => {
                        setIsLegalOwner(!isLegalOwner);
                        //console.log(isLegalOwner)
                      }}
                      isDisabled={areInputsDisabled}
                      value='I confirm that I am the legal owner of this property or authorized to submit this brief'
                    />
                    <div className='flex lg:flex-row flex-col w-full gap-[15px]'>
                      <Input
                        label='Full name'
                        isDisabled={isLegalOwner}
                        name='ownerFullName'
                        value={formik.values?.ownerFullName}
                        onChange={formik.handleChange}
                        className='lg:w-1/2 w-full'
                        type='text'
                      />
                      {/* <Input
                        label='Phone Number'
                        isDisabled={isLegalOwner}
                        name='ownerPhoneNumber'
                        value={formik.values?.ownerPhoneNumber}
                        onChange={formik.handleChange}
                        className='lg:w-1/2 w-full'
                        type='text'
                      /> */}
                      <div className='flex flex-col gap-2'>
                        <label className='block text-sm font-medium'>
                          Phone Number:
                        </label>
                        <PhoneInput
                          international
                          defaultCountry='NG'
                          disabled={areInputsDisabled}
                          value={formik.values?.ownerPhoneNumber}
                          style={{ outline: 'none' }}
                          onChange={(value) =>
                            formik.setFieldValue('ownerPhoneNumber', value)
                          }
                          placeholder='Enter phone number'
                          className='w-full outline-none min-h-[50px] border-[1px] py-[12px] px-[16px] bg-[#FAFAFA] border-[#D6DDEB] placeholder:text-[#A8ADB7] text-black text-base leading-[25.6px] focus:outline-none focus:ring-0'
                        />
                        {(formik.touched.ownerPhoneNumber ||
                          formik.errors.ownerPhoneNumber) && (
                          <p className='text-red-500 text-sm mt-1'>
                            {formik.errors.ownerPhoneNumber}
                          </p>
                        )}
                      </div>
                    </div>
                    <Input
                      label='Email'
                      name='ownerEmail'
                      isDisabled={isLegalOwner}
                      className='w-full'
                      value={formik.values?.ownerEmail}
                      onChange={formik.handleChange}
                      type='email'
                    />
                  </div>
                </div>
              </div>

              {/**Button */}
              <div className='w-full flex justify-center items-center mt-8'>
                <Button
                  value='Submit Brief'
                  type='submit'
                  className='bg-[#8DDB90] lg:w-[459px] text-white text-base leading-[25.6px] font-bold min-h-[50px] py-[12px] px-[24px]'
                />
              </div>
            </form>
          </div>
        </div>
      </section>
    </Fragment>
  );
};

interface SelectProps {
  heading: string;
  placeholder?: string;
  options: string[];
  formik: any;
  allowMultiple?: boolean;
  label?: string;
  name?: string;
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
        isDisabled={isDisabled}
        name={heading}
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
        value={formik.values[heading]}
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
    </label>
  );
};

export default Sell;
