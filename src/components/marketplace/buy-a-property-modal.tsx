/** @format */

'use client';
import { useFormik } from 'formik';
import { Fragment, useEffect, useState } from 'react';
import SelectStateLGA from './select-state-lga';
import Input from '../general-components/Input';
import PriceRange from './price-range';
import BedroomComponent from './bedroom';
import MoreFilter from './more-filter';
import DocumentTypeComponent from './document-type';
import React from 'react';
import RadioCheck from '../general-components/radioCheck';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import SubmitPrefrenceModal from '../can-not-find-brief-modal';
import { AnimatePresence, motion } from 'framer-motion';
import ContactInformation from './contact-information';

type PayloadProps = {
  twoDifferentInspectionAreas: boolean;
  initialAmount: number;
  toBeIncreaseBy: number;
};

const BuyAPropertySearchModal = ({
  selectedBriefs,
  className = '',
  style = {},
  usageOptions,
  setUsageOptions,
  setAddInspectionModal,
  addForInspectionPayload,
  setSelectedBriefs,
  inspectionType,
  setInspectionType,
  onSearch,
  searchStatus,
}: {
  selectedBriefs: number;
  className?: string;
  style?: React.CSSProperties;
  usageOptions: string[];
  setUsageOptions: (type: string[]) => void;
  setAddInspectionModal?: (type: boolean) => void;
  addForInspectionPayload: PayloadProps;
  setSelectedBriefs: React.Dispatch<React.SetStateAction<Set<any>>>;
  inspectionType: 'Buy' | 'JV' | 'Rent/Lease';
  setInspectionType: (type: 'Buy' | 'JV' | 'Rent/Lease') => void;
  onSearch: (payload: any) => void;
  searchStatus: {
    status: 'pending' | 'success' | 'failed' | 'idle';
    couldNotFindAProperty: boolean;
  };
}) => {
  const formik = useFormik({
    initialValues: {
      selectedLGA: '',
      selectedState: '',
    },
    onSubmit: (values) => {
      // console.log(values);
    },
  });
  const router = useRouter();
  const [isContactInformationModalOpened, setIsContactInformationModalOpened] =
    useState<boolean>(false);
  const [isPriceRangeModalOpened, setIsPriceRangeModalOpened] =
    useState<boolean>(false);
  const [priceRadioValue, setPriceRadioValue] = useState<string>('');
  const [isDocumentModalOpened, setIsDocumentModalOpened] =
    useState<boolean>(false);
  const [documentsSelected, setDocumentsSelected] = useState<string[]>([]);
  const [isBedroomModalOpened, setIsBedroomModalOpened] =
    useState<boolean>(false);
  const [noOfBedrooms, setNoOfBedrooms] = useState<number | undefined>(
    undefined
  );
  const [isMoreFilterModalOpened, setIsMoreFilterModalOpened] =
    useState<boolean>(false);
  const [filters, setFilters] = useState<{
    bathroom: number | undefined | string;
    landSize: {
      type: string;
      size: undefined | number;
    };
    desirer_features: string[];
  }>({
    bathroom: undefined,
    landSize: {
      type: 'plot',
      size: undefined,
    },
    desirer_features: [],
  });

  const priceFormik = useFormik({
    initialValues: {
      minPrice: 0,
      maxPrice: 0,
    },
    onSubmit: (values) => {
      // console.log(values);
    },
  });

  const locationValue = [formik.values.selectedLGA, formik.values.selectedState]
    .filter(Boolean)
    .join(', ')
    .trim();

  const parsePriceRange = (priceString: string) => {
    if (!priceString || priceString.trim() === '') return null;
    
    // Handle radio button values like "500k - 1million", "2million - 4million", etc.
    if (priceString.includes(' - ')) {
      const [minStr, maxStr] = priceString.split(' - ');
      
      const parsePrice = (str: string) => {
        const cleanStr = str.toLowerCase().trim();
        
        if (cleanStr.includes('million')) {
          const num = parseFloat(cleanStr.replace(/[^0-9.]/g, ''));
          return num * 1000000;
        } else if (cleanStr.includes('k')) {
          const num = parseFloat(cleanStr.replace(/[^0-9.]/g, ''));
          return num * 1000;
        } else if (cleanStr === 'above' || cleanStr.includes('above')) {
          return Number.MAX_SAFE_INTEGER;
        } else {
          const num = parseFloat(cleanStr.replace(/[^0-9.]/g, ''));
          return isNaN(num) ? 0 : num;
        }
      };
      
      const minPrice = parsePrice(minStr);
      const maxPrice = maxStr.includes('above') ? Number.MAX_SAFE_INTEGER : parsePrice(maxStr);
      
      return {
        $gte: minPrice,
        $lte: maxPrice
      };
    }
    
    return null;
  };

  const formatPriceDisplay = (priceString: string, priceFormik: any) => {
    if (priceString !== '') {
      return priceString;
    }
    
    const minPrice = priceFormik.values.minPrice;
    const maxPrice = priceFormik.values.maxPrice;
    
    if (minPrice === 0 && maxPrice === 0) {
      return ''; // Show placeholder
    }
    
    const formatNumber = (num: number) => {
      if (num === 0) return '0';
      return num.toLocaleString();
    };
    
    if (minPrice > 0 && maxPrice > 0) {
      return `₦${formatNumber(minPrice)} - ₦${formatNumber(maxPrice)}`;
    } else if (minPrice > 0) {
      return `₦${formatNumber(minPrice)} and above`;
    } else if (maxPrice > 0) {
      return `Up to ₦${formatNumber(maxPrice)}`;
    }
    
    return '';
  };

  const buildPriceQuery = (priceString: string, priceFormik: any) => {
    // First check if radio value is selected
    if (priceString && priceString.trim() !== '') {
      const parsed = parsePriceRange(priceString);
      if (parsed) {
        return parsed;
      }
    }
    
    // Then check manual input values
    const minPrice = Number(priceFormik.values.minPrice) || 0;
    const maxPrice = Number(priceFormik.values.maxPrice) || 0;
    
    if (minPrice > 0 || maxPrice > 0) {
      const query: any = {};
      
      if (minPrice > 0) {
        query.$gte = minPrice;
      }
      
      if (maxPrice > 0) {
        query.$lte = maxPrice;
      }
      
      // Only return the query if we have at least one valid price bound
      return Object.keys(query).length > 0 ? query : undefined;
    }
    
    return undefined;
  };

  const payload = {
    usageOptions,
    location: locationValue !== '' ? locationValue : undefined,
    price: buildPriceQuery(priceRadioValue, priceFormik),
    docsOnProperty: documentsSelected,
    bedroom: noOfBedrooms,
    bathroom: filters.bathroom,
    landSize:
      filters.landSize && filters.landSize.size ? filters.landSize : undefined,
    desirerFeatures: filters.desirer_features,
    briefType: 'Outright Sales',
  };

  // Add debugging useEffect
  useEffect(() => {
    const priceQuery = buildPriceQuery(priceRadioValue, priceFormik);
    console.log('Price Query:', priceQuery);
    console.log('Radio Value:', priceRadioValue);
    console.log('Manual Input:', priceFormik.values);
  }, [priceRadioValue, priceFormik.values]);

  const cleanedPayload = Object.fromEntries(
    Object.entries(payload).filter(
      ([_, v]) =>
        v !== undefined &&
        v !== '' &&
        !(Array.isArray(v) && v.length === 0) &&
        !(
          typeof v === 'object' &&
          v !== null &&
          !Array.isArray(v) &&
          Object.keys(v).length === 0
        )
    )
  );

  const [isSearchButtonClicked, setIsSearchButtonClicked] =
    useState<boolean>(false);

  //applying other values of payload to the formik values only, not using cleanedPayload
  //mimicking the formik values to another useFormik hook so it can be passed
  const formikToPass = useFormik({
    initialValues: {
      ...cleanedPayload,
      prices: priceFormik.values,
      prices2: priceRadioValue,
    },
    onSubmit: () => {},
  });

  useEffect(() => {
    formikToPass.setValues({
      ...cleanedPayload,
      prices: priceFormik.values,
      prices2: priceRadioValue,
    });
  }, [
    priceFormik.values,
    formik.values,
    priceRadioValue,
    documentsSelected,
    filters,
    noOfBedrooms,
    usageOptions,
    locationValue,
  ]);

  // useEffect(
  //   () => handleSubmit(),
  //   [priceRadioValue, formik.values, priceFormik.values, documentsSelected]
  // );

  const docsValues = documentsSelected.map((item: string) => item);
  return (
    <Fragment>
      <form
        onSubmit={formik.handleSubmit}
        className='container min-h-[181px] hidden md:flex flex-col gap-[25px] py-[25px] px-[30px] bg-[#FFFFFF] sticky top-0 z-20'>
        <div className='w-full pb-[10px] flex flex-wrap justify-between items-center gap-[20px] border-b-[1px] border-[#C7CAD0]'>
          <div className='flex flex-wrap gap-[15px]'>
            <h3 className='font-semibold text-[#1E1E1E]'>Filter by</h3>
            {['All', 'Land', 'Residential', 'Commercial', 'Duplex'].map(
              (item: string, idx: number) => (
                <RadioCheck
                  key={idx}
                  type='checkbox'
                  name='filterBy'
                  isChecked={usageOptions.some((text: string) => text === item)}
                  value={item}
                  handleChange={() => {
                    const uniqueValues = new Set(usageOptions as Array<string>);
                    if (uniqueValues.has(item)) {
                      uniqueValues.delete(item);
                      setUsageOptions([...uniqueValues]);
                    } else {
                      uniqueValues.add(item);
                      setUsageOptions([...uniqueValues]);
                    }
                  }}
                />
              )
            )}
          </div>
          <div className='flex gap-[30px]'>
            <button
              className='h-[34px] w-[133px] bg-[#8DDB90] text-white shadow-md font-medium text-sm'
              type='button'
              onClick={() => {
                router.push('/post_property');
              }}>
              List property
            </button>
            <button
              className='h-[34px] w-[133px] bg-transparent text-[#FF3D00] border-[1px] border-[#FF3D00] font-medium text-sm'
              type='button'
              onClick={() => {
                setInspectionType('Buy');
                if (addForInspectionPayload.initialAmount === 0) {
                  setAddInspectionModal?.(false);
                  return toast.error('All states can not be different');
                }
                if (selectedBriefs === 0) {
                  return toast.error(
                    'Please, Select at least one for inspection before listing'
                  );
                }
                setAddInspectionModal?.(true);
              }}>
              {selectedBriefs} selected briefs
            </button>
            {selectedBriefs > 0 && (
              <button
                onClick={() => setSelectedBriefs(new Set([]))}
                className='h-[34px] w-[133px] bg-transparent text-black border-[1px] border-zinc-800 font-medium text-sm'
                type='button'>
                reset
              </button>
            )}
          </div>
        </div>
        {/* Fixed form inputs layout */}
        <div className='w-full flex items-center gap-[15px]'>
          {/* Location Input - Fixed width */}
          <div className='w-[280px]'>
            <SelectStateLGA
              placeholder='Enter state, lga, city....'
              formik={formik}
            />
          </div>
          
          {/* Price Range Input - Equal flex */}
          <div className='flex-1 min-w-0'>
            <Input
              className='w-full h-[50px]'
              style={{ marginTop: '-30px' }}
              placeholder='Price Range'
              type='text'
              label=''
              readOnly
              showDropdownIcon={true}
              value={formatPriceDisplay(priceRadioValue, priceFormik)}
              name='price'
              onClick={() => setIsPriceRangeModalOpened(true)}
            />
            {isPriceRangeModalOpened && (
              <PriceRange
                setSlectedRadioValue={setPriceRadioValue}
                formik={priceFormik}
                closeModal={setIsPriceRangeModalOpened}
                heading='Price Range'
              />
            )}
          </div>
          
          {/* Document Type Input - Equal flex */}
          <div className='flex-1 min-w-0'>
            <Input
              className='w-full h-[50px] text-sm'
              style={{ marginTop: '-30px' }}
              placeholder='Document Type'
              type='text'
              label=''
              readOnly
              showDropdownIcon={true}
              name=''
              value={docsValues.toString()}
              onClick={() => setIsDocumentModalOpened(true)}
            />
            {isDocumentModalOpened && (
              <DocumentTypeComponent
                docsSelected={documentsSelected}
                setDocsSelected={setDocumentsSelected}
                closeModal={setIsDocumentModalOpened}
              />
            )}
          </div>
          
          {/* Bedroom Input - Equal flex */}
          <div className='flex-1 min-w-0'>
            <Input
              className='w-full h-[50px] text-sm'
              style={{ marginTop: '-30px' }}
              placeholder='bedroom'
              type='text'
              label=''
              readOnly
              showDropdownIcon={true}
              name=''
              value={noOfBedrooms}
              onClick={() => setIsBedroomModalOpened(true)}
            />
            {isBedroomModalOpened && (
              <BedroomComponent
                noOfBedrooms={noOfBedrooms}
                closeModal={setIsBedroomModalOpened}
                setNumberOfBedrooms={setNoOfBedrooms}
              />
            )}
          </div>
          
          {/* Buttons Container - Fixed width */}
          <div className='flex gap-[15px] shrink-0'>
            <div className='relative'>
              <button
                type='button'
                onClick={() => setIsMoreFilterModalOpened(true)}
                className='w-[120px] h-[50px] border-[1px] border-[#09391C] text-base text-[#09391C] font-medium'>
                More filter
              </button>
              {isMoreFilterModalOpened && (
                <MoreFilter
                  filters={filters}
                  setFilters={setFilters}
                  closeModal={setIsMoreFilterModalOpened}
                />
              )}
            </div>
            <button
              type='button'
              className='w-[140px] h-[50px] bg-[#8DDB90] text-base text-white font-bold'
              onClick={() => {
                onSearch(cleanedPayload);
                setIsSearchButtonClicked(true);
              }}>
              Search
            </button>
          </div>
        </div>
      </form>
      <AnimatePresence>
        {isSearchButtonClicked && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            viewport={{ once: true }}
            className='w-full flex items-center justify-center pt-[20px]'>
            <SubmitPrefrenceModal
              formik={formikToPass}
              header={
                searchStatus.couldNotFindAProperty
                  ? "We couldn't find a property matching your preferences. kindly submit your preferences."
                  : "Can't find the brief you're looking for? Don't worry! We'll provide a reference brief for you"
              }
              footer={
                searchStatus.couldNotFindAProperty
                  ? "We'll source the perfect brief for you and share it soon"
                  : ''
              }
              submitPreference={() => setIsContactInformationModalOpened(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isContactInformationModalOpened && (
          <ContactInformation
            payload={formikToPass}
            type='buyer'
            setIsContactInformationModalOpened={
              setIsContactInformationModalOpened
            }
          />
        )}
      </AnimatePresence>
    </Fragment>
  );
};

export default BuyAPropertySearchModal;