/** @format */
'use client';
import { section1Data } from '@/data';
import React, { FC, useRef } from 'react';
import { useVisibility } from '@/hooks/useVisibility';
/**
 *
 * @returns Join our trusted network of agents and access exclusive property listings, connect with verified buyers and sellers, and grow your real estate business seamlessly
 */

interface Section1Props {
  text: string;
  displayCounts: boolean;
  headingColor: string;
}

const Section1: FC<Section1Props> = ({ text, displayCounts, headingColor }) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const countsRef = useRef<HTMLDivElement>(null);

  const isHeadingVisible = useVisibility(headingRef);
  const isTextVisible = useVisibility(textRef);
  const areCountsVisible = useVisibility(countsRef);

  return (
    <section className='flex items-center justify-center'>
      <div className='container pt-[30px] md:py-[60px] flex flex-col gap-[20px] items-center justify-center px-[20px] overflow-hidden'>
        <div className='lg:w-[870px] w-full min-h-[173px] lg:min-h-[160px] flex flex-col gap-[24px] justify-center items-center '>
          <h2
            ref={headingRef}
            className={`lg:text-[42px] text-[24px] text-center text-[${headingColor}] leading-[28px] lg:leading-[49px] font-bold ${
              isHeadingVisible && 'slide-from-right'
            }`}>
            Discover more with Khabi-Teq
          </h2>
          <span
            ref={textRef}
            className={`font-normal lg:text-[18px] text-base leading-[25px] lg:leading-[28px] text-[#5A5D63] tracking-[5%] text-center ${
              isTextVisible && 'slide-from-left'
            }`}>
            {text}
          </span>
        </div>
        {displayCounts && (
          <div
            ref={countsRef}
            className={`min-h-[49px] lg:h-[72px] w-full md:px-0 lg:w-[518px] flex gap-[24px] items-center justify-between ${
              areCountsVisible && 'slide-from-bottom'
            }`}>
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
          </div>
        )}
      </div>
    </section>
  );
};

export default Section1;
