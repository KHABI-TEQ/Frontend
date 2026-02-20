/** @format */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import Button from '@/components/button';
import Loading from '@/components/loading';
import { toast } from 'react-hot-toast';
// import { usePageContext } from '@/context/page-context';
import { useLoading } from '@/hooks/useLoading';
import React, { Fragment, useEffect, useState } from 'react';
import RadioCheck from '@/components/radioCheck';
import { POST_REQUEST } from '@/utils/requests';
import { URLS } from '@/utils/URLS';
import Input from '@/components/Input';
import { useFormik } from 'formik';
//import * as Yup from 'yup';
import { featuresData, tenantCriteriaData } from '@/data/landlord';
import PhoneInput from 'react-phone-number-input';
import { usePageContext } from '@/context/page-context';
import AttachFile from '@/components/attach_file';
import 'react-phone-number-input/style.css';
import naijaStates from 'naija-state-local-government';

interface Option {
  value: string;
  label: string;
}
const Landlord = () => {
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

  const formik = useFormik({
    initialValues: {
      propertyType: '',
      propertyCondition: '',
      area: '',
      // usageOptions: [] as string[],
      price: '',
      features: [] as string[],
      tenantCriteria: [] as string[],
      noOfBedroom: '',
      // additionalFeatures: [] as string[],
      selectedState: '',
      // selectedAddress: '',
      // selectedCity: '',
      selectedLGA: '',
      ownerFullName: '',
      ownerPhoneNumber: '',
      ownerEmail: '',
      areYouTheOwner: true,
    },
    // validationSchema: Yup.object({
    //   propertyType: Yup.string().required('Property type is required'),
    //   propertyCondition: Yup.string().required(
    //     'Property condition is required'
    //   ),
    //   area: Yup.string().required('Area is required'),
    //   price: Yup.string().required('Price is required'),
    //   features: Yup.array().min(1, 'At least one feature is required'),
    //   tenantCriteria: Yup.array().min(
    //     1,
    //     'At least one tenant criteria is required'
    //   ),
    //   noOfBedroom: Yup.string().required('Number of bedrooms is required'),
    //   // additionalFeatures: Yup.array()
    //   //   .of(Yup.string())
    //   //   .min(1, 'At least one additional feature is required'),
    //   selectedState: Yup.string().required('State is required'),
    //   // selectedCity: Yup.string().required('City is required'),
    //   selectedLGA: Yup.string().required('LGA is required'),
    //   ownerFullName: Yup.string().required('Owner full name is required'),
    //   ownerPhoneNumber: Yup.string()
    //     .required('Owner phone number is required')
    //     .test('is-valid-phone', 'Invalid phone number', (value) =>
    //       value ? isValidPhoneNumber(value) : false
    //     ),
    //   ownerEmail: Yup.string()
    //     .email('Invalid email')
    //     .required('Owner email is required'),
    // }),
    onSubmit: async (values) => {
      console.log(values);
      setAreInputsDisabled(true);
      try {
        const url = URLS.BASE + URLS.landLordCreateBrief;
        const payload = {
          propertyType: values.propertyType,
          propertyCondition: values.propertyCondition,
          location: {
            state: values.selectedState,
            localGovernment: values.selectedLGA,
            area: values.area,
          },
          // price: values.price,
          rentalPrice: values.price,
          noOfBedrooms: values.noOfBedroom,
          features: values.features.map((feature) => ({
            featureName: feature,
          })),
          tenantCriteria: values.tenantCriteria.map((criterium) => ({
            criterium: criterium,
          })),
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
            Submit Your&nbsp;
            <span className='text-[#8DDB90] font-display'>Landlord Brief</span>
          </h2>
          <div className='lg:w-[953px] w-full text-[24px] leading-[38.4px] text-[#5A5D63] font-normal text-center'>
            Khabi-Teq connects you with{' '}
            <span className='text-[#8DDB90]'>verified tenants</span> and
            simplifies property management. From tenant onboarding to rent
            collection and maintenance coordination, we handle it all so you can
            focus on growing your property portfolio with confidence and ease
          </div>
          <div className='lg:w-[877px] w-full'>
            <h3 className='text-[24px] leading-[38.4px] font-semibold text-[#09391C] lg:py-[40px] py-[20px] lg:px-[80px] w-full'>
              Brief Details
            </h3>
            <form
              onSubmit={formik.handleSubmit}
              className='w-full border-t-[1px] border-[#8D909680] min-h-[1177px] flex flex-col'>
              {/* <div className='w-full border-t-[1px] border-[#8D909680] min-h-[1177px] flex flex-col'> */}
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
                    </div>
                  </div>
                  {/**Property condition */}
                  <div className='min-h-[73px] gap-[15px] flex flex-col lg:w-[535px] w-full'>
                    <h2 className='text-[20px] leading-[32px] font-medium text-[#1E1E1E]'>
                      Property condition
                    </h2>
                    <div className='w-full gap-[20px] lg:gap-[50px] flex flex-row flex-wrap'>
                      <RadioCheck
                        isDisabled={
                          formik.values?.propertyCondition ? true : false
                        }
                        selectedValue={formik.values?.propertyCondition}
                        handleChange={() => {
                          formik.setFieldValue(
                            'propertyCondition',
                            'New Building'
                          );
                        }}
                        type='radio'
                        name='propertyCondition'
                        value='New Building'
                      />
                      <RadioCheck
                        isDisabled={
                          formik.values?.propertyCondition ? true : false
                        }
                        selectedValue={formik.values?.propertyCondition}
                        handleChange={() => {
                          formik.setFieldValue(
                            'propertyCondition',
                            'Old Building'
                          );
                        }}
                        type='radio'
                        name='propertyCondition'
                        value='Old Building'
                      />
                    </div>
                  </div>
                  {/**Location */}
                  <div className='min-h-[127px] w-full flex flex-col gap-[15px]'>
                    <h2 className='text-[20px] leading-[32px] font-medium text-[#1E1E1E]'>
                      Location
                    </h2>
                    <div className='min-h-[80px] flex gap-[15px] lg:grid lg:grid-cols-2 flex-col'>
                      {/* <Input
                        label='State'
                        name='selectedState'
                        selectedState={{
                          value: formik.values?.selectedState,
                          label: formik.values?.selectedState,
                        }}
                        setSelectedState={(option) => {
                          formik.setFieldValue('selectedState', option?.value);
                        }}
                        forState={true}
                        type='text'
                        placeholder='Select State'
                        isDisabled={areInputsDisabled}
                      />
                      <Input
                        label='Local Government'
                        name='selectedLGA'
                        type='text'
                        value={formik.values?.selectedLGA}
                        onChange={formik.handleChange}
                        isDisabled={areInputsDisabled}
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
                        label='Area'
                        name='area'
                        type='text'
                        formik={formik}
                        value={formik.values.area}
                        onChange={formik.handleChange}
                        isDisabled={areInputsDisabled}
                      />
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
                    </div>
                  </div>
                  {/**Other section (Rental Price | no of Bedroom) */}
                  <div className='w-full flex flex-col gap-[15px]'>
                    <div className='min-h-[80px] flex gap-[15px] lg:flex-row flex-col'>
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
                      <Input
                        label='Number of Bedroom'
                        name='noOfBedroom'
                        type='number'
                        className='w-full'
                        minNumber={0}
                        // isDisabled={formik.values?.noOfBedroom ? true : false}
                        value={formik.values?.noOfBedroom}
                        onChange={formik.handleChange}
                        isDisabled={areInputsDisabled}
                      />
                    </div>
                  </div>
                  {/**Features */}
                  <div className='min-h-[73px] flex flex-col gap-[15px]'>
                    <h2 className='text-[20px] leading-[32px] font-medium text-[#1E1E1E]'>
                      Features
                    </h2>
                    <div className='grid lg:grid-cols-3 grid-cols-1 gap-[15px] w-full'>
                      {featuresData.map((item: string, idx: number) => (
                        <RadioCheck
                          key={idx}
                          type='checkbox'
                          value={item}
                          name='features'
                          handleChange={() => {
                            const features = formik.values.features.includes(
                              item
                            )
                              ? formik.values.features.filter(
                                  (doc) => doc !== item
                                )
                              : [...formik.values.features, item];
                            formik.setFieldValue('features', features);
                          }}
                          isDisabled={areInputsDisabled}
                        />
                      ))}
                    </div>
                  </div>
                  {/**Tenant Criteria */}
                  <div className='min-h-[73px] flex flex-col gap-[15px]'>
                    <h2 className='text-[20px] leading-[32px] font-medium text-[#1E1E1E]'>
                      Tenant Criteria
                    </h2>
                    <div className='grid lg:grid-cols-2 gap-[15px] w-full'>
                      {tenantCriteriaData.map((item: string, idx: number) => (
                        <RadioCheck
                          key={idx}
                          type='checkbox'
                          value={item}
                          name='tenantCriteria'
                          handleChange={() => {
                            const tenantCriteria =
                              formik.values.tenantCriteria.includes(item)
                                ? formik.values.tenantCriteria.filter(
                                    (doc) => doc !== item
                                  )
                                : [...formik.values.tenantCriteria, item];
                            formik.setFieldValue('documents', tenantCriteria);
                          }}
                          isDisabled={areInputsDisabled}
                        />
                      ))}
                    </div>
                  </div>

                  {/**Upload Image | Documents */}
                  <AttachFile heading='Upload image(optional)' />
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
              {/* </div> */}
            </form>
          </div>
        </div>
      </section>
    </Fragment>
  );
};

export default Landlord;
