/** @format */

'use client';
import React, { useEffect, useState, useCallback, Fragment } from 'react';
import {
  faMagnifyingGlass,
  faQuestion,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { archivo } from '@/styles/font';
import { useLoading } from '@/hooks/useLoading';
import Loading from '@/components/loading-component/loading';
import { useFormik } from 'formik';
import BriefLists from '@/components/admincomponents/brief_lists';
import CreateBrief from '@/components/admincomponents/createBrief';

import Button from '@/components/general-components/button';
import { toast } from 'react-hot-toast';
import RadioCheck from '@/components/general-components/radioCheck';
import Input from '@/components/general-components/Input';
import { usePageContext } from '@/context/page-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { POST_REQUEST, POST_REQUEST_FILE_UPLOAD } from '@/utils/requests';
import { URLS } from '@/utils/URLS';
import * as Yup from 'yup';
import ReactSelect from 'react-select';
import { propertyReferenceData } from '@/data/buy_page_data';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import arrowRightIcon from '@/svgs/arrowR.svg';
import Stepper from '@/components/post-property-components/Stepper';
import ClickableCard from '@/components/post-property-components/ClickableCard';
import 'react-phone-number-input/style.css';
import BreadcrumbNav from '@/components/general-components/BreadcrumbNav';
import CommissionModal from '@/components/post-property-components/CommissionModal';
import { useUserContext } from '@/context/user-context';
import Cookies from 'js-cookie';

//import naijaStates from 'naija-state-local-government';
// import { useUserContext } from '@/context/user-context';

import Image from 'next/image';
import comingSoon from '@/assets/cominsoon.png';
import Blue from '@/assets/blue.png';
import Red from '@/assets/red.png';
import Green from '@/assets/green.png';
import { epilogue } from '@/styles/font';
import customStyles from '@/styles/inputStyle';
import state_data from '@/data/state-lga';
import {
  DocOnPropertyData,
  featuresData,
  JvConditionData,
} from '@/data/buy_data';
import { tenantCriteriaData } from '@/data/landlord';
import { features } from 'process';
import PropertySummary from '@/components/post-property-components/PropertySummary';
import Submit from '@/components/submit';

const boxData: BoxNotificationProps[] = [
  {
    name: 'Total Briefs',
    total: 0,
    type: 'initial',
  },
  {
    name: 'Active Briefs',
    total: 0,
    type: 'active',
  },
  {
    name: 'Pending Briefs',
    total: 0,
    type: 'flagged',
  },
  {
    name: 'Closed Deal Briefs',
    total: 0,
    type: 'banned',
  },
];

interface Option {
  value: string;
  label: string;
}

export default function BriefManagement() {
  const isLoading = useLoading();
  const [data, setData] = useState<BoxNotificationProps[]>(boxData);
  const [isCreateBriefModalOpened, setIsCreateBriefModalOpened] =
    useState<boolean>(false);

  // Memoize the updateBriefTotals function to prevent unnecessary re-renders
  const updateBriefTotals = useCallback((totals: Record<string, number>) => {
    setData((prevData) => {
      const updatedData = prevData.map((item) => ({
        ...item,
        total: totals[item.name] || 0,
      }));
      // Only update state if data has actually changed
      if (JSON.stringify(prevData) !== JSON.stringify(updatedData)) {
        return updatedData;
      }
      return prevData;
    });
  }, []);

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const dateFormik = useFormik({
    initialValues: {
      selectedStat: { value: 'Today', label: 'Today' },
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });

  const [briefSelected, setBriefSelected] = useState<string>('External brief');

  const renderDynamicTableContent = () => {
    return <BriefLists setBriefTotals={updateBriefTotals} />;
  };

  const { user } = useUserContext();
  const router = useRouter();
  const [isLegalOwner, setIsLegalOwner] = useState<boolean>(false);
  const { setIsSubmittedSuccessfully } = usePageContext();
  const [areInputsDisabled, setAreInputsDisabled] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [imageCardCount, setImageCardCount] = useState(4);
  const [images, setImages] = useState<(File | string | null)[]>(
    Array(imageCardCount).fill(null)
  );
  const [showCommissionModal, setShowCommissionModal] = useState(false);

  const [selectedState, setSelectedState] = useState<Option | null>(null);
  const [selectedLGA, setSelectedLGA] = useState<Option | null>(null);

  const [stateOptions, setStateOptions] = useState<Option[]>([]);
  const [lgaOptions, setLgaOptions] = useState<Option[]>([]);
  const [formatedHold, setFormatedHold] = useState<string>('');
  const [formatedPrice, setFormatedPrice] = useState<string>('');
  const [isComingSoon, setIsComingSoon] = useState<boolean>(false);
  const [selectedCard, setSelectedCard] = useState<'' | 'sell' | 'rent' | 'jv'>(
    ''
  );
  const [isPremiumListing, setIsPremiumListing] = useState<boolean>(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showFinalSubmit, setShowFinalSubmit] = useState(false);
  const { commission, setCommission } = usePageContext();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  const steps: { label: string; status: 'completed' | 'active' | 'pending' }[] =
    [
      {
        label: 'Type of brief',
        status:
          currentStep > 0
            ? 'completed'
            : currentStep === 0
            ? 'active'
            : 'pending',
      },
      {
        label: 'Submit brief details',
        status:
          currentStep > 1
            ? 'completed'
            : currentStep === 1
            ? 'active'
            : 'pending',
      },
      {
        label: 'Feature & Conditions',
        status:
          currentStep > 2
            ? 'completed'
            : currentStep === 2
            ? 'active'
            : 'pending',
      },
      {
        label: 'Upload Picture',
        status:
          currentStep > 3
            ? 'completed'
            : currentStep === 3
            ? 'active'
            : 'pending',
      },
      {
        label: 'Owners Declaration',
        status: currentStep === 4 ? 'active' : 'pending',
      },
    ];

  const formatNumber = (val: string) => {
    const containsLetters = /[A-Za-z]/.test(val);
    if (containsLetters) {
      // setFormattedValue('');
      return;
    }
    const numericValue = val.replace(/,/g, ''); //to remove commas;

    return numericValue ? Number(numericValue).toLocaleString() : '';
  };
  useEffect(() => {
    // Load Nigerian states correctly
    const sample = Object.keys(data);
    setStateOptions(
      Object.keys(state_data).map((state: string) => ({
        value: state,
        label: state,
      }))
    );
  }, []);

  useEffect(() => {
    if (user) {
      formik.setFieldValue(
        'ownerFullName',
        `${user.firstName || ''} ${user.lastName || ''}`
      );
      formik.setFieldValue('ownerEmail', user.email || '');
    }
  }, [user]);

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
      const lgas = Object.values(state_data[selected.label]);
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

  const stepRequiredFields: { [key: number]: string[] } = {
    1: ['propertyType', 'price', 'selectedState', 'selectedLGA'],
    2: ['documents', 'jvConditions'],
    // ...add for other steps as needed
  };

  const formik = useFormik({
    initialValues: {
      propertyType: '',
      propertyCondition: '',
      typeOfBuilding: '',
      // usageOptions: [] as string[],
      price: '',
      leaseHold: '',
      documents: [] as string[],
      jvConditions: [] as string[],
      noOfBedroom: '',
      noOfCarPark: '',
      noOfToilet: '',
      noOfBathroom: '',
      features: [] as string[],
      tenantCriteria: [] as string[],
      selectedState: '',
      // selectedAddress: '',
      selectedCity: '',
      selectedLGA: '',
      ownerFullName: '',
      ownerPhoneNumber: '',
      ownerEmail: '',
      areYouTheOwner: true,
      landSize: '',
      measurementType: '',
      addtionalInfo: '',
    },
    validationSchema: Yup.object({
      propertyType: Yup.string().required('Property type is required'),
      // propertyCondition: Yup.string().required('Property Condition is required'),
      // typeOfBuilding: Yup.string().required('Property Condition is required'),
      // usageOptions: Yup.array().min(1, 'At least one usage option is required'),
      price: Yup.string().required('Price is required'),
      documents: Yup.array().min(1, 'At least one document is required'),
      landSize: Yup.string(),
      measurementType: Yup.string(),
      // noOfBedroom: Yup.string().required('Number of bedrooms is required'),
      // additionalFeatures: Yup.array()
      //   .of(Yup.string())
      //   .min(1, 'At least one additional feature is required'),
      // selectedState: Yup.string().required('State is required'),
      // selectedAddress: Yup.string().required('Address is required'),
      // selectedCity: Yup.string().required('City is required'),
      // selectedLGA: Yup.string().required('LGA is required'),
      // ownerFullName: Yup.string().required('Owner full name is required'),
      ownerPhoneNumber: Yup.string()
        // .required('Owner phone number is required')
        .test('is-valid-phone', 'Invalid phone number', (value) =>
          value ? isValidPhoneNumber(value) : false
        ),
      ownerEmail: Yup.string().email('Invalid email'),
      // .required('Owner email is required'),
    }),
    onSubmit: async (values) => {
      // No API call here, just validation
      // Optionally set a flag if needed
    },
  });

  const handleFinalSubmit = async () => {
    setAreInputsDisabled(true);
    try {
      const url = URLS.BASE + '/admin/property/new';
      const adminToken = Cookies.get("adminToken");
          if (!adminToken) {
            router.push("/admin/auth/login");
          }

      let briefType = '';
      if (selectedCard === 'sell') briefType = 'Outright Sales';
      else if (selectedCard === 'rent') briefType = 'Rent';
      else if (selectedCard === 'jv') briefType = 'Joint Venture';

      // 1. Upload images and collect URLs
      const uploadedImageUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        if (image && typeof image !== 'string') {
          // If image is a File object (not a preview URL)
          const formData = new FormData();
          formData.append('file', image as File);
          const uploadUrl = URLS.BASE + URLS.uploadImg;
          const response = await POST_REQUEST_FILE_UPLOAD(uploadUrl, formData);
          if (response?.url) {
            uploadedImageUrls.push(response.url);
          }
        } else if (typeof image === 'string' && image.startsWith('http')) {
          // Already uploaded image URL (in case of edit)
          uploadedImageUrls.push(image);
        }
      }

      const values = formik.values;
      const payload = {
        propertyType: values.propertyType,
        features: values.features,
        docOnProperty: values.documents.map((doc) => ({
          docName: doc,
          isProvided: true,
        })),
        propertyCondition: values.propertyCondition,
        location: {
          state: values.selectedState,
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
        landSize: {
          measurementType: values.measurementType,
          size: values.landSize,
        },
        briefType: briefType,
        additionalFeatures: {
          noOfBedrooms: values.noOfBedroom,
          noOfBathrooms: values.noOfBathroom,
          noOfToilets: values.noOfToilet,
          noOfCarParks: values.noOfCarPark,
        },
        typeOfBuilding: values.typeOfBuilding,
        // usageOptions: values.usageOptions,
        tenantCriteria: values.tenantCriteria,
        leaseHold: values.leaseHold,
        addtionalInfo: values.addtionalInfo,
        pictures: uploadedImageUrls,
        isPremium: isPremiumListing,
      };

      console.log(payload);

      await toast.promise(
        POST_REQUEST(url, payload, adminToken).then((response) => {
          if ((response as any).owner) {
            toast.success('Property submitted successfully');
            setIsSubmittedSuccessfully(true);
            setAreInputsDisabled(false);
            setShowSummary(false);
            setShowFinalSubmit(true);
            return 'Property submitted successfully';
          } else {
            const errorMessage = (response as any).error || 'Submission failed';
            toast.error(errorMessage);
            setAreInputsDisabled(false);
            throw new Error(errorMessage);
          }
        }),
        {
          loading: 'Submitting...',
        }
      );
    } catch (error) {
      console.error(error);
      setAreInputsDisabled(false);
    } finally {
      setAreInputsDisabled(false);
    }
  };

  const handleSummarySubmit = async () => {
    // Mark all fields as touched
    await formik.setTouched(
      Object.keys(formik.initialValues).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {} as Record<string, boolean>)
    );
    // Validate and submit
    const errors = await formik.validateForm();
    if (Object.keys(errors).length === 0) {
      await formik.submitForm();
      await handleFinalSubmit();
    }
    // If errors exist, Formik will show them
  };

  useEffect(() => {
    console.log(isLegalOwner);
  }, [isLegalOwner]);

  if (isLoading) return <Loading />;
  if (isComingSoon) return <UseIsComingPage />;

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

  return isLoading ? (
    <Loading />
  ) : (
    <Fragment>
      <section className='flex flex-col w-full md:w-[initial]'>
        {/* Search & Help Button */}
        <div className='flex justify-between items-center'>
          <div className='md:w-3/5 mt-2 h-12 flex relative items-center'>
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              size='lg'
              width={24}
              height={24}
              className='text-[#A7A9AD] absolute left-3 w-[24px] h-[24px]'
            />
            <input
              type='text'
              placeholder='Search for Agent, Briefs'
              className='w-full h-full pl-12 border border-gray-300 bg-transparent rounded-md'
            />
          </div>
          <button
            type='button'
            className='bg-black w-[30px] h-[30px] flex items-center justify-center rounded-full shadow-md'>
            {''}
            <FontAwesomeIcon
              icon={faQuestion}
              color='#fff'
              size='sm'
              className='bg-[#000] rounded-full shadow-md'
            />
          </button>
        </div>
        {isCreateBriefModalOpened ? (
          <>
            <div className='md:w-[initial] w-full flex flex-col gap-[20px] mt-8'>
              <div className='container flex flex-col justify-center items-center gap-[10px] px-[10px]'>
                <div className='w-full flex justify-start mb-5'>
                  <BreadcrumbNav
                    point='Create Brief'
                    onBack={() => setIsCreateBriefModalOpened(false)}
                    arrowIcon={arrowRightIcon}
                    backText='manage Brief'
                  />
                </div>

                {!showSummary && (
                  <>
                    <Stepper steps={steps} />
                    {currentStep === 0 && !selectedCard && (
                      <div>
                        <h2 className='text-[#0B0D0C] lg:text-[24px] lg:leading-[40.4px] font-bold font-display text-center text-[24px] leading-[40.4px] mt-7'>
                          Select type of Property
                        </h2>
                        <div className='lg:w-[953px] w-full text-xl text-[#5A5D63] font-normal text-center'>
                          Khabi-Teq helps you reach a wide network of potential
                          buyers and simplifies the property selling process.
                          Our platform ensures your property is showcased
                          effectively, connects you with verified buyers, and
                          streamlines negotiations for a smooth and successful
                          sale
                        </div>
                        <div className='lg:w-[953px] w-full flex flex-col justify-center gap-[15px] mt-[20px]'>
                          <ClickableCard
                            imageSrc={Green}
                            text='Do you have a property for sale?'
                            href='#'
                            onClick={() => {
                              setSelectedCard('sell');
                              setCurrentStep(1);
                            }}
                          />
                          <ClickableCard
                            imageSrc={Blue}
                            text='Do you have a property you for rent?'
                            href='#'
                            onClick={() => {
                              setSelectedCard('rent');
                              setCurrentStep(1);
                            }}
                          />
                          <ClickableCard
                            imageSrc={Red}
                            text='Do you have a property for joint venture?'
                            href='#'
                            onClick={() => {
                              setSelectedCard('jv');
                              setCurrentStep(1);
                            }}
                          />

                          <div className='lg:w-[953px] w-full text-xl text-[#FF3D00] font-normal text-center mt-5'>
                            Note: Only property owners are allowed to submit
                            listings. Submissions from non-owners will be
                            automatically rejected."
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Show the form only if a card is selected */}
                    {selectedCard && (
                      <form
                        onSubmit={formik.handleSubmit}
                        className='w-full lg:w-[953px] border-[#8D909680] flex flex-col mb-20'>
                        {currentStep === 1 && (
                          <div className='min-h-[629px] py-[10px] lg:px-[80px] border-[#8D909680] w-full'>
                            <h2 className='text-[#0B0D0C] lg:text-[24px] lg:leading-[40.4px] font-bold font-display text-center text-[18px] leading-[40.4px] mt-7'>
                              {' '}
                              {getFormTitle()}
                            </h2>
                            <div className='w-full min-h-[629px] flex flex-col gap-[30px]'>
                              <div className='min-h-[73px] gap-[15px] flex flex-col w-full'>
                                <h2 className='text-[20px] leading-[32px] font-medium text-[#1E1E1E]'>
                                  Property Type
                                </h2>
                                <div className='w-full gap-[20px] lg:gap-[20px] flex flex-row flex-wrap'>
                                  {(selectedCard === 'jv'
                                    ? [
                                        'Residential',
                                        'Commercial',
                                        'Mixed Development',
                                      ]
                                    : ['Residential', 'Commercial', 'Land']
                                  ).map((type) => (
                                    <div
                                      key={type}
                                      className={`border-[#8D909680] border-[1px] rounded-[2px] w-full lg:w-[200px] h-[50px] flex items-center justify-center cursor-pointer
                                                ${
                                                  formik.values.propertyType ===
                                                  type
                                                    ? 'bg-[#8DDB90] text-white font-bold border-[#8DDB90]'
                                                    : ' text-[#1E1E1E]'
                                                }`}
                                      onClick={() =>
                                        formik.setFieldValue(
                                          'propertyType',
                                          type
                                        )
                                      }>
                                      {type}
                                    </div>
                                  ))}
                                </div>
                                {formik.touched.propertyType &&
                                  formik.errors.propertyType && (
                                    <span className='text-red-600 text-sm'>
                                      {formik.errors.propertyType}
                                    </span>
                                  )}
                              </div>
                              {selectedCard === 'rent' &&
                                formik.values.propertyType !== 'Land' && (
                                  <div className='min-h-[73px] gap-[15px] flex flex-col w-full'>
                                    <h2 className='text-[20px] leading-[32px] font-medium text-[#1E1E1E]'>
                                      Property Condition
                                    </h2>
                                    <div className='w-full gap-[20px] lg:gap-[50px] flex flex-row flex-wrap'>
                                      <RadioCheck
                                        // isDisabled={formik.values?.propertyType ? true : false}
                                        selectedValue={
                                          formik.values?.propertyCondition
                                        }
                                        handleChange={() => {
                                          formik.setFieldValue(
                                            'propertyCondition',
                                            'Brand New'
                                          );
                                        }}
                                        type='radio'
                                        value='Brand New'
                                        name='propertyCondition'
                                      />
                                      <RadioCheck
                                        // isDisabled={formik.values?.propertyType ? true : false}
                                        selectedValue={
                                          formik.values?.propertyCondition
                                        }
                                        handleChange={() => {
                                          formik.setFieldValue(
                                            'propertyCondition',
                                            'Good Condition'
                                          );
                                        }}
                                        type='radio'
                                        name='propertyCondition'
                                        value='Good Condition'
                                      />
                                      <RadioCheck
                                        // isDisabled={formik.values?.propertyType ? true : false}
                                        selectedValue={
                                          formik.values?.propertyCondition
                                        }
                                        handleChange={() => {
                                          formik.setFieldValue(
                                            'propertyCondition',
                                            'Needs Renovation'
                                          );
                                        }}
                                        type='radio'
                                        name='propertyCondition'
                                        value='Needs Renovation'
                                      />
                                    </div>
                                    {formik.touched.propertyCondition &&
                                      formik.errors.propertyCondition && (
                                        <span className='text-red-600 text-sm'>
                                          {formik.errors.propertyCondition}
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
                                selectedCard === 'jv') && (
                                <div className='min-h-[127px] w-full flex flex-col gap-[15px]'>
                                  <h2 className='text-[20px] leading-[32px] font-medium text-[#1E1E1E]'>
                                    Land Size
                                  </h2>
                                  <div className='min-h-[80px] flex gap-[15px] lg:grid lg:grid-cols-2 flex-col'>
                                    <Select
                                      name='Type of Measurement'
                                      heading='measurementType'
                                      options={[
                                        'Plot',
                                        'Acres',
                                        'Square Meter',
                                      ]}
                                      formik={formik}
                                    />
                                    <Input
                                      label='Enter Land Size'
                                      name='landSize'
                                      forState={false}
                                      forLGA={false}
                                      onChange={formik.handleChange}
                                      type='number'
                                      isDisabled={areInputsDisabled}
                                    />
                                  </div>
                                  {/* {formik.touched.landSize &&
                                    formik.errors.landSize && (
                                      <span className='text-red-600 text-sm'>
                                        {formik.errors.landSize}
                                      </span>
                                    )} */}
                                </div>
                              )}
                              <div className='min-h-[50px] flex flex-col gap-[15px]'>
                                <h2 className='text-[20px] leading-[32px] font-medium text-[#1E1E1E]'>
                                  Price Details
                                </h2>
                                <div className='min-h-[80px] flex gap-[15px] lg:grid lg:grid-cols-2 flex-col'>
                                  <Input
                                    label='Price'
                                    placeholder='Enter property price'
                                    name='price'
                                    type='text'
                                    className={
                                      selectedCard === 'jv'
                                        ? 'w-full col-span-2'
                                        : 'w-full'
                                    }
                                    minNumber={0}
                                    value={formatedPrice}
                                    onChange={(e) => {
                                      const rawValue = (
                                        e.target as
                                          | HTMLInputElement
                                          | HTMLTextAreaElement
                                      ).value;
                                      setFormatedPrice(
                                        formatNumber?.(rawValue) ?? ''
                                      );
                                      formik.setFieldValue(
                                        'price',
                                        rawValue.replace(/,/g, '')
                                      );
                                    }}
                                    isDisabled={areInputsDisabled}
                                  />

                                  {selectedCard !== 'jv' && (
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
                                          e.target as
                                            | HTMLInputElement
                                            | HTMLTextAreaElement
                                        ).value;
                                        setFormatedHold(
                                          formatNumber?.(rawValue) ?? ''
                                        );
                                        formik.setFieldValue(
                                          'leaseHold',
                                          rawValue.replace(/,/g, '')
                                        );
                                      }}
                                      isDisabled={areInputsDisabled}
                                    />
                                  )}
                                </div>
                                <label
                                  htmlFor='premium_listing'
                                  className='flex gap-[5px] items-center'>
                                  <input
                                    width={24}
                                    height={24}
                                    className='w-[24px] h-[24px]'
                                    style={{
                                      accentColor: '#8DDB90',
                                    }}
                                    type='checkbox'
                                    onChange={() =>
                                      setIsPremiumListing(!isPremiumListing)
                                    }
                                    checked={isPremiumListing}
                                    name='premium_listing'
                                    id='premium_listing'
                                    title='Premium Listing'
                                  />
                                  <span className='text-lg text-[#F41515]'>
                                    Premium Listing
                                  </span>
                                </label>
                              </div>
                              {formik.values.propertyType !== 'Land' &&
                                selectedCard !== 'jv' && (
                                  <div className='min-h-[129px] gap-[15px] flex flex-col w-full'>
                                    <h2 className='text-[20px] leading-[32px] font-medium text-[#1E1E1E]'>
                                      Property Details
                                    </h2>
                                    <div className='min-h-[80px] flex gap-[15px] lg:grid lg:grid-cols-2 flex-col'>
                                      <Select
                                        label='Type of Building'
                                        name='Type of Building'
                                        heading='typeOfBuilding'
                                        allowMultiple={false}
                                        options={
                                          formik.values.propertyType ===
                                          'Residential'
                                            ? propertyReferenceData[0].options
                                            : formik.values.propertyType ===
                                              'Commercial'
                                            ? propertyReferenceData[1].options
                                            : []
                                        }
                                        formik={formik}
                                        isDisabled={areInputsDisabled}
                                      />
                                      <Select
                                        label='Number of Bedroom'
                                        name='Number of Bedroom'
                                        heading='noOfBedroom'
                                        allowMultiple={false}
                                        options={
                                          propertyReferenceData[
                                            propertyReferenceData.length - 2
                                          ].options
                                        }
                                        formik={formik}
                                        isDisabled={areInputsDisabled}
                                      />
                                    </div>
                                    <div className='min-h-[80px] flex gap-[15px] lg:grid lg:grid-cols-3 flex-col mt-2'>
                                      <Select
                                        label='Number of Bathroom'
                                        name='Number of Bathroom'
                                        heading='noOfBathroom'
                                        allowMultiple={false}
                                        options={
                                          propertyReferenceData[
                                            propertyReferenceData.length - 2
                                          ].options
                                        }
                                        formik={formik}
                                        isDisabled={areInputsDisabled}
                                      />
                                      <Select
                                        label='Number of Toilet'
                                        name='Number of Toilet'
                                        heading='noOfToilet'
                                        allowMultiple={false}
                                        options={
                                          propertyReferenceData[
                                            propertyReferenceData.length - 2
                                          ].options
                                        }
                                        formik={formik}
                                        isDisabled={areInputsDisabled}
                                      />
                                      <Select
                                        label='Number of Car Park'
                                        name='Number of Car Park'
                                        heading='noOfCarPark'
                                        allowMultiple={false}
                                        options={
                                          propertyReferenceData[
                                            propertyReferenceData.length - 2
                                          ].options
                                        }
                                        formik={formik}
                                        isDisabled={areInputsDisabled}
                                      />
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        )}
                        {currentStep === 2 && (
                          // {/* Feature & Conditions */}
                          <div className='min-h-[629px] py-[40px] lg:px-[80px] w-full'>
                            <h2 className='text-[#0B0D0C] lg:text-[24px] lg:leading-[40.4px] font-bold font-display text-center text-[18px] leading-[40.4px] mt-7'>
                              Feature & Conditions
                            </h2>
                            {selectedCard !== 'rent' && (
                              <div className='min-h-[73px] flex flex-col gap-[15px] mt-5'>
                                <h2 className='text-[20px] leading-[32px] font-medium text-[#1E1E1E]'>
                                  Document on the property
                                </h2>
                                <div className='grid lg:grid-cols-3 grid-cols-2 gap-[15px] w-full'>
                                  {DocOnPropertyData.map(
                                    (item: string, idx: number) => (
                                      <RadioCheck
                                        key={idx}
                                        type='checkbox'
                                        value={item}
                                        name='documents'
                                        handleChange={() => {
                                          const documents =
                                            formik.values.documents.includes(
                                              item
                                            )
                                              ? formik.values.documents.filter(
                                                  (doc) => doc !== item
                                                )
                                              : [
                                                  ...formik.values.documents,
                                                  item,
                                                ];
                                          formik.setFieldValue(
                                            'documents',
                                            documents
                                          );
                                        }}
                                        isDisabled={areInputsDisabled}
                                      />
                                    )
                                  )}
                                </div>
                                {formik.touched.documents &&
                                  formik.errors.documents && (
                                    <p className='text-red-500 text-sm mt-1'>
                                      {formik.errors.documents}
                                    </p>
                                  )}
                              </div>
                            )}
                            {selectedCard === 'jv' && (
                              <div className='min-h-[73px] flex flex-col gap-[15px] mt-5'>
                                <h2 className='text-[20px] leading-[32px] font-medium text-[#1E1E1E]'>
                                  Condition
                                </h2>
                                <div className='grid lg:grid-cols-3 grid-cols-1 gap-[15px] w-full'>
                                  {JvConditionData.map(
                                    (item: string, idx: number) => (
                                      <RadioCheck
                                        key={idx}
                                        type='checkbox'
                                        value={item}
                                        name='jvConditions'
                                        handleChange={() => {
                                          const jvConditions =
                                            formik.values.jvConditions.includes(
                                              item
                                            )
                                              ? formik.values.jvConditions.filter(
                                                  (doc) => doc !== item
                                                )
                                              : [
                                                  ...formik.values.jvConditions,
                                                  item,
                                                ];
                                          formik.setFieldValue(
                                            'jvConditions',
                                            jvConditions
                                          );
                                        }}
                                        isDisabled={areInputsDisabled}
                                      />
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                            {selectedCard !== 'jv' && (
                              <div className='min-h-[73px] flex flex-col gap-[15px] mt-5'>
                                <h2 className='text-[20px] leading-[32px] font-medium text-[#1E1E1E]'>
                                  Features
                                </h2>
                                <div className='grid lg:grid-cols-3 grid-cols-2 gap-[15px] w-full'>
                                  {featuresData.map(
                                    (item: string, idx: number) => (
                                      <RadioCheck
                                        key={idx}
                                        type='checkbox'
                                        value={item}
                                        name='features'
                                        handleChange={() => {
                                          const features =
                                            formik.values.features.includes(
                                              item
                                            )
                                              ? formik.values.features.filter(
                                                  (doc) => doc !== item
                                                )
                                              : [
                                                  ...formik.values.features,
                                                  item,
                                                ];
                                          formik.setFieldValue(
                                            'features',
                                            features
                                          );
                                        }}
                                        isDisabled={areInputsDisabled}
                                      />
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                            {selectedCard === 'rent' && (
                              <div className='min-h-[73px] flex flex-col gap-[15px] mt-8'>
                                <h2 className='text-[20px] leading-[32px] font-medium text-[#1E1E1E]'>
                                  Tenant Criteria
                                </h2>
                                <div className='grid lg:grid-cols-3 grid-cols-2 gap-[15px] w-full'>
                                  {tenantCriteriaData.map(
                                    (item: string, idx: number) => (
                                      <RadioCheck
                                        key={idx}
                                        type='checkbox'
                                        value={item}
                                        name='tenantCriteria'
                                        handleChange={() => {
                                          const tenantCriteria =
                                            formik.values.tenantCriteria.includes(
                                              item
                                            )
                                              ? formik.values.tenantCriteria.filter(
                                                  (doc) => doc !== item
                                                )
                                              : [
                                                  ...formik.values
                                                    .tenantCriteria,
                                                  item,
                                                ];
                                          formik.setFieldValue(
                                            'tenantCriteria',
                                            tenantCriteria
                                          );
                                        }}
                                        isDisabled={areInputsDisabled}
                                      />
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                            <div className='min-h-[73px] flex flex-col gap-[15px] mt-8'>
                              <Input
                                label='Addition information'
                                name='addtionalInfo'
                                type='textArea'
                                className='w-full'
                                multiline={true}
                                rows={3}
                                placeholder='Enter any additional information'
                                // value={formik.values?.numberOfFloors}
                                onChange={formik.handleChange}
                                isDisabled={areInputsDisabled}
                              />
                            </div>
                          </div>
                        )}

                        {currentStep === 3 && (
                          <div>
                            <h2 className='text-[#0B0D0C] lg:text-[24px] lg:leading-[40.4px] font-bold font-display text-center text-[24px] leading-[40.4px] mt-7'>
                              Upload property Picture
                            </h2>
                            <div className='lg:w-[953px] w-full text-xl text-[#5A5D63] font-normal text-center mt-2'>
                              Note: Please upload high-quality images of your
                              property. The photos must be clear, well-lit, and
                              should fully capture the key areas of the
                              property. Submissions with poor or incomplete
                              images may be{' '}
                              <span className='text-red-500'>rejected</span>."
                            </div>
                            <div className='lg:w-[953px] w-full flex flex-col justify-center gap-[15px]  my-10'>
                              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[25px]'>
                                {Array.from({ length: imageCardCount }).map(
                                  (_, idx) => (
                                    <label
                                      key={idx}
                                      htmlFor={`property-image-${idx}`}
                                      className='h-[166px] border-[1px] border-dashed border-[#5A5D63] flex items-center justify-center relative'
                                      style={{ position: 'relative' }}>
                                      {/* Upload text at the top */}
                                      {/* {idx < 4 && (
                                        <span
                                          className='absolute top-2 text-sm font-semibold'
                                          style={{
                                            color:
                                              idx < 2 ? '#1976D2' : '#FF2539',
                                          }}>
                                          {idx < 2
                                            ? 'Upload Exterior Image'
                                            : 'Upload Interior Image'}
                                        </span>
                                      )} */}
                                      {/* Hidden file input */}
                                      <input
                                        id={`property-image-${idx}`}
                                        type='file'
                                        accept='image/png, image/jpeg'
                                        className='hidden'
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const url =
                                              URL.createObjectURL(file);
                                            setImages((prev) => {
                                              const updated = [...prev];
                                              updated[idx] = file;
                                              return updated;
                                            });
                                          }
                                        }}
                                      />
                                      {images[idx] ? (
                                        <div className='w-full h-full'>
                                          <img
                                            src={
                                              images[idx]
                                                ? images[idx] instanceof File
                                                  ? URL.createObjectURL(
                                                      images[idx] as File
                                                    )
                                                  : (images[idx] as string)
                                                : ''
                                            }
                                            alt='Preview'
                                            className='w-full h-full object-cover rounded'
                                            style={{
                                              position: 'absolute',
                                              inset: 0,
                                            }}
                                          />
                                          <button
                                            type='button'
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              e.preventDefault();
                                              setImages((prev) => {
                                                const updated = [...prev];
                                                updated[idx] = null;
                                                return updated;
                                              });
                                            }}
                                            className='absolute top-2 right-2 z-20 flex items-center justify-center w-8 h-8  bg-white shadow hover:bg-gray-100'
                                            style={{
                                              border: 'none',
                                              padding: 0,
                                            }}
                                            title='Delete image'>
                                            {/* Trash icon (SVG) */}
                                            <svg
                                              width='20'
                                              height='20'
                                              viewBox='0 0 24 24'
                                              fill='none'>
                                              <path
                                                d='M6 7h12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h12z'
                                                stroke='#ef4444'
                                                strokeWidth='2'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                              />
                                              <path
                                                d='M10 11v6M14 11v6'
                                                stroke='#ef4444'
                                                strokeWidth='2'
                                                strokeLinecap='round'
                                              />
                                            </svg>
                                          </button>
                                        </div>
                                      ) : (
                                        <div className='flex flex-col items-center justify-center'>
                                          <span className='flex items-center justify-center w-12 h-12 rounded-full bg-white border mb-2 cursor-pointer'>
                                            <svg
                                              width='28'
                                              height='28'
                                              viewBox='0 0 24 24'
                                              fill='none'>
                                              <path
                                                d='M12 5v14M5 12h14'
                                                stroke='#22c55e'
                                                strokeWidth='2.5'
                                                strokeLinecap='round'
                                              />
                                            </svg>
                                          </span>
                                          <span
                                            title='Click to add images'
                                            className='text-sm text-black cursor-pointer font-medium'>
                                            Format: png, jpeg
                                          </span>
                                        </div>
                                      )}
                                    </label>
                                  )
                                )}
                              </div>
                              {/* Add More Button */}
                              <button
                                type='button'
                                onClick={() =>
                                  setImageCardCount((prev) => prev + 1)
                                }
                                className='flex items-center gap-2 mt-6 px-6 py-3 rounded text-[#515B6F] font-semibold hover:bg-[#8DDB90] transition w-max mx-auto border-[1px] border-dashed border-[#5A5D63]'>
                                <svg
                                  width='20'
                                  height='20'
                                  viewBox='0 0 24 24'
                                  fill='none'>
                                  <path
                                    d='M12 5v14M5 12h14'
                                    stroke='#515B6F'
                                    strokeWidth='2.5'
                                    strokeLinecap='round'
                                  />
                                </svg>
                                Add More
                              </button>
                            </div>
                          </div>
                        )}

                        {currentStep === 4 && (
                          // {/* Ownership Declaration */}
                          <div className='w-full min-h-[348px] flex flex-col gap-[20px] py-[40px] lg:px-[80px]'>
                            <h3 className='text-[#1E1E1E] text-[18px] leading-[38.4px] font-semibold'>
                              Ownership Declaration
                            </h3>
                            <div className='w-full flex flex-col gap-[15px] min-h-[270px] '>
                              <RadioCheck
                                name='confirm'
                                type='checkbox'
                                // onClick={() => {
                                //   setIsLegalOwner(!isLegalOwner);
                                // }}
                                isChecked={isLegalOwner}
                                handleChange={() =>
                                  setIsLegalOwner(!isLegalOwner)
                                }
                                isDisabled={areInputsDisabled}
                                value='I confirm that I am the legal owner of this property or authorized to submit this brief'
                              />
                              {commission['userType'] === 'agent' ? (
                                <RadioCheck
                                  name='confirm'
                                  type='checkbox'
                                  // onClick={() => {
                                  //   setIsLegalOwner(!isLegalOwner);
                                  // }}
                                  isChecked={isAuthorized}
                                  handleChange={() =>
                                    setIsAuthorized(!isAuthorized)
                                  }
                                  isDisabled={areInputsDisabled}
                                  value='I confirm that I am authorized to list the property'
                                />
                              ) : null}
                              <div className='flex lg:flex-row flex-col w-full gap-[15px]'>
                                <Input
                                  label='Full name'
                                  name='ownerFullName'
                                  value={formik.values?.ownerFullName}
                                  onChange={formik.handleChange}
                                  className='lg:w-1/2 w-full'
                                  type='text'
                                />
                                <div className='flex flex-col gap-2'>
                                  <label className='block text-sm font-medium'>
                                    Phone Number
                                  </label>
                                  <PhoneInput
                                    international
                                    defaultCountry='NG'
                                    disabled={!isLegalOwner}
                                    value={formik.values?.ownerPhoneNumber}
                                    style={{ outline: 'none', width: '100%' }}
                                    onChange={(value) =>
                                      formik.setFieldValue(
                                        'ownerPhoneNumber',
                                        value
                                      )
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
                                className='w-full'
                                value={formik.values.ownerEmail}
                                onChange={formik.handleChange}
                                type='email'
                              />
                              <p className='text-[#1976D2] font-["Roboto"] font-medium text-[18px] leading-[160%] mt-4'>
                                I hereby agree to indemnify and hold harmless Khabi-Teq Realty, its affiliates, directors, and agents from and against any and all claims, losses, liabilities, or damages arising from or related to any transaction conducted by me on its platform
                              </p>
                            </div>
                          </div>
                        )}

                        <div className='w-full flex items-center mt-8 gap-5 justify-between lg:px-[80px]'>
                          <Button
                            value='Cancel'
                            // isDisabled={!isLegalOwner}
                            type='button'
                            onClick={() => {
                              if (currentStep === 1) {
                                setSelectedCard('');
                                setCurrentStep(0);
                              } else {
                                setCurrentStep((prev) => Math.max(prev - 1, 0));
                              }
                            }}
                            className={`border-[1px] border-black lg:w-[25%] text-black text-base leading-[25.6px] font-bold min-h-[50px] py-[12px] px-[24px] disabled:cursor-not-allowed`}
                          />
                          <Button
                            value='Next'
                            type={
                              currentStep === steps.length - 1
                                ? 'submit'
                                : 'button'
                            }
                            onClick={async () => {
                              const errors = await formik.validateForm();
                              // Only check errors for fields relevant to the current step
                              const fieldsToCheck =
                                stepRequiredFields[currentStep] || [];
                              const hasStepError = fieldsToCheck.some(
                                (field) =>
                                  !!errors[field as keyof typeof formik.values]
                              );
                              if (hasStepError) {
                                // Mark those fields as touched
                                formik.setTouched(
                                  fieldsToCheck.reduce(
                                    (acc, field) => ({ ...acc, [field]: true }),
                                    {}
                                  )
                                );
                                return;
                              }
                              if (currentStep < steps.length - 1) {
                                setCurrentStep((prev) => prev + 1);
                              } else if (currentStep === steps.length - 1) {
                                setShowCommissionModal(true);
                              }
                            }}
                            className={`bg-[#8DDB90] lg:w-[25%] text-white text-base leading-[25.6px] font-bold min-h-[50px] py-[12px] px-[24px] disabled:cursor-not-allowed disabled:bg-[#D3D3D3]`}
                            isDisabled={
                              (currentStep === 4 && !isLegalOwner) ||
                              (currentStep === 4 &&
                                commission['userType'] === 'agent' &&
                                !isAuthorized) ||
                              (currentStep === 4 &&
                                !!formik.errors.ownerPhoneNumber) ||
                              (stepRequiredFields[currentStep] || []).some(
                                (field) =>
                                  !!formik.errors[
                                    field as keyof typeof formik.values
                                  ]
                              )
                            }
                          />
                        </div>
                      </form>
                    )}
                  </>
                )}

                {showSummary && (
                  <PropertySummary
                    values={formik.values}
                    images={images.map((img) =>
                      img instanceof File ? URL.createObjectURL(img) : img
                    )}
                    onEdit={() => setShowSummary(false)}
                    onSubmit={handleSummarySubmit}
                  />
                )}

                {showFinalSubmit && <Submit href='/admin' />}

                {showCommissionModal && (
                  <CommissionModal
                    open={showCommissionModal}
                    onClose={() => setShowCommissionModal(false)}
                    onAccept={() => {
                      setShowCommissionModal(false);
                      setShowSummary(true);
                      // handle accept logic here
                    }}
                    commission={commission.commission}
                    userName={user?.firstName + ' ' + user?.lastName}
                  />
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Dashboard Header */}
            <div className='flex md:flex-row flex-col justify-between mt-6 md:mr-6 w-full md:w-[initial] gap-2 md:gap-0'>
              <div className='flex flex-col gap-1 md:gap-0'>
                <h2
                  className={`text-3xl font-bold text-[#2E2C34] ${archivo.className}`}>
                  Briefs Management
                </h2>
                <p className={`text-sm text-[#84818A] ${archivo.className}`}>
                  Showing your Account metrics from{' '}
                  <span>31st Mar, 2025 to {currentDate}</span>
                </p>
              </div>
              <div className='flex gap-[20px]'>
                {/**Button */}
                <button
                  onClick={() =>
                    setIsCreateBriefModalOpened(!isCreateBriefModalOpened)
                  }
                  className={`w-[189px] gap-[19px] flex justify-center items-center bg-[#8DDB90] hover:bg-[#2a542b] transition-all duration-200 h-[50px] text-base font-medium ${archivo.className} text-white`}
                  type='button'
                  title='Create brief'>
                  Create brief
                </button>
                <div className='flex h-[48px] w-fit md:w-[initial] items-center bg-white px-4 rounded-lg'>
                  <div className='text-[#84818A] flex items-center text-sm'>
                    Show stats:
                    <ReactSelect
                      className='text-[#2E2C34] text-sm ml-1'
                      styles={{
                        control: (styles: any) => ({
                          ...styles,
                          border: 'none',
                          boxShadow: 'none',
                          cursor: 'pointer',
                          outline: 'none',
                        }),
                      }}
                      options={statsOptions}
                      defaultValue={statsOptions}
                      value={dateFormik.values.selectedStat}
                      onChange={(options) => {
                        formik.setFieldValue('selectedStat', options);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className='flex overflow-x-auto hide-scrollbar gap-[30px] w-full mt-6'>
              {data.map((item: BoxNotificationProps, index: number) => (
                <BoxNotification key={index} {...item} />
              ))}
            </div>
            <div className='w-full'>
              {briefSelected && renderDynamicTableContent()}
            </div>

            {isCreateBriefModalOpened && (
              <CreateBrief closeModal={setIsCreateBriefModalOpened} />
            )}
          </>
        )}
      </section>
    </Fragment>
  );
}

const statsOptions = [
  { value: 'Today', label: 'Today' },
  { value: 'Yesterday', label: 'Yesterday' },
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Yearly', label: 'Yearly' },
];

type BoxNotificationProps = {
  type: 'initial' | 'banned' | 'flagged' | 'active';
  name: string;
  total: number;
};

const BoxNotification: React.FC<BoxNotificationProps> = ({
  name,
  total,
  type,
}) => {
  const getTypeClass = (type: string) => {
    switch (type) {
      case 'initial':
        return 'text-[#181336]';
      case 'banned':
        return 'text-[#F41515]';
      case 'flagged':
        return 'text-[#181336]';
      case 'active':
        return 'text-[#0B423D]';
      default:
        return 'text-[#2E2C34]';
    }
  };
  return (
    <div className='h-[127px] shrink-0 flex flex-col rounded-[4px] gap-[35px] py-[23px] px-[25px] w-[259.5px] bg-[#FFFFFF] border-[#E4DFDF] border-[1px]'>
      <h3
        className={`${getTypeClass(type)} text-base ${
          archivo.className
        } font-bold`}>
        {name}
      </h3>
      <h2
        className={`text-[#181336] font-semibold text-3xl ${archivo.className}`}>
        {Number(total).toLocaleString()}
      </h2>
    </div>
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
      className='min-h-[80px] w-full flex flex-col gap-[4px]'>
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
        onBlur={formik?.handleBlur}
        value={formik?.values[heading]?.label}
        options={opts}
        className={`w-full`}
        styles={customStyles}
        placeholder='Select'
      />
    </label>
  );
};

const UseIsComingPage = () => {
  return (
    <div className='w-full flex justify-center items-center'>
      <div className='container min-h-[600px] flex flex-col justify-center items-center gap-[20px] px-4 md:px-8'>
        <div className='lg:w-[654px] flex flex-col justify-center items-center gap-[20px] w-full'>
          <div className='w-full flex justify-center'>
            <Image
              src={comingSoon}
              width={400}
              height={50}
              alt='Coming Soon Icon'
              className='w-full max-w-[400px] h-auto'
            />
          </div>
          <div className='flex flex-col justify-center items-center gap-[10px]'>
            <p
              className={`text-4xl md:text-2xl font-bold text-center text-[#5A5D63] leading-[160%] tracking-[5%] ${epilogue.className}`}>
              We are working hard to bring you an amazing experience. Stay tuned
              for updates!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
