/** @format */

import React from 'react';
import Card from './how-it-works-card';

const HowItWorksSection = () => {
  return (
    <div className='w-full bg-[#0B423D] mt-[40px] md:pb-0 flex justify-center items-center'>
      <div className='border-white flex flex-col gap-[20px] px-[20px] md:px-[10px] my-14'>
        <div className='flex gap-[5px] flex-col justify-center items-center'>
          <h2 className='text-center text-white text-3xl font-bold'>
            How it works
          </h2>
          <p className='font-medium text-base md:text-xl text-white text-center'>
            A simplified listing process and Advanced Search Filters: List and
            find properties tailored to your needs
          </p>
        </div>
        <div className='w-full min-h-[389px] flex flex-wrap gap-[24px] mt-3 hide-scrollbar overflow-y-clip overflow-x-auto whitespace-nowrap justify-center'>
          {HowItWorksDetails.map(
            (
              details: { heading: string; detailsArr: string[] },
              idx: number
            ) => (
              <Card {...details} key={idx} />
            )
          )}
        </div>
      </div>
    </div>
  );
};

const HowItWorksDetails: { heading: string; detailsArr: string[] }[] = [
  {
    heading: 'Buying a property',
    detailsArr: [
      'Quick Registration',
      'Provide personal details',
      'Provide Property details',
      'Submit for approval',
    ],
  },
  {
    heading: 'Selling a property',
    detailsArr: [
      'Search for property',
      'Requests for Inspection',
      'Negotiate price',
      'Acquire Property',
    ],
  },
  {
    heading: 'Renting a property',
    detailsArr: [
      'Search for property',
      'Requests for Inspection',
      'Meet with Landlord',
      'Make Payment',
    ],
  },
  {
    heading: 'Acquiring a Joint Venture',
    detailsArr: [
      'Search for property',
      'Requests for Inspection',
      'Meet with property owner',
      'Seal the deal',
    ],
  },
];

export default HowItWorksSection;
