/** @format */

import { section1Data } from '@/data';
import React, { Fragment } from 'react';

const Counts = () => {
  return (
    <Fragment>
      {section1Data.map(
        (item: { name: string; count: number }, idx: number) => {
          const { name, count } = item;
          return (
            <div
              key={idx}
              className={`flex flex-col gap-[1px] border-r-[2px] px-[10px] md:pr-[30px] ${
                idx === section1Data.length - 1 ? 'border-none' : ''
              }`}>
              <h2 className='text-[#0B423D] font-bold text-[18px] lg:text-[28px] leading-[28px] lg:leading-[44px]'>
                {count} +
              </h2>
              <span className='text-[#5A5D63] text-[12px] leading-[19.2px] lg:text-base lg:leading-[26px] font-normal'>
                {name}
              </span>
            </div>
          );
        }
      )}
    </Fragment>
  );
};

export default Counts;
