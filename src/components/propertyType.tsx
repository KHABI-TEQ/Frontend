/** @format */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import AttachFile from '@/components/attach_file';
import Button from '@/components/button';
import Input from '@/components/Input';
import RadioCheck from '@/components/radioCheck';
import { toast } from 'react-hot-toast';
// import { useRouter } from 'next/navigation';
import { POST_REQUEST } from '@/utils/requests';
import { URLS } from '@/utils/URLS';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useUserContext } from '@/context/user-context';
import { useEffect, useState } from 'react';
import naijaStates from 'naija-state-local-government';
import { propertyReferenceData } from '@/data/buy_page_data';
// import Cookies from 'js-cookie';
import ReactSelect from 'react-select';

interface Option {
  value: string;
  label: string;
}
const PropertyType = () => {
  const { user } = useUserContext();
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
    console.log(formik.values);
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
    'Survey Document',
    'Deed of Assignment',
    'Receipt',
    'C of O',
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
      selectedCity: '',
      selectedLGA: '',
      ownerFullName: user?.firstName + ' ' + user?.lastName,
      ownerPhoneNumber: user?.phoneNumber,
      ownerEmail: user?.email,
      areYouTheOwner: false,
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
      selectedCity: Yup.string().required('City is required'),
      selectedLGA: Yup.string().required('LGA is required'),
      ownerFullName: Yup.string().required('Owner full name is required'),
      ownerPhoneNumber: Yup.string().required('Owner phone number is required'),
      ownerEmail: Yup.string()
        .email('Invalid email')
        .required('Owner email is required'),
    }),
    onSubmit: async (values) => {
      console.log(values);
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

        // console.log('Payload:', payload);

        await toast.promise(
          POST_REQUEST(url, payload).then((response) => {
            if ((response as any).owner) {
              toast.success('Brief submitted successfully');
              // router.push('/success');
              return 'Brief submitted successfully';
            } else {
              const errorMessage =
                (response as any).error || 'Submission failed';
              toast.error(errorMessage);
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
        // toast.error('An error occurred, please try again');
      }
    },
  });

  return (
    <form
      onSubmit={formik.handleSubmit}
      className='lg:w-[805px] bg-white p-[20px] lg:py-[50px] lg:px-[100px] w-full min-h-[797px] gap-[30px] md:px-[30px] mt-[30px] lg:mt-[60px]'>
      <div className='flex flex-col gap-[35px] w-full'>
        {/** Display Formik validation errors for owner's information */}
        <div className='w-full flex flex-col gap-[15px]'>
          {formik.errors.ownerFullName && (
            <span className='text-red-600 text-sm'>
              {formik.errors.ownerFullName}
            </span>
          )}
          {formik.errors.ownerPhoneNumber && (
            <span className='text-red-600 text-sm'>
              {formik.errors.ownerPhoneNumber}
            </span>
          )}
          {formik.errors.ownerEmail && (
            <span className='text-red-600 text-sm'>
              {formik.errors.ownerEmail}
            </span>
          )}
        </div>
        {/**Property Type */}
        <div className='lg:w-[535px] min-h-[73px] flex flex-col gap-[15px]'>
          <h2 className='text-[20px] leading-[32px] font-medium text-[#1E1E1E]'>
            Property Type
          </h2>
          {/**options */}
          <div className='min-h-[26px] w-full flex flex-wrap gap-[20px] lg:gap-[50px]'>
            <RadioCheck
              // isDisabled={formik.values?.propertyType ? true : false}
              selectedValue={formik.values?.propertyType}
              handleChange={() => {
                formik.setFieldValue('propertyType', 'Residential');
              }}
              type='radio'
              name='propertyType'
              value='Residential'
            />
            <RadioCheck
              // isDisabled={formik.values?.propertyType ? true : false}
              selectedValue={formik.values?.propertyType}
              handleChange={() => {
                formik.setFieldValue('propertyType', 'Commercial');
              }}
              type='radio'
              name='propertyType'
              value='Commercial'
            />
            <RadioCheck
              // isDisabled={formik.values?.propertyType ? true : false}
              selectedValue={formik.values?.propertyType}
              handleChange={() => {
                formik.setFieldValue('propertyType', 'Land');
              }}
              type='radio'
              name='propertyType'
              value='Land'
            />
          </div>
          {formik.touched.propertyType && formik.errors.propertyType && (
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
          <div className='flex flex-wrap gap-[30px]'>
            {['All', 'Lease', 'Joint Venture', 'Outright Sale'].map(
              (item: string, idx: number) => (
                <RadioCheck
                  type='checkbox'
                  value={item}
                  key={idx}
                  name='Usage Options'
                  handleChange={() => {
                    const usageOptions = formik.values.usageOptions.includes(
                      item
                    )
                      ? formik.values.usageOptions.filter(
                          (option) => option !== item
                        )
                      : [...formik.values.usageOptions, item];
                    formik.setFieldValue('usageOptions', usageOptions);
                  }}
                />
              )
            )}
          </div>
          {formik.touched.usageOptions && formik.errors.usageOptions && (
            <span className='text-red-600 text-sm'>
              {formik.errors.usageOptions}
            </span>
          )}
        </div>
        {/**Location */}
        <div className='w-full min-h-[73px] flex flex-col gap-[15px]'>
          <h2 className='text-[20px] leading-[32px] font-medium text-[#1E1E1E]'>
            Location
          </h2>
          {/**inputs */}
          <div className='min-h-[26px] w-full flex flex-col flex-wrap lg:grid lg:grid-cols-3 gap-[15px]'>
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
            /> */}
            {/* <Input name='Local Government' type='text' /> */}
            {/* <Input
              label='Local Government'
              name='selectedLGA'
              type='text'
              value={formik.values.selectedLGA}
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
              // isDisabled={areInputsDisabled}
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
              // isDisabled={areInputsDisabled}
            />
            <Input
              label='City'
              name='selectedCity'
              value={formik.values.selectedCity}
              onChange={formik.handleChange}
              type='text'
            />
          </div>
          {formik.touched.selectedState && formik.errors.selectedState && (
            <span className='text-red-600 text-sm'>
              {formik.errors.selectedState}
            </span>
          )}
          {formik.touched.selectedCity && formik.errors.selectedCity && (
            <span className='text-red-600 text-sm'>
              {formik.errors.selectedCity}
            </span>
          )}
        </div>
        {/**Price */}
        <div className='w-full min-h-[73px] flex flex-col gap-[15px]'>
          <h2 className='text-[20px] leading-[32px] font-medium text-[#1E1E1E]'>
            Price
          </h2>
          {/**input */}
          <div className='min-h-[26px] w-full flex gap-[50px]'>
            <Input
              label='Price'
              placeholder='Enter property price'
              name='price'
              type='number'
              className='w-full'
              value={formik.values?.price}
              onChange={formik.handleChange}
            />
          </div>
          {formik.touched.price && formik.errors.price && (
            <span className='text-red-600 text-sm'>{formik.errors.price}</span>
          )}
        </div>
        {/**Document on the property */}
        <div className='w-full min-h-[73px] flex flex-col gap-[15px]'>
          <h2 className='text-[20px] leading-[32px] font-medium text-[#1E1E1E]'>
            Document on the property
          </h2>
          {/**options */}
          <div className='min-h-[26px] w-full flex flex-wrap gap-[30px]'>
            {docOfTheProperty.map((item: string, idx: number) => (
              <RadioCheck
                type='checkbox'
                key={idx}
                value={item}
                name='documents'
                handleChange={() => {
                  const documents = formik.values.documents.includes(item)
                    ? formik.values.documents.filter((doc) => doc !== item)
                    : [...formik.values.documents, item];
                  formik.setFieldValue('documents', documents);
                }}
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
        <div className='w-full min-h-[73px] flex flex-col gap-[15px]'>
          <h2 className='text-[20px] leading-[32px] font-medium text-[#1E1E1E]'>
            Property Features
          </h2>
          {/**options */}
          <div className='min-h-[26px] w-full flex gap-[15px]'>
            <Input
              label='Number of Bedrooms'
              name='noOfBedroom'
              type='number'
              className='lg:w-1/2 w-full'
              // isDisabled={formik.values?.noOfBedroom ? true : false}
              value={formik.values?.noOfBedroom}
              onChange={formik.handleChange}
            />
            {/* <Input
              label='Additional Features'
              name='additionalFeatures'
              type='text'
              className='lg:w-1/2 w-full'
              value={formik.values?.additionalFeatures.join(', ')}
              onChange={(e) => {
                const features = e.target.value
                  .split(',')
                  .map((feature) => feature.trim());
                formik.setFieldValue('additionalFeatures', features);
              }}
            /> */}
            <Select
              allowMultiple={true}
              heading={'additionalFeatures'}
              formik={formik}
              name={propertyReferenceData[6].heading}
              options={propertyReferenceData[6].options}
              placeholder='Select'
            />
          </div>
          <div className='w-full flex flex-col'>
            <h3 className='text-[#1E1E1E] text-[19.67] font-medium'>
              Are you a mandate on this property
            </h3>
            <div className='flex gap-[20px]'>
              <RadioCheck
                selectedValue={formik.values?.areYouTheOwner}
                handleChange={() => {
                  formik.setFieldValue('areYouTheOwner', true);
                }}
                type='radio'
                name='mandate'
                value='Yes'
              />
              <RadioCheck
                selectedValue={formik.values?.areYouTheOwner}
                handleChange={() => {
                  formik.setFieldValue('areYouTheOwner', false);
                }}
                type='radio'
                name='mandate'
                value='No'
              />
            </div>
          </div>
          <div className='w-full flex gap-[15px]'>
            {formik.touched.noOfBedroom && formik.errors.noOfBedroom && (
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
        </div>
        {/**Upload Image | Documents */}
        <AttachFile heading='Upload image(optional)' />

        {/**Button */}
        <div className='min-h-[50px] w-full flex justify-end items-center'>
          <Button
            value='Submit Brief'
            type='submit'
            className='min-h-[50px] w-full lg:w-[256px] py-[12px] px-[24px] bg-[#8DDB90] text-[#FAFAFA] text-base leading-[25.6px] font-bold'
          />
        </div>
      </div>
    </form>
  );
};

export default PropertyType;

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
