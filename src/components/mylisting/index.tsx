/** @format */

'use client';
import React, { useEffect, useState } from 'react';
import { usePageContext } from '@/context/page-context';
import Card from '../general-components/card';
import sampleImage from '@/assets/noImageAvailable.png';
import Select from 'react-select';
import { useRouter } from 'next/navigation';

const dummyCardData = [
  {
    header: 'Property Type',
    value: 'N/A',
  },
  {
    header: 'Price',
    value: `₦${Number(2180000).toLocaleString()}`,
  },
  {
    header: 'Bedrooms',
    value: 'N/A',
  },
  {
    header: 'Location',
    value: `N/A`,
  },
  {
    header: 'Documents',
    value: `N/A`,
  },
];

const MyListing = ({ briefs = [], loading = false }: { briefs: any[]; loading?: boolean }) => {
  const router = useRouter();
  const { selectedType, setSelectedType } = usePageContext();
  const [propertyType, setPropertyType] = useState<string>('All');
  const [isAddForInspectionModalOpened, setIsAddForInspectionModalOpened] =
    useState<boolean>(false);

  // Dummy list of property types for demonstration
  const propertyTypes = ['All', 'Land', 'Residential', 'Commercial', 'JV'];

  // Dummy list of cards (replace with real data later)
  const dummyList = Array.from({ length: 12 });

  useEffect(() => {
      console.log('Selected Type:', briefs);
  }, [briefs]);

  const mapBriefToCardData = (brief: any) => [
    { header: 'Property Type', value: brief.propertyType || 'N/A' },
    { header: 'Price', value: brief.price ? `₦${Number(brief.price).toLocaleString()}` : 'N/A' },
    { header: 'Bedrooms', value: brief.bedrooms || 'N/A' },
  {
    header: 'Location',
    value: typeof brief.location === 'object' && brief.location !== null
      ? [brief.location.state, brief.location.localGovernment, brief.location.area]
          .filter(Boolean)
          .join(', ')
      : brief.location || 'N/A'
  },
    { header: 'Documents', value: brief.documents || 'N/A' },
  ];

  const renderCard = (brief: any, idx: number) => {
    const cardData = mapBriefToCardData(brief);
    const images = brief.pictures && brief.pictures.length > 0 ? brief.pictures : [sampleImage];

    if (brief.briefType === 'Joint Venture') {
      return (
        <></>
        // <JointVentureModalCard
        //   key={idx}
        //   onClick={() => {}}
        //   isAddInspectionalModalOpened={isAddForInspectionModalOpened}
        //   isDisabled={false}
        //   cardData={cardData}
        //   images={images}
        //   property={brief}
        //   properties={briefs}
        //   setPropertySelected={() => {}}
        //   isComingFromSubmitLol={false}
        //   setIsComingFromSubmitLol={() => {}}
        //   setIsAddInspectionModalOpened={() => {}}
        //   onCardPageClick={() => {
        //   // Use the correct route for your property
        //   router.push(`/property/${brief?.briefType || 'type'}/${brief?._id}`);
        // }}
        // />
      );
    }
    // Default card for Buy/Sell/Rent
    return (
      <Card
        isAddForInspectionModalOpened={isAddForInspectionModalOpened}
        images={images}
        onClick={() => {}}
        onCardPageClick={() => {
          router.push(`/property/${brief?.briefType || 'type'}/${brief?._id}`);
        }}
        cardData={cardData}
        key={idx}
        isDisabled={false}
        property={brief}
      />
    );
  };

  return (
    <section className='flex flex-col justify-center items-center w-full h-auto'>
      <div className='container lg:py-[30px] flex flex-col gap-[20px]'>
        <div className='flex flex-col items-center justify-center gap-[20px] px-[15px] mt-10'>
          <h2 className=' text-[24px] md:text-4xl font-medium text-[#000] text-center'>
            Discover and manage your listings.
          </h2>
          <p className='text-base md:text-xl text-[#5A5D63] text-center'>
            Stay in control of your properties.
          </p>

          <div className='w-full pb-[25px] flex flex-col md:flex-row justify-between items-center gap-y-4 md:gap-y-0 gap-x-0 md:gap-x-[53px] border-b-[1px] border-[#C7CAD0] sticky top-0 z-20'>
            <div className='flex flex-col sm:flex-row gap-3 w-full md:w-auto'>
              <Select
                className='text-[#2E2C34] text-sm ml-1 w-full md:w-auto'
                styles={{
                  control: (styles) => ({
                    ...styles,
                    boxShadow: 'none',
                    cursor: 'pointer',
                    outline: 'none',
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #D6DDEB',
                    minWidth: '120px',
                    height: '45px',
                  }),
                }}
                options={filterOptions}
                defaultValue={filterOptions[0]}
                // value={formik.values.selectedStat}
                // onChange={(options) => formik.setFieldValue('selectedStat', options)}
              />
              <Select
                className='text-[#2E2C34] text-sm ml-1 w-full md:w-auto'
                styles={{
                  control: (styles) => ({
                    ...styles,
                    boxShadow: 'none',
                    cursor: 'pointer',
                    outline: 'none',
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #D6DDEB',
                    minWidth: '120px',
                    height: '45px',
                  }),
                }}
                options={statusOptions}
                defaultValue={statusOptions[0]}
                // value={formik.values.selectedStat}
                // onChange={(options) => formik.setFieldValue('selectedStat', options)}
              />
            </div>
            <button
              className='h-[34px] w-full md:w-[133px] bg-[#8DDB90] text-white shadow-md font-medium text-sm mt-2 md:mt-0'
              type='button'
              onClick={() => {
                                router.push('/post-property');
              }}>
              Post a property
            </button>
          </div>
        </div>
        {/* Listing Cards */}
        <div className='w-full flex justify-center'>
          <div className='w-full overflow-y-auto flex items-start md:mt-[20px] md:gap-[10px] gap-[10px] flex-wrap'>
            {loading ? (
              <div>Loading...</div>
            ) : briefs.length === 0 ? (
              <div>No listings found.</div>
            ) : (
              briefs.map((brief, idx) => renderCard(brief, idx))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyListing;

const filterOptions = [
  { value: '1', label: 'Filter by' },
  { value: '2', label: 'Rent' },
  { value: '3', label: 'JV' },
  { value: '3', label: 'Outright Sale' },
];
const statusOptions = [
  { value: '1', label: 'Status' },
  { value: '2', label: 'Pending' },
  { value: '3', label: 'Active' },
];
