/** @format */
'use client';
import { useFormik } from 'formik';
import { Fragment, useEffect, useState } from 'react';
import SelectStateLGA from './select-state-lga';
import Input from '../general-components/Input';
import PriceRange from './price-range';
import DocumentTypeComponent from './document-type';
import BedroomComponent from './bedroom';
import MoreFilter from './more-filter';
import RadioCheck from '../general-components/radioCheck';
import BedsAndBathModal from './beds-and-bath-modal';
import DesiresFeaturesModal from './desires-features-modal';
import TenantFeaturesModal from './tenant-criteria';
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

const RentSearchModal = ({
  selectedBriefs,
  rentFilterBy,
  setRentFilterBy,
  homeCondition,
  setHomeCondition,
  setAddInspectionModal,
  addForInspectionPayload,
  setSelectedBriefs,
  inspectionType,
  setInspectionType,
  onSearch,
  searchStatus,
}: {
  selectedBriefs: number;
  rentFilterBy: string[];
  setRentFilterBy: (type: string[]) => void;
  homeCondition: string;
  setHomeCondition: (type: string) => void;
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
  const [isPriceRangeModalOpened, setIsPriceRangeModalOpened] =
    useState<boolean>(false);
  const [priceRadioValue, setPriceRadioValue] = useState<string>('');
  const [filters, setFilters] = useState<string[]>([]);
  const [isBedAndBathModalOpened, setIsBedAndBathModalOpened] =
    useState<boolean>(false);
  const [bedsAndBath, setBedsAndBath] = useState<{
    bath: undefined | number | string;
    bed: undefined | number | string;
  }>({
    bath: undefined,
    bed: undefined,
  });
  const [isDesiresFeaturesModalOpened, setIsDesiresFeaturesModalOpened] =
    useState<boolean>(false);
  const [desiresFeatures, setDesiresFeatures] = useState<string[]>([]);
  const [isTenantCriteriaModalOpened, setIsTenantCriteriaModalOpened] =
    useState<boolean>(false);
  const [tenatCriteria, setTenantCriteria] = useState<string[]>([]);

  const priceFormik = useFormik({
    initialValues: {
      minPrice: 0,
      maxPrice: 0,
    },
    onSubmit: (values) => {
      // console.log(values);
    },
  });

  //Where we will be making the http requests
  // const handleSubmit = () => {
  const payload = {
    rentFilterBy,
    homeCondition,
    location: {
      state: formik.values.selectedState,
      lga: formik.values.selectedLGA,
    },
    price: {
      minPrice: priceFormik.values.minPrice,
      maxPrice: priceFormik.values.maxPrice,
      actualRadioPrice: priceRadioValue,
    },
    bedroom: bedsAndBath.bed,
    bathroom: bedsAndBath.bath,
    desiresFeatures,
    tenatCriteria,
    briefType: 'Outright Sales',
  };

  function deepClean(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (Array.isArray(obj)) {
      return obj
        .map((item: any) => deepClean(item))
        .filter(
          (v: any) =>
            v !== undefined &&
            v !== '' &&
            v !== null &&
            !(Array.isArray(v) && v.length === 0)
        );
    }
    return Object.fromEntries(
      Object.entries(obj)
        .map(([k, v]: [string, any]): [string, any] => [k, deepClean(v)])
        .filter(([key, value]: [string, any]) => {
          if (
            value === undefined ||
            value === '' ||
            value === null ||
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'object' &&
              value !== null &&
              !Array.isArray(value) &&
              Object.keys(value).length === 0)
          ) {
            return false;
          }
          // Remove minPrice/maxPrice if 0
          if ((key === 'minPrice' || key === 'maxPrice') && value === 0) {
            return false;
          }
          return true;
        })
    );
  }

  const cleanedPayload = deepClean(payload);

  const [isSearchButtonClicked, setIsSearchButtonClicked] =
    useState<boolean>(false);
  const [isContactInformationModalOpened, setIsContactInformationModalOpened] =
    useState<boolean>(false);

  //applying other values of payload to the formik values only, not using cleanedPayload
  //mimicking the formik values to another useFormik hook so it can be passed
  const formikToPass = useFormik({
    initialValues: {
      ...cleanedPayload,
    },
    onSubmit: () => {},
  });

  useEffect(() => {
    formikToPass.setValues({
      ...cleanedPayload,
    });
  }, [priceFormik.values, formik.values, priceRadioValue, tenatCriteria]);

  // useEffect(
  //   () => handleSubmit(),
  //   [priceRadioValue, formik.values, priceFormik.values]
  // );
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
                  isChecked={rentFilterBy.some((text: string) => text === item)}
                  value={item}
                  handleChange={() => {
                    const uniqueValues = new Set(rentFilterBy as Array<string>);
                    if (uniqueValues.has(item)) {
                      uniqueValues.delete(item);
                      setRentFilterBy([...uniqueValues]);
                    } else {
                      uniqueValues.add(item);
                      setRentFilterBy([...uniqueValues]);
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
                setInspectionType('Rent/Lease');
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
        {/**Home Condition */}
        <div className='w-full flex items-center gap-[15px]'>
          <h3 className='text-base font-medium text-[#1E1E1E]'>
            Home Condition:{' '}
          </h3>
          {[
            'All',
            'Brand New',
            'Good Condition',
            'Fairly Used',
            'Need Renovation',
            'New Building',
          ].map((item: string, idx: number) => (
            <RadioCheck
              key={idx}
              value={item}
              name='home_condition'
              type='radio'
              handleChange={() => {
                setHomeCondition(item);
              }}
            />
          ))}
        </div>

        {/**Third section */}
        <div className='flex gap-[20px] items-end'>
          <SelectStateLGA
            placeholder='Enter state, lga, city....'
            formik={formik}
            heading='Location'
          />
          {/**Price Range */}
          <div className='flex flex-col gap-[10px]'>
            <Input
              className='w-[189px]'
              placeholder='Price Range'
              type='text'
              showDropdownIcon={true}
              label=''
              readOnly
              value={
                priceRadioValue !== ''
                  ? priceRadioValue
                  : priceFormik.values.minPrice === 0 &&
                    priceFormik.values.maxPrice === 0
                  ? undefined // Allow placeholder to show
                  : `${Number(
                      priceFormik.values.minPrice
                    ).toLocaleString()} - ${Number(
                      priceFormik.values.maxPrice
                    ).toLocaleString()}`
              }
              name=''
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
          {/**Beds and Bath */}
          <div className='flex flex-col gap-[10px]'>
            <Input
              className='w-[189px] text-sm'
              placeholder='Beds & Baths'
              type='text'
              showDropdownIcon={true}
              label=''
              readOnly
              name=''
              value={`${
                bedsAndBath.bed !== undefined ? bedsAndBath.bed + ' Bed' : ''
              }${
                bedsAndBath.bed !== undefined && bedsAndBath.bath !== undefined
                  ? ' & '
                  : ''
              }${
                bedsAndBath.bath !== undefined ? bedsAndBath.bath + ' Bath' : ''
              }`}
              onClick={() => setIsBedAndBathModalOpened(true)}
            />
            {isBedAndBathModalOpened && (
              <BedsAndBathModal
                bedAndBath={bedsAndBath}
                setBedAndBath={setBedsAndBath}
                closeModal={setIsBedAndBathModalOpened}
              />
            )}
          </div>
          {/**Desires Features Component */}
          <div className='flex flex-col gap-[10px]'>
            <Input
              className='w-[189px] text-sm'
              placeholder='Desires Features'
              type='text'
              showDropdownIcon={true}
              label=''
              readOnly
              name=''
              value={desiresFeatures.join(', ')}
              onClick={() => setIsDesiresFeaturesModalOpened(true)}
            />
            {isDesiresFeaturesModalOpened && (
              <DesiresFeaturesModal
                values={desiresFeatures}
                setValues={setDesiresFeatures}
                closeModal={setIsDesiresFeaturesModalOpened}
              />
            )}
          </div>
          {/**Buttons ~ More Filter and Search */}
          <div className='flex gap-[20px]'>
            <div className='flex flex-col gap-[10px]'>
              <button
                type='button'
                onClick={() => setIsTenantCriteriaModalOpened(true)}
                className='w-[133px] h-[50px] border-[1px] border-[#09391C] text-base text-[#09391C]'>
                More filter
              </button>
              {isTenantCriteriaModalOpened && (
                <TenantFeaturesModal
                  values={tenatCriteria}
                  setValues={setTenantCriteria}
                  closeModal={setIsTenantCriteriaModalOpened}
                />
              )}
            </div>
            <button
              type='button'
              className='w-[153px] h-[50px] bg-[#8DDB90] text-base text-white font-bold'
              onClick={() => {
                onSearch(cleanedPayload);
                setIsSearchButtonClicked(true);
              }}>
              Apply
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
            type='rent'
            setIsContactInformationModalOpened={
              setIsContactInformationModalOpened
            }
          />
        )}
      </AnimatePresence>
    </Fragment>
  );
};

export default RentSearchModal;
